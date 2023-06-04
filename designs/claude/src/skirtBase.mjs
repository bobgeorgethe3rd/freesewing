import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const skirtBase = {
  name: 'claude.skirtBase',
  measurements: [
    'waist',
    'waistToKnee',
    'waistToFloor',
    'hips',
    'waistToHips',
    'seat',
    'waistToSeat',
  ],
  optionalMeasurements: [
    'waistBack',
    'hipsBack',
    'seatBack',
    'waistToUpperLeg',
    'waistToThigh',
    'waistToCalf',
  ],
  options: {
    //Constants
    useVoidStores: true,
    highLow: false,
    skirtHighLength: 'toSeat',
    skirtHighLengthBonus: 0,
    //Fit
    waistEase: { pct: 1, min: -10, max: 20, menu: 'fit' },
    hipsEase: { pct: 1, min: -10, max: 20, menu: 'fit' },
    seatEase: { pct: 5, min: 0, max: 20, menu: 'fit' },
    //Style
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'none'], menu: 'style' },
    waistbandElastic: { bool: false, menu: 'style' },
    waistbandWidth: {
      pct: 4.2,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    waistHeight: { pct: 100, min: 0, max: 100, menu: 'style' },
    skirtLength: {
      dflt: 'toKnee',
      list: ['toHips', 'toSeat', 'toUpperLeg', 'toThigh', 'toKnee', 'toCalf', 'toFloor'],
      menu: 'style',
    },
    skirtLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    skirtFullness: { pct: 100, min: 5, max: 200, menu: 'style' },
    skirtGatheringMethod: { dflt: 'spread', list: ['increase', 'spread'], menu: 'style' },
    skirtGathering: { pct: 0, min: 0, max: 300, menu: 'style' },

    //Advanced
    calculateWaistbandDiff: { bool: false, menu: 'advanced.fit' },
    useBackMeasures: { bool: false, menu: 'advanced.fit' },
    fitHips: { bool: true, menu: 'advanced.fit' },
    fitSeat: { bool: true, menu: 'advanced.fit' },
    independentSkirtFullness: { bool: false, menu: 'advanced.style' },
    independentSkirtGathering: { bool: false, menu: 'advanced.style' },
    skirtFrontFullness: { pct: 100, min: 5, max: 200, menu: 'advanced.style' },
    skirtBackFullness: { pct: 100, min: 5, max: 200, menu: 'advanced.style' },
    skirtFrontGatheringMethod: {
      dflt: 'spread',
      list: ['increase', 'spread'],
      menu: 'advanced.style',
    },
    skirtBackGatheringMethod: {
      dflt: 'spread',
      list: ['increase', 'spread'],
      menu: 'advanced.style',
    },
    skirtFrontGathering: { pct: 0, min: 0, max: 300, menu: 'advanced.style' },
    skirtBackGathering: { pct: 0, min: 0, max: 300, menu: 'advanced.style' },
  },
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

    if (options.useVoidStores) {
      void store.setIfUnset('waistBack', measurements.waistBack * (1 + options.waistEase) * 2)
      void store.setIfUnset(
        'waistFront',
        (measurements.waist - measurements.waistBack) * (1 + options.waistEase) * 2
      )
      void store.setIfUnset('storedWaist', measurements.waist * (1 + options.waistEase))

      void store.setIfUnset('hipsBack', measurements.hipsBack * (1 + options.hipsEase) * 2)
      void store.setIfUnset(
        'hipsFront',
        (measurements.hips - measurements.hipsBack) * (1 + options.hipsEase) * 2
      )
      void store.setIfUnset('storedHips', measurements.hips * (1 + options.hipsEase))

      void store.setIfUnset('seatBack', measurements.seatBack * (1 + options.seatEase) * 2)
      void store.setIfUnset(
        'seatFront',
        (measurements.seat - measurements.seatBack) * (1 + options.seatEase) * 2
      )
      void store.setIfUnset('storedSeat', measurements.seat * (1 + options.seatEase))

      void store.setIfUnset('waistHeigthDist', measurements.waistToHips)
    }

    const waistHeightDist = store.get('waistHeigthDist')

    const waist = store.get('storedWaist')
    const hips = store.get('storedHips')
    const seat = store.get('storedSeat')

    let waistFront
    let waistBack
    if (options.useBackMeasures && measurements.waistBack) {
      waistFront = store.get('waistFront')
      waistBack = store.get('waistBack')
    } else {
      waistFront = waist
      waistBack = waist
    }

    let hipsFront
    let hipsBack
    if (options.useBackMeasures && measurements.hipsBack) {
      hipsFront = store.get('hipsFront')
      hipsBack = store.get('hipsBack')
    } else {
      hipsFront = hips
      hipsBack = hips
    }

    let seatFront
    let seatBack
    if (options.useBackMeasures && measurements.seatBack) {
      seatFront = store.get('seatFront')
      seatBack = store.get('seatBack')
    } else {
      seatFront = seat
      seatBack = seat
    }

    let skirtFrontFullness
    let skirtBackFullness
    if (options.independentSkirtFullness) {
      skirtFrontFullness = options.skirtFrontFullness
      skirtBackFullness = options.skirtBackFullness
    } else {
      skirtFrontFullness = options.skirtFullness
      skirtBackFullness = options.skirtFullness
    }
    void store.setIfUnset('waistbandWidth', absoluteOptions.waistbandWidth)

    let waistbandWidth
    if (options.waistbandStyle == 'none') {
      waistbandWidth = 0
    } else {
      waistbandWidth = store.get('waistbandWidth')
    }

    let waistHeight
    if (options.skirtLength == 'toHips' || options.skirtHighLength == 'toHips') {
      waistHeight = 1
      log.debug('options.waistHeight locked as options.skirtLength = toHips')
    } else {
      waistHeight = options.waistHeight
    }

    let waistbandFrontDiff
    let waistbandBackDiff
    if (options.calculateWaistbandDiff || options.waistbandStyle == 'curved') {
      waistbandFrontDiff =
        ((waistbandWidth * (hipsFront - waistFront)) / waistHeightDist) * (1 / skirtFrontFullness)
      waistbandBackDiff =
        ((waistbandWidth * (hipsBack - waistBack)) / waistHeightDist) * (1 / skirtBackFullness)
    } else {
      waistbandFrontDiff = 0
      waistbandBackDiff = 0
    }

    let frontTopCircumference
    let backTopCircumference
    if (options.waistbandElastic /*  && options.waistbandStyle != 'none' */) {
      if (waist > (hips && seat)) {
        frontTopCircumference = waistFront * (1 / skirtFrontFullness)
        backTopCircumference = waistBack * (1 / skirtBackFullness)
        log.debug('Waist measure has been used to calculate elastic waistband')
      }
      if (hips > (waist && seat)) {
        frontTopCircumference = hipsFront * (1 / skirtFrontFullness)
        backTopCircumference = hipsBack * (1 / skirtBackFullness)
        log.debug('Hips measure has been used to calculate elastic waistband')
      }
      if (seat > (waist && hips)) {
        frontTopCircumference = seatFront * (1 / skirtFrontFullness)
        backTopCircumference = seatBack * (1 / skirtBackFullness)
        log.debug('Seat measure has been used to calculate elastic waistband')
      }
    } else {
      frontTopCircumference =
        (waistFront * waistHeight + hipsFront * (1 - waistHeight)) * (1 / skirtFrontFullness)
      backTopCircumference =
        (waistBack * waistHeight + hipsBack * (1 - waistHeight)) * (1 / skirtBackFullness)
    }

    const frontBottomCircumference = frontTopCircumference + waistbandFrontDiff
    const backBottomCircumference = backTopCircumference + waistbandBackDiff

    const gatherAngleFactor = 46 / -9

    let skirtFrontGathering
    let skirtBackGathering
    let skirtFrontGatheringMethod
    let skirtBackGatheringMethod
    if (options.independentSkirtGathering) {
      skirtFrontGathering = options.skirtFrontGathering
      skirtBackGathering = options.skirtBackGathering
      skirtFrontGatheringMethod = options.skirtFrontGatheringMethod
      skirtBackGatheringMethod = options.skirtBackGatheringMethod
    } else {
      skirtFrontGathering = options.skirtGathering
      skirtBackGathering = options.skirtGathering
      skirtFrontGatheringMethod = options.skirtGatheringMethod
      skirtBackGatheringMethod = options.skirtGatheringMethod
    }

    let frontGathering
    if (skirtFrontGatheringMethod == 'increase') {
      frontGathering = skirtFrontGathering
    } else frontGathering = 0

    let backGathering
    if (skirtBackGatheringMethod == 'increase') {
      backGathering = skirtBackGathering
    } else backGathering = 0

    // const frontGatheringAngle = skirtFrontGathering * gatherAngleFactor
    // const backGatheringAngle = skirtBackGathering * gatherAngleFactor

    const frontCircumference = frontBottomCircumference * (1 + frontGathering)
    const backCircumference = backBottomCircumference * (1 + backGathering)

    const frontRadius = frontCircumference / Math.PI / 2
    const backRadius = backCircumference / Math.PI / 2
    const frontAngle = 90 * skirtFrontFullness
    const backAngle = 90 * skirtBackFullness

    // const frontGatheringAngle = -utils.rad2deg(
    // Math.asin((frontBottomCircumference * skirtFrontGathering) / 48 / frontRadius)
    // )
    // const backGatheringAngle = -utils.rad2deg(
    // Math.asin((backBottomCircumference * skirtBackGathering) / 48 / backRadius)
    // )

    const waistFrontCpDistance = (4 / 3) * frontRadius * Math.tan(utils.deg2rad(frontAngle / 8))
    const waistBackCpDistance = (4 / 3) * backRadius * Math.tan(utils.deg2rad(backAngle / 8))

    const rise = store.get('waistHeigthDist') * (1 - waistHeight) + waistbandWidth

    let skirtHighLengthTarget
    if (measurements['waist' + utils.capitalize(options.skirtHighLength)]) {
      skirtHighLengthTarget =
        measurements['waist' + utils.capitalize(options.skirtHighLength)] *
        (1 + options.skirtHighLengthBonus)
    } else {
      skirtHighLengthTarget = measurements.waistToKnee * (1 + options.skirtHighLengthBonus)
    }
    let skirtLengthTarget
    if (measurements['waist' + utils.capitalize(options.skirtLength)]) {
      skirtLengthTarget =
        measurements['waist' + utils.capitalize(options.skirtLength)] *
        (1 + options.skirtLengthBonus)
    } else {
      skirtLengthTarget = measurements.waistToKnee * (1 + options.skirtLengthBonus)
    }

    let skirtLength
    let skirtHighLength
    if (skirtLengthTarget - skirtHighLengthTarget <= 0 && options.highLow) {
      skirtLength = measurements.waistToFloor - rise
      skirtHighLength = measurements.waistToKnee - rise
      log.warning(
        'The choices for options.skirtHighLength,  options.skirtLength,  options.skirtHighLengthBonus and options.skirtLengthBonus are incompatible to create a High - Low so the values skirtHighLength and skirtLength have been set to waistToKnee and waistToFloor respectively.'
      )
    } else {
      skirtLength = skirtLengthTarget - rise
      skirtHighLength = skirtHighLengthTarget - rise
    }

    const frontGatheringAngle = -utils.rad2deg(
      Math.asin(
        (frontBottomCircumference * skirtFrontFullness * skirtFrontGathering) / 12 / skirtLength
      )
    )
    const backGatheringAngle = -utils.rad2deg(
      Math.asin(
        (backBottomCircumference * skirtBackFullness * skirtBackGathering) / 12 / skirtLength
      )
    )

    const toHips = measurements.waistToHips - rise
    const toSeat = measurements.waistToSeat - rise

    //let's begin
    points.origin = new Point(0, 0)

    points.cfWaist = points.origin.shift(-90, frontRadius)
    points.waistFrontMidStatic = points.cfWaist.rotate(frontAngle / 2, points.origin)
    points.sideWaistFront = points.cfWaist.rotate(frontAngle, points.origin)
    points.waistFrontCpTargetStatic = utils.beamsIntersect(
      points.cfWaist,
      points.cfWaist.shift(0, 1),
      points.waistFrontMidStatic,
      points.origin.rotate(90, points.waistFrontMidStatic)
    )

    points.cbWaist = points.origin.shift(-90, backRadius)
    points.waistBackMidStatic = points.cbWaist.rotate(backAngle / 2, points.origin)
    points.sideWaistBack = points.cbWaist.rotate(backAngle, points.origin)
    points.waistBackCpTargetStatic = utils.beamsIntersect(
      points.cbWaist,
      points.cbWaist.shift(0, 1),
      points.waistBackMidStatic,
      points.origin.rotate(90, points.waistBackMidStatic)
    )

    let waistFrontCpFraction =
      waistFrontCpDistance / points.cfWaist.dist(points.waistFrontCpTargetStatic)
    let waistBackCpFraction =
      waistBackCpDistance / points.cbWaist.dist(points.waistBackCpTargetStatic)

    points.cfHem = points.origin.shiftOutwards(points.cfWaist, skirtLength)
    points.sideFrontHem = points.origin.shiftOutwards(points.sideWaistFront, skirtLength)

    points.cbHem = points.origin.shiftOutwards(points.cbWaist, skirtLength)
    points.sideBackHem = points.origin.shiftOutwards(points.sideWaistBack, skirtLength)

    for (let i = 0; i < 3; i++) {
      points['gatherFrontPivot' + i] = points.cfHem.rotate(
        (frontAngle * (i + 1)) / 4,
        points.origin
      )
      points['gatherBackPivot' + i] = points.cbHem.rotate((backAngle * (i + 1)) / 4, points.origin)
    }

    //setting points to rotate
    points.waistFrontMid = points.waistFrontMidStatic
    points.waistBackMid = points.waistBackMidStatic

    if (skirtFrontGatheringMethod == 'spread') {
      const rotFront0 = [
        'gatherFrontPivot1',
        'gatherFrontPivot2',
        'waistFrontMid',
        'sideWaistFront',
        'sideFrontHem',
      ]
      for (const p of rotFront0)
        points[p] = points[p].rotate(frontGatheringAngle, points.gatherFrontPivot0)

      const rotFront1 = ['gatherFrontPivot2', 'sideWaistFront', 'sideFrontHem']
      for (const p of rotFront1)
        points[p] = points[p].rotate(frontGatheringAngle, points.gatherFrontPivot1)

      const rotFront2 = ['sideWaistFront', 'sideFrontHem']
      for (const p of rotFront2)
        points[p] = points[p].rotate(frontGatheringAngle, points.gatherFrontPivot2)

      points.waistFrontMid = points.waistFrontMid.shiftFractionTowards(
        points.waistFrontMid.rotate(frontGatheringAngle, points.gatherFrontPivot1),
        0.5
      )
    }

    if (skirtBackGatheringMethod == 'spread') {
      let rotBack0 = [
        'gatherBackPivot1',
        'gatherBackPivot2',
        'waistBackMid',
        'sideWaistBack',
        'sideBackHem',
      ]
      for (const p of rotBack0)
        points[p] = points[p].rotate(backGatheringAngle, points.gatherBackPivot0)

      let rotBack1 = ['gatherBackPivot2', 'sideWaistBack', 'sideBackHem']
      for (const p of rotBack1)
        points[p] = points[p].rotate(backGatheringAngle, points.gatherBackPivot1)

      let rotBack2 = ['sideWaistBack', 'sideBackHem']
      for (const p of rotBack2)
        points[p] = points[p].rotate(backGatheringAngle, points.gatherBackPivot2)

      points.waistBackMid = points.waistBackMid.shiftFractionTowards(
        points.waistBackMid.rotate(backGatheringAngle, points.gatherBackPivot1),
        0.5
      )
    }

    points.frontHemMid = points.waistFrontMid.shiftTowards(points.gatherFrontPivot1, skirtLength)
    points.backHemMid = points.waistBackMid.shiftTowards(points.gatherBackPivot1, skirtLength)

    let frontOrigin
    if (skirtFrontGathering == 0 || skirtFrontGatheringMethod == 'increase') {
      frontOrigin = points.origin
    } else {
      frontOrigin = utils.beamsIntersect(
        points.cfHem,
        points.cfWaist,
        points.sideFrontHem,
        points.sideWaistFront
      )
    }

    let backOrigin
    if (skirtBackGathering == 0 || skirtBackGatheringMethod == 'increase') {
      backOrigin = points.origin
    } else {
      backOrigin = utils.beamsIntersect(
        points.cbHem,
        points.cbWaist,
        points.sideBackHem,
        points.sideWaistBack
      )
    }

    points.waistFrontCpTarget = utils.beamsIntersect(
      points.gatherFrontPivot0,
      points.cfWaist.rotate(frontAngle / 4, points.origin),
      points.waistFrontMid,
      frontOrigin.rotate(90, points.waistFrontMid)
    )
    points.waistBackCpTarget = utils.beamsIntersect(
      points.gatherBackPivot0,
      points.cbWaist.rotate(backAngle / 4, points.origin),
      points.waistBackMid,
      backOrigin.rotate(90, points.waistBackMid)
    )

    points.waistFrontCp4 = points.cfWaist
      .shiftTowards(points.cfHem, waistFrontCpDistance)
      .rotate(90, points.cfWaist)
    points.waistFrontCp3 = points.waistFrontMid.shiftFractionTowards(
      points.waistFrontCpTarget,
      waistFrontCpFraction
    )
    points.waistFrontCp2 = points.waistFrontCp3.rotate(180, points.waistFrontMid)
    points.waistFrontCp1 = points.sideWaistFront
      .shiftTowards(points.sideFrontHem, waistFrontCpDistance)
      .rotate(-90, points.sideWaistFront)

    points.waistBackCp4 = points.cbWaist
      .shiftTowards(points.cbHem, waistBackCpDistance)
      .rotate(90, points.cbWaist)
    points.waistBackCp3 = points.waistBackMid.shiftFractionTowards(
      points.waistBackCpTarget,
      waistBackCpFraction
    )
    points.waistBackCp2 = points.waistBackCp3.rotate(180, points.waistBackMid)
    points.waistBackCp1 = points.sideWaistBack
      .shiftTowards(points.sideBackHem, waistBackCpDistance)
      .rotate(-90, points.sideWaistBack)

    points.frontHemCp1 = utils.beamsIntersect(
      frontOrigin,
      points.waistFrontCp4,
      points.cfHem,
      points.cfWaist.rotate(-90, points.cfHem)
    )
    points.frontHemCp2 = utils.beamsIntersect(
      frontOrigin,
      points.waistFrontCp3,
      points.frontHemMid,
      points.waistFrontMid.rotate(90, points.frontHemMid)
    )
    points.frontHemCp3 = points.frontHemCp2.rotate(180, points.frontHemMid)
    points.frontHemCp4 = utils.beamsIntersect(
      frontOrigin,
      points.waistFrontCp1,
      points.sideFrontHem,
      points.sideWaistFront.rotate(90, points.sideFrontHem)
    )

    points.backHemCp1 = utils.beamsIntersect(
      backOrigin,
      points.waistBackCp4,
      points.cbHem,
      points.cbWaist.rotate(-90, points.cbHem)
    )
    points.backHemCp2 = utils.beamsIntersect(
      backOrigin,
      points.waistBackCp3,
      points.backHemMid,
      points.waistBackMid.rotate(90, points.backHemMid)
    )
    points.backHemCp3 = points.backHemCp2.rotate(180, points.backHemMid)
    points.backHemCp4 = utils.beamsIntersect(
      backOrigin,
      points.waistBackCp1,
      points.sideBackHem,
      points.sideWaistBack.rotate(90, points.sideBackHem)
    )

    if (options.fitSeat || options.fitHips) {
      if (
        options.fitHips &&
        !options.calculateWaistbandDiff &&
        options.waistbandStyle == 'straight'
      ) {
        log.debug('options.fitHips is unavailable when options.calculateWaistbandDiff is false.')
      }

      if (options.fitSeat && toSeat > 0) {
        points.cfSeat = points.cfWaist.shiftTowards(points.cfHem, toSeat)
        points.seatFrontMid = points.waistFrontMid.shiftTowards(points.frontHemMid, toSeat)
        points.sideSeatFront = points.sideWaistFront.shiftTowards(points.sideFrontHem, toSeat)

        points.seatFrontCp1 = utils.beamsIntersect(
          frontOrigin,
          points.waistFrontCp4,
          points.cfSeat,
          points.cfWaist.rotate(-90, points.cfSeat)
        )
        points.seatFrontCp2 = utils.beamsIntersect(
          frontOrigin,
          points.waistFrontCp3,
          points.seatFrontMid,
          points.waistFrontMid.rotate(90, points.seatFrontMid)
        )
        points.seatFrontCp3 = points.seatFrontCp2.rotate(180, points.seatFrontMid)
        points.seatFrontCp4 = utils.beamsIntersect(
          frontOrigin,
          points.waistFrontCp1,
          points.sideSeatFront,
          points.sideWaistFront.rotate(90, points.sideSeatFront)
        )

        points.cbSeat = points.cbWaist.shiftTowards(points.cbHem, toSeat)
        points.seatBackMid = points.waistBackMid.shiftTowards(points.backHemMid, toSeat)
        points.sideSeatBack = points.sideWaistBack.shiftTowards(points.sideBackHem, toSeat)

        points.seatBackCp1 = utils.beamsIntersect(
          backOrigin,
          points.waistBackCp4,
          points.cbSeat,
          points.cbWaist.rotate(-90, points.cbSeat)
        )
        points.seatBackCp2 = utils.beamsIntersect(
          backOrigin,
          points.waistBackCp3,
          points.seatBackMid,
          points.waistBackMid.rotate(90, points.seatBackMid)
        )
        points.seatBackCp3 = points.seatBackCp2.rotate(180, points.seatBackMid)
        points.seatBackCp4 = utils.beamsIntersect(
          backOrigin,
          points.waistBackCp1,
          points.sideSeatBack,
          points.sideWaistBack.rotate(90, points.sideSeatBack)
        )

        let seatDiff =
          (seat / 2 -
            new Path()
              .move(points.cfSeat)
              .curve(points.seatFrontCp1, points.seatFrontCp2, points.seatFrontMid)
              .curve(points.seatFrontCp3, points.seatFrontCp4, points.sideSeatFront)
              .length() -
            new Path()
              .move(points.cbSeat)
              .curve(points.seatBackCp1, points.seatBackCp2, points.seatBackMid)
              .curve(points.seatBackCp3, points.seatBackCp4, points.sideSeatBack)
              .length()) /
          2

        store.set('seatDiff', seatDiff)

        if (seatDiff > 0) {
          points.sideFrontExtension = points.seatFrontCp4.shiftOutwards(
            points.sideSeatFront,
            seatDiff
          )
          points.frontHemExtension = points.frontHemCp4.shiftOutwards(points.sideFrontHem, seatDiff)
          points.sideSeamFrontCpTarget = points.waistFrontCp1.shiftOutwards(
            points.sideWaistFront,
            seatDiff
          )
          points.sideSeamFrontCp = points.sideFrontExtension.shiftFractionTowards(
            points.sideSeamFrontCpTarget,
            2 / 3
          )

          points.sideBackExtension = points.seatBackCp4.shiftOutwards(points.sideSeatBack, seatDiff)
          points.backHemExtension = points.backHemCp4.shiftOutwards(points.sideBackHem, seatDiff)
          points.sideSeamBackCpTarget = points.waistBackCp1.shiftOutwards(
            points.sideWaistBack,
            seatDiff
          )
          points.sideSeamBackCp = points.sideBackExtension.shiftFractionTowards(
            points.sideSeamBackCpTarget,
            2 / 3
          )
          log.debug(
            'Adjusted side seam to accommodate seat. If not wanted disable options.fitSeat in Advanced.'
          )
        }
      }
      if (
        options.fitHips &&
        toHips > 0 &&
        (options.calculateWaistbandDiff || options.waistbandStyle != 'straight')
      ) {
        points.cfHips = points.cfWaist.shiftTowards(points.cfHem, toHips)
        points.hipsFrontMid = points.waistFrontMid.shiftTowards(points.frontHemMid, toHips)
        points.sideHipsFront = points.sideWaistFront.shiftTowards(points.sideFrontHem, toHips)

        points.hipsFrontCp1 = utils.beamsIntersect(
          frontOrigin,
          points.waistFrontCp4,
          points.cfHips,
          points.cfWaist.rotate(-90, points.cfHips)
        )
        points.hipsFrontCp2 = utils.beamsIntersect(
          frontOrigin,
          points.waistFrontCp3,
          points.hipsFrontMid,
          points.waistFrontMid.rotate(90, points.hipsFrontMid)
        )
        points.hipsFrontCp3 = points.hipsFrontCp2.rotate(180, points.hipsFrontMid)
        points.hipsFrontCp4 = utils.beamsIntersect(
          frontOrigin,
          points.waistFrontCp1,
          points.sideHipsFront,
          points.sideWaistFront.rotate(90, points.sideHipsFront)
        )

        points.cbHips = points.cbWaist.shiftTowards(points.cbHem, toHips)
        points.hipsBackMid = points.waistBackMid.shiftTowards(points.backHemMid, toHips)
        points.sideHipsBack = points.sideWaistBack.shiftTowards(points.sideBackHem, toHips)

        points.hipsBackCp1 = utils.beamsIntersect(
          backOrigin,
          points.waistBackCp4,
          points.cbHips,
          points.cbWaist.rotate(-90, points.cbHips)
        )
        points.hipsBackCp2 = utils.beamsIntersect(
          backOrigin,
          points.waistBackCp3,
          points.hipsBackMid,
          points.waistBackMid.rotate(90, points.hipsBackMid)
        )
        points.hipsBackCp3 = points.hipsBackCp2.rotate(180, points.hipsBackMid)
        points.hipsBackCp4 = utils.beamsIntersect(
          backOrigin,
          points.waistBackCp1,
          points.sideHipsBack,
          points.sideWaistBack.rotate(90, points.sideHipsBack)
        )

        let hipsDiff =
          (hips / 2 -
            new Path()
              .move(points.cfHips)
              .curve(points.hipsFrontCp1, points.hipsFrontCp2, points.hipsFrontMid)
              .curve(points.hipsFrontCp3, points.hipsFrontCp4, points.sideHipsFront)
              .length() -
            new Path()
              .move(points.cbHips)
              .curve(points.hipsBackCp1, points.hipsBackCp2, points.hipsBackMid)
              .curve(points.hipsBackCp3, points.hipsBackCp4, points.sideHipsBack)
              .length()) /
          2

        if (hipsDiff > 0) {
          points.sideFrontHipsEx = points.hipsFrontCp4.shiftOutwards(points.sideHipsFront, hipsDiff)
          points.sideBackHipsEx = points.hipsBackCp4.shiftOutwards(points.sideHipsBack, hipsDiff)

          let ex
          if (options.fitSeat && store.get('seatDiff') > hipsDiff) {
            ex = store.get('seatDiff')
          } else {
            ex = hipsDiff
          }

          let frontIntersect
          if (points.sideFrontExtension) {
            frontIntersect = utils.lineIntersectsCurve(
              points.sideHipsFront,
              points.sideFrontHipsEx,
              points.sideFrontExtension,
              points.sideSeamFrontCp,
              points.sideWaistFront,
              points.sideWaistFront
            )
          }
          if (!points.sideFrontExtension || frontIntersect) {
            points.sideFrontExtension = points.hipsFrontCp4.shiftOutwards(points.sideHipsFront, ex)
            points.frontHemExtension = points.frontHemCp4.shiftOutwards(points.sideFrontHem, ex)
            points.sideSeamFrontCpTarget = points.waistFrontCp1.shiftOutwards(
              points.sideWaistFront,
              ex
            )
            points.sideSeamFrontCp = points.sideFrontExtension.shiftFractionTowards(
              points.sideSeamFrontCpTarget,
              2 / 3
            )
            log.debug(
              'Adjusted side seam to accommodate hips. If not wanted disable options.fitHips in Advanced.'
            )
          }

          let backIntersect
          if (points.sideBackExtension) {
            backIntersect = utils.lineIntersectsCurve(
              points.sideHipsBack,
              points.sideBackHipsEx,
              points.sideBackExtension,
              points.sideSeamBackCp,
              points.sideWaistBack,
              points.sideWaistBack
            )
          }

          if (!points.sideBackExtension || backIntersect) {
            points.sideBackExtension = points.hipsBackCp4.shiftOutwards(points.sideHipsBack, ex)
            points.backHemExtension = points.backHemCp4.shiftOutwards(points.sideBackHem, ex)
            points.sideSeamBackCpTarget = points.waistBackCp1.shiftOutwards(
              points.sideWaistBack,
              ex
            )
            points.sideSeamBackCp = points.sideBackExtension.shiftFractionTowards(
              points.sideSeamBackCpTarget,
              2 / 3
            )
          }
        }
      }
      //guides
      // if (points.frontHemExtension) {
      // paths.sideseamFront = new Path()
      // .move(points.frontHemExtension)
      // .line(points.sideFrontExtension)
      // .curve_(points.sideSeamFrontCp, points.sideWaistFront)
      // }
      // if (points.backHemExtension) {
      // paths.sideseamBack = new Path()
      // .move(points.backHemExtension)
      // .line(points.sideBackExtension)
      // .curve_(points.sideSeamBackCp, points.sideWaistBack)
      // .attr('class', 'various')
      // }
    }
    if (points.frontHemExtension && points.frontHemExtension.y < points.sideFrontExtension.y) {
      points.frontHemExSplit = utils.lineIntersectsCurve(
        points.sideFrontHem,
        points.frontHemExtension,
        points.sideFrontExtension,
        points.sideSeamFrontCp,
        points.sideWaistFront,
        points.sideWaistFront
      )
    }
    if (points.backHemExtension && points.backHemExtension.y < points.sideBackExtension.y) {
      points.backHemExSplit = utils.lineIntersectsCurve(
        points.sideBackHem,
        points.backHemExtension,
        points.sideBackExtension,
        points.sideSeamBackCp,
        points.sideWaistBack,
        points.sideWaistBack
      )
    }

    //stores
    store.set(
      'waistbandLength',
      (frontBottomCircumference * skirtFrontFullness +
        backBottomCircumference * skirtBackFullness) /
        2
    )
    store.set(
      'waistbandLengthTop',
      (frontTopCircumference * skirtFrontFullness + backTopCircumference * skirtBackFullness) / 2
    )
    store.set('maxButtons', 1)

    store.set('skirtLength', skirtLength)
    store.set('skirtHighLength', skirtHighLength)
    store.set('skirtFrontFullness', skirtFrontFullness)
    store.set('skirtBackFullness', skirtBackFullness)
    store.set('frontRadius', frontRadius)
    store.set('backRadius', backRadius)
    store.set('frontAngle', frontAngle)
    store.set('backAngle', backAngle)
    store.set('waistFrontCpDistance', waistFrontCpDistance)
    store.set('waistBackCpDistance', waistBackCpDistance)
    store.set('toHips', toHips)
    store.set('toSeat', toSeat)
    store.set('rise', rise)
    store.set('frontOrigin', frontOrigin)
    store.set('backOrigin', backOrigin)

    store.set('anchorSeamLength', (waistFront * waistHeight + hipsFront * (1 - waistHeight)) / 4)
    store.set('insertSeamLength', measurements.waistToFloor)

    //guides
    // paths.waistFront = new Path()
    // .move(points.sideWaistFront)
    // .curve(points.waistFrontCp1, points.waistFrontCp2, points.waistFrontMid)
    // .curve(points.waistFrontCp3, points.waistFrontCp4, points.cfWaist)

    // paths.waistBack = new Path()
    // .move(points.sideWaistBack)
    // .curve(points.waistBackCp1, points.waistBackCp2, points.waistBackMid)
    // .curve(points.waistBackCp3, points.waistBackCp4, points.cbWaist)
    // .attr('class', 'various')

    // paths.frontHem = new Path()
    // .move(points.cfHem)
    // .curve(points.frontHemCp1, points.frontHemCp2, points.frontHemMid)
    // .curve(points.frontHemCp3, points.frontHemCp4, points.sideFrontHem)

    // paths.backHem = new Path()
    // .move(points.cbHem)
    // .curve(points.backHemCp1, points.backHemCp2, points.backHemMid)
    // .curve(points.backHemCp3, points.backHemCp4, points.sideBackHem)
    // .attr('class', 'various')

    return part
  },
}
