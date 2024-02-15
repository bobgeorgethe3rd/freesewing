import { frontBase } from './frontBase.mjs'

export const frontPocketFacing = {
  name: 'jackson.frontPocketFacing',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketFacingWidth: { pct: 71.4, min: 50, max: 75, menu: 'pockets.frontPockets' },
    coinPocketBool: { bool: true, menu: 'pockets' },
    coinPocketWidth: { pct: 48.1, min: 40, max: 60, menu: 'pockets.coinPockets' },
    coinPocketHorizontal: { pct: 16.4, min: 10, max: 20, menu: 'pockets.coinPockets' },
    coinPocketVertical: { pct: 22.5, min: 20, max: 25, menu: 'pockets.coinPockets' },
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
      part.hide()
      return part
    }
    //removing paths and snippets not required from Dalton
    const keepThese = ['seam', 'pocketCurve']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //measurements
    //draw guides
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (points.seatOutAnchor.x < points.seatOut.x)
          return new Path()
            .move(points.waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(points.waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
      } else {
        if (points.seatOutAnchor.x < points.seatOut.x)
          return new Path()
            .move(points.waistOut)
            .curve(points.seatOut, points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(points.waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.floorOutCp1, points.floorOut)
      }
    }

    //let's begin
    const outSeamMax = drawOutseam()
      .split(points.frontPocketOpeningOut)[1]
      .split(points.frontPocketOut)[0]
      .length()
    if (outSeamMax < points.frontPocketOpeningWaist.dist(points.frontPocketWaist)) {
      points.frontPocketFacingOut = drawOutseam()
        .split(points.frontPocketOpeningOut)[1]
        .shiftAlong(outSeamMax * options.frontPocketFacingWidth)
      points.frontPocketFacingWaist = points.frontPocketOpeningWaist.shiftTowards(
        points.frontPocketWaist,
        outSeamMax * options.frontPocketFacingWidth
      )
    } else {
      points.frontPocketFacingWaist = points.frontPocketOpeningWaist.shiftFractionTowards(
        points.frontPocketWaist,
        options.frontPocketFacingWidth
      )
      points.frontPocketFacingOut = drawOutseam()
        .split(points.frontPocketOpeningOut)[1]
        .shiftAlong(points.frontPocketOpeningWaist.dist(points.frontPocketFacingWaist))
    }

    points.frontPocketFacingCpTarget = utils.beamsIntersect(
      points.frontPocketFacingWaist,
      points.frontPocketFacingWaist.shift(points.waistIn.angle(points.waistOut) + 90, 1),
      points.frontPocketFacingOut,
      points.frontPocketFacingOut.shift(points.waistOut.angle(points.waistIn), 1)
    )

    points.frontPocketFacingOutCp2 = points.frontPocketFacingOut.shiftFractionTowards(
      points.frontPocketFacingCpTarget,
      options.frontPocketOpeningCurve
    )
    points.frontPocketFacingWaistCp1 = points.frontPocketFacingWaist.shiftFractionTowards(
      points.frontPocketFacingCpTarget,
      options.frontPocketOpeningCurve
    )

    //paths
    paths.bottom = new Path()
      .move(points.frontPocketFacingOut)
      .curve(
        points.frontPocketFacingOutCp2,
        points.frontPocketFacingWaistCp1,
        points.frontPocketFacingWaist
      )
      .hide()

    paths.outSeam = drawOutseam().split(points.frontPocketFacingOut)[0].hide()

    paths.seam = paths.bottom.clone().line(points.waistOut).join(paths.outSeam).close()
    //coin pocket
    if (options.coinPocketBool) {
      points.coinPocketOut = points.waistOut
        .shiftFractionTowards(points.frontPocketWaist, options.coinPocketHorizontal)
        .shift(
          points.waistIn.angle(points.waistOut) + 90,
          paths.outSeam.length() * options.coinPocketVertical
        )
      points.coinPocketIn = points.coinPocketOut.shift(
        points.waistOut.angle(points.waistIn),
        points.waistOut.dist(points.frontPocketFacingWaist) * options.coinPocketWidth
      )
    }
    if (complete) {
      //grainline
      points.grainlineFrom = points.waistOut.shiftFractionTowards(
        points.frontPocketFacingWaist,
        0.05
      )
      points.grainlineTo = utils.beamsIntersect(
        points.grainlineFrom,
        points.waistOut.rotate(90, points.grainlineFrom),
        points.frontPocketFacingOut,
        points.frontPocketFacingOutCp2
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontPocketOpeningWaist', 'frontPocketOpeningOut'],
      })
      //title
      points.title = points.frontPocketFacingOut
        .shiftFractionTowards(points.frontPocketFacingOutCp2, 0.25)
        .shift(
          points.frontPocketFacingCpTarget.angle(points.frontPocketFacingWaist),
          points.frontPocketOpeningWaist.dist(points.frontPocketFacingWaist) * 0.6
        )
      macro('title', {
        nr: 6,
        title: 'Front Pocket Facing',
        at: points.title,
        scale: 0.25,
        rotation: 90 - points.frontPocketFacingCpTarget.angle(points.frontPocketFacingWaist),
      })
      //pocket curve
      paths.pocketCurve = paths.pocketCurve
        .reverse()
        .attr('class', 'mark')
        .attr('data-text', 'Pocket Opening')
        .attr('data-text-class', 'center')
        .unhide()
      //coin pocket
      if (options.coinPocketBool) {
        paths.coinPocket = new Path()
          .move(points.coinPocketOut)
          .line(points.coinPocketIn)
          .attr('class', 'various')
          .attr('data-text', 'Coin Pocket')
          .attr('data-text-class', 'center')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['coinPocketOut', 'coinPocketIn'],
        })
      }
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saFrontPocketFacingWaist = points.frontPocketFacingWaist.shift(
          points.waistOut.angle(points.waistIn) + 90,
          sa
        )

        points.saFrontPocketFacingOut = utils.beamsIntersect(
          paths.outSeam.offset(sideSeamSa).shiftFractionAlong(0.99),
          paths.outSeam.offset(sideSeamSa).end(),
          points.frontPocketFacingOutCp2,
          points.frontPocketFacingOut
        )

        paths.sa = paths.bottom
          .clone()
          .line(points.saFrontPocketFacingWaist)
          .line(points.saWaistOut)
          .join(paths.outSeam.offset(sideSeamSa))
          .line(points.saFrontPocketFacingOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
