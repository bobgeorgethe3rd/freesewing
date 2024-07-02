import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const leg4 = {
  name: 'heleanor.leg4',
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Fit
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' },
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
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'] },
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
    crossSeamCurveStart: { pct: 0, min: 0, max: 50, menu: 'advanced' },
    crossSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
    crotchSeamCurveEnd: { pct: 0, min: 0, max: 50, menu: 'advanced' },
    crotchSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
  },
  measurements: [
    'crossSeam',
    'seat',
    'waistToHips',
    'waistToKnee',
    'waistToSeat',
    'waistToUpperLeg',
    'waistToFloor',
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
    //measurements
    const seat = measurements.seat * (1 + options.seatEase)

    const toUpperLeg = measurements.waistToUpperLeg * (1 + options.crotchDrop)
    const toHips = measurements.waistToHips * (1 - options.waistHeight)
    let waistbandWidth = absoluteOptions.waistbandWidth
    if (options.waistbandStyle == 'none') {
      waistbandWidth = 0
    }
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
    legLength = legLength * (1 + options.legLengthBonus) - toUpperLeg

    const legTubeWidth =
      measurements.waistToFloor * (1 + options.legLengthBonus) - toUpperLeg - legLength

    let legBandWidth = absoluteOptions.legBandWidth
    if (options.legBandStyle != 'band') {
      if (legTubeWidth < absoluteOptions.legBandWidth && options.legBandStyle == 'tube') {
        legBandWidth = absoluteOptions.legBandWidth - legTubeWidth
      } else {
        legBandWidth = 0
      }
    }
    legLength = legLength - legBandWidth
    const crossRadius = (measurements.crossSeam - toHips - waistbandWidth) / Math.PI
    //let's begin
    //cross
    points.upperLeg = new Point(0, 0)
    points.waistCross = points.upperLeg.translate(crossRadius, -crossRadius)
    points.waistCrossCp2 = points.waistCross.shift(-90, crossRadius * options.cpFraction)
    points.upperLegCp1 = points.upperLeg.shift(0, crossRadius * options.cpFraction)
    points.crossOrigin = new Point(points.upperLeg.x, points.waistCross.y)
    points.crotchSeamCurveEnd = points.upperLeg.rotate(-45, points.crossOrigin)

    const crotchCpDist = (4 / 3) * crossRadius * Math.tan(utils.deg2rad(45 / 4))

    points.upperLegCp2 = points.upperLeg
      .shiftTowards(points.crossOrigin, crotchCpDist)
      .rotate(90, points.upperLeg)
    points.crotchSeamCurveEndCp1 = points.crotchSeamCurveEnd
      .shiftTowards(points.crossOrigin, crotchCpDist)
      .rotate(-90, points.crotchSeamCurveEnd)

    points.topRight = points.waistCross.shift(0, legWidth)
    points.bottomAnchor = points.upperLeg.shift(
      -90,
      measurements.waistToKnee - toUpperLeg - absoluteOptions.legBandWidth
    )
    points.bottomRightMin = new Point(points.topRight.x, points.bottomAnchor.y)

    points.topLeft = points.crossOrigin.shiftOutwards(
      points.crotchSeamCurveEnd,
      seat * 0.5 * (1 / (options.seatWidth * 100))
    )
    points.topLeftCp2 = points.topLeft.shift(
      points.crotchSeamCurveEnd.angle(points.crotchSeamCurveEndCp1),
      points.crotchSeamCurveEnd.dist(
        utils.beamIntersectsY(
          points.crotchSeamCurveEnd,
          points.crotchSeamCurveEndCp1,
          points.upperLeg.y
        )
      )
    )

    paths.crossSeam = new Path()
      .move(points.waistCross)
      .curve(points.waistCrossCp2, points.upperLegCp1, points.upperLeg)
      .curve(points.upperLegCp2, points.crotchSeamCurveEndCp1, points.crotchSeamCurveEnd)
      .hide()

    let tweak = 1
    let delta
    do {
      points.bottomLeftMin = new Point(points.crotchSeamCurveEnd.x * tweak, points.bottomAnchor.y)
      points.bottomLeftMinCp2 = points.bottomLeftMin.shift(
        90,
        points.bottomAnchor.dist(points.upperLeg) * 0.5
      )

      paths.saLeftCurve = new Path()
        .move(points.topLeft)
        .curve(points.topLeftCp2, points.bottomLeftMinCp2, points.bottomLeftMin)
        .attr(
          'data-text',
          points.topRight.dist(points.bottomRightMin) - paths.crossSeam.length() / 3
        )

      // delta = paths.saLeftCurve.length() - (points.topRight.dist(points.bottomRightMin) - (paths.crossSeam.length() / 3))
      if (delta > 0) tweak = tweak * 1.01
      else tweak = tweak * 0.99
    } while (Math.abs(delta) > 0.01)

    //paths

    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomAnchor)
      .line(points.bottomRightMin)
      .line(points.topRight)
      .line(points.waistCross)
      .join(paths.crossSeam)

    return part
  },
}
