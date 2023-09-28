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
  for (let i in paths) delete paths[i]
  //measures
  const bustDartAngle = store.get('bustDartAngle')
  //let's begin
  paths.armhole = new Path()
    .move(points.armhole)
    .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    .curve_(points.armholePitchCp2, points.shoulder)
    .hide()

  points.bustDartTop = paths.armhole.shiftFractionAlong(1 - options.bustDartFraction)
  const rot = [
    'armhole',
    'armholeCp2',
    'armholePitchCp1',
    'armholePitch',
    'armholePitchCp2',
    'shoulder',
  ]
  for (const p of rot) points[p + 'R'] = points[p].rotate(-bustDartAngle, points.bust)

  points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
  points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)
  points.bustDartTip = points.bustDartMid.shiftFractionTowards(points.bust, options.bustDartLength)
  points.waistDartTip = points.waistDartMid.shiftFractionTowards(
    points.bust,
    options.waistDartLength
  )
  points.bustDartEdge = utils.beamsIntersect(
    points.bustDartBottom,
    points.bustDartTip.rotate(-90, points.bustDartBottom),
    points.bust,
    points.bustDartMid
  )

  paths.armholeR = new Path()
    .move(points.armholeR)
    .curve(points.armholeCp2R, points.armholePitchCp1R, points.armholePitchR)
    .curve_(points.armholePitchCp2R, points.shoulderR)
    .hide()

  //paths
  paths.hemLeft = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

  paths.waistDart = new Path()
    .move(points.waistDartLeft)
    .line(points.waistDartTip)
    .line(points.waistDartRight)
    .hide()

  paths.hemRight = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

  paths.sideSeam = new Path().move(points.sideWaist).line(points.armholeR).hide()

  if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.998) {
    paths.armholeTop = paths.armhole.split(points.bustDartTop)[1].hide()
    paths.armholeBottom = paths.armholeR.split(points.bustDartBottom)[0].hide()
  } else {
    if (options.bustDartFraction <= 0.01) {
      paths.armholeTop = new Path().move(points.bustDartTop).line(points.shoulder).hide()
      paths.armholeBottom = paths.armholeR
    }
    if (options.bustDartFraction >= 0.998) {
      paths.armholeTop = paths.armhole
      paths.armholeBottom = new Path().move(points.armholeR).line(points.bustDartBottom).hide()
    }
  }

  paths.bustDart = new Path()
    .move(points.bustDartBottom)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
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
    .join(paths.sideSeam)
    .join(paths.armholeBottom)
    .join(paths.bustDart)
    .join(paths.armholeTop)
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
      on: ['cfChest', 'bust'],
    })
    if (points.bustDartTop.y < points.armholePitch.y) {
      snippets.armholePitch = new Snippet('notch', points.armholePitchR)
    } else {
      snippets.armholePitch = new Snippet('notch', points.armholePitch)
    }
    //title
    points.title = new Point(points.hps.x, points.armholePitch.y)
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'Front',
      scale: 2 / 3,
    })
    //scalebox
    points.scalebox = new Point(
      (points.waistDartRight.x + points.armholeR.x) / 2,
      (points.sideWaist.y + points.armholeR.y) / 2
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

      let dartSa
      if (options.bustDartFraction <= 0.01) {
        dartSa = shoulderSa
      } else {
        dartSa = armholeSa
      }

      const rotSa = [
        'saArmhole',
        'saArmholeCp2',
        'saArmholePitchCp1',
        'saArmholePitch',
        'saArmholePitchCp2',
        'saShoulder',
      ]
      for (const p of rotSa) points[p + 'R'] = points[p].rotate(-bustDartAngle, points.bust)

      points.saPoint4 = points.shoulder
        .shift(points.hps.angle(points.shoulder), armholeSa)
        .shift(points.hps.angle(points.shoulder) + 90, shoulderSa)

      points.saPoint4R = points.saPoint4.rotate(-bustDartAngle, points.bust)

      paths.saArmhole = new Path()
        .move(points.saArmhole)
        .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
        .curve_(points.saArmholePitchCp2, points.saShoulder)
        .line(points.saPoint4)
        .hide()

      paths.saArmholeR = new Path()
        .move(points.saArmholeR)
        .curve(points.saArmholeCp2R, points.saArmholePitchCp1R, points.saArmholePitchR)
        .curve_(points.saArmholePitchCp2R, points.saShoulderR)
        .line(points.saPoint4R)
        .hide()

      points.saArmholeTopSplit = paths.saArmhole.shiftFractionAlong(1 - options.bustDartFraction)
      points.saArmholeBottomSplit = paths.saArmholeR.shiftFractionAlong(
        1 - options.bustDartFraction
      )

      if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
        paths.saArmholeTop = paths.saArmhole.split(points.saArmholeTopSplit)[1].hide()
        paths.saArmholeBottom = paths.saArmholeR.split(points.saArmholeBottomSplit)[0].hide()
      } else {
        if (options.bustDartFraction <= 0.01) {
          points.saPoint4 = points.shoulder
            .shiftTowards(points.hps, shoulderSa)
            .rotate(-90, points.shoulder)
          paths.saArmholeTop = new Path().move(points.saPoint4).line(points.saPoint4).hide()
          paths.saArmholeBottom = paths.saArmholeR
        }
        if (options.bustDartFraction >= 0.997) {
          paths.saArmholeTop = paths.saArmhole
          paths.saArmholeBottom = new Path()
            .move(points.saArmholeR)
            .line(points.saArmholeBottomSplit)
            .hide()
        }
      }

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
        points.sideWaist.shiftTowards(points.armholeR, sideSeamSa).rotate(-90, points.sideWaist),
        points.armholeR.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armholeR),
        points.saArmholeR,
        points.saArmholeR.shift(0, 1)
      )

      points.saPoint3 = utils.beamsIntersect(
        points.bustDartBottom
          .shiftTowards(points.bustDartEdge, dartSa)
          .rotate(-90, points.bustDartBottom),
        points.bustDartEdge
          .shiftTowards(points.bustDartBottom, dartSa)
          .rotate(90, points.bustDartEdge),
        points.bust,
        points.bustDartEdge
      )

      points.saPoint5 = utils.beamsIntersect(
        paths.cfNeck.offset(neckSa).start(),
        paths.cfNeck
          .offset(neckSa)
          .start()
          .shift(points.hps.angle(points.shoulder) + 90, 1),
        paths.shoulder.offset(shoulderSa).start(),
        paths.shoulder.offset(shoulderSa).end()
      )

      paths.sa = paths.hemLeft
        .offset(sa)
        .line(points.saPoint0)
        .line(paths.hemRight.offset(sa).start())
        .join(paths.hemRight.offset(sa))
        .line(points.saPoint1)
        .line(points.saPoint2)
        .line(points.saArmholeR)
        .join(paths.saArmholeBottom)
        .line(points.saPoint3)
        .join(paths.saArmholeTop)
        .line(points.saPoint4)
        .line(points.saPoint5)
        .join(paths.cfNeck.offset(neckSa))
        .close()
        .attr('class', 'fabric sa')
    }
  }

  return part
}
