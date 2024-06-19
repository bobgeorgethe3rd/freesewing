import { pluginBundle } from '@freesewing/plugin-bundle'

export const gusset = {
  name: 'francis.gusset',
  options: {
    //Style
    crotchDrop: { pct: 2, min: 0, max: 15, menu: 'style' },
    legLength: { pct: 50, min: 0, max: 100, menu: 'style' },
    legLengthBonus: { pct: 0, min: -20, max: 20, menu: 'style' },
    panelWidth: { pct: 14.3, min: 10, max: 15, menu: 'style' },
    //Construction
    hemWidth: { pct: 2, min: 0, max: 5, menu: 'construction' },
  },
  measurements: ['waist', 'seat', 'waistToUpperLeg', 'waistToKnee', 'waistToCalf', 'waistToFloor'],
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
  }) => {
    //measurements
    const toUpperLeg = measurements.waistToUpperLeg * (1 + options.crotchDrop)
    let legBottomLength
    if (options.legLength < 0.5) {
      legBottomLength =
        measurements.waistToKnee * (1 - 2 * options.legLength) +
        measurements.waistToCalf * 2 * options.legLength
    } else {
      legBottomLength =
        measurements.waistToCalf * (options.legLength * -2 + 2) +
        measurements.waistToFloor * (2 * options.legLength - 1)
    }
    legBottomLength = legBottomLength - toUpperLeg
    const panelWidth = measurements.waist * options.panelWidth
    //let's begin
    points.origin = new Point(0, 0)
    points.bottom = new Point(panelWidth / 2, (measurements.seat * 3) / 16)
    points.bottomRight = points.bottom.translate(
      Math.sqrt(Math.pow(legBottomLength, 2) - Math.pow((measurements.seat * -3) / 24, 2)),
      (measurements.seat * -3) / 24
    )
    points.topRight = points.bottomRight.shift(90, (measurements.seat * 3) / 24)
    points.top = new Point(points.bottom.x, (measurements.seat * -3) / 16)

    if (complete && sa) {
      points.saBottom = utils.beamIntersectsY(
        points.bottom.shiftTowards(points.bottomRight, sa).rotate(-90, points.bottom),
        points.bottomRight.shiftTowards(points.bottom, sa).rotate(90, points.bottomRight),
        points.bottom.y + sa
      )
      points.saBottomRight = utils.beamIntersectsX(
        points.bottom.shiftTowards(points.bottomRight, sa).rotate(-90, points.bottom),
        points.bottomRight.shiftTowards(points.bottom, sa).rotate(90, points.bottomRight),
        points.bottomRight.x + sa * options.hemWidth * 100
      )
      points.saTopRight = points.saBottomRight.flipY()
      points.saTop = points.saBottom.flipY()
    }

    for (let i in points) points[i + 'F'] = points[i].flipX()

    paths.seam = new Path()
      .move(points.bottomF)
      .line(points.bottom)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.top)
      .line(points.topF)
      .line(points.topRightF)
      .line(points.bottomRightF)
      .line(points.bottomF)
      .close()

    //stores
    store.set('toUpperLeg', toUpperLeg)
    store.set('panelWidth', panelWidth)
    store.set('legBottomLength', legBottomLength)

    if (complete) {
      //grainline
      points.grainlineFrom = points.bottomRightF.shiftFractionTowards(points.topRightF, 0.25)
      points.grainlineTo = new Point(points.bottomRight.x, points.grainlineFrom.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.bottomNotch = new Point(points.origin.x, points.bottom.y)
      points.topNotch = points.bottomNotch.flipY()
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bottomNotch', 'topNotch'],
      })
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['bottomF', 'bottom', 'top', 'topF'],
      })
      //title
      points.title = new Point(points.origin.x, points.top.y * 0.5)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'gusset',
        scale: 0.5,
      })
      if (sa) {
        paths.sa = new Path()
          .move(points.saBottomF)
          .line(points.saBottom)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTop)
          .line(points.saTopF)
          .line(points.saTopRightF)
          .line(points.saBottomRightF)
          .line(points.saBottomF)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
