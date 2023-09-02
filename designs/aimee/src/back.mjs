import { back as backDaisy } from '@freesewing/daisy'
import { front } from './front.mjs'

export const back = {
  name: 'aimee.back',
  from: backDaisy,
  after: front,
  hide: {
    from: true,
    inherited: true,
  },
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
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    //measures
    const shoulderRise = store.get('shoulderRise')
    const sleeveMaxLength = store.get('sleeveMaxLength')
    const sleeveLength = store.get('sleeveLength')
    const wrist = store.get('wrist')
    const shoulderWidth = store.get('shoulderWidth')

    //let's begin
    points.underArmCurveStart = points.sideWaist.shiftTowards(
      points.armhole,
      store.get('underArmCurveStart')
    )
    points.underArmCurveAnchor = points.sideWaist.shiftTowards(
      points.armhole,
      store.get('underArmCurveAnchor')
    )
    points.underArmCurveCp2 = points.sideWaist.shiftTowards(
      points.armhole,
      store.get('underArmCurveCp2')
    )
    points.bodiceSleeveBottomMin = points.underArmCurveAnchor
      .shiftTowards(points.sideWaist, store.get('bodiceSleeveBottomMin'))
      .rotate(store.get('bodiceSleeveBottomAngle'), points.underArmCurveAnchor)
    // points.bodiceSleeveBottomCp1 = points.underArmCurveAnchor.shiftTowards(points.bodiceSleeveBottomMin, store.get('bodiceSleeveBottomCp1'))

    points.shoulderRise = points.armholePitchCp2.shiftOutwards(points.shoulder, shoulderRise)
    points.bodiceSleeveTopMin = points.hps.shiftTowards(points.shoulderRise, shoulderWidth)
    points.bodiceSleeveTopMax = points.hps.shiftOutwards(points.bodiceSleeveTopMin, sleeveMaxLength)
    points.bodiceSleeveTop = points.hps.shiftTowards(points.shoulderRise, sleeveLength)

    if (options.fitSleeves && options.fullSleeves && options.sleeveLength > 0) {
      points.bodiceSleeveBottomMax = points.bodiceSleeveTopMax
        .shiftTowards(points.hps, wrist / 2)
        .rotate(90, points.bodiceSleeveTopMax)

      let tweak = 1
      let delta
      do {
        points.bodiceSleeveBottomMinAnchor = utils.beamsIntersect(
          points.bodiceSleeveBottomMin,
          points.bodiceSleeveBottomMin.shift(0, 1),
          points.bodiceSleeveBottomMax,
          points.bodiceSleeveTopMax.rotate(90 * tweak, points.bodiceSleeveBottomMax)
        )
        delta =
          points.bodiceSleeveBottomMax.dist(points.bodiceSleeveBottomMinAnchor) -
          store.get('underArmMaxLength')
        if (delta > 0) tweak = tweak * 0.99
        else tweak = tweak * 1.01
      } while (Math.abs(delta) > 1)
    } else {
      points.bodiceSleeveBottomMinAnchor = utils.beamsIntersect(
        points.bodiceSleeveBottomMin,
        points.bodiceSleeveBottomMin.shift(0, 1),
        points.bodiceSleeveTopMin,
        points.hps.rotate(90, points.bodiceSleeveTopMin)
      )
      points.bodiceSleeveBottomMax = utils.beamsIntersect(
        points.bodiceSleeveBottomMinAnchor,
        points.bodiceSleeveTopMin.rotate(-90, points.bodiceSleeveBottomMinAnchor),
        points.bodiceSleeveTopMax,
        points.hps.rotate(90, points.bodiceSleeveTopMax)
      )
    }

    const shiftDist = points.bodiceSleeveBottomMin.dist(points.bodiceSleeveBottomMinAnchor)
    const shift = [
      'bodiceSleeveBottomMin',
      'underArmCurveCp2',
      'underArmCurveStart',
      'sideWaist',
      'dartBottomRight',
    ]
    for (const p of shift) points[p] = points[p].shift(0, shiftDist)

    points.bodiceSleeveBottomCp1 = points.bodiceSleeveBottomMin.shift(
      points.bodiceSleeveBottomMax.angle(points.bodiceSleeveBottomMin),
      store.get('bodiceSleeveBottomCp1')
    )

    points.dartBottomMid = points.dartBottomLeft.shiftFractionTowards(points.dartBottomRight, 0.5)
    points.dartTip = new Point(points.dartBottomMid.x, points.dartTip.y)
    points.dartBottomEdge = utils.beamsIntersect(
      points.dartBottomLeft,
      points.dartTip.rotate(-90, points.dartBottomLeft),
      points.dartTip,
      points.dartBottomMid
    )
    points.dartBottomEdge = utils.beamsIntersect(
      points.dartBottomLeft,
      points.dartTip.rotate(-90, points.dartBottomLeft),
      points.dartTip,
      points.dartBottomMid
    )
    if (options.fullSleeves && options.sleeveLength > 0) {
      points.bodiceSleeveBottom = points.bodiceSleeveBottomMin.shiftFractionTowards(
        points.bodiceSleeveBottomMax,
        options.sleeveLength
      )
    } else {
      points.bodiceSleeveBottom = points.bodiceSleeveBottomMin
    }
    //guides
    // paths.daisyGuide = new Path()
    // .move(points.cbWaist)
    // .line(points.dartBottomLeft)
    // .line(points.dartTip)
    // .line(points.dartBottomRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // ._curve(points.cbNeckCp1, points.cbNeck)
    // .line(points.cbWaist)
    // .close()
    // .attr('class', 'various lashed')

    // paths.underArmCurve = new Path()
    // .move(points.sideWaist)
    // .line(points.underArmCurveStart)
    // .curve(points.underArmCurveCp2, points.bodiceSleeveBottomCp1, points.bodiceSleeveBottomMin)

    // paths.armscaffold = new Path()
    // .move(points.bodiceSleeveTopMin)
    // .line(points.bodiceSleeveBottomMin)
    // .line(points.bodiceSleeveBottom)
    // .line(points.bodiceSleeveTop)
    // .line(points.hps)

    //paths
    paths.hemLeft = new Path().move(points.cbWaist).line(points.dartBottomLeft).hide()

    paths.dart = new Path()
      .move(points.dartBottomLeft)
      .line(points.dartTip)
      .line(points.dartBottomRight)
      .hide()

    paths.hemRight = new Path().move(points.dartBottomRight).line(points.sideWaist).hide()

    paths.underArm = new Path()
      .move(points.sideWaist)
      .line(points.underArmCurveStart)
      .curve(points.underArmCurveCp2, points.bodiceSleeveBottomCp1, points.bodiceSleeveBottomMin)
      .hide()

    if (options.fullSleeves && options.sleeveLength > 0) {
      paths.underArm.line(points.bodiceSleeveBottom).hide()
    }

    paths.sleeveHem = new Path().move(points.bodiceSleeveBottom).line(points.bodiceSleeveTop).hide()

    paths.shoulder = new Path().move(points.bodiceSleeveTop).line(points.hps).hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.cb = new Path().move(points.cbNeck).line(points.cbWaist).hide()

    paths.seam = paths.hemLeft
      .clone()
      .join(paths.dart)
      .join(paths.hemRight)
      .join(paths.underArm)
      .join(paths.sleeveHem)
      .join(paths.shoulder)
      .join(paths.cbNeck)
      .join(paths.cb)

    if (complete) {
      //grainline
      points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.dartBottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.underArmCurveStart = new Snippet('notch', points.underArmCurveStart)
      if (options.fullSleeves && options.sleeveLength > 0) {
        snippets.bodiceSleeveBottomMin = new Snippet('notch', points.bodiceSleeveBottomMin)
      }
      //title
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'back',
        scale: 2 / 3,
      })
      //dart
      paths.dartEdge = new Path()
        .move(points.dartBottomLeft)
        .line(points.dartBottomEdge)
        .line(points.dartBottomRight)
        .attr('class', 'fabric help')

      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100
        const sleeveHem = sa * options.sleeveHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100

        points.saPoint0 = utils.beamsIntersect(
          points.dartTip,
          points.dartBottomMid,
          points.dartBottomLeft
            .shiftTowards(points.dartBottomEdge, sideSeamSa)
            .rotate(-90, points.dartBottomLeft),
          points.dartBottomEdge
            .shiftTowards(points.dartBottomLeft, sideSeamSa)
            .rotate(90, points.dartBottomEdge)
        )

        points.saPoint1 = utils.beamsIntersect(
          points.sideWaist
            .shiftTowards(points.underArmCurveCp2, sideSeamSa)
            .rotate(-90, points.sideWaist),
          points.underArmCurveCp2
            .shiftTowards(points.sideWaist, sideSeamSa)
            .rotate(90, points.underArmCurveCp2),
          points.sideWaist.shiftTowards(points.dartBottomRight, sa).rotate(90, points.sideWaist),
          points.dartBottomRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.dartBottomRight)
        )

        points.saPoint3 = points.bodiceSleeveTop
          .shift(points.hps.angle(points.bodiceSleeveTop), sleeveHem)
          .shift(points.hps.angle(points.bodiceSleeveTop) + 90, shoulderSa)

        points.saPoint2 = utils.beamsIntersect(
          points.bodiceSleeveBottom
            .shiftTowards(points.bodiceSleeveBottomCp1, sideSeamSa)
            .rotate(90, points.bodiceSleeveBottom),
          points.bodiceSleeveBottomCp1
            .shiftTowards(points.bodiceSleeveBottom, sideSeamSa)
            .rotate(-90, points.bodiceSleeveBottomCp1),
          points.saPoint3,
          points.saPoint3.shift(points.bodiceSleeveTop.angle(points.bodiceSleeveBottom), 1)
        )

        paths.sa = paths.hemLeft
          .offset(sa)
          .line(points.saPoint0)
          .line(paths.hemRight.offset(sa).start())
          .join(paths.hemRight.offset(sa))
          .line(points.saPoint1)
          .join(paths.underArm.offset(sideSeamSa))
          .line(points.saPoint2)
          .line(points.saPoint3)
          .line(points.saPoint4)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saPoint5)
          .line(points.saPoint6)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
