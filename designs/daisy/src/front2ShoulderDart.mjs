export const front2ShoulderDart = ({
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
  points.shoulderMid = points.hps.shiftFractionTowards(points.shoulder, 0.5)

  if (options.parallelShoulder) {
    points.bustDartTopRight = utils.beamsIntersect(
      points.waistDartEdge,
      points.bust,
      points.hps,
      points.shoulder
    )

    if (utils.pointOnLine(points.shoulderMid, points.shoulder, points.bustDartTopRight)) {
      points.bustDartBottomLeft = points.bustDartTopRight
      points.bustDartTopRight = points.hps.shiftTowards(
        points.shoulder,
        points.shoulder.dist(points.bustDartBottomLeft)
      )
      log.warning(
        'Bust point passes shoulder mid so parallelShoulder is achieved with the left dart'
      )
    } else {
      points.bustDartBottomLeft = points.shoulder.shiftTowards(
        points.hps,
        points.hps.dist(points.bustDartTopRight)
      )
    }
  } else {
    points.bustDartTopRight = points.shoulderMid.shiftFractionTowards(
      points.hps,
      options.bustDartFraction
    )
    points.bustDartBottomLeft = points.shoulderMid.shiftFractionTowards(
      points.shoulder,
      options.bustDartFraction
    )
  }

  //Rotate Armhole
  const rot = [
    'armhole',
    'armholeCp2',
    'armholePitchCp1',
    'armholePitch',
    'armholePitchCp2',
    'bustDartBottomLeft',
    'shoulder',
  ]
  for (const p of rot) points[p] = points[p].rotate(-bustDartAngleSide, points.bust)
  //let's continue
  points.bustDartClosed = points.bustDartBottom

  points.bustDartBottomRight = points.bustDartTopRight.rotate(-bustDartAngleSide / 2, points.bust)
  points.bustDartTopLeft = points.bustDartBottomLeft.rotate(bustDartAngleSide / 2, points.bust)

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
    points.bustDartEdgeRight = utils.beamsIntersect(
      points.bust,
      points.bustDartMiddleRight,
      points.bustDartTopLeft,
      points.bustDartBottomRight
    )
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

  //reset side hem
  points.sideWaist = utils.beamsIntersect(
    points.waistDartRight,
    points.sideWaist,
    points.armhole,
    points.bustDartClosed
  )

  //paths
  paths.seam = new Path()
    .move(points.cfWaist)
    .line(points.waistDartLeft)
    .curve_(points.waistDartLeftCp, points.waistDartTip)
    ._curve(points.waistDartRightCp, points.waistDartRight)
    .line(points.sideWaist)
    .line(points.armhole)
    .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    .curve_(points.armholePitchCp2, points.shoulder)
    .line(points.bustDartBottomLeft)
    ._curve(points.bustDartCpBottomLeft, points.bustDartTipLeft)
    .curve_(points.bustDartCpTopLeft, points.bustDartTopLeft)
    .line(points.bustDartBottomRight)
    ._curve(points.bustDartCpBottomRight, points.bustDartTipRight)
    .curve_(points.bustDartCpTopRight, points.bustDartTopRight)
    .line(points.hps)
    .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    .line(points.cfWaist)
    .close()

  if (complete) {
    //darts
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
    points.title = new Point(points.armholePitchCp1.x * (3 / 4), points.bust.y)
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'Front ' + utils.capitalize(options.bustDartPlacement) + ' Dart',
    })

    //scalebox
    points.scalebox = new Point(points.armholePitchCp1.x, points.waistDartRightCp.y)
    macro('scalebox', {
      at: points.scalebox,
    })

    if (sa) {
      paths.sa = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.waistDartRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.bustDartBottomLeft)
        .join(paths.dartLeft)
        .line(points.bustDartBottomRight)
        .join(paths.dartRight)
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
