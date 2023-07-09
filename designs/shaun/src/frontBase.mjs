import { pctBasedOn } from '@freesewing/core'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { front as byronFront } from '@freesewing/byron'

export const frontBase = {
  name: 'shaun.frontBase',
  from: byronFront,
  after: [backBase, back],
  hide: {
    from: true,
  },
  options: {
    //Plackets
    buttonholePlacketWidth: {
      pct: 3.7,
      min: 3,
      max: 5,
      snap: 2.5,
      ...pctBasedOn('chest'),
      menu: 'plackets',
    },
    buttonStart: { pct: 12.3, min: 5, max: 15, menu: 'plackets' },
    buttonEnd: { pct: 12.7, min: 5, max: 15, menu: 'plackets' },
    buttonNumber: { count: 6, min: 5, max: 10, menu: 'plackets' },
    //Pockets
    patchPocketWidth: { pct: 27, min: 20, max: 30, menu: 'pockets' },
    patchPocketDepth: { pct: 23.9, min: 20, max: 30, menu: 'pockets' },
    //Advanced
    skirtFrontWidth: { pct: 36.4, min: 0, max: 50, menu: 'advanced.style' },
    skirtFrontCurve: { pct: 50, min: 0, max: 50, menu: 'advanced.style' },
    independentSkirtFront: { bool: false, menu: 'advanced.style' },
    independentPlacketWidths: { bool: false, menu: 'advanced.plackets' },
    buttonPlacketWidth: {
      pct: 3.7,
      min: 3,
      max: 5,
      snap: 2.5,
      ...pctBasedOn('chest'),
      menu: 'advanced.plackets',
    },
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
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //settings
    if (!options.independentSkirtFront) {
      options.skirtFrontCurve = options.skirtCurve
    }
    if (!options.independentPlacketWidths) {
      absoluteOptions.buttonPlacketWidth = absoluteOptions.buttonholePlacketWidth
    }
    //measurements
    const shirtLength = store.get('shirtLength')
    const hemDiff = store.get('hemDiff')
    let skirtWidth = measurements.waistToSeat * options.skirtWidth
    if (options.independentSkirtFront) {
      skirtWidth = measurements.waistToSeat * options.skirtFrontWidth
    }
    const buttonholePlacketWidth = absoluteOptions.buttonholePlacketWidth
    const buttonPlacketWidth = absoluteOptions.buttonPlacketWidth
    const patchPocketWidth = measurements.shoulderToShoulder * options.patchPocketWidth
    //let's begin
    //hem
    points.cHemAnchor = points.cWaist.shift(-90, shirtLength)
    points.sideHemAnchor = new Point(points.armhole.x, points.cHemAnchor.y)
    if (options.fitSide || hemDiff <= 0) {
      points.sideHem = points.sideHemAnchor.shift(180, hemDiff)
    } else {
      points.sideHem = points.sideHemAnchor
    }
    points.sideWaistCp1 = new Point(points.sideWaist.x, (points.sideWaist.y + points.sideHem.y) / 2)
    points.sideHemCp1Anchor = new Point(
      points.sideHem.x * (1 - options.skirtFrontCurve),
      points.sideHem.y
    )

    points.sideHemCp1 = utils.beamsIntersect(
      points.sideHem,
      points.sideWaistCp1.rotate(90, points.sideHem),
      points.sideHemCp1Anchor,
      points.sideHemCp1Anchor.shift(-90, 1)
    )

    points.cHemMin = new Point(points.cbNeck.x, points.sideHemCp1.y)
    points.cHem = points.cHemMin.shift(-90, skirtWidth)
    points.cHemCp2 = new Point(points.sideHem.x / 2, points.cHem.y)

    if (skirtWidth == 0 && options.skirtFrontCurve == 0.5) {
      points.sideHemCp1 = points.sideHem.shiftFractionTowards(points.sideHemCp1, 0.8)
      points.cHemCp2 = points.cHem.shiftFractionTowards(points.cHemCp2, 0.8)
    }
    //buttonplackets
    points.buttonholeHem = points.cHem.shift(0, buttonholePlacketWidth / 2)
    points.buttonHem = points.cHem.shift(0, buttonPlacketWidth / 2)
    if (buttonholePlacketWidth > buttonPlacketWidth) {
      points.hemCurveStart = points.buttonholeHem
    } else {
      points.hemCurveStart = points.buttonHem
    }
    points.buttonholeNeck = utils.lineIntersectsCurve(
      points.buttonholeHem,
      points.buttonholeHem.shift(90, shirtLength * 100),
      points.hps,
      points.cfNeckCp1,
      points.cfNeckCp2,
      points.cfNeck
    )
    points.buttonNeck = utils.lineIntersectsCurve(
      points.buttonHem,
      points.buttonHem.shift(90, shirtLength * 100),
      points.hps,
      points.cfNeckCp1,
      points.cfNeckCp2,
      points.cfNeck
    )
    points.buttonholeNeckEx = points.cfNeck.shift(180, buttonholePlacketWidth / 2)
    points.buttonNeckEx = points.cfNeck.shift(180, buttonPlacketWidth / 2)
    points.buttonholeHemEx = new Point(points.buttonholeNeckEx.x, points.cHem.y)
    points.buttonHemEx = new Point(points.buttonNeckEx.x, points.cHem.y)

    let flipButtonhole = [
      'cfNeck',
      'cfNeckCp2',
      'cfNeckCp1',
      'hps',
      'buttonholeNeck',
      'buttonholeHem',
    ]
    for (const p of flipButtonhole)
      points['fBH' + utils.capitalize(p)] = points[p].flipX(points.buttonholeNeckEx)

    let flipButton = ['cfNeck', 'cfNeckCp2', 'cfNeckCp1', 'hps', 'buttonNeck', 'buttonHem']
    for (const p of flipButton)
      points['fB' + utils.capitalize(p)] = points[p].flipX(points.buttonNeckEx)

    //button points
    points.buttonStart = points.cfNeck.shiftFractionTowards(points.cHemMin, options.buttonStart)
    points.buttonEnd = points.cHemMin.shiftFractionTowards(points.cfNeck, options.buttonEnd)

    for (let i = 0; i <= options.buttonNumber - 1; i++) {
      points['button' + i] = points.buttonStart.shiftFractionTowards(
        points.buttonEnd,
        i / (options.buttonNumber - 1)
      )
    }

    //pocket
    points.pocketMid = new Point(
      points.armholePitch.x / 2,
      points.cArmholePitch.shiftFractionTowards(points.cArmhole, 2 / 3).y
    )
    points.pocketLeft = points.pocketMid.shift(180, patchPocketWidth / 2)
    points.pocketRight = points.pocketLeft.flipX(points.pocketMid)
    //stores
    store.set('buttonholePlacketWidth', buttonholePlacketWidth)
    store.set('buttonPlacketWidth', buttonPlacketWidth)
    store.set('patchPocketWidth', patchPocketWidth)
    store.set('patchPocketDepth', measurements.hpsToWaistBack * options.patchPocketDepth)
    store.set('scyeFrontWidth', points.armhole.dist(points.shoulder))
    store.set(
      'scyeFrontDepth',
      points.armhole.dist(points.shoulder) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.shoulder) - (points.shoulder.angle(points.hps) - 90)
          )
        )
    )
    store.set(
      'frontArmholeLength',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .length()
    )
    store.set(
      'frontArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
        .length()
    )
    //guides
    paths.buttonholeEx = new Path()
      .move(points.cfNeck)
      .line(points.buttonholeNeckEx)
      .line(points.buttonholeHemEx)
      .line(points.cHem)

    paths.buttonholeNeck = new Path()
      .move(points.hps)
      .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
      .line(points.fBHCfNeck)
      .curve(points.fBHCfNeckCp2, points.fBHCfNeckCp1, points.fBHHps)

    paths.buttonNeck = new Path()
      .move(points.hps)
      .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
      .line(points.fBCfNeck)
      .curve(points.fBCfNeckCp2, points.fBCfNeckCp1, points.fBHps)

    paths.buttonEx = new Path()
      .move(points.cfNeck)
      .line(points.buttonNeckEx)
      .line(points.buttonHemEx)
      .line(points.cHem)

    paths.pocketLine = new Path().move(points.pocketLeft).line(points.pocketRight)

    paths.hemGuide = new Path()
      .move(points.hemCurveStart)
      .curve(points.cHemCp2, points.sideHemCp1, points.sideHem)

    paths.byronGuide = new Path()
      .move(points.cWaist)
      .line(points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
      .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
      .line(points.cWaist)
      .close()
      .attr('class', 'various dashed')

    return part
  },
}
