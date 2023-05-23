export const frontCfDart = ({
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
  points.bustDartTop = points.cfBust.shiftFractionTowards(points.cfNeck, options.bustDartFraction)
  //Rotate Armhole
  const rot = [
    'armhole',
    'armholeCp2',
    'armholePitchCp1',
    'armholePitch',
    'armholePitchCp2',
    'shoulder',
    'hps',
    'hpsCp2',
    'cfNeckCp1',
    'cfNeck',
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
  points.bustDartEdge = points.bustDartMiddle

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
    .line(points.hps)
    .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    .line(points.bustDartBottom)
    ._curve(points.bustDartCpBottom, points.bustDartTip)
    .curve_(points.bustDartCpTop, points.bustDartTop)
    .line(points.cfWaist)
    .close()

  if (complete) {
    //grainline
    points.grainlineFrom = points.cfNeckCp1
    points.grainlineTo = new Point(points.cfNeckCp1.x, points.waistDartRight.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })

    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['bust', 'armholePitch'],
    })
    if (options.bustDartFraction > 0) {
      snippets.cfBustNotch = new Snippet('notch', points.cfBust)
    }
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
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.bustDartBottom)
        .line(points.bustDartEdge)
        .line(points.bustDartTop)
        .line(points.cfWaist)
        .offset(sa)
        .close()
        .attr('class', 'fabric sa')
    }

    if (paperless) {
    }
  }

  return part
}
