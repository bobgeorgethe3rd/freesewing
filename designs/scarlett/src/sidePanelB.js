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
if (options.sideDart == 'dart') {
    part.render = false
    return part
  }
//delete paths
for (let i in paths) delete paths[i]
//measures
let facingWidth = store.get('facingWidth')
//let's begin
//draw guides
  const drawHem = () => {
    if (options.style == 'straight')
		return new Path()
	.move(points.crossSHem)
	.line(points.hemK)
	.curve(points.hemKCp2, points.hemFCp1, points.hemF)
	else
		return new Path()
	.move(points.hemK)
	.curve(points.hemKCp2, points.hemFCp1, points.hemF)
  }

  const drawSaBase = () => {
    if (options.style == 'straight')
		return new Path()
	.move(points.hemF)
	.line(points.dartTipF)
	.curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
	.curve(points.waist3Cp1, points.waist3Cp2, points.waist3LeftS)
	.curve(points.seatK, points.crossSCp1, points.crossS)
	.line(points.crossSHem)
	if (options.style == 'bell')
		return new Path()
	.move(points.hemF)
	.line(points.dartTipF)
	.curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
	.curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
	.line(points.hemK)
	if (options.style == 'umbrella')
		return new Path()
	.move(points.hemF)
	.line(points.dartTipF)
	.curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
	.curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
	.line(points.hemK)
  }

//paths
paths.seam = drawHem().join(drawSaBase()).close()

if (complete) {
//facings
	if (options.facings){
		paths.facing = drawHem().offset(-facingWidth).attr('class', 'interfacing').attr('data-text', 'Facing - Line').attr('data-text-class','center')
	}
//grainline
points.grainlineFrom = points.dartTipF.shiftFractionTowards(points.hemF, 0.05)
points.grainlineTo = points.hemF.shiftFractionTowards(points.dartTipF, 0.05)
macro("grainline", {
  from: points.dartTipF.rotate(90, points.grainlineFrom),
  to: points.hemF.rotate(-90, points.grainlineTo),
});
//notches
if (options.style == 'straight') snippets.crossNotch = new Snippet('bnotch', points.crossNotchS)
//title
let titleName
if (options.style == 'straight') titleName = 'Back Panel B'
else titleName = 'Side Panel B'
points.title = points.dartTipF.shiftFractionTowards(points.hemKCp2, 0.5)
macro("title", {
  at: points.title,
  nr: 'X',
  title: titleName,
});
    if (sa) {
	paths.sa = drawHem().offset(sa * options.hemWidth * 100).join(drawSaBase().offset(sa)).close().attr('class','fabric sa')
	if (options.facings){
		paths.facingSa = new Path()
		.move(points.hemF)
		.line(paths.facing.end())
		.join(paths.facing.reverse())
		.line(points.hemK)
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
