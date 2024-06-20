import { gusset } from './gusset.mjs'
import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const leg = {
  name: 'francis.leg',
  after: [gusset],
  options: {
    //Style
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' },
    waistbandWidth: {
      pct: 7,
      min: 1,
      max: 8,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'none'], menu: 'style' },
    hoseEyelets: { bool: true, menu: 'style' },
    //Advanced
    legFullness: { pct: 100, min: 80, max: 120, menu: 'advanced' },
  },
  measurements: ['waistToHips', 'hips'],
  plugins: [pluginLogoRG],
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
    let waistbandWidth = absoluteOptions.waistbandWidth
    if (options.waistbandStyle == 'none') {
      waistbandWidth = 0
    }
    const waistbandDiff =
      (waistbandWidth * (measurements.hips - measurements.waist)) / measurements.waistToHips
    const panelWidth = store.get('panelWidth')
    const panelLength =
      store.get('toUpperLeg') -
      measurements.waistToHips * (1 - options.waistHeight) -
      waistbandWidth
    const legLength = panelLength + store.get('legBottomLength')
    let legWidth = measurements.waist * options.legFullness
    if (measurements.seat / 2 > legWidth) {
      legWidth = measurements.seat * options.legFullness
    }
    if (measurements.hips / 2 > legWidth) {
      legWidth = measurements.hips * options.legFullness
    }
    //let's begin
    points.origin = new Point(0, 0)
    points.bottomRight = new Point(legWidth / 2, legLength / 2)
    points.topRight = points.bottomRight.flipY()
    points.topLeft = points.topRight.flipX()
    points.bottomLeft = points.bottomRight.flipX()

    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()
    //stores
    store.set('panelLength', panelLength)
    store.set('waistbandWidth', waistbandWidth)
    store.set('waistbandLength', (panelWidth + legWidth) * 2)
    store.set('waistbandLengthTop', store.get('waistbandLength') - waistbandDiff)

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x / 2, points.topLeft.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.rightNotch = points.topRight.shift(-90, panelLength)
      points.leftNotch = new Point(points.topLeft.x, points.rightNotch.y)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['leftNotch', 'rightNotch'],
      })
      points.topMid = new Point(points.origin.x, points.topRight.y)
      if (options.waistbandStyle != 'none') {
        snippets.topNotch = new Snippet('notch', points.topMid)
      } else {
        if (options.hoseEyelets) {
          points.hoseEyelet0 = points.topRight
            .shift(180, panelWidth / 2)
            .shiftFractionTowards(points.topMid, 0.5)
            .translate(measurements.waist / -79.5, absoluteOptions.waistbandWidth / -4)
            .attr('data-circle', 2.5)
            .attr('data-circle-class', 'mark dotted stroke-lg')
          points.hoseEyelet1 = points.topRight
            .shift(180, panelWidth / 2)
            .shiftFractionTowards(points.topMid, 0.5)
            .translate(measurements.waist / 79.5, absoluteOptions.waistbandWidth / -4)
            .attr('data-circle', 2.5)
            .attr('data-circle-class', 'mark dotted stroke-lg')
        }
      }
      //title
      points.title = new Point(points.origin.x, points.topRight.y / 2)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Leg',
        scale: 0.5,
      })
      //logo
      points.logo = points.origin
      macro('logorg', {
        at: points.logo,
        scale: 0.25,
      })
      //scalebox
      points.scalebox = new Point(points.origin.x, points.bottomRight.y / 2)
      macro('scalebox', {
        at: points.scalebox,
      })
      if (sa) {
        let topSa = sa
        if (options.waistbandStyle == 'none') topSa = topSa + absoluteOptions.waistbandWidth

        points.saBottomRight = points.bottomRight.translate(sa, sa * options.hemWidth * 100)
        points.saTopRight = points.topRight.translate(sa, -topSa)
        points.saTopLeft = points.saTopRight.flipX()
        points.saBottomLeft = points.saBottomRight.flipX()

        if (options.waistbandStyle == 'none') {
          points.casingRight = points.topRight.shift(90, absoluteOptions.waistbandWidth)
          points.casingLeft = points.casingRight.flipX()
          paths.casing = new Path()
            .move(points.topRight)
            .line(points.casingRight)
            .line(points.casingLeft)
            .line(points.topLeft)

          paths.foldline = new Path()
            .move(points.topLeft)
            .line(points.topRight)
            .attr('class', 'mark')
            .attr('data-text', 'Fold - line')
            .attr('data-text-class', 'center')
        }
        paths.sa = new Path()
          .move(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
