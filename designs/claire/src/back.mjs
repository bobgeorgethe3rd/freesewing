import { skirtBase } from '@freesewing/claude'
import { front } from './front.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const back = {
  name: 'claire.back',
  from: skirtBase,
  after: front,
  hide: {
    from: true,
  },
  options: {
    separateBack: { bool: false, menu: 'advanced.style' },
  },
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
    //set Render
    if (
      !options.separateBack &&
      !options.useBackMeasures &&
      !options.independentSkirtFullness &&
      !options.independentSkirtGathering &&
      !options.useCrossSeamFront
    ) {
      part.hide()
      return part
    }
    //removing paths from base
    const keepThese = ['hemBase', 'sideSeam', 'waist']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //remove macros
    macro('title', false)
    //measurements
    const rise = store.get('rise')
    const crotchDrop = store.get('crotchDrop')
    let crossSeamBack
    if (options.useCrossSeamFront && measurements.crossSeamFront) {
      crossSeamBack = measurements.crossSeam - measurements.crossSeamFront - rise
    } else {
      options.crotchSeamCurve = options.crossSeamCurve
      crossSeamBack = measurements.crossSeam / 2 - rise
    }
    //let's begin
    points.cbUpperLeg = points.cbWaist.shift(-90, crotchDrop)

    let crossTweak = 1
    let crossDelta
    do {
      points.upperLegBack = points.cbUpperLeg.shift(180, measurements.waist * crossTweak)
      points.upperLegBackCp1 = points.upperLegBack.shiftFractionTowards(
        points.cbUpperLeg,
        options.crossSeamCurve
      )
      points.cbSeatCp2 = points.cbSeat.shiftFractionTowards(
        points.cbUpperLeg,
        options.crossSeamCurve
      )

      paths.crossSeam = new Path()
        .move(points.cbWaist)
        .line(points.cbSeat)
        .curve(points.cbSeatCp2, points.upperLegBackCp1, points.upperLegBack)
        .hide()

      crossDelta = paths.crossSeam.length() - crossSeamBack
      if (crossDelta > 0) crossTweak = crossTweak * 0.99
      else crossTweak = crossTweak * 1.01
    } while (Math.abs(crossDelta) > 1)

    points.hemBack = new Point(points.upperLegBack.x, points.cbHem.y)

    //paths
    if (points.sideBackExtension) {
      paths.sideSeam = new Path()
        .move(points.backHemExtension)
        .line(points.sideBackExtension)
        .curve_(points.sideBackExtensionCp2, points.sideWaistBack)
        .hide()

      if (points.backHemExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.backHemExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideBackHem).line(points.sideWaistBack).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistBack)
      .curve(points.sideWaistBackCp2, points.waistBackMidCp1, points.waistBackMid)
      .curve(points.waistBackMidCp2, points.cbWaistCp1, points.cbWaist)
      .hide()

    paths.hemBase = new Path()
      .move(points.hemBack)
      .line(points.cbHem)
      .curve(points.cbHemCp2, points.backHemMidCp1, points.backHemMid)
      .curve(points.backHemMidCp2, points.sideBackHemCp1, points.sideBackHem)
      .line(paths.sideSeam.start())
      .hide()

    //paths
    paths.seam = paths.hemBase
      .join(paths.sideSeam)
      .join(paths.waist)
      .join(paths.crossSeam)
      .line(points.hemBack)
      .close()

    return part
  },
}
