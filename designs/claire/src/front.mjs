import { skirtBase } from '@freesewing/claude'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const front = {
  name: 'claire.front',
  from: skirtBase,
  hide: {
    from: true,
  },
  plugins: [pluginLogoRG],
  options: {
    //Constants
    culottes: true,
    //Fit
    waistEase: { pct: 3.2, min: 0, max: 20, menu: 'fit' }, //Altered for Claire
    hipsEase: { pct: 3, min: 0, max: 20, menu: 'fit' }, //Altered for Claire
    seatEase: { pct: 2.6, min: 0, max: 20, menu: 'fit' }, //Altered for Claire
    //Style
    crotchDrop: { pct: 2, min: 0, max: 15, menu: 'style' },
    skirtLength: {
      dflt: 'toKnee',
      list: ['toThigh', 'toKnee', 'toCalf', 'toFloor'],
      menu: 'style',
    }, //Altered for Claire
    skirtPanels: { count: 1, min: 1, max: 20, menu: 'style' },
    //Construction
    skirtHemWidth: { pct: 2, min: 0, max: 5, menu: 'construction' },
    skirtFacings: { bool: true, menu: 'construction' },
    skirtFacingWidth: {
      pct: 25,
      min: 10,
      max: 50,
      menu: 'construction',
    },
    crotchSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    crossSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    inseamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    //Advanced
    crossSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
    crotchSeamCurve: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
    useCrossSeamFront: { bool: false, menu: 'advanced.fit' },
  },
  measurements: ['waistToUpperLeg', 'crossSeam'],
  optionalMeasurements: ['crossSeamFront'],
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
    //removing paths from base
    const keepThese = ['hemBase', 'sideSeam', 'waist']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    macro('logorg', false)
    //measurements
    const rise = store.get('rise')
    const crotchDrop = measurements.waistToUpperLeg * (1 + options.crotchDrop) - rise
    let crossSeamFront
    if (options.useCrossSeamFront && measurements.crossSeamFront) {
      crossSeamFront = measurements.crossSeamFront - rise
    } else {
      options.crotchSeamCurve = options.crossSeamCurve
      crossSeamFront = measurements.crossSeam / 2 - rise
    }
    //let's begin
    points.cfUpperLeg = points.cfWaist.shift(-90, crotchDrop)

    let crotchTweak = 1
    let crotchDelta
    do {
      points.upperLegFront = points.cfUpperLeg.shift(180, measurements.waist * crotchTweak)
      points.upperLegFrontCp1 = points.upperLegFront.shiftFractionTowards(
        points.cfUpperLeg,
        options.crotchSeamCurve
      )
      points.cfSeatCp2 = points.cfSeat.shiftFractionTowards(
        points.cfUpperLeg,
        options.crotchSeamCurve
      )

      paths.crotchSeam = new Path()
        .move(points.cfWaist)
        .line(points.cfSeat)
        .curve(points.cfSeatCp2, points.upperLegFrontCp1, points.upperLegFront)
        .hide()

      crotchDelta = paths.crotchSeam.length() - crossSeamFront
      if (crotchDelta > 0) crotchTweak = crotchTweak * 0.99
      else crotchTweak = crotchTweak * 1.01
    } while (Math.abs(crotchDelta) > 1)

    points.hemFront = new Point(points.upperLegFront.x, points.cfHem.y)

    //paths
    if (points.sideFrontExtension) {
      paths.sideSeam = new Path()
        .move(points.frontHemExtension)
        .line(points.sideFrontExtension)
        .curve_(points.sideFrontExtensionCp2, points.sideWaistFront)
        .hide()

      if (points.frontHemExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.frontHemExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideFrontHem).line(points.sideWaistFront).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistFront)
      .curve(points.sideWaistFrontCp2, points.waistFrontMidCp1, points.waistFrontMid)
      .curve(points.waistFrontMidCp2, points.cfWaistCp1, points.cfWaist)
      .hide()

    paths.hemBase = new Path()
      .move(points.hemFront)
      .line(points.cfHem)
      .curve(points.cfHemCp2, points.frontHemMidCp1, points.frontHemMid)
      .curve(points.frontHemMidCp2, points.sideFrontHemCp1, points.sideFrontHem)
      .line(paths.sideSeam.start())
      .hide()

    paths.seam = paths.hemBase
      .join(paths.sideSeam)
      .join(paths.waist)
      .join(paths.crotchSeam)
      .line(points.hemFront)
      .close()

    //stores
    store.set('crotchDrop', crotchDrop)

    return part
  },
}
