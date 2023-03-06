export const spreadSleeveBoth = ({
  store,
  sa,
  points,
  Point,
  Path,
  paths,
  complete,
  paperless,
  macro,
  part,
  options,
  snippets,
  Snippet,
  utils,
}) => {
  //removing any paths from sleeveBase. This may not be necessary but is useful when working with the guides on.
  for (let i in paths) delete paths[i]
  //measurements
  let spreadAngle = store.get('spreadAngle')
  let sleeveCapFraction = store.get('sleeveCapFraction')
  let sleeveLength = store.get('sleeveLength')

  paths.removelater = new Path()
    .move(points.bicepsLeft)
    .line(points.bottomLeft)
    .line(points.capQ4Bottom)
    .line(points.capQ3Bottom)
    .line(points.sleeveTipBottom)
    .line(points.capQ2Bottom)
    .line(points.capQ1Bottom)
    .line(points.bottomRight)
    .line(points.bicepsRight)
    .line(points.capQ1)
    .line(points.capQ2)
    .line(points.sleeveTip)
    .line(points.capQ3)
    .line(points.capQ4)
    .line(points.bicepsLeft)

  return part
}
