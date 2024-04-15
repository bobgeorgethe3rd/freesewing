import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'taliya.front',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constant
    bustDartPlacement: 'bustSide', //Locked for Taliya
    bustDartLength: 1, //Locked for Taliya
    waistDartLength: 1, //Locked for Taliya
    bustDartFraction: 0.5, //Locked for Taliya
    //Style
    neckbandEnd: { pct: 21.1, min: 0, max: 25, menu: 'style' },
    frontNeckDepth: { pct: 22.5, min: 20, max: 75, menu: 'style' },
    //Sleeves
    raglanSleeves: { bool: true, menu: 'sleeves' },
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
    const keepThese = 'cfNeck'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const bustDartAngle = store.get('bustDartAngle')
    //let's begin
    let j
    for (let i = 0; i <= 2; i++) {
      j = i + 1
      points['neckSpit' + i] = paths.cfNeck
        .split(points.raglanNeckSplit)[1]
        .split(points.gatherNeckSplit)[0]
        .shiftFractionAlong(j / 4)
    }

    const rot0 = [
      'bustDartTop',
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
    for (const p of rot0) points[p] = points[p].rotate(-bustDartAngle, points.bust)

    const rot1 = ['shoulderTop', 'shoulderTopCp2', 'neckbandArmholeCp1', 'neckbandArmhole']
    for (const p of rot1) points[p + 'R1'] = points[p].rotate(-bustDartAngle, points.bust)

    const rot2 = [
      'shoulderTop',
      'shoulderTopCp2',
      'neckbandArmholeCp1',
      'neckbandArmhole',
      'neckSpit0',
    ]
    for (const p of rot2) points[p + 'R2'] = points[p].rotate((-bustDartAngle * 2) / 3, points.bust)

    const rot3 = [
      'shoulderTop',
      'shoulderTopCp2',
      'neckbandArmholeCp1',
      'neckbandArmhole',
      'neckSpit1',
    ]
    for (const p of rot3) points[p + 'R3'] = points[p].rotate((-bustDartAngle * 1) / 3, points.bust)

    //this is important these splits should only be rotated after
    points.neckSpit0 = points.neckSpit0.rotate(-bustDartAngle, points.bust)
    points.neckSpit1 = points.neckSpit1.rotate((-bustDartAngle * 2) / 3, points.bust)
    points.neckSpit2R4 = points.neckSpit2
    points.neckSpit2 = points.neckSpit2.rotate((-bustDartAngle * 1) / 3, points.bust)

    paths.cfNeckR1 = new Path()
      .move(points.shoulderTopR1)
      .curve(points.shoulderTopCp2R1, points.neckbandArmholeCp1R1, points.neckbandArmholeR1)
      .hide()
    if (options.daisyGuides) {
      points.bustDartBottom = points.hps.rotate(-bustDartAngle, points.bust)
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.waistDartTip)
        .line(points.waistDartRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.bustDartBottom)
        .line(points.bustDartTip)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .attr('class', 'various lashed')

      paths.cfNeck.attr('class', 'interfacing dashed').unhide()
      paths.cfNeckR1.attr('class', 'interfacing dashed').unhide()
      paths.cfNeckR2 = new Path()
        .move(points.shoulderTopR2)
        .curve(points.shoulderTopCp2R2, points.neckbandArmholeCp1R2, points.neckbandArmholeR2)
        .attr('class', 'interfacing dashed')

      paths.cfNeckR3 = new Path()
        .move(points.shoulderTopR3)
        .curve(points.shoulderTopCp2R3, points.neckbandArmholeCp1R3, points.neckbandArmholeR3)
        .attr('class', 'interfacing dashed')

      paths.neckGuide = paths.cfNeckR1
        .clone()
        .split(points.neckSpit0)[0]
        .line(points.bust)
        .line(points.neckSpit0R2)
        .join(paths.cfNeckR2.split(points.neckSpit0R2)[1].split(points.neckSpit1)[0])
        .line(points.bust)
        .line(points.neckSpit1R3)
        .join(paths.cfNeckR3.split(points.neckSpit1R3)[1].split(points.neckSpit2)[0])
        .line(points.bust)
        .line(points.neckSpit2R4)
        .join(paths.cfNeck.split(points.neckSpit2R4)[1])
        .attr('class', 'interfacing')
    }

    points.gatherNeckSplitCp1 = utils.beamsIntersect(
      paths.cfNeck.split(points.gatherNeckSplit)[1].shiftFractionAlong(0.005),
      points.gatherNeckSplit,
      points.bust,
      points.neckSpit2
    )
    points.raglanNeckSplitCp2 = utils.beamsIntersect(
      paths.cfNeckR1.split(points.raglanNeckSplit)[0].shiftFractionAlong(0.995),
      points.raglanNeckSplit,
      points.bust,
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

    paths.neckLine = paths.cfNeckR1
      .split(points.raglanNeckSplit)[0]
      .curve(points.raglanNeckSplitCp2, points.gatherNeckSplitCp1, points.gatherNeckSplit)
      .join(paths.cfNeck.split(points.gatherNeckSplit)[1])
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
      .line(points.neckbandEnd)
      .line(points.cfNeckbandEnd)

    if (complete) {
      //grainline

      //notches
      snippets.gatherNeckSplit = new Snippet('bnotch', points.gatherNeckSplit)
      if (!options.raglanSleeves) {
        snippets.raglanNeckSplit = new Snippet('bnotch', points.raglanNeckSplit)
        snippets.armholePitch = new Snippet('notch', points.armholePitch)
      }
      macro('sprinkle', {
        snippet: 'notch',
        on: ['neckbandEnd', 'neckbandArmhole'],
      })
    }

    return part
  },
}
