import { flyFunction } from '@freesewing/flyfront'
import { flyBase } from '@freesewing/flyfront'
import { front as frontDalton } from '@freesewing/dalton'
import { back } from './back.mjs'

export const frontBase = {
  name: 'caleb.frontBase',
  from: frontDalton,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...flyBase.options,
    //Style
    fitWaistFront: { bool: true, menu: 'style' }, //Altered For Caleb
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketOpeningDepth: { pct: 34.4, min: 25, max: 50, menu: 'pockets.frontPockets' },
    frontPocketOpeningWidth: { pct: 18.7, min: 15, max: 25, menu: 'pockets.frontPockets' },
    frontPocketOpeningCorner: { pct: 2.4, min: 1, max: 5, menu: 'pockets.frontPockets' },
    //Construction
    crotchSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
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
    //removing paths and snippets not required from Dalton
    const keepPaths = ['seam', 'crotchSeam', 'seatGuide', 'hipsGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    const keepSnippets = [
      'crossSeamCurveStart',
      'seatGuideIn-notch',
      'seatGuideOut-notch',
      'hipsGuideIn-notch',
      'hipsGuideOut-notch',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    const flyFrontWidth = measurements.waist * options.flyFrontWidth
    const flyFrontLength =
      (measurements.crossSeamFront - measurements.waistToHips) * options.flyFrontLength
    const flyFrontShieldEx = 10 //(1 - options.flyFrontWidth) * 10.537407797681770284510010537408
    //let's begin
    //plackets
    flyFunction(part, waistbandWidth, flyFrontWidth, flyFrontLength, flyFrontShieldEx)
    //paths
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
    paths.outseam = drawOutseam().hide()
    //if pockets
    if (options.frontPocketsBool) {
      //measures
      const pocketMaxDepth = measurements.waistToKnee - measurements.waistToHips - waistbandWidth

      points.frontPocketOpeningOut = drawOutseam().shiftAlong(
        pocketMaxDepth * options.frontPocketOpeningDepth
      )
      points.frontPocketOpeningWaist = points.waistOut.shiftFractionTowards(
        points.waistIn,
        options.frontPocketOpeningWidth
      )
      points.frontPocketOpeningCorner = points.frontPocketOpeningOut.shift(
        points.waistOut.angle(points.waistIn),
        points.waistIn.dist(points.waistOut) * options.frontPocketOpeningCorner
      )

      paths.frontPocketOpening = new Path()
        .move(points.frontPocketOpeningWaist)
        .line(points.frontPocketOpeningCorner)
        .line(points.frontPocketOpeningOut)

      if (complete && sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        points.saFrontPocketOpeningWaist = utils.beamsIntersect(
          points.waistIn.shiftTowards(points.waistOut, sa).rotate(-90, points.waistIn),
          points.waistOut.shiftTowards(points.waistIn, sa).rotate(90, points.waistOut),
          points.frontPocketOpeningWaist
            .shiftTowards(points.frontPocketOpeningCorner, sa)
            .rotate(-90, points.frontPocketOpeningWaist),
          points.frontPocketOpeningCorner
            .shiftTowards(points.frontPocketOpeningWaist, sa)
            .rotate(90, points.frontPocketOpeningCorner)
        )
        points.saFrontPocketOpeningCorner = utils.beamsIntersect(
          points.saFrontPocketOpeningWaist,
          points.saFrontPocketOpeningWaist.shift(
            points.frontPocketOpeningWaist.angle(points.frontPocketOpeningCorner),
            1
          ),
          points.frontPocketOpeningCorner
            .shiftTowards(points.frontPocketOpeningOut, sa)
            .rotate(-90, points.frontPocketOpeningCorner),
          points.frontPocketOpeningOut
            .shiftTowards(points.frontPocketOpeningCorner, sa)
            .rotate(90, points.frontPocketOpeningOut)
        )
        points.saFrontPocketOpeningOut = utils.beamsIntersect(
          points.saFrontPocketOpeningCorner,
          points.saFrontPocketOpeningCorner.shift(points.waistOut.angle(points.waistIn), 1),
          paths.outseam
            .split(points.frontPocketOpeningOut)[1]
            .offset(sideSeamSa)
            .shiftFractionAlong(0.005),
          paths.outseam.split(points.frontPocketOpeningOut)[1].offset(sideSeamSa).start()
        )
        paths.saFrontPocketOpening = new Path()
          .move(points.saFrontPocketOpeningWaist)
          .line(points.saFrontPocketOpeningCorner)
          .line(points.saFrontPocketOpeningOut)
      }
    }
    return part
  },
}
