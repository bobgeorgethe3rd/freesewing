export const draftRectangle = (
  part,
  xDist,
  yDist,
  midPoints = true,
  prefix,
  offsetX = 0,
  offsetY = 0
) => {
  const { Point, points, Path } = part.shorthand()

  let prefixFunction
  if (prefix) {
    prefixFunction = (string) => prefix + string.charAt(0).toUpperCase() + string.slice(1)
  } else {
    prefixFunction = (string) => string
  }

  points[prefixFunction('origin')] = new Point(0 + offsetX, 0 + offsetY)

  points[prefixFunction('topLeft')] = points[prefixFunction('origin')].translate(
    xDist * -0.5,
    yDist * -0.5
  )
  points[prefixFunction('bottomLeft')] = points[prefixFunction('topLeft')].flipY(
    points[prefixFunction('origin')]
  )
  points[prefixFunction('bottomRight')] = points[prefixFunction('bottomLeft')].flipX(
    points[prefixFunction('origin')]
  )
  points[prefixFunction('topRight')] = points[prefixFunction('bottomRight')].flipY(
    points[prefixFunction('origin')]
  )

  if (midPoints) {
    points[prefixFunction('top')] = new Point(
      points[prefixFunction('origin')].x,
      points[prefixFunction('topLeft')].y
    )
    points[prefixFunction('left')] = new Point(
      points[prefixFunction('topLeft')].x,
      points[prefixFunction('origin')].y
    )
    points[prefixFunction('bottom')] = new Point(
      points[prefixFunction('origin')].x,
      points[prefixFunction('bottomLeft')].y
    )
    points[prefixFunction('right')] = new Point(
      points[prefixFunction('topRight')].x,
      points[prefixFunction('origin')].y
    )
  }

  return new Path()
    .move(points[prefixFunction('topLeft')])
    .line(points[prefixFunction('bottomLeft')])
    .line(points[prefixFunction('bottomRight')])
    .line(points[prefixFunction('topRight')])
    .line(points[prefixFunction('topLeft')])
    .close()
}
