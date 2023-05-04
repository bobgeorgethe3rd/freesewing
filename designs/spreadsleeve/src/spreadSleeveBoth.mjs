export const spreadSleeveBoth = ({
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
  const spread = points.bicepsLeft.dist(points.bicepsRight) * options.spread
  const sleeveCapFraction = store.get('sleeveCapFraction')
  const sleeveLength = store.get('sleeveLength')
  //store before rotate
  store.set('hemWidth', points.bottomLeft.dist(points.bottomRight))
  //left shift
  const shiftLeft0 = [
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
    'sleeveTipBottomLeft',
  ]
  for (const p of shiftLeft0) points[p] = points[p].shift(180, spread / 10)

  const shiftLeft1 = [
    'bicepsLeft',
    'bottomLeft',
    'capQ4Cp2',
    'capQ3Cp2',
    'capQ4Cp1',
    'capQ4',
    'capQ4Bottom',
  ]
  for (const p of shiftLeft1) points[p] = points[p].shift(180, spread / 5)
  points.capQ3M = points.capQ3.shift(180, spread / 5)
  points.capQ3BottomM = points.capQ3Bottom.shift(180, spread / 5)

  const shiftLeft2 = ['bicepsLeft', 'bottomLeft', 'capQ4Cp2']
  for (const p of shiftLeft2) points[p] = points[p].shift(180, spread / 5)
  points.capQ4M = points.capQ4.shift(180, spread / 5)
  points.capQ4BottomM = points.capQ4Bottom.shift(180, spread / 5)

  // paths.shiftLeft = new Path()
  // .move(points.sleeveTip)
  // .line(points.capQ3)
  // .line(points.capQ3M)
  // .line(points.capQ4)
  // .line(points.capQ4M)
  // .line(points.bicepsLeft)
  // .line(points.bottomLeft)
  // .line(points.bottomAnchor)

  //right shift
  const shiftRight0 = [
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
    'sleeveTipBottomRight',
  ]
  for (const p of shiftRight0) points[p] = points[p].shift(0, spread / 10)

  const shiftRight1 = [
    'bicepsRight',
    'bottomRight',
    'capQ1Cp1',
    'capQ2Cp1',
    'capQ1Cp2',
    'capQ1',
    'capQ1Bottom',
  ]
  for (const p of shiftRight1) points[p] = points[p].shift(0, spread / 5)
  points.capQ2M = points.capQ2.shift(0, spread / 5)
  points.capQ2BottomM = points.capQ2Bottom.shift(0, spread / 5)

  const shiftRight2 = ['bicepsRight', 'bottomRight', 'capQ1Cp1']
  for (const p of shiftRight2) points[p] = points[p].shift(0, spread / 5)
  points.capQ1M = points.capQ1.shift(0, spread / 5)
  points.capQ1BottomM = points.capQ1Bottom.shift(0, spread / 5)

  // paths.shiftRight = new Path()
  // .move(points.bottomAnchor)
  // .line(points.bottomRight)
  // .line(points.bicepsRight)
  // .line(points.capQ1M)
  // .line(points.capQ1)
  // .line(points.capQ2M)
  // .line(points.capQ2)
  // .line(points.sleeveTip)

  //Why do it this way rather than shift ones that are shifted multiple times?
  //Simple we are emulating slash and spreading of a paper sleeve and this helps visualize this method but also understand what we are doing

  //guides
  //Uncomment to see how the spread works. Helpful if re-working please keep.
  // paths.spread = new Path()
  // .move(points.bicepsLeft)
  // .line(points.bottomLeft)
  // .line(points.bottomRight)
  // .line(points.bicepsRight)
  // ._curve(points.capQ1Cp1, points.capQ1M)
  // .line(points.capQ1BottomM)
  // .line(points.capQ1Bottom)
  // .line(points.capQ1)
  // .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2M)
  // .line(points.capQ2BottomM)
  // .line(points.capQ2Bottom)
  // .line(points.capQ2)
  // .line(points.capQ2Cp2)
  // .line(points.sleeveTipBottomRight)
  // .line(points.sleeveTipBottomLeft)
  // .line(points.capQ3Cp1)
  // .line(points.capQ3)
  // .line(points.capQ3Bottom)
  // .line(points.capQ3BottomM)
  // .line(points.capQ3M)
  // .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
  // .line(points.capQ4Bottom)
  // .line(points.capQ4BottomM)
  // .line(points.capQ4M)
  // .curve_(points.capQ4Cp2, points.bicepsLeft)
  // .attr('class','various lashed')

  //hem
  points.bottomMid = points.bottomAnchor.shift(-90, spread / 10)
  points.bottomCp1 = new Point(
    (points.capQ3BottomM.x - points.capQ2BottomM.x) / 2,
    points.bottomMid.y
  )
  points.bottomCp2 = points.bottomCp1.flipX(points.bottomMid)

  //sleevecapN
  points.capQ2N = points.capQ2M.shift(90, spread / 10)
  points.capQ3N = points.capQ3M.shift(90, spread / 10)

  points.capQ1Cp2N = utils.beamsIntersect(
    points.capQ1Cp2,
    points.capQ1Cp2.shift(0, 1),
    points.capQ1Cp1,
    points.capQ1M
  )
  points.capQ2Cp1N = utils.beamsIntersect(
    points.capQ2BottomM,
    points.capQ2Cp1,
    points.capQ2N,
    points.capQ2N.shift(points.capQ2Cp2.angle(points.capQ2), 1)
  )
  points.capQ3Cp2N = utils.beamsIntersect(
    points.capQ3BottomM,
    points.capQ3Cp2,
    points.capQ3N,
    points.capQ3N.shift(points.capQ3Cp1.angle(points.capQ3), 1)
  )
  points.capQ4Cp1N = utils.beamsIntersect(
    points.capQ4Cp1,
    points.capQ4Cp1.shift(180, 1),
    points.capQ4Cp2,
    points.capQ4M
  )

  points.capQ2Cp2N = utils.beamsIntersect(
    points.sleeveTipBottomRight,
    points.capQ2Cp2,
    points.capQ2Cp1N,
    points.capQ2N
  )
  points.capQ3Cp1N = utils.beamsIntersect(
    points.sleeveTipBottomLeft,
    points.capQ3Cp1,
    points.capQ3Cp2N,
    points.capQ3N
  )

  //paths
  paths.sleevecapN = new Path()
    .move(points.bicepsRight)
    ._curve(points.capQ1Cp1, points.capQ1M)
    .curve(points.capQ1Cp2N, points.capQ2Cp1N, points.capQ2N)
    .curve(points.capQ2Cp2N, points.capQ3Cp1N, points.capQ3N)
    .curve(points.capQ3Cp2N, points.capQ4Cp1N, points.capQ4M)
    .curve_(points.capQ4Cp2, points.bicepsLeft)
    .hide()

  paths.hemBase = new Path()
    .move(points.bottomLeft)
    ._curve(points.bottomCp1, points.bottomMid)
    .curve_(points.bottomCp2, points.bottomRight)
    .hide()

  paths.saLeft = new Path().move(points.bicepsLeft).line(points.bottomLeft).hide()

  paths.saRight = new Path().move(points.bottomRight).line(points.bicepsRight).hide()

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
    points.title = new Point(
      points.capQ3.x * 0.8,
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
        points.saRight = points.bottomCp2.shiftOutwards(points.bicepsRight, sa)
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
