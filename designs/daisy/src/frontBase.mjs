import { sharedBase } from './sharedBase.mjs'

export const frontBase = {
  name: 'daisy.frontBase',
  from: sharedBase,
  hide: {
    from: true,
  },
  options: {
    //Constants
    cfNeck: 0.55191502449,
    //Fit
    bustSpanEase: { pct: 0, min: 0, max: 20, menu: 'fit' },
    //Armhole
    frontArmholePitchDepth: { pct: 60, min: 45, max: 65, menu: 'armhole' },
    frontArmholePitchWidth: { pct: 91.1, min: 90, max: 95, menu: 'armhole' },
    frontArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
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
  }) => {
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    //measures
    const highBustFront = measurements.highBustFront * (1 + options.chestEase)
    const bustFront = measurements.bustFront * (1 + options.chestEase)
    const waistToArmhole = measurements.waistToArmpit * (1 - options.armholeDrop)
    const bustSpan = measurements.bustSpan * (1 + options.bustSpanEase)
    const neck = store.get('neck')
    const waistFront = (measurements.waist - measurements.waistBack) * (1 + options.waistEase)
    //let's begin
    points.cfArmhole = points.origin.shift(-90, measurements.hpsToWaistFront - waistToArmhole)
    points.armhole = points.cfArmhole.shift(0, highBustFront / 2)

    points.cfChest = points.origin.shift(-90, measurements.hpsToBust)
    points.sideChest = points.cfChest.shift(0, bustFront / 2)

    points.bust = points.cfChest.shiftTowards(points.sideChest, bustSpan / 2)

    //darts
    points.cfWaist = points.origin.shift(-90, measurements.hpsToWaistFront)

    if (points.armhole.angle(points.sideChest) < points.sideChest.angle(points.armhole)) {
      points.sideWaist = points.armhole.shift(
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

      points.bustDartTop = points.sideChest
      points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
      points.bustDartMiddle = points.bustDartTop.shiftFractionTowards(points.bustDartBottom, 0.5)
      points.sideWaist = points.sideWaistInitial.rotate(-bustDartAngle, points.bust)

      points.waistDartLeft = utils.beamsIntersect(
        points.bust,
        points.bust.shift(270 - waistDartAngle / 2, 1),
        points.cfWaist,
        points.cfWaist.shift(0, 1)
      )
      points.waistDartRight = points.waistDartLeft.rotate(waistDartAngle, points.bust)
      delta =
        points.bustDartTop.dist(points.bustDartBottom) -
        points.waistDartLeft.dist(points.waistDartRight)
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    //armhole
    points.cfArmholePitch = points.cbNeck.shiftFractionTowards(
      points.cfArmhole,
      options.frontArmholePitchDepth
    )
    points.armholePitch = points.cfArmholePitch.shift(
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
      new Point(points.armholePitch.x, points.armhole.y),
      options.frontArmholeDepth
    )

    points.armholeCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
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
    // store.set('bustDartAngle', bustDartAngle)
    // store.set('waistDartAngle', waistDartAngle)
    store.set('waistToArmhole', waistToArmhole)

    return part
  },
}
