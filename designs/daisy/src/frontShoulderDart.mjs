export const frontShoulderDart = ({
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
  points.bustDartTop = points.hps.shiftFractionTowards(points.shoulder, options.bustDartFraction)
  //Rotate Armhole
  const rot = [
    'armhole',
    'armholeCp2',
    'armholePitchCp1',
    'armholePitch',
    'armholePitchCp2',
    'shoulder',
  ]
  for (const p of rot) points[p] = points[p].rotate(-bustDartAngleSide, points.bust)
  //let's continue
  points.bustDartClosed = points.bustDartBottom
  points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngleSide, points.bust)
  points.bustDartMiddle = points.bustDartTop.shiftFractionTowards(points.bustDartBottom, 0.5)
  points.bustDartTip = points.bustDartMiddle.shiftFractionTowards(
    points.bust,
    options.bustDartLength
  )
  if (options.bustDartFraction < 0.5) {
    points.bustDartEdge = utils.beamsIntersect(
      points.bust,
      points.bustDartMiddle,
      points.shoulder,
      points.bustDartBottom
    )
  } else {
    points.bustDartEdge = utils.beamsIntersect(
      points.bust,
      points.bustDartMiddle,
      points.hps,
      points.bustDartTop
    )
  }
  points.bustDartCpTop = points.bustDartTip
    .shiftFractionTowards(points.bustDartTop, 2 / 3)
    .rotate(5 * options.bustDartCurve, points.bustDartTip)
  points.bustDartCpBottom = points.bustDartTip
    .shiftFractionTowards(points.bustDartBottom, 2 / 3)
    .rotate(-5 * options.bustDartCurve, points.bustDartTip)
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
    .line(points.bustDartBottom)
    ._curve(points.bustDartCpBottom, points.bustDartTip)
    .curve_(points.bustDartCpTop, points.bustDartTop)
    .line(points.hps)
    .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    .line(points.cfWaist)
    .close()

  if (complete) {
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
      nr: 'X',
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
        .line(points.bustDartBottom)
        .line(points.bustDartEdge)
        .line(points.bustDartTop)
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
