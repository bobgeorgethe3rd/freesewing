export const frontBustSideDart = ({
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
  for (let i in paths) delete paths[i]
  //let's begin
  points.bustDartTip = points.bustDartMid.shiftFractionTowards(points.bust, options.bustDartLength)
  points.waistDartTip = points.waistDartMid.shiftFractionTowards(
    points.bust,
    options.waistDartLength
  )

  //paths
  paths.hemLeft = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

  paths.waistDart = new Path()
    .move(points.waistDartLeft)
    .line(points.waistDartTip)
    .line(points.waistDartRight)
    .hide()

  paths.hemRight = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

  paths.sideSeamBottom = new Path().move(points.sideWaist).line(points.bustDartBottom).hide()

  paths.bustDart = new Path()
    .move(points.bustDartBottom)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
    .hide()

  paths.sideSeamTop = new Path().move(points.bustDartTop).line(points.armhole).hide()

  paths.armhole = new Path()
    .move(points.armhole)
    .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    .curve_(points.armholePitchCp2, points.shoulder)
    .hide()

  paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

  paths.cfNeck = new Path()
    .move(points.hps)
    .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    .hide()

  paths.seam = paths.hemLeft
    .clone()
    .join(paths.waistDart)
    .join(paths.hemRight)
    .join(paths.sideSeamBottom)
    .join(paths.bustDart)
    .join(paths.sideSeamTop)
    .join(paths.armhole)
    .join(paths.shoulder)
    .join(paths.cfNeck)
    .line(points.cfWaist)

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
      on: ['cfChest', 'bust', 'armholePitch'],
    })
    //title
    points.title = new Point(points.hps.x, points.armholePitch.y)
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'Front',
      scale: 2 / 3,
    })
    //scalebox
    points.scalebox = new Point(points.hps.x * 1.25, points.armholePitchCp1.y)
    macro('scalebox', {
      at: points.scalebox,
    })
    //darts
    paths.darts = new Path()
      .move(points.waistDartLeft)
      .line(points.waistDartEdge)
      .line(points.waistDartRight)
      .move(points.bustDartBottom)
      .line(points.bustDartEdge)
      .line(points.bustDartTop)
      .attr('class', 'fabric help')

    if (sa) {
      const armholeSa = sa * options.armholeSaWidth * 100
      const neckSa = sa * options.neckSaWidth * 100
      const sideSeamSa = sa * options.sideSeamSaWidth * 100
      const shoulderSa = sa * options.shoulderSaWidth * 100

      points.saPoint0 = utils.beamsIntersect(
        points.bust,
        points.waistDartMid,
        points.waistDartLeft
          .shiftTowards(points.waistDartEdge, sideSeamSa)
          .rotate(-90, points.waistDartLeft),
        points.waistDartEdge
          .shiftTowards(points.waistDartLeft, sideSeamSa)
          .rotate(90, points.waistDartEdge)
      )
      points.saPoint1 = utils.beamsIntersect(
        paths.sideSeamBottom.offset(sideSeamSa).end(),
        paths.sideSeamBottom.offset(sideSeamSa).start(),
        points.sideWaist
          .shiftTowards(points.waistDartRight, sideSeamSa)
          .rotate(90, points.sideWaist),
        points.waistDartRight
          .shiftTowards(points.sideWaist, sideSeamSa)
          .rotate(-90, points.waistDartRight)
      )
      points.saPoint2 = utils.beamsIntersect(
        points.bustDartTip,
        points.bustDartBottom,
        paths.sideSeamBottom.offset(sideSeamSa).start(),
        paths.sideSeamBottom.offset(sideSeamSa).end()
      )
      points.saPoint3 = utils.beamsIntersect(
        points.bustDartTip,
        points.bustDartMid,
        points.bustDartBottom
          .shiftTowards(points.bustDartEdge, sideSeamSa)
          .rotate(-90, points.bustDartBottom),
        points.bustDartEdge
          .shiftTowards(points.bustDartBottom, sideSeamSa)
          .rotate(90, points.bustDartEdge)
      )

      points.saPoint4 = utils.beamsIntersect(
        points.saArmholeCp2,
        points.saArmhole,
        points.armhole.shiftTowards(points.sideWaistInitial, sideSeamSa).rotate(90, points.armhole),
        points.sideWaistInitial
          .shiftTowards(points.armhole, sideSeamSa)
          .rotate(90, points.sideWaistInitial)
      )

      points.saPoint5 = points.shoulder
        .shift(points.hps.angle(points.shoulder), armholeSa)
        .shift(points.hps.angle(points.shoulder) + 90, shoulderSa)
      points.saPoint6 = utils.beamsIntersect(
        paths.cfNeck.offset(neckSa).start(),
        paths.cfNeck
          .offset(neckSa)
          .start()
          .shift(points.hps.angle(points.shoulder) + 90, 1),
        paths.shoulder.offset(shoulderSa).start(),
        paths.shoulder.offset(shoulderSa).end()
      )

      paths.saArmhole = new Path()
        .move(points.saArmhole)
        .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
        .curve_(points.saArmholePitchCp2, points.saShoulder)
        .hide()

      paths.sa = paths.hemLeft
        .offset(sa)
        .line(points.saPoint0)
        .line(paths.hemRight.offset(sa).start())
        .join(paths.hemRight.offset(sa))
        .line(points.saPoint1)
        .line(points.saPoint2)
        .line(points.saPoint3)
        .line(points.saPoint4)
        .line(points.saArmhole)
        .join(paths.saArmhole)
        .line(points.saPoint5)
        .line(points.saPoint6)
        .join(paths.cfNeck.offset(neckSa))
        .line(points.cfWaist)
        .attr('class', 'fabric sa')
    }
  }

  return part
}
