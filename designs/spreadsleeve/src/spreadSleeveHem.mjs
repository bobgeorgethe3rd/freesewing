export const spreadSleeveHem = ({
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
  //removing any paths from sleeveBase. This may not be necessary but is useful when working with the guides on.
  // paths.sleeveInitial = paths.spread.attr('class', 'lining lashed', true)
  for (let i in paths) delete paths[i]
  //measurements
  const spreadAngle = store.get('spreadAngle')
  const sleeveLength = store.get('sleeveLength')
  const sleeveLeftSideLength = points.sleeveCapLeft.dist(points.bottomLeft)
  const sleeveRightSideLength = points.sleeveCapRight.dist(points.bottomRight)
  const capQ1Check = utils.pointOnLine(
    points.sleeveCapRight,
    points.bottomRight,
    points.capQ1Bottom
  )
  const capQ4Check = utils.pointOnLine(points.sleeveCapLeft, points.bottomLeft, points.capQ4Bottom)
  //left rotate
  const rotLeft0 = [
    'sleeveCapLeft',
    'sleeveTipLeft',
    'bottomLeft',
    'capQ4Cp2',
    'capQ3Cp2',
    'capQ4Cp1',
    'capQ4',
    'capQ4Bottom',
    'capQ3Cp1',
    'capQ3',
    'capQ3Bottom',
  ]
  for (const p of rotLeft0) points[p] = points[p].rotate(spreadAngle / 10, points.sleeveTipBottom)

  const rotLeft1 = [
    'sleeveCapLeft',
    'bottomLeft',
    'capQ4Cp2',
    'capQ3Cp2',
    'capQ4Cp1',
    'capQ4',
    'capQ4Bottom',
  ]
  for (const p of rotLeft1) points[p] = points[p].rotate(spreadAngle / 5, points.capQ3Bottom)
  points.capQ3R = points.capQ3.rotate(spreadAngle / 5, points.capQ3Bottom)

  let rotLeft2
  if (capQ4Check) {
    rotLeft2 = ['sleeveCapLeft', 'capQ4Cp2']
  } else {
    rotLeft2 = ['sleeveCapLeft', 'bottomLeft', 'capQ4Cp2']
  }
  for (const p of rotLeft2) points[p] = points[p].rotate(spreadAngle / 5, points.capQ4Bottom)
  points.capQ4R = points.capQ4.rotate(spreadAngle / 5, points.capQ4Bottom)

  if (capQ4Check) {
    points.bottomLeft = points.sleeveCapLeft.shiftTowards(points.bottomLeft, sleeveLeftSideLength)
  }

  // paths.rotateLeft = new Path()
  // .move(points.sleeveTip)
  // .line(points.sleeveTipLeft)
  // ._curve(points.capQ3Cp1, points.capQ3)
  // .line(points.capQ3R)
  // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
  // .line(points.capQ4R)
  // .curve_(points.capQ4Cp2, points.sleeveCapLeft)
  // .line(points.bottomLeft)
  // .line(points.capQ4Bottom)
  // .line(points.capQ3Bottom)
  // .line(points.sleeveTipBottom)

  //right rotate
  const rotRight0 = [
    'sleeveCapRight',
    'sleeveTipRight',
    'bottomRight',
    'capQ1Cp1',
    'capQ2Cp1',
    'capQ1Cp2',
    'capQ1',
    'capQ1Bottom',
    'capQ2Cp2',
    'capQ2',
    'capQ2Bottom',
  ]
  for (const p of rotRight0) points[p] = points[p].rotate(-spreadAngle / 10, points.sleeveTipBottom)

  const rotRight1 = [
    'sleeveCapRight',
    'bottomRight',
    'capQ1Cp1',
    'capQ2Cp1',
    'capQ1Cp2',
    'capQ1',
    'capQ1Bottom',
  ]
  for (const p of rotRight1) points[p] = points[p].rotate(-spreadAngle / 5, points.capQ2Bottom)
  points.capQ2R = points.capQ2.rotate(-spreadAngle / 5, points.capQ2Bottom)

  let rotRight2
  if (capQ1Check) {
    rotRight2 = ['sleeveCapRight', 'capQ1Cp1']
  } else {
    rotRight2 = ['sleeveCapRight', 'bottomRight', 'capQ1Cp1']
  }
  for (const p of rotRight2) points[p] = points[p].rotate(-spreadAngle / 5, points.capQ1Bottom)
  points.capQ1R = points.capQ1.rotate(-spreadAngle / 5, points.capQ1Bottom)

  if (capQ1Check) {
    points.bottomRight = points.sleeveCapRight.shiftTowards(
      points.bottomRight,
      sleeveRightSideLength
    )
  }

  // paths.rotateRight = new Path()
  // .move(points.sleeveTipBottom)
  // .line(points.capQ2Bottom)
  // .line(points.capQ1Bottom)
  // .line(points.bottomRight)
  // .line(points.sleeveCapRight)
  // .curve_(points.capQ1Cp1, points.capQ1R)
  // .line(points.capQ1)
  // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2R)
  // .line(points.capQ2)
  // .curve_(points.capQ2Cp2, points.sleeveTipRight)
  // .line(points.sleeveTip)

  //spread guide
  //Uncomment to see how the spread works. Helpful if re-working please keep.
  // paths.spread = new Path()
  // .move(points.bottomLeft)
  // .line(points.capQ4Bottom)
  // .line(points.capQ3Bottom)
  // .line(points.sleeveTipBottom)
  // .line(points.capQ2Bottom)
  // .line(points.capQ1Bottom)
  // .line(points.bottomRight)
  // .line(points.sleeveCapRight)
  // ._curve(points.capQ1Cp1, points.capQ1R)
  // .line(points.capQ1Bottom)
  // .line(points.capQ1)
  // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2R)
  // .line(points.capQ2Bottom)
  // .line(points.capQ2)
  // .curve_(points.capQ2Cp2, points.sleeveTipRight)
  // .line(points.sleeveTipBottom)
  // .line(points.sleeveTipLeft)
  // ._curve(points.capQ3Cp1, points.capQ3)
  // .line(points.capQ3Bottom)
  // .line(points.capQ3R)
  // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
  // .line(points.capQ4Bottom)
  // .line(points.capQ4R)
  // .curve_(points.capQ4Cp2, points.sleeveCapLeft)
  // .line(points.bottomLeft)
  // .attr('class', 'various lashed')

  //sleevecap revisions
  points.capQ1 = points.capQ1R
  points.capQ4 = points.capQ4R
  points.capQ1Cp2 = points.capQ1.shiftFractionTowards(
    points.capQ1Cp2.rotate(-spreadAngle / 5, points.capQ1Bottom),
    1 + options.spread
  )
  points.capQ4Cp1 = points.capQ4.shiftFractionTowards(
    points.capQ4Cp1.rotate(spreadAngle / 5, points.capQ4Bottom),
    1 + options.spread
  )

  points.capQ2 = utils.beamsIntersect(
    points.capQ2Bottom,
    points.capQ2R,
    points.capQ2,
    points.capQ2Bottom.rotate(90, points.capQ2)
  )

  points.capQ3 = utils.beamsIntersect(
    points.capQ3Bottom,
    points.capQ3R,
    points.capQ3,
    points.capQ3Bottom.rotate(-90, points.capQ3)
  )

  points.capQ2Cp1 = points.capQ2.shift(
    points.capQ2R.angle(points.capQ2Cp1) + spreadAngle / 10,
    points.capQ2R.dist(points.capQ2Cp1) * (1 + options.spread)
  )
  points.capQ3Cp2 = points.capQ3.shift(
    points.capQ3R.angle(points.capQ3Cp2) - spreadAngle / 10,
    points.capQ3R.dist(points.capQ3Cp2) * (1 + options.spread)
  )
  points.capQ3Cp1I = utils.beamsIntersect(
    points.capQ3Cp2,
    points.capQ3,
    points.sleeveTipBottom,
    points.capQ3Cp1
  )
  points.capQ2Cp2I = utils.beamsIntersect(
    points.capQ2Cp1,
    points.capQ2,
    points.sleeveTipBottom,
    points.capQ2Cp2
  )

  const sleeveTipI = utils.lineIntersectsCurve(
    points.sleeveTip,
    points.sleeveTipBottom.rotate(180, points.sleeveTip),
    points.capQ2,
    points.capQ2Cp2I,
    points.capQ3Cp1I,
    points.capQ3
  )
  if (points.sleeveTip.y > sleeveTipI.y) {
    points.sleeveTip = sleeveTipI
  }
  points.capQ2Cp2 = utils.beamsIntersect(
    points.capQ2Cp1,
    points.capQ2,
    points.sleeveTip,
    points.sleeveTip.shift(0, 1)
  )

  points.capQ3Cp1 = utils.beamsIntersect(
    points.capQ3Cp2,
    points.capQ3,
    points.sleeveTip,
    points.sleeveTip.shift(180, 1)
  )

  //paths
  paths.sleevecap = new Path()
    .move(points.sleeveCapRight)
    ._curve(points.capQ1Cp1, points.capQ1)
    .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
    .curve_(points.capQ2Cp2, points.sleeveTip)
    ._curve(points.capQ3Cp1, points.capQ3)
    .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
    .curve_(points.capQ4Cp2, points.sleeveCapLeft)
    .hide()

  //hem
  if (spreadAngle > 0) {
    points.bottomMidCp1 = utils.beamsIntersect(
      points.bottomLeft,
      points.bottomLeft.shift(points.sleeveCapLeft.angle(points.capQ4Cp2), 1),
      points.bottomAnchor,
      points.bottomAnchor.shift(180, 1)
    )
    points.bottomLeftCp2 = points.bottomLeft.shiftFractionTowards(
      points.bottomMidCp1,
      options.spread / 3
    )
    points.bottomMidCp2 = utils.beamsIntersect(
      points.bottomRight,
      points.bottomRight.shift(points.sleeveCapRight.angle(points.capQ1Cp1), 1),
      points.bottomAnchor,
      points.bottomAnchor.shift(0, 1)
    )
    points.bottomRightCp1 = points.bottomRight.shiftFractionTowards(
      points.bottomMidCp2,
      options.spread / 3
    )

    paths.hemBase = new Path()
      .move(points.bottomLeft)
      .curve(points.bottomLeftCp2, points.bottomMidCp1, points.bottomAnchor)
      .curve(points.bottomMidCp2, points.bottomRightCp1, points.bottomRight)
      .hide()
  } else {
    points.bottomLeftCp2 = points.bottomAnchor
    points.bottomRightCp1 = points.bottomAnchor
    paths.hemBase = new Path().move(points.bottomLeft).line(points.bottomRight)
  }

  paths.saLeft = new Path().move(points.sleeveCapLeft).line(points.bottomLeft).hide()

  paths.saRight = new Path().move(points.bottomRight).line(points.sleeveCapRight).hide()

  paths.seam = paths.hemBase.join(paths.saRight).join(paths.sleevecap).join(paths.saLeft).close()

  //stores
  store.set('bandLength', paths.hemBase.length())

  if (complete) {
    //grainline
    points.grainlineFrom = points.sleeveTip
    points.grainlineTo = points.sleeveTipBottom
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //sleeve head notches
    points.frontNotch = paths.sleevecap.shiftAlong(store.get('frontArmholeToArmholePitch'))
    points.backNotch = paths.sleevecap.reverse().shiftAlong(store.get('backArmholeToArmholePitch'))
    macro('sprinkle', {
      snippet: 'notch',
      on: ['frontNotch', 'sleeveTip'],
    })
    snippets.backNotch = new Snippet('bnotch', points.backNotch)
    //sleeve hem notches
    if (options.sleeveBands || options.sleeveFlounces != 'none') {
      let j
      for (let i = 0; i < 3; i++) {
        j = i + 1
        points['bottomNotch' + i] = paths.hemBase.shiftFractionAlong(j / 4)
        snippets['bottomNotch' + i] = new Snippet('notch', points['bottomNotch' + i])
      }
    }
    //title
    points.title = new Point(
      (points.capQ3.x + points.capQ3Cp1.x) / 3,
      (points.grainlineTo.y + points.grainlineFrom.y) / 2
    )
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'Sleeve' + ' (' + utils.capitalize(options.spreadType) + ' Spread)',
      cutNr: 2,
      scale: 0.5,
    })
    if (sa) {
      let hemSa
      if (options.sleeveBands || options.sleeveFlounces != 'none') hemSa = sa
      else hemSa = sa * options.sleeveHemWidth * 100
      const sideSeamSa = sa * options.sideSeamSaWidth * 100
      const armholeSa = sa * options.armholeSaWidth * 100

      points.saSleevecapStart = paths.sleevecap.offset(armholeSa).start()
      points.saSleevecapEnd = paths.sleevecap.offset(armholeSa).end()

      points.saHemBaseStart = paths.hemBase.offset(hemSa).start()
      points.saHemBaseEnd = paths.hemBase.offset(hemSa).end()

      points.saSleeveCapLeft = points.saSleevecapEnd.shift(
        points.capQ4Cp2.angle(points.sleeveCapLeft),
        sideSeamSa
      )
      points.saSleeveCapRight = points.saSleevecapStart.shift(
        points.capQ1Cp1.angle(points.sleeveCapRight),
        sideSeamSa
      )

      if (sleeveLength == 0 || !options.fitSleeveWidth) {
        points.saTopLeft = points.sleeveCapLeft.shift(
          points.capQ4Cp2.angle(points.sleeveCapLeft),
          sideSeamSa
        )
        points.saBottomLeft = points.bottomLeft.shift(
          points.capQ4Cp2.angle(points.sleeveCapLeft),
          sideSeamSa
        )

        points.saTopRight = points.sleeveCapRight.shift(
          points.capQ1Cp1.angle(points.sleeveCapRight),
          sideSeamSa
        )
        points.saBottomRight = points.bottomRight.shift(
          points.capQ1Cp1.angle(points.sleeveCapRight),
          sideSeamSa
        )
        points.saBottomLeftCorner = points.saBottomLeft.shift(
          points.bottomLeft.angle(points.bottomLeftCp2) - 90,
          hemSa
        )
        points.saBottomRightCorner = points.saBottomRight.shift(
          points.bottomRight.angle(points.bottomRightCp1) + 90,
          hemSa
        )
      } else {
        points.saTopLeft = utils.beamsIntersect(
          points.saSleeveCapLeft,
          points.saSleevecapEnd.rotate(-90, points.saSleeveCapLeft),
          points.sleeveCapLeft
            .shiftTowards(points.bottomLeft, sideSeamSa)
            .rotate(-90, points.sleeveCapLeft),
          points.bottomLeft
            .shiftTowards(points.sleeveCapLeft, sideSeamSa)
            .rotate(90, points.bottomLeft)
        )

        points.saBottomLeft = points.bottomLeft
          .shiftTowards(points.sleeveCapLeft, sideSeamSa)
          .rotate(90, points.bottomLeft)

        points.saTopRight = utils.beamsIntersect(
          points.saSleeveCapRight,
          points.saSleevecapStart.rotate(90, points.saSleeveCapRight),
          points.bottomRight
            .shiftTowards(points.sleeveCapRight, sideSeamSa)
            .rotate(-90, points.bottomRight),
          points.sleeveCapRight
            .shiftTowards(points.bottomRight, sideSeamSa)
            .rotate(90, points.sleeveCapRight)
        )

        points.saBottomRight = points.bottomRight
          .shiftTowards(points.sleeveCapRight, sideSeamSa)
          .rotate(-90, points.bottomRight)
        points.saBottomLeftCorner = utils.beamsIntersect(
          points.saBottomLeft,
          points.saBottomLeft.shift(points.capQ4Cp2.angle(points.sleeveCapLeft) + 90, 1),
          points.saHemBaseStart,
          points.bottomLeft.rotate(90, points.saHemBaseStart)
        )
        points.saBottomRightCorner = utils.beamsIntersect(
          points.saBottomRight,
          points.saBottomRight.shift(points.capQ1Cp1.angle(points.sleeveCapRight) - 90, 1),
          points.saHemBaseEnd,
          points.bottomRight.rotate(90, points.saHemBaseEnd)
        )
      }

      paths.sa = paths.sleevecap
        .offset(armholeSa)
        .line(points.saSleeveCapLeft)
        .line(points.saTopLeft)
        .line(points.saBottomLeft)
        .line(points.saBottomLeftCorner)
        .join(paths.hemBase.offset(hemSa))
        .line(points.saBottomRightCorner)
        .line(points.saBottomRight)
        .line(points.saTopRight)
        .line(points.saSleeveCapRight)
        .close()
        .attr('class', 'fabric sa')
    }
  }
  return part
}
