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
  for (let i in paths) delete paths[i]
  //measures
  const bustDartAngle = store.get('bustDartAngle')
  //let's begin
  points.bustDartBottomI = points.bustDartBottom
  points.bustDartTopI = points.bustDartTop

  points.armholeDropR = points.armholeDrop.rotate(-bustDartAngle, points.bust)
  const rot = ['bustDartBottom', 'bustDartBottomCp1', 'sideHemCp2', 'sideHem']
  for (const p of rot) points[p + 'R'] = points[p].rotate(bustDartAngle, points.bust)

  paths.sideSeamR = new Path()
    .move(points.sideHemR)
    .curve(points.sideHemCp2R, points.bustDartBottomCp1R, points.bustDartTopI)
    .line(points.armholeDrop)
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
  paths.hemBase = new Path().move(points.cfHem).curve_(points.cfHemCp2, points.sideHem).hide()

  if (options.length > 0) {
    paths.sideSeamBottom = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.bustDartBottomCp1, points.bustDartBottomI)
      .split(points.bustDartBottom)[0]
      .hide()
  } else {
    paths.sideSeamBottom = new Path().move(points.sideHem).line(points.bustDartBottom).hide()
  }

  paths.dart = new Path()
    .move(points.bustDartBottom)
    .line(points.bustDartTip)
    .line(points.bustDartTop)
    .hide()

  paths.sideSeamTop = paths.sideSeamR.split(points.bustDartTop)[1].hide()

  paths.necklineRight = new Path()
    .move(points.armholeDrop)
    .curve(points.armholeDropCp2, points.strapRightCp1, points.strapRight)
    .hide()

  paths.strap = new Path().move(points.strapRight).line(points.strapLeft).hide()

  paths.necklineLeft = new Path()
    .move(points.strapLeft)
    ._curve(points.cfTopCp1, points.cfTop)
    .hide()

  paths.cf = new Path().move(points.cfTop).line(points.cfHem).hide()

  paths.seam = paths.hemBase
    .clone()
    .join(paths.sideSeamBottom)
    .join(paths.dart)
    .join(paths.sideSeamTop)
    .join(paths.necklineRight)
    .join(paths.strap)
    .join(paths.necklineLeft)
    .join(paths.cf)
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
      on: ['bust', 'strapMid'],
    })
    if (points.cfTop.y < points.cfChest.y) {
      snippets.cfChest = new Snippet('notch', points.cfChest)
    }
    //title
    points.title = new Point(points.bust.x * 0.55, points.armholeDrop.y)
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

      paths.saSideSeamTopSa = paths.sideSeamTop.offset(sideSeamSa).hide()

      if (options.length == 0) {
        points.saSideHem = points.sideHem
          .shiftTowards(points.bustDartBottomI, sideSeamSa)
          .rotate(-90, points.sideHem)
        points.saSideHemCp2 = points.sideHemCp2
          .shiftTowards(points.bustDartBottomI, sideSeamSa)
          .rotate(-90, points.sideHemCp2)

        points.saSideHem = utils.beamsIntersect(
          points.cfHemCp2.shiftTowards(points.sideHem, hemSa).rotate(-90, points.cfHemCp2),
          points.sideHem.shiftTowards(points.cfHemCp2, hemSa).rotate(90, points.sideHem),
          points.sideHem
            .shiftTowards(points.bustDartBottomI, sideSeamSa)
            .rotate(-90, points.sideHem),
          points.bustDartBottomI
            .shiftTowards(points.sideHem, sideSeamSa)
            .rotate(90, points.bustDartBottomI)
        )
      } else {
        points.saSideHem = points.sideHem
          .shiftTowards(points.sideHemCp2, sideSeamSa)
          .rotate(-90, points.sideHem)
        points.saSideHemCp2 = points.sideHemCp2
          .shiftTowards(points.sideHem, sideSeamSa)
          .rotate(90, points.sideHemCp2)

        points.saSideHem = utils.beamsIntersect(
          points.cfHemCp2.shiftTowards(points.sideHem, hemSa).rotate(-90, points.cfHemCp2),
          points.sideHem.shiftTowards(points.cfHemCp2, hemSa).rotate(90, points.sideHem),
          points.sideHem.shiftTowards(points.sideHemCp2, sideSeamSa).rotate(-90, points.sideHem),
          points.sideHemCp2.shiftTowards(points.sideHem, sideSeamSa).rotate(90, points.sideHemCp2)
        )
      }

      points.saBustDartBottomCp1 = points.bustDartBottomCp1
        .shiftTowards(points.armholeDropR, sideSeamSa)
        .rotate(-90, points.bustDartBottomCp1)
      points.saBustDartBottom = points.bustDartBottomI
        .shiftTowards(points.armholeDropR, sideSeamSa)
        .rotate(-90, points.bustDartBottomI)
      points.saArmholeDropR = points.armholeDropR
        .shiftTowards(points.bustDartBottomI, sideSeamSa)
        .rotate(90, points.armholeDropR)

      points.saBustDartEdge = points.bustDartEdge
        .shiftTowards(points.bustDartBottom, sideSeamSa)
        .rotate(90, points.bustDartEdge)

      const saSideSeamBottomSplit =
        utils.lineIntersectsCurve(
          points.bustDartBottom
            .shiftTowards(points.bustDartEdge, sideSeamSa)
            .rotate(-90, points.bustDartBottom),
          points.bustDartEdge
            .shiftTowards(points.bustDartBottom, sideSeamSa)
            .rotate(90, points.bustDartEdge),
          points.saSideHem,
          points.saSideHemCp2,
          points.saBustDartBottomCp1,
          points.saBustDartBottom
        ) ||
        utils.beamsIntersect(
          points.bust,
          points.bustDartBottom,
          points.bustDartBottom
            .shiftTowards(points.bustDartEdge, sideSeamSa)
            .rotate(-90, points.bustDartBottom),
          points.bustDartEdge
            .shiftTowards(points.bustDartBottom, sideSeamSa)
            .rotate(90, points.bustDartEdge)
        )

      points.saSideSeamBottomSplit = saSideSeamBottomSplit

      points.saSideSeamTopSaStart = paths.saSideSeamTopSa.start()

      if (points.bustDartMid.y < points.bust.y) {
        points.saBustDartEdge = utils.beamsIntersect(
          points.bust,
          points.bustDartMid,
          points.bustDartBottomI
            .shiftTowards(points.armholeDropR, sideSeamSa)
            .rotate(-90, points.bustDartBottomI),
          points.armholeDropR
            .shiftTowards(points.bustDartBottomI, sideSeamSa)
            .rotate(90, points.armholeDropR)
        )
      } else {
        points.saBustDartEdge = utils.beamsIntersect(
          points.bust,
          points.bustDartMid,
          points.saSideSeamTopSaStart,
          points.bustDartTop.rotate(90, points.saSideSeamTopSaStart)
        )
      }

      points.saArmholeDropCorner = utils.beamsIntersect(
        points.bustDartTopI
          .shiftTowards(points.armholeDrop, sideSeamSa)
          .rotate(-90, points.bustDartTopI),
        points.armholeDrop
          .shiftTowards(points.bustDartTopI, sideSeamSa)
          .rotate(90, points.armholeDrop),
        points.armholeDrop
          .shiftTowards(points.armholeDropCp2, necklineSa)
          .rotate(-90, points.armholeDrop),
        points.armholeDropCp2
          .shiftTowards(points.armholeDrop, necklineSa)
          .rotate(90, points.armholeDropCp2)
      )

      points.saStrapRight = points.strapRight.translate(necklineSa, -sa)
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
          points.saStrapRight,
          points.saStrapLeftAnchor,
          points.necklineRightStart,
          points.cfTopCp1.shiftTowards(points.strapLeft, necklineSa).rotate(90, points.cfTopCp1)
        )
        if (points.saStrapLeft.x > points.saStrapLeftAnchor.x) {
          points.saStrapLeft = points.saStrapLeftAnchor
        }
      }

      points.saCfTop = points.cfTop.shift(180, cfSa)
      points.saCfHem = points.cfHem.translate(-cfSa, hemSa)

      paths.saSideSeamBottom = new Path()
        .move(points.saSideHem)
        .curve(points.saSideHemCp2, points.saBustDartBottomCp1, points.saBustDartBottom)
        .hide()

      if (points.saSideSeamBottomSplit.y < points.saBustDartBottom.y) {
        paths.saSideSeamBottom = paths.saSideSeamBottom.line(points.saSideSeamBottomSplit).hide()
      } else {
        if (
          points.saSideSeamBottomSplit.y >= points.saSideHem.y ||
          points.saSideSeamBottomSplit.sitsRoughlyOn(points.saSideHem)
        ) {
          paths.saSideSeamBottom = new Path()
            .move(points.saSideHem)
            .line(points.saSideSeamBottomSplit)
            .hide()
        } else {
          paths.saSideSeamBottom = paths.saSideSeamBottom
            .line(points.saArmholeDropR)
            .split(points.saSideSeamBottomSplit)[0]
            .hide()
        }
      }

      paths.sa = paths.hemBase
        .offset(hemSa)
        .line(points.saSideHem)
        .line(paths.saSideSeamBottom.start())
        .join(paths.saSideSeamBottom)
        .line(points.saBustDartEdge)
        .line(points.saSideSeamTopSaStart)
        .join(paths.saSideSeamTopSa)
        .line(points.saArmholeDropCorner)
        .line(paths.necklineRight.offset(necklineSa).start())
        .join(paths.necklineRight.offset(necklineSa))
        .line(points.saStrapRight)
        .line(paths.strap.offset(sa).start())
        .join(paths.strap.offset(sa))
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
