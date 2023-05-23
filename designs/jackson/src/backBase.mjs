import { back as daltonBack } from '@freesewing/dalton'
import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const backBase = {
  name: 'jackson.backBase',
  from: daltonBack,
  hide: {
    from: true,
  },
  options: {
    //Dalton
    //Constants
    useVoidStores: false, //locked for Jackson
    legBandWidth: 0, //locked for Jackson
    //Fit
    waistEase: { pct: 5.7, min: -20, max: 20, menu: 'fit' }, //altered for Jackson 5.7 //11.8
    seatEase: { pct: 4.7, min: -20, max: 10, menu: 'fit' }, //altered for Jackson 4.7 // 7.6
    kneeEase: { pct: 9.5, min: -25, max: 25, menu: 'fit' }, //altered for Jackson 9.5 //9.4
    heelEase: { pct: 11, min: -25, max: 25, menu: 'fit' }, //altered for Jackson
    ankleEase: { pct: 16.2, min: -25, max: 25, menu: 'fit' }, //altered for Jackson
    //Style
    waistbandWidth: {
      pct: 3.8,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, // based on size 40 //altered for Jackson
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' }, //altered for Jackson
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'style' },
    //Darts
    backDartWidth: { pct: 1.2, min: 0, max: 3, menu: 'darts' }, //1.2 //altered for Jackson
    backDartDepth: { pct: 66.7, min: 45, max: 70, menu: 'darts' }, //altered for Jackson
    //Advanced
    backDartMultiplier: { count: 1, min: 0, max: 2, menu: 'advanced' }, //altered for Jackson
    //Jackson
    //Style
    yokeAngle: { deg: 5.1, min: 3.5, max: 5.6, menu: 'style' },
    beltLoopWidth: {
      pct: 1.1,
      min: 1,
      max: 2,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
  },
  plugins: [pluginLogoRG],
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
    log,
    absoluteOptions,
  }) => {
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Dalton
    macro('title', false)
    macro('scalebox', false)
    macro('logorg', false)
    //outseam guide
    const drawOutseam = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      if (options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
      if (options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
      if (!options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path().move(points.floorOut).curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
    }

    //yoke
    points.yokeInTarget = points.dartTip
      .shiftTowards(points.dartMid, measurements.waist * 4)
      .rotate(90 + options.yokeAngle, points.dartTip)
    points.yokeOutTarget = points.dartTip
      .shiftTowards(points.dartMid, measurements.waist * 4)
      .rotate(-90 + options.yokeAngle, points.dartTip)

    if (points.yokeInTarget.y > points.crossSeamCurveStart.y) {
      points.yokeIn = utils.lineIntersectsCurve(
        points.dartTip,
        points.yokeInTarget,
        points.crossSeamCurveStart,
        points.crossSeamCurveCp1,
        points.crossSeamCurveCp2,
        points.fork
      )
      log.info(
        'points.yokeIn intersects with the crossSeamCurve, This may be an indicated of inaccurate measures.'
      )
    } else {
      points.yokeIn = utils.beamsIntersect(
        points.dartTip,
        points.yokeInTarget,
        points.styleWaistIn,
        points.crossSeamCurveStart
      )
    }

    let waistOut = points.styleWaistOut || points.waistOut
    if (points.waistOut.x > points.seatOut.x) {
      if (options.fitKnee || options.fitFloor) {
        points.yokeOut = utils.lineIntersectsCurve(
          points.dartTip,
          points.yokeOutTarget,
          points.kneeOut,
          points.kneeOutCp2,
          points.seatOut,
          waistOut
        )
      } else {
        points.yokeOut = utils.lineIntersectsCurve(
          points.dartTip,
          points.yokeOutTarget,
          points.floorOut,
          points.kneeOutCp2,
          points.seatOut,
          waistOut
        )
      }
    } else {
      points.yokeOut = utils.lineIntersectsCurve(
        points.dartTip,
        points.yokeOutTarget,
        points.seatOut,
        points.seatOutCp2,
        waistOut,
        waistOut
      )
    }
    //yoke guide

    // paths.yokeLine = new Path()
    // .move(points.yokeIn)
    // .line(points.yokeOut)

    //stores
    store.set(
      'waistbandBack',
      (points.styleWaistIn.dist(points.dartIn) + points.styleWaistOut.dist(points.dartOut)) * 2
    )
    store.set('waistBackTop', points.waistTopIn.dist(points.waistTopOut) * 2)
    store.set('waistbandWidth', absoluteOptions.waistbandWidth)
    store.set('beltLoopLength', absoluteOptions.waistbandWidth * 2)
    store.set('beltLoopWidth', absoluteOptions.beltLoopWidth)
    return part
  },
}
