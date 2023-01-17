import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'front',
  from: frontBase,
  after: back,
  hideDependencies: true,
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
  }) => {
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //inherit from bella
    let underArmLength = store.get('underArmLength')
    let underArmCurveLength = store.get('underArmCurveLength')
    let sideLength = store.get('sideLength')

    //undearm
    let tweak = 1
    let target
    if (options.fullSleeves) target = underArmLength
    else target = underArmCurveLength
    let delta
    do {
      points.armholeBottom = points.armholeDrop.shiftTowards(
        points.sideWaist,
        points.armholeDrop.dist(points.bodiceSleeveBottom) * tweak
      )

      const drawUnderArm = () => {
        if (options.fullSleeves)
          return new Path()
            .move(points.armholeBottom)
            .curve_(points.armholeDrop, points.bodiceSleeveBottom)
            .line(points.wristBottom)
        else
          return new Path()
            .move(points.armholeBottom)
            .curve_(points.armholeCp, points.bodiceSleeveBottom)
      }

      delta = drawUnderArm().length() - target
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    points.sideWaist = points.armholeBottom.shiftTowards(points.sideWaist, sideLength)

    //guides
    // const drawBellaGuide = () => {
    // if (options.bustDartPlacement == 'armhole')
    // return new Path()
    // .move(points.cfHem)
    // .line(points.waistDartLeft)
    // .curve_(points.waistDartLeftCp, points.waistDartTip)
    // ._curve(points.waistDartRightCp, points.waistDartRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
    // ._curve(points.bustDartCpBottom, points.bust)
    // .curve_(points.bustDartCpTop, points.bustDartTop)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    // .line(points.cfHem)
    // .close()
    // .attr('class', 'various lashed')
    // else
    // return new Path()
    // .move(points.cfWaist)
    // .line(points.waistDartLeft)
    // .curve_(points.waistDartLeftCp, points.waistDartTip)
    // ._curve(points.waistDartRightCp, points.waistDartRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    // .line(points.cfWaist)
    // .close()
    // .attr('class', 'various lashed')
    // }

    // paths.bellaGuide = drawBellaGuide()

    //seam paths

    const drawArm = () => {
      if (options.fullSleeves)
        return new Path()
          .move(points.armholeBottom)
          .curve_(points.armholeDrop, points.bodiceSleeveBottom)
          .line(points.wristBottom)
          .line(points.wristTop)
          .line(points.hps)
      else
        return new Path()
          .move(points.armholeBottom)
          .curve_(points.armholeCp, points.bodiceSleeveBottom)
          .line(points.bodiceSleeveTop)
          .line(points.hps)
    }

    paths.seam = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .curve_(points.waistDartLeftCp, points.waistDartTip)
      ._curve(points.waistDartRightCp, points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armholeBottom)
      .join(drawArm())
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)

    // Complete?
    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfNeck
      points.cutOnFoldTo = points.cfWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfBust', 'bust', 'armholeBottom'],
      })
      //title
      points.title = new Point(points.waistDartLeftCp.x, points.waistDartLeftCp.y / 2)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'front',
      })
      //scalebox
      points.scalebox = new Point(
        points.shoulderRise.x,
        points.waistDartLeftCp.y * (17 / 24)
      ).shift(0, 15)
      macro('scalebox', { at: points.scalebox })
      if (sa) {
        paths.sa = new Path()
          .move(points.cfWaist)
          .line(points.waistDartHem)
          .line(points.waistDartRight)
          .line(points.sideWaist)
          .line(points.armholeBottom)
          .join(drawArm())
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
          .offset(sa)
          .line(points.cfNeck)
          .line(points.cfWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    if (paperless) {
    }

    return part
  },
}
