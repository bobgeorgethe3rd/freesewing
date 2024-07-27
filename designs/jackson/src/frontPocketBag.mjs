import { pluginMirror } from '@freesewing/plugin-mirror'
import { frontBase } from './frontBase.mjs'

export const frontPocketBag = {
  name: 'jackson.frontPocketBag',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketBottomPlateau: { pct: 15, min: 0, max: 50, menu: 'pockets.frontPockets' },
    frontPocketDepth: { pct: 15, min: 0, max: 50, menu: 'pockets.frontPockets' }, //11.5
    //Construction
    frontPocketBagSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  plugins: [pluginMirror],
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
    const frontPocketDepth =
      (measurements.waistToKnee - measurements.waistToHips - absoluteOptions.waistbandWidth) *
      options.frontPocketDepth
    //let's begin
    points.frontPocketBottomAnchor = utils.beamsIntersect(
      points.frontPocketWaist,
      points.frontPocketWaist.shift(points.waistIn.angle(points.waistOut) + 90, 1),
      points.frontPocketOut,
      points.frontPocketOut.shift(points.waistOut.angle(points.waistIn), 1)
    )

    points.frontPocketBottomMid = points.frontPocketWaist.shiftOutwards(
      points.frontPocketBottomAnchor,
      frontPocketDepth
    )
    points.frontPocketOutCp2 = points.frontPocketOut.shiftFractionTowards(
      points.frontPocketBottomAnchor,
      0.15
    )
    points.frontPocketBottomCurveEnd = points.frontPocketBottomMid.shift(
      points.waistIn.angle(points.waistOut),
      points.frontPocketBottomAnchor.dist(points.frontPocketOut) * options.frontPocketBottomPlateau
    )
    points.frontPocketBottomCurveEndCp1 = points.frontPocketBottomMid.shift(
      points.waistIn.angle(points.waistOut),
      points.frontPocketBottomAnchor.dist(points.frontPocketOut)
    )
    //draw guides
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
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
    }
    //paths
    paths.outSeamM = drawOutseam().split(points.frontPocketOut)[0].hide()

    paths.outSeam = paths.outSeamM.split(points.frontPocketOpeningOut)[1].hide()

    paths.bottom = new Path()
      .move(points.frontPocketOut)
      .curve(
        points.frontPocketOutCp2,
        points.frontPocketBottomCurveEndCp1,
        points.frontPocketBottomCurveEnd
      )
      .line(points.frontPocketBottomMid)
      .hide()

    macro('mirror', {
      mirror: [points.frontPocketWaist, points.frontPocketBottomAnchor],
      paths: ['bottom', 'outSeamM'],
      points: ['frontPocketOpeningWaist', 'frontPocketOpeningOut', 'frontPocketOut'],
      prefix: 'm',
    })

    paths.seam = paths.bottom
      .clone()
      .join(paths.mBottom.reverse())
      .join(paths.mOutSeamM.reverse())
      .line(points.frontPocketOpeningWaist)
      .join(paths.pocketCurve)
      .join(paths.outSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.frontPocketOpeningWaist.shiftFractionTowards(
        points.frontPocketWaist,
        0.5
      )
      points.grainlineTo = points.frontPocketBottomMid.shift(
        points.waistIn.angle(points.waistOut),
        points.frontPocketWaist.dist(points.grainlineFrom)
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: [
          'frontPocketOpeningWaist',
          'frontPocketOpeningOut',
          'frontPocketOut',
          'mFrontPocketOut',
          'mFrontPocketOpeningOut',
          'mFrontPocketOpeningWaist',
        ],
      })
      //title
      points.title = points.frontPocketBottomMid
        .shiftFractionTowards(points.frontPocketWaist, 0.5)
        .shift(
          points.waistOut.angle(points.waistIn),
          points.frontPocketOpeningWaist.dist(points.frontPocketWaist)
        )
      macro('title', {
        at: points.title,
        nr: 7,
        title: 'Front Pocket Bag',
        scale: 0.5,
        rotation: 90 - points.frontPocketBottomMid.angle(points.frontPocketWaist),
      })
      //fold-line
      paths.foldline = new Path()
        .move(points.frontPocketWaist)
        .line(points.frontPocketBottomMid)
        .attr('class', 'mark')
        .attr('data-text', 'Fold - Line')
        .attr('data-text-class', 'center')
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const frontPocketBagSa = sa * options.frontPocketBagSaWidth * 100

        points.saFrontPocketOut = paths.outSeam.offset(sideSeamSa).end()

        points.saFrontPocketOut = points.frontPocketOut
          .shift(points.waistIn.angle(points.waistOut), frontPocketBagSa)
          .shift(points.waistIn.angle(points.waistOut) + 90, frontPocketBagSa)

        points.saFrontPocketOutCp2 = points.frontPocketOutCp2
          .shift(points.waistIn.angle(points.waistOut), frontPocketBagSa)
          .shift(points.waistIn.angle(points.waistOut) + 90, frontPocketBagSa)

        points.saFrontPocketBottomCurveEndCp1 = points.frontPocketBottomCurveEndCp1
          .shift(points.waistIn.angle(points.waistOut), frontPocketBagSa)
          .shift(points.waistIn.angle(points.waistOut) + 90, frontPocketBagSa)

        points.saFrontPocketBottomCurveEnd = points.frontPocketBottomCurveEnd.shift(
          points.waistIn.angle(points.waistOut) + 90,
          frontPocketBagSa
        )

        points.saFrontPocketBottomMid = points.frontPocketBottomMid.shift(
          points.waistIn.angle(points.waistOut) + 90,
          frontPocketBagSa
        )

        paths.saBottom = new Path()
          .move(points.saFrontPocketOut)
          .curve(
            points.saFrontPocketOutCp2,
            points.saFrontPocketBottomCurveEndCp1,
            points.saFrontPocketBottomCurveEnd
          )
          .hide()

        macro('mirror', {
          mirror: [points.frontPocketWaist, points.frontPocketBottomAnchor],
          points: ['saWaistOut'],
          paths: ['saBottom'],
          prefix: 'm',
        })

        paths.sa = paths.saBottom
          .join(paths.mSaBottom.reverse())
          .join(paths.mOutSeamM.reverse().offset(sideSeamSa))
          .line(points.mSaWaistOut)
          .line(points.saFrontPocketOpeningWaist)
          .join(paths.pocketCurve.offset(sa))
          .line(points.saFrontPocketOpeningOut)
          .join(paths.outSeam.offset(sideSeamSa))
          .line(points.saFrontPocketOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
