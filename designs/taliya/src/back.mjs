import { backBase } from './backBase.mjs'

export const back = {
  name: 'taliya.back',
  from: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    shapingStyle: { dflt: 'gathers', list: ['gathers', 'pleats', 'darts'], menu: 'darts' },
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
      points['neckSplit' + i] = paths.cbNeck
        .split(points.raglanNeckSplit)[1]
        .shiftFractionAlong(j / 4)
    }
    points.raglanNeckSplitR4 = points.raglanNeckSplit

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

    const rot2 = ['shoulderTop', 'shoulderTopCp2', 'cbNeckCp1', 'cbNeck', 'neckSplit0']
    for (const p of rot2)
      points[p + 'R2'] = points[p].rotate((-waistDartAngle * 2) / 3, points.dartTip)

    const rot3 = ['shoulderTop', 'shoulderTopCp2', 'cbNeckCp1', 'cbNeck', 'neckSplit1']
    for (const p of rot3)
      points[p + 'R3'] = points[p].rotate((-waistDartAngle * 1) / 3, points.dartTip)

    //this is important these splits should only be rotated after
    points.neckSplit0 = points.neckSplit0.rotate(-waistDartAngle, points.dartTip)
    points.neckSplit1 = points.neckSplit1.rotate((-waistDartAngle * 2) / 3, points.dartTip)
    points.neckSplit2R4 = points.neckSplit2
    points.neckSplit2 = points.neckSplit2.rotate((-waistDartAngle * 1) / 3, points.dartTip)
    paths.cbNeckR1 = new Path()
      .move(points.shoulderTopR1)
      .curve(points.shoulderTopCp2R1, points.cbNeckCp1R1, points.cbNeckR1)
      .hide()
    paths.cbNeckR2 = new Path()
      .move(points.shoulderTopR2)
      .curve(points.shoulderTopCp2R2, points.cbNeckCp1R2, points.cbNeckR2)
      .hide()

    paths.cbNeckR3 = new Path()
      .move(points.shoulderTopR3)
      .curve(points.shoulderTopCp2R3, points.cbNeckCp1R3, points.cbNeckR3)
      .hide()

    let k
    for (let i = 0; i <= 2; i++) {
      k = i + 2
      points['dartBottomMid' + i] = points['neckSplit' + i].shiftFractionTowards(
        points['neckSplit' + i + 'R' + k],
        0.5
      )
      points['dartTip' + i] = points['dartBottomMid' + i].shiftFractionTowards(
        points.dartTip,
        options.bustDartLength
      )

      points['dartBottomEdge' + i] = utils.beamsIntersect(
        points['dartTip' + i],
        points['dartBottomMid' + i],
        paths['cbNeckR' + (i + 1)].split(points['neckSplit' + i])[1].shiftFractionAlong(0.995),
        points['neckSplit' + i]
      )
    }

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
      paths.cbNeckR2.attr('class', 'interfacing dashed').unhide()
      paths.cbNeckR3.attr('class', 'interfacing dashed').unhide()

      paths.neckGuide = paths.cbNeckR1
        .clone()
        .split(points.neckSplit0)[0]
        .line(points.dartTip)
        .line(points.neckSplit0R2)
        .join(paths.cbNeckR2.split(points.neckSplit0R2)[1].split(points.neckSplit1)[0])
        .line(points.dartTip)
        .line(points.neckSplit1R3)
        .join(paths.cbNeckR3.split(points.neckSplit1R3)[1].split(points.neckSplit2)[0])
        .line(points.dartTip)
        .line(points.neckSplit2R4)
        .join(paths.cbNeck.split(points.neckSplit2R4)[1])
        .attr('class', 'interfacing')
    }

    points.neckSplit2R4Cp1 = utils.beamsIntersect(
      paths.cbNeck.split(points.neckSplit2R4)[1].shiftFractionAlong(0.005),
      points.neckSplit2R4,
      points.dartTip,
      points.neckSplit2
    )
    points.raglanNeckSplitCp2 = utils.beamsIntersect(
      paths.cbNeckR1.split(points.raglanNeckSplit)[0].shiftFractionAlong(0.995),
      points.raglanNeckSplit,
      points.dartTip,
      points.neckSplit0R2
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

    points.dartBottomLeft = paths.cbNeckR1.split(points.raglanNeckSplit)[1].shiftFractionAlong(0.5)
    points.dartBottomRight = paths.cbNeck.split(points.raglanNeckSplitR4)[1].shiftFractionAlong(0.5)

    const drawNeck = () => {
      if (options.shapingStyle == 'gathers') {
        return paths.cbNeckR1
          .split(points.raglanNeckSplit)[0]
          .curve(points.raglanNeckSplitCp2, points.neckSplit2R4Cp1, points.neckSplit2R4)
          .join(paths.cbNeck.split(points.neckSplit2R4)[1])
      }
      if (options.shapingStyle == 'pleats') {
        return paths.cbNeckR1
          .split(points.neckSplit0)[0]
          .line(points.neckSplit0R2)
          .join(paths.cbNeckR2.split(points.neckSplit0R2)[1].split(points.neckSplit1)[0])
          .line(points.neckSplit1R3)
          .join(paths.cbNeckR3.split(points.neckSplit1R3)[1].split(points.neckSplit2)[0])
          .line(points.neckSplit2R4)
          .join(paths.cbNeck.split(points.neckSplit2R4)[1])
      }
      if (options.shapingStyle == 'darts') {
        return paths.cbNeckR1
          .split(points.neckSplit0)[0]
          .line(points.dartTip0)
          .line(points.neckSplit0R2)
          .join(paths.cbNeckR2.split(points.neckSplit0R2)[1].split(points.neckSplit1)[0])
          .line(points.dartTip1)
          .line(points.neckSplit1R3)
          .join(paths.cbNeckR3.split(points.neckSplit1R3)[1].split(points.neckSplit2)[0])
          .line(points.dartTip2)
          .line(points.neckSplit2R4)
          .join(paths.cbNeck.split(points.neckSplit2R4)[1])
      }
    }

    paths.neckLine = drawNeck()

    if (options.sleeveStyle == 'raglan') {
      paths.neckLine = paths.neckLine.split(points.raglanNeckSplit)[1].hide()
    }

    const drawArmhole = () => (options.sleeveStyle == 'raglan' ? paths.raglan : paths.armhole)

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
      if (options.sleeveStyle != 'raglan') {
        macro('sprinkle', {
          snippet: 'bnotch',
          on: ['raglanNeckSplit', 'armholePitch'],
        })
      } else {
        snippets.raglanCurveEnd = new Snippet('backnotch', points.raglanCurveEnd)
      }
      //gather lines
      if (options.shapingStyle == 'gathers') {
        paths.gatheringLine = drawNeck()
          .split(points.raglanNeckSplit)[1]
          .attr('class', 'fabric hidden')

        macro('banner', {
          path: paths.gatheringLine,
          text: 'Gather',
          spaces: 10,
        })
      }
      //pleats
      let k
      for (let i = 0; i <= 2; i++) {
        k = i + 2
        if (options.shapingStyle == 'pleats') {
          paths['pleatFrom' + i] = new Path()
            .move(points['neckSplit' + i])
            .line(
              points['neckSplit' + i]
                .shiftFractionTowards(points['neckSplit' + i + 'R' + k], 3)
                .rotate(90, points['neckSplit' + i])
            )
            .attr('class', 'fabric help')
          paths['pleatMid' + i] = new Path()
            .move(points['dartBottomMid' + i])
            .line(
              points['dartBottomMid' + i]
                .shiftFractionTowards(points['neckSplit' + i + 'R' + k], 6)
                .rotate(90, points['dartBottomMid' + i])
            )
            .attr('data-text', 'Pleat')
            .attr('data-text-class', 'center')
          paths['pleatTo' + i] = new Path()
            .move(points['neckSplit' + i + 'R' + k])
            .line(
              points['neckSplit' + i + 'R' + k]
                .shiftFractionTowards(points['neckSplit' + i], 3)
                .rotate(-90, points['neckSplit' + i + 'R' + k])
            )
            .attr('class', 'fabric help')
        }
        if (options.shapingStyle == 'darts') {
          paths['dartEdge' + i] = new Path()
            .move(points['neckSplit' + i])
            .line(points['dartBottomEdge' + i])
            .line(points['neckSplit' + i + 'R' + k])
            .attr('class', 'fabric help')
        }
      }
    }

    return part
  },
}
