export const draftRaglanSleeveCap = (part) => {
  const { Point, points, paths, Path, store, options, utils } = part.shorthand()

  points.hps = points.sleeveTip.shift(90, store.get('shoulderLength'))

  points.cfNeckCorner = points.hps
    .shiftTowards(points.sleeveTip, store.get('neckFrontDepth'))
    .rotate(store.get('neckFrontAngle'), points.hps)
  points.cfNeck = points.cfNeckCorner
    .shiftTowards(points.hps, store.get('neckFrontWidth'))
    .rotate(-90, points.cfNeckCorner)
  points.cfNeckCp2 = points.cfNeck.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)
  points.hpsCp1 = points.hps.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)
  points.cbNeckCp1 = points.hps
    .shiftTowards(points.sleeveTip, store.get('neckBackCpDistDiag'))
    .rotate(-store.get('neckBackCpAngleDiag'), points.hps)
  points.cbNeck = points.cbNeckCp1.shift(
    270 - store.get('neckBackCpAngle'),
    store.get('neckBackCpDist')
  )

  paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()
  paths.cfNeck = new Path()
    .move(points.cfNeck)
    .curve(points.cfNeckCp2, points.hpsCp1, points.hps)
    .hide()

  void store.setIfUnset('neckSplitWidth', paths.cbNeck.length() * options.raglanNeckWidth)

  const neckSplitWidth = store.get('neckSplitWidth')
  points.cbNeckSplit = paths.cbNeck.shiftAlong(neckSplitWidth)
  points.cfNeckSplit = paths.cfNeck.reverse().shiftAlong(neckSplitWidth)

  points.backArmholeSplit = paths.sleevecap
    .reverse()
    .shiftAlong(store.get('backArmholeSplitLength'))
  points.frontArmholeSplit = paths.sleevecap.shiftAlong(store.get('frontArmholeSplitLength'))

  points.frontArmholeSplitAnchor = paths.sleevecap.shiftAlong(store.get('frontArmholeSplitLength'))
  points.frontArmholeSplitTarget = points.cfNeckSplit.translate(
    store.get('frontArmholeSplitWidth'),
    store.get('frontArmholeSplitDepth')
  )

  points.backArmholeSplitAnchor = paths.sleevecap
    .reverse()
    .shiftAlong(store.get('backArmholeSplitLength'))
  points.backArmholeSplitTarget = points.cbNeckSplit.translate(
    -store.get('backArmholeSplitWidth'),
    store.get('backArmholeSplitDepth')
  )

  let sleeveFrontTweak = 0.5
  let sleeveFrontDelta
  do {
    points.frontArmholeSplit = points.frontArmholeSplitAnchor.shiftFractionTowards(
      points.frontArmholeSplitTarget,
      sleeveFrontTweak
    )

    points.frontArmholeSplitCp2 = utils.beamIntersectsX(
      points.frontArmholeSplit,
      points.frontArmholeSplit.shift(points.sleeveCapRight.angle(points.cfNeckSplit), 1),
      points.cfNeckSplit.x
    )

    points.frontArmholeSplitCp1 = utils.beamIntersectsY(
      points.frontArmholeSplitCp2,
      points.frontArmholeSplit,
      points.sleeveCapRight.y
    )

    paths.sleeveCapFront = new Path()
      .move(points.sleeveCapRight)
      ._curve(points.frontArmholeSplitCp1, points.frontArmholeSplit)
      .curve_(points.frontArmholeSplitCp2, points.cfNeckSplit)
      .hide()

    sleeveFrontDelta = paths.sleeveCapFront.length() - store.get('frontRaglanLength')
    if (sleeveFrontDelta > 0) sleeveFrontTweak = sleeveFrontTweak * 1.01
    else sleeveFrontTweak = sleeveFrontTweak * 0.99
  } while (Math.abs(sleeveFrontDelta) > 1)

  let sleeveBackTweak = 0.5
  let sleeveBackDelta
  do {
    points.backArmholeSplit = points.backArmholeSplitAnchor.shiftFractionTowards(
      points.backArmholeSplitTarget,
      sleeveBackTweak
    )

    points.backArmholeSplitCp1 = utils.beamIntersectsX(
      points.backArmholeSplit,
      points.backArmholeSplit.shift(points.sleeveCapLeft.angle(points.cbNeckSplit), 1),
      points.cbNeckSplit.x
    )

    points.backArmholeSplitCp2 = utils.beamIntersectsY(
      points.backArmholeSplitCp1,
      points.backArmholeSplit,
      points.sleeveCapLeft.y
    )

    paths.sleeveCapBack = new Path()
      .move(points.cbNeckSplit)
      ._curve(points.backArmholeSplitCp1, points.backArmholeSplit)
      .curve_(points.backArmholeSplitCp2, points.sleeveCapLeft)
      .hide()

    sleeveBackDelta = paths.sleeveCapBack.length() - store.get('backRaglanLength')
    if (sleeveBackDelta > 0) sleeveBackTweak = sleeveBackTweak * 1.01
    else sleeveBackTweak = sleeveBackTweak * 0.99
  } while (Math.abs(sleeveBackDelta) > 1)

  //paths
  paths.neck = paths.cfNeck
    .split(points.cfNeckSplit)[1]
    .join(paths.cbNeck.split(points.cbNeckSplit)[0])
    .hide()

  paths.setSleeve = paths.seam.hide()
  paths.seam = paths.setSleeve
    .split(points.sleeveCapRight)[0]
    .join(paths.sleeveCapFront)
    .join(paths.neck)
    .join(paths.sleeveCapBack)
    .join(paths.setSleeve.split(points.sleeveCapLeft)[1])
    .close()
}
