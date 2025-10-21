import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const skirtFlounce = {
  name: 'playtest.skirtFlounce',
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Fit
    waistEase: { pct: 3.2, min: 0, max: 20, menu: 'fit' },
    hipsEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    seatEase: { pct: 2.6, min: 0, max: 20, menu: 'fit' },
    //Style
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'none'], menu: 'style' },
    waistHeight: { pct: 100, min: 0, max: 100, menu: 'style' },
    waistbandWidth: {
      pct: 3.7,
      min: 0,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    flounceMinLengthBonus: {
      pct: 0,
      min: -50,
      max: 100,
      menu: 'style',
    },
    skirtLengthBonus: {
      pct: 0,
      min: -50,
      max: 100,
      menu: 'style',
    },
    flounceNum: {
      count: 15,
      min: 5,
      max: 25,
      menu: 'style',
    },
    flounceSegmentNum: {
      count: 5,
      min: 3,
      max: 6,
      menu: 'style',
    },
    //Construction
    innerBoningPlacement: { pct: (2 / 3) * 100, min: 25, max: 90, menu: 'construction' },
    hemWidth: { pct: 1.5, min: 0, max: 3, menu: 'construction' },
    //Advanced
    fitWaist: { bool: true, menu: 'advanced' },
    calculateWaistbandDiff: { bool: true, menu: 'advanced' },
  },
  measurements: ['waist', 'hips', 'seat', 'waistToHips', 'waistToUpperLeg', 'waistToFloor'],
  plugins: pluginBundle,
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
    const waistbandWidth = options.waistbandStyle == 'none' ? 0 : absoluteOptions.waistbandWidth

    const waistbandDiff = options.calculateWaistbandDiff
      ? (waistbandWidth *
          (measurements.hips * (1 + options.hipsEase) -
            measurements.waist * (1 + options.waistEase))) /
        measurements.waistToHips
      : 0

    const toHips = measurements.waistToHips * (1 - options.waistHeight)

    const waist = measurements.waist * (1 + options.waistEase)
    const hips = measurements.hips * (1 + options.hipsEase)
    const seat = measurements.seat * (1 + options.seatEase)

    const styleWaist = options.fitWaist
      ? waist * options.waistHeight + hips * (1 - options.waistHeight) + waistbandDiff
      : waist > hips && seat
      ? waist
      : hips > seat
      ? hips
      : seat

    const flounceMinLength =
      (measurements.waistToUpperLeg - toHips - waistbandWidth) * (1 + options.flounceMinLengthBonus)
    const skirtLength =
      measurements.waistToFloor * (1 + options.skirtLengthBonus) - toHips - waistbandWidth
    const styleWaistRadius =
      ((styleWaist / options.flounceNum) * options.flounceSegmentNum * 2) / Math.PI / 2

    //let's begin
    points.origin = new Point(0, 0)
    points.bottom = points.origin.shift(
      -90,
      (flounceMinLength + skirtLength + styleWaistRadius * 2) / 2
    )
    points.right = points.bottom.rotate(90, points.origin)
    points.top = points.right.rotate(90, points.origin)
    points.bottomCp2 = points.bottom
      .shiftFractionTowards(points.origin, options.cpFraction)
      .rotate(-90, points.bottom)
    points.rightCp1 = points.right
      .shiftFractionTowards(points.origin, options.cpFraction)
      .rotate(90, points.right)
    points.rightCp2 = points.rightCp1.flipY(points.origin)
    points.topCp1 = points.bottomCp2.flipY(points.origin)
    //waist
    points.waistTop = points.top.shift(-90, flounceMinLength)
    points.waistRight = points.waistTop.translate(styleWaistRadius, styleWaistRadius)
    points.waistBottom = points.waistTop.shift(-90, styleWaistRadius * 2)
    points.waistTopCp2 = points.waistTop.shift(0, styleWaistRadius * options.cpFraction)
    points.waistRightCp1 = points.waistRight.shift(90, styleWaistRadius * options.cpFraction)
    points.waistRightCp2 = points.waistRight.shift(-90, styleWaistRadius * options.cpFraction)
    points.waistBottomCp1 = points.waistBottom.shift(0, styleWaistRadius * options.cpFraction)
    points.waistOrigin = points.waistTop.shift(-90, styleWaistRadius)
    //paths
    paths.hemBase = new Path()
      .move(points.bottom)
      .curve(points.bottomCp2, points.rightCp1, points.right)
      .curve(points.rightCp2, points.topCp1, points.top)
      .hide()

    paths.waist = new Path()
      .move(points.waistTop)
      .curve(points.waistTopCp2, points.waistRightCp1, points.waistRight)
      .curve(points.waistRightCp2, points.waistBottomCp1, points.waistBottom)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.waistTop)
      .join(paths.waist)
      .line(points.bottom)
      .close()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.waistBottom
      points.cutOnFoldTo = points.bottom
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
      })
      macro('cutonfold', {
        from: points.top,
        to: points.waistTop,
        prefix: 'top',
      })
      //notches & foldlines
      for (let i = 0; i < options.flounceSegmentNum - 1; i++) {
        points['waistFoldFrom' + i] = paths.waist.shiftFractionAlong(
          (i + 1) / options.flounceSegmentNum
        )

        const waistFoldIntersect = utils.lineIntersectsCurve(
          points.waistOrigin,
          points.waistOrigin.shiftOutwards(points['waistFoldFrom' + i], points.bottom.y * 10),
          points.right,
          points.rightCp2,
          points.topCp1,
          points.top
        )

        if (waistFoldIntersect) {
          points['waistFoldTo' + i] = waistFoldIntersect
        } else {
          points['waistFoldTo' + i] = utils.lineIntersectsCurve(
            points.waistOrigin,
            points.waistOrigin.shiftOutwards(points['waistFoldFrom' + i], points.bottom.y * 10),
            points.bottom,
            points.bottomCp2,
            points.rightCp1,
            points.right
          )
        }
        paths['waistFolds' + i] = new Path()
          .move(points['waistFoldFrom' + i])
          .line(points['waistFoldTo' + i])
          .attr('class', 'mark')
          .attr('data-text', 'Foldline')
          .attr('data-text-class', 'center')

        snippets['waistFoldFrom' + i] = new Snippet('notch', points['waistFoldFrom' + i])
        snippets['waistFoldTo' + i] = new Snippet('notch', points['waistFoldTo' + i])
      }
      //title
      points.title = points.waistBottom.translate(
        styleWaistRadius * 0.5,
        points.waistBottom.dist(points.bottom) / 3
      )
      macro('title', {
        nr: 2,
        title: 'Flounce',
        at: points.title,
        cutNr: options.flounceNum,
      })
      //boning
      paths.innerBoning = paths.hemBase
        .clone()
        .offset(
          points.waistBottom.dist(points.bottom) < points.waistTop.dist(points.top)
            ? points.waistBottom.dist(points.bottom) * -options.innerBoningPlacement
            : points.waistTop.dist(points.top) * -options.innerBoningPlacement
        )
        .attr('class', 'note')
        .attr('data-text', 'Boning Line')
        .attr('data-text-class', 'center')

      if (sa) {
        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .line(points.top)
          .line(points.waistTop)
          .join(paths.waist.offset(sa))
          .line(points.waistBottom)
          .line(points.bottom)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
