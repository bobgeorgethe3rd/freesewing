// import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const sharedBase = {
  name: 'jeremy.sharedBase',
  options: {
    //Constants
    cbNeck: 0.044,
    neckEase: 0, //.064,
    cfNeck: 0.55191502449,
    //Fit
    chestEase: { pct: 4.6, min: 0, max: 20, menu: 'fit' },
    shoulderToShoulderEase: { pct: 0, min: -10, max: 10, menu: 'fit' },
    // waistEase: { pct: 5.8, min: 0, max: 20, menu: 'fit' },
    //Style
    waistLengthBonus: { pct: 0, min: -20, max: 20, menu: 'style' },
    //Armhole
    scyeDepth: { pct: 18.2, min: 15, max: 30, menu: 'armhole' },
    backArmholePitchDepth: { pct: 50, min: 45, max: 60, menu: 'armhole' },
    backArmholePitchWidth: { pct: 97, min: 95, max: 98.5, menu: 'armhole' },
    backArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
    frontArmholePitchDepth: { pct: 50, min: 45, max: 60, menu: 'armhole' },
    frontArmholePitchWidth: { pct: 91.1, min: 90, max: 95, menu: 'armhole' },
    frontArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
    //Advanced
    shoulderRise: { pct: 0, min: 0, max: 3, menu: 'advanced' },
  },
  measurements: [
    'neck',
    'chest',
    // 'chestFront',
    'hpsToWaistBack',
    'hpsToWaistFront',
    'shoulderSlope',
    'hpsToShoulder',
    // 'waist',
    'waistToArmpit',
  ],
  plugins: [pluginBundle],
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
    //measures
    const neck = measurements.neck * (1 + options.neckEase)
    const chest = measurements.chest * (1 + options.chestEase)
    // const waist = measurements.waist * (1 + options.waistEase)
    // const cbNeck = measurements.hpsToWaistBack * options.cbNeck
    const hpsToShoulder = measurements.hpsToShoulder * (1 + options.shoulderToShoulderEase)
    const shoulderRise = measurements.hpsToWaistBack * options.shoulderRise
    //let's begin
    points.origin = new Point(0, 0)
    points.cbNeck = points.origin.shift(-90, measurements.hpsToWaistBack * options.cbNeck)
    points.cbWaist = points.origin.shift(
      -90,
      measurements.hpsToWaistBack * (1 + options.waistLengthBonus)
    )
    points.cfWaist = points.cbWaist.shift(180, chest / 2)
    points.frontOrigin = points.cfWaist.shift(
      90,
      measurements.hpsToWaistFront + measurements.hpsToWaistBack * options.waistLengthBonus
    )
    points.cfNeck = points.frontOrigin.shift(-90, neck / 4)
    //hps & shoulder
    points.hpsBack = points.origin.shift(180, neck / 5)
    points.shoulderBack = points.hpsBack
      .shift(180 - measurements.shoulderSlope * -1, hpsToShoulder)
      .shift(90 - measurements.shoulderSlope * -1, shoulderRise)
    points.hpsFront = points.frontOrigin.shift(0, neck / 5)
    points.shoulderFront = points.hpsFront
      .shift(measurements.shoulderSlope * -1, hpsToShoulder)
      .shift(90 - measurements.shoulderSlope, shoulderRise)
    //necks
    points.cbNeckCp2 = utils.beamIntersectsY(
      points.hpsBack,
      points.shoulderBack.rotate(
        180 - (points.hpsFront.angle(points.shoulderFront) - 270),
        points.hpsBack
      ),
      points.cbNeck.y
    )
    points.cfNeckCorner = new Point(points.hpsFront.x, points.cfNeck.y)
    points.hpsFrontCp2 = points.hpsFront.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)
    points.cfNeckCp1 = points.cfNeck.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)
    //armhole
    points.cbArmhole = points.origin.shift(
      -90,
      measurements.hpsToWaistBack - measurements.waistToArmpit * (1 - options.scyeDepth)
    )
    points.cbArmholePitch = points.cbNeck.shiftFractionTowards(
      points.cbArmhole,
      options.backArmholePitchDepth
    )
    // points.cbArmholePitch = new Point(points.cbNeck.x, points.shoulderBack.y + (points.cbArmhole.y - points.shoulderBack.y) * options.backArmholePitchDepth)
    points.backArmholePitch = points.cbArmholePitch.shift(
      0,
      points.shoulderBack.x * options.backArmholePitchWidth
    )
    points.backArmholePitchCp1 = utils.beamIntersectsX(
      points.shoulderBack,
      points.hpsBack.rotate(-90, points.shoulderBack),
      points.backArmholePitch.x
    )
    points.cfArmhole = new Point(points.frontOrigin.x, points.cbArmhole.y)
    //points.cfArmholePitchMin = points.frontOrigin.shift(-90, cbNeck)
    // points.cfArmholePitch = points.cfArmholePitchMin.shiftFractionTowards(points.cfArmhole, options.frontArmholePitchDepth)
    points.cfArmholePitch = new Point(
      points.cfNeck.x,
      points.shoulderFront.y +
        (points.cfArmhole.y - points.shoulderFront.y) * options.frontArmholePitchDepth
    )
    points.frontArmholePitch = points.cfArmholePitch.shift(
      180,
      (points.frontOrigin.x - points.shoulderFront.x) * options.frontArmholePitchWidth
    )
    points.frontArmholePitchCp2 = utils.beamIntersectsX(
      points.shoulderFront,
      points.hpsFront.rotate(90, points.shoulderFront),
      points.frontArmholePitch.x
    )
    // points.armhole = new Point(points.cfArmhole.x * 0.5, points.cbArmhole.y)
    // points.armhole = points.cfArmhole.shift(0, measurements.chestFront * (1 + options.chestEase) * 0.5)
    points.armhole = new Point(
      (points.frontArmholePitch.x + points.shoulderBack.x) * 0.5,
      points.cbArmhole.y
    )

    points.backArmholePitchCp2 = points.backArmholePitch.shiftFractionTowards(
      new Point(points.backArmholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )
    points.armholeCp1 = points.armhole.shiftFractionTowards(
      new Point(points.backArmholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )

    points.frontArmholePitchCp1 = points.frontArmholePitch.shiftFractionTowards(
      new Point(points.frontArmholePitch.x, points.armhole.y),
      options.frontArmholeDepth
    )
    points.armholeCp2 = points.armhole.shiftFractionTowards(
      new Point(points.frontArmholePitch.x, points.armhole.y),
      options.frontArmholeDepth
    )
    points.armholeWaist = new Point(points.armhole.x, points.cbWaist.y)
    //guides
    paths.jeremyGuide = new Path()
      .move(points.shoulderFront)
      .line(points.hpsFront)
      .curve(points.hpsFrontCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .line(points.cbWaist)
      .line(points.cbNeck)
      .curve_(points.cbNeckCp2, points.hpsBack)
      .line(points.shoulderBack)
      ._curve(points.backArmholePitchCp1, points.backArmholePitch)
      .curve(points.backArmholePitchCp2, points.armholeCp1, points.armhole)
      .line(points.armholeWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.frontArmholePitchCp1, points.frontArmholePitch)
      .curve_(points.frontArmholePitchCp2, points.shoulderFront)
      .hide()

    //stores
    store.set('chest', chest)
    store.set('scyeBackWidth', points.armhole.dist(points.shoulderBack))
    store.set(
      'scyeBackDepth',
      points.armhole.dist(points.shoulderBack) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.shoulderBack) -
              (points.shoulderBack.angle(points.hpsBack) + 90)
          )
        )
    )
    store.set(
      'backArmholeLength',
      new Path()
        .move(points.shoulderBack)
        ._curve(points.backArmholePitchCp1, points.backArmholePitch)
        .curve(points.backArmholePitchCp2, points.armholeCp1, points.armhole)
        .length()
    )
    store.set(
      'backArmholeToArmholePitch',
      new Path()
        .move(points.shoulderBack)
        ._curve(points.backArmholePitchCp1, points.backArmholePitch)
        .length()
    )

    store.set('scyeFrontWidth', points.armhole.dist(points.shoulderFront))
    store.set(
      'scyeFrontDepth',
      points.armhole.dist(points.shoulderFront) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.shoulderFront) -
              (points.shoulderFront.angle(points.hpsFront) - 90)
          )
        )
    )
    store.set(
      'frontArmholeLength',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.frontArmholePitchCp1, points.frontArmholePitch)
        .curve_(points.frontArmholePitchCp2, points.shoulderFront)
        .length()
    )
    store.set(
      'frontArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.frontArmholePitchCp1, points.frontArmholePitch)
        .length()
    )

    return part
  },
}
