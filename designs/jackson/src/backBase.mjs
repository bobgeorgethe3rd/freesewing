import { back as backDalton } from '@freesewing/dalton'
import { pctBasedOn } from '@freesewing/core'

export const backBase = {
  name: 'jackson.backBase',
  from: backDalton,
  hide: {
    from: true,
  },
  options: {
    //Dalton
    //Constants
    useVoidStores: false, //Locked for Jackson
    fitWaist: false, //Locked for Jackson
    legBandWidth: {
      pct: 0,
      min: 0,
      max: 0,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
    }, //locked for Jackson
    legBandsBool: false, //Locked for Jackson
    calculateLegBandDiff: false, //Locked for Jackson
    //Fit
    waistEase: { pct: 6.4, min: 0, max: 20, menu: 'fit' }, //Altered for Jackson
    hipsEase: { pct: 5.9, min: 0, max: 20, menu: 'fit' }, //Altered for Jackson
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' }, //Altered for Jackson
    kneeEase: { pct: 13.2, min: 0, max: 20, menu: 'fit' }, //Altered for Jackson
    calfEase: { pct: 13.6, min: 0, max: 20, menu: 'fit' }, //Altered for Jackson
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Jackson
    //Style
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' }, //Altered for Jackson
    waistbandWidth: {
      pct: 3.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Jackson
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'style' }, //Altered for Jackson
    fitWaistBack: { bool: true, menu: 'style' }, //Altered For Jackson
    yokeAngle: { deg: 6.2, min: 3.5, max: 7, menu: 'style' },
    //Darts
    backDartWidth: { pct: 1.3, min: 1, max: 2, menu: 'darts' }, //Altered for Jackson
    backDartDepth: { pct: 78.3, min: 60, max: 100, menu: 'darts' }, //Altered for Jackson
    //Construction
    crossSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Jackson
    inseamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Jackson
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Jackson
    //Advanced
    backDartMultiplier: { count: 1, min: 0, max: 2, menu: 'advanced' }, //Altered for Jackson
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
    log,
    absoluteOptions,
  }) => {
    //let's begin
    points.yokeIn = utils.beamsIntersect(
      points.dartTip,
      points.dartMid.rotate(90 + options.yokeAngle, points.dartTip),
      points.waistIn,
      points.crossSeamCurveStart
    )
    if (points.yokeIn.y > points.crossSeamCurveStart.y) {
      points.yokeIn = utils.lineIntersectsCurve(
        points.dartTip,
        points.dartTip.shiftFractionTowards(points.yokeIn, 2),
        points.crossSeamCurveStart,
        points.crossSeamCurveStartCp2,
        points.upperLegInCp1,
        points.upperLeg
      )
      log.info(
        'points.yokeIn intersects with the crossSeamCurve, This may be an indicated of inaccurate measures.'
      )
    }

    if (points.seatOutAnchor.x < points.seatOut.x) {
      points.yokeOut = utils.lineIntersectsCurve(
        points.yokeIn,
        points.yokeIn.shiftFractionTowards(points.yokeIn.rotate(180, points.dartTip), 2),
        points.seatOut,
        points.seatOutCp2,
        points.waistOut,
        points.waistOut
      )
    } else {
      if (options.fitKnee) {
        points.yokeOut = utils.lineIntersectsCurve(
          points.yokeIn,
          points.yokeIn.shiftFractionTowards(points.yokeIn.rotate(180, points.dartTip), 2),
          points.kneeOut,
          points.kneeOutCp2,
          points.seatOut,
          points.waistOut
        )
      } else {
        points.yokeOut = utils.lineIntersectsCurve(
          points.yokeIn,
          points.yokeIn.shiftFractionTowards(points.yokeIn.rotate(180, points.dartTip), 2),
          points.floorOut,
          points.floorOutCp2,
          points.seatOut,
          points.waistOut
        )
      }
    }

    return part
  },
}
