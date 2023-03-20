import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const sharedBase = {
  name: 'byron.sharedBase',
  options: {
    //Constants
    cbNeck: 0.044,
    neckEase: 0,
    //Fit
    chestEase: { pct: 4.6, min: 0, max: 20, menu: 'fit' },
    shoulderToShoulderEase: { pct: 0, min: -10, max: 10, menu: 'fit' },
    waistEase: { pct: 5.8, min: 0, max: 20, menu: 'fit' },
    hipsEase: { pct: 5.5, min: 0, max: 20, menu: 'fit' },
    seatEase: { pct: 4.7, min: 0, max: 20, menu: 'fit' },
    useHighBust: { bool: false, menu: 'fit' },
    //Style
    bodyLength: { pct: 75, min: 0, max: 100, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -20, max: 20, menu: 'style' },
    //Armhole
    armholeDrop: { pct: 0, min: -20, max: 20, menu: 'armhole' },
    armholePitchDepth: { pct: 50, min: 45, max: 60, menu: 'armhole' },
    //Advanced
    separateHorizontals: { bool: false, menu: 'advanced' },
    waistbandWidth: {
      pct: 0,
      min: 0,
      max: 10,
      snap: 5,
      ...pctBasedOn('waistToSeat'),
      menu: 'advanced',
    },
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
  optionalMeasurements: [
    'chestFront',
    'highBust',
    'highBustFront',
    'waistBack',
    'hipsBack',
    'seatBack',
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
    let bodyLength
    if (options.bodyLength < 0.5) {
      bodyLength =
        2 * measurements.waistToHips * options.bodyLength * (1 + options.bodyLengthBonus) -
        absoluteOptions.waistbandWidth
    } else {
      bodyLength =
        measurements.waistToHips +
        (measurements.waistToSeat - measurements.waistToHips) *
          (2 * options.bodyLength - 1) *
          (1 + options.bodyLengthBonus) -
        absoluteOptions.waistbandWidth
    }

    let cbNeck = measurements.hpsToWaistBack * options.cbNeck

    let chest
    if (options.useHighBust && measurements.highBust) {
      chest = measurements.highBust * (1 + options.chestEase)
    } else {
      chest = measurements.chest * (1 + options.chestEase)
    }

    let chestBack
    let chestFront
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
        log.warning(
          'highBustFront measurements not available please add for separate chest measures'
        )
      if (options.separateHorizontals && !options.useHighBust)
        log.warning('chestFront measurements not available please add for separate chest measures')
    }

    let neck = measurements.neck * (1 + options.neckEase)
    let shoulderToShoulder = measurements.shoulderToShoulder * (1 + options.shoulderToShoulderEase)

    let waist = measurements.waist * (1 + options.waistEase)

    let waistFront
    let waistBack
    if (options.separateHorizontals && measurements.waistBack) {
      waistBack = (measurements.waistBack * (1 + options.waistEase)) / 2
      waistFront = (waist - waistBack * 2) / 2
    } else {
      waistBack = waist / 4
      waistFront = waist / 4
      if (options.separateHorizontals)
        log.warning('waistBack measurements not available please add for separate waist measures')
    }

    let hips = measurements.hips * (1 + options.hipsEase)

    let hipsFront
    let hipsBack
    if (options.separateHorizontals && measurements.hipsBack) {
      hipsBack = (measurements.hipsBack * (1 + options.hipsEase)) / 2
      hipsFront = (hips - hipsBack * 2) / 2
    } else {
      hipsBack = hips / 4
      hipsFront = hips / 4
      if (options.separateHorizontals)
        log.warning('hipsBack measurements not available please add for separate hips measures')
    }

    let seat = measurements.seat * (1 + options.seatEase)

    let seatFront
    let seatBack
    if (options.separateHorizontals && measurements.seatBack) {
      seatBack = (measurements.seatBack * (1 + options.seatEase)) / 2
      seatFront = (seat - seatBack * 2) / 2
    } else {
      seatBack = seat / 4
      seatFront = seat / 4
      if (options.separateHorizontals)
        log.warning('seatBack measurements not available please add for separate seat measures')
    }

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
    points.cHem = points.cWaist.shift(-90, bodyLength)

    points.cbNeck = points.origin.shift(-90, cbNeck)
    points.cArmholePitch = points.cbNeck.shiftFractionTowards(
      points.cArmhole,
      options.armholePitchDepth
    )

    points.hps = points.origin.shift(0, neck / 5)

    points.shoulder = utils.beamsIntersect(
      points.hps,
      points.hps.shift(measurements.shoulderSlope * -1, 1),
      new Point(shoulderToShoulder / 2, 0),
      new Point(shoulderToShoulder / 2, 1)
    )

    //guides Uncomment to see/for helping when making changes

    paths.centre = new Path().move(points.origin).line(points.cbNeck).line(points.cSeat)

    paths.shoulder = new Path().move(points.shoulder).line(points.hps)

    //Stores
    store.set('chestBack', chestBack)
    store.set('chestFront', chestFront)
    store.set('hipsBack', hipsBack)
    store.set('hipsFront', hipsFront)
    store.set('neck', neck)
    store.set('seatBack', seatBack)
    store.set('seatFront', seatFront)
    store.set('shoulderToShoulder', shoulderToShoulder)
    store.set('waistBack', waistBack)
    store.set('waistFront', waistFront)

    return part
  },
}
