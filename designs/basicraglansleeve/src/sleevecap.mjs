import { pluginBundle } from '@freesewing/plugin-bundle'

export const sleevecap = {
  name: 'basicraglansleeve.sleevecap',
  options: {
    //Constants
    useVoidStores: true,
    cfNeck: 0.55191502449,
    //Sleeves
    raglanNeckWidth: { pct: 42.1, min: 15, max: 50, menu: 'sleeves' },
  },
  plugins: [pluginBundle],
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    complete,
    paperless,
    macro,
    utils,
    measurements,
    part,
    snippets,
    Snippet,
    absoluteOptions,
    log,
  }) => {
    //void stores
    if (options.useVoidStores) {
      // void store.setIfUnset('scyeBackDepth', 138)
      // void store.setIfUnset('scyeFrontDepth', 138)
      void store.setIfUnset('raglanScyeBackWidth', 239)
      void store.setIfUnset('raglanScyeBackDepth', 192)
      void store.setIfUnset('raglanScyeFrontWidth', 250)
      void store.setIfUnset('raglanScyeFrontDepth', 182)
      void store.setIfUnset('shoulderLength', 124)
      void store.setIfUnset('neckBackCpAngleDiag', 111)
      void store.setIfUnset('neckBackCpDistDiag', 44)
      void store.setIfUnset('neckBackCpAngle', 159)
      void store.setIfUnset('neckBackCpDist', 70)
      void store.setIfUnset('neckFrontWidth', 99)
      void store.setIfUnset('neckFrontDepth', 111)
      void store.setIfUnset('neckFrontAngle', 69)
      void store.setIfUnset('backRaglanLength', 343)
      void store.setIfUnset('frontRaglanLength', 306)
      void store.setIfUnset('raglanBackWidth', 106)
      void store.setIfUnset('raglanBackDepth', 204)
      void store.setIfUnset('raglanFrontWidth', 101)
      void store.setIfUnset('raglanFrontDepth', 158)
      void store.setIfUnset('raglanNeckBackAngle', 6)
      void store.setIfUnset('raglanNeckFrontAngle', 9)
      void store.setIfUnset('raglanArmholeBackAngle', 34)
      void store.setIfUnset('raglanArmholeFrontAngle', 36)
    }
    //measures
    const shoulderLength = store.get('shoulderLength')
    // const scyeDepth = (store.get('scyeBackDepth') + store.get('scyeFrontDepth')) / 2 + shoulderLength
    const sleeveCapDepth =
      (store.get('raglanScyeFrontDepth') + store.get('raglanScyeBackDepth')) / 2 //) + scyeDepth) / 2
    const raglanNeckBackAngle = store.get('raglanNeckBackAngle')
    const raglanNeckFrontAngle = store.get('raglanNeckFrontAngle')
    const raglanArmholeBackAngle = store.get('raglanArmholeBackAngle')
    const raglanArmholeFrontAngle = store.get('raglanArmholeFrontAngle')
    const raglanScyeBackWidth = store.get('raglanScyeBackWidth')
    const raglanScyeFrontWidth = store.get('raglanScyeFrontWidth')
    const backRaglanLength = store.get('backRaglanLength')
    const frontRaglanLength = store.get('frontRaglanLength')
    //let's begin
    points.origin = new Point(0, 0)
    let sleeveVertTweak = 1
    let sleeveVertDelta
    do {
      points.hps = points.origin.shift(90, sleeveCapDepth * sleeveVertTweak)
      points.sleeveTip = points.hps.shift(-90, shoulderLength)

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

      points.raglanBack = points.cbNeckSplit.translate(
        -store.get('raglanBackWidth'),
        store.get('raglanBackDepth')
      )
      points.raglanFront = points.cfNeckSplit.translate(
        store.get('raglanFrontWidth'),
        store.get('raglanFrontDepth')
      )

      if (raglanArmholeBackAngle + raglanNeckBackAngle == Math.abs(90) > 1) {
        points.raglanBackCp1 = points.raglanBack.shiftFractionTowards(points.cbNeckSplit, 0.5)
      } else {
        points.raglanBackCp1 = utils.beamsIntersect(
          points.cbNeckSplit,
          points.cbNeckSplit.shift(270 - raglanNeckBackAngle, 1),
          points.raglanBack,
          points.raglanBack.shift(raglanArmholeBackAngle, 1)
        )
      }
      if (raglanArmholeFrontAngle + raglanNeckFrontAngle == Math.abs(90) > 1) {
        points.raglanFrontCp2 = points.raglanFront.shiftFractionTowards(points.cfNeckSplit, 0.5)
      } else {
        points.raglanFrontCp2 = utils.beamsIntersect(
          points.raglanFront,
          points.raglanFront.shift(180 - raglanArmholeFrontAngle, 1),
          points.cfNeckSplit,
          points.cfNeckSplit.shift(270 + raglanNeckFrontAngle, 1)
        )
      }

      if (raglanScyeBackWidth > raglanScyeFrontWidth) {
        points.sleeveCapLeft = points.origin.shift(180, raglanScyeBackWidth)

        points.raglanBackCp2 = utils.beamIntersectsY(
          points.raglanBackCp1,
          points.raglanBack,
          points.origin.y
        )

        paths.sleeveCapBack = new Path()
          .move(points.cbNeckSplit)
          ._curve(points.raglanBackCp1, points.raglanBack)
          .curve_(points.raglanBackCp1, points.sleeveCapLeft)
          .hide()

        sleeveVertDelta = paths.sleeveCapBack.length() - backRaglanLength
      } else {
        points.sleeveCapRight = points.origin.shift(0, raglanScyeFrontWidth)

        points.raglanFrontCp1 = utils.beamIntersectsY(
          points.raglanFrontCp2,
          points.raglanFront,
          points.origin.y
        )

        paths.sleeveCapFront = new Path()
          .move(points.sleeveCapRight)
          ._curve(points.raglanFrontCp1, points.raglanFront)
          .curve_(points.raglanFrontCp2, points.cfNeckSplit)
          .hide()

        sleeveVertDelta = paths.sleeveCapFront.length() - frontRaglanLength
      }
      if (sleeveVertDelta > 0) sleeveVertTweak = sleeveVertTweak * 0.99
      else sleeveVertTweak = sleeveVertTweak * 1.01
    } while (Math.abs(sleeveVertDelta) > 0.01)

    let sleeveHoriTweak = 1
    let sleeveHoriDelta
    do {
      if (raglanScyeBackWidth < raglanScyeFrontWidth) {
        points.sleeveCapLeft = points.origin.shift(180, raglanScyeBackWidth * sleeveHoriTweak)

        points.raglanBackCp2 = utils.beamIntersectsY(
          points.raglanBackCp1,
          points.raglanBack,
          points.origin.y
        )

        paths.sleeveCapBack = new Path()
          .move(points.cbNeckSplit)
          ._curve(points.raglanBackCp1, points.raglanBack)
          .curve_(points.raglanBackCp2, points.sleeveCapLeft)
          .hide()

        sleeveHoriDelta = paths.sleeveCapBack.length() - backRaglanLength
      } else {
        points.sleeveCapRight = points.origin.shift(0, raglanScyeFrontWidth * sleeveHoriTweak)
        points.raglanFrontCp1 = utils.beamIntersectsY(
          points.raglanFrontCp2,
          points.raglanFront,
          points.origin.y
        )

        paths.sleeveCapFront = new Path()
          .move(points.sleeveCapRight)
          ._curve(points.raglanFrontCp1, points.raglanFront)
          .curve_(points.raglanFrontCp2, points.cfNeckSplit)
          .hide()

        sleeveHoriDelta = paths.sleeveCapFront.length() - frontRaglanLength
      }
      if (sleeveHoriDelta > 0) sleeveHoriTweak = sleeveHoriTweak * 0.99
      else sleeveHoriTweak = sleeveHoriTweak * 1.01
    } while (Math.abs(sleeveHoriDelta) > 0.01)

    points.midAnchor = points.sleeveCapLeft.shiftFractionTowards(points.sleeveCapRight, 0.5)

    //guides
    // paths.lengthGuide = new Path()
    // .move(points.origin)
    // .line(points.hps)

    // paths.raglanGuide = new Path()
    // .move(points.cbNeckSplit)
    // ._curve(points.raglanBackCp1, points.raglanBack)
    // .line(points.raglanFront)
    // .curve_(points.raglanFrontCp2, points.cfNeckSplit)

    //paths
    paths.neck = paths.cfNeck
      .split(points.cfNeckSplit)[1]
      .join(paths.cbNeck)
      .split(points.cbNeckSplit)[0]
      .hide()

    if (complete) {
      //notches
      points.frontNotch = paths.sleeveCapFront.shiftFractionAlong(0.5)
      points.backTopNotch = paths.sleeveCapBack.shiftFractionAlong(0.25)
      points.backBottomNotch = paths.sleeveCapBack.shiftFractionAlong(0.75)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontNotch', 'hps'],
      })
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['backTopNotch', 'backBottomNotch'],
      })
    }

    return part
  },
}
