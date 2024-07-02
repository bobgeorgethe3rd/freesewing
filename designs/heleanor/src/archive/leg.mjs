import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { draftCross } from '@freesewing/neville'

export const leg = {
  name: 'heleanor.leg',
  options: {
    //Imported
    ...draftCross.options,
    //Constants
    // crossSeamCurveAngle: 0,
    // crossSeamCurveX: 0,
    // crossSeamCurve: 2 / 3,
    // crotchSeamCurveAngle: 1,
    // crotchSeamCurveX: 1 / 3,
    // crotchSeamCurve: 2 / 3,
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
    legLength = legLength * (1 + options.legLengthBonus) - toHips - waistbandWidth

    const legTubeWidth =
      measurements.waistToFloor * (1 + options.legLengthBonus) - toHips - waistbandWidth - legLength

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
    // points.upperLegBack = points.upperLeg.shiftOutwards(points.upperLegCrossAnchor, store.get('seatBack') / 2)
    // points.waistBackAnchor = points.upperLegBack
    // .shiftTowards(points.upperLeg, toUpperLeg - toHips - waistbandWidth)
    // .rotate(-90, points.upperLegBack)

    // const rot = 90 - points.crossSeamCurveStart.angle(points.waistCross)
    // for (let i in points) points[i] = points[i].rotate(rot, points.upperLeg)

    // points.waistBack = points.waistCross.shiftTowards(points.waistBackAnchor, legWidth)

    points.topLeft = points.crotchSeamCurveEnd
      .shiftFractionTowards(points.crotchSeamCurveCpTarget, 1 / 3)
      .rotate(-90, points.crotchSeamCurveEnd)

    let tweak = 1
    let delta
    do {
      // points.bottomLeft = points.upperLeg.shift(points.upperLeg.angle(points.upperLegCrossAnchor) - 90, legLength * tweak)
      points.bottomLeft = points.upperLeg.shift(
        points.waistCross.angle(points.crossSeamCurveStart),
        legLength * tweak
      )
      // points.bottomLeftCp1 = points.bottomLeft.shift(points.bottomLeft.angle(points.bottomRight) + 90, legLength * tweak * 0.5)
      points.bottomLeftCp1 = points.bottomLeft.shiftFractionTowards(points.upperLeg, 0.5)

      points.topLeftCp2 = points.topLeft.shift(
        points.crotchSeamCurveEnd.angle(points.crotchSeamCurveEndCp1),
        points.crotchSeamCurveEnd.dist(points.crotchSeamCurveCpTarget)
      )

      paths.saLeft = new Path()
        .move(points.topLeft)
        .curve(points.topLeftCp2, points.bottomLeftCp1, points.bottomLeft)
        .hide()

      delta =
        paths.saLeft.length() - (legLength - points.crotchSeamCurveEnd.dist(points.waistCrotch))
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    const rot = 90 - points.crossSeamCurveStart.angle(points.waistCross)
    for (let i in points) points[i] = points[i].rotate(rot, points.upperLeg)

    points.waistBack = new Point(
      points.waistCross.x + legWidth,
      points.waistCross.y + (points.waistCross.dy(points.bottomLeft) - legLength) * 0.5
    )
    points.bottomRight = points.waistBack.shift(-90, legLength)

    // points.bottomAnchor = utils.beamsIntersect(
    // points.bottomLeft,
    // points.bottomLeftCp1.rotate(-90, points.bottomLeft),
    // points.waistCross,
    // points.waistCross.shift(points.bottomLeftCp1.angle(points.bottomLeft), 1)
    // )

    // if (points.bottomLeft.x > points.bottomAnchor.x) {
    // points.bottomRight = points.bottomAnchor.shiftOutwards(points.bottomLeft, legWidth)
    // }
    // else {
    // points.bottomRight = points.bottomLeft.shiftOutwards(points.bottomAnchor, legWidth)
    // }

    // points.waistBack = points.bottomRight.shiftTowards(points.bottomLeft, legLength).rotate(-90, points.bottomRight)

    // const rot = 360 - points.bottomLeft.angle(points.bottomRight)
    // for (let i in points) points[i] = points[i].rotate(rot, points.bottomLeft)

    // points.waistBack = points.waistCross.shift(points.waistCross.angle(points.crossSeamCurveStart) + 90, legWidth)
    // points.rightBackAnchor = utils.beamsIntersect(
    // points.upperLeg,
    // points.upperLeg.shift(points.waistCross.angle(points.crossSeamCurveStart) + 90, 1),
    // points.waistBack,
    // points.waistCross.rotate(90, points.waistBack),
    // )
    // points.bottomRight = points.waistBack.shiftOutwards(points.rightBackAnchor, legLength)
    // points.crossSeamBottom = paths.crossSeam.edge('bottomLeft')
    // points.bottomAnchor = utils.beamsIntersect(
    // points.bottomRight,
    // points.waistBack.rotate(90, points.bottomRight),
    // points.crossSeamBottom,
    // points.crossSeamBottom.shift(points.waistBack.angle(points.bottomRight), 1),
    // )
    // let tweak = 1
    // let delta
    // do {
    // points.bottomLeft = points.bottomAnchor.shiftFractionTowards(points.bottomRight, tweak)
    // points.topLeft = points.crotchSeamCurveEnd.shift(points.crotchSeamCurveEndCp1.angle(points.crotchSeamCurveEnd) + 90, points.crotchSeamCurveEnd.dist(points.crotchSeamCurveCpTarget) / 3)
    // points.topLeftCp2 = points.topLeft.shift(points.crotchSeamCurveEnd.angle(points.crotchSeamCurveEndCp1), points.crotchSeamCurveEnd.dist(points.crotchSeamCurveCpTarget))
    // points.bottomLeftCp1 = points.bottomLeft.shift(points.bottomRight.angle(points.waistBack), points.crossSeamBottom.dist(points.bottomAnchor) / 3)

    // paths.inseam = new Path()
    // .move(points.topLeft)
    // .curve(points.topLeftCp2, points.bottomLeftCp1, points.bottomLeft)
    // .hide()

    // delta = paths.inseam.length() - (points.bottomRight.dist(points.waistBack) - points.crotchSeamCurveEnd.dist(points.waistCrotch))
    // if (delta > 0) tweak = tweak * 0.99
    // else tweak = tweak * 1.01
    // } while (Math.abs(delta) > 0.01)

    //paths
    // paths.seam = paths.inseam
    // .clone()
    // .line(points.bottomLeft)
    // .line(points.bottomRight)
    // .line(points.waistBack)
    // .line(points.waistCross)
    // .join(paths.crossSeam)
    // .line(points.topLeft)
    // .close()

    paths.crossSeam = new Path()
      .move(points.waistCross)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveStartCp2, points.upperLegCrossCp1, points.upperLeg)
      .curve(points.upperLegCrotchCp2, points.crotchSeamCurveEndCp1, points.crotchSeamCurveEnd)
      .hide()

    paths.saLeft = new Path()
      .move(points.topLeft)
      .curve(points.topLeftCp2, points.bottomLeftCp1, points.bottomLeft)
      .hide()

    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.waistBack)
      .line(points.waistCross)
      .join(paths.crossSeam)
      .line(points.topLeft)
      .join(paths.saLeft)
      .close()

    //stores
    store.set('legBandWidth', legBandWidth)

    return part
  },
}
