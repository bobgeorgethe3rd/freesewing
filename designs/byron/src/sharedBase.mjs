import { pluginBundle } from '@freesewing/plugin-bundle'

export const sharedBase = {
  name: 'byron.sharedBase',
  options: {
    //Constants
    cbNeck: 0.044,
    cfNeck: 0.55191502449,
    neckEase: 0,
    //Fit
    chestEase: { pct: 4.6, min: 0, max: 20, menu: 'fit' },
    shoulderToShoulderEase: { pct: 0, min: -10, max: 10, menu: 'fit' },

    useHighBust: { bool: false, menu: 'fit' },
    //Armhole
    armholeDrop: { pct: 0, min: -20, max: 20, menu: 'armhole' },
    armholePitchDepth: { pct: 50, min: 45, max: 60, menu: 'armhole' },
    frontArmholePitchWidth: { pct: 95.8, min: 95, max: 97, menu: 'armhole' },
    backArmholePitchWidth: { pct: 97.9, min: 97, max: 98, menu: 'armhole' },
    frontArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
    backArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
    //Advanced
    separateHorizontals: { bool: false, menu: 'advanced' },
  },
  measurements: [
    'chest',
    'hips',
    'hpsToChestBack',
    'hpsToWaistBack',
    'neck',
    'seat',
    'shoulderSlope',
    'shoulderToShoulder',
    'waist',
    'waistToHips',
    'waistToSeat',
  ],
  optionalMeasurements: ['chestFront', 'highBust', 'highBustFront', 'waistBack'],
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
    let cbNeck = measurements.hpsToWaistBack * options.cbNeck

    let chest
    if (options.useHighBust && measurements.highBust) {
      chest = measurements.highBust * (1 + options.chestEase)
    } else {
      chest = measurements.chest * (1 + options.chestEase)
    }

    let chestFront
    let chestBack
    if (
      (options.separateHorizontals && measurements.chestFront) ||
      (options.separateHorizontals && options.useHighBust && measurements.highBustFront)
    ) {
      if (options.useHighBust) {
        chestFront = (measurements.highBustFront * (1 + options.chestEase)) / 2
      } else {
        chestFront = (measurements.chestFront * (1 + options.chestEase)) / 2
      }
      chestBack = (chest - chestFront * 2) / 2
    } else {
      chestFront = chest / 4
      chestBack = chest / 4
      if (options.separateHorizontals && options.useHighBust)
        log.warning('highBustFront measure not available please add for separate chest measures')
      else log.warning('chestFront measure not available please add for separate chest measures')
    }

    let neck = measurements.neck * (1 + options.neckEase)
    let shoulderToShoulder = measurements.shoulderToShoulder * (1 + options.shoulderToShoulderEase)
    //let's begin
    points.origin = new Point(0, 0)

    //Scaffold
    points.cArmhole = points.origin.shift(
      -90,
      measurements.hpsToChestBack * (1 + options.armholeDrop)
    )
    points.cChest = points.origin.shift(-90, measurements.hpsToChestBack)
    points.cWaist = points.origin.shift(-90, measurements.hpsToWaistBack)
    points.cHips = points.cWaist.shift(-90, measurements.waistToHips)
    points.cSeat = points.cWaist.shift(-90, measurements.waistToSeat)

    points.frontArmhole = points.cArmhole.shift(0, chestFront)
    points.backArmhole = points.cArmhole.shift(0, chestBack)
    points.chest = points.cChest.shift(0, chest / 4)

    //Armhole
    points.hps = points.origin.shift(0, neck / 5)
    points.cbNeck = points.origin.shift(-90, cbNeck)
    points.cArmholePitch = points.cbNeck.shiftFractionTowards(
      points.cArmhole,
      options.armholePitchDepth
    )
    points.shoulder = utils.beamsIntersect(
      points.hps,
      points.hps.shift(measurements.shoulderSlope * -1, 1),
      new Point(shoulderToShoulder / 2, 0),
      new Point(shoulderToShoulder / 2, 1)
    )

    points.frontArmholePitch = points.cArmholePitch.shift(
      0,
      (shoulderToShoulder * options.frontArmholePitchWidth) / 2
    )
    points.frontArmholePitchCp2 = utils.beamsIntersect(
      points.frontArmholePitch,
      points.frontArmholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    points.frontArmholePitchCp1 = points.frontArmholePitchCp2.rotate(180, points.frontArmholePitch)
    points.frontArmholeCp1 = points.frontArmhole.shiftFractionTowards(
      new Point(points.frontArmholePitch.x, points.frontArmhole.y),
      options.frontArmholeDepth
    )

    points.backArmholePitch = points.cArmholePitch.shift(
      0,
      (shoulderToShoulder * options.backArmholePitchWidth) / 2
    )
    points.backArmholePitchCp2 = utils.beamsIntersect(
      points.backArmholePitch,
      points.backArmholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    points.backArmholePitchCp1 = points.backArmholePitchCp2.rotate(180, points.backArmholePitch)
    points.backArmholeCp1 = points.backArmhole.shiftFractionTowards(
      new Point(points.backArmholePitch.x, points.backArmhole.y),
      options.backArmholeDepth
    )
    //cbNeck
    points.cbNeckCp1 = new Point(points.hps.x, points.cbNeck.y)
    points.cbNeckCp2 = points.hps.rotate(90, points.cbNeckCp1)

    //cfNeck
    points.cfNeck = points.origin.shift(-90, neck / 4)
    points.cfNeckCorner = new Point(points.hps.x, points.cfNeck.y)
    points.cfNeckCp1 = points.hps.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)
    points.cfNeckCp2 = points.cfNeck.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)

    //guides Uncomment to see/for helping when making changes

    paths.centre = new Path().move(points.origin).line(points.cbNeck).line(points.cWaist)

    paths.chestArmhole = new Path()
      .move(points.cArmhole)
      .line(points.frontArmhole)
      .line(points.chest)
      .line(points.cChest)

    paths.frontArmhole = new Path()
      .move(points.frontArmhole)
      .curve(points.frontArmholeCp1, points.frontArmholePitchCp1, points.frontArmholePitch)
      .curve_(points.frontArmholePitchCp2, points.shoulder)
      .line(points.hps)
      .attr('class', 'various')

    paths.backArmhole = new Path()
      .move(points.backArmhole)
      .curve(points.backArmholeCp1, points.backArmholePitchCp1, points.backArmholePitch)
      .curve_(points.backArmholePitchCp2, points.shoulder)
      .line(points.hps)

    paths.cbNeck = new Path()
      .move(points.hps)
      .curve(points.cbNeckCp1, points.cbNeckCp2, points.cbNeck)

    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
      .attr('class', 'various')

    return part
  },
}
