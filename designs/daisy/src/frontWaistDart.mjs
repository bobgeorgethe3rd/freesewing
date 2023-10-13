export const frontWaistDart = ({
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
  const rot = ['waistDartRight', 'sideWaist', 'bustDartBottom']
  for (const p of rot) points[p] = points[p].rotate(bustDartAngle, points.bust)

  points.waistDartMid = points.waistDartLeft.shiftFractionTowards(points.waistDartRight, 0.5)
  points.waistDartTip = points.waistDartMid.shiftFractionTowards(
    points.bust,
    options.waistDartLength
  )
  points.waistDartEdge = utils.beamsIntersect(
    points.waistDartLeft,
    points.bust.rotate(-90, points.waistDartLeft),
    points.bust,
    points.waistDartMid
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
    .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
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
    paths.dartEdge = new Path()
      .move(points.waistDartLeft)
      .line(points.waistDartEdge)
      .line(points.waistDartRight)
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
        points.sideWaist
          .shiftTowards(points.bustDartBottom, sideSeamSa)
          .rotate(-90, points.sideWaist),
        points.bustDartBottom
          .shiftTowards(points.sideWaist, sideSeamSa)
          .rotate(90, points.bustDartBottom)
      )

      points.saArmholeCorner = utils.beamsIntersect(
        points.saArmholeCp2,
        points.saArmhole,
        points.armhole.shiftTowards(points.sideWaistInitial, sideSeamSa).rotate(90, points.armhole),
        points.sideWaistInitial
          .shiftTowards(points.armhole, sideSeamSa)
          .rotate(90, points.sideWaistInitial)
      )

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
        .line(points.saArmhole)
        .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
        .curve_(points.saArmholePitchCp2, points.saShoulder)
        .line(points.saShoulderCorner)
        .line(points.saHps)
        .line(paths.cfNeck.offset(neckSa).start())
        .join(paths.cfNeck.offset(neckSa))
        .line(points.saCfNeck)
        .line(points.saCfWaist)
        .close()
        .attr('class', 'fabric sa')
    }
  }

  return part
}
