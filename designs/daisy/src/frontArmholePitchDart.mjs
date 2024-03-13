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
  for (let i in paths) delete paths[i]
  //measures
  const bustDartAngle = store.get('bustDartAngle')
  //let's begin
  points.bustDartTop = points.armholePitch
  const rot = ['armhole', 'armholeCp2', 'armholePitchCp1']
  for (const p of rot) points[p] = points[p].rotate(-bustDartAngle, points.bust)

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

  //paths
  paths.waist = new Path()
    .move(points.cfWaist)
    .line(points.waistDartLeft)
    .line(points.waistDartTip)
    .line(points.waistDartRight)
    .line(points.sideWaist)
    .hide()

  paths.sideSeam = new Path().move(points.sideWaist).line(points.armhole).hide()

  paths.armhole = new Path()
    .move(points.armhole)
    .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
    .curve_(points.armholePitchCp2, points.shoulder)
    .hide()

  paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

  paths.cfNeck = new Path()
    .move(points.hps)
    .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    .hide()

  paths.seam = paths.waist
    .clone()
    .join(paths.sideSeam)
    .join(paths.armhole)
    .join(paths.shoulder)
    .join(paths.cfNeck)
    .line(points.cfWaist)

  if (complete) {
    //grainline
    if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
      points.cutOnFoldFrom = points.cfNeck
      points.cutOnFoldTo = points.cfWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
    } else {
      points.grainlineTo = points.cfWaist.shiftFractionTowards(points.waistDartLeft, 0.15)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.cfNeck.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
    }
    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['cfChest', 'bust'],
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
    points.scalebox = new Point(
      (points.waistDartRight.x + points.armhole.x) / 2,
      (points.sideWaist.y + points.armhole.y) / 2
    )
    macro('scalebox', {
      at: points.scalebox,
    })
    //darts
    paths.dartEdges = new Path()
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
      const shoulderSa = sa * options.shoulderSaWidth * 100
      const closureSa = sa * options.closureSaWidth * 100

      let cfSa
      if (options.closurePosition == 'front') {
        cfSa = closureSa
      } else {
        cfSa = sa * options.cfSaWidth * 100
      }
      let sideSeamSa
      if (
        options.closurePosition == 'side' ||
        options.closurePosition == 'sideLeft' ||
        options.closurePosition == 'sideRight'
      ) {
        sideSeamSa = closureSa
      } else {
        sideSeamSa = sa * options.sideSeamSaWidth * 100
      }

      points.saWaistDartLeft = utils.beamsIntersect(
        points.cfWaist.shiftTowards(points.waistDartLeft, sa).rotate(-90, points.cfWaist),
        points.waistDartLeft.shiftTowards(points.cfWaist, sa).rotate(90, points.waistDartLeft),
        points.waistDartTip,
        points.waistDartLeft
      )

      points.saWaistDartEdge = utils.beamsIntersect(
        points.bust,
        points.waistDartMid,
        points.waistDartLeft
          .shiftTowards(points.waistDartEdge, sa)
          .rotate(-90, points.waistDartLeft),
        points.waistDartEdge.shiftTowards(points.waistDartLeft, sa).rotate(90, points.waistDartEdge)
      )

      points.saWaistDartRight = utils.beamsIntersect(
        points.waistDartTip,
        points.waistDartRight,
        points.waistDartRight.shiftTowards(points.sideWaist, sa).rotate(-90, points.waistDartRight),
        points.sideWaist.shiftTowards(points.waistDartRight, sa).rotate(90, points.sideWaist)
      )

      points.saSideWaist = utils.beamsIntersect(
        points.waistDartRight.shiftTowards(points.sideWaist, sa).rotate(-90, points.waistDartRight),
        points.sideWaist.shiftTowards(points.waistDartRight, sa).rotate(90, points.sideWaist),
        points.sideWaist.shiftTowards(points.armhole, sideSeamSa).rotate(-90, points.sideWaist),
        points.armhole.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armhole)
      )

      points.saArmholeCorner = utils.beamsIntersect(
        points.sideWaist.shiftTowards(points.armhole, sideSeamSa).rotate(-90, points.sideWaist),
        points.armhole.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armhole),
        points.armhole.shiftTowards(points.armholeCp2, armholeSa).rotate(-90, points.armhole),
        points.armholeCp2.shiftTowards(points.armhole, armholeSa).rotate(90, points.armholeCp2)
      )

      points.saBustDartBottom = points.bustDartBottom
        .shift(points.armholePitchCp1.angle(points.bustDartBottom), armholeSa)
        .shift(points.armholePitchCp1.angle(points.bustDartBottom) - 90, armholeSa)

      points.saBustDartEdge = utils.beamsIntersect(
        points.saBustDartBottom,
        points.saBustDartBottom.shift(points.bustDartBottom.angle(points.bustDartEdge), 1),
        points.bust,
        points.bustDartMid
      )

      paths.saArmholeTop = paths.armhole.split(points.armholePitch)[1].offset(armholeSa).hide()

      points.saArmholeSplit = paths.saArmholeTop.intersects(
        new Path()
          .move(points.saBustDartEdge)
          .line(
            points.saBustDartEdge.shift(
              points.bustDartEdge.angle(points.bustDartTop),
              points.shoulder.dist(points.hps)
            )
          )
      )[0]

      points.saShoulderCorner = points.shoulder
        .shift(points.hps.angle(points.shoulder), armholeSa)
        .shift(points.hps.angle(points.shoulder) + 90, shoulderSa)

      points.saHps = utils.beamsIntersect(
        paths.cfNeck.offset(neckSa).start(),
        paths.cfNeck
          .offset(neckSa)
          .start()
          .shift(points.hps.angle(points.shoulder) + 90, 1),
        points.shoulder.shiftTowards(points.hps, shoulderSa).rotate(-90, points.shoulder),
        points.hps.shiftTowards(points.shoulder, shoulderSa).rotate(90, points.hps)
      )

      points.saCfNeck = points.cfNeck.translate(-cfSa, -neckSa)
      points.saCfWaist = points.cfWaist.translate(-cfSa, sa)

      paths.sa = new Path()
        .move(points.saCfWaist)
        .line(points.saWaistDartLeft)
        .line(points.saWaistDartEdge)
        .line(points.saWaistDartRight)
        .line(points.saSideWaist)
        .line(points.saArmholeCorner)
        .join(paths.armhole.split(points.bustDartBottom)[0].offset(armholeSa))
        .line(points.saBustDartBottom)
        .line(points.saBustDartEdge)
        .line(points.saArmholeSplit)
        .join(paths.saArmholeTop.split(points.saArmholeSplit)[1])
        .line(points.saShoulderCorner)
        .line(points.saHps)
        .join(paths.cfNeck.offset(neckSa))
        .line(points.saCfNeck)
        .line(points.saCfWaist)
        .close()
        .attr('class', 'fabric sa')
    }
  }

  return part
}
