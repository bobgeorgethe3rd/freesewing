import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const leg = {
  name: 'heleanor.leg',
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Fit
    waistEase: { pct: 6.4, min: 0, max: 20, menu: 'fit' },
    hipsEase: { pct: 5.9, min: 0, max: 20, menu: 'fit' },
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' },
    kneeEase: { pct: 13.2, min: 0, max: 20, menu: 'fit' },
    calfEase: { pct: 13.4, min: 0, max: 20, menu: 'fit' },
    heelEase: { pct: 7.4, min: 0, max: 20, menu: 'fit' },
    //Style
    crotchDrop: { pct: 2, min: 0, max: 15, menu: 'style' },
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' },
    waistbandWidth: {
      pct: 4.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'style' },
    legLength: { pct: 0, min: 0, max: 100, menu: 'style' },
    legLengthBonus: { pct: 0, min: -20, max: 20, menu: 'style' },
    legBandStyle: {
      dflt: 'straight',
      list: ['straight', 'curved', 'straightTube', 'curvedTube', 'none'],
      menu: 'style',
    },
    legBandWidth: {
      pct: 4.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    fitWaist: { bool: false, menu: 'style' },
    // seatGussetWidth: { pct: 10, min: 5, max: 10, menu: 'style' },
    seatGussetTopWidth: { pct: (2 / 3) * 100, min: 50, max: 75, menu: 'style' },
    waistPleats: { bool: true, menu: 'style' },
    matchPleatNumber: { bool: true, menu: 'style' },
    legPleats: { bool: true, menu: 'style' },
    crotchGussetWidth: { pct: 100, min: 100, max: 200, menu: 'style' },
    crotchGussetBottomWidth: { pct: 50, min: 50, max: 75, menu: 'style' },
    //Construction
    hemWidth: { pct: 2, min: 0, max: 5, menu: 'construction' },
    crossSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    //Advanced
    legFullness: { pct: 100, min: 80, max: 120, menu: 'advanced' },
    calculateWaistbandDiff: { bool: true, menu: 'advanced' },
    calculateLegBandDiff: { bool: true, menu: 'advanced' },
  },
  measurements: [
    'crossSeam',
    'waist',
    'hips',
    'seat',
    'knee',
    'calf',
    'heel',
    'waistToHips',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToCalf',
    'waistToFloor',
  ],
  plugins: [pluginBundle, pluginLogoRG],
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
    //measurements
    const seat = measurements.seat * (1 + options.seatEase)

    const toUpperLeg = measurements.waistToUpperLeg * (1 + options.crotchDrop)
    const toHips = measurements.waistToHips * (1 - options.waistHeight)
    let waistbandWidth = absoluteOptions.waistbandWidth
    if (options.waistbandStyle == 'none') {
      waistbandWidth = 0
    }
    // let legWidth = measurements.seat * options.legFullness
    // if (
    // measurements.hips / 2 > legWidth &&
    // measurements.hips > (measurements.waist && measurements.seat)
    // ) {
    // legWidth = measurements.hips * options.legFullness
    // }
    // if (
    // measurements.waist / 2 > legWidth &&
    // measurements.waist > (measurements.seat && measurements.hips)
    // ) {
    const legWidth = measurements.waist * options.legFullness
    // }

    let legLength =
      measurements.waistToKnee +
      (measurements.waistToCalf - measurements.waistToKnee) * 2 * options.legLength
    if (options.legLength > 0.5) {
      legLength =
        measurements.waistToCalf +
        (measurements.waistToFloor - measurements.waistToCalf) * (-1 + 2 * options.legLength)
    }
    legLength = legLength * (1 + options.legLengthBonus) - measurements.waistToKnee

    const legTubeWidth =
      measurements.waistToFloor * (1 + options.legLengthBonus) -
      legLength -
      measurements.waistToKnee

    let legBandWidth = absoluteOptions.legBandWidth
    if (
      legTubeWidth > absoluteOptions.legBandWidth &&
      (options.legBandStyle == 'straightTube' || options.legBandStyle == 'curvedTube')
    ) {
      legBandWidth = legTubeWidth
    }
    // legLength = legLength - legBandWidth
    // const seatGussetWidth = seat * 0.5 * options.seatGussetWidth
    //let's begin
    //cross
    points.upperLeg = new Point(0, 0)
    points.crossSeamCurveStart = points.upperLeg.translate((seat * 3) / 32, (seat * -3) / 32)
    points.crossSeamCurveStartCp2 = points.crossSeamCurveStart.shift(
      90,
      points.crossSeamCurveStart.y * options.cpFraction
    )
    points.upperLegCp1 = points.upperLeg.shift(0, points.crossSeamCurveStart.x * options.cpFraction)
    points.crossSeamCurveOrigin = new Point(points.upperLeg.x, points.crossSeamCurveStart.y)

    paths.crossCurve = new Path()
      .move(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveStartCp2, points.upperLegCp1, points.upperLeg)
      .hide()

    points.waistCross = points.crossSeamCurveStart.shift(
      90,
      measurements.crossSeam * 0.5 - paths.crossCurve.length() - toHips
    )

    const cpDist =
      (4 / 3) *
      points.crossSeamCurveStart.dist(points.crossSeamCurveOrigin) *
      Math.tan(utils.deg2rad(45 / 4))
    points.crotchSeamCurveEnd = points.upperLeg.rotate(-45, points.crossSeamCurveOrigin)
    points.crotchSeamCurveEndCp1 = points.crotchSeamCurveEnd
      .shiftTowards(points.crossSeamCurveOrigin, cpDist)
      .rotate(-90, points.crotchSeamCurveEnd)
    points.upperLegCp2 = points.upperLeg.shift(180, cpDist)

    //leg
    points.topRight = points.waistCross.shift(0, legWidth)
    points.bottomLeftMin = points.upperLeg.shift(-90, measurements.waistToKnee - toUpperLeg)

    let tweak = 0.005
    let delta
    do {
      points.topLeft = points.crossSeamCurveOrigin.shiftOutwards(
        points.crotchSeamCurveEnd,
        seat * tweak
      )
      points.topLeftCp2 = utils.beamIntersectsX(
        points.topLeft,
        points.crotchSeamCurveEnd.rotate(-90, points.topLeft),
        points.upperLeg.x
      )

      paths.saLeft = new Path()
        .move(points.topLeft)
        .curve_(points.topLeftCp2, points.bottomLeftMin)
        .hide()

      delta =
        paths.saLeft.length() -
        (points.waistCross.dy(points.bottomLeftMin) -
          (paths.crossCurve.length() * 0.5 + points.waistCross.dist(points.crossSeamCurveStart)))
      if (delta > 0) tweak = tweak * 1.01
      else tweak = tweak * 0.99
    } while (Math.abs(delta) > 1)

    points.bottomLeft = points.upperLeg.shiftOutwards(points.bottomLeftMin, legLength)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

    //paths
    paths.crossSeam = new Path()
      .move(points.waistCross)
      .line(points.crossSeamCurveStart)
      .join(paths.crossCurve)
      .curve(points.upperLegCp2, points.crotchSeamCurveEndCp1, points.crotchSeamCurveEnd)
      .hide()

    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.waistCross)
      .join(paths.crossSeam)
      .line(points.topLeft)
      .join(paths.saLeft)
      .close()

    //stores
    const waist = measurements.waist * (1 + options.waistEase)
    const hips = measurements.hips * (1 + options.hipsEase)
    const knee = measurements.knee * (1 + options.kneeEase)
    const calf = measurements.calf * (1 + options.calfEase)
    const heel = measurements.heel * (1 + options.heelEase)

    let waistbandDiff
    if (options.calculateWaistbandDiff || options.waistbandStyle == 'curved') {
      waistbandDiff = (waistbandWidth * (hips - waist)) / measurements.waistToHips
    } else {
      waistbandDiff = 0
    }

    let waistbandLength
    if (options.fitWaist) {
      waistbandLength = waist * options.waistHeight + measurements.hips * (1 - options.waistHeight)
      waistbandLength = waistbandLength + waistbandDiff
    } else {
      if (measurements.waist > (measurements.hips && measurements.seat)) waistbandLength = waist
      if (measurements.hips > (measurements.waist && measurements.seat)) waistbandLength = hips
      if (measurements.seat > (measurements.waist && measurements.hips)) waistbandLength = seat
    }

    let legBandDiff
    if (
      options.calculateLegBandDiff ||
      options.legBandStyle == 'curved' ||
      options.legBandStyle == 'curvedTube'
    ) {
      if (legBandWidth > 0) {
        legBandDiff =
          (legBandWidth * (calf - heel)) / (measurements.waistToFloor - measurements.waistToCalf)
      } else {
        legBandDiff =
          (absoluteOptions.legBandWidth * (calf - heel)) /
          (measurements.waistToFloor - measurements.waistToCalf)
      }
    } else {
      legBandDiff = 0
    }

    let legBandLength
    if (options.legBandStyle == 'straightTube' || options.legBandStyle == 'curvedTube') {
      if (measurements.knee > (measurements.calf && measurements.heel)) legBandLength = knee
      if (measurements.calf > (measurements.knee && measurements.heel)) legBandLength = calf
      if (measurements.heel > (measurements.knee && measurements.calf)) legBandLength = heel
    } else {
      if (options.legLength < 0.5) {
        legBandLength = knee * (1 - 2 * options.legLength) + calf * 2 * options.legLength
      } else {
        legBandLength = calf * (2 - 2 * options.legLength) + heel * (-1 + 2 * options.legLength)
      }
      if (legBandLength < measurements.calf && measurements.heel) {
        if (legBandLength < measurements.calf && legBandLength > measurements.heel)
          legBandLength = calf
        if (legBandLength < measurements.heel && legBandLength > measurements.calf)
          legBandLength = heel
      }
    }
    legBandLength = legBandLength + legBandDiff
    store.set('waistbandWidth', waistbandWidth)
    store.set('waistbandLength', waistbandLength)
    store.set('waistbandLengthTop', waistbandLength - waistbandDiff)
    store.set('legBandWidth', legBandWidth)
    store.set('legBandLengthTop', legBandLength)
    if (options.legBandStyle == 'curved' || options.legBandStyle == 'curvedTube') {
      store.set('legBandLength', legBandLength - legBandDiff)
    } else {
      store.set('legBandLength', legBandLength)
    }
    store.set('seatGussetWidth', points.crotchSeamCurveEnd.dist(points.topLeft))
    store.set(
      'seatGussetLength',
      points.waistCross.dist(points.crossSeamCurveStart) + paths.crossCurve.length() * 0.5
    )
    store.set('crotchGussetWidth', store.get('seatGussetWidth') * options.crotchGussetWidth)
    store.set(
      'crotchGussetBottomWidth',
      store.get('crotchGussetWidth') * options.crotchGussetBottomWidth
    )
    store.set(
      'seatGussetTopWidth',
      (store.get('seatGussetWidth') * 2 + store.get('crotchGussetWidth')) *
        options.seatGussetTopWidth
    )
    store.set('crossSeamLength', paths.crossSeam.length())
    store.set('crotchNotchWidth', paths.crossSeam.split(points.upperLeg)[0].length())

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistCross.shiftFractionTowards(points.topRight, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.rightNotch = points.topRight.shift(-90, store.get('seatGussetLength'))
      snippets.upperLeg = new Snippet('notch', points.upperLeg)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['topLeft', 'rightNotch'],
      })
      //title
      points.title = new Point(points.topRight.x / 2, points.topRight.y / 2)
      macro('title', {
        at: points.title,
        nr: '1f',
        title: 'Leg',
        scale: 0.5,
      })
      //logo
      points.logo = new Point(points.topRight.x / 2, points.upperLeg.y)
      macro('logorg', { at: points.logo, scale: 0.5 })
      //scalebox
      points.scalebox = new Point(points.topRight.x / 2, points.bottomLeft.y / 2)
      macro('scalebox', { at: points.scalebox })
      //pleats
      const waistPleatNumber = Math.ceil(legWidth * 0.01)
      if (options.waistPleats) {
        const waistPleatTo =
          (waistbandLength -
            store.get('seatGussetTopWidth') -
            store.get('crotchGussetBottomWidth')) *
          0.5
        const waistPleatKeep = waistPleatTo / waistPleatNumber
        points.waistPleatStart = points.waistCross.shift(0, waistPleatKeep)

        for (let i = 0; i <= waistPleatNumber; i++) {
          points['waistPleatFrom' + i] = points.waistPleatStart.shiftFractionTowards(
            points.topRight,
            i / waistPleatNumber
          )
          points['waistPleatTo' + i] = points['waistPleatFrom' + i].shift(180, waistPleatKeep)

          if (i < waistPleatNumber) {
            paths['waistPleatFrom' + i] = new Path()
              .move(points['waistPleatFrom' + i])
              .line(points['waistPleatFrom' + i].shift(90, points.waistCross.y / 4))
              .attr('data-text', 'Pleat From')
              .attr('data-text-class', 'center')
          }
          if (i > 0) {
            paths['waistPleatTo' + i] = new Path()
              .move(points['waistPleatTo' + i])
              .line(points['waistPleatTo' + i].shift(90, points.waistCross.y / 4))
              .attr('class', 'fabric help')
              .attr('data-text', 'Pleat To')
              .attr('data-text-class', 'center')
          }
        }
      }
      if (options.legPleats && options.legBandStyle != 'none') {
        let legPleatNumber = Math.ceil(points.bottomLeft.dist(points.bottomRight) * 0.01)
        if (options.matchPleatNumber) legPleatNumber = waistPleatNumber
        const legPleatKeep = legBandLength / legPleatNumber
        points.legPleatStart = points.bottomLeft.shift(0, legPleatKeep)
        for (let i = 0; i <= legPleatNumber; i++) {
          points['legPleatFrom' + i] = points.legPleatStart.shiftFractionTowards(
            points.bottomRight,
            i / legPleatNumber
          )
          points['legPleatTo' + i] = points['legPleatFrom' + i].shift(180, legPleatKeep)

          if (i < legPleatNumber) {
            paths['legPleatFrom' + i] = new Path()
              .move(points['legPleatFrom' + i])
              .line(points['legPleatFrom' + i].shift(90, points.bottomLeft.y / 4))
              .attr('data-text', 'Pleat From')
              .attr('data-text-class', 'center')
          }
          if (i > 0) {
            paths['legPleatTo' + i] = new Path()
              .move(points['legPleatTo' + i])
              .line(points['legPleatTo' + i].shift(90, points.bottomLeft.y / 4))
              .attr('class', 'fabric help')
              .attr('data-text', 'Pleat To')
              .attr('data-text-class', 'center')
          }
        }
      }
      if (sa) {
        let hemSa = sa
        if (options.legBandStyle == 'none') hemSa = sa * options.hemWidth * 100

        const crossSeamSa = sa * options.crossSeamSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saBottomLeft = points.bottomLeft.translate(-sideSeamSa, hemSa)
        points.saBottomRight = points.bottomRight.translate(sideSeamSa, hemSa)
        points.saTopRight = points.topRight.translate(sideSeamSa, -sa)
        points.saWaistCross = points.waistCross.translate(-crossSeamSa, -sa)
        points.saCrotchSeamCurveEnd = points.crotchSeamCurveEnd
          .shift(points.crotchSeamCurveEndCp1.angle(points.crotchSeamCurveEnd), crossSeamSa)
          .shift(points.topLeft.angle(points.crotchSeamCurveEnd), crossSeamSa)
        points.saTopLeft = points.topLeft
          .shift(points.crotchSeamCurveEnd.angle(points.topLeft), sideSeamSa)
          .shift(points.topLeftCp2.angle(points.topLeft), crossSeamSa)

        paths.sa = new Path()
          .move(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saWaistCross)
          .join(paths.crossSeam.offset(crossSeamSa))
          .line(points.saCrotchSeamCurveEnd)
          .line(points.saTopLeft)
          .join(paths.saLeft.offset(sideSeamSa))
          .line(points.saBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
