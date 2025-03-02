import { backBase } from './backBase.mjs'

export const back = {
  name: 'fauna.back',
  from: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    backFullness: { pct: 0, min: 0, max: 100, menu: 'style' },
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
      1 + options.backFullness
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

    //paths
    paths.armhole = paths.armhole.split(points.yokeBackSplit)[0].hide()

    paths.saTop = new Path()
      .move(points.yokeBackSplit)
      .line(points.gatherCurveStart)
      .curve(points.gatherCurveStartCp2, points.gatherCurveEndCp1, points.gatherCurveEnd)
      .line(points.cbYoke)
      .line(points.cbTop)
    //don't forget extra gathers section

    if (complete) {
      //notches
      if (points.armholePitch.y > points.yokeBackSplit.y)
        snippets.armholePitch = new Snippet('bnotch', points.armholePitch)

      snippets.cbTop = new Snippet('bnotch', points.cbTop)
    }

    return part
  },
}
