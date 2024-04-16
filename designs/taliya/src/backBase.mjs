import { pctBasedOn } from '@freesewing/core'
import { back as backDaisy } from '@freesewing/daisy'

export const backBase = {
  name: 'taliya.backBase',
  from: backDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    closurePosition: 'none', //Locked for Taliya
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    //Style
    neckbandWidth: {
      pct: 3.6,
      min: 3,
      max: 5,
      snap: 3.175,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
    shoulderWidth: { pct: 50, min: 25, max: 75, menu: 'style' },
    // backNeckDepth: {pct: 100, min: 50, max: 100, menu: 'style'},
    //Sleeves
    raglanNeckWidth: { pct: (1 / 3) * 100, min: 20, max: 50, menu: 'sleeves' },
    sleeveStyle: { dflt: 'raglan', list: ['raglan', 'inset', 'none'], menu: 'sleeves' },
    //Construction
    armholeSaWidth: { pct: 1, min: 0, max: 3, menu: 'construction' },
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
    //removing paths and snippets not required from Bella
    const keepThese = ['armhole', 'seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daisyGuides) {
      paths.daisyGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //measures
    const neckbandWidth = absoluteOptions.neckbandWidth
    if (options.sleeveStyle != 'none' && options.armholeSaWidth < 0.01) {
      options.armholeSaWidth = 0.01
    }
    //let's begin
    points.shoulderTopMax = points.hps.shiftTowards(points.shoulder, neckbandWidth)
    points.shoulderTop = points.shoulder.shiftFractionTowards(
      points.shoulderTopMax,
      options.shoulderWidth
    )
    points.cbNeckMin = points.cbNeck.shift(-90, neckbandWidth)
    points.cbNeck = utils.beamIntersectsX(
      points.shoulderTop,
      points.shoulderTop.shift(points.hps.angle(points.cbNeck), 1),
      points.cbNeck.x
    )
    if (points.cbNeck.y < points.cbNeckMin.y) {
      points.cbNeck = points.cbNeckMin
    }
    points.cbNeckCp1 = utils.beamIntersectsY(
      points.shoulderTop,
      points.hps.rotate(90, points.shoulderTop),
      points.cbNeck.y
    )
    points.shoulderTopCp2 = points.shoulderTop.shiftFractionTowards(
      points.cbNeckCp1,
      options.cfNeck
    )
    //sleeves
    paths.cbNeck = new Path()
      .move(points.shoulderTop)
      .curve(points.shoulderTopCp2, points.cbNeckCp1, points.cbNeck)
      .hide()

    points.raglanNeckSplit = paths.cbNeck.shiftFractionAlong(options.raglanNeckWidth)
    points.armholeRaglanCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      2 / 3
    )

    points.raglanCurveEnd = utils.beamIntersectsX(
      points.raglanNeckSplit,
      points.armholeRaglanCp2,
      points.armholePitch.x
    )
    //guides
    paths.raglan = new Path()
      .move(points.armhole)
      .curve_(points.armholeRaglanCp2, points.raglanCurveEnd)
      .line(points.raglanNeckSplit)

    //stores
    store.set('neckbandWidth', neckbandWidth)
    store.set('raglanNeckWidth', paths.cbNeck.length() * options.raglanNeckWidth)
    store.set('shoulderWidth', points.shoulder.dist(points.shoulderTop))

    return part
  },
}
