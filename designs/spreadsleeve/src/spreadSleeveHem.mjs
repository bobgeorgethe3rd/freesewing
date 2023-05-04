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
  for (let i in paths) delete paths[i]
  //measurements
  const spreadAngle = store.get('spreadAngle')
  const sleeveCapFraction = store.get('sleeveCapFraction')
  const sleeveLength = store.get('sleeveLength')

  //left rotate
  const rotLeft0 = [
    'bicepsLeft',
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
    'bicepsLeft',
    'bottomLeft',
    'capQ4Cp2',
    'capQ3Cp2',
    'capQ4Cp1',
    'capQ4',
    'capQ4Bottom',
  ]
  for (const p of rotLeft1) points[p] = points[p].rotate(spreadAngle / 5, points.capQ3Bottom)
  points.capQ3R = points.capQ3.rotate(spreadAngle / 5, points.capQ3Bottom)

  const rotLeft2 = ['bicepsLeft', 'bottomLeft', 'capQ4Cp2']
  for (const p of rotLeft2) points[p] = points[p].rotate(spreadAngle / 5, points.capQ4Bottom)
  points.capQ4R = points.capQ4.rotate(spreadAngle / 5, points.capQ4Bottom)

  // paths.rotateLeft = new Path()
  // .move(points.sleeveTip)
  // .line(points.capQ3)
  // .line(points.capQ3R)
  // .line(points.capQ4)
  // .line(points.capQ4R)
  // .line(points.bicepsLeft)
  // .line(points.bottomLeft)
  // .line(points.capQ4Bottom)
  // .line(points.capQ3Bottom)
  // .line(points.sleeveTipBottom)

  //right rotate
  const rotRight0 = [
    'bicepsRight',
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
    'bicepsRight',
    'bottomRight',
    'capQ1Cp1',
    'capQ2Cp1',
    'capQ1Cp2',
    'capQ1',
    'capQ1Bottom',
  ]
  for (const p of rotRight1) points[p] = points[p].rotate(-spreadAngle / 5, points.capQ2Bottom)
  points.capQ2R = points.capQ2.rotate(-spreadAngle / 5, points.capQ2Bottom)

  const rotRight2 = ['bicepsRight', 'bottomRight', 'capQ1Cp1']
  for (const p of rotRight2) points[p] = points[p].rotate(-spreadAngle / 5, points.capQ1Bottom)
  points.capQ1R = points.capQ1.rotate(-spreadAngle / 5, points.capQ1Bottom)

  // paths.rotateRight = new Path()
  // .move(points.sleeveTipBottom)
  // .line(points.capQ2Bottom)
  // .line(points.capQ1Bottom)
  // .line(points.bottomRight)
  // .line(points.bicepsRight)
  // .line(points.capQ1R)
  // .line(points.capQ1)
  // .line(points.capQ2R)
  // .line(points.capQ2)
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
  // .line(points.bicepsRight)
  // ._curve(points.capQ1Cp1, points.capQ1R)
  // .line(points.capQ1Bottom)
  // .line(points.capQ1)
  // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2R)
  // .line(points.capQ2Bottom)
  // .line(points.capQ2)
  // .line(points.capQ2Cp2)
  // .line(points.sleeveTipBottom)
  // .line(points.capQ3Cp1)
  // .line(points.capQ3)
  // .line(points.capQ3Bottom)
  // .line(points.capQ3R)
  // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
  // .line(points.capQ4Bottom)
  // .line(points.capQ4R)
  // .curve_(points.capQ4Cp2, points.bicepsLeft)
  // .line(points.bottomLeft)
  // .attr('class', 'various lashed')

  //sleevecapN
  points.capQ1N = utils.beamsIntersect(
    points.capQ1Cp1,
    points.capQ1R,
    points.capQ1,
    points.capQ1Bottom.rotate(90, points.capQ1)
  )
  points.capQ2N = utils.beamsIntersect(
    points.capQ2Bottom,
    points.capQ2R,
    points.capQ2,
    points.capQ2Bottom.rotate(90, points.capQ2)
  )
  points.capQ3N = utils.beamsIntersect(
    points.capQ3Bottom,
    points.capQ3R,
    points.capQ3,
    points.capQ3Bottom.rotate(-90, points.capQ3)
  )
  points.capQ4N = utils.beamsIntersect(
    points.capQ4Cp2,
    points.capQ4R,
    points.capQ4,
    points.capQ4Bottom.rotate(-90, points.capQ4)
  )

  points.capQ2Cp1N = utils
    .beamsIntersect(
      points.capQ2N,
      points.capQ2N.shift(points.capQ2Cp2.angle(points.capQ2), 1),
      points.capQ4,
      points.capQ2Cp1
    )
    .rotate(spreadAngle / -15, points.capQ2N)
  points.capQ3Cp2N = utils
    .beamsIntersect(
      points.capQ3N,
      points.capQ3N.shift(points.capQ3Cp1.angle(points.capQ3), 1),
      points.capQ2,
      points.capQ3Cp2
    )
    .rotate(spreadAngle / 15, points.capQ3N)
  points.capQ2Cp2N = utils.beamsIntersect(
    points.capQ2Cp1N,
    points.capQ2N,
    points.sleeveTipBottom,
    points.capQ2Cp2
  )
  points.capQ3Cp1N = utils.beamsIntersect(
    points.capQ3Cp2N,
    points.capQ3N,
    points.sleeveTipBottom,
    points.capQ3Cp1
  )

  // points.capQ1Cp2N = points.capQ1Cp1.shiftOutwards(points.capQ1N, points.capQ1.dist(points.capQ1Cp2))
  // points.capQ4Cp1N = points.capQ4Cp2.shiftOutwards(points.capQ4N, points.capQ4.dist(points.capQ4Cp1))

  points.capQ1Cp2Target0 = utils.beamsIntersect(
    points.capQ1,
    points.capQ1Cp2,
    points.capQ2Bottom,
    points.capQ2R
  )
  points.capQ1Cp2Target1 = utils.beamsIntersect(
    points.capQ1Cp1,
    points.capQ1N,
    points.capQ1Cp2Target0,
    points.capQ2Cp1
  )
  const capQ1Cp2Fraction =
    points.capQ1.dist(points.capQ1Cp2) / points.capQ1.dist(points.capQ1Cp2Target0)
  points.capQ1Cp2N = points.capQ1N.shiftFractionTowards(points.capQ1Cp2Target1, capQ1Cp2Fraction)

  points.capQ4Cp1Target0 = utils.beamsIntersect(
    points.capQ4,
    points.capQ4Cp1,
    points.capQ3Bottom,
    points.capQ3R
  )
  points.capQ4Cp1Target1 = utils.beamsIntersect(
    points.capQ4Cp2,
    points.capQ4N,
    points.capQ4Cp1Target0,
    points.capQ3Cp2
  )
  const capQ4Cp1Fraction =
    points.capQ4.dist(points.capQ4Cp1) / points.capQ4.dist(points.capQ4Cp1Target0)
  points.capQ4Cp1N = points.capQ4N.shiftFractionTowards(points.capQ4Cp1Target1, capQ4Cp1Fraction)

  //paths
  paths.sleevecapN = new Path()
    .move(points.bicepsRight)
    ._curve(points.capQ1Cp1, points.capQ1N)
    .curve(points.capQ1Cp2N, points.capQ2Cp1N, points.capQ2N)
    .curve(points.capQ2Cp2N, points.capQ3Cp1N, points.capQ3N)
    .curve(points.capQ3Cp2N, points.capQ4Cp1N, points.capQ4N)
    .curve_(points.capQ4Cp2, points.bicepsLeft)
    .hide()

  //hem
  if (spreadAngle > 0) {
    points.bottomCp1Target = points.bottomLeft.shift(points.bicepsLeft.angle(points.capQ4Cp2), 1)
    points.bottomCp2Target = points.bottomRight.shift(points.bicepsRight.angle(points.capQ1Cp1), 1)
    points.topAnchor = new Point(points.gridAnchor.x, points.sleeveTip.y)
    points.bottomCp1 = points.bottomLeft.shiftFractionTowards(
      utils.beamsIntersect(
        points.bottomLeft,
        points.bottomCp1Target,
        points.bottomAnchor,
        points.topAnchor.rotate(90, points.bottomAnchor)
      ),
      2 / 3
    )
    points.bottomCp2 = new Point(
      (points.capQ2Bottom.x - points.capQ3Bottom.x) / -2,
      points.bottomAnchor.y
    )
    points.bottomCp3 = points.bottomCp2.flipX(points.bottomAnchor)
    points.bottomCp4 = points.bottomRight.shiftFractionTowards(
      utils.beamsIntersect(
        points.bottomRight,
        points.bottomCp2Target,
        points.bottomAnchor,
        points.topAnchor.rotate(-90, points.bottomAnchor)
      ),
      2 / 3
    )
  } else {
    points.bottomCp1 = points.capQ3Bottom
    points.bottomCp2 = points.capQ3Bottom
    points.bottomCp3 = points.capQ2Bottom
    points.bottomCp4 = points.capQ2Bottom
  }

  paths.hemBase = new Path()
    .move(points.bottomLeft)
    .curve(points.bottomCp1, points.bottomCp2, points.bottomAnchor)
    .curve(points.bottomCp3, points.bottomCp4, points.bottomRight)
    .hide()

  paths.saLeft = new Path().move(points.bicepsLeft).line(points.bottomLeft).hide()

  paths.saRight = new Path().move(points.bottomRight).line(points.bicepsRight).hide()

  paths.seam = paths.hemBase.join(paths.saRight).join(paths.sleevecapN).join(paths.saLeft).close()

  //stores
  store.set('hemWidth', paths.hemBase.length())

  if (complete) {
    //grainline
    points.grainlineFrom = points.sleeveTip
    points.grainlineTo = points.sleeveTipBottom
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //sleeve head notches
    points.frontNotch = paths.sleevecapN.shiftAlong(store.get('frontArmholeToArmholePitch'))
    points.backNotch = paths.sleevecapN.reverse().shiftAlong(store.get('backArmholeToArmholePitch'))
    points.sleeveTipNotch = paths.sleevecapN.shiftFractionAlong(sleeveCapFraction)
    macro('sprinkle', {
      snippet: 'notch',
      on: ['frontNotch', 'sleeveTipNotch'],
    })
    snippets.backNotch = new Snippet('bnotch', points.backNotch)
    //sleeve hem notches
    if (options.sleeveBands || options.flounces != 'none') {
      let j
      for (let i = 0; i < 3; i++) {
        j = i + 1
        points['bottomNotch' + i] = paths.hemBase.shiftFractionAlong(j / 4)
        snippets['bottomNotch' + i] = new Snippet('notch', points['bottomNotch' + i])
      }
    }
    //title
    points.title = new Point(
      (points.capQ3.x + points.capQ3Cp1N.x) / 3,
      (points.grainlineTo.y + points.grainlineFrom.y) / 2
    )
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'sleeve' + ' (spread ' + options.spreadType + ')',
      scale: 0.5,
    })
    //hemA
    let hemA
    if (options.sleeveBands || options.flounces != 'none') hemA = sa
    else hemA = sa * options.sleeveHemWidth * 100
    if (sa) {
      if (sleeveLength == 0) {
        points.saRight = points.bottomCp4.shiftOutwards(points.bicepsRight, sa)
        points.saLeft = points.bottomCp1.shiftOutwards(points.bicepsLeft, sa)
        paths.sa = paths.hemBase
          .offset(hemA)
          .line(points.saRight)
          .join(paths.sleevecapN.offset(sa * options.sleeveCapSaWidth * 100))
          .line(points.saLeft)
          .close()
          .attr('class', 'fabric sa')
      } else {
        paths.sa = paths.hemBase
          .offset(hemA)
          .join(paths.saRight.offset(sa))
          .join(paths.sleevecapN.offset(sa * options.sleeveCapSaWidth * 100))
          .join(paths.saLeft.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }
  }
  return part
}
