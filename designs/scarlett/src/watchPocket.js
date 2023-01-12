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
let pocketWidth
let pocketDepth
if (options.scalePockets){
	//pocketWidth = measurements.waist * 1 / 8
	//pocketDepth = measurements.waist * 5 / 48	
	pocketWidth = measurements.waistToFloor * 3 / 40
	pocketDepth = measurements.waistToFloor * 1 / 16
}
else {
	pocketWidth = 76.2
	pocketDepth = 63.5
}
//let's begin
//scaffold
points.topLeft = new Point(0, 0)
points.topRight = points.topLeft.shift(0, pocketWidth)
points.bottomLeft = points.topLeft.shift(-90, pocketDepth)
points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
//cps
points.bottomMid = points.bottomLeft.shiftFractionTowards(points.bottomRight, 0.5)
points.curveStart = points.topLeft.shiftFractionTowards(points.bottomLeft, 1 / 3)
points.curveEnd = points.curveStart.flipX(points.bottomMid)
points.cp1 = points.curveStart.shiftFractionTowards(points.bottomLeft, 0.5)
points.cp2 = points.bottomMid.shiftFractionTowards(points.bottomLeft, 0.75)
points.cp3 = points.cp2.flipX(points.bottomMid)
points.cp4 = points.cp1.flipX(points.bottomMid)

paths.hemBase = new Path()
.move(points.topRight)
.line(points.topLeft)
.setRender(false)

paths.saBase = new Path()
.move(points.topLeft)
.line(points.curveStart)
.curve(points.cp1, points.cp2, points.bottomMid)
.curve(points.cp3, points.cp4, points.curveEnd)
.line(points.topRight)
.setRender(false)

paths.seam = paths.hemBase.clone().join(paths.saBase).close()

if (complete) {
//grainline
points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
points.grainlineTo = points.bottomMid
macro("grainline", {
  from: points.grainlineFrom,
  to: points.grainlineTo,
});
//title
points.title = points.curveStart.shiftFractionTowards(points.curveEnd, 0.15)
macro("title", {
  at: points.title,
  nr: 'X',
  title: 'Watch Pocket',
  scale: 1 / 3,
});
    if (sa) {
	paths.sa = paths.hemBase.offset(sa * 2).join(paths.saBase.offset(sa)).close().attr('class', 'fabric sa')
    }
    if (paperless) {
  
    }
  }

  return part
}
