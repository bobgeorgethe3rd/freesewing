export const frontSideDart = ({
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
  //remove paths
  const keepPaths = ['hemBase', 'armhole', 'cfNeck']
  for (const name in paths) {
    if (keepPaths.indexOf(name) === -1) delete paths[name]
  }
  //measures
  const bustDartAngle = store.get('bustDartAngle')
  //let's begin
  points.bustDartClosed = points.bustDartBottom
  points.bustDartTopI = points.bustDartTop

  points.armholeR = points.armhole.rotate(-bustDartAngle, points.bust)
  const rot = ['bustDartBottom', 'bustDartBottomCp1', 'sideHemCp2', 'sideHem']
  for (const p of rot) points[p + 'R'] = points[p].rotate(bustDartAngle, points.bust)

  paths.sideSeamR = new Path()
    .move(points.sideHemR)
    .curve(points.sideHemCp2R, points.bustDartBottomCp1R, points.bustDartTopI)
    .line(points.armhole)
    .hide()

  points.bustDartTop = paths.sideSeamR
    .reverse()
    .shiftAlong(store.get('sideLength') * options.bustDartFraction)
  points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
  points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)

  points.bustDartTip = points.bustDartMid.shiftFractionTowards(points.bust, options.bustDartLength)
  //daisy guide
  if (options.daisyGuide) {
    paths.daisyGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.bust)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .line(
        points.armholeDrop
          .shiftFractionTowards(points.sideWaistInitial, options.bustDartFraction)
          .rotate(-bustDartAngle, points.bust)
      )
      .line(points.bust)
      .line(
        points.armholeDrop.shiftFractionTowards(points.sideWaistInitial, options.bustDartFraction)
      )
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .attr('class', 'various lashed')
  }
  //paths
  paths.sideSeam = new Path()
    .move(points.sideHem)
    .curve(points.sideHemCp2, points.bustDartBottomCp1, points.bustDartClosed)
    .line(points.armholeR)

  if (options.bustDartFraction > 0.005) {
    paths.sideSeam = paths.sideSeam.split(points.bustDartBottom)[0]
  }

  paths.sideSeamR = paths.sideSeamR.split(points.bustDartTop)[1]

  paths.seam = paths.hemBase
    .clone()
    .join(paths.sideSeam)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
    .join(paths.sideSeamR)
    .join(paths.armhole)
    .line(points.shoulderTop)
    .join(paths.cfNeck)
    .line(points.cfHem)
    .close()

  if (complete) {
  }

  return part
}
