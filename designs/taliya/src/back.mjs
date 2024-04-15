import { backBase } from './backBase.mjs'

export const back = {
  name: 'taliya.back',
  from: backBase,
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
    absoluteOptions,
    log,
  }) => {
    //removing paths and snippets not required from Bella
    const keepThese = ['cbNeck', 'daisyGuide']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const waistDartAngle =
      points.dartTip.angle(points.dartBottomRight) - points.dartTip.angle(points.dartBottomLeft)
    //let's begin
    let j
    for (let i = 0; i <= 2; i++) {
      j = i + 1
      points['neckSpit' + i] = paths.cbNeck
        .split(points.raglanNeckSplit)[1]
        .shiftFractionAlong(j / 4)
    }

    const rot0 = [
      'dartBottomRight',
      'sideWaist',
      'armhole',
      'armholeCp2',
      'armholePitchCp1',
      'armholePitch',
      'armholePitchCp2',
      'shoulder',
      'armholeRaglanCp2',
      'raglanCurveEnd',
      'raglanNeckSplit',
    ]
    for (const p of rot0) points[p] = points[p].rotate(-waistDartAngle, points.dartTip)

    const rot1 = ['shoulderTop', 'shoulderTopCp2', 'cbNeckCp1', 'cbNeck']
    for (const p of rot1) points[p + 'R1'] = points[p].rotate(-waistDartAngle, points.dartTip)

    const rot2 = ['shoulderTop', 'shoulderTopCp2', 'cbNeckCp1', 'cbNeck', 'neckSpit0']
    for (const p of rot2)
      points[p + 'R2'] = points[p].rotate((-waistDartAngle * 2) / 3, points.dartTip)

    const rot3 = ['shoulderTop', 'shoulderTopCp2', 'cbNeckCp1', 'cbNeck', 'neckSpit1']
    for (const p of rot3)
      points[p + 'R3'] = points[p].rotate((-waistDartAngle * 1) / 3, points.dartTip)

    //this is important these splits should only be rotated after
    points.neckSpit0 = points.neckSpit0.rotate(-waistDartAngle, points.dartTip)
    points.neckSpit1 = points.neckSpit1.rotate((-waistDartAngle * 2) / 3, points.dartTip)
    points.neckSpit2R4 = points.neckSpit2
    points.neckSpit2 = points.neckSpit2.rotate((-waistDartAngle * 1) / 3, points.dartTip)
    paths.cbNeckR1 = new Path()
      .move(points.shoulderTopR1)
      .curve(points.shoulderTopCp2R1, points.cbNeckCp1R1, points.cbNeckR1)
      .hide()

    if (options.daisyGuides) {
      points.dartBottomLeft = points.hps.rotate(-waistDartAngle, points.dartTip)
      paths.daisyGuide = new Path()
        .move(points.cbWaist)
        .line(points.dartBottomRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.dartBottomLeft)
        .line(points.dartTip)
        .line(points.hps)
        .join(paths.daisyGuide.split(points.hps)[1])
        .close()
        .attr('class', 'various lashed')

      paths.cbNeck.attr('class', 'interfacing dashed').unhide()
      paths.cbNeckR1.attr('class', 'interfacing dashed').unhide()
      paths.cbNeckR2 = new Path()
        .move(points.shoulderTopR2)
        .curve(points.shoulderTopCp2R2, points.cbNeckCp1R2, points.cbNeckR2)
        .attr('class', 'interfacing dashed')

      paths.cbNeckR3 = new Path()
        .move(points.shoulderTopR3)
        .curve(points.shoulderTopCp2R3, points.cbNeckCp1R3, points.cbNeckR3)
        .attr('class', 'interfacing dashed')

      paths.neckGuide = paths.cbNeckR1
        .clone()
        .split(points.neckSpit0)[0]
        .line(points.dartTip)
        .line(points.neckSpit0R2)
        .join(paths.cbNeckR2.split(points.neckSpit0R2)[1].split(points.neckSpit1)[0])
        .line(points.dartTip)
        .line(points.neckSpit1R3)
        .join(paths.cbNeckR3.split(points.neckSpit1R3)[1].split(points.neckSpit2)[0])
        .line(points.dartTip)
        .line(points.neckSpit2R4)
        .join(paths.cbNeck.split(points.neckSpit2R4)[1])
        .attr('class', 'interfacing')
    }

    points.neckSpit2R4Cp1 = utils.beamsIntersect(
      paths.cbNeck.split(points.neckSpit2R4)[1].shiftFractionAlong(0.005),
      points.neckSpit2R4,
      points.dartTip,
      points.neckSpit2
    )
    points.raglanNeckSplitCp2 = utils.beamsIntersect(
      paths.cbNeckR1.split(points.raglanNeckSplit)[0].shiftFractionAlong(0.995),
      points.raglanNeckSplit,
      points.dartTip,
      points.neckSpit0R2
    )

    //paths
    paths.raglan = new Path()
      .move(points.armhole)
      .curve_(points.armholeRaglanCp2, points.raglanCurveEnd)
      .line(points.raglanNeckSplit)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.neckLine = paths.cbNeckR1
      .split(points.raglanNeckSplit)[0]
      .curve(points.raglanNeckSplitCp2, points.neckSpit2R4Cp1, points.neckSpit2R4)
      .join(paths.cbNeck.split(points.neckSpit2R4)[1])
      .hide()

    if (options.raglanSleeves) {
      paths.neckLine = paths.neckLine.split(points.raglanNeckSplit)[1].hide()
    }

    const drawArmhole = () => (options.raglanSleeves ? paths.raglan : paths.armhole)

    paths.seam = new Path()
      .move(points.sideWaist)
      .line(points.armhole)
      .join(drawArmhole())
      .line(paths.neckLine.start())
      .join(paths.neckLine)
      .line(points.cbWaist)

    if (complete) {
      //grainline

      //notches
      if (!options.raglanSleeves) {
        macro('sprinkle', {
          snippet: 'bnotch',
          on: ['raglanNeckSplit', 'armholePitch'],
        })
      }
    }

    return part
  },
}
