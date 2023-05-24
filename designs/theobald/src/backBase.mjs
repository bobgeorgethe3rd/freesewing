import { back as daltonBack } from '@freesewing/dalton'
import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const backBase = {
  name: 'theobald.backBase',
  from: daltonBack,
  hide: {
    from: true,
  },
  options: {
    //Dalton
    //Constants
    legBandWidth: 0, //locked for Theobald
    waistbandFishtailAngle: 99.93963012477667,
    //Fit
    waistEase: { pct: 15.6, min: 0, max: 20, menu: 'fit' }, //altered for Theobald
    seatEase: { pct: 9.5, min: 0, max: 10, menu: 'fit' }, //altered for Theobald
    kneeEase: { pct: 11.2, min: 0, max: 25, menu: 'fit' }, //altered for Theobald
    heelEase: { pct: 15.1, min: -25, max: 25, menu: 'fit' }, //altered for Theobald
    ankleEase: { pct: 22.3, min: 0, max: 25, menu: 'fit' }, //altered for Theobald
    //Style
    waistbandWidth: {
      pct: 4.2,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, // based on size 40 //altered for Theobald
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' }, //altered for Theobald
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'style' },
    waistbandFishtail: { bool: true, menu: 'style' },
    waistbandFishtailBack: { pct: 25, min: 10, max: 50, menu: 'style' },
    waistbandFishtailExtension: { pct: 5.9, min: 3, max: 8, menu: 'style' },
    //Darts
    backDartWidth: { pct: 3, min: 1, max: 6, menu: 'darts' }, //altered for Theobald
    // backDartDepth: { pct: 66.7, min: 45, max: 70, menu: 'darts' }, //altered for Theobald
    //Advanced
    backDartMultiplier: { count: 1, min: 0, max: 2, menu: 'advanced' }, //altered for Theobald
    waistbandFishtailOffset: { pct: (1 / 3) * 100, min: 0, max: (1 / 3) * 100, menu: 'advanced' },
    //Waistbands
    useVoidStores: false, //locked for Theobald
    //Theobald
    //Style
    backHemDrop: { pct: 0.8, min: 0, max: 1.5, menu: 'style' },
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
    //measurements
    const backHemDrop = measurements.waistToFloor * options.backHemDrop
    const waistbandWidth = absoluteOptions.waistbandWidth
    //fishtail
    if (options.waistbandFishtail) {
      const waistbandFishtailBack = waistbandWidth * (1 + options.waistbandFishtailBack)
      const waistAngle = points.styleWaistIn.angle(points.styleWaistOut)
      const waistbandFishtailExtension =
        measurements.waistToFloor * options.waistbandFishtailExtension
      let waistbandFishtailMultiplier
      if (options.backDartMultiplier == 0) {
        waistbandFishtailMultiplier = 2
      } else {
        waistbandFishtailMultiplier = 1
      }
      points.waistbandFIn = points.styleWaistIn
        .shiftTowards(points.styleWaistOut, waistbandFishtailBack)
        .rotate(options.waistbandFishtailAngle, points.styleWaistIn)
      points.waistbandFTop = points.waistbandFIn
        .shift(waistAngle, waistbandFishtailExtension)
        .shift(waistAngle + 90, waistbandFishtailExtension)
      points.waistbandFOutAnchor = points.styleWaistOut
        .shiftTowards(points.styleWaistIn, waistbandWidth)
        .rotate(-90, points.styleWaistOut)
      points.waistbandFOut = points.waistbandFOutAnchor.shiftTowards(
        points.waistTopOut,
        (points.dartIn.dist(points.dartOut) /
          (1 + options.backDartMultiplier * options.waistHeight)) *
          options.waistbandFishtailOffset
      )
      points.waistbandFCp = utils.beamsIntersect(
        points.waistbandFTop,
        points.waistbandFIn.rotate(90, points.waistbandFTop),
        points.waistTopIn,
        points.waistTopOut
      )
      points.waistbandFSplit = utils.lineIntersectsCurve(
        points.dartMid,
        points.dartMid.shiftOutwards(points.waistTopMid, measurements.waistToFloor),
        points.waistbandFOut,
        points.waistbandFCp,
        points.waistbandFTop,
        points.waistbandFTop
      )
      //guides
      // paths.waistbandFBackIn = new Path()
      // .move(points.waistbandFOut)
      // .curve_(points.waistbandFCp, points.waistbandFTop)
      // .line(points.waistbandFIn)
      // .line(points.styleWaistIn)
      // .line(points.dartIn)
      // .line(points.waistbandFSplit)

      // paths.waistbandFBackOut = new Path()
      // .move(points.waistbandFSplit)
      // .line(points.dartOut)
      // .line(points.styleWaistOut)
      // .line(points.waistbandFOut)

      //stores
      store.set('waistbandFishtailOffset', points.waistbandFOutAnchor.dist(points.waistbandFOut))
    }

    //hem
    points.floor = points.floor.shift(-90, backHemDrop)
    points.floorCp1 = points.floor.shift(180, points.floorOut.dist(points.floorIn) / 4)
    points.floorCp2 = points.floor.shift(0, points.floorIn.dist(points.floorOut) / 4)
    //guide
    // paths.floorHem = new Path()
    // .move(points.floorIn)
    // ._curve(points.floorCp1, points.floor)
    // .curve_(points.floorCp2, points.floorOut)

    //stores
    store.set(
      'waistbandBack',
      (points.styleWaistIn.dist(points.dartIn) + points.styleWaistOut.dist(points.dartOut)) * 2
    )
    store.set('waistBackTop', points.waistTopIn.dist(points.waistTopOut) * 2)
    store.set('waistbandWidth', absoluteOptions.waistbandWidth)
    return part
  },
}
