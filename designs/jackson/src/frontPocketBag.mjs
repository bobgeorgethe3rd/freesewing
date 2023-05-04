import { frontBase } from './frontBase.mjs'

export const frontPocketBag = {
  name: 'jackson.frontPocketBag',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketDepth: { pct: 9.9, min: 0, max: 15, menu: 'pockets.frontPockets' },
    //Construction
    frontPocketBagSaWidth: { pct: 2, min: 1, max: 4, menu: 'construction' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    complete,
    paperless,
    macro,
    utils,
    measurements,
    part,
    snippets,
    Snippet,
    absoluteOptions,
  }) => {
    //set render
    if (!options.frontPocketsBool) {
      part.render = false
      return part
    }
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //measurements
    const frontPocketDepth =
      (measurements.waistToKnee - measurements.waistToHips - absoluteOptions.waistbandWidth) *
      options.frontPocketDepth

    //draw guides
    const drawOutseam = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      if (options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            .line(points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            .line(points.floorOut)
      }
      if (options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
      }
      if (!options.fitKnee & !options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path().move(waistOut).curve(points.seatOut, points.kneeOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.floorOut)
      }
    }

    //lets begin
    points.frontPocketBottomAnchor = utils.beamsIntersect(
      points.frontPocketWaist,
      points.styleWaistOut.rotate(90, points.frontPocketWaist),
      points.frontPocketOutSeam,
      points.frontPocketOutSeam.shift(points.styleWaistOut.angle(points.styleWaistIn), 1)
    )
    points.frontPocketBottom = points.frontPocketWaist.shiftOutwards(
      points.frontPocketBottomAnchor,
      frontPocketDepth
    )
    points.frontPocketCp1 = points.frontPocketOutSeam.shiftFractionTowards(
      points.frontPocketBottomAnchor,
      0.1
    )
    points.frontPocketCp2 = utils.beamsIntersect(
      points.frontPocketCp1,
      points.frontPocketOutSeam.rotate(90, points.frontPocketCp1),
      points.frontPocketBottom,
      points.frontPocketWaist.rotate(90, points.frontPocketBottom)
    )
    //lets create some paths
    paths.outSeam0 = drawOutseam().split(points.frontPocketOutSeam)[0].hide()

    paths.outSeam1 = paths.outSeam0.split(points.frontPocketOpeningOut)[1].hide()

    paths.bottomCurve = new Path()
      .move(points.frontPocketOutSeam)
      .curve(points.frontPocketCp1, points.frontPocketCp2, points.frontPocketBottom)
      .hide()

    macro('mirror', {
      mirror: [points.frontPocketWaist, points.frontPocketBottomAnchor],
      paths: ['bottomCurve', 'outSeam0'],
      points: ['frontPocketOpeningOut'],
      prefix: 'm',
    })

    //paths

    paths.bottomCurve = paths.bottomCurve.join(paths.mBottomCurve.reverse()).hide()

    paths.mFrontPocketOutSeam = paths.mOutSeam0.reverse().hide()

    paths.waistSeam = new Path()
      .move(paths.mFrontPocketOutSeam.end())
      .line(points.frontPocketOpeningWaist)
      .curve(
        points.frontPocketOpeningCp1,
        points.frontPocketOpeningCp2,
        points.frontPocketOpeningOut
      )
      .hide()

    paths.seam = paths.bottomCurve
      .clone()
      .join(paths.mFrontPocketOutSeam)
      .join(paths.waistSeam)
      .join(paths.outSeam1)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.frontPocketWaist
      points.grainlineTo = points.frontPocketBottom
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.mFrontPocketOpeningOut = new Snippet('notch', points.mFrontPocketOpeningOut)
      //title
      points.title = points.frontPocketWaist
        .shiftFractionTowards(points.frontPocketBottom, 0.5)
        .shift(
          points.styleWaistOut.angle(points.styleWaistIn),
          points.frontPocketWaist.dist(points.styleWaistOut) * 0.15
        )
      macro('title', {
        nr: 6,
        title: 'Front Pocket Bag',
        at: points.title,
        scale: 0.75,
        rotation: 270 - points.frontPocketWaist.angle(points.frontPocketBottom),
      })

      if (sa) {
        const outSeamSa = sa * options.outSeamSaWidth * 100
        const frontPocketBagSa = sa * options.frontPocketBagSaWidth * 100
        points.saFrontPocketOutSeam = paths.outSeam1
          .offset(outSeamSa)
          .end()
          .shift(points.frontPocketWaist.angle(points.frontPocketBottom), frontPocketBagSa)
        points.saMFrontPocketOutSeam = paths.mFrontPocketOutSeam
          .offset(outSeamSa)
          .start()
          .shift(points.frontPocketWaist.angle(points.frontPocketBottom), frontPocketBagSa)
        points.saFrontPocketBottom = points.frontPocketBottom.shift(
          points.frontPocketWaist.angle(points.frontPocketBottom),
          frontPocketBagSa
        )
        points.saFrontPocketCp1 = points.saFrontPocketOutSeam.shift(
          points.styleWaistOut.angle(points.styleWaistIn),
          points.frontPocketOutSeam.dist(points.frontPocketCp1)
        )
        points.saFrontPocketCp2 = points.saFrontPocketBottom.shift(
          points.styleWaistIn.angle(points.styleWaistOut),
          points.frontPocketBottom.dist(points.frontPocketCp2) + outSeamSa
        )
        points.saFrontPocketCp3 = points.saFrontPocketCp2.rotate(180, points.saFrontPocketBottom)
        points.saFrontPocketCp4 = points.saMFrontPocketOutSeam.shift(
          points.frontPocketCp1.angle(points.frontPocketOutSeam),
          points.frontPocketCp1.dist(points.frontPocketOutSeam)
        )

        paths.sa = new Path()
          .move(points.saFrontPocketOutSeam)
          .curve(points.saFrontPocketCp1, points.saFrontPocketCp2, points.saFrontPocketBottom)
          .curve(points.saFrontPocketCp3, points.saFrontPocketCp4, points.saMFrontPocketOutSeam)
          .join(paths.mFrontPocketOutSeam.offset(outSeamSa))
          .join(paths.waistSeam.offset(sa))
          .join(paths.outSeam1.offset(outSeamSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
