export const frontBustShoulderDart = ({
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
  //measures
  const bustDartAngle = store.get('bustDartAngle')
  //let's begin
  points.bustDartTop = utils.beamsIntersect(
    points.waistDartMid,
    points.bust,
    points.hps,
    points.shoulder
  )
  const rot = [
    'armhole',
    'armholeCp2',
    'armholePitchCp1',
    'armholePitch',
    'armholePitchCp2',
    'shoulder',
  ]
  for (const p of rot) points[p] = points[p].rotate(-bustDartAngle, points.bust)

  points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
  points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)
  points.bustDartTip = points.bustDartMid.shiftFractionTowards(points.bust, options.bustDartLength)
  points.waistDartTip = points.waistDartMid.shiftFractionTowards(
    points.bust,
    options.waistDartLength
  )

  points.bustDartEdge = utils.beamsIntersect(
    points.shoulder,
    points.armholePitchCp2.rotate(-90, points.shoulder),
    points.bust,
    points.bustDartMid
  )

  //paths
  paths.hemLeft = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

  paths.waistDart = new Path()
    .move(points.waistDartLeft)
    .line(points.waistDartTip)
    .line(points.waistDartRight)
    .hide()

  paths.hemRight = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

  paths.sideSeam = new Path().move(points.sideWaist).line(points.armhole).hide()

  paths.armhole = new Path()
    .move(points.armhole)
    .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    .curve_(points.armholePitchCp2, points.shoulder)
    .hide()

  paths.shoulderBottom = new Path().move(points.shoulder).line(points.bustDartBottom).hide()

  paths.bustDart = new Path()
    .move(points.bustDartBottom)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
    .hide()

  paths.shoulderTop = new Path().move(points.bustDartTop).line(points.hps).hide()

  paths.cfNeck = new Path()
    .move(points.hps)
    .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    .hide()

  paths.seam = paths.hemLeft
    .clone()
    .join(paths.waistDart)
    .join(paths.hemRight)
    .join(paths.sideSeam)
    .join(paths.armhole)
    .join(paths.shoulderBottom)
    .join(paths.bustDart)
    .join(paths.shoulderTop)
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
      on: ['cfChest', 'bust'],
    })
    //title
    points.title = new Point(points.bust.x / 3, points.bust.y)
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'Front',
      scale: 2 / 3,
    })
    //scalebox
    points.scalebox = new Point(
      (points.waistDartRight.x + points.armhole.x) / 2,
      (points.sideWaist.y + points.armhole.y) / 2
    )
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

      const rotSa = [
        'saArmhole',
        'saArmholeCp2',
        'saArmholePitchCp1',
        'saArmholePitch',
        'saArmholePitchCp2',
        'saShoulder',
      ]
      for (const p of rotSa) points[p] = points[p].rotate(-bustDartAngle, points.bust)

      paths.saArmhole = new Path()
        .move(points.saArmhole)
        .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
        .curve_(points.saArmholePitchCp2, points.saShoulder)
        .hide()

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
        points.sideWaist
          .shift(points.sideWaistInitial.angle(points.armhole) - bustDartAngle, sideSeamSa)
          .rotate(-90, points.sideWaist),
        points.sideWaist.rotate(
          -90,
          points.sideWaist
            .shift(points.sideWaistInitial.angle(points.armhole) - bustDartAngle, sideSeamSa)
            .rotate(-90, points.sideWaist)
        ),
        points.sideWaist
          .shiftTowards(points.waistDartRight, sideSeamSa)
          .rotate(90, points.sideWaist),
        points.waistDartRight
          .shiftTowards(points.sideWaist, sideSeamSa)
          .rotate(-90, points.waistDartRight)
      )

      points.saPoint2 = utils.beamsIntersect(
        points.sideWaist.shiftTowards(points.armhole, sideSeamSa).rotate(-90, points.sideWaist),
        points.armhole.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armhole),
        points.saArmhole,
        points.saArmhole.shift(0, 1)
      )

      points.saPoint3 = points.shoulder
        .shift(points.armholePitchCp2.angle(points.shoulder) - 90, armholeSa)
        .shift(points.armholePitchCp2.angle(points.shoulder), shoulderSa)

      points.saPoint4 = utils.beamsIntersect(
        points.saPoint3,
        points.saPoint3.shift(points.armholePitchCp2.angle(points.shoulder) - 90, 1),
        points.bust,
        points.bustDartMid
      )
      points.shoulderAnchor = points.shoulder.rotate(bustDartAngle, points.bust)

      points.saPoint5 = utils.beamsIntersect(
        points.hps.shiftTowards(points.shoulderAnchor, shoulderSa).rotate(90, points.hps),
        points.shoulderAnchor
          .shiftTowards(points.hps, shoulderSa)
          .rotate(-90, points.shoulderAnchor),
        points.saPoint4,
        points.saPoint4.shift(points.bustDartEdge.angle(points.bustDartTop), 1)
      )

      points.saPoint6 = utils.beamsIntersect(
        paths.cfNeck.offset(neckSa).start(),
        paths.cfNeck
          .offset(neckSa)
          .start()
          .shift(points.hps.angle(points.shoulderAnchor) + 90, 1),
        points.hps.shiftTowards(points.shoulderAnchor, shoulderSa).rotate(90, points.hps),
        points.shoulderAnchor
          .shiftTowards(points.hps, shoulderSa)
          .rotate(-90, points.shoulderAnchor)
      )

      paths.sa = paths.hemLeft
        .offset(sa)
        .line(points.saPoint0)
        .line(paths.hemRight.offset(sa).start())
        .join(paths.hemRight.offset(sa))
        .line(points.saPoint1)
        .line(points.saPoint2)
        .line(points.saArmhole)
        .join(paths.saArmhole)
        .line(points.saPoint3)
        .line(points.saPoint4)
        .line(points.saPoint5)
        .line(points.saPoint6)
        .join(paths.cfNeck.offset(neckSa))
        .close()
        .attr('class', 'fabric sa')
    }
  }

  return part
}
