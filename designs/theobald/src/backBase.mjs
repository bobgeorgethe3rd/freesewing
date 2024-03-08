import { back as backDalton } from '@freesewing/dalton'
import { pctBasedOn } from '@freesewing/core'

export const backBase = {
  name: 'theobald.backBase',
  from: backDalton,
  hide: {
    from: true,
  },
  options: {
    //Dalton
    //Constants
    useVoidStores: false, //Locked for Theobald
    fitWaist: true, //Locked for Theobald
    legBandWidth: {
      pct: 0,
      min: 0,
      max: 0,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
    }, //locked for Theobald
    calculateLegBandDiff: false, //Locked for Theobald
    // waistbandFishtailAngle: 99.93963012477667,
    //Fit
    waistEase: { pct: 6.4, min: 0, max: 20, menu: 'fit' }, //Altered for Theobald
    hipsEase: { pct: 5.9, min: 0, max: 20, menu: 'fit' }, //Altered for Theobald
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' }, //Altered for Theobald
    kneeEase: { pct: 13.2, min: 0, max: 20, menu: 'fit' }, //Altered for Theobald
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Theobald
    //Style
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' }, //Altered for Theobald
    waistbandWidth: {
      pct: 3.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Theobald
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'style' }, //Altered for Theobald
    waistbandFishtail: { bool: true, menu: 'style' }, //Altered for Theobald
    waistbandFishtailAngle: { deg: 9.9, min: 0, max: 15, menu: 'style' }, //Altered for Theobald
    waistbandFishtailBack: { pct: 25, min: 0, max: 50, menu: 'style' }, //Altered for Theobald
    waistbandFishtailEmbedded: { bool: false, menu: 'style' }, //Altered for Theobald
    waistbandFishtailExtension: { pct: 5.7, min: 4, max: 7, menu: 'style' }, //Altered for Theobald
    // waistbandFishtailOffset: { pct: 1.1, min: 0, max: 2, menu: 'style' }, //Altered for Theobald
    //Darts
    backDartWidth: { pct: 3.2, min: 1, max: 6, menu: 'darts' }, //Altered for Theobald
    backDartDepth: { pct: 95, min: 75, max: 100, menu: 'darts' }, //Altered for Darts
    //Construction
    crossSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Theobald
    hemWidth: { pct: 5, min: 1, max: 5, menu: 'construction' }, //Altered for Theobald
    inseamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Theobald
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Theobald
    //Advanced
    backDartMultiplier: { count: 1, min: 0, max: 2, menu: 'advanced' }, //Altered for Theobald
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
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    const waistbandFishtailExtension =
      measurements.waistToFloor * options.waistbandFishtailExtension
    //let's begin
    if (options.waistbandFishtail) {
      points.waistbandFIn = points.waistIn.shift(
        points.waistIn.angle(points.waistOut) + 90 + options.waistbandFishtailAngle,
        waistbandWidth * (1 + options.waistbandFishtailBack)
      )
      // points.waistbandFOut = points.waistOut
      // .shift(points.waistOut.angle(points.waistIn), measurements.waist * options.waistbandFishtailOffset)
      // .shift(points.waistOut.angle(points.waistIn) - 90, waistbandWidth)

      points.waistbandFOut = utils.beamsIntersect(
        points.waistOut.shift(points.waistIn.angle(points.waistOut) + 90, waistbandWidth),
        points.waistIn.shift(points.waistIn.angle(points.waistOut) + 90, waistbandWidth),
        points.waistOut,
        points.waistOut.shift(
          points.waistIn.angle(points.waistOut) + 90 + options.waistbandFishtailAngle,
          1
        )
      )

      points.waistbandF = points.waistbandFIn
        .shift(points.waistIn.angle(points.waistOut), waistbandFishtailExtension)
        .shift(points.waistIn.angle(points.waistOut) + 90, waistbandFishtailExtension)
      points.waistbandFOutCp2 = utils.beamsIntersect(
        points.waistbandFOut,
        points.waistbandFOut.shift(points.waistOut.angle(points.waistIn), 1),
        points.waistbandF,
        points.waistbandFIn.rotate(90, points.waistbandF)
      )
      points.waistbandFDart = utils.lineIntersectsCurve(
        points.seatDart,
        points.seatDart.shiftOutwards(points.dartMid, waistbandWidth + waistbandFishtailExtension),
        points.waistbandFOut,
        points.waistbandFOutCp2,
        points.waistbandF,
        points.waistbandF
      )

      //paths
      paths.waistbandFCurve = new Path()
        .move(points.waistbandFOut)
        .curve_(points.waistbandFOutCp2, points.waistbandF)
        .hide()

      //guides
      // paths.waistbandF = new Path()
      // .move(points.waistOut)
      // .join(paths.waistbandFCurve)
      // .line(points.waistbandFIn)
      // .line(points.waistIn)
      // .move(points.dartOut)
      // .line(points.waistbandFDart)
      // .line(points.dartIn)

      //stores
      store.set(
        'waistbandFishtailOffset',
        points.waistOut.dist(
          utils.beamsIntersect(
            points.waistbandFOut,
            points.waistbandFOut.shift(points.waistOut.angle(points.waistIn) + 90, 1),
            points.waistOut,
            points.waistIn
          )
        )
      )
      if (complete && sa) {
        points.saWaistbandF = points.waistbandF
          .shift(points.waistbandFOutCp2.angle(points.waistbandF), sa)
          .shift(points.waistbandFIn.angle(points.waistbandF), sa)
      }
    }
    store.set('waistbandMaxButtons', 1)

    return part
  },
}
