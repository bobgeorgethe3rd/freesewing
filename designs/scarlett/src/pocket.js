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
let pocketDepth = store.get('pocketDepth')
let pocketDepthR = store.get('pocketDepthR')
let pocketWidth = store.get('pocketWidth')
let pocketWidthT = store.get('pocketWidthT')
//let's begin
//scaffold
points.topLeft = new Point(0, 0)
points.topRight = points.topLeft.shift(0, pocketWidth)
points.bottomLeft = points.topLeft.shift(-90, pocketDepth)
points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

//rest of points
points.openingTop = points.topLeft.shiftTowards(points.topRight, pocketWidthT)
points.openingBottom = points.bottomRight.shiftTowards(points.topRight, pocketDepthR)
//paths
paths.hemBase = new Path()
.move(points.topLeft)
.line(points.bottomLeft)
.line(points.bottomRight)
.line(points.openingBottom)
.setRender(false)

paths.saBase = new Path()
.move(points.openingBottom)
.line(points.openingTop)
.line(points.topLeft)
.setRender(false)

paths.seam = paths.hemBase.clone().join(paths.saBase).close()

if (complete) {
//facings
points.facingLeft = points.topLeft.shiftFractionTowards(points.bottomLeft, options.pocketFacingDepth)
points.facingRight = new Point(points.topRight.x, points.facingLeft.y)
paths.facing = new Path()
.move(points.facingLeft)
.line(points.facingRight)
.attr('class','interfacing')
.attr('data-text','Facing - line')
.attr('data-text-class','center')
//grainline
points.cutOnFoldFrom = points.topLeft
points.cutOnFoldTo = points.bottomLeft
macro('cutonfold', {
  from: points.cutOnFoldFrom,
  to: points.cutOnFoldTo,
  grainline: true
})
//notches
macro('sprinkle', {
  snippet: 'notch',
  on: ['openingTop', 'openingBottom',]
})
//title
points.title = new Point(points.openingTop.x, points.bottomLeft.y * (3 / 4))
macro("title", {
  at: points.title,
  nr: 'X',
  title: 'Pocket',
});
    if (sa) {
	paths.sa = paths.hemBase.offset(sa * options.pocketHemWidth * 100).join(paths.saBase.offset(sa)).close().attr('class', 'fabric sa')
    }
    if (paperless) {
  
    }
  }

  return part
}
