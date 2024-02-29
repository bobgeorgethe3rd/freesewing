import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const skirtBase = {
  name: 'wanda.skirtBase',
  options: {
    //Constants
    closureSaWidth: 0.01,
    cpFraction: 0.55191502449,
    fullDress: false, //This allows for the skirtBase to be extended out and used for Diagram 77, "The Full Dress Skirt" Fallon
    sidePanelFullness: 3 / 8, //This is changed to an optional optional for 50% to 75% for Diagram 77, "The Full Dress Skirt" Fallon
    sideSeamSaWidth: 0.01,
    sideWaistFront: 4, //just in case we want a different size side front panel
    useVoidStores: false, //locked for Wanda
    //Fit
    waistEase: { pct: 0, min: -10, max: 10, menu: 'fit' },
    wandaGuides: { bool: false, menu: 'fit' },
    //Style
    pleatNumber: { count: 3, min: 1, max: 10, menu: 'style' },
    pleats: { bool: true, menu: 'style' },
    skirtLengthBonus: { pct: -2, min: -30, max: 10, menu: 'style' },
    style: { dflt: 'bell', list: ['straight', 'bell', 'umbrella'], menu: 'style' },
    umbrellaExtenstion: { pct: (1 / 16) * 100, min: 6, max: 10, menu: 'style' },
    umbrellaFullness: { pct: (5 / 12) * 100, min: 40, max: 50, menu: 'style' },
    waistbandStyle: {
      dflt: 'straight',
      list: ['straight', 'curved', 'none'],
      menu: 'style',
    },
    waistbandWidth: {
      pct: 1.25,
      min: 1,
      max: 8,
      snap: 3.175,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    //Darts
    dartExtension: { pct: 0.75, min: 0.5, max: 1, menu: 'darts' },
    dartLength: { pct: (9 / 80) * 100, min: (1 / 10) * 100, max: (3 / 20) * 100, menu: 'darts' },
    frontDartWidth: {
      pct: (1 / 24) * 100,
      min: (1 / 32) * 100,
      max: (5 / 96) * 100,
      menu: 'darts',
    },
    hipDartWidth: { pct: (5 / 96) * 100, min: (1 / 32) * 100, max: (1 / 16) * 100, menu: 'darts' },
    sideDartWidth: { pct: (1 / 24) * 100, min: (1 / 32) * 100, max: (5 / 96) * 100, menu: 'darts' },
    //Construction
    cbSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    closurePosition: {
      dflt: 'back',
      list: ['back', 'sideLeft', 'sideRight', 'front'],
      menu: 'construction',
    },
    frontDart: { dflt: 'dart', list: ['seam', 'dart'], menu: 'construction' },
    sideDart: { dflt: 'dart', list: ['seam', 'dart'], menu: 'construction' },
    skirtHemFacings: { bool: true, menu: 'construction' },
    skirtHemFacingWidth: { pct: (11 / 40) * 100, min: 20, max: 35, menu: 'construction' },
    skirtHemWidth: { pct: 2, min: 0, max: 10, menu: 'construction' },
    skirtWaistFacingWidth: { pct: 25, min: 0, max: 50, menu: 'construction' },
    waistFacingHemWidth: { pct: 2, min: 1, max: 10, menu: 'construction' },
    //Advanced
    calculateWaistbandDiff: { bool: false, menu: 'advanced.fit' },
  },
  measurements: ['waist', 'waistToFloor'],
  optionalMeasurements: ['hips', 'waistToHips'],
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
    log,
  }) => {
    //measures
    let waistbandWidth
    if (options.waistbandStyle != 'none') {
      waistbandWidth = absoluteOptions.waistbandWidth
    } else {
      waistbandWidth = 0
    }

    //storedWaist
    if (
      options.waistbandStyle != 'none' &&
      (options.calculateWaistbandDiff || options.waistbandStyle == 'curved') &&
      measurements.waistToHips &&
      measurements.hips
    ) {
      void store.setIfUnset(
        'storedWaist',
        measurements.waist * (1 + options.waistEase) +
          (waistbandWidth * (measurements.hips - measurements.waist) * (1 + options.waistEase)) /
            measurements.waistToHips
      )
      log.info('Calculate waistband difference for circumference')
    } else {
      void store.setIfUnset('storedWaist', measurements.waist * (1 + options.waistEase))
    }

    //measures cont.
    const fullWaist = store.get('storedWaist')
    const waist = fullWaist / 2
    const frontLength = measurements.waistToFloor * (1 + options.skirtLengthBonus) - waistbandWidth
    const frontDart = measurements.waist * options.frontDartWidth
    const sideDart = measurements.waist * options.sideDartWidth
    const hipDart = measurements.waist * options.hipDartWidth
    const dartLength = measurements.waistToFloor * options.dartLength
    const backFullness = measurements.waist * options.umbrellaFullness
    const umbrellaExtenstion = measurements.waist * options.umbrellaExtenstion
    const skirtWaistFacingWidth = dartLength * (1 + options.skirtWaistFacingWidth)
    const skirtHemFacingWidth = measurements.waistToFloor * options.skirtHemFacingWidth

    //let's begin
    //centre front
    points.origin = new Point(0, 0)
    points.cfWaist = points.origin.shift(-90, fullWaist)
    points.cfHem = points.origin.shiftOutwards(points.cfWaist, frontLength)

    //waist guide
    points.waistEnd = points.origin.shift(180, fullWaist)
    points.waistCorner = new Point(points.waistEnd.x, points.cfWaist.y)
    points.waistCp1 = points.cfWaist.shiftFractionTowards(points.waistCorner, options.cpFraction)
    points.waistCp2 = points.waistEnd.shiftFractionTowards(points.waistCorner, options.cpFraction)

    //hem guide
    points.hemEnd = points.origin.shiftOutwards(points.waistEnd, frontLength)
    points.hemCorner = new Point(points.hemEnd.x, points.cfHem.y)
    points.hemCp1 = points.cfHem.shiftFractionTowards(points.hemCorner, options.cpFraction)
    points.hemCp2 = points.hemEnd.shiftFractionTowards(points.hemCorner, options.cpFraction)

    //front darts
    const sideWaistFront = waist / options.sideWaistFront

    let sideWaist
    if (options.fullDress) sideWaist = waist / 3
    else sideWaist = waist / 4

    // points.waist1 = paths.waistGuide.shiftAlong(waist / 4)
    // points.waist2 = paths.waistGuide.shiftAlong(waist / 4 + frontDart)
    // points.waist3 = paths.waistGuide.shiftAlong(waist / 2 + frontDart)
    // points.waist0 = paths.waistGuide.shiftAlong(waist / 2 + frontDart + sideDart)
    // points.waist4 = paths.waistGuide.shiftAlong(waist / 2 + waist2 + frontDart + sideDart)
    // points.waist5 = paths.waistGuide.shiftAlong(waist / 2 + waist2 + frontDart + sideDart + hipDart)
    // points.waistD = paths.waistGuide.shiftAlong(waist / 4 + frontDart / 2)
    // points.waistE = paths.waistGuide.shiftAlong(waist / 2 + frontDart + sideDart / 2)
    // points.waistF = paths.waistGuide.shiftAlong(
    // waist / 2 + waist2 + frontDart + sideDart + hipDart / 2
    // )

    const radius = points.origin.dist(points.cfWaist)
    const angleCFFront = utils.rad2deg(waist / 4 / radius)
    const angleFrontDart = utils.rad2deg(frontDart / radius)
    const angleSideFront = utils.rad2deg(sideWaistFront / radius)
    const angleSideDart = utils.rad2deg(sideDart / radius)
    const angleSide = utils.rad2deg(sideWaist / radius)
    const angleHipDart = utils.rad2deg(hipDart / radius)

    points.waist1 = points.cfWaist.rotate(-angleCFFront, points.origin)
    points.waist2 = points.waist1.rotate(-angleFrontDart, points.origin)
    points.waist3 = points.waist2.rotate(-angleSideFront, points.origin)
    points.waist0 = points.waist3.rotate(-angleSideDart, points.origin)
    points.waist4 = points.waist0.rotate(-angleSide, points.origin)
    points.waist5 = points.waist4.rotate(-angleHipDart, points.origin)
    points.waistD = points.waist1.rotate(angleFrontDart / -2, points.origin)
    points.waistE = points.waist3.rotate(angleSideDart / -2, points.origin)
    points.waistF = points.waist4.rotate(angleHipDart / -2, points.origin)

    // points.waistPanel0 = paths.waistGuide.shiftAlong(waist / 8)
    // points.waistPanel1 = paths.waistGuide.shiftAlong(waist * (3 / 8) + frontDart)
    // points.waistPanel2 = paths.waistGuide.shiftAlong(waist / 2 + sideWaist / 2 + frontDart + sideDart)

    points.waistPanel0 = points.cfWaist.rotate(angleCFFront / -2, points.origin)
    points.waistPanel1 = points.waist2.rotate(angleSideFront / -2, points.origin)
    points.waistPanel2 = points.waist0.rotate(angleSide / -2, points.origin)

    points.hemD = points.origin.shiftOutwards(points.waistD, frontLength)
    points.hemE = points.origin.shiftOutwards(points.waistE, frontLength)
    points.hemF = points.origin.shiftOutwards(points.waistF, frontLength)
    points.dartTipD = points.origin.shiftOutwards(points.waistD, dartLength)
    points.dartTipE = points.origin.shiftOutwards(points.waistE, dartLength)
    points.dartTipF = points.origin.shiftOutwards(points.waistF, dartLength)
    points.waist0LeftCp2 = points.dartTipD
      .shiftFractionTowards(points.waist1, 2 / 3)
      .rotate(5, points.dartTipD)
    points.dartTipDCp = points.dartTipD.shiftFractionTowards(points.waistD, 1 / 4)
    points.waist1RightCp1 = points.dartTipD
      .shiftFractionTowards(points.waist2, 2 / 3)
      .rotate(-5, points.dartTipD)
    points.waist1LeftCp2 = points.dartTipE
      .shiftFractionTowards(points.waist3, 2 / 3)
      .rotate(5, points.dartTipE)
    points.dartTipECp = points.dartTipE.shiftFractionTowards(points.waistE, 1 / 4)
    points.waist2RightCp1 = points.dartTipE
      .shiftFractionTowards(points.waist0, 2 / 3)
      .rotate(-5, points.dartTipE)
    points.waist2LeftCp2 = points.dartTipF
      .shiftFractionTowards(points.waist4, 2 / 3)
      .rotate(5, points.dartTipF)
    points.dartTipFCp = points.dartTipF.shiftFractionTowards(points.waistF, 1 / 4)
    points.waist3RightCp1 = points.dartTipF
      .shiftFractionTowards(points.waist5, 2 / 3)
      .rotate(-5, points.dartTipF)

    if (options.fullDress) {
      points.waistG = points.waistF.shiftTowards(
        points.origin.rotate(90, points.waistF),
        fullWaist * options.sidePanelFullness - hipDart / 2
      )
    } else {
      points.waistG = points.waistF.shiftTowards(
        points.origin.rotate(90, points.waistF),
        fullWaist * options.sidePanelFullness + hipDart / 2
      )
    }
    points.hemUTarget = points.waistG.shift(points.waistE.angle(points.dartTipE), frontLength * 2)
    points.hemU = utils.lineIntersectsCurve(
      points.waistG,
      points.hemUTarget,
      points.cfHem,
      points.hemCp1,
      points.hemCp2,
      points.hemEnd
    )
    points.hemKTarget = points.origin.shiftOutwards(points.waistG, frontLength * 2)
    points.hemK = utils.lineIntersectsCurve(
      points.origin,
      points.hemKTarget,
      points.cfHem,
      points.hemCp1,
      points.hemCp2,
      points.hemEnd
    )

    points.waistA = points.origin.shiftFractionTowards(points.cfWaist, 0.5)
    points.hemLTarget = points.waistA.shift(180, points.origin.dist(points.cfHem) * 1.25)
    points.hemL = utils.lineIntersectsCurve(
      points.waistA,
      points.hemLTarget,
      points.cfHem,
      points.hemCp1,
      points.hemCp2,
      points.hemEnd
    )

    points.waist3LeftS = points.waistG.shiftTowards(points.origin, fullWaist / 24)
    points.waist6 = utils.lineIntersectsCurve(
      points.origin,
      points.waistG,
      points.cfWaist,
      points.waistCp1,
      points.waistCp2,
      points.waistEnd
    )
    points.waist6B = points.waist6.shiftFractionTowards(points.waist3LeftS, 0.5)
    points.waistEndB = points.waistEnd.shift(180, points.waist6.dist(points.waist3LeftS))

    //shaping front panel waist
    const dartExtension = measurements.waistToFloor * options.dartExtension
    const waistFrontCpDistance =
      (4 / 3) *
      points.origin.dist(points.cfWaist) *
      Math.tan(utils.deg2rad((270 - points.origin.angle(points.waist1)) / 8))

    points.cfWaistCp2 = points.cfWaist
      .shiftTowards(points.origin, waistFrontCpDistance)
      .rotate(90, points.cfWaist)
    points.waistPanel0Cp1 = points.waistPanel0
      .shiftTowards(points.origin, waistFrontCpDistance)
      .rotate(-90, points.waistPanel0)
    points.waistPanel0Cp2 = points.waistPanel0
      .shiftTowards(points.origin, waistFrontCpDistance)
      .rotate(90, points.waistPanel0)
    points.waist0Left = points.waist1
      .shiftTowards(points.origin, dartExtension)
      .rotate(-5, points.waist1)
    points.waist0LeftCp1 = points.waist0Left
      .shiftTowards(points.waist0LeftCp2, waistFrontCpDistance)
      .rotate(90, points.waist0Left)

    const sideWaistFrontCpDistance =
      (4 / 3) *
      points.origin.dist(points.waist2) *
      Math.tan(
        utils.deg2rad((points.origin.angle(points.waist2) - points.origin.angle(points.waist3)) / 8)
      )

    points.waist1Right = points.waist2
      .shiftTowards(points.origin, dartExtension)
      .rotate(5, points.waist2)
    points.waist1RightCp2 = points.waist1Right
      .shiftTowards(points.waist1RightCp1, sideWaistFrontCpDistance)
      .rotate(-90, points.waist1Right)
    points.waistPanel1Cp1 = points.waistPanel1
      .shiftTowards(points.origin, sideWaistFrontCpDistance)
      .rotate(-90, points.waistPanel1)
    points.waistPanel1Cp2 = points.waistPanel1
      .shiftTowards(points.origin, sideWaistFrontCpDistance)
      .rotate(90, points.waistPanel1)
    points.waist1Left = points.waist3
      .shiftTowards(points.origin, dartExtension)
      .rotate(-5, points.waist3)
    points.waist1LeftCp1 = points.waist1Left
      .shiftTowards(points.waist1LeftCp2, sideWaistFrontCpDistance)
      .rotate(90, points.waist1Left)

    //shaping side panel
    const sideWaistCpDistance0 =
      (4 / 3) *
      points.origin.dist(points.waist0) *
      Math.tan(
        utils.deg2rad((points.origin.angle(points.waist0) - points.origin.angle(points.waist4)) / 8)
      )

    points.waist2Right = points.waist0
      .shiftTowards(points.origin, dartExtension)
      .rotate(5, points.waist0)
    points.waist2RightCp2 = points.waist2Right
      .shiftTowards(points.waist2RightCp1, sideWaistCpDistance0)
      .rotate(-90, points.waist2Right)
    points.waistPanel2Cp1 = points.waistPanel2
      .shiftTowards(points.origin, sideWaistCpDistance0)
      .rotate(-90, points.waistPanel2)
    points.waistPanel2Cp2 = points.waistPanel2
      .shiftTowards(points.origin, sideWaistCpDistance0)
      .rotate(90, points.waistPanel2)
    points.waist2Left = points.waist4
      .shiftTowards(points.origin, dartExtension)
      .rotate(-5, points.waist4)
    points.waist2LeftCp1 = points.waist2Left
      .shiftTowards(points.waist2LeftCp2, sideWaistCpDistance0)
      .rotate(90, points.waist2Left)

    const sideWaistCpDistance1 =
      (4 / 3) *
      points.origin.dist(points.waist5) *
      Math.tan(
        utils.deg2rad((points.origin.angle(points.waist5) - points.origin.angle(points.waist6)) / 8)
      )

    points.waist3Right = points.waist5
      .shiftTowards(points.origin, dartExtension)
      .rotate(5, points.waist5)
    points.waist3RightCp2 = points.waist3Right
      .shiftTowards(points.waist3RightCp1, sideWaistCpDistance1)
      .rotate(-90, points.waist3Right)
    points.waist3LeftCp1 = points.waist3LeftS
      .shiftTowards(points.origin, sideWaistCpDistance1)
      .rotate(-90, points.waist3LeftS)
    points.waist3LeftCp1B = points.waist6B
      .shiftTowards(points.origin, sideWaistCpDistance1)
      .rotate(-90, points.waist6B)
    points.waist3LeftCp1U = points.waist6
      .shiftTowards(points.origin, sideWaistCpDistance1)
      .rotate(-90, points.waist6)

    //back panel shaping
    if (!options.fullDress) {
      points.waist6Cp2B = points.waist3LeftCp1B.rotate(180, points.waist6B)
      points.waistEndCp2B = utils.beamsIntersect(
        points.waistEndB,
        points.waistEndB.shift(-90, 1),
        points.waist6B,
        points.waist6Cp2B
      )
      points.waistL = utils.lineIntersectsCurve(
        points.waistA,
        points.hemL,
        points.waist6B,
        points.waist6Cp2B,
        points.waistEndCp2B,
        points.waistEndB
      )
    }
    //Ok time for some hem control points
    //front panels
    const frontHemCpDistance =
      (4 / 3) *
      points.origin.dist(points.cfHem) *
      Math.tan(utils.deg2rad((270 - points.origin.angle(points.hemD)) / 4))

    points.hemECp2 = points.hemE
      .shiftTowards(points.origin, frontHemCpDistance)
      .rotate(-90, points.hemE)
    points.hemDCp1 = points.hemD
      .shiftTowards(points.origin, frontHemCpDistance)
      .rotate(90, points.hemD)
    points.hemDCp2 = points.hemD
      .shiftTowards(points.origin, frontHemCpDistance)
      .rotate(-90, points.hemD)
    points.cfHemCp1 = points.cfHem
      .shiftTowards(points.origin, frontHemCpDistance)
      .rotate(90, points.cfHem)

    //side panels
    let sideHemCpDistanceA
    if (options.fullDress)
      sideHemCpDistanceA =
        (4 / 3) *
        points.origin.dist(points.hemE) *
        Math.tan(
          utils.deg2rad((points.origin.angle(points.hemE) - points.origin.angle(points.hemF)) / 4)
        )
    else sideHemCpDistanceA = frontHemCpDistance
    const sideHemCpDistanceB =
      (4 / 3) *
      points.origin.dist(points.hemF) *
      Math.tan(
        utils.deg2rad((points.origin.angle(points.hemF) - points.origin.angle(points.hemK)) / 4)
      )

    points.hemKCp2 = points.hemK
      .shiftTowards(points.origin, sideHemCpDistanceB)
      .rotate(-90, points.hemK)
    points.hemFCp1 = points.hemF
      .shiftTowards(points.origin, sideHemCpDistanceB)
      .rotate(90, points.hemF)
    points.hemFCp2 = points.hemF
      .shiftTowards(points.origin, sideHemCpDistanceA)
      .rotate(-90, points.hemF)
    points.hemECp1 = points.hemE
      .shiftTowards(points.origin, sideHemCpDistanceA)
      .rotate(90, points.hemE)

    if (!options.fullDress) {
      //bell skirt
      const bellBackHemCpDistance =
        (4 / 3) *
        points.origin.dist(points.hemK) *
        Math.tan(
          utils.deg2rad((points.origin.angle(points.hemK) - points.origin.angle(points.hemL)) / 4)
        )

      points.hemLCp2 = points.hemL
        .shiftTowards(points.origin, bellBackHemCpDistance)
        .rotate(-90, points.hemL)
      points.hemKCp1B = points.hemK
        .shiftTowards(points.origin, bellBackHemCpDistance)
        .rotate(90, points.hemK)

      //umbrella skirt
      const umbrellaHemGuideCpDistance =
        (4 / 3) *
        points.origin.dist(points.hemL) *
        Math.tan(utils.deg2rad((points.origin.angle(points.hemL) - 180) / 4))

      points.hemEndCp2 = points.hemEnd
        .shiftTowards(points.origin, umbrellaHemGuideCpDistance)
        .rotate(-90, points.hemEnd)
      points.hemLCp1 = points.hemL
        .shiftTowards(points.origin, umbrellaHemGuideCpDistance)
        .rotate(90, points.hemL)

      paths.umbrellaHemGuide = new Path()
        .move(points.hemL)
        .curve(points.hemLCp1, points.hemEndCp2, points.hemEnd)

      points.hemM = paths.umbrellaHemGuide.shiftAlong(backFullness)
      points.hemN = points.waistA.shiftOutwards(points.hemM, umbrellaExtenstion)
      points.hemNCp2 = utils.beamsIntersect(
        points.hemK,
        points.origin.rotate(90, points.hemK),
        points.hemN,
        points.hemN.shift(-90, 1)
      )
      points.hemKCp1U = points.hemK.shiftFractionTowards(points.hemNCp2, 0.1)

      points.waistH = utils.lineIntersectsCurve(
        points.hemM,
        points.waistA,
        points.cfWaist,
        points.waistCp1,
        points.waistCp2,
        points.waistEnd
      )

      const umbrellaWaistGuideCpDistance =
        (4 / 3) *
        points.origin.dist(points.waist6) *
        Math.tan(
          utils.deg2rad(
            (points.origin.angle(points.waist6) - points.origin.angle(points.waistH)) / 4
          )
        )

      points.waist6Cp2 = points.waist6
        .shiftTowards(points.origin, umbrellaWaistGuideCpDistance)
        .rotate(90, points.waist6)
      points.waistHCp1 = points.waistH
        .shiftTowards(points.origin, umbrellaWaistGuideCpDistance)
        .rotate(-90, points.waistH)
    }
    //facings
    if (options.waistbandStyle == 'none') {
      points.cfWaistFacing = points.cfWaist.shiftTowards(points.cfHem, skirtWaistFacingWidth)
      points.waistFacingD = points.waistD.shiftTowards(points.dartTipD, skirtWaistFacingWidth)
      points.waistFacingE = points.waistE.shiftTowards(points.dartTipE, skirtWaistFacingWidth)
      points.waistFacingF = points.waistF.shiftTowards(points.dartTipF, skirtWaistFacingWidth)
      points.waistFacing6S = points.waist3LeftS.shiftTowards(points.hemK, skirtWaistFacingWidth)
      points.waistFacing6B = points.waist6B.shiftTowards(points.hemK, skirtWaistFacingWidth)
      points.waistFacing6U = points.waist6.shiftTowards(points.hemK, skirtWaistFacingWidth)

      const sideWaistFrontFacingCpDistance =
        (4 / 3) *
        points.origin.dist(points.waistFacingD) *
        Math.tan(
          utils.deg2rad(
            (points.origin.angle(points.waistFacingD) - points.origin.angle(points.waistFacingE)) /
              4
          )
        )
      const sideWaistFacingCpDistance =
        (4 / 3) *
        points.origin.dist(points.waistFacingF) *
        Math.tan(
          utils.deg2rad(
            (points.origin.angle(points.waistF) - points.origin.angle(points.waist6)) / 8
          )
        )

      points.waistFacing6SCp2 = points.waistFacing6S
        .shiftTowards(points.origin, sideWaistFacingCpDistance)
        .rotate(-90, points.waistFacing6S)
      points.waistFacing6BCp2 = points.waistFacing6B
        .shiftTowards(points.origin, sideWaistFacingCpDistance)
        .rotate(-90, points.waistFacing6B)
      points.waistFacing6UCp2 = points.waistFacing6U
        .shiftTowards(points.origin, sideWaistFacingCpDistance)
        .rotate(-90, points.waistFacing6U)
      points.waistFacingFCp1 = points.waistFacingF
        .shiftTowards(points.origin, sideWaistFacingCpDistance)
        .rotate(90, points.waistFacingF)

      points.waistFacingECp2 = points.waistFacingE
        .shiftTowards(points.origin, sideWaistFrontFacingCpDistance)
        .rotate(-90, points.waistFacingE)
      points.waistFacingDCp1 = points.waistFacingD
        .shiftTowards(points.origin, sideWaistFrontFacingCpDistance)
        .rotate(90, points.waistFacingD)

      // paths.sideWaistFacingS = new Path()
      // .move(points.waistFacing6S)
      // .curve(points.waistFacing6SCp2, points.waistFacingFCp1, points.waistFacingF)

      // paths.sideWaistFacingB = new Path()
      // .move(points.waistFacing6B)
      // .curve(points.waistFacing6BCp2, points.waistFacingFCp1, points.waistFacingF)

      // paths.sideWaistFacingU = new Path()
      // .move(points.waistFacing6U)
      // .curve(points.waistFacing6UCp2, points.waistFacingFCp1, points.waistFacingF)
    }

    if (options.skirtHemFacings) {
      points.hemFacingK = points.hemK.shiftTowards(points.origin, skirtHemFacingWidth)
      points.hemFacingF = points.hemF.shiftTowards(points.origin, skirtHemFacingWidth)
      points.hemFacingE = points.hemE.shiftTowards(points.origin, skirtHemFacingWidth)
      points.hemFacingD = points.hemD.shiftTowards(points.origin, skirtHemFacingWidth)
      points.hemFacingDCp2 = utils.beamsIntersect(
        points.hemDCp1,
        points.origin,
        points.hemFacingD,
        points.origin.rotate(90, points.hemFacingD)
      )
      points.hemFacingECp1 = utils.beamsIntersect(
        points.hemECp2,
        points.origin,
        points.hemFacingE,
        points.origin.rotate(-90, points.hemFacingE)
      )
      points.hemFacingFCp2 = utils.beamsIntersect(
        points.hemFCp1,
        points.origin,
        points.hemFacingF,
        points.origin.rotate(90, points.hemFacingF)
      )
      points.hemFacingKCp1 = utils.beamsIntersect(
        points.hemKCp2,
        points.origin,
        points.hemFacingK,
        points.origin.rotate(-90, points.hemFacingK)
      )
    }
    //adding dart tops for seam paths
    points.dartTopD = utils.beamsIntersect(
      points.waist0LeftCp1,
      points.waist0Left,
      points.waist1RightCp2,
      points.waist1Right
    )
    points.dartTopE = utils.beamsIntersect(
      points.waist1LeftCp1,
      points.waist1Left,
      points.waist2RightCp2,
      points.waist2Right
    )
    points.dartTopF = utils.beamsIntersect(
      points.waist2LeftCp1,
      points.waist2Left,
      points.waist3RightCp2,
      points.waist3Right
    )

    //pleats
    if (options.pleats && !options.fullDress) {
      //needed for pleating
      paths.straightCurve = new Path()
        .move(points.waist3Right)
        .curve(points.waist3RightCp2, points.waist3LeftCp1, points.waist3LeftS)

      paths.bellCurve = new Path()
        .move(points.waist3Right)
        .curve(points.waist3RightCp2, points.waist3LeftCp1B, points.waist6B)
        .curve(points.waist6Cp2B, points.waistEndCp2B, points.waistEndB)

      paths.umbrellaCurve = new Path()
        .move(points.waist3Right)
        .curve(points.waist3RightCp2, points.waist3LeftCp1U, points.waist6)
        .curve(points.waist6Cp2, points.waistHCp1, points.waistH)

      const pleatTo = waist - waist / 4 - sideWaistFront - sideWaist
      const pleatFromStraight = paths.straightCurve.length()

      paths.bellWaist = new Path()
        .move(points.waist3Right)
        .curve(points.waist3RightCp2, points.waist3LeftCp1B, points.waist6B)
        .curve(points.waist6Cp2B, points.waistEndCp2B, points.waistEndB)
        .split(points.waistL)[0]
        .hide()

      const pleatFromBell = paths.bellWaist.length()
      const pleatFromUmbrella = paths.umbrellaCurve.length()

      const pleatKeep = pleatTo / (options.pleatNumber + 1)
      const pleatLengthStraight = (pleatFromStraight - pleatTo) / options.pleatNumber
      const pleatLengthBell = (pleatFromBell - pleatTo) / options.pleatNumber
      const pleatLengthUmbrella = (pleatFromUmbrella - pleatTo) / options.pleatNumber
      const pleatLineLength = frontLength / 15

      for (let i = 0; i < options.pleatNumber + 1; i++) {
        points['pleatFromTopS' + i] = paths.straightCurve.shiftAlong(
          pleatKeep + (pleatKeep + pleatLengthStraight) * i
        )
        points['pleatToTopS' + i] = paths.straightCurve.shiftAlong(
          (pleatKeep + pleatLengthStraight) * i
        )

        points['pleatFromBottomS' + i] = points['pleatFromTopS' + i]
          .shiftTowards(points['pleatToTopS' + i], pleatLineLength)
          .rotate(-90, points['pleatFromTopS' + i])
        points['pleatToBottomS' + i] = points['pleatToTopS' + i]
          .shiftTowards(points['pleatFromTopS' + i], pleatLineLength)
          .rotate(90, points['pleatToTopS' + i])

        points['pleatFromTopB' + i] = paths.bellWaist.shiftAlong(
          pleatKeep + (pleatKeep + pleatLengthBell) * i
        )
        points['pleatToTopB' + i] = paths.bellWaist.shiftAlong((pleatKeep + pleatLengthBell) * i)

        points['pleatFromBottomB' + i] = points['pleatFromTopB' + i]
          .shiftTowards(points['pleatToTopB' + i], pleatLineLength)
          .rotate(-90, points['pleatFromTopB' + i])
        points['pleatToBottomB' + i] = points['pleatToTopB' + i]
          .shiftTowards(points['pleatFromTopB' + i], pleatLineLength)
          .rotate(90, points['pleatToTopB' + i])

        points['pleatFromTopU' + i] = paths.umbrellaCurve.shiftAlong(
          pleatKeep + (pleatKeep + pleatLengthUmbrella) * i
        )
        points['pleatToTopU' + i] = paths.umbrellaCurve.shiftAlong(
          (pleatKeep + pleatLengthUmbrella) * i
        )

        points['pleatFromBottomU' + i] = points['pleatFromTopU' + i]
          .shiftTowards(points['pleatToTopU' + i], pleatLineLength)
          .rotate(-90, points['pleatFromTopU' + i])
        points['pleatToBottomU' + i] = points['pleatToTopU' + i]
          .shiftTowards(points['pleatFromTopU' + i], pleatLineLength)
          .rotate(90, points['pleatToTopU' + i])
      }

      //guide Uncomment to see pleats

      for (let i = 0; i < options.pleatNumber; i++) {
        paths['pleatFromS' + i] = new Path()
          .move(points['pleatFromTopS' + i])
          .line(points['pleatFromBottomS' + i])
          .attr('class', 'fabric lashed')

        paths['pleatToS' + i] = new Path()
          .move(points['pleatToTopS' + (i + 1)])
          .line(points['pleatToBottomS' + (i + 1)])

        paths['pleatFromB' + i] = new Path()
          .move(points['pleatFromTopB' + i])
          .line(points['pleatFromBottomB' + i])
          .attr('class', 'fabric lashed')

        paths['pleatToB' + i] = new Path()
          .move(points['pleatToTopB' + (i + 1)])
          .line(points['pleatToBottomB' + (i + 1)])

        paths['pleatFromU' + i] = new Path()
          .move(points['pleatFromTopU' + i])
          .line(points['pleatFromBottomU' + i])
          .attr('class', 'fabric lashed')

        paths['pleatToU' + i] = new Path()
          .move(points['pleatToTopU' + (i + 1)])
          .line(points['pleatToBottomU' + (i + 1)])
      }

      store.set('pleatKeep', pleatKeep)
      store.set('pleatLengthStraight', pleatLengthStraight)
      store.set('pleatLengthBell', pleatLengthBell)
      store.set('pleatLengthUmbrella', pleatLengthUmbrella)
    }

    //stores
    store.set('fullWaist', fullWaist)
    store.set('frontLength', frontLength)
    store.set('skirtHemFacingWidth', skirtHemFacingWidth)

    store.set('waistbandWidth', waistbandWidth)
    store.set('waistbandLength', fullWaist)
    store.set('waistbandLengthTop', measurements.waist * (1 + options.waistEase))
    store.set('maxButtons', 1)

    store.set('anchorSeamLength', fullWaist / 2)
    store.set('insertSeamLength', measurements.waistToFloor)
    //wanda guides
    paths.wandaGuide = new Path()
      .move(points.cfHem)
      .curve(points.hemCp1, points.hemCp2, points.hemEnd)
      .offset(skirtHemFacingWidth)
      .move(points.cfWaist)
      .curve(points.waistCp1, points.waistCp2, points.waistEnd)
      .move(points.cfHem)
      .curve(points.hemCp1, points.hemCp2, points.hemEnd)
      .move(points.origin)
      .line(points.cfHem)
      .move(points.origin)
      .line(points.hemD)
      .move(points.origin)
      .line(points.hemE)
      .move(points.origin)
      .line(points.hemF)
      .move(points.origin)
      .line(points.hemK)
      .attr('class', 'various')

    if (!options.fullDress) {
      paths.wandaGuide
        .move(points.waistA)
        .line(points.hemL)
        .move(points.waistA)
        .line(points.hemN)
        .move(points.hemK)
        .curve(points.hemKCp1U, points.hemNCp2, points.hemN)

      //needed for Scarlett
      paths.umbrellaHem = new Path()
        .move(points.hemK)
        .curve(points.hemKCp1U, points.hemNCp2, points.hemN)
    }

    if (complete && sa) {
      const closureSa = sa * options.closureSaWidth * 100

      let cfSa = sa * options.cfSaWidth * 100
      if (options.closurePosition == 'front') {
        cfSa = closureSa
      }

      let cbSa = sa * options.cbSaWidth * 100
      if (options.closurePosition == 'back') {
        cbSa = closureSa
      }

      let sideSeamSa = sa * options.sideSeamSaWidth * 100
      if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
        sideSeamSa = closureSa
      }

      let hemSa = sa * options.skirtHemWidth * 100
      if (options.skirtHemFacings) {
        hemSa = sa
      }

      points.saCfHem = points.cfHem.translate(cfSa, hemSa)
      points.saCfWaist = points.cfWaist.translate(cfSa, -sa)
      points.saWaist1Left = points.waist1Left
        .shift(points.waist1LeftCp2.angle(points.waist1Left), sa)
        .shift(points.waist1LeftCp1.angle(points.waist1Left), sideSeamSa)

      points.saHemE = points.hemE
        .shift(points.dartTipE.angle(points.hemE), hemSa)
        .shift(points.hemECp2.angle(points.hemE), sideSeamSa)
    }
    //Uncomment to see how the scaffolding. Helpful if re-working please keep.
    paths.cfWaist = new Path()
      .move(points.cfWaist)
      .curve(points.cfWaistCp2, points.waistPanel0Cp1, points.waistPanel0)
      .curve(points.waistPanel0Cp2, points.waist0LeftCp1, points.waist0Left)

    paths.sideWaistFront = new Path()
      .move(points.waist1Right)
      .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
      .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)

    paths.sideWaist0 = new Path()
      .move(points.waist2Right)
      .curve(points.waist2RightCp2, points.waistPanel2Cp1, points.waistPanel2)
      .curve(points.waistPanel2Cp2, points.waist2LeftCp1, points.waist2Left)

    paths.dartD = new Path()
      .move(points.waist0Left)
      .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
      .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)

    paths.dartE = new Path()
      .move(points.waist1Left)
      .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
      .curve(points.dartTipECp, points.waist2RightCp1, points.waist2Right)

    paths.dartF = new Path()
      .move(points.waist2Left)
      .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
      .curve(points.dartTipFCp, points.waist3RightCp1, points.waist3Right)

    paths.frontHem = new Path()
      .move(points.hemE)
      .curve(points.hemECp2, points.hemDCp1, points.hemD)
      .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)

    paths.sideHem = new Path()
      .move(points.hemK)
      .curve(points.hemKCp2, points.hemFCp1, points.hemF)
      .curve(points.hemFCp2, points.hemECp1, points.hemE)

    if (!options.fullDress) {
      paths.skirtLines = new Path()
        .move(points.waistA)
        .line(points.hemL)
        .move(points.waistA)
        .line(points.hemN)
        .move(points.waistG)
        .line(points.hemU)
        .attr('class', 'fabric help')

      paths.bellHem = new Path()
        .move(points.hemL)
        .curve(points.hemLCp2, points.hemKCp1B, points.hemK)
    }
    paths.fullHemFacingGuide = new Path()
      .move(points.cfHem)
      .curve(points.hemCp1, points.hemCp2, points.hemEnd)
      .offset(skirtHemFacingWidth)
      .attr('class', 'interfacing')
    //Angle checker
    // points.waistPanel0.attr('data-text', points.origin.angle(points.cfWaist) - points.origin.angle(points.waist1))
    // points.waistPanel1.attr('data-text', points.origin.angle(points.waist2) - points.origin.angle(points.waist3))
    // points.waistPanel2.attr('data-text', points.origin.angle(points.waist0) - points.origin.angle(points.waist4))

    return part
  },
}
