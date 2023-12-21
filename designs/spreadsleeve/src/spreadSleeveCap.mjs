export const spreadSleeveCap = ({
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
  //store before rotate
  store.set('bandLength', points.bottomLeft.dist(points.bottomRight))
  //rotate left
  const rotLeft0 = [
    'bottomLeft',
    'sleeveCapLeft',
    'capQ4Cp2',
    'capQ4',
    'capQ4Cp1',
    'capQ4Bottom',
    'capQ3Cp2',
    'capQ3',
    'capQ3Cp1',
    'capQ3Bottom',
    'sleeveTipBottomLeft',
  ]
  for (const p of rotLeft0) points[p] = points[p].rotate(-spreadAngle / 10, points.sleeveTip)

  const rotLeft1 = [
    'bottomLeft',
    'sleeveCapLeft',
    'capQ4Cp2',
    'capQ4',
    'capQ4Cp1',
    'capQ4Bottom',
    'capQ3Cp2',
  ]
  for (const p of rotLeft1) points[p] = points[p].rotate(-spreadAngle / 5, points.capQ3)
  points.capQ3BottomR = points.capQ3Bottom.rotate(-spreadAngle / 5, points.capQ3)

  const rotLeft2 = ['bottomLeft', 'sleeveCapLeft', 'capQ4Cp2']
  for (const p of rotLeft2) points[p] = points[p].rotate(-spreadAngle / 5, points.capQ4)
  points.capQ4BottomR = points.capQ4Bottom.rotate(-spreadAngle / 5, points.capQ4)

  // paths.rotateLeft = new Path()
  // .move(points.sleeveTip)
  // .curve_(points.capQ3Cp1, points.capQ3)
  // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
  // .curve_(points.capQ4Cp2, points.sleeveCapLeft)
  // .line(points.bottomLeft)
  // .line(points.capQ4BottomR)
  // .line(points.capQ4Bottom)
  // .line(points.capQ3BottomR)
  // .line(points.capQ3Bottom)
  // .line(points.sleeveTipBottomLeft)
  // .line(points.sleeveTipBottom)

  //rotate right
  const rotRight0 = [
    'bottomRight',
    'sleeveCapRight',
    'capQ1Cp1',
    'capQ1',
    'capQ1Cp2',
    'capQ1Bottom',
    'capQ2Cp1',
    'capQ2',
    'capQ2Cp2',
    'capQ2Bottom',
    'sleeveTipBottomRight',
  ]
  for (const p of rotRight0) points[p] = points[p].rotate(spreadAngle / 10, points.sleeveTip)

  const rotRight1 = [
    'bottomRight',
    'sleeveCapRight',
    'capQ1Cp1',
    'capQ1',
    'capQ1Cp2',
    'capQ1Bottom',
    'capQ2Cp1',
  ]
  for (const p of rotRight1) points[p] = points[p].rotate(spreadAngle / 5, points.capQ2)
  points.capQ2BottomR = points.capQ2Bottom.rotate(spreadAngle / 5, points.capQ2)

  const rotRight2 = ['bottomRight', 'sleeveCapRight', 'capQ1Cp1']
  for (const p of rotRight2) points[p] = points[p].rotate(spreadAngle / 5, points.capQ1)
  points.capQ1BottomR = points.capQ1Bottom.rotate(spreadAngle / 5, points.capQ1)

  // paths.rotateRight = new Path()
  // .move(points.sleeveTipBottom)
  // .line(points.sleeveTipBottomRight)
  // .line(points.capQ2Bottom)
  // .line(points.capQ2BottomR)
  // .line(points.capQ1Bottom)
  // .line(points.capQ1BottomR)
  // .line(points.bottomRight)
  // .line(points.sleeveCapRight)
  // ._curve(points.capQ1Cp1, points.capQ1)
  // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
  // ._curve(points.capQ2Cp2, points.sleeveTip)
  //sleevecap revision

  points.capQ1Cp2 = points.capQ1Cp1.shiftOutwards(points.capQ1, points.capQ1.dist(points.capQ1Cp2))
  points.capQ2Cp1 = points.capQ2Cp2.shiftOutwards(points.capQ2, points.capQ2.dist(points.capQ2Cp1))
  points.capQ3Cp2 = points.capQ3Cp1.shiftOutwards(points.capQ3, points.capQ3.dist(points.capQ3Cp2))
  points.capQ4Cp1 = points.capQ4Cp2.shiftOutwards(points.capQ4, points.capQ4.dist(points.capQ4Cp1))
  points.sleeveTip = new Point(points.sleeveTip.x, points.capQ3Cp1.y)

  paths.sleevecap = new Path()
    .move(points.sleeveCapRight)
    ._curve(points.capQ1Cp1, points.capQ1)
    .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
    ._curve(points.capQ2Cp2, points.sleeveTip)
    .curve_(points.capQ3Cp1, points.capQ3)
    .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
    .curve_(points.capQ4Cp2, points.sleeveCapLeft)
    .hide()

  //guide
  //Uncomment to see how the spread works. Helpful if re-working please keep.
  // paths.spread = new Path()
  // .move(points.bottomLeft)
  // .line(points.capQ4BottomR)
  // .line(points.capQ4)
  // .line(points.capQ4Bottom)
  // .line(points.capQ3BottomR)
  // .line(points.capQ3)
  // .line(points.capQ3Bottom)
  // .line(points.sleeveTipBottomLeft)
  // .line(points.sleeveTip)
  // .line(points.sleeveTipBottomRight)
  // .line(points.capQ2Bottom)
  // .line(points.capQ2)
  // .line(points.capQ2BottomR)
  // .line(points.capQ1Bottom)
  // .line(points.capQ1)
  // .line(points.capQ1BottomR)
  // .line(points.bottomRight)
  // .line(points.sleeveCapRight)
  // ._curve(points.capQ1Cp1, points.capQ1)
  // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
  // ._curve(points.capQ2Cp2, points.sleeveTip)
  // .curve_(points.capQ3Cp1, points.capQ3)
  // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
  // .curve_(points.capQ4Cp2, points.sleeveCapLeft)
  // .line(points.bottomLeft)
  // .attr('class', 'various lashed')

  //hem
  points.bottomMid = utils.beamsIntersect(
    points.capQ3BottomR,
    points.sleeveTipBottomLeft,
    points.midAnchor,
    points.bottomAnchor
  )

  if (spreadAngle == 0) {
    points.bottomLeftCp2 = points.capQ3BottomR
    points.bottomRightCp1 = points.capQ2BottomR
  } else {
    points.topAnchor = new Point(points.bottomAnchor.x, points.sleeveTip.y)
    points.bottomLeftCp2Target = utils.beamsIntersect(
      points.bottomLeft,
      points.bottomLeft.shift(points.sleeveCapLeft.angle(points.capQ4Cp2), 1),
      points.topAnchor,
      points.bottomAnchor.rotate(-spreadAngle / 5, points.topAnchor)
    )
    points.bottomLeftCp2 = utils.beamsIntersect(
      points.bottomMid,
      points.bottomMid.shift(180, 1),
      points.bottomLeft,
      points.bottomLeftCp2Target
    )
    points.bottomRightCp1 = points.bottomLeftCp2.flipX(points.bottomAnchor)
  }
  points.bottomMidCp1 = points.bottomMid.shiftFractionTowards(points.bottomLeftCp2, 0.1)
  points.bottomMidCp2 = points.bottomMidCp1.flipX(points.bottomAnchor)

  if (utils.pointOnLine(points.sleeveCapLeft, points.bottomLeft, points.capQ4BottomR)) {
    paths.hemBaseLeft = new Path()
      .move(points.bottomLeft)
      .curve(points.bottomLeftCp2, points.bottomMidCp1, points.bottomMid)
      .hide()
  } else {
    paths.hemBaseLeft = new Path()
      .move(points.bottomLeft)
      .line(points.capQ4BottomR)
      .curve(points.bottomLeftCp2, points.bottomMidCp1, points.bottomMid)
      .hide()
  }

  if (utils.pointOnLine(points.sleeveCapRight, points.bottomRight, points.capQ1BottomR)) {
    paths.hemBaseRight = new Path()
      .move(points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomRightCp1, points.bottomRight)
      .hide()
  } else {
    paths.hemBaseRight = new Path()
      .move(points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomRightCp1, points.capQ1BottomR)
      .line(points.bottomRight)
      .hide()
  }

  paths.hemBase = paths.hemBaseLeft.join(paths.hemBaseRight).hide()

  //seam paths
  paths.saRight = new Path().move(points.bottomRight).line(points.sleeveCapRight).hide()

  paths.saLeft = new Path().move(points.sleeveCapLeft).line(points.bottomLeft).hide()

  paths.seam = paths.hemBase.join(paths.saRight).join(paths.sleevecap).join(paths.saLeft).close()

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
    points.title = new Point(points.capQ3.x, (points.grainlineTo.y + points.grainlineFrom.y) / 2)
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'Sleeve' + ' (' + utils.capitalize(options.spreadType) + ' Spread)',
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

      if (options.sleeveLength == 0) {
        points.saSleeveCapLeft = paths.sleevecap
          .offset(armholeSa)
          .end()
          .shift(points.capQ4Cp2.angle(points.sleeveCapLeft), sideSeamSa)
        points.saTopLeft = points.sleeveCapLeft.shift(
          points.capQ4Cp2.angle(points.bottomLeft),
          sideSeamSa
        )
        points.saBottomLeft = points.bottomLeft.shift(
          points.capQ4Cp2.angle(points.bottomLeft),
          sideSeamSa
        )
        points.saSleeveCapRight = paths.sleevecap
          .offset(armholeSa)
          .start()
          .shift(points.capQ1Cp1.angle(points.sleeveCapRight), sideSeamSa)
        points.saTopRight = points.sleeveCapRight.shift(
          points.capQ1Cp1.angle(points.sleeveCapRight),
          sideSeamSa
        )
        points.saBottomRight = points.bottomRight.shift(
          points.capQ1Cp1.angle(points.sleeveCapRight),
          sideSeamSa
        )
      } else {
        points.saTopLeft = utils.beamsIntersect(
          points.sleeveCapLeft
            .shiftTowards(points.bottomLeft, sideSeamSa)
            .rotate(-90, points.sleeveCapLeft),
          points.bottomLeft
            .shiftTowards(points.sleeveCapLeft, sideSeamSa)
            .rotate(90, points.bottomLeft),
          points.capQ4Cp2,
          points.sleeveCapLeft
        )
        points.saSleeveCapLeft = utils.beamsIntersect(
          points.saSleevecapEnd,
          points.sleeveCapLeft.rotate(-90, points.saSleevecapEnd),
          points.saTopLeft,
          points.sleeveCapLeft.rotate(90, points.saTopLeft)
        )
        points.saBottomLeft = utils.beamsIntersect(
          points.sleeveCapLeft
            .shiftTowards(points.bottomLeft, sideSeamSa)
            .rotate(-90, points.sleeveCapLeft),
          points.bottomLeft
            .shiftTowards(points.sleeveCapLeft, sideSeamSa)
            .rotate(90, points.bottomLeft),
          points.bottomLeftCp2,
          points.bottomLeft
        )
        points.saTopRight = utils.beamsIntersect(
          points.bottomRight
            .shiftTowards(points.sleeveCapRight, sideSeamSa)
            .rotate(-90, points.bottomRight),
          points.sleeveCapRight
            .shiftTowards(points.bottomRight, sideSeamSa)
            .rotate(90, points.sleeveCapRight),
          points.capQ1Cp1,
          points.sleeveCapRight
        )
        points.saSleeveCapRight = utils.beamsIntersect(
          points.saSleevecapStart,
          points.sleeveCapRight.rotate(90, points.saSleevecapStart),
          points.saTopRight,
          points.sleeveCapRight.rotate(-90, points.saTopRight)
        )
        points.saBottomRight = utils.beamsIntersect(
          points.bottomRight
            .shiftTowards(points.sleeveCapRight, sideSeamSa)
            .rotate(-90, points.bottomRight),
          points.sleeveCapRight
            .shiftTowards(points.bottomRight, sideSeamSa)
            .rotate(90, points.sleeveCapRight),
          points.bottomRightCp1,
          points.bottomRight
        )
      }

      points.saBottomLeftCorner = points.saBottomLeft.shift(
        points.bottomLeft.angle(points.bottomLeftCp2) - 90,
        hemSa
      )
      points.saBottomRightCorner = points.saBottomRight.shift(
        points.bottomRight.angle(points.bottomRightCp1) + 90,
        hemSa
      )

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
