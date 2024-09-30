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
  options: {
    //Constants
    backArmholeDepth: 0.552, //Locked for Aimee
    backArmholePitchDepth: 0.5, //Locked for Aimee
    backArmholePitchWidth: 0.97, //Locked for Aimee
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
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
    points.armholeDrop = points.armhole.shiftFractionTowards(points.sideWaist, options.armholeDrop)

    points.bodiceSleeveTopMax = points.shoulderRise.shift(
      points.hps.angle(points.shoulderRise),
      store.get('shoulderToWrist')
    )

    let underArmTweak = 1
    let underArmDelta
    do {
      points.bodiceSleeveBottomMax = points.bodiceSleeveTopMax.shift(
        (points.shoulderRise.angle(points.hps) + 90) * underArmTweak,
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

    if (!options.fitSleeveWidth) {
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

    if (options.fullSleeves) {
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
    } else {
      points.bodiceSleeveTop = points.bodiceSleeveTopMin
      points.bodiceSleeveBottom = points.bodiceSleeveBottomMin
    }

    //guides
    if (options.daisyGuides) {
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

      paths.armLine = new Path()
        .move(points.sideWaist)
        .line(points.underArmCurveStart)
        .curve(
          points.underArmCurveStartCp2,
          points.bodiceSleeveBottomMinCp1,
          points.bodiceSleeveBottomMin
        )
        .line(points.bodiceSleeveBottomMax)
        .line(points.bodiceSleeveTopMax)
        .line(points.hps)
        .attr('class', 'various lashed')

      paths.anchorLines = new Path()
        .move(points.bodiceSleeveBottomMin)
        .line(points.bodiceSleeveTopMin)
        .move(points.elbowBottom)
        .line(points.elbowTop)
        .move(points.bodiceSleeveBottomMax)
        .line(points.bodiceSleeveTopMax)
        .attr('class', 'various lashed')
    }

    //paths
    paths.waist = new Path()
      .move(points.cbWaist)
      .line(points.dartBottomLeft)
      .line(points.dartTip)
      .line(points.dartBottomRight)
      .line(points.sideWaist)
      .hide()

    paths.sideSeam = new Path()
      .move(points.sideWaist)
      .line(points.underArmCurveStart)
      .curve(
        points.underArmCurveStartCp2,
        points.bodiceSleeveBottomMinCp1,
        points.bodiceSleeveBottomMin
      )
      .line(points.bodiceSleeveBottom)
      .hide()

    paths.sleeveHem = new Path().move(points.bodiceSleeveBottom).line(points.bodiceSleeveTop).hide()

    paths.shoulder = new Path().move(points.bodiceSleeveTop).line(points.hps).hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.cb = new Path().move(points.cbNeck).line(points.cbWaist).hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.sideSeam)
      .join(paths.sleeveHem)
      .join(paths.shoulder)
      .join(paths.cbNeck)
      .join(paths.cb)
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck
        points.cutOnFoldTo = points.cbWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cbWaist.shiftFractionTowards(points.dartBottomLeft, 0.15)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbNeck.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      snippets.cbNotch = new Snippet('bnotch', points.cArmhole)
      snippets.underArmCurveStart = new Snippet('notch', points.underArmCurveStart)
      if (options.sleeveLength > 0 && options.fullSleeves) {
        snippets.bodiceSleeveBottomMin = new Snippet('notch', points.bodiceSleeveBottomMin)
      }
      //title
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'back',
        cutNr: titleCutNum,
        scale: 2 / 3,
      })
      //dart edge
      paths.dartEdge = new Path()
        .move(points.dartBottomLeft)
        .line(points.dartBottomEdge)
        .line(points.dartBottomRight)
        .attr('class', 'fabric help')
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const sleeveHemSa = sa * options.sleeveHemWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100

        points.saBodiceSleeveBottom = utils.beamsIntersect(
          points.bodiceSleeveBottomMinCp1
            .shiftTowards(points.bodiceSleeveBottom, sideSeamSa)
            .rotate(-90, points.bodiceSleeveBottomMinCp1),
          points.bodiceSleeveBottom
            .shiftTowards(points.bodiceSleeveBottomMinCp1, sideSeamSa)
            .rotate(90, points.bodiceSleeveBottom),
          points.bodiceSleeveBottom
            .shiftTowards(points.bodiceSleeveTop, sleeveHemSa)
            .rotate(-90, points.bodiceSleeveBottom),
          points.bodiceSleeveTop
            .shiftTowards(points.bodiceSleeveBottom, sleeveHemSa)
            .rotate(90, points.bodiceSleeveTop)
        )
        points.saBodiceSleeveTop = utils.beamsIntersect(
          points.bodiceSleeveTop
            .shiftTowards(points.hps, shoulderSa)
            .rotate(-90, points.bodiceSleeveTop),
          points.hps.shiftTowards(points.bodiceSleeveTop, shoulderSa).rotate(90, points.hps),
          points.saBodiceSleeveBottom,
          points.saBodiceSleeveBottom.shift(
            points.bodiceSleeveBottom.angle(points.bodiceSleeveTop),
            1
          )
        )

        points.saHps = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulderRise) + 90, 1),
          points.saBodiceSleeveTop,
          points.saBodiceSleeveTop.shift(points.shoulderRise.angle(points.hps), 1)
        )

        paths.sa = new Path()
          .move(points.saCbWaist)
          .line(points.saDartBottomLeft)
          .line(points.saDartBottomEdge)
          .line(points.saDartBottomRight)
          .line(points.saSideWaist)
          .line(paths.sideSeam.offset(sideSeamSa).start())
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saBodiceSleeveBottom)
          .line(points.saBodiceSleeveTop)
          .line(points.saHps)
          .line(paths.cbNeck.offset(neckSa).start())
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbNeck)
          .line(points.saCbWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
