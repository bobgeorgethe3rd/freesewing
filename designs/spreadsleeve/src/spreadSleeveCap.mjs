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
  for (let i in paths) delete paths[i]
  //measurements
  let spreadAngle = store.get('spreadAngle')
  let sleeveCapFraction = store.get('sleeveCapFraction')
  let sleeveLength = store.get('sleeveLength')

  //rotate left
  let rotLeft0 = [
    'bottomLeft',
    'bicepsLeft',
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

  let rotLeft1 = [
    'bottomLeft',
    'bicepsLeft',
    'capQ4Cp2',
    'capQ4',
    'capQ4Cp1',
    'capQ4Bottom',
    'capQ3Cp2',
  ]
  for (const p of rotLeft1) points[p] = points[p].rotate(-spreadAngle / 5, points.capQ3)
  points.capQ3BottomR = points.capQ3Bottom.rotate(-spreadAngle / 5, points.capQ3)

  let rotLeft2 = ['bottomLeft', 'bicepsLeft', 'capQ4Cp2']
  for (const p of rotLeft2) points[p] = points[p].rotate(-spreadAngle / 5, points.capQ4)
  points.capQ4BottomR = points.capQ4Bottom.rotate(-spreadAngle / 5, points.capQ4)

  // paths.rotateLeft = new Path()
  // .move(points.capQ3)
  // .line(points.capQ4)
  // .line(points.bicepsLeft)
  // .line(points.bottomLeft)
  // .line(points.capQ4BottomR)
  // .line(points.capQ4Bottom)
  // .line(points.capQ3BottomR)
  // .line(points.capQ3Bottom)
  // .line(points.sleeveTipBottomLeft)
  // .line(points.sleeveTipBottom)

  //rotate right
  let rotRight0 = [
    'bottomRight',
    'bicepsRight',
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

  let rotRight1 = [
    'bottomRight',
    'bicepsRight',
    'capQ1Cp1',
    'capQ1',
    'capQ1Cp2',
    'capQ1Bottom',
    'capQ2Cp1',
  ]
  for (const p of rotRight1) points[p] = points[p].rotate(spreadAngle / 5, points.capQ2)
  points.capQ2BottomR = points.capQ2Bottom.rotate(spreadAngle / 5, points.capQ2)

  let rotRight2 = ['bottomRight', 'bicepsRight', 'capQ1Cp1']
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
  // .line(points.bicepsRight)
  // .line(points.capQ1)
  // .line(points.capQ2)

  //sleevecap revision
  let capQ1P =
    points.capQ1Cp2.dist(points.capQ1) /
    (points.capQ1Cp2.dist(points.capQ1) + points.capQ1Cp1.dist(points.capQ1))
  let capQ2P =
    points.capQ2Cp2.dist(points.capQ2) /
    (points.capQ2Cp2.dist(points.capQ2) + points.capQ2Cp1.dist(points.capQ2))
  let capQ3P =
    points.capQ3Cp2.dist(points.capQ3) /
    (points.capQ3Cp2.dist(points.capQ3) + points.capQ3Cp1.dist(points.capQ3))
  let capQ4P =
    points.capQ4Cp2.dist(points.capQ4) /
    (points.capQ4Cp2.dist(points.capQ4) + points.capQ4Cp1.dist(points.capQ4))

  points.capQ1N = points.capQ1Cp2.shiftFractionTowards(points.capQ1Cp1, capQ1P)
  points.capQ2N = points.capQ2Cp2.shiftFractionTowards(points.capQ2Cp1, capQ2P)
  points.capQ3N = points.capQ3Cp2.shiftFractionTowards(points.capQ3Cp1, capQ3P)
  points.capQ4N = points.capQ4Cp2.shiftFractionTowards(points.capQ4Cp1, capQ4P)

  paths.sleevecapN = new Path()
    .move(points.bicepsRight)
    .curve(points.bicepsRight, points.capQ1Cp1, points.capQ1N)
    .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2N)
    .curve(points.capQ2Cp2, points.capQ3Cp1, points.capQ3N)
    .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4N)
    .curve(points.capQ4Cp2, points.bicepsLeft, points.bicepsLeft)
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
  // .line(points.bicepsRight)
  // .curve(points.bicepsRight, points.capQ1Cp1, points.capQ1)
  // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
  // .curve(points.capQ2Cp2, points.capQ3Cp1, points.capQ3)
  // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
  // .curve(points.capQ4Cp2, points.bicepsLeft, points.bicepsLeft)
  // .line(points.bottomLeft)
  // .attr('class', 'various lashed')

  //hem
  points.bottomMid = utils.beamsIntersect(
    points.capQ3BottomR,
    points.sleeveTipBottomLeft,
    points.sleeveTip,
    points.sleeveTip.shift(-90, 1)
  )
  if (spreadAngle == 0) {
    points.bottomCp1 = points.capQ3BottomR
    points.bottomCp4 = points.capQ2BottomR
  } else {
    points.bottomCp1Target = utils.beamsIntersect(
      points.bottomLeft,
      points.capQ4BottomR,
      points.capQ3,
      points.capQ3BottomR
    )
    points.bottomCp4Target = utils.beamsIntersect(
      points.bottomRight,
      points.capQ1BottomR,
      points.capQ2,
      points.capQ2BottomR
    )
    points.bottomCp1 = utils.beamsIntersect(
      points.bottomMid,
      points.bottomMid.shift(180, 1),
      points.bottomLeft,
      points.bottomCp1Target
    )
    points.bottomCp4 = utils.beamsIntersect(
      points.bottomMid,
      points.bottomMid.shift(0, 1),
      points.bottomRight,
      points.bottomCp4Target
    )
  }
  points.bottomCp2 = points.bottomMid.shiftFractionTowards(points.bottomCp1, 0.1)
  points.bottomCp3 = points.bottomMid.shiftFractionTowards(points.bottomCp4, 0.1)

  if (points.capQ4BottomR.x < points.bottomLeft.x) {
    paths.hemBaseLeft = new Path()
      .move(points.bottomLeft)
      .curve(points.bottomCp1, points.bottomCp2, points.bottomMid)
      .hide()
  } else {
    paths.hemBaseLeft = new Path()
      .move(points.bottomLeft)
      .line(points.capQ4BottomR)
      .curve(points.bottomCp1, points.bottomCp2, points.bottomMid)
      .hide()
  }

  if (points.bottomRight.x > points.capQ1BottomR.x) {
    paths.hemBaseRight = new Path()
      .move(points.bottomMid)
      .curve(points.bottomCp3, points.bottomCp4, points.capQ1BottomR)
      .line(points.bottomRight)
      .hide()
  } else {
    paths.hemBaseRight = new Path()
      .move(points.bottomMid)
      .curve(points.bottomCp3, points.bottomCp4, points.bottomRight)
      .hide()
  }

  paths.hemBase = paths.hemBaseLeft.join(paths.hemBaseRight).hide()

  //seam paths
  paths.saRight = new Path().move(points.bottomRight).line(points.bicepsRight).hide()

  paths.saLeft = new Path().move(points.bicepsLeft).line(points.bottomLeft).hide()

  paths.seam = paths.hemBase.join(paths.saRight).join(paths.sleevecapN).join(paths.saLeft).close()

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
    points.title = new Point(points.capQ3N.x, points.grainlineTo.y / 3)
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
