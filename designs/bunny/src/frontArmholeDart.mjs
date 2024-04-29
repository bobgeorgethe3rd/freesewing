export const frontArmholeDart = ({
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

  const rot = [
    'shoulder',
    'armholePitchCp2',
    'armholePitch',
    'armholePitchCp1',
    'armholeCp2',
    'armhole',
  ]
  for (const p of rot) points[p + 'R'] = points[p].rotate(-bustDartAngle, points.bust)

  points.bustDartTop = paths.armhole.shiftFractionAlong(1 - options.bustDartFraction)
  points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
  points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)

  points.bustDartTip = points.bustDartMid.shiftFractionTowards(points.bust, options.bustDartLength)

  paths.armholeR = new Path()
    .move(points.armholeR)
    .curve(points.armholeCp2R, points.armholePitchCp1R, points.armholePitchR)
    .curve_(points.armholePitchCp2R, points.shoulderR)
    .hide()

  if (options.bustDartFraction < 0.995) {
    paths.armholeR = paths.armholeR.split(points.bustDartBottom)[0].hide()
  } else {
    paths.armholeR = new Path().move(points.armholeR).line(points.bustDartBottom).hide()
  }

  //daisy guide
  if (options.daisyGuide) {
    paths.daisyGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.bust)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armholeR)
      .join(paths.armholeR)
      .line(points.bust)
      .line(points.bustDartTop)
      .join(paths.armhole.split(points.bustDartTop)[1])
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
    .hide()

  paths.seam = paths.hemBase
    .clone()
    .join(paths.sideSeam)
    .join(paths.armholeR)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
    .join(paths.armhole.split(points.bustDartTop)[1])
    .line(points.shoulderTop)
    .join(paths.cfNeck)
    .line(points.cfHem)
    .close()

  if (complete) {
  }

  return part
}
