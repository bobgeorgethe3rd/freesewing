import { backBase } from './backBase.mjs'
import { front } from './front.mjs'

export const back = {
  name: 'fauna.back',
  from: backBase,
  after: front,
  hide: {
    from: true,
    // inherited: true,
  },
  options: {
    //Style
    backFullnessBonus: { pct: 0, min: 0, max: 100, menu: 'style' },
  },
  measurements: [],
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
    //measurements
    const backDartAngle =
      points.dartTip.angle(points.dartBottomRight) - points.dartTip.angle(points.dartBottomLeft)
    //let's begin
    //fullness
    points.cbTop = points.yokeBackSplit.shiftFractionTowards(
      points.cbYoke,
      1 + options.backFullnessBonus
    )
    //rotate
    points.gatherCurveStart = points.yokeBackSplit.shiftFractionTowards(points.cbYoke, 1 / 7)
    points.gatherCurveEnd = points.yokeBackSplit.shiftFractionTowards(points.cbYoke, 6 / 7)

    const rotFull = [
      'sideWaist',
      'armhole',
      'armholeCp2',
      'armholePitchCp1',
      'armholePitch',
      'armholePitchCp2',
      'shoulder',
      'yokeBackSplit',
      'gatherCurveStart',
    ]
    for (const p of rotFull) points[p] = points[p].rotate(-backDartAngle, points.dartTip)
    points.dartBottomRight = points.dartBottomLeft.rotate(backDartAngle, points.dartTip)

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    //guides
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cbWaist)
        .line(points.dartBottomLeft)
        .line(points.sideWaist)
        .line(points.armhole)
        .join(paths.armhole)
        .line(points.hps.rotate(-backDartAngle, points.dartTip))
        .line(points.dartTip)
        .line(points.hps)
        ._curve(points.cbNeckCp1, points.cbNeck)
        .line(points.cbWaist)
        .close()
        .attr('class', 'various lashed')

      for (let i = 0; i <= 5; i++) {
        points['dartBottomRight' + i] = points.yokeBackSplit
          .rotate(backDartAngle, points.dartTip)
          .shiftFractionTowards(points.cbYoke, (i + 1) / 7)
        points['dartBottomLeft' + i] = points['dartBottomRight' + i].rotate(
          -backDartAngle / 6,
          points.dartTip
        )
      }

      for (let i = 0; i <= 4; i++) {
        points['dartBottomRight' + i] = points['dartBottomRight' + i].rotate(
          -backDartAngle / 6,
          points.dartTip
        )
        points['dartBottomLeft' + i] = points['dartBottomLeft' + i].rotate(
          -backDartAngle / 6,
          points.dartTip
        )
      }

      for (let i = 0; i <= 3; i++) {
        points['dartBottomRight' + i] = points['dartBottomRight' + i].rotate(
          -backDartAngle / 6,
          points.dartTip
        )
        points['dartBottomLeft' + i] = points['dartBottomLeft' + i].rotate(
          -backDartAngle / 6,
          points.dartTip
        )
      }

      for (let i = 0; i <= 2; i++) {
        points['dartBottomRight' + i] = points['dartBottomRight' + i].rotate(
          -backDartAngle / 6,
          points.dartTip
        )
        points['dartBottomLeft' + i] = points['dartBottomLeft' + i].rotate(
          -backDartAngle / 6,
          points.dartTip
        )
      }

      for (let i = 0; i <= 1; i++) {
        points['dartBottomRight' + i] = points['dartBottomRight' + i].rotate(
          -backDartAngle / 6,
          points.dartTip
        )
        points['dartBottomLeft' + i] = points['dartBottomLeft' + i].rotate(
          -backDartAngle / 6,
          points.dartTip
        )
      }
      points.dartBottomRight0 = points.dartBottomRight0.rotate(-backDartAngle / 6, points.dartTip)
      points.dartBottomLeft0 = points.dartBottomLeft0.rotate(-backDartAngle / 6, points.dartTip)

      paths.gatherDarts = new Path()
        .move(points.yokeBackSplit)
        .line(points.dartBottomLeft0)
        .line(points.dartTip)
        .line(points.dartBottomRight0)
        .line(points.dartBottomLeft1)
        .line(points.dartTip)
        .line(points.dartBottomRight1)
        .line(points.dartBottomLeft2)
        .line(points.dartTip)
        .line(points.dartBottomRight2)
        .line(points.dartBottomLeft3)
        .line(points.dartTip)
        .line(points.dartBottomRight3)
        .line(points.dartBottomLeft4)
        .line(points.dartTip)
        .line(points.dartBottomRight4)
        .line(points.dartBottomLeft5)
        .line(points.dartTip)
        .line(points.dartBottomRight5)
        .line(points.cbYoke)
        .attr('class', 'various lashed')
    }
    //let's continue
    points.gatherCurveStartCp2 = utils.beamIntersectsY(
      points.yokeBackSplit,
      points.gatherCurveStart,
      points.cbYoke.y
    )

    points.gatherCurveEndCp1 = points.gatherCurveEnd.shiftFractionTowards(
      points.gatherCurveStartCp2,
      0.5
    )

    //hem
    const hips = store.get('hips')
    const seat = store.get('seat')
    const midWidth = hips < points.sideWaist.x * 4 ? points.sideWaist.x * 1.25 : hips * 0.25

    const maxWidth = seat < points.sideWaist.x * 4 ? points.sideWaist.x * 1.25 : seat * 0.25
    points.sideHips = new Point(
      midWidth,
      points.sideWaist.y + measurements.waistToHips * (1 + options.bodyLengthBonus)
    )
    points.sideSeat = new Point(
      maxWidth,
      points.sideWaist.y + measurements.waistToSeat * (1 + options.bodyLengthBonus)
    )
    points.sideHem =
      options.bodyLength < 0.5
        ? points.sideWaist.shiftFractionTowards(points.sideHips, 2 * options.bodyLength)
        : points.sideHips.shiftFractionTowards(points.sideSeat, 2 * options.bodyLength - 1)

    points.cbHemCp2 = points.sideHem.shift(
      points.sideSeat.angle(points.sideHips) + 90,
      points.sideHem.x * 0.5
    )

    points.cbHem = new Point(points.cbNeck.x, points.cbHemCp2.y)

    if (points.cbHem.y < points.cbWaist.y) {
      points.cbHem = points.cbWaist
      points.cbHemCp2 = new Point(points.sideWaist.x * 0.5, points.cbWaist.y)
    }

    points.cbBottom = new Point(points.cbTop.x, points.cbHem.y)
    points.sideHemCp2 = points.sideHem.shift(
      points.sideSeat.angle(points.sideHips),
      points.sideHem.dist(points.sideWaist) * options.bodyLength
    )
    points.armholeCp1 = points.armhole.shiftFractionTowards(points.sideWaist, options.sideSeamCurve)

    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.armholeCp1, points.armhole)
      .hide()

    //paths
    paths.hemBase = new Path()
      .move(points.cbBottom)
      .line(points.cbHem)
      .curve_(points.cbHemCp2, points.sideHem)
      .hide()

    paths.armhole = paths.armhole.split(points.yokeBackSplit)[0].hide().hide()

    paths.saTop = new Path()
      .move(points.yokeBackSplit)
      .line(points.gatherCurveStart)
      .curve(points.gatherCurveStartCp2, points.gatherCurveEndCp1, points.gatherCurveEnd)
      .line(points.cbTop)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.saTop)
      .line(points.cbBottom)
      .close()

    if (complete) {
      //grainline
      if (options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbBottom
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cbTop.shiftFractionTowards(points.gatherCurveEnd, 0.5)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbBottom.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      if (points.armholePitch.y > points.yokeBackSplit.y) {
        snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
      }
      points.sideNotch = paths.sideSeam.shiftFractionAlong(0.5)
      snippets.sideNotch = new Snippet('notch', points.sideNotch)
      snippets.cbTop = new Snippet('bnotch', points.cbTop)
      //title
      points.title = new Point(points.yokeBackSplit.x * 0.5, points.armhole.y)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
        cutNr: options.cbSaWidth == 0 ? 1 : 2,
        scale: 0.5,
      })
      //gather lines
      macro('banner', {
        path: paths.saTop.attr('class', 'fabric hidden').unhide(),
        text: 'Gather',
        spaces: 8,
      })
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100

        points.saSideHem = points.sideHem
          .shift(points.sideHips.angle(points.sideSeat), hemSa)
          .shift(points.cbHemCp2.angle(points.sideHem), sideSeamSa)

        points.saArmholeCorner = points.saArmholeCorner.rotate(-backDartAngle, points.dartTip)

        points.saYokeBackSplit = utils.beamsIntersect(
          paths.armhole.offset(armholeSa).shiftFractionAlong(0.995),
          paths.armhole.offset(armholeSa).end(),
          points.yokeBackSplit
            .shiftTowards(points.gatherCurveStart, sa)
            .rotate(-90, points.yokeBackSplit),
          points.gatherCurveStart
            .shiftTowards(points.yokeBackSplit, sa)
            .rotate(90, points.gatherCurveStart)
        )

        points.saCbTop = points.cbTop.translate(-sa * options.cbSaWidth * 100, -sa)
        points.saCbBottom = new Point(points.saCbTop.x, points.cbBottom.y + hemSa)

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saYokeBackSplit)
          .join(paths.saTop.offset(sa))
          .line(points.saCbTop)
          .line(points.saCbBottom)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
