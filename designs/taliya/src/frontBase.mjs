import { pctBasedOn } from '@freesewing/core'
import { front as frontDaisy } from '@freesewing/daisy'

export const frontBase = {
  name: 'taliya.frontBase',
  from: frontDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constant
    bustDartPlacement: 'bustSide', //Locked for Taliya
    bustDartLength: 1, //Locked for Taliya
    waistDartLength: 1, //Locked for Taliya
    bustDartFraction: 0.5, //Locked for Taliya
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
    neckbandEnd: { pct: 21.1, min: 0, max: 25, menu: 'style' },
    frontNeckDepth: { pct: 22.5, min: 20, max: 75, menu: 'style' },
    shoulderWidth: { pct: 50, min: 25, max: 75, menu: 'style' },
    //Sleeves
    raglanArmholeDepth: { pct: 50, min: 40, max: 60, menu: 'sleeves' },
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
    points.cfNeckBandEnd = points.cfWaist.shiftFractionTowards(points.cfChest, options.neckbandEnd)
    points.neckbandEnd = points.cfNeckBandEnd.shift(0, neckbandWidth / 2)
    points.neckbandArmhole = new Point(points.neckbandEnd.x, points.cArmhole.y)

    points.shoulderTopMax = points.hps.shiftTowards(points.shoulder, neckbandWidth)
    points.shoulderTop = points.shoulder.shiftFractionTowards(
      points.shoulderTopMax,
      options.shoulderWidth
    )
    points.shoulderTopCp2 = points.shoulderTop.shift(
      points.shoulder.angle(points.armholePitchCp2),
      points.shoulder.dist(points.armholePitchCp2)
    )
    points.neckbandArmholeCp1 = points.neckbandArmhole.shift(
      90,
      points.cArmhole.dist(points.cfNeck) * (1 - options.frontNeckDepth)
    )

    paths.neckBandGuide = new Path()
      .move(points.shoulderTop)
      .curve(points.shoulderTopCp2, points.neckbandArmholeCp1, points.neckbandArmhole)
      .line(points.neckbandEnd)

    paths.neckBandCheck = paths.neckBandGuide
      .clone()
      .offset(neckbandWidth)
      .line(points.cfNeck.shiftFractionTowards(points.cfChest, 0.376))

    //sleeves
    points.raglanSplit = utils.curveIntersectsY(
      points.armhole,
      points.armholeCp2,
      points.armholePitchCp1,
      points.armholePitch,
      points.cArmhole.shiftFractionTowards(points.cArmholePitch, options.raglanArmholeDepth).y
    )
    // points.raglanSplit = paths.armhole.split(points.armholePitch)[0].shiftFractionAlong(options.raglanArmholeDepth)
    points.raglanSplitAnchor = paths.armhole.split(points.raglanSplit)[0].shiftFractionAlong(0.995)

    points.neckbandSplit = utils.lineIntersectsCurve(
      points.raglanSplit,
      points.raglanSplitAnchor.shiftOutwards(points.raglanSplit, measurements.chest * 100),
      points.shoulderTop,
      points.shoulderTopCp2,
      points.neckbandArmholeCp1,
      points.neckbandArmhole
    )

    paths.raglanArm = paths.armhole.split(points.raglanSplit)[0].line(points.neckbandSplit)

    //stores
    store.set('neckbandWidth', neckbandWidth)
    store.set('shoulderWidth', points.shoulder.dist(points.shoulderTop))

    return part
  },
}
