export const frontFrenchDart = ({
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
  points.bustDartBottomI = points.bustDartBottom
  points.bustDartTopI = points.bustDartTop

  points.armholeR = points.armhole.rotate(-bustDartAngle, points.bust)
  const rot = ['bustDartBottom', 'bustDartBottomCp1', 'sideHemCp2', 'sideHem']
  for (const p of rot) points[p + 'R'] = points[p].rotate(bustDartAngle, points.bust)

  paths.sideSeamR = new Path()
    .move(points.sideHemR)
    .curve(points.sideHemCp2R, points.bustDartBottomCp1R, points.bustDartTopI)
    .line(points.armhole)
    .hide()

  points.bustDartTop = paths.sideSeamR.reverse().shiftAlong(store.get('sideLength'))
  points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
  points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)

  points.bustDartTip = points.bustDartMid.shiftFractionTowards(points.bust, options.bustDartLength)
  //daisy guide
  if (options.daisyGuide) {
    paths.daisyGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.bust)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.bust)
      .line(points.sideWaist.rotate(bustDartAngle, points.bust))
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .attr('class', 'various lashed')
  }

  //paths
  if (options.bodyLength > 0.005) {
    paths.sideSeamBottom = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.bustDartBottomCp1, points.bustDartBottomI)
      .split(points.bustDartBottom)[0]
      .hide()
  } else {
    paths.sideSeamBottom = new Path().move(points.sideHem).line(points.bustDartBottom).hide()
  }

  paths.sideSeamTop = paths.sideSeamR.split(points.bustDartTop)[1].hide()

  paths.seam = paths.hemBase
    .clone()
    .join(paths.sideSeamBottom)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
    .join(paths.sideSeamTop)
    .join(paths.armhole)
    .line(points.shoulderTop)
    .join(paths.cfNeck)
    .line(points.cfHem)
    .close()

  //dart points
  points.bustDartEdge = utils.beamsIntersect(
    paths.sideSeamTop.start(),
    paths.sideSeamTop.shiftFractionAlong(0.01),
    points.bust,
    points.bustDartMid
  )

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
      on: ['cfChest', 'bust', 'armholePitch', 'bustDartBottomR'],
    })
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
      const neckSa = sa * options.necklineSaWidth * 100
      const cfSa = sa * options.cfSaWidth * 100

      points.saSideHem = points.sideHem
        .shift(points.cfHemCp2.angle(points.sideHem) - 90, hemSa)
        .shift(points.cfHemCp2.angle(points.sideHem), sideSeamSa)

      paths.saSideSeamBottom = paths.sideSeamBottom.offset(sideSeamSa).hide()

      points.saBustDartBottom = utils.beamsIntersect(
        points.bustDartTip,
        points.bustDartBottom,
        points.bustDartBottom
          .shiftTowards(points.bustDartEdge, sideSeamSa)
          .rotate(-90, points.bustDartBottom),
        points.bustDartEdge
          .shiftTowards(points.bustDartBottom, sideSeamSa)
          .rotate(90, points.bustDartEdge)
      )

      points.saBustDartEdge = utils.beamsIntersect(
        points.bustDartBottom
          .shiftTowards(points.bustDartEdge, sideSeamSa)
          .rotate(-90, points.bustDartBottom),
        points.bustDartEdge
          .shiftTowards(points.bustDartBottom, sideSeamSa)
          .rotate(90, points.bustDartEdge),
        points.bustDartEdge
          .shiftTowards(points.bustDartTop, sideSeamSa)
          .rotate(-90, points.bustDartEdge),
        points.bustDartTop
          .shiftTowards(points.bustDartEdge, sideSeamSa)
          .rotate(90, points.bustDartTop)
      )

      const bustDartBottomI = paths.sideSeamBottom
        .offset(sideSeamSa)
        .intersects(
          new Path()
            .move(
              points.bustDartBottom
                .shiftTowards(points.bustDartEdge, sideSeamSa)
                .rotate(-90, points.bustDartBottom)
            )
            .line(
              points.bustDartEdge
                .shiftTowards(points.bustDartBottom, sideSeamSa)
                .rotate(90, points.bustDartEdge)
            )
        )[0]
      if (bustDartBottomI) {
        points.saBustDartBottom = bustDartBottomI
        paths.saSideSeamBottom = paths.saSideSeamBottom.split(points.saBustDartBottom)[0].hide()
      } else {
        points.saBustDartBottom = utils.beamsIntersect(
          points.saBustDartEdge,
          points.saBustDartBottom,
          points.saSideHem,
          points.saSideHem.shift(points.cfHemCp2.angle(points.sideHem) + 90, 1)
        )
        paths.saSideSeamBottom = new Path().move(points.saBustDartBottom).hide()
      }

      points.saBustDartTop = points.bustDartTop
        .shiftTowards(points.bustDartEdge, sideSeamSa)
        .rotate(90, points.bustDartTop)

      points.sideSeamEnd = paths.sideSeamTop.offset(sideSeamSa).end()

      points.saArmhole = utils.beamsIntersect(
        points.bustDartBottomR
          .shiftTowards(points.armhole, sideSeamSa)
          .rotate(-90, points.bustDartBottomR),
        points.armhole.shiftTowards(points.bustDartBottomR, sideSeamSa).rotate(90, points.armhole),
        points.armhole.shiftTowards(points.armholeCp2, armholeSa).rotate(-90, points.armhole),
        points.armholeCp2.shiftTowards(points.armhole, armholeSa).rotate(90, points.armholeCp2)
      )

      if (points.saArmhole.y > points.sideSeamEnd.y) {
        points.saArmhole = paths.armhole.offset(armholeSa).start()
      }

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
        .join(paths.saSideSeamBottom)
        .line(points.saBustDartEdge)
        .line(points.saBustDartTop)
        .join(paths.sideSeamTop.offset(sideSeamSa))
        .line(points.saArmhole)
        .join(paths.armhole.offset(armholeSa))
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
