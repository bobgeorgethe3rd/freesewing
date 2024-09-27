import { pluginBundle } from '@freesewing/plugin-bundle'
import { sharedBase } from './sharedBase.mjs'

export const frontBase = {
  name: 'daisy.frontBase',
  from: sharedBase,
  hide: {
    from: true,
  },
  plugins: [pluginBundle],
  options: {
    //Constants
    armholeSaWidth: 0.01,
    cfNeck: 0.55191502449,
    neckSaWidth: 0.01,
    shoulderSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    closureSaWidth: 0.01,
    //Fit
    bustSpanEase: { pct: 0, min: -10, max: 20, menu: 'fit' },
    //Armhole
    frontArmholePitchDepth: { pct: 50, min: 45, max: 65, menu: 'armhole' },
    frontArmholePitchWidth: { pct: 91.1, min: 90, max: 95, menu: 'armhole' },
    frontArmholeDepth: { pct: /* 44.8 */ 55.2, min: 40, max: 65, menu: 'armhole' },
    //Construction
    closurePosition: { dflt: 'back', list: ['front', 'side', 'back'], menu: 'construction' },
    //Advanced
    // dartRatio: { pct: 50, min: 40, max: 60, menu: 'advanced.darts' },
  },
  measurements: [
    'hpsToWaistBack',
    'hpsToWaistFront',
    'hpsToBust',
    'highBustFront',
    'bustFront',
    'bustSpan',
    'waist',
    'waistBack',
  ],
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
  }) => {
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    //measures
    const highBustFront = measurements.highBustFront * (1 + options.chestEase)
    const bustFront = measurements.bustFront * (1 + options.chestEase)
    const waistToArmhole = store.get('waistToArmhole') //measurements.waistToArmpit * (1 - options.scyeDepth)
    const bustSpan = measurements.bustSpan * (1 + options.bustSpanEase)
    const neck = store.get('neck')
    const waistFront = (measurements.waist - measurements.waistBack) * (1 + options.waistEase)
    //let's begin
    // points.cfArmhole = points.origin.shift(-90, measurements.hpsToWaistFront - waistToArmhole)

    points.highBustAnchor = new Point(
      highBustFront / 2,
      measurements.hpsToWaistBack - measurements.waistToArmpit
    )
    // points.armhole = points.cArmhole.shift(0, highBustFront / 2)

    points.cfChest = points.origin.shift(-90, measurements.hpsToBust)
    points.sideChest = points.cfChest.shift(0, bustFront / 2)

    points.armhole = utils.beamsIntersect(
      points.highBustAnchor,
      points.sideChest,
      points.cArmhole,
      points.cArmhole.shift(0, 1)
    )

    points.bust = points.cfChest.shiftTowards(points.sideChest, bustSpan / 2)

    //darts
    points.cfWaist = points.origin.shift(-90, measurements.hpsToWaistFront)

    if (points.armhole.angle(points.sideChest) < points.sideChest.angle(points.armhole)) {
      points.sideWaistInitial = points.armhole.shift(
        points.sideChest.angle(points.armhole),
        waistToArmhole
      )
    } else {
      points.sideWaistInitial = points.armhole.shiftTowards(points.sideChest, waistToArmhole)
    }

    const waistDiff = points.cfWaist.dist(points.sideWaistInitial) - waistFront / 2
    points.waistDartMid = new Point(points.bust.x, points.cfWaist.y)
    points.waistDartLeft = points.waistDartMid.shift(180, waistDiff / 2)
    points.waistDartRight = points.waistDartLeft.flipX(points.waistDartMid)

    const fullDartAngle =
      points.bust.angle(points.waistDartRight) - points.bust.angle(points.waistDartLeft)

    let tweak = 0.5
    let delta
    do {
      const bustDartAngle = fullDartAngle * tweak
      const waistDartAngle = fullDartAngle * (1 - tweak)

      if (points.sideChest.y < points.armhole.y) {
        points.bustDartTop = points.armhole.shiftFractionTowards(points.sideWaistInitial, 0.5)
      } else {
        points.bustDartTop = points.sideChest
      }

      points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
      points.bustDartMid = points.bustDartTop.shiftFractionTowards(points.bustDartBottom, 0.5)
      points.sideWaist = points.sideWaistInitial.rotate(-bustDartAngle, points.bust)

      points.waistDartLeft = utils.beamsIntersect(
        points.bust,
        points.bust.shift(270 - waistDartAngle / 2, 1),
        points.cfWaist,
        points.cfWaist.shift(0, 1)
      )
      points.waistDartRight = points.waistDartLeft.rotate(waistDartAngle, points.bust)

      store.set('bustDartAngle', bustDartAngle)
      store.set('waistDartAngle', waistDartAngle)

      delta =
        points.bustDartTop.dist(points.bustDartBottom) -
        points.waistDartLeft.dist(points.waistDartRight)
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    points.waistDartEdge = utils.beamsIntersect(
      points.waistDartLeft,
      points.bust.rotate(-90, points.waistDartLeft),
      points.bust,
      points.waistDartMid
    )
    points.bustDartEdge = utils.beamsIntersect(
      points.armhole,
      points.bustDartTop,
      points.bust,
      points.bustDartMid
    )

    points.waistDartMid = new Point(points.bust.x, points.waistDartLeft.y)
    //armhole
    points.cArmholePitch = points.cbNeck.shiftFractionTowards(
      points.cArmhole,
      options.frontArmholePitchDepth
    )
    points.armholePitch = points.cArmholePitch.shift(
      0,
      points.shoulder.x * options.frontArmholePitchWidth
    )
    points.armholePitchCp2 = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    // points.armholeCpMax = utils.beamsIntersect(
    // points.armholePitchCp2,
    // points.armholePitch,
    // points.armhole,
    // points.sideChest.rotate(-90, points.armhole)
    // )
    points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
      /* points.armholeCpMax, // */ new Point(points.armholePitch.x, points.armhole.y),
      options.frontArmholeDepth
    )

    points.armholeCp2 = points.armhole.shiftFractionTowards(
      /* points.armholeCpMax, // */ new Point(points.armholePitch.x, points.armhole.y),
      options.frontArmholeDepth
    )

    //neck
    points.cfNeck = points.origin.shift(-90, neck / 4)
    points.cfNeckCorner = new Point(points.hps.x, points.cfNeck.y)
    points.hpsCp2 = points.hps.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)
    points.cfNeckCp1 = points.cfNeck.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)

    //guides

    paths.guide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.bust)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.bustDartBottom)
      .line(points.bust)
      .line(points.bustDartTop)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)

    //stores
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
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .length()
    )
    store.set(
      'frontArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .length()
    )

    // if (complete && sa) {
    // const armholeSa = sa * options.armholeSaWidth * 100
    // points.saArmholeCp2 = new Point(
    // points.armholeCp2.shift(45, armholeSa).x,
    // points.armholeCp2.y - armholeSa
    // )
    // points.saArmhole = utils.beamsIntersect(
    // points.bustDartTop,
    // points.armhole,
    // points.saArmholeCp2,
    // points.saArmholeCp2.shift(0, 1)
    // )
    // points.saArmholePitch = points.armholePitch.shift(0, armholeSa)
    // points.saArmholePitchCp1 = utils.beamsIntersect(
    // points.saArmholePitch,
    // points.armholePitch.rotate(-90, points.saArmholePitch),
    // points.armholePitchCp1,
    // points.armholePitchCp1.shift(45, 1)
    // )
    // points.saArmholePitchCp2 = utils.beamsIntersect(
    // points.armholePitchCp2,
    // points.shoulder.rotate(-90, points.armholePitchCp2),
    // points.saArmholePitchCp1,
    // points.saArmholePitch
    // )
    // points.saShoulder = points.hps.shiftOutwards(points.shoulder, armholeSa)
    // }

    return part
  },
}
