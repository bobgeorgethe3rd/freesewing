import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'
import { back as byronBack } from '@freesewing/byron'

export const backBase = {
  name: 'denny.backBase',
  from: byronBack,
  after: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Sleeves
    sleeveBackDrop: { pct: 12.1, min: 10, max: 15, menu: 'sleeves' },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Denny
    backPanelSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
    utils,
  }) => {
    //removing paths and snippets not required from Dalton
    const keepPaths = ['seam', 'armhole', 'cbNeck']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.byronGuides) {
      paths.byronGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    macro('cutonfold', false)
    macro('scalebox', false)
    //measurements
    const hemDiff = store.get('hemDiff')
    //let's begin
    points.frontArmholePitch = points.shoulder.shift(
      points.shoulder.angle(points.hps) + 90 - store.get('frontArmholePitchAngle'),
      store.get('frontArmholePitchDist')
    )
    points.frontArmholePitchCp1 = points.shoulder.shift(
      points.shoulder.angle(points.hps) - 90,
      store.get('frontArmholePitchCp2Dist')
    )

    points.cfNeckCorner = points.cbNeckCp1.shiftOutwards(points.hps, store.get('neck') / 4)
    points.cfNeck = points.cfNeckCorner.shift(
      points.hps.angle(points.cfNeckCorner) + 90,
      store.get('neck') / 5
    )
    points.hpsCp1 = points.hps.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)
    points.cfNeckCp2 = points.cfNeck.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)

    paths.cfNeck = new Path()
      .move(points.cfNeck)
      .curve(points.cfNeckCp2, points.hpsCp1, points.hps)
      .hide()

    points.neckSplit = paths.cfNeck.reverse().shiftAlong(store.get('shoulderNeckDist'))

    points.armholeSplit = new Path()
      .move(points.shoulder)
      ._curve(points.frontArmholePitchCp1, points.frontArmholePitch)
      .shiftAlong(store.get('shoulderArmholeDist'))

    points.cbYoke = new Point(points.cbNeck.x, points.armholePitch.y)

    points.cbHem = points.cWaist.shift(-90, store.get('bodyLength'))

    points.yokeAnchor = points.cbYoke.shiftFractionTowards(points.armholePitch, 2 / 3)

    points.centreHemRight = new Point(points.yokeAnchor.x, points.cbHem.y).shift(180, hemDiff / 8)
    points.hemLeft = points.yokeAnchor.shift(-90, points.yokeAnchor.dist(points.centreHemRight))

    points.sideHemAnchor = new Point(points.armhole.x, points.cbHem.y)
    points.sideHem = points.sideHemAnchor.shift(180, hemDiff / 8)
    points.sideHemCp2 = new Point(points.sideHem.x, (points.armhole.y + points.sideHem.y) * 0.5)

    points.hemLeftCp2 = utils.beamIntersectsY(
      points.hemLeft,
      points.cbHem.rotate(
        points.yokeAnchor.angle(points.hemLeft) - points.yokeAnchor.angle(points.centreHemRight),
        points.yokeAnchor
      ),
      points.sideHem.y
    )
    //guides
    paths.yoke = new Path()
      .move(points.cbYoke)
      .line(points.armholePitch)
      .join(
        paths.armhole
          .split(points.armholePitch)[1]
          ._curve(points.frontArmholePitchCp1, points.frontArmholePitch)
          .split(points.armholeSplit)[0]
      )
      .line(points.neckSplit)
      .join(paths.cfNeck.split(points.neckSplit)[1].join(paths.cbNeck))
      .line(points.cbYoke)

    paths.centreBack = new Path()
      .move(points.cbYoke)
      .line(points.cbHem)
      .line(points.centreHemRight)
      .line(points.yokeAnchor)

    paths.sideBack = new Path()
      .move(points.yokeAnchor)
      .line(points.hemLeft)
      .curve_(points.hemLeftCp2, points.sideHem)
      .curve_(points.sideHemCp2, points.armhole)

    //stores
    store.set(
      'sleeveBackDrop',
      paths.armhole.split(points.armholePitch)[0].length() * options.sleeveBackDrop
    )

    return part
  },
}
