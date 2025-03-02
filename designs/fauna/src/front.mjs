import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'fauna.front',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Fit
    hipsEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' },
    seatEase: { pct: 4.8, min: 0, max: 20, menu: 'fit' },
    //Placket
    inbuiltPlacketFacing: { bool: true, menu: 'plackets' },
    //Construction
    placketFacingSaWidth: { pct: 1.5, min: 0, max: 3, menu: 'construction' },
    hemWidth: { pct: 1.5, min: 0, max: 3, menu: 'construction' },
  },
  measurements: ['hips', 'seat'],
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
    absoluteOptions,
    snippets,
    Snippet,
  }) => {
    //delete inherited paths
    const keepThese = ['cfNeck', 'mCfNeck', 'facingCurve']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measurements
    const hips = measurements.hips * (1 + options.hipsEase)
    const seat = measurements.seat * (1 + options.seatEase)
    const bodyWidth =
      options.bodyLength < 0.5
        ? points.sideWaist.x * (1 - 2 * options.bodyLength) + hips * (2 * options.bodyLength)
        : hips * (2 - 2 * options.bodyLength) + seat * (2 * options.bodyLength - 1)

    //stores
    store.set('bodyWidth', bodyWidth)

    if (complete) {
      //foldline
      // points.placketNeck = utils.curveIntersectsX(
      // points.hps,
      // points.hpsCp2,
      // points.cfNeckCp1,
      // points.cfNeck,
      // points.placketBottomRight.x
      // )
    }

    return part
  },
}
