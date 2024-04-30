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
  paths.waist = new Path()
    .move(points.cfWaist)
    .line(points.waistDartLeft)
    .line(points.waistDartTip)
    .line(points.waistDartRight)
    .line(points.sideWaist)
    .hide()

  paths.sideSeam = new Path().move(points.sideWaist).line(points.armholeR).hide()

  if (options.bustDartFraction > 0.005 && options.bustDartFraction < 0.995) {
    paths.armholeTop = paths.armhole.split(points.bustDartTop)[1].hide()
    paths.armholeBottom = paths.armholeR.split(points.bustDartBottom)[0].hide()
  } else {
    if (options.bustDartFraction <= 0.005) {
      paths.armholeTop = new Path().move(points.bustDartTop).line(points.shoulder).hide()
      paths.armholeBottom = paths.armholeR
    }
    if (options.bustDartFraction >= 0.995) {
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

  paths.seam = paths.waist
    .clone()
    .join(paths.sideSeam)
    .join(paths.armholeBottom)
    .join(paths.bustDart)
    .join(paths.armholeTop)
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

      let dartSa
      if (options.bustDartFraction <= 0.01) {
        dartSa = shoulderSa
      } else {
        dartSa = armholeSa
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
        points.sideWaist.shiftTowards(points.armholeR, sideSeamSa).rotate(-90, points.sideWaist),
        points.armholeR.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armholeR)
      )

      points.saArmholeCorner = utils.beamsIntersect(
        points.sideWaist.shiftTowards(points.armholeR, sideSeamSa).rotate(-90, points.sideWaist),
        points.armholeR.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armholeR),
        points.armholeR.shiftTowards(points.armholeCp2R, armholeSa).rotate(-90, points.armholeR),
        points.armholeCp2R.shiftTowards(points.armholeR, armholeSa).rotate(90, points.armholeCp2R)
      )

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

      if (options.bustDartFraction > 0.995) {
        points.saArmholeCorner = utils.beamsIntersect(
          points.sideWaist.shiftTowards(points.armholeR, sideSeamSa).rotate(-90, points.sideWaist),
          points.armholeR.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armholeR),
          points.saBustDartBottom,
          points.saBustDartEdge
        )
        paths.saArmholeBottom = new Path().move(points.saArmholeCorner).hide()
      } else {
        paths.saArmholeBottom = new Path()
          .move(points.saArmholeCorner)
          .join(paths.armholeBottom.offset(armholeSa).hide())
          .hide()

        const saArmholeBottomI = paths.saArmholeBottom.intersects(
          new Path().move(points.saBustDartBottom).line(points.saBustDartEdge)
        )[0]
        if (saArmholeBottomI) {
          paths.saArmholeBottom = paths.saArmholeBottom.split(saArmholeBottomI)[0].hide()
          points.saBustDartBottom = saArmholeBottomI
        } else {
          points.saBustDartBottom = utils.beamsIntersect(
            paths.saArmholeBottom.shiftFractionAlong(0.995),
            paths.saArmholeBottom.end(),
            points.saBustDartEdge,
            points.saBustDartBottom
          )
        }
      }

      points.saShoulderCorner = points.shoulder
        .shift(points.hps.angle(points.shoulder), armholeSa)
        .shift(points.hps.angle(points.shoulder) + 90, shoulderSa)

      if (options.bustDartFraction <= 0.005) {
        points.saShoulderCorner = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.shoulder.angle(points.hps), 1),
          points.saBustDartTop,
          points.saBustDartTop.shift(points.shoulder.angle(points.hps) - 90, 1)
        )

        paths.saArmholeTop = new Path().move(points.saBustDartTop).hide()
      } else {
        paths.saArmholeTop = paths.armholeTop.offset(armholeSa).line(points.saShoulderCorner).hide()

        const saArmholeTopI = paths.saArmholeTop.intersects(
          new Path().move(points.saBustDartEdge).line(points.saBustDartTop)
        )[0]
        if (saArmholeTopI) {
          if (!saArmholeTopI.sitsRoughlyOn(paths.saArmholeTop.start())) {
            paths.saArmholeTop = paths.saArmholeTop.split(saArmholeTopI)[1].hide()
          }
          points.saBustDartTop = saArmholeTopI
        } else {
          points.saBustDartTop = utils.beamsIntersect(
            points.saBustDartEdge,
            points.saBustDartTop,
            paths.saArmholeTop.shiftFractionAlong(0.005),
            paths.saArmholeTop.start()
          )
        }
      }

      points.saHps = utils.beamsIntersect(
        paths.cfNeck.offset(neckSa).start(),
        paths.cfNeck
          .offset(neckSa)
          .start()
          .shift(points.hps.angle(points.shoulder) + 90, 1),
        points.shoulder.shiftTowards(points.hps, shoulderSa).rotate(-90, points.shoulder),
        points.hps.shiftTowards(points.shoulder, shoulderSa).rotate(90, points.hps)
      )

      /*  points.saShoulderCornerR = points.saShoulderCorner.rotate(-bustDartAngle, points.bust)

      if (options.bustDartFraction < 0.01) {
        paths.saArmholeTop = new Path()
          .move(points.saShoulderCorner)
          .line(points.saShoulderCorner)
          .hide()
      } else {
        paths.saArmholeTop = paths.armholeTop.offset(armholeSa).hide()
      }

      paths.saArmholeBottom = paths.armholeBottom.offset(armholeSa).hide()

      if (options.bustDartFraction < 0.998) {
        if (options.bustDartFraction == 0) {
          points.saArmholeBottom = points.saShoulderCornerR
        } else {
          points.saArmholeBottom = paths.saArmholeBottom
            .shiftFractionAlong(0.995)
            .shiftOutwards(paths.saArmholeBottom.end(), sa * (1 - options.bustDartFraction))
        }
      } else {
        points.saArmholeBottom = points.saArmholeCorner
      } */

      points.saCfNeck = points.cfNeck.translate(-cfSa, -neckSa)
      points.saCfWaist = points.cfWaist.translate(-cfSa, sa)

      paths.sa = new Path()
        .move(points.saCfWaist)
        .line(points.saWaistDartLeft)
        .line(points.saWaistDartEdge)
        .line(points.saWaistDartRight)
        .line(points.saSideWaist)
        .line(points.saArmholeCorner)
        .join(paths.saArmholeBottom)
        .line(points.saBustDartBottom)
        .line(points.saBustDartEdge)
        .line(points.saBustDartTop)
        .join(paths.saArmholeTop)
        .line(points.saShoulderCorner)
        .line(points.saHps)
        .line(paths.cfNeck.offset(neckSa).start())
        .join(paths.cfNeck.offset(neckSa))
        .line(points.saCfNeck)
        .line(points.saCfWaist)
        .trim()
        .close()
        .attr('class', 'fabric sa')
    }
  }

  return part
}
