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
    //let's begin
    points.shoulderRise = points.armholePitchCp2.shiftOutwards(
      points.shoulder,
      store.get('shoulderRise')
    )
    points.armholeDrop = points.armhole.shiftTowards(points.sideWaist, store.get('armholeDrop'))

    points.bodiceSleeveTopMax = points.shoulderRise.shift(
      points.hps.angle(points.shoulderRise),
      store.get('shoulderToWrist')
    )

    let underArmTweak = 1
    let underArmDelta
    do {
      points.bodiceSleeveBottomMax = points.bodiceSleeveTopMax.shift(
        points.shoulderRise.angle(points.hps) * underArmTweak,
        store.get('wrist') / 2
      )
      underArmDelta =
        points.armholeDrop.dist(points.bodiceSleeveBottomMax) - store.get('underArmLength')
      if (underArmDelta > 0) underArmTweak = underArmTweak * 0.99
      else underArmTweak = underArmTweak * 1.01
    } while (Math.abs(underArmDelta) > 0.01)

    points.bodiceSleeveTopMin = points.hps.shiftTowards(
      points.shoulderRise,
      store.get('sleeveLengthMin')
    )
    points.bodiceSleeveBottomMin = points.armholeDrop.shiftTowards(
      points.bodiceSleeveBottomMax,
      store.get('underArmSleeveLength')
    )

    if (!options.fitSleeves) {
      points.bodiceSleeveBottomMax = points.bodiceSleeveTopMax.shift(
        points.bodiceSleeveTopMin.angle(points.bodiceSleeveBottomMin),
        points.bodiceSleeveTopMin.dist(points.bodiceSleeveBottomMin)
      )
    }

    //underarm curve
    points.underArmCurveAnchor = utils.beamsIntersect(
      points.sideWaist,
      points.armholeDrop,
      points.bodiceSleeveBottomMax,
      points.bodiceSleeveBottomMin
    )
    points.underArmCurveStart = points.armholeDrop.shiftTowards(
      points.sideWaist,
      points.bodiceSleeveBottomMin.dist(points.armholeDrop) * options.underArmCurve
    )

    let underArmCurveTweak = 1
    let underArmCurveDelta
    do {
      points.underArmCurveStartCp2 = points.underArmCurveStart.shiftFractionTowards(
        points.underArmCurveAnchor,
        underArmCurveTweak
      )
      points.bodiceSleeveBottomMinCp1 = points.bodiceSleeveBottomMin.shiftFractionTowards(
        points.underArmCurveAnchor,
        underArmCurveTweak
      )

      underArmCurveDelta =
        new Path()
          .move(points.underArmCurveStart)
          .curve(
            points.underArmCurveStartCp2,
            points.bodiceSleeveBottomMinCp1,
            points.bodiceSleeveBottomMin
          )
          .length() - store.get('underArmCurveLength')
      if (underArmCurveDelta > 0) underArmCurveTweak = underArmCurveTweak * 0.99
      else underArmCurveTweak = underArmCurveTweak * 1.01
    } while (Math.abs(underArmCurveDelta) > 0.01)

    //sleeve length
    points.elbowTop = points.hps.shiftTowards(
      points.bodiceSleeveTopMax,
      store.get('sleeveLengthElbow')
    )

    points.elbowBottom = points.bodiceSleeveBottomMin.shiftFractionTowards(
      points.bodiceSleeveBottomMax,
      points.bodiceSleeveTopMin.dist(points.elbowTop) /
        points.bodiceSleeveTopMin.dist(points.bodiceSleeveTopMax)
    )

    if (options.sleeveLength < 0.5) {
      points.bodiceSleeveTop = points.bodiceSleeveTopMin.shiftFractionTowards(
        points.elbowTop,
        2 * options.sleeveLength
      )
      points.bodiceSleeveBottom = points.bodiceSleeveBottomMin.shiftFractionTowards(
        points.elbowBottom,
        2 * options.sleeveLength
      )
    } else {
      points.bodiceSleeveTop = points.elbowTop.shiftFractionTowards(
        points.bodiceSleeveTopMax,
        2 * options.sleeveLength - 1
      )
      points.bodiceSleeveBottom = points.elbowBottom.shiftFractionTowards(
        points.bodiceSleeveBottomMax,
        2 * options.sleeveLength - 1
      )
    }

    //guides
    paths.daisyGuide = new Path()
      .move(points.cbWaist)
      .line(points.dartBottomLeft)
      .line(points.dartTip)
      .line(points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.cbWaist)
      .close()
      .attr('class', 'various lashed')

    paths.anchorLine = new Path()
      .move(points.sideWaist)
      .line(points.underArmCurveStart)
      .curve(
        points.underArmCurveStartCp2,
        points.bodiceSleeveBottomMinCp1,
        points.bodiceSleeveBottomMin
      )
      .line(points.bodiceSleeveBottom)
      .line(points.bodiceSleeveTop)
      .line(points.hps)
      .move(points.bodiceSleeveBottomMin)
      .line(points.bodiceSleeveTopMin)
      .move(points.elbowBottom)
      .line(points.elbowTop)
      .move(points.bodiceSleeveBottomMax)
      .line(points.bodiceSleeveTopMax)

    return part
  },
}
