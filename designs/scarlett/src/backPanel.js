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
//set render
if (options.style == 'straight') {
    part.render = false
    return part
  }
//delete paths
for (let i in paths) delete paths[i]
//measures
let facingWidth = store.get('facingWidth')
//let's begin
//split for bell
if (options.style == 'bell'){
	paths.bellWaist = new Path()
	.move(points.waist6B)
	.curve(points.waist6Cp1B, points.waist6Cp2B, points.waistEndB)
	.setRender(false)
	
let waistSplit = paths.bellWaist.split(points.waistL);
for (let i in waistSplit) {
  paths['bellWaist' + i] = waistSplit[i]
  .setRender(false)
}
}

//draw guides
  const drawHem = () => {
    if (options.style == 'bell')
		return new Path()
	.move(points.crossBHem)
	.line(points.hemL)
	.curve(points.hemLCp2, points.hemKCp1B, points.hemK)
	if (options.style == 'umbrella')
		return new Path()
	.move(points.crossUHem)
	.line(points.hemM)
	.curve(points.hemMCp2, points.hemKCp1U, points.hemK)
  }

  const drawSaBase = () => {
	if (options.style == 'bell')
		return new Path()
	.move(points.hemK)
	.line(points.waist6B)
	.join(paths.bellWaist0)
	.curve(points.seatL, points.crossBCp1, points.crossB)
	.line(points.crossBHem)
	if (options.style == 'umbrella')
		return new Path()
	.move(points.hemK)
	.line(points.waist6)
	.curve(points.waist6Cp1, points.waistHCp2, points.waistH)
	.curve(points.seatM, points.crossUCp1, points.crossU)
	.line(points.crossUHem)
  }

//paths
paths.seam = drawHem().join(drawSaBase()).close()

if (complete) {
//facings
		let cross
		let crossHem
		let hemCurveStart
		if (options.style == 'bell'){
			cross = points.crossB
			crossHem = points.crossBHem
			hemCurveStart = points.hemL
		}
		if (options.style == 'umbrella'){
			cross = points.crossU
			crossHem = points.crossUHem
			hemCurveStart = points.hemM	
		}
		points.pivot = crossHem.shiftTowards(hemCurveStart, facingWidth).rotate(90, crossHem)
		points.split = utils.beamsIntersect(cross, crossHem, points.pivot, crossHem.rotate(90, points.pivot))
	
	if (options.facings){	
		let facingSplit = drawHem().offset(-facingWidth).split(points.split);
		for (let i in facingSplit) {
		paths['facing' + i] = facingSplit[i]
		.setRender(false)
	}
		
		paths.facing = paths.facing1.attr('class', 'interfacing').attr('data-text', 'Facing - Line').attr('data-text-class','center').setRender(true)
	}
//grainline
points.grainlineFrom = points.waist6.shiftFractionTowards(points.hemK, 0.05)
points.grainlineTo = points.hemK.shiftFractionTowards(points.waist6, 0.05)
macro("grainline", {
  from: points.waist6.rotate(90, points.grainlineFrom),
  to: points.hemK.rotate(-90, points.grainlineTo),
});
//notches
let crossNotch
if (options.style == 'bell') crossNotch = points.crossNotchB
else crossNotch = points.crossNotchU	
snippets.crossNotch = new Snippet('bnotch', crossNotch)
//title
points.title = points.waist6.shiftFractionTowards(points.hemL, 0.5)
macro("title", {
  at: points.title,
  nr: 'X',
  title: 'Back Panel',
});
    if (sa) {
	paths.sa = drawHem().offset(sa * options.hemWidth * 100).join(drawSaBase().offset(sa)).close().attr('class','fabric sa')
	if (options.facings){
		paths.facingSa = new Path()
		.move(points.hemK)
		.line(paths.facing.end())
		.join(paths.facing.reverse())
		.line(crossHem)
		.offset(sa)
		.join(drawHem().offset(sa * options.hemWidth * 100))
		.close()
		.attr('class', 'interfacing sa')		
	}
    }
    if (paperless) {
  
    }
  }

  return part
}
