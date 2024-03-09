import { pluginBundle } from '@freesewing/plugin-bundle'
import { pctBasedOn } from '@freesewing/core'
import { skirtBase as wandaSkirtBase } from '@freesewing/wanda'

export const skirtBase = {
  name: 'scarlett.skirtBase',
  options: {
    //Imported
    ...wandaSkirtBase.options,
    //Constants
    cbSaWidth: 0.01, //Locked for Scarlett
    frontDart: 'seam', //Locked for Scarlett
    umbrellaExtenstion: 1 / 16, //Locked for Scarlett
    //Style
    crotchDrop: { pct: 2, min: 0, max: 15, menu: 'style' },
    skirtStyle: { dflt: 'straight', list: ['straight', 'bell', 'umbrella'], menu: 'style' },
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
    crossSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    inseamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    //Advanced
    crossSeamCuvre: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
    crotchSeamCuvre: { pct: (2 / 3) * 100, min: 33.3, max: 100, menu: 'advanced' },
  },
  measurements: [
    ...wandaSkirtBase.measurements,
    'crossSeam',
    'crossSeamFront',
    'waistToSeat',
    'waistToUpperLeg',
  ],
  optionalMeasurements: [...wandaSkirtBase.optionalMeasurements],
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
    const crossSeam = measurements.crossSeam - waistbandWidth * 2
    const crossSeamFront = measurements.crossSeamFront - waistbandWidth
    const crossSeamBack = crossSeam - crossSeamFront
    const toSeat = measurements.waistToSeat - waistbandWidth
    const toUpperLeg = measurements.waistToUpperLeg * (1 + options.crotchDrop) - waistbandWidth
    const skirtHemFacingWidth = store.get('skirtHemFacingWidth')
    //let's begin
    //crotch
    points.cfSeat = points.cfWaist.shiftTowards(points.cfHem, toSeat)
    points.cfCrotch = points.cfWaist.shiftTowards(points.cfHem, toUpperLeg)

    let crotchTweak = 1
    let crotchDelta
    do {
      points.crotch = points.cfCrotch.shift(0, measurements.waist * crotchTweak)
      points.crotchCp2 = points.crotch.shiftFractionTowards(
        points.cfCrotch,
        options.crotchSeamCuvre
      )
      points.cfWaistCp1 = points.cfSeat.shiftFractionTowards(
        points.cfCrotch,
        options.crotchSeamCuvre
      )
      paths.crotchCurve = new Path()
        .move(points.crotch)
        .curve(points.crotchCp2, points.cfWaistCp1, points.cfWaist)
        .hide()

      crotchDelta = paths.crotchCurve.length() - crossSeamFront
      if (crotchDelta > 0) crotchTweak = crotchTweak * 0.99
      else crotchTweak = crotchTweak * 1.01
    } while (Math.abs(crotchDelta) > 1)

    points.crotchHem = new Point(points.crotch.x, points.cfHem.y)

    const inseam = points.crotch.dist(points.crotchHem)
    //cross straight
    points.seatK = points.waist3LeftS.shiftTowards(points.hemK, toSeat)
    points.crossK = points.waist3LeftS.shiftTowards(points.hemK, toUpperLeg)

    let crossTweak = 1
    let crossDelta
    do {
      points.crossS = points.crossK
        .shiftTowards(points.origin, measurements.waist * crossTweak)
        .rotate(90, points.crossK)
      points.crossSCp1 = points.crossS.shiftFractionTowards(points.crossK, options.crossSeamCuvre)
      points.waist3LeftCp2 = points.seatK.shiftFractionTowards(
        points.crossK,
        options.crossSeamCuvre
      )
      paths.crossCurveS = new Path()
        .move(points.waist3LeftS)
        .curve(points.waist3LeftCp2, points.crossSCp1, points.crossS)
        .hide()

      crossDelta = paths.crossCurveS.length() - crossSeamBack
      if (crossDelta > 0) crossTweak = crossTweak * 0.99
      else crossTweak = crossTweak * 1.01
    } while (Math.abs(crossDelta) > 1)

    const crossDepth = points.crossK.dist(points.crossS)

    //cross bell
    points.seatL = points.waistL.shiftTowards(points.hemL, toSeat)
    points.crossL = points.waistL.shiftTowards(points.hemL, toUpperLeg)
    points.crossB = points.crossL.shiftTowards(points.waistL, crossDepth).rotate(90, points.crossL)
    points.crossBCp1 = points.crossB.shiftFractionTowards(points.crossL, options.crossSeamCuvre)
    points.waistLCp2 = points.seatL.shiftFractionTowards(points.crossL, options.crossSeamCuvre)

    //cross unmbrella
    points.seatM = points.waistH.shiftTowards(points.hemM, toSeat)
    points.crossM = points.waistH.shiftTowards(points.hemM, toUpperLeg)
    points.crossU = points.crossM.shiftTowards(points.waistH, crossDepth).rotate(90, points.crossM)
    points.crossUCp1 = points.crossU.shiftFractionTowards(points.crossM, options.crossSeamCuvre)
    points.waistMCp2 = points.seatM.shiftFractionTowards(points.crossM, options.crossSeamCuvre)

    //hem straight
    points.crossHemS = points.crossS.shiftTowards(points.crossK, inseam).rotate(-90, points.crossS)
    points.hemKS = points.waist3LeftS.shiftOutwards(points.crossK, inseam)
    points.hemKCp2S = utils.beamsIntersect(
      points.crossHemS,
      points.hemKS,
      points.hemKCp2,
      points.hemK.rotate(90, points.hemKCp2)
    )

    //hem bell
    points.crossHemB = points.crossB.shiftTowards(points.crossL, inseam).rotate(-90, points.crossB)
    points.hemLB = points.waistL.shiftOutwards(points.crossL, inseam)
    points.hemLCp2B = utils.beamsIntersect(
      points.crossHemB,
      points.hemLB,
      points.hemLCp2,
      points.hemLCp2.shift(points.waistL.angle(points.hemL), 1)
    )

    //hem umbrella
    points.crossHemU = points.crossU.shiftTowards(points.crossM, inseam).rotate(-90, points.crossU)
    points.hemMU = points.waistH.shiftOutwards(points.crossM, inseam)
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
      .curve(points.crotchCp2, points.cfWaistCp1, points.cfWaist)

    paths.crossStaight = new Path()
      .move(points.waist3LeftS)
      .curve(points.waist3LeftCp2, points.crossSCp1, points.crossS)
      .line(points.crossHemS)
      .line(points.hemKS)
      .curve(points.hemKCp2S, points.hemFCp1, points.hemF)

    paths.crossBell = new Path()
      .move(points.waistL)
      .curve(points.waistLCp2, points.crossBCp1, points.crossB)
      .line(points.crossHemB)
      .line(points.hemLB)
      .curve(points.hemLCp2B, points.hemKCp1B, points.hemK)

    paths.crossUmbrella = new Path()
      .move(points.waistH)
      .curve(points.waistMCp2, points.crossUCp1, points.crossU)
      .line(points.crossHemU)
      .line(points.hemMU)
      .curve(points.hemMCp2U, points.hemKCp1U, points.hemK)

    paths.bellHem.attr('class', 'various')
    paths.umbrellaHem.attr('class', 'various')
    paths.umbrellaHemGuide.attr('class', 'various')

    return part
  },
}
