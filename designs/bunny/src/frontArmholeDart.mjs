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
    //grainline
    if (options.cfSaWidth > 0) {
      points.grainlineFrom = new Point(points.cfNeckCp1.x / 3, points.cfTop.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
    } else {
      points.cutOnFoldFrom = points.cfTop
      points.cutOnFoldTo = points.cfHem
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
    }
    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['cfChest', 'bust'],
    })
    if (points.bustDartTop.y > points.armholePitch.y) {
      snippets.armholePitch = new Snippet('notch', points.armholePitch)
    } else {
      snippets.armholePitch = new Snippet('notch', points.armholePitchR)
    }
    //title
    points.title = new Point(points.bust.x * 0.55, points.armhole.y)
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'Front',
      scale: 2 / 3,
    })
    //logo
    points.logo = new Point(points.bust.x * 0.65, points.bust.y * 1.025)
    macro('logorg', {
      at: points.logo,
      scale: 0.4,
    })
    //scalebox
    points.scalebox = new Point(points.waistDartLeft.x, (points.bust.y + points.waistDartMid.y) / 2)
    macro('scalebox', {
      at: points.scalebox,
    })
    //darts
    paths.dartEdge = new Path()
      .move(points.bustDartBottom)
      .line(points.bustDartEdge)
      .line(points.bustDartTop)
      .attr('class', 'fabric help')
    if (sa) {
      const hemSa = sa * options.hemWidth * 100
      const sideSeamSa = sa * options.sideSeamSaWidth * 100
      const armholeSa = sa * options.armholeSaWidth * 100
      const shoulderSa = sa * options.shoulderSaWidth * 100
      const neckSa = sa * options.necklineSaWidth * 100
      const cfSa = sa * options.cfSaWidth * 100
      let dartSa
      if (options.bustDartFraction <= 0.01) {
        dartSa = shoulderSa
      } else {
        dartSa = armholeSa
      }
      points.saSideHem = points.sideHem
        .shift(points.sideHemCp2.angle(points.sideHem), hemSa)
        .shift(points.cfHemCp2.angle(points.sideHem), sideSeamSa)

      points.sideSeamEnd = points.armholeR
        .shiftTowards(points.bustDartClosed, sideSeamSa)
        .rotate(90, points.armholeR)

      points.saArmhole = utils.beamsIntersect(
        points.bustDartClosed
          .shiftTowards(points.armholeR, sideSeamSa)
          .rotate(-90, points.bustDartClosed),
        points.armholeR.shiftTowards(points.bustDartClosed, sideSeamSa).rotate(90, points.armholeR),
        points.armholeR.shiftTowards(points.armholeCp2R, armholeSa).rotate(-90, points.armholeR),
        points.armholeCp2R.shiftTowards(points.armholeR, armholeSa).rotate(90, points.armholeCp2R)
      )

      if (points.saArmhole.y > points.sideSeamEnd.y) {
        points.saArmhole = paths.armholeR.offset(armholeSa).start()
      }

      points.saBustDartBottom = utils.beamsIntersect(
        points.bustDartTip,
        points.bustDartBottom,
        points.bustDartBottom
          .shiftTowards(points.bustDartEdge, dartSa)
          .rotate(-90, points.bustDartBottom),
        points.bustDartEdge
          .shiftTowards(points.bustDartBottom, dartSa)
          .rotate(90, points.bustDartEdge)
      )

      points.saBustDartEdge = utils.beamsIntersect(
        points.bustDartTip,
        points.bustDartMid,
        points.bustDartBottom
          .shiftTowards(points.bustDartEdge, dartSa)
          .rotate(-90, points.bustDartBottom),
        points.bustDartEdge
          .shiftTowards(points.bustDartBottom, dartSa)
          .rotate(90, points.bustDartEdge)
      )

      points.saBustDartTop = utils.beamsIntersect(
        points.bustDartTip,
        points.bustDartTop,
        points.bustDartEdge
          .shiftTowards(points.bustDartTop, dartSa)
          .rotate(-90, points.bustDartEdge),
        points.bustDartTop.shiftTowards(points.bustDartEdge, dartSa).rotate(90, points.bustDartTop)
      )

      points.saShoulder = points.shoulder
        .shift(points.hps.angle(points.shoulder), armholeSa)
        .shift(points.hps.angle(points.shoulder) + 90, shoulderSa)

      points.saShoulderR = points.saShoulder.rotate(-bustDartAngle, points.bust)

      paths.sa = paths.hemBase
        .clone()
        .offset(hemSa)
        .line(points.saSideHem)
        .join(paths.sideSeam.offset(sideSeamSa))
        .line(points.saArmhole)
        .join(paths.armholeR.offset(armholeSa))
    }
  }

  return part
}
