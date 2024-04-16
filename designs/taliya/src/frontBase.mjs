import { pctBasedOn } from '@freesewing/core'
import { front as frontDaisy } from '@freesewing/daisy'
import { backBase } from './backBase.mjs'

export const frontBase = {
  name: 'taliya.frontBase',
  from: frontDaisy,
  after: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constant
    bustDartPlacement: 'bustSide', //Locked for Taliya
    waistDartLength: 1, //Locked for Taliya
    bustDartFraction: 0.5, //Locked for Taliya
    //Style
    neckbandEnd: { pct: 21.1, min: 0, max: 25, menu: 'style' },
    frontNeckDepth: { pct: 22.5, min: 20, max: 75, menu: 'style' },
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
    //let's begin
    points.cfNeckbandEnd = points.cfWaist.shiftFractionTowards(points.cfChest, options.neckbandEnd)
    points.neckbandEnd = points.cfNeckbandEnd.shift(0, neckbandWidth / 2)
    points.neckbandArmhole = new Point(points.neckbandEnd.x, points.cArmhole.y)

    points.shoulderTop = points.shoulder.shiftTowards(points.hps, store.get('shoulderWidth'))
    points.shoulderTopCp2 = points.shoulderTop.shift(
      points.shoulder.angle(points.armholePitchCp2),
      points.shoulder.dist(points.armholePitchCp2)
    )
    points.neckbandArmholeCp1 = points.neckbandArmhole.shift(
      90,
      points.cArmhole.dist(points.cfNeck) * (1 - options.frontNeckDepth)
    )
    //sleeves
    paths.cfNeck = new Path()
      .move(points.shoulderTop)
      .curve(points.shoulderTopCp2, points.neckbandArmholeCp1, points.neckbandArmhole)
      .hide()

    points.raglanNeckSplit = paths.cfNeck.shiftAlong(store.get('raglanNeckWidth'))
    points.armholeRaglanCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      2 / 3
    )
    points.raglanCurveEnd = utils.beamIntersectsX(
      points.raglanNeckSplit,
      points.armholeRaglanCp2,
      points.armholePitch.x
    )

    points.gatherNeckSplit = paths.cfNeck.split(points.raglanNeckSplit)[1].shiftFractionAlong(3 / 4)
    //guides
    paths.cfNeckCheck = paths.cfNeck
      .clone()
      .offset(neckbandWidth)
      .line(points.cfNeck.shiftFractionTowards(points.cfChest, 0.376))

    paths.raglan = new Path()
      .move(points.armhole)
      .curve_(points.armholeRaglanCp2, points.raglanCurveEnd)
      .line(points.raglanNeckSplit)

    //stores
    store.set('neckbandWidth', neckbandWidth)
    store.set('shoulderWidth', points.shoulder.dist(points.shoulderTop))

    return part
  },
}
