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
//paths
paths.hemBase = new Path()
.move(points.hemE)
.curve(points.hemECp2, points.hemDCp1, points.hemD)
.setRender(false)

paths.saBase = new Path()
.move(points.hemD)
.line(points.dartTipD)
.curve(points.dartTipDCp2, points.dartTipDCp3, points.waist1Right)
.curve(points.waist1Cp1, points.waist1Cp2, points.waistPanel1)
.curve(points.waist1Cp3, points.waist1Cp4, points.waist1Left)
.curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
.line(points.hemE)
.setRender(false)

paths.seam = paths.hemBase.clone().join(paths.saBase).close()

if (complete) {
//facings
	if (options.facings){
	paths.facing = paths.hemBase.offset(-facingWidth).attr('class', 'interfacing').attr('data-text', 'Facing - Line').attr('data-text-class','center')
}
//grainline
points.grainlineFrom = points.dartTipD.shiftFractionTowards(points.hemD, 1 / 24)
points.grainlineTo = points.hemD.shiftFractionTowards(points.dartTipD, 1 / 24)
macro("grainline", {
  from: points.dartTipD.rotate(90, points.grainlineFrom),
  to: points.hemD.rotate(-90, points.grainlineTo),
});
//notches
macro('sprinkle', {
  snippet: 'notch',
  on: ['pocketOpeningTopRight', 'pocketOpeningBottom',]
})
//title
points.title = points.dartTipE.shiftFractionTowards(points.hemE, 0.5)
macro("title", {
  at: points.title.shiftFractionTowards(points.dartTipD, 0.15).rotate(-90, points.title),
  nr: 'X',
  title: 'Side Front',
});
    if (sa) {
	paths.sa = paths.hemBase.offset(sa * options.hemWidth * 100).join(paths.saBase.offset(sa)).close().attr('class','fabric sa')
	if (options.facings){
		paths.facingSa = new Path()
		.move(points.hemD)
		.line(paths.facing.end())
		.join(paths.facing.reverse())
		.line(points.hemE)
		.offset(sa)
		.join(paths.hemBase.offset(sa * options.hemWidth * 100))
		.close()
		.attr('class', 'interfacing sa')
	}
    }
    if (paperless) {
  
    }
  }

  return part
}
