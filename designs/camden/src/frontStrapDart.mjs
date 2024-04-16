export const frontStrapDart = ({
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
  points.bustDartTop = points.strapLeft.shiftFractionTowards(
    points.strapRight,
    options.bustDartFraction
  )
  points.bustDartBottomI = points.bustDartBottom
  points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)

  const rot = ['strapRight', 'strapRightCp1', 'armholeDropCp2', 'armholeDrop']
  for (const p of rot) points[p] = points[p].rotate(-bustDartAngle, points.bust)
  points.strapMidR = points.strapMid.rotate(-bustDartAngle, points.bust)

  points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
  points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)

  points.bustDartTip = points.bustDartMid.shiftFractionTowards(points.bust, options.bustDartLength)
  points.bustDartEdge = utils.beamsIntersect(
    points.strapLeft,
    points.strapLeft.shift(0, 1),
    points.bust,
    points.bustDartMid
  )
  //daisy guide
  if (options.daisyGuide) {
    paths.daisyGuide = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .line(points.bust)
      .line(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armhole.rotate(-bustDartAngle, points.bust))
      .curve(
        points.armholeCp2.rotate(-bustDartAngle, points.bust),
        points.armholePitchCp1.rotate(-bustDartAngle, points.bust),
        points.armholePitch.rotate(-bustDartAngle, points.bust)
      )
      .curve_(
        points.armholePitchCp2.rotate(-bustDartAngle, points.bust),
        points.shoulder.rotate(-bustDartAngle, points.bust)
      )
      .line(points.shoulderPitch.rotate(-bustDartAngle, points.bust))
      .line(points.bust)
      .line(points.shoulderPitch)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .attr('class', 'various lashed')
  }

  //paths
  paths.hemBase = new Path().move(points.cfHem).curve_(points.cfHemCp2, points.sideHem).hide()

  paths.sideSeam = new Path()
    .move(points.sideHem)
    .curve(points.sideHemCp2, points.bustDartBottomCp1, points.bustDartBottomI)
    .line(points.armholeDrop)
    .hide()

  paths.necklineRight = new Path()
    .move(points.armholeDrop)
    .curve(points.armholeDropCp2, points.strapRightCp1, points.strapRight)
    .hide()

  paths.strapRight = new Path().move(points.strapRight).line(points.bustDartBottom).hide()

  paths.dart = new Path()
    .move(points.bustDartBottom)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
    .hide()

  paths.strapLeft = new Path().move(points.bustDartTop).line(points.strapLeft).hide()

  paths.necklineLeft = new Path()
    .move(points.strapLeft)
    ._curve(points.cfTopCp1, points.cfTop)
    .hide()

  paths.cf = new Path().move(points.cfTop).line(points.cfHem).hide()

  paths.seam = paths.hemBase
    .clone()
    .join(paths.sideSeam)
    .join(paths.necklineRight)
    .join(paths.strapRight)
    .join(paths.dart)
    .join(paths.strapLeft)
    .join(paths.necklineLeft)
    .join(paths.cf)
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
    snippets.bust = new Snippet('notch', points.bust)

    if (points.cfTop.y < points.cfChest.y) {
      snippets.cfChest = new Snippet('notch', points.cfChest)
    }

    if (options.bustDartFraction < 0.5) {
      snippets.strapMidR = new Snippet('notch', points.strapMidR)
    }
    if (options.bustDartFraction > 0.5) {
      snippets.strapMid = new Snippet('notch', points.strapMid)
    }
    //title
    points.title = new Point(
      points.bust.x * 0.55,
      points.armholeDrop.rotate(bustDartAngle, points.bust).y
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
      const cfSa = sa * options.cfSaWidth * 100
      const sideSeamSa = sa * options.sideSeamSaWidth * 100
      const hemSa = sa * options.hemWidth * 100

      let necklineSa
      if (options.bodiceFacings) {
        necklineSa = sa
      } else {
        necklineSa = sa * options.necklineSaWidth * 100
      }

      if (options.length == 0) {
        points.saSideHem = utils.beamsIntersect(
          points.cfHemCp2.shiftTowards(points.sideHem, hemSa).rotate(-90, points.cfHemCp2),
          points.sideHem.shiftTowards(points.cfHemCp2, hemSa).rotate(90, points.sideHem),
          points.sideHem
            .shiftTowards(points.bustDartBottom, sideSeamSa)
            .rotate(-90, points.sideHem),
          points.bustDartBottom
            .shiftTowards(points.sideHem, sideSeamSa)
            .rotate(90, points.bustDartBottom)
        )
      } else {
        points.saSideHem = utils.beamsIntersect(
          points.cfHemCp2.shiftTowards(points.sideHem, hemSa).rotate(-90, points.cfHemCp2),
          points.sideHem.shiftTowards(points.cfHemCp2, hemSa).rotate(90, points.sideHem),
          points.sideHem.shiftTowards(points.sideHemCp2, sideSeamSa).rotate(-90, points.sideHem),
          points.sideHemCp2.shiftTowards(points.sideHem, sideSeamSa).rotate(90, points.sideHemCp2)
        )
      }

      points.saArmholeDropCorner = utils.beamsIntersect(
        points.bustDartBottomI
          .shiftTowards(points.armholeDrop, sideSeamSa)
          .rotate(-90, points.bustDartBottomI),
        points.armholeDrop
          .shiftTowards(points.bustDartBottomI, sideSeamSa)
          .rotate(90, points.armholeDrop),
        points.armholeDrop
          .shiftTowards(points.armholeDropCp2, necklineSa)
          .rotate(-90, points.armholeDrop),
        points.armholeDropCp2
          .shiftTowards(points.armholeDrop, necklineSa)
          .rotate(90, points.armholeDropCp2)
      )

      points.saStrapRight = points.strapRight
        .shift(points.strapMidR.angle(points.strapRight), necklineSa)
        .shift(points.strapRightCp1.angle(points.strapRight), sa)

      points.saBustDartBottom = utils.beamsIntersect(
        points.saStrapRight,
        points.saStrapRight.shift(points.strapRight.angle(points.strapMidR), 1),
        points.bust,
        points.bustDartBottom
      )

      points.saBustDartEdge = utils.beamsIntersect(
        points.bust,
        points.bustDartMid,
        points.bustDartBottom
          .shiftTowards(points.bustDartEdge, sa)
          .rotate(-90, points.bustDartBottom),
        points.bustDartEdge.shiftTowards(points.bustDartBottom, sa).rotate(90, points.bustDartEdge)
      )

      points.saStrapLeftAnchor = points.strapLeft.shift(90, sa)

      points.necklineRightStart = points.strapLeft
        .shiftTowards(points.cfTopCp1, necklineSa)
        .rotate(-90, points.strapLeft)

      if (
        points.cfTop.y == points.strapLeft.y ||
        points.necklineRightStart.y < points.saStrapLeftAnchor.y
      ) {
        points.saStrapLeft = points.saStrapLeftAnchor
      } else {
        points.saStrapLeft = utils.beamsIntersect(
          points.saStrapLeftAnchor,
          points.saStrapLeftAnchor.shift(0, 1),
          points.necklineRightStart,
          points.cfTopCp1.shiftTowards(points.strapLeft, necklineSa).rotate(90, points.cfTopCp1)
        )
        if (points.saStrapLeft.x > points.saStrapLeftAnchor.x) {
          points.saStrapLeft = points.saStrapLeftAnchor
        }
      }

      points.saCfTop = points.cfTop.shift(180, cfSa)
      points.saCfHem = points.cfHem.translate(-cfSa, hemSa)

      paths.sa = paths.hemBase
        .offset(hemSa)
        .line(points.saSideHem)
        .line(paths.sideSeam.offset(sideSeamSa).start())
        .join(paths.sideSeam.offset(sideSeamSa))
        .line(points.saArmholeDropCorner)
        .line(paths.necklineRight.offset(necklineSa).start())
        .join(paths.necklineRight.offset(necklineSa))
        .line(points.saStrapRight)
        .line(points.saBustDartBottom)
        .line(points.saBustDartEdge)
        .line(points.saStrapLeft)
        .line(paths.necklineLeft.offset(necklineSa).start())
        .join(paths.necklineLeft.offset(necklineSa))
        .line(points.saCfTop)
        .line(points.saCfHem)
        .close()
        .attr('class', 'fabric sa')
    }
  }

  return part
}
