export const front2WaistDart = ({
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
  log,
}) => {
  //removing paths and snippets not required from Bella
  for (let i in paths) delete paths[i]
  for (let i in snippets) delete snippets[i]
  //removing macros not required from Bella
  macro('title', false)
  macro('scalebox', false)
  //inherit from bella
  const bustDartAngleSide = store.get('bustDartAngleSide')
  //rotate to close bust dart
  points.bustDartClosed = points.bustDartTop
  points.sideWaist = utils.beamsIntersect(
    points.bustDartBottom,
    points.bustDartBottom.shift(points.armhole.angle(points.bustDartTop) - bustDartAngleSide, 1),
    points.waistDartRight,
    points.sideWaistInitial
  )
  points.bustDartBottom = points.waistDartRight.shiftFractionTowards(
    points.sideWaist,
    options.bustDartFraction
  )
  points.sideWaist = points.sideWaist.rotate(bustDartAngleSide, points.bust)
  //creating new waist dart
  points.bustDartTop = points.bustDartBottom.rotate(bustDartAngleSide, points.bust)
  points.bustDartMiddle = points.bustDartTop.shiftFractionTowards(points.bustDartBottom, 0.5)
  points.bustDartTip = points.bustDartMiddle.shiftFractionTowards(
    points.bust,
    options.bustDartLength
  )
  points.bustDartCpTop = points.bustDartTip
    .shiftFractionTowards(points.bustDartTop, 2 / 3)
    .rotate(5 * options.bustDartCurve, points.bustDartTip)
  points.bustDartCpBottom = points.bustDartTip
    .shiftFractionTowards(points.bustDartBottom, 2 / 3)
    .rotate(-5 * options.bustDartCurve, points.bustDartTip)

  points.bustDartEdge = utils.beamsIntersect(
    points.bust,
    points.bustDartMiddle,
    points.armhole,
    points.bustDartTop
  )

  if (
    utils.lineIntersectsCurve(
      points.bustDartBottom,
      points.bustDartCpBottom,
      points.waistDartTip,
      points.waistDartTip,
      points.waistDartRightCp,
      points.waistDartRight
    ) ||
    options.bustDartFraction == 0
  ) {
    points.waistDartLeftCp = points.waistDartLeft.shiftFractionTowards(points.waistDartTip, 0.5)
    points.waistDartRightCp = points.waistDartRight.shiftFractionTowards(points.waistDartTip, 0.5)
    points.bustDartCpBottom = points.bustDartTip.shiftFractionTowards(points.bustDartBottom, 2 / 3)
    points.bustDartCpTop = points.bustDartTip.shiftFractionTowards(points.bustDartTop, 2 / 3)
    log.warning('To prevent overlap the dart legs have be straightened')
  }

  //paths
  paths.seam = new Path()
    .move(points.cfWaist)
    .line(points.waistDartLeft)
    .curve_(points.waistDartLeftCp, points.waistDartTip)
    ._curve(points.waistDartRightCp, points.waistDartRight)
    .line(points.bustDartBottom)
    .curve_(points.bustDartCpBottom, points.bustDartTip)
    ._curve(points.bustDartCpTop, points.bustDartTop)
    .line(points.sideWaist)
    .line(points.armhole)
    .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    .curve_(points.armholePitchCp2, points.shoulder)
    .line(points.hps)
    .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    .line(points.cfWaist)
    .close()

  if (complete) {
    //dart
    paths.dart = new Path()
      .move(points.bustDartBottom)
      .line(points.bustDartEdge)
      .line(points.bustDartTop)
      .attr('class', 'fabric help')
    //grainline
    points.cutOnFoldFrom = points.cfNeck
    points.cutOnFoldTo = points.cfWaist
    macro('cutonfold', {
      from: points.cutOnFoldFrom,
      to: points.cutOnFoldTo,
      grainline: true,
    })

    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['cfBust', 'bust', 'armholePitch'],
    })

    //title
    points.title = new Point(points.hps.x, points.armholePitchCp1.y)
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'Front ' + utils.capitalize(options.bustDartPlacement) + ' Dart',
    })

    //scalebox
    points.scalebox = new Point(
      points.armholePitch.x,
      (points.bust.y + points.armholeCpTarget.y) / 2
    )
    macro('scalebox', {
      at: points.scalebox,
    })

    if (sa) {
      paths.sa = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.waistDartRight)
        .line(points.bustDartBottom)
        .join(paths.dart)
        .line(points.sideWaist)
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

    if (paperless) {
    }
  }

  return part
}
