import { pluginBundle } from '@freesewing/plugin-bundle'
import { pctBasedOn } from '@freesewing/core'
import { skirtBase as wandaSkirtBase } from '@freesewing/wanda'

export const skirtBase = {
  name: 'scarlett.skirtBase',
  options: {
    //Imported
    ...wandaSkirtBase.options,
    //Constants
    frontDart: 'seam', //Locked for Scarlett
    umbrellaExtenstion: 1 / 16, //Locked for Scarlett
    //Fit
    crossSeamEase: { pct: 2, min: 0, max: 15, menu: 'fit' },
    //Style
    crossCuvre: { pct: 100, min: 50, max: 100, menu: 'style' },
    crotchCuvre: { pct: 100, min: 50, max: 100, menu: 'style' },
    style: { dflt: 'straight', list: ['straight', 'bell', 'umbrella'], menu: 'style' },
    swingPanelStyle: { dflt: 'connected', list: ['connected', 'separate', 'none'], menu: 'style' },
    waistbandWidth: {
      pct: 3.75,
      min: 1,
      max: 8,
      snap: 3.175,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //altered for Scarlett
    //Construction
    closurePosition: {
      dflt: 'front',
      list: ['front', 'sideLeft', 'sideRight', 'back'],
      menu: 'construction',
    }, //Altered for Scarlett
    crossSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    //Advanced
    crossSeamDrop: { pct: 0, min: -10, max: 10, menu: 'advanced.fit' },
  },
  measurements: ['crossSeam', 'crossSeamFront', 'waistToSeat', 'waistToUpperLeg'],
  plugins: [pluginBundle],
  draft: (sh) => {
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      utils,
      options,
      measurements,
      snippets,
      Snippet,
      store,
      complete,
      part,
      sa,
    } = sh
    //set render
    wandaSkirtBase.draft(sh)
    //measures
    const waistbandWidth = store.get('waistbandWidth')
    const crossSeam = measurements.crossSeam * (1 + options.crossSeamEase) - waistbandWidth * 2
    const crossSeamFront =
      measurements.crossSeamFront * (1 + options.crossSeamEase) - waistbandWidth
    const crossSeamBack = crossSeam - crossSeamFront
    const toSeat = measurements.waistToSeat - waistbandWidth
    const toUpperLeg = measurements.waistToUpperLeg * (1 + options.crossSeamDrop) - waistbandWidth
    const skirtHemFacingWidth = store.get('skirtHemFacingWidth')
    //let's begin
    //crotch
    points.cfSeat = points.cfWaist.shiftTowards(points.cfHem, toSeat)
    points.cfUpperLeg = points.cfWaist.shiftTowards(points.cfHem, toUpperLeg)

    let crotchTweak = 1
    let crotchTarget = crossSeamFront
    let crotchDelta
    do {
      points.crotch = points.cfUpperLeg.shift(0, measurements.waist * crotchTweak)
      points.crotchCp1 = points.crotch.shiftFractionTowards(points.cfUpperLeg, options.crotchCuvre)
      paths.crotchCurve = new Path()
        .move(points.crotch)
        .curve(points.crotchCp1, points.cfSeat, points.cfWaist)
        .hide()

      crotchDelta = paths.crotchCurve.length() - crotchTarget
      if (crotchDelta > 0) crotchTweak = crotchTweak * 0.99
      else crotchTweak = crotchTweak * 1.01
    } while (Math.abs(crotchDelta) > 1)

    points.crotchHem = new Point(points.crotch.x, points.cfHem.y)

    const inseam = points.crotch.dist(points.crotchHem)
    //cross straight
    points.seatK = points.waist3LeftS.shiftTowards(points.hemK, toSeat)
    points.upperLegK = points.waist3LeftS.shiftTowards(points.hemK, toUpperLeg)

    let crossTweak = 1
    let crossTarget = crossSeamBack
    let crossDelta
    do {
      points.crossS = points.upperLegK
        .shiftTowards(points.origin, measurements.waist * crossTweak)
        .rotate(90, points.upperLegK)
      points.crossSCp1 = points.crossS.shiftFractionTowards(points.upperLegK, options.crossCuvre)
      paths.crossCurveS = new Path()
        .move(points.waist3LeftS)
        .curve(points.seatK, points.crossSCp1, points.crossS)
        .hide()

      crossDelta = paths.crossCurveS.length() - crossTarget
      if (crossDelta > 0) crossTweak = crossTweak * 0.99
      else crossTweak = crossTweak * 1.01
    } while (Math.abs(crossDelta) > 1)

    const crossDepth = points.upperLegK.dist(points.crossS)

    //cross bell
    points.seatL = points.waistL.shiftTowards(points.hemL, toSeat)
    points.upperLegL = points.waistL.shiftTowards(points.hemL, toUpperLeg)
    points.crossB = points.upperLegL
      .shiftTowards(points.waistL, crossDepth)
      .rotate(90, points.upperLegL)
    points.crossBCp1 = points.crossB.shiftFractionTowards(points.upperLegL, options.crossCuvre)

    //cross unmbrella
    points.seatM = points.waistH.shiftTowards(points.hemM, toSeat)
    points.upperLegM = points.waistH.shiftTowards(points.hemM, toUpperLeg)
    points.crossU = points.upperLegM
      .shiftTowards(points.waistH, crossDepth)
      .rotate(90, points.upperLegM)
    points.crossUCp1 = points.crossU.shiftFractionTowards(points.upperLegM, options.crossCuvre)

    //hem straight
    points.crossHemS = points.crossS
      .shiftTowards(points.upperLegK, inseam)
      .rotate(-90, points.crossS)
    points.hemKS = points.waist3LeftS.shiftOutwards(points.upperLegK, inseam)
    points.hemKCp2S = utils.beamsIntersect(
      points.crossHemS,
      points.hemKS,
      points.hemKCp2,
      points.hemK.rotate(90, points.hemKCp2)
    )

    //hem bell
    points.crossHemB = points.crossB
      .shiftTowards(points.upperLegL, inseam)
      .rotate(-90, points.crossB)
    points.hemLB = points.waistL.shiftOutwards(points.upperLegL, inseam)
    points.hemLCp2B = utils.beamsIntersect(
      points.crossHemB,
      points.hemLB,
      points.hemLCp2,
      points.hemLCp2.shift(points.waistL.angle(points.hemL), 1)
    )

    //hem umbrella
    points.crossHemU = points.crossU
      .shiftTowards(points.upperLegM, inseam)
      .rotate(-90, points.crossU)
    points.hemMU = points.waistH.shiftOutwards(points.upperLegM, inseam)
    // points.hemMCp2U = utils.beamsIntersect(
    // points.crossHemU,
    // points.hemMU,
    // points.hemN,
    // points.hemNCp2
    // )
    points.hemMCp2U = utils.beamsIntersect(
      points.crossHemU,
      points.hemMU,
      points.hemLCp2,
      points.hemLCp2.shift(points.waistL.angle(points.hemL), 1)
    )

    //hem facings
    if (options.skirtHemFacings) {
      points.cfHemFacing = points.cfHem.shiftTowards(
        points.cfWaist,
        store.get('skirtHemFacingWidth')
      )
      points.hemFacingDCp1 = utils.beamsIntersect(
        points.hemDCp2,
        points.origin,
        points.hemFacingD,
        points.origin.rotate(-90, points.hemFacingD)
      )
      points.cfHemFacingCp2 = utils.beamsIntersect(
        points.cfHemCp1,
        points.origin,
        points.cfHemFacing,
        points.origin.rotate(90, points.cfHemFacing)
      )

      points.hemFacingKS = points.hemKS.shiftTowards(points.waist3LeftS, skirtHemFacingWidth)
      points.crossHemFacingS = points.crossHemS.shiftTowards(points.crossS, skirtHemFacingWidth)
      points.hemFacingKCp1S = utils.beamsIntersect(
        points.crossHemFacingS,
        points.hemFacingKS,
        points.hemKCp2S,
        points.origin
      )
      paths.hemFacingKS = new Path()
        .move(points.hemFacingF)
        .curve(points.hemFacingFCp2, points.hemFacingKCp1S, points.hemFacingKS)
        .line(points.crossHemFacingS)
        .attr('class', 'interfacing')
    }
    //guides
    paths.crotchFront = new Path()
      .move(points.cfHem)
      .line(points.crotchHem)
      .line(points.crotch)
      .curve(points.crotchCp1, points.cfSeat, points.cfWaist)

    paths.crossStaight = new Path()
      .move(points.waist3LeftS)
      .curve(points.seatK, points.crossSCp1, points.crossS)
      .line(points.crossHemS)
      .line(points.hemKS)
      .curve(points.hemKCp2S, points.hemFCp1, points.hemF)

    paths.crossBell = new Path()
      .move(points.waistL)
      .curve(points.seatL, points.crossBCp1, points.crossB)
      .line(points.crossHemB)
      .line(points.hemLB)
      .curve(points.hemLCp2B, points.hemKCp1B, points.hemK)

    paths.crossUmbrella = new Path()
      .move(points.waistH)
      .curve(points.seatM, points.crossUCp1, points.crossU)
      .line(points.crossHemU)
      .line(points.hemMU)
      .curve(points.hemMCp2U, points.hemKCp1U, points.hemK)

    paths.bellHem.attr('class', 'various')
    paths.umbrellaHem.attr('class', 'various')
    paths.umbrellaHemGuide.attr('class', 'various')

    return part
  },
}
