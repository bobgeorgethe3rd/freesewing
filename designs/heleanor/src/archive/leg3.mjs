import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { draftCross } from '@freesewing/neville'

export const leg3 = {
  name: 'heleanor.leg3',
  options: {
    //Imported
    ...draftCross.options,
    //Style
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' }, //Altered for Heleanor
    waistbandWidth: {
      pct: 4.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    legLength: { pct: 0, min: 0, max: 100, menu: 'style' },
    legLengthBonus: { pct: 0, min: -20, max: 20, menu: 'style' },
    legBandStyle: { dflt: 'band', list: ['band', 'tube', 'none'], menu: 'style' },
    legBandWidth: {
      pct: 4.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    seatWidth: { pct: 15, min: 10, max: 20, menu: 'style' },
    //Advanced
    legFullness: { pct: 100, min: 80, max: 120, menu: 'advanced' },
  },
  measurements: [
    ...draftCross.measurements,
    'waistToCalf',
    'calf',
    'heel',
    'hips',
    'knee',
    'waist',
  ],
  plugins: [pluginBundle],
  draft: (sh) => {
    //draft
    const {
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
    } = sh
    //draft
    draftCross.draft(sh)
    //measurements
    const toHips = store.get('toHips')
    const toUpperLeg = store.get('toUpperLeg')
    const waistbandWidth = store.get('waistbandWidth')
    let legWidth = measurements.waist * options.legFullness
    if (
      measurements.hips / 2 > legWidth &&
      measurements.hips > (measurements.waist && measurements.seat)
    ) {
      legWidth = measurements.hips * options.legFullness
    }
    if (
      measurements.seat / 2 > legWidth &&
      measurements.seat > (measurements.waist && measurements.hips)
    ) {
      legWidth = measurements.seat * options.legFullness
    }

    let legLength =
      measurements.waistToKnee +
      (measurements.waistToCalf - measurements.waistToKnee) * 2 * options.legLength
    if (options.legLength > 0.5) {
      legLength =
        measurements.waistToCalf +
        (measurements.waistToFloor - measurements.waistToCalf) * (-1 + 2 * options.legLength)
    }
    legLength = legLength * (1 + options.legLengthBonus) - measurements.waistToSeat
    const legTubeWidth =
      measurements.waistToFloor * (1 + options.legLengthBonus) -
      measurements.waistToSeat -
      legLength

    let legBandWidth = absoluteOptions.legBandWidth
    if (options.legBandStyle != 'band') {
      if (legTubeWidth < absoluteOptions.legBandWidth && options.legBandStyle == 'tube') {
        legBandWidth = absoluteOptions.legBandWidth - legTubeWidth
      } else {
        legBandWidth = 0
      }
    }
    legLength = legLength - legBandWidth

    //let's begin

    points.topLeft = points.crotchSeamCurveEnd.shift(
      points.crotchSeamCurveEnd.angle(points.waistCrotch) + 90,
      store.get('seatFront') * (1 / (options.seatWidth * 100))
    )
    points.topLeftCp2 = points.topLeft.shift(
      points.crotchSeamCurveEnd.angle(points.crotchSeamCurveCpTarget),
      points.crotchSeamCurveEnd.dist(points.crotchSeamCurveCpTarget)
    )
    let tweak = 1
    let delta
    do {
      points.bottomLeftMin = points.crotchSeamCurveCpTarget.shift(
        points.waistCross.angle(points.crossSeamCurveStart),
        measurements.waistToKnee * tweak
      )
      points.bottomLeftMinCp1 = points.bottomLeftMin.shiftFractionTowards(
        points.crotchSeamCurveCpTarget,
        0.5
      )

      paths.saLeftCurve = new Path()
        .move(points.topLeft)
        .curve(points.topLeftCp2, points.bottomLeftMinCp1, points.bottomLeftMin)
        .hide()

      delta =
        paths.saLeftCurve.length() -
        (measurements.waistToKnee - measurements.waistToSeat - absoluteOptions.legBandWidth)
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 0.01)

    points.bottomLeft = points.bottomLeftMinCp1.shiftOutwards(
      points.bottomLeftMin,
      legLength - paths.saLeftCurve.length()
    )

    if (points.bottomLeft.sitsRoughlyOn(points.bottomLeftMin))
      points.bottomLeft = points.bottomLeftMin

    points.topRight = points.waistCross.shift(
      points.waistCross.angle(points.crossSeamCurveStart) + 90,
      legWidth
    )
    points.bottomRight = utils.beamsIntersect(
      points.bottomLeft,
      points.bottomLeftMinCp1.rotate(-90, points.bottomLeft),
      points.topRight,
      points.waistCross.rotate(90, points.topRight)
    )

    const rot = 90 - points.crossSeamCurveStart.angle(points.waistCross)
    for (let i in points) points[i] = points[i].rotate(rot, points.upperLeg)

    paths.crossSeam = new Path()
      .move(points.waistCross)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveStartCp2, points.upperLegCrossCp1, points.upperLeg)
      .curve(points.upperLegCrotchCp2, points.crotchSeamCurveEndCp1, points.crotchSeamCurveEnd)
      .hide()

    paths.saLeft = new Path()
      .move(points.topLeft)
      .curve(points.topLeftCp2, points.bottomLeftMinCp1, points.bottomLeftMin)
      .line(points.bottomLeft)
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
    store.set('crotchLength', paths.crossSeam.length())
    store.set('seatSideWidth', points.topRight.dist(points.bottomRight) - paths.saLeft.length())
    store.set('seatLength', points.crotchSeamCurveEnd.dist(points.topLeft))
    store.set('legBandWidth', legBandWidth)

    points.test1 = points.bottomLeft.translate(
      store.get('seatLength'),
      -Math.sqrt(Math.pow(store.get('seatSideWidth'), 2) - Math.pow(store.get('seatLength'), 2))
    )
    points.test2 = points.test1.shift(0, store.get('seatLength'))
    points.test3 = points.bottomLeft.shift(0, store.get('seatLength') * 3)
    points.test4 = points.test3.translate(
      store.get('seatLength') / 3,
      -Math.sqrt(Math.pow(store.get('crotchLength'), 2) - Math.pow(store.get('seatLength') / 2, 2))
    )
    points.test5 = points.test4.shift(0, store.get('seatLength') / 3)
    points.test6 = points.test3.shift(0, store.get('seatLength'))
    paths.test = new Path()
      .move(points.bottomLeft)
      .line(points.test1)
      .line(points.test2)
      .line(points.test3)
      .line(points.test4)
      .line(points.test5)
      .line(points.test6)
    return part
  },
}
