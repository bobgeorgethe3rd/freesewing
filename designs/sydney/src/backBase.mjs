import { back as arthurBack } from '@freesewing/arthur'

export const backBase = {
  name: 'sydney.backBase',
  from: arthurBack,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    closurePosition: 'none', //Locked for Sydney
    //Fit
    chestEase: { pct: 10.2, min: 0, max: 20, menu: 'fit' }, //Altered for Sydney
    waistEase: { pct: 25, min: 0, max: 35, menu: 'fit' }, //Altered for Sydney
    //Sleeves
    fitSleeveWidth: { bool: false, menu: 'sleeves' }, //Altered for Sydney
    sleeveLength: { pct: 25, min: 0, max: 100, menu: 'sleeves' }, //Altered for Sydney
    //Advanced
    fitWaist: { bool: false, menu: 'advanced' }, //Altered for Sydney
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
    log,
  }) => {
    //remove paths & snippets
    store.set('neckbandBack', paths.cbNeck.length() * 2 * (1 + options.neckbandLengthBonus))
    store.set('neckbandBackTop', paths.cbNeck.length())
    const keepThese = ['sideSeam', 'byronGuide', 'armLine', 'anchorLines']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    macro('cutonfold', false)
    //let's begin
    points.shoulderSplit = utils.beamIntersectsX(
      points.hps,
      points.sleeveTop,
      points.underArmCurveAnchor.x
    )

    return part
  },
}
