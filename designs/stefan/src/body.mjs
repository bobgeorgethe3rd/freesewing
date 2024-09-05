import { draftRectangle } from './shared.mjs'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const body = {
  name: 'stefan.body',
  options: {
    //Fit
    neckEase: { pct: 12.9, min: 0, max: 20, menu: 'fit' },
    bicepsEase: { pct: 17.3, min: 0, max: 20, menu: 'fit' },
    wristEase: { pct: 15.4, min: 0, max: 35, menu: 'fit' },
    //Style
    bodyWidth: { pct: 25, min: 0, max: 100, menu: 'style' },
    bodyLength: { pct: 150, min: 0, max: 250, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    bodySideStyle: { dflt: 'vents', list: ['vents', 'gores', 'none'], menu: 'style' },
    bodyVentLength: { pct: 43.8, menu: 25, max: 75, menu: 'style' },
    neckFullness: { pct: 100, min: 50, max: 150, menu: 'style' },
    slitLength: { pct: 72.6, min: 50, max: 100, menu: 'style' },
    slitBackDepth: { pct: 0, min: 0, max: 12.1, menu: 'style' },
    slitFrontDepth: { pct: 6.1, min: 0, max: 12.1, menu: 'style' },
    slitBackCurve: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
    slitFrontCurve: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
    sleeveFullness: { pct: 0, min: 0, max: 150, nenu: 'style' },
    taperedSleeves: { bool: false, menu: 'style' },
    //Armhole
    scyeDepth: { pct: 18.2, min: 15, max: 30, menu: 'armhole' },
    //Construction
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    topSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    bodyHemWidth: { pct: 2, min: 0, max: 5, menu: 'construction' },
  },
  measurements: [
    'neck',
    'hpsToShoulder',
    'shoulderToElbow',
    'hpsToWaistBack',
    'hpsToWaistFront',
    'waistToHips',
    'waistToSeat',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToCalf',
    'waistToFloor',
    'biceps',
    'waistToArmpit',
    'wrist',
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
    const neck = measurements.neck * (1 + options.neckEase)
    const wrist = measurements.wrist * (1 + options.wristEase)
    const neckFullness = neck * options.neckFullness
    let toWaist = measurements.hpsToWaistBack
    if (measurements.hpsToWaistFront > measurements.hpsToWaistBack) {
      toWaist = measurements.hpsToWaistFront
    }
    const sleeveWidth = measurements.biceps * (1 + options.bicepsEase)
    let sleeveGussetWidth =
      toWaist - measurements.waistToArmpit * (1 - options.scyeDepth) - sleeveWidth * 0.5
    if (options.taperedSleeves && options.sleeveFullness <= 0) {
      sleeveGussetWidth = (sleeveWidth - wrist) * 0.5
    }
    const shoulderDrop = measurements.shoulderToElbow * options.bodyWidth

    const xDist = neckFullness + (measurements.hpsToShoulder + shoulderDrop) * 2
    let yDist
    if (options.bodyLength < 0.5) {
      yDist =
        measurements.waistToHips * (1 - 2 * options.bodyLength) +
        measurements.waistToSeat * 2 * options.bodyLength
    }
    if (options.bodyLength >= 0.5 && options.bodyLength < 1) {
      yDist =
        measurements.waistToSeat * (2 - 2 * options.bodyLength) +
        measurements.waistToUpperLeg * (2 * options.bodyLength - 1)
    }
    if (options.bodyLength >= 1 && options.bodyLength < 1.5) {
      yDist =
        measurements.waistToUpperLeg * (3 - 2 * options.bodyLength) +
        measurements.waistToKnee * (2 * options.bodyLength - 2)
    }
    if (options.bodyLength >= 1.5 && options.bodyLength < 2) {
      yDist =
        measurements.waistToKnee * (4 - 2 * options.bodyLength) +
        measurements.waistToCalf * (2 * options.bodyLength - 3)
    }
    if (options.bodyLength >= 2) {
      yDist =
        measurements.waistToCalf * (5 - 2 * options.bodyLength) +
        measurements.waistToFloor * (2 * options.bodyLength - 4)
    }
    yDist = toWaist + yDist * (1 + options.bodyLengthBonus)

    paths.seam = draftRectangle(part, xDist, yDist)

    //details that are always needed
    points.slit = points.top.shift(-90, measurements.hpsToWaistFront * options.slitLength)
    points.neckLeft = points.top.shift(180, neckFullness * 0.5 - sa)
    points.neckRight = points.neckLeft.flipX(points.top)
    points.neckFront = points.top.shift(-90, measurements.hpsToWaistFront * options.slitFrontDepth)
    points.neckBack = points.top.shift(-90, measurements.hpsToWaistFront * options.slitBackDepth)

    points.neckFrontCp1 = new Point(points.neckRight.x * options.slitFrontCurve, points.neckFront.y)
    points.neckFrontCp2 = points.neckFrontCp1.flipX(points.top)
    points.neckBackCp1 = new Point(points.neckRight.x * options.slitBackCurve, points.neckBack.y)
    points.neckBackCp2 = points.neckBackCp1.flipX(points.top)

    paths.neckSlit = new Path()
      .move(points.neckRight)
      ._curve(points.neckFrontCp1, points.neckFront)
      .curve_(points.neckFrontCp2, points.neckLeft)
      .attr('class', 'fabric help')
      .attr('data-text', 'Cut Front & Back along this line notch to notch.')
      .attr('data-text-class', 'center')

    paths.slit = new Path()
      .move(points.neckFront)
      .line(points.slit)
      .attr('class', 'fabric help')
      .attr('data-text', 'Cut Front Only')
      .attr('data-text-class', 'center')

    if (options.slitFrontDepth != options.slitBackDepth) {
      paths.neckSlit.attr('data-text', 'Cut Front along this line notch to notch', true)
      paths.neckSlitBack = new Path()
        .move(points.neckRight)
        ._curve(points.neckBackCp1, points.neckBack)
        .curve_(points.neckBackCp2, points.neckLeft)
        .attr('class', 'fabric help')
        .attr('data-text', 'Cut Back along this line notch to notch.')
        .attr('data-text-class', 'center')
      if (!sa) {
        paths.neckSlitBack.attr(
          'data-text',
          'Shift notches towards centre by your seam allowance and redraw slit path before cutting.'
        )
      }
    }

    if (!sa) {
      paths.neckSlit.attr(
        'data-text',
        'Shift notches towards centre by your seam allowance and redraw slit path before cutting.'
      )
    }

    points.sleeveLeft = points.topLeft.shift(-90, sleeveWidth)
    points.sleeveGussetLeft = points.sleeveLeft.shift(-90, sleeveGussetWidth)
    points.sleeveRight = points.sleeveLeft.flipX(points.origin)
    points.sleeveGussetRight = points.sleeveGussetLeft.flipX(points.origin)

    if (options.bodySideStyle != 'none') {
      const bodyVentLength = (yDist - toWaist) * options.bodyVentLength
      points.ventLeft = points.bottomLeft.shift(90, bodyVentLength)
      points.ventRight = points.ventLeft.flipX(points.origin)
      store.set('bodyVentLength', bodyVentLength)
    }

    macro('sprinkle', {
      snippet: 'notch',
      on: [
        'neckLeft',
        'neckRight',
        'slit',
        'sleeveLeft',
        'sleeveGussetLeft',
        'sleeveRight',
        'sleeveGussetRight',
        'ventLeft',
        'ventRight',
      ],
    })

    //stores
    store.set('neckbandLength', neck)
    store.set('shoulderDrop', shoulderDrop)
    store.set('sleeveWidth', sleeveWidth)
    store.set('sleeveGussetWidth', sleeveGussetWidth)

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x * 0.75, points.topLeft.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      if (options.topSaWidth <= 0) {
        points.cutOnFoldFrom = points.topRight
        points.cutOnFoldTo = points.topLeft
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: false,
        })
      }
      //title
      points.title = new Point(points.topLeft.x * 0.5, points.topRight.y * 0.5)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Body (Front & Back)',
        scale: 0.5,
      })
      //logo
      points.logo = new Point(points.topLeft.x * 0.5, points.origin.y)
      macro('logorg', { at: points.logo, scale: 0.5 })
      //scalebox
      points.scalebox = new Point(points.topLeft.x * 0.5, points.bottom.y * 0.5)
      macro('scalebox', { at: points.scalebox })

      if (sa) {
        const bodyHemWidth = sa * options.bodyHemWidth * 100
        if (options.bodySideStyle == 'vents' && options.sideSeamSaWidth < 0.015)
          options.sideSeamSaWidth = 0.015
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const topSa = sa * options.topSaWidth * 100

        paths.sa = draftRectangle(
          part,
          xDist + sideSeamSa * 2,
          yDist + bodyHemWidth + topSa,
          false,
          'sa',
          0,
          bodyHemWidth * 0.5 - topSa * 0.5
        ).attr('class', 'fabric sa')
      }
    }

    return part
  },
}
