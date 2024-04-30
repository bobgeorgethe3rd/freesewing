export const frontArmholePitchDart = ({
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

  const rot = ['armholePitchCp1', 'armholeCp2', 'armhole']
  for (const p of rot) points[p] = points[p].rotate(-bustDartAngle, points.bust)

  points.bustDartTop = points.armholePitch
  points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
  points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)

  points.bustDartTip = points.bustDartMid.shiftFractionTowards(points.bust, options.bustDartLength)

  points.bustDartEdge = utils.beamsIntersect(
    points.bustDartBottom,
    points.bustDartTip.rotate(-90, points.bustDartBottom),
    points.bust,
    points.bustDartMid
  )

  paths.armholeBottom = new Path()
    .move(points.armhole)
    .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
    .hide()

  paths.armholeTop = paths.armhole.split(points.armholePitch)[1]
  //daisy guide
  if (options.daisyGuide) {
    paths.daisyGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.bust)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .join(paths.armholeBottom)
      .line(points.bust)
      .line(points.bustDartTop)
      .join(paths.armholeTop)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .attr('class', 'various lashed')
  }
  //paths
  paths.sideSeam = new Path()
    .move(points.sideHem)
    .curve(points.sideHemCp2, points.bustDartBottomCp1, points.bustDartClosed)
    .line(points.armhole)
    .hide()

  paths.seam = paths.hemBase
    .clone()
    .join(paths.sideSeam)
    .join(paths.armholeBottom)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
    .join(paths.armholeTop)
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
      on: ['cfChest', 'bust', 'armholePitch'],
    })
    //title
    points.title = new Point(
      points.bust.x * 0.55,
      points.armhole.rotate(bustDartAngle, points.bust).y
    )
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
      const neckSa = sa * options.necklineSaWidth * 100
      const cfSa = sa * options.cfSaWidth * 100

      points.saSideHem = points.sideHem
        .shift(points.sideHemCp2.angle(points.sideHem), hemSa)
        .shift(points.cfHemCp2.angle(points.sideHem), sideSeamSa)

      points.sideSeamEnd = points.armhole
        .shiftTowards(points.bustDartClosed, sideSeamSa)
        .rotate(90, points.armhole)

      points.saArmhole = utils.beamsIntersect(
        points.bustDartClosed
          .shiftTowards(points.armhole, sideSeamSa)
          .rotate(-90, points.bustDartClosed),
        points.armhole.shiftTowards(points.bustDartClosed, sideSeamSa).rotate(90, points.armhole),
        points.armhole.shiftTowards(points.armholeCp2, armholeSa).rotate(-90, points.armhole),
        points.armholeCp2.shiftTowards(points.armhole, armholeSa).rotate(90, points.armholeCp2)
      )

      if (points.saArmhole.y > points.sideSeamEnd.y) {
        points.saArmhole = paths.armholeBottom.offset(armholeSa).start()
      }

      points.saBustDartBottom = points.bustDartBottom
        .shift(points.armholePitchCp1.angle(points.bustDartBottom), armholeSa)
        .shift(points.armholePitchCp1.angle(points.bustDartBottom) - 90, armholeSa)

      points.saBustDartEdge = utils.beamsIntersect(
        points.saBustDartBottom,
        points.saBustDartBottom.shift(points.bustDartBottom.angle(points.bustDartEdge), 1),
        points.bust,
        points.bustDartMid
      )

      points.saArmholeSplit = paths.armholeTop
        .offset(armholeSa)
        .intersects(
          new Path()
            .move(points.saBustDartEdge)
            .line(
              points.saBustDartEdge.shift(
                points.bustDartEdge.angle(points.bustDartTop),
                points.shoulder.dist(points.hps)
              )
            )
        )[0]

      points.saShoulder = points.shoulder
        .shift(points.shoulderTop.angle(points.shoulder), armholeSa)
        .shift(points.armholePitchCp2.angle(points.shoulder), sa * options.shoulderSaWidth * 100)

      points.saShoulderTop = utils.beamsIntersect(
        points.saShoulder,
        points.saShoulder.shift(points.shoulder.angle(points.shoulderTop), 1),
        paths.cfNeck.offset(neckSa).start(),
        paths.cfNeck
          .offset(neckSa)
          .start()
          .shift(points.shoulderTop.angle(points.shoulder) + 90, 1)
      )

      points.saCfTop = utils.beamIntersectsX(
        paths.cfNeck.offset(neckSa).end(),
        paths.cfNeck.offset(neckSa).end().shift(180, 1),
        points.cfTop.x - cfSa
      )

      points.cfNeckEnd = paths.cfNeck.offset(neckSa).end()

      if (points.saCfTop.x > points.cfNeckEnd.x) {
        points.saCfTop = points.cfTop.shift(180, cfSa)
      }

      points.saCfHem = points.cfHem.translate(-cfSa, hemSa)

      paths.sa = paths.hemBase
        .clone()
        .offset(hemSa)
        .line(points.saSideHem)
        .join(paths.sideSeam.offset(sideSeamSa))
        .line(points.saArmhole)
        .join(paths.armholeBottom.offset(armholeSa))
        .line(points.saBustDartBottom)
        .line(points.saBustDartEdge)
        .line(points.saArmholeSplit)
        .join(paths.armholeTop.offset(armholeSa).split(points.saArmholeSplit)[1])
        .line(points.saShoulder)
        .line(points.saShoulderTop)
        .join(paths.cfNeck.offset(neckSa))
        .line(points.saCfTop)
        .line(points.saCfHem)
        .close()
        .attr('class', 'fabric sa')
    }
  }

  return part
}
