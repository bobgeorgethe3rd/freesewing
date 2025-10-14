export const front2SideDart = ({
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
  utils,
  log,
}) => {
  //remove paths & snippets
  for (let i in paths) delete paths[i]
  for (let i in snippets) delete snippets[i]
  //removing macros not required from Bella
  macro('title', false)
  //removing scalebox
  macro('scalebox', false)
  //measures
  const bustDartAngleSide = store.get('bustDartAngleSide')

  //let's begin
  points.sideWaist = utils
    .beamsIntersect(
      points.bustDartBottom,
      points.bustDartBottom.shift(points.armhole.angle(points.bustDartTop) - bustDartAngleSide, 1),
      points.waistDartRight,
      points.sideWaistInitial
    )
    .rotate(bustDartAngleSide, points.bust)

  points.sideMid = points.armhole.shiftFractionTowards(points.sideWaist, 0.5)

  points.bustDartTopLeft = points.sideMid
    .shiftFractionTowards(points.sideWaist, options.bustDartFraction)
    .rotate(bustDartAngleSide / -2, points.bust)
  points.bustDartTopRight = points.sideMid.shiftFractionTowards(
    points.armhole,
    options.bustDartFraction
  )

  points.bustDartBottomLeft = points.bustDartTopLeft.rotate(bustDartAngleSide / -2, points.bust)
  points.bustDartBottomRight = points.bustDartTopRight.rotate(bustDartAngleSide / -2, points.bust)

  points.sideWaist = points.sideWaist.rotate(-bustDartAngleSide, points.bust)

  points.bustDartMiddleLeft = points.bustDartTopLeft.shiftFractionTowards(
    points.bustDartBottomLeft,
    0.5
  )
  points.bustDartMiddleRight = points.bustDartTopRight.shiftFractionTowards(
    points.bustDartBottomRight,
    0.5
  )

  points.bustDartTipLeft = points.bustDartMiddleLeft.shiftFractionTowards(
    points.bust,
    options.bustDartLength
  )
  points.bustDartTipRight = points.bustDartMiddleRight.shiftFractionTowards(
    points.bust,
    options.bustDartLength
  )

  if (options.bustDartFraction == 0) {
    points.bustDartEdgeLeft = points.bustDartMiddleLeft
    points.bustDartEdgeRight = points.bustDartMiddleRight
  } else {
    points.bustDartEdgeLeft = utils.beamsIntersect(
      points.bust,
      points.bustDartMiddleLeft,
      points.bustDartBottomRight,
      points.bustDartTopLeft
    )
    if (options.bustDartFraction == 1) {
      points.bustDartEdgeRight = utils.beamsIntersect(
        points.bust,
        points.bustDartMiddleRight,
        points.bustDartTopLeft,
        points.bustDartBottomRight
      )
    } else {
      points.bustDartEdgeRight = utils.beamsIntersect(
        points.bust,
        points.bustDartMiddleRight,
        points.armhole,
        points.bustDartTopRight
      )
    }
  }

  points.bustDartCpTopLeft = points.bustDartTipLeft
    .shiftFractionTowards(points.bustDartTopLeft, 2 / 3)
    .rotate(5 * options.bustDartCurve, points.bustDartTipLeft)
  points.bustDartCpBottomLeft = points.bustDartTipLeft
    .shiftFractionTowards(points.bustDartBottomLeft, 2 / 3)
    .rotate(-5 * options.bustDartCurve, points.bustDartTipLeft)

  points.bustDartCpTopRight = points.bustDartTipRight
    .shiftFractionTowards(points.bustDartTopRight, 2 / 3)
    .rotate(5 * options.bustDartCurve, points.bustDartTipRight)
  points.bustDartCpBottomRight = points.bustDartTipRight
    .shiftFractionTowards(points.bustDartBottomRight, 2 / 3)
    .rotate(-5 * options.bustDartCurve, points.bustDartTipRight)

  if (
    utils.lineIntersectsCurve(
      points.bustDartCpTopLeft,
      points.bustDartCpBottomRight,
      points.bustDartBottomRight,
      points.bustDartBottomRight,
      points.bustDartCpBottomRight,
      points.bustDartTipRight
    )
  ) {
    points.bustDartCpTopLeft = points.bustDartTipLeft.shiftFractionTowards(
      points.bustDartTopLeft,
      2 / 3
    )
    points.bustDartCpBottomLeft = points.bustDartTipLeft.shiftFractionTowards(
      points.bustDartBottomLeft,
      2 / 3
    )

    points.bustDartCpTopRight = points.bustDartTipRight.shiftFractionTowards(
      points.bustDartTopRight,
      2 / 3
    )
    points.bustDartCpBottomRight = points.bustDartTipRight.shiftFractionTowards(
      points.bustDartBottomRight,
      2 / 3
    )
    log.warning('To prevent overlap the darts have been set with a bustDartCurve of 0%')
  }

  //paths
  paths.seam = new Path()
    .move(points.cfWaist)
    .line(points.waistDartLeft)
    .curve_(points.waistDartLeftCp, points.waistDartTip)
    ._curve(points.waistDartRightCp, points.waistDartRight)
    .line(points.sideWaist)
    .line(points.bustDartBottomLeft)
    ._curve(points.bustDartCpBottomLeft, points.bustDartTipLeft)
    .curve_(points.bustDartCpTopLeft, points.bustDartTopLeft)
    .line(points.bustDartBottomRight)
    ._curve(points.bustDartCpBottomRight, points.bustDartTipRight)
    .curve_(points.bustDartCpTopRight, points.bustDartTopRight)
    .line(points.armhole)
    .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    .curve_(points.armholePitchCp2, points.shoulder)
    .line(points.hps)
    .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    .line(points.cfWaist)
    .close()
  if (complete) {
    //dart
    paths.dartLeft = new Path()
      .move(points.bustDartBottomLeft)
      .line(points.bustDartEdgeLeft)
      .line(points.bustDartTopLeft)
      .attr('class', 'fabric help')

    paths.dartRight = new Path()
      .move(points.bustDartBottomRight)
      .line(points.bustDartEdgeRight)
      .line(points.bustDartTopRight)
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
    points.title = new Point(points.hps.x, points.bust.y * 0.75)
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'Front ' + utils.capitalize(options.bustDartPlacement) + ' Dart',
    })

    //scalebox
    points.scalebox = points.scaleboxAnchor
    macro('scalebox', {
      at: points.scalebox,
    })

    if (sa) {
      paths.sa = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.waistDartRight)
        .line(points.sideWaist)
        .line(points.bustDartBottomLeft)
        .join(paths.dartLeft)
        .line(points.bustDartBottomRight)
        .join(paths.dartRight)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .offset(sa)
        .line(points.cfNeck)
        .line(points.cfWaist)
        .close()
        .attr('class', 'fabric sa')
    }

    if (paperless) {
    }
  }

  return part
}
