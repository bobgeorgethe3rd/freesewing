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
//measures
let crossSeamFront = (measurements.crossSeamFront * (1 + options.crotchDrop)) - absoluteOptions.waistbandWidth
let crossSeam = (measurements.crossSeam * (1 + options.crotchDrop)) - (absoluteOptions.waistbandWidth * 2)
let crossSeamBack = crossSeam - crossSeamFront
let facingWidth = store.get('facingWidth')
let crossTarget = crossSeamBack //if whatever reason it needs to be different it can be.
let toSeat = measurements.waistToSeat - absoluteOptions.waistbandWidth
let toUpperLeg = measurements.waistToUpperLeg - absoluteOptions.waistbandWidth

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
	.setRender(false)
	
	crotchDelta = paths.crotchCurve.length() - crotchTarget
  if (crotchDelta > 0) crotchTweak = crotchTweak * 0.99
  else crotchTweak = crotchTweak * 1.01
} while (Math.abs(crotchDelta) > 1)

points.crotchHem = new Point(points.crotch.x, points.cfHem.y)

//cross straight
points.seatK = points.waist3LeftS.shiftTowards(points.hemK, toSeat)
points.upperLegK = points.waist3LeftS.shiftTowards(points.hemK, toUpperLeg)

let crossTweak = 1
let crossDelta
do {
	points.crossS = points.upperLegK.shiftTowards(points.origin, measurements.waist * crossTweak).rotate(90, points.upperLegK)
	points.crossSCp1 = points.crossS.shiftFractionTowards(points.upperLegK, options.crossCuvre)
	paths.crossCurveS = new Path()
	.move(points.waist3LeftS)
	.curve(points.seatK, points.crossSCp1, points.crossS)
	//.setRender(false)
	
	crossDelta = paths.crossCurveS.length() - crossTarget
  if (crossDelta > 0) crossTweak = crossTweak * 0.99
  else crossTweak = crossTweak * 1.01
} while (Math.abs(crossDelta) > 1)

let crossDepth = points.upperLegK.dist(points.crossS)
points.crossSHem = utils.beamsIntersect(points.hemKCp2, points.hemK, points.crossS, points.upperLegK.rotate(-90, points.crossS))

//cross bell
points.seatL = points.waistL.shiftTowards(points.hemL, toSeat)
points.upperLegL = points.waistL.shiftTowards(points.hemL, toUpperLeg)
points.crossB = points.upperLegL.shiftTowards(points.waistL, crossDepth).rotate(90, points.upperLegL)
points.crossBCp1 = points.crossB.shiftFractionTowards(points.upperLegL, options.crossCuvre)
points.crossBHem = utils.beamsIntersect(points.hemLCp2, points.hemL, points.crossB, points.upperLegL.rotate(-90, points.crossB))

//cross unmbrella
points.seatM = points.waistH.shiftTowards(points.hemM, toSeat)
points.upperLegM = points.waistH.shiftTowards(points.hemM, toUpperLeg)
points.crossU = points.upperLegM.shiftTowards(points.waistH, crossDepth).rotate(90, points.upperLegM)
points.crossUCp1 = points.crossU.shiftFractionTowards(points.upperLegM, options.crossCuvre)

let umbrellaHemCpDistance = (4 / 3) * points.origin.dist(points.hemK) * Math.tan(utils.deg2rad((points.origin.angle(points.hemK) - points.origin.angle(points.hemM)) / 4))

points.hemMCp2 = points.hemM.shiftTowards(points.origin, umbrellaHemCpDistance).rotate(-90, points.hemM)
points.hemKCp1U = points.hemK.shiftTowards(points.origin, umbrellaHemCpDistance).rotate(90, points.hemK) //changed from Wanda

points.crossUHem = utils.beamsIntersect(points.hemMCp2, points.hemM, points.crossU, points.upperLegM.rotate(-90, points.crossU))
//notches
points.crotchNotch = paths.crotchCurve.shiftFractionAlong(0.5)
points.crossNotchS = paths.crossCurveS.shiftFractionAlong(0.5)
points.crossNotchB = new Path().move(points.waistL)	.curve(points.seatL, points.crossBCp1, points.crossB).shiftFractionAlong(0.5)
points.crossNotchU = new Path().move(points.waistH)	.curve(points.seatM, points.crossUCp1, points.crossU).shiftFractionAlong(0.5)

//guides
paths.crotchFront = new Path()
	.move(points.cfHem)
	.line(points.crotchHem)
	.line(points.crotch)
	.curve(points.crotchCp1, points.cfSeat, points.cfWaist)
	
paths.crossStaight = new Path()
	.move(points.waist3LeftS)
	.curve(points.seatK, points.crossSCp1, points.crossS)
	.line(points.crossSHem)
	.line(points.hemK)
	
paths.crossBell = new Path()
	.move(points.waistL)
	.curve(points.seatL, points.crossBCp1, points.crossB)
	.line(points.crossBHem)
	.line(points.hemL)

paths.crossUmbrella = new Path()
	.move(points.waistH)
	.curve(points.seatM, points.crossUCp1, points.crossU)
	.line(points.crossUHem)
	.line(points.hemM)
	.curve(points.hemMCp2, points.hemKCp1U, points.hemK)
	

//stores
store.set('frontWaistPanel', new Path()
.move(points.cfWaist)
.curve(points.waist0Cp1, points.waist0Cp2, points.waistPanel0)
.curve(points.waist0Cp3, points.waist0Cp4, points.waist0Left)
.length())

if (complete) {
    if (sa) {
	
    }
    if (paperless) {
  
    }
  }

  return part
}
