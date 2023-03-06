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

  return part
}
