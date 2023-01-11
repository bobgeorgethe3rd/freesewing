export default function (part) {
    let {
      store,
      sa,
      Point,
      points,
      Path,
      paths,
      options,
      absoluteOptions,
      complete,
      paperless,
      macro,
      utils,
      measurements,
      snippets,
      Snippet,
    } = part.shorthand()
  let fullWaist = measurements.waist * (1 + options.waistEase) + ((absoluteOptions.waistbandWidth * (measurements.hips - measurements.waist) * (1 + options.waistEase)) / measurements.waistToHips)
  let waist = fullWaist / 2
  let frontLength = measurements.waistToFloor * (1 + options.lengthBonus) - absoluteOptions.waistbandWidth
  let frontDart = measurements.waist * options.frontDartWidth
  let sideDart = measurements.waist * options.sideDartWidth
  let hipDart = measurements.waist * options.hipDartWidth
  let dartLength = measurements.waistToFloor * options.dartLength
  let backFullness = measurements.waist * options.umbrellaFullness
  let umbrellaExtenstion = measurements.waist * options.umbrellaExtenstion
  let facingWidth = measurements.waistToFloor * options.facingWidth
  let pocketStart = measurements.waistToFloor * options.pocketStart
  let pocketDepth
  let pocketWidth
  if (!options.scalePockets){
      pocketDepth = 304.8
      pocketWidth = 186.27
  }
  else{
      pocketDepth = measurements.waistToFloor * options.pocketDepth
      pocketWidth = measurements.waist * options.pocketWidth
  }
  let pocketDepthR = pocketDepth * (3 / 4)
  let pocketWidthT = pocketWidth * (9 / 50)
  let pocketOpeningLength = Math.sqrt(Math.pow(pocketDepth - pocketDepthR, 2) + Math.pow(pocketWidth - pocketWidthT, 2))
  //centre front
  points.origin = new Point(0, 0)
  points.cfWaist = points.origin.shift(-90, fullWaist)
  points.cfHem = points.origin.shiftOutwards(points.cfWaist, frontLength)
  
  //waist guide
  points.waistEnd = points.origin.shift(180, fullWaist)
  points.waistCorner = new Point(points.waistEnd.x, points.cfWaist.y)
  points.waistCp1 = points.cfWaist.shiftFractionTowards(points.waistCorner, options.cpFraction)
  points.waistCp2 = points.waistEnd.shiftFractionTowards(points.waistCorner, options.cpFraction)
  paths.waistGuide = new Path()
  .move(points.cfWaist)
  .curve(points.waistCp1, points.waistCp2, points.waistEnd)
  .attr('class','various')
  //.setRender(false)
  
  //hem guide
  points.hemEnd = points.origin.shiftOutwards(points.waistEnd, frontLength)
  points.hemCorner = new Point(points.hemEnd.x, points.cfHem.y)
  points.hemCp1 = points.cfHem.shiftFractionTowards(points.hemCorner, options.cpFraction)
  points.hemCp2 = points.hemEnd.shiftFractionTowards(points.hemCorner, options.cpFraction)
  paths.hemGuide = new Path()
  .move(points.cfHem)
  .curve(points.hemCp1, points.hemCp2, points.hemEnd)
  .attr('class','various')
  .setRender(false)
  
  //front darts
  points.waist1 = paths.waistGuide.shiftAlong(waist / 4)
  points.waist2 = paths.waistGuide.shiftAlong(waist / 4 + frontDart)
  points.waist3 = paths.waistGuide.shiftAlong(waist / 2 + frontDart)
  points.waist0 = paths.waistGuide.shiftAlong(waist / 2 + frontDart + sideDart)
  let waist4
  if (options.fullDress) waist4 = waist / 3
  else waist4 = waist / 4
  points.waist4 = paths.waistGuide.shiftAlong(waist / 2 + waist4 + frontDart + sideDart)
  points.waist5 = paths.waistGuide.shiftAlong(waist / 2 + waist4 + frontDart + sideDart + hipDart)
  points.waistD = paths.waistGuide.shiftAlong(waist / 4 + frontDart / 2)
  points.waistE = paths.waistGuide.shiftAlong(waist / 2 + frontDart + sideDart / 2)
  points.waistF = paths.waistGuide.shiftAlong(waist / 2 + waist4 + frontDart + sideDart + hipDart / 2)
  points.hemD = points.origin.shiftOutwards(points.waistD, frontLength)
  points.hemE = points.origin.shiftOutwards(points.waistE, frontLength)
  points.hemF = points.origin.shiftOutwards(points.waistF, frontLength)
  points.dartTipD = points.origin.shiftOutwards(points.waistD, dartLength)
  points.dartTipE = points.origin.shiftOutwards(points.waistE, dartLength)
  points.dartTipF = points.origin.shiftOutwards(points.waistF, dartLength)
  points.dartTipDCp1 = points.dartTipD.shiftFractionTowards(points.waist1, 2 / 3).rotate(5, points.dartTipD)
  points.dartTipDCp2 = points.dartTipD.shiftFractionTowards(points.waistD, 1 / 20)
  points.dartTipDCp3 = points.dartTipD.shiftFractionTowards(points.waist2, 2 / 3).rotate(-5, points.dartTipD)
  points.dartTipECp1 = points.dartTipE.shiftFractionTowards(points.waist3, 2 / 3).rotate(5, points.dartTipE)
  points.dartTipECp2 = points.dartTipE.shiftFractionTowards(points.waistE, 1 / 20)
  points.dartTipECp3 = points.dartTipE.shiftFractionTowards(points.waist0, 2 / 3).rotate(-5, points.dartTipE)
  points.dartTipFCp1 = points.dartTipF.shiftFractionTowards(points.waist4, 2 / 3).rotate(5, points.dartTipF)
  points.dartTipFCp2 = points.dartTipF.shiftFractionTowards(points.waistF, 1 / 20)
  points.dartTipFCp3 = points.dartTipF.shiftFractionTowards(points.waist5, 2 / 3).rotate(-5, points.dartTipF)
  points.waistPanel0 = paths.waistGuide.shiftAlong(waist / 8)
  points.waistPanel1 = paths.waistGuide.shiftAlong(waist * (3 / 8) + frontDart)
  points.waistPanel2 = paths.waistGuide.shiftAlong(waist / 2 + waist4 / 2 + frontDart + sideDart)
  //shape cfpanel
  points.waistBeam0 = paths.waistGuide.shiftAlong(waist / 5)
  points.waistBeam0Target = points.waistBeam0.shift(points.waist1.angle(points.dartTipDCp1) - 90,1)
  points.waist0Left = utils.beamsIntersect(points.waistBeam0, points.waistBeam0Target, points.dartTipDCp1, points.waist1)
  points.waist0CpTarget = utils.beamsIntersect(points.waist0Left, points.waistBeam0, points.cfWaist, points.cfWaist.shift(180, 1))
  points.waist0Cp1 = points.cfWaist.shiftFractionTowards(points.waist0CpTarget, 1 / 3)
  points.waist0Cp2Target = points.dartTipDCp1.rotate(90, points.waist0Left)
  points.waist0Cp2 = utils.lineIntersectsCurve(points.waist0Left, points.waist0Cp2Target, points.cfWaist, points.waistCp1, points.waistCp2, points.waistEnd)
  points.waist0Cp1 = utils.beamsIntersect(points.cfWaist, points.cfWaist.shift(180, 1), points.waist0Cp2, points.waistPanel0)
  //shape panel 1
  let dartExtenstion = points.waist1.dist(points.waist0Left)
  points.waist1Right = points.dartTipDCp3.shiftOutwards(points.waist2, dartExtenstion)
  points.waist1Left = points.dartTipECp1.shiftOutwards(points.waist3, dartExtenstion)
  points.waist1Cp1Target = points.dartTipDCp3.rotate(-90, points.waist1Right)
  points.waist1Cp1 = utils.lineIntersectsCurve(points.waist1Right, points.waist1Cp1Target, points.cfWaist, points.waistCp1, points.waistCp2, points.waistEnd)
  points.waist1Cp2Target = points.dartTipECp1.rotate(90, points.waist1Left)
  points.waist1Cp2 = utils.lineIntersectsCurve(points.waist1Left, points.waist1Cp2Target, points.cfWaist, points.waistCp1, points.waistCp2, points.waistEnd)
  //shape panel 2
  points.waist2Right = points.dartTipECp3.shiftOutwards(points.waist0, dartExtenstion)
  points.waist2Left = points.dartTipFCp1.shiftOutwards(points.waist4, dartExtenstion)
  points.waist2Cp1Target = points.dartTipECp3.rotate(-90, points.waist2Right)
  points.waist2Cp1 = utils.lineIntersectsCurve(points.waist2Right, points.waist2Cp1Target, points.cfWaist, points.waistCp1, points.waistCp2, points.waistEnd)
  points.waist2Cp2Target = points.dartTipFCp1.rotate(90, points.waist2Left)
  points.waist2Cp2 = utils.lineIntersectsCurve(points.waist2Left, points.waist2Cp2Target, points.cfWaist, points.waistCp1, points.waistCp2, points.waistEnd)
  //shape panel 3
  points.waist3Right = points.dartTipFCp3.shiftOutwards(points.waist5, dartExtenstion)
  points.waist3LeftTarget = points.origin.rotate(90, points.waistF)
  points.waistG = points.waistF.shiftTowards(points.waist3LeftTarget, fullWaist * options.sidePanelFullness + hipDart / 2)
  points.waist3Cp1 = utils.beamsIntersect(points.waist3Right, points.dartTipFCp3.rotate(-90, points.waist3Right), points.waistG, points.waistF)
  points.hemUTarget = points.waistG.shiftOutwards(points.waistF, frontLength).rotate(-90, points.waistG)
  points.hemU = utils.lineIntersectsCurve(points.waistG, points.hemUTarget, points.cfHem, points.hemCp1, points.hemCp2, points.hemEnd)
  points.hemKTarget = points.origin.shiftOutwards(points.waistG, frontLength)
  points.hemK = utils.lineIntersectsCurve(points.origin, points.hemKTarget, points.cfHem, points.hemCp1, points.hemCp2, points.hemEnd)
  points.waist3LeftS = points.waistG.shiftTowards(points.origin, fullWaist / 24)
  points.waist3Cp2 = points.waistG.rotate(90, points.waist3LeftS)
  points.waistA = points.origin.shiftFractionTowards(points.cfWaist, 0.5)
  points.hemLTarget = points.waistA.shift(180, points.origin.dist(points.cfHem) * 1.25)
  points.hemL = utils.lineIntersectsCurve(points.waistA, points.hemLTarget, points.cfHem, points.hemCp1, points.hemCp2, points.hemEnd)
  
  //Ok time for some hem control points
  //front panels
  let frontHemCpDistance = (4 / 3) * points.origin.dist(points.cfHem) * Math.tan(utils.deg2rad((270 - points.origin.angle(points.hemD)) / 4))
  
  points.hemECp2 = points.hemE.shiftTowards(points.origin, frontHemCpDistance).rotate(-90, points.hemE)
  points.hemDCp1 = points.hemD.shiftTowards(points.origin, frontHemCpDistance).rotate(90, points.hemD)
  points.hemDCp2 = points.hemD.shiftTowards(points.origin, frontHemCpDistance).rotate(-90, points.hemD)
  points.cfHemCp1 = points.cfHem.shiftTowards(points.origin, frontHemCpDistance).rotate(90, points.cfHem)
  
  //side panels
  let sideHemCpDistanceA
  if (options.fullDress) sideHemCpDistanceA = (4 / 3) * points.origin.dist(points.hemE) * Math.tan(utils.deg2rad((points.origin.angle(points.hemE) - points.origin.angle(points.hemF)) / 4))
  else sideHemCpDistanceA = frontHemCpDistance
  let sideHemCpDistanceB = (4 / 3) * points.origin.dist(points.hemF) * Math.tan(utils.deg2rad((points.origin.angle(points.hemF) - points.origin.angle(points.hemK)) / 4))
  
  points.hemKCp2 = points.hemK.shiftTowards(points.origin, sideHemCpDistanceB).rotate(-90, points.hemK)
  points.hemFCp1 = points.hemF.shiftTowards(points.origin, sideHemCpDistanceB).rotate(90, points.hemF)
  points.hemFCp2 = points.hemF.shiftTowards(points.origin, sideHemCpDistanceA).rotate(-90, points.hemF)
  points.hemECp1 = points.hemE.shiftTowards(points.origin, sideHemCpDistanceA).rotate(90, points.hemE)
  
  //bell skirt
  let bellBackHemCpDistance = (4 / 3) * points.origin.dist(points.hemK) * Math.tan(utils.deg2rad((points.origin.angle(points.hemK) - points.origin.angle(points.hemL)) / 4))
  
  points.hemLCp2 = points.hemL.shiftTowards(points.origin, bellBackHemCpDistance).rotate(-90, points.hemL)
  points.hemKCp1B = points.hemK.shiftTowards(points.origin, bellBackHemCpDistance).rotate(90, points.hemK)
  
  points.waist6 = utils.lineIntersectsCurve(points.origin, points.waistG, points.cfWaist, points.waistCp1, points.waistCp2, points.waistEnd)
  points.waist6B = points.waist6.shiftFractionTowards(points.waist3LeftS, 0.5)
  points.waistEndB = points.waistEnd.shift(180, points.waist6.dist(points.waist3LeftS))
  points.waist3Cp2B = points.waist6B.shift(points.waist3LeftS.angle(points.waist3Cp2), points.waist3LeftS.dist(points.waist3Cp2))
  points.waist3Cp2U = points.waist6.shift(points.waist3LeftS.angle(points.waist3Cp2), points.waist3LeftS.dist(points.waist3Cp2))
  points.waist6Cp1B = points.waist3Cp2B.rotate(180, points.waist6B)
  points.waistCp2B = utils.beamsIntersect(points.waistEndB, points.waistEndB.shift(-90, 1), points.waist6B, points.waist6Cp1B)
  points.waistL = utils.lineIntersectsCurve(points.waistA, points.hemL, points.waist6B, points.waist6Cp1B, points.waistCp2B, points.waistEndB)
  //umbrella skirt
  let umbrellaHemGuideCpDistance = (4 / 3) * points.origin.dist(points.hemL) * Math.tan(utils.deg2rad((points.origin.angle(points.hemL) - 180) / 4))
  
  points.hemEndCp2 = points.hemEnd.shiftTowards(points.origin, umbrellaHemGuideCpDistance).rotate(-90, points.hemEnd)
  points.hemLCp1 = points.hemL.shiftTowards(points.origin, umbrellaHemGuideCpDistance).rotate(90, points.hemL)
  
  paths.umbrellaHemGuide = new Path()
  .move(points.hemL)
  .curve(points.hemLCp1, points.hemEndCp2, points.hemEnd)
  //.setRender(false)
  points.hemM = paths.umbrellaHemGuide.shiftAlong(backFullness)
  points.hemN = points.waistA.shiftOutwards(points.hemM, umbrellaExtenstion)
  points.hemNCp2 = utils.beamsIntersect(points.hemK, points.origin.rotate(90, points.hemK), points.hemN, points.hemN.shift(-90, 1))
  points.hemKCp1U = points.hemK.shiftFractionTowards(points.hemNCp2, 0.1)
  
  points.waistH = utils.lineIntersectsCurve(points.hemM, points.waistA, points.cfWaist, points.waistCp1, points.waistCp2, points.waistEnd)
  
  let umbrellaWaistGuideCpDistance = (4 / 3) * points.origin.dist(points.waist6) * Math.tan(utils.deg2rad((points.origin.angle(points.waist6) - points.origin.angle(points.waistH)) / 4))
  
  points.waist6Cp1 = points.waist6.shiftTowards(points.origin, umbrellaWaistGuideCpDistance).rotate(90, points.waist6)
  points.waistHCp2 = points.waistH.shiftTowards(points.origin, umbrellaWaistGuideCpDistance).rotate(-90, points.waistH)
  
  //facings
  points.facingK = points.hemK.shiftTowards(points.origin, facingWidth)
  points.facingKCp1B = points.hemKCp1B.shiftTowards(points.origin, facingWidth)
  points.facingLCp2 = points.hemLCp2.shiftTowards(points.origin, facingWidth)
  points.facingL = points.hemL.shiftTowards(points.origin, facingWidth)
  points.facingLCp1 = points.hemLCp1.shiftTowards(points.origin, facingWidth)
  points.facingEndCp2 = points.hemEndCp2.shiftTowards(points.origin, facingWidth)
  points.facingEnd = points.hemEnd.shiftTowards(points.origin, facingWidth)
  
  //adding dart tops for seam paths
  points.dartTopD = utils.beamsIntersect(points.waist0Cp2, points.waist0Left, points.waist1Cp1, points.waist1Right)
  points.dartTopE = utils.beamsIntersect(points.waist1Cp2, points.waist1Left, points.waist2Cp1, points.waist2Right)
  points.dartTopF = utils.beamsIntersect(points.waist2Cp2, points.waist2Left, points.waist3Cp1, points.waist3Right)
  //Uncomment to see how the scaffolding. Helpful if re-working please keep.
  
  paths.lineAN = new Path()
  .move(points.waistA)
  .line(points.hemN)
  .attr('class','fabric help')
  
  paths.bellCurve = new Path()
  .move(points.waist3Right)
  .curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
  .curve(points.waist6Cp1B, points.waistCp2B, points.waistEndB)
  
  paths.lineGU = new Path()
  .move(points.waistG)
  .line(points.hemU)
  .attr('class','fabric help')
  
  paths.lineAL = new Path()
  .move(points.waistA)
  .line(points.hemL)
  .attr('class','fabric help')
  
  paths.originLines = new Path()
  .move(points.cfHem)
  .line(points.origin)
  .line(points.hemD)
  .line(points.origin)
  .line(points.hemE)
  .line(points.origin)
  .line(points.hemF)
  .line(points.origin)
  .line(points.hemK)
  .attr('class','various')
  
  paths.dartGuide = new Path()
  .move(points.cfWaist)
  ._curve(points.waist0Cp1, points.waistPanel0)
  .curve_(points.waist0Cp2, points.waist0Left)
  .line(points.waist1)
  .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
  .curve(points.dartTipDCp2, points.dartTipDCp3, points.waist2)
  .line(points.waist1Right)
  ._curve(points.waist1Cp1, points.waistPanel1)
  .curve_(points.waist1Cp2, points.waist1Left)
  .line(points.waist3)
  .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
  .curve(points.dartTipECp2, points.dartTipECp3, points.waist0)
  .line(points.waist2Right)
  ._curve(points.waist2Cp1, points.waistPanel2)
  .curve_(points.waist2Cp2, points.waist2Left)
  .line(points.waist4)
  .curve(points.dartTipFCp1, points.dartTipFCp2, points.dartTipF)
  .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist5)
  .line(points.waist3Right)
  .curve(points.waist3Cp1, points.waist3Cp2, points.waist3LeftS)
  
  paths.umbrellaHem = new Path()
  .move(points.hemK)
  .curve(points.hemKCp1U, points.hemNCp2, points.hemN)
  
  paths.frontHem = new Path()
  .move(points.hemE)
  .curve(points.hemECp2, points.hemDCp1, points.hemD)
  .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
  
  paths.sideHem = new Path()
  .move(points.hemK)
  .curve(points.hemKCp2, points.hemFCp1, points.hemF)
  .curve(points.hemFCp2, points.hemECp1, points.hemE)
  
  paths.bellHem = new Path()
  .move(points.hemL)
  .curve(points.hemLCp2, points.hemKCp1B, points.hemK)
  
  paths.fullHemFacingGuide = paths.hemGuide.offset(facingWidth).attr('class','interfacing')
  //pocket notches
  paths.sideSeam = new Path()
  .move(points.waist1Left)
  .line(points.waist3)
  .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
  .line(points.hemE)
  .line(points.dartTipE)
  .curve(points.dartTipECp2, points.dartTipECp3, points.waist0)
  .line(points.waist2Right)
  .setRender(false)
  
  points.pocketOpeningTopRight = paths.sideSeam.shiftAlong(pocketStart)
  points.pocketOpeningTopLeft = paths.sideSeam.reverse().shiftAlong(pocketStart)
  points.pocketOpeningBottom = paths.sideSeam.reverse().shiftAlong(pocketStart + pocketOpeningLength)
  
  //stores
  store.set('fullWaist', fullWaist)
      store.set('frontLength', frontLength)
      store.set('facingWidth', facingWidth)
      store.set('pocketStart', pocketStart)
      store.set('pocketDepth', pocketDepth)
      store.set('pocketDepthR', pocketDepthR)
      store.set('pocketWidth', pocketWidth)
      store.set('pocketWidthT', pocketWidthT)
  
  if (complete) {
      if (sa) {
      
      }
      if (paperless) {
    
      }
    }
  
    return part
  }