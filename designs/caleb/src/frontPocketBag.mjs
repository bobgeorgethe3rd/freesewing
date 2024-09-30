import { pluginMirror } from '@freesewing/plugin-mirror'
import { frontBase } from './frontBase.mjs'

export const frontPocketBag = {
  name: 'caleb.frontPocketBag',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketDepth: { pct: 9.1, min: 0, max: 20, menu: 'pockets.frontPockets' },
    frontPocketWidth: { pct: 69.5, min: 30, max: 80, menu: 'pockets.frontPockets' },
    frontPocketBottomPlateau: { pct: 15, min: 0, max: 50, menu: 'pockets.frontPockets' },
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
    //remove paths
    const keepPaths = ['daltonGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //measures
    const pocketMaxDepth = store.get('pocketMaxDepth')
    //draw paths
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
    //let's begin
    points.frontPocketWaist = points.frontPocketOpeningWaist.shiftFractionTowards(
      points.waistIn,
      options.frontPocketWidth
    )
    points.frontPocketBottomAnchor = utils.beamsIntersect(
      points.frontPocketOut,
      points.frontPocketOut.shift(points.waistOut.angle(points.waistIn), 1),
      points.frontPocketWaist,
      points.waistOut.rotate(90, points.frontPocketWaist)
    )
    points.frontPocketBottomMid = points.frontPocketWaist.shiftOutwards(
      points.frontPocketBottomAnchor,
      pocketMaxDepth * options.frontPocketDepth
    )
    points.frontPocketBottomCurveEnd = points.frontPocketBottomMid.shift(
      points.waistIn.angle(points.waistOut),
      points.frontPocketBottomAnchor.dist(points.frontPocketOut) * options.frontPocketBottomPlateau
    )

    points.frontPocketOutCp2 = points.frontPocketOut.shiftFractionTowards(
      points.frontPocketBottomAnchor,
      0.15
    )

    points.frontPocketBottomCurveEndCp1 = points.frontPocketBottomMid.shift(
      points.waistIn.angle(points.waistOut),
      points.frontPocketBottomAnchor.dist(points.frontPocketOutCp2)
    )
    //paths
    paths.outSeam0 = drawOutseam().split(points.frontPocketOut)[0].hide()
    paths.bottomCurve = new Path()
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
      points: [
        'frontPocketOpeningTopOut',
        'frontPocketOpeningBottomOut',
        'frontPocketOpeningOut',
        'frontPocketOut',
      ],
      paths: ['outSeam0', 'bottomCurve'],
      prefix: 'm',
    })

    points.mOutSeam0End = paths.mOutSeam0.reverse().end()

    const drawWaist = () =>
      options.frontPocketOpeningStyle == 'slanted' && options.frontPocketsBool
        ? new Path()
            .move(points.mOutSeam0End)
            .line(points.frontPocketOpeningWaist)
            .line(points.frontPocketOpeningCorner)
            .line(points.frontPocketOpeningOut)
        : new Path().move(points.mOutSeam0End).line(points.waistOut)

    if (options.frontPocketOpeningStyle == 'slanted' && options.frontPocketsBool) {
      paths.outSeam = paths.outSeam0.split(points.frontPocketOpeningOut)[1].hide()
    } else {
      paths.outSeam = paths.outSeam0.clone().hide()
    }

    paths.seam = paths.bottomCurve
      .clone()
      .join(paths.mBottomCurve.reverse())
      .join(paths.mOutSeam0.reverse())
      .join(drawWaist())
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
      if (options.frontPocketOpeningStyle == 'slanted') {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['frontPocketOpeningCorner', 'mFrontPocketOpeningOut'],
        })
      } else {
        macro('sprinkle', {
          snippet: 'notch',
          on: [
            'frontPocketOpeningTopOut',
            'frontPocketOpeningBottomOut',
            'mFrontPocketOpeningTopOut',
            'mFrontPocketOpeningBottomOut',
          ],
        })
      }
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontPocketOut', 'mFrontPocketOut'],
      })
      //title
      points.title = points.frontPocketBottomMid
        .shiftFractionTowards(points.frontPocketWaist, 0.5)
        .shift(
          points.waistOut.angle(points.waistIn),
          points.frontPocketOpeningWaist.dist(points.frontPocketWaist) * 0.5
        )
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'Front Pocket Bag',
        cutNr: 2,
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

        const drawSaWaist = () =>
          options.frontPocketOpeningStyle == 'slanted' && options.frontPocketsBool
            ? new Path()
                .move(points.mSaWaistOut)
                .line(points.saFrontPocketOpeningWaist)
                .line(points.saFrontPocketOpeningCorner)
                .line(points.saFrontPocketOpeningOut)
            : new Path().move(points.mSaWaistOut).line(points.saWaistOut)

        paths.sa = paths.saBottom
          .join(paths.mSaBottom.reverse())
          .join(paths.mOutSeam0.reverse().offset(sideSeamSa))
          .line(points.mSaWaistOut)
          .join(drawSaWaist())
          .join(paths.outSeam.offset(sideSeamSa))
          .line(points.saFrontPocketOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
