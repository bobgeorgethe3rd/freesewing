export default function (part) {
  let { measurements, options, sa, Point, points, Path, paths, complete, paperless, macro, store } =
    part.shorthand()

  let width = (measurements.hpsToWaistBack + measurements.waistToHips) * options.ribbingHeight * 2
  let length = (store.get('neckOpeningLenFront') + store.get('neckOpeningLenBack')) * (1 - options.ribbingStretch)

  points.topLeft = new Point(0, 0)
  points.bottomLeft = new Point(0, width)
  points.topRight = new Point(length * 2, 0)
  points.bottomRight = new Point(length * 2, width)

  paths.seam = new Path()
    .move(points.topLeft)
    .line(points.bottomLeft)
    .line(points.bottomRight)
    .line(points.topRight)
    .line(points.topLeft)
    .close()
    .attr('class', 'various')

  // Complete pattern?
  if (complete) {
    if (sa) {
      paths.sa = paths.seam.offset(sa).attr('class', 'various sa')
    }
    points.title = points.bottomLeft.shiftFractionTowards(points.topRight, 0.5)
    macro('title', { at: points.title, nr: 10, title: 'neckband' })
    macro('grainline', {
      from: points.bottomLeft.shift(0, 20),
      to: points.topLeft.shift(0, 20),
    })
	let j
      for (let i = 1; i < 4; i++) {
        j = i*0.25
points['bottomNotch'+i] = points.bottomLeft.shiftFractionTowards(points.bottomRight,j)
}
	let k
      for (let l = 1; l < 4; l++) {
        k = l*0.25
points['topNotch'+l] = points.topLeft.shiftFractionTowards(points.topRight,k)
}
macro('sprinkle', {
  snippet: 'notch',
  on: ['topNotch1','topNotch2','topNotch3','bottomNotch1','bottomNotch2','bottomNotch3']
})
  }

  // Paperless?
  if (paperless) {
    macro('vd', {
      from: points.bottomRight,
      to: points.topRight,
      x: points.topRight.x + sa + 15,
    })
    macro('hd', {
      from: points.bottomLeft,
      to: points.bottomRight,
      y: points.bottomRight.y + sa + 15,
    })
  }

  return part
}
