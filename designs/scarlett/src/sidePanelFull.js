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
	.curve(points.hemFCp2, points.hemECp1, points.hemE)
	else
		return new Path()
	.move(points.hemK)
	.curve(points.hemKCp2, points.hemFCp1, points.hemF)
	.curve(points.hemFCp2, points.hemECp1, points.hemE)
  }

  const drawDartBase = () => {
    if (options.style == 'straight')
		return new Path()
	.move(points.hemE)
	.line(points.dartTipE)
	.curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
	.curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
	.curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
	.curve(points.dartTipFCp1, points.dartTipFCp2, points.dartTipF)
	.curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
	.curve(points.waist3Cp1, points.waist3Cp2, points.waist3LeftS)
	.curve(points.seatK, points.crossSCp1, points.crossS)
	.line(points.crossSHem)
	if (options.style == 'bell')
		return new Path()
	.move(points.hemE)
	.line(points.dartTipE)
	.curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
	.curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
	.curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
	.curve(points.dartTipFCp1, points.dartTipFCp2, points.dartTipF)
	.curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
	.curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
	.line(points.hemK)
	if (options.style == 'umbrella')
		return new Path()
	.move(points.hemE)
	.line(points.dartTipE)
	.curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
	.curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
	.curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
	.curve(points.dartTipFCp1, points.dartTipFCp2, points.dartTipF)
	.curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
	.curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
	.line(points.hemK)
  }

//paths
paths.seam = drawHem().join(drawDartBase()).close()

if (complete) {
//facings
	if (options.facings){
		paths.facing = drawHem().offset(-facingWidth).attr('class', 'interfacing').attr('data-text', 'Facing - Line').attr('data-text-class','center')
	}
//grainline
points.grainlineFrom = points.dartTipE.shiftFractionTowards(points.hemE, 0.05)
points.grainlineTo = points.hemE.shiftFractionTowards(points.dartTipE, 0.05)
macro("grainline", {
  from: points.dartTipE.rotate(90, points.grainlineFrom),
  to: points.hemE.rotate(-90, points.grainlineTo),
});
//notches
macro('sprinkle', {
  snippet: 'notch',
  on: ['pocketOpeningTopLeft', 'pocketOpeningBottom',]
})
if (options.style == 'straight') snippets.crossNotch = new Snippet('bnotch', points.crossNotchS)
//title
let titleName
if (options.style == 'straight') titleName = 'Back Panel'
else titleName = 'Side Panel'
points.title = points.waist6.shiftFractionTowards(points.hemF, 0.5)
macro("title", {
  at: points.title,
  nr: 'X',
  title: titleName,
});
    if (sa) {
	  const drawSaBase = () => {
    if (options.style == 'straight')
		return new Path()
	.move(points.hemE)
	.line(points.dartTipE)
	.curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
	.curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
	.curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
	.line(points.dartTopF)
	.line(points.waist3Right)
	.curve(points.waist3Cp1, points.waist3Cp2, points.waist3LeftS)
	.curve(points.seatK, points.crossSCp1, points.crossS)
	.line(points.crossSHem)
	if (options.style == 'bell')
		return new Path()
	.move(points.hemE)
	.line(points.dartTipE)
	.curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
	.curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
	.curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
	.line(points.dartTopF)
	.line(points.waist3Right)
	.curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
	.line(points.hemK)
	if (options.style == 'umbrella')
		return new Path()
	.move(points.hemE)
	.line(points.dartTipE)
	.curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
	.curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
	.curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
	.line(points.dartTopF)
	.line(points.waist3Right)
	.curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
	.line(points.hemK)
  }
	paths.sa = drawHem().offset(sa * options.hemWidth * 100).join(drawSaBase().offset(sa)).close().attr('class','fabric sa')
	if (options.facings){
		let hemStart
		if (options.style == 'straight') hemStart = points.crossSHem
		else hemStart = points.hemK
		paths.facingSa = new Path()
		.move(points.hemE)
		.line(paths.facing.end())
		.join(paths.facing.reverse())
		.line(hemStart)
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
