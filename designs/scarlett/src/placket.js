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
let width = measurements.waist * options.placketWidth
let length = measurements.waistToFloor * options.placketLength
//let's begin
points.topLeft = new Point(0, 0)
points.topRight = points.topLeft.shift(0, width)
points.bottomLeft = points.topLeft.shift(-90, length)
points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

paths.seam = new Path()
.move(points.topLeft)
.line(points.bottomLeft)
.line(points.bottomRight)
.line(points.topRight)
.line(points.topLeft)
.close()

//stores
store.set('placketWidth', width)

if (complete) {
//grainline
points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 2 / 3)
points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
macro("grainline", {
  from: points.grainlineFrom,
  to: points.grainlineTo,
});
//title
points.title = points.topLeft.shiftFractionTowards(points.bottomLeft, 0.5).shift(0, width * 0.1)
macro("title", {
  at: points.title,
  nr: 'X',
  title: 'Placket',
  scale: 0.25,
});
    if (sa) {
paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
    }
    if (paperless) {
  
    }
  }

  return part
}
