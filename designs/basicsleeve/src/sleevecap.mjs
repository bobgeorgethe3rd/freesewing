import { pluginBundle } from '@freesewing/plugin-bundle'

export const sleevecap = {
  name: 'basicsleeve.sleevecap',
  options: {
    //Constants
    useVoidStores: true,
    //Advanced
    // sleeveCapDepth: {pct: 1 / 3 * 100, min: 25, max: 50, menu: 'advanced'},
    capQ1Depth: { pct: (1 / 6) * 100, min: 15, max: (1 / 3) * 100, menu: 'advanced.sleevecap' },
    capQ2Depth: { pct: (2 / 3) * 100, min: 50, max: 75, menu: 'advanced.sleevecap' },
    capQ3Depth: { pct: (2 / 3) * 100, min: 50, max: 75, menu: 'advanced.sleevecap' },
    capQ4Depth: { pct: (1 / 6) * 100, min: 15, max: (1 / 3) * 100, menu: 'advanced.sleevecap' },
    capQ1Offest: { pct: 9, min: 5, max: 15, menu: 'advanced.sleevecap' },
    capQ2Offest: { pct: 17.9, min: 15, max: 25, menu: 'advanced.sleevecap' },
    capQ3Offest: { pct: 9, min: 5, max: 15, menu: 'advanced.sleevecap' },
    capQ4Offest: { pct: 17.9, min: 15, max: 25, menu: 'advanced.sleevecap' },
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
      void store.setIfUnset('scyeFrontDepth', 108)
      void store.setIfUnset('scyeBackDepth', 108)
      void store.setIfUnset('scyeFrontWidth', 193)
      void store.setIfUnset('scyeBackWidth', 193)
      void store.setIfUnset('backArmholeLength', 232)
      void store.setIfUnset('backArmholeToArmholePitch', store.get('backArmholeLength') * 0.5)
      void store.setIfUnset('frontArmholeLength', 240)
      void store.setIfUnset('frontArmholeToArmholePitch', store.get('frontArmholeLength') * 0.5)
    }
    //measures
    const scyeFrontDepth = store.get('scyeFrontDepth')
    const scyeBackDepth = store.get('scyeBackDepth')

    // const sleeveCapDepth = store.get('scyeDepth') * options.sleeveCapDepth
    let sleeveCapDepth
    if (scyeFrontDepth > scyeBackDepth) {
      sleeveCapDepth = scyeFrontDepth
    } else {
      sleeveCapDepth = scyeFrontDepth
    }

    const scyeFrontWidth = store.get('scyeFrontWidth')
    const scyeBackWidth = store.get('scyeBackWidth')
    const backArmholeLength = store.get('backArmholeLength')
    const frontArmholeLength = store.get('frontArmholeLength')
    //let's begin
    points.origin = new Point(0, 0)
    points.sleeveTip = points.origin.shift(90, sleeveCapDepth)

    let sleeveFrontTweak = 1
    let sleeveFrontTarget = frontArmholeLength
    let sleeveFrontDelta
    do {
      points.sleeveCapRight = points.origin.shift(0, scyeFrontWidth * sleeveFrontTweak)
      points.capQ1Anchor = points.sleeveCapRight.shiftFractionTowards(
        points.sleeveTip,
        options.capQ1Depth
      )
      points.capQ2Anchor = points.sleeveCapRight.shiftFractionTowards(
        points.sleeveTip,
        options.capQ2Depth
      )

      points.capQ1 = points.capQ1Anchor
        .shiftTowards(
          points.sleeveCapRight,
          sleeveCapDepth * options.capQ1Offest * sleeveFrontTweak
        )
        .rotate(-90, points.capQ1Anchor)
      points.capQ1Cp1 = utils.beamsIntersect(
        points.origin,
        points.sleeveCapRight,
        points.capQ1,
        points.capQ1.shift(points.sleeveTip.angle(points.sleeveCapRight), 1)
      )
      points.capQ1Cp2 = points.capQ1Cp1.rotate(180, points.capQ1)

      points.capQ2 = points.capQ2Anchor
        .shiftTowards(points.sleeveTip, sleeveCapDepth * options.capQ2Offest * sleeveFrontTweak)
        .rotate(-90, points.capQ2Anchor)
      points.capQ2Cp2 = utils.beamsIntersect(
        points.capQ2,
        points.capQ2.shift(points.sleeveCapRight.angle(points.sleeveTip), 1),
        points.sleeveTip,
        points.sleeveTip.shift(0, 1)
      )
      points.capQ2Cp1 = points.capQ2Cp2.rotate(180, points.capQ2)

      paths.sleeveCapFront = new Path()
        .move(points.sleeveCapRight)
        .curve_(points.capQ1Cp1, points.capQ1)
        .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
        .curve_(points.capQ2Cp2, points.sleeveTip)
        .hide()

      sleeveFrontDelta = paths.sleeveCapFront.length() - sleeveFrontTarget
      if (sleeveFrontDelta > 0) sleeveFrontTweak = sleeveFrontTweak * 0.99
      else sleeveFrontTweak = sleeveFrontTweak * 1.01
    } while (Math.abs(sleeveFrontDelta) > 1)

    let sleeveBackTweak = 1
    let sleeveBackTarget = backArmholeLength
    let sleeveBackDelta
    do {
      points.sleeveCapLeft = points.origin.shift(180, scyeBackWidth * sleeveBackTweak)
      points.capQ3Anchor = points.sleeveCapLeft.shiftFractionTowards(
        points.sleeveTip,
        options.capQ3Depth
      )
      points.capQ4Anchor = points.sleeveCapLeft.shiftFractionTowards(
        points.sleeveTip,
        options.capQ4Depth
      )

      points.capQ4 = points.capQ4Anchor
        .shiftTowards(points.sleeveCapLeft, sleeveCapDepth * options.capQ3Offest * sleeveBackTweak)
        .rotate(90, points.capQ4Anchor)
      points.capQ4Cp2 = utils.beamsIntersect(
        points.origin,
        points.sleeveCapLeft,
        points.capQ4,
        points.capQ4.shift(points.sleeveTip.angle(points.sleeveCapLeft), 1)
      )
      points.capQ4Cp1 = points.capQ4Cp2.rotate(180, points.capQ4)

      points.capQ3 = points.capQ3Anchor
        .shiftTowards(points.sleeveTip, sleeveCapDepth * options.capQ4Offest * sleeveBackTweak)
        .rotate(90, points.capQ3Anchor)
      points.capQ3Cp1 = utils.beamsIntersect(
        points.capQ3,
        points.capQ3.shift(points.sleeveCapLeft.angle(points.sleeveTip), 1),
        points.sleeveTip,
        points.sleeveTip.shift(0, 1)
      )
      points.capQ3Cp2 = points.capQ3Cp1.rotate(180, points.capQ3)

      paths.sleeveCapBack = new Path()
        .move(points.sleeveTip)
        ._curve(points.capQ3Cp1, points.capQ3)
        .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
        .curve_(points.capQ4Cp2, points.sleeveCapLeft)
        .hide()

      sleeveBackDelta = paths.sleeveCapBack.length() - sleeveBackTarget
      if (sleeveBackDelta > 0) sleeveBackTweak = sleeveBackTweak * 0.99
      else sleeveBackTweak = sleeveBackTweak * 1.01
    } while (Math.abs(sleeveBackDelta) > 1)

    // let sleeveTopTweak = 1
    // let sleeveTopTarget = new Path().move(points.capQ2).curve_(points.capQ2Cp2, points.sleeveTip)._curve(points.capQ3Cp1, points.capQ3).length()
    // let sleeveTopDelta
    // do {
    // points.capQ2Cp2 = points.capQ2.shiftFractionTowards(points.capQ2Cp2, sleeveTopTweak)
    // points.capQ3Cp1 = points.capQ3.shiftFractionTowards(points.capQ3Cp1, sleeveTopTweak)

    // paths.sleeveCapTop = new Path()
    // .move(points.capQ2).curve(points.capQ2Cp2, points.capQ3Cp1, points.capQ3)
    // .hide()

    // sleeveTopDelta = paths.sleeveCapTop.length() - sleeveTopTarget
    // if (sleeveTopDelta > 0) sleeveTopTweak = sleeveTopTweak * 0.99
    // else sleeveTopTweak = sleeveTopTweak * 1.01
    // } while (Math.abs(sleeveTopDelta) > 1)

    points.midAnchor = points.sleeveCapRight.shiftFractionTowards(points.sleeveCapLeft, 0.5)
    //guides
    // paths.scaffold = new Path()
    // .move(points.sleeveCapRight)
    // .line(points.sleeveTip)
    // .line(points.sleeveCapLeft)
    // .line(points.sleeveCapRight)
    // .attr('class', 'various lashed')
    //paths
    paths.sleevecap = paths.sleeveCapFront.join(paths.sleeveCapBack)
    /* new Path()
.move(points.sleeveCapRight)
	.curve_(points.capQ1Cp1, points.capQ1)
	.curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
	.curve(points.capQ2Cp2, points.capQ3Cp1, points.capQ3)
	.curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
	.curve_(points.capQ4Cp2, points.sleeveCapLeft) */

    if (complete) {
      //notches
      points.frontNotch = paths.sleevecap.shiftAlong(store.get('frontArmholeToArmholePitch'))
      points.backNotch = paths.sleevecap
        .reverse()
        .shiftAlong(store.get('backArmholeToArmholePitch'))
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontNotch', 'sleeveTip'],
      })
      snippets.backNotch = new Snippet('bnotch', points.backNotch)
    }

    return part
  },
}
