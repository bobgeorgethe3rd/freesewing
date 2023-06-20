export const frontFrenchDart = ({
  store,
  sa,
  points,
  Path,
  paths,
  snippets,
  complete,
  paperless,
  macro,
  part,
  options,
  utils,
}) => {
  //measures
  const bustDartAngleSide = store.get('bustDartAngleSide')

  points.bustDartBottom = utils.beamsIntersect(
    points.bustDartBottom,
    points.bustDartBottom.shift(points.armhole.angle(points.bustDartTop) - bustDartAngleSide, 1),
    points.waistDartRight,
    points.sideWaist
  )

  points.bustDartTop = points.bustDartBottom.rotate(bustDartAngleSide, points.bust)

  points.bustDartCpTop = points.bustDartTip
    .shiftFractionTowards(points.bustDartTop, 2 / 3)
    .rotate(5 * options.bustDartCurve, points.bustDartTip)
  points.bustDartCpBottom = points.bustDartTip
    .shiftFractionTowards(points.bustDartBottom, 2 / 3)
    .rotate(-5 * options.bustDartCurve, points.bustDartTip)

  points.bustDartMiddle = points.bustDartTop.shiftFractionTowards(points.bustDartBottom, 0.5)
  points.bustDartTip = points.bustDartMiddle.shiftFractionTowards(
    points.bust,
    options.bustDartLength
  )

  points.bustDartEdge = utils.beamsIntersect(
    points.bust,
    points.bustDartMiddle,
    points.armhole,
    points.bustDartTop
  )
  //paths
  paths.seam = new Path()
    .move(points.cfWaist)
    .line(points.waistDartLeft)
    .curve_(points.waistDartLeftCp, points.waistDartTip)
    ._curve(points.waistDartRightCp, points.waistDartRight)
    .line(points.bustDartBottom)
    ._curve(points.bustDartCpBottom, points.bustDartTip)
    .curve_(points.bustDartCpTop, points.bustDartTop)
    .line(points.armhole)
    .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    .curve_(points.armholePitchCp2, points.shoulder)
    .line(points.hps)
    .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    .line(points.cfHem)
    .close()
    .attr('class', 'fabric')

  if (complete) {
    //dart
    paths.dart = new Path()
      .move(points.bustDartBottom)
      .line(points.bustDartEdge)
      .line(points.bustDartTop)
      .attr('class', 'fabric help')

    if (sa) {
      paths.sa = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.waistDartRight)
        .line(points.bustDartBottom)
        .join(paths.dart)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .offset(sa)
        .line(points.cfNeck)
        .line(points.cfHem)
        .close()
        .attr('class', 'fabric sa')
    }
  }

  return part
}
