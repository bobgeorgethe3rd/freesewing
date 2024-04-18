import { backBase } from './backBase.mjs'
import { front } from './front.mjs'

export const back = {
  name: 'taliya.back',
  from: backBase,
  after: front,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Darts
    shapingStyle: { dflt: 'gathers', list: ['gathers', 'pleats', 'darts'], menu: 'darts' },
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
    const sideAngle = store.get('sideAngle')
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
    for (const p of rot3) points[p + 'R3'] = points[p].rotate(-waistDartAngle / 3, points.dartTip)

    //this is important these splits should only be rotated after
    points.neckSplit0 = points.neckSplit0.rotate(-waistDartAngle, points.dartTip)
    points.neckSplit1 = points.neckSplit1.rotate((-waistDartAngle * 2) / 3, points.dartTip)
    points.neckSplit2R4 = points.neckSplit2
    points.neckSplit2 = points.neckSplit2.rotate(-waistDartAngle / 3, points.dartTip)
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
    //skirt
    points.sideWaist = points.sideWaist.rotate(waistDartAngle, points.armhole)
    let tweak = 1
    let delta
    do {
      points.sideHem = points.sideWaist.shift(270 + sideAngle, store.get('bodyLength') * tweak)
      points.sideHemCp2 = points.sideHem.shiftFractionTowards(points.sideWaist, (2 / 3) * tweak)
      points.armholeCp1 = points.armhole.shiftFractionTowards(points.sideWaist, (2 / 3) * tweak)

      paths.sideSeam = new Path()
        .move(points.sideHem)
        .curve(points.sideHemCp2, points.armholeCp1, points.armhole)
        .hide()

      delta = paths.sideSeam.length() - store.get('sideSeamLength')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    points.cbHemCp2 = utils.beamsIntersect(
      points.sideHem,
      points.sideHem.shift(180 + sideAngle, 1),
      new Point(points.sideHem.x / 2, points.sideHem.y),
      new Point(points.sideHem.x / 2, points.sideHem.y * 1.1)
    )
    points.cbHem = utils.beamIntersectsX(
      points.cbHemCp2,
      points.cbHemCp2.shift(180, 1),
      points.cbWaist.x
    )
    if (points.cbHem.y < points.cbWaist.y) {
      points.cbHem = points.cbWaist
      points.cbHemCp2 = new Point(points.cbHemCp2.x, points.cbWaist.y)
    }

    //paths
    paths.hemBase = new Path().move(points.cbHem).curve_(points.cbHemCp2, points.sideHem).hide()

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

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(drawArmhole())
      .line(paths.neckLine.start())
      .join(paths.neckLine)
      .line(points.cbHem)
      .close()

    if (complete) {
      //grainline
      if (options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.15)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      points.sideBottomNotch = paths.sideSeam.shiftFractionAlong(0.25)
      points.sideTopNotch = paths.sideSeam.shiftFractionAlong(0.75)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['sideBottomNotch', 'sideTopNotch'],
      })
      if (options.sleeveStyle != 'raglan') {
        macro('sprinkle', {
          snippet: 'bnotch',
          on: ['raglanNeckSplit', 'armholePitch'],
        })
      } else {
        snippets.raglanCurveEnd = new Snippet('bnotch', points.raglanCurveEnd)
      }
      //title
      points.title = points.cArmhole.shiftFractionTowards(points.dartTip, 0.5)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Back',
        scale: 0.5,
      })
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
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckbandWidth = store.get('neckbandWidth')
        let bandSa = sa
        if (sa > neckbandWidth / 2) {
          bandSa = neckbandWidth / 4
        }

        points.saSideHem = utils.beamsIntersect(
          paths.hemBase.offset(hemSa).shiftFractionAlong(0.995),
          paths.hemBase.offset(hemSa).end(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.005),
          paths.sideSeam.offset(sideSeamSa).start()
        )

        points.saArmholeCorner = utils.beamsIntersect(
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.995),
          paths.sideSeam.offset(sideSeamSa).end(),
          drawArmhole().offset(armholeSa).shiftFractionAlong(0.005),
          drawArmhole().offset(armholeSa).start()
        )

        points.saRaglanNeckSplit = utils.beamsIntersect(
          points.raglanCurveEnd
            .shiftTowards(points.raglanNeckSplit, armholeSa)
            .rotate(-90, points.raglanCurveEnd),
          points.raglanNeckSplit
            .shiftTowards(points.raglanCurveEnd, armholeSa)
            .rotate(90, points.raglanNeckSplit),
          paths.cbNeckR1.split(points.raglanNeckSplit)[1].offset(bandSa).shiftFractionAlong(0.005),
          paths.cbNeckR1.split(points.raglanNeckSplit)[1].offset(bandSa).start()
        )
        points.saShoulderCorner = utils.beamsIntersect(
          points.armholePitchCp2
            .shiftTowards(points.shoulder, armholeSa)
            .rotate(-90, points.armholePitchCp2),
          points.shoulder
            .shiftTowards(points.armholePitchCp2, armholeSa)
            .rotate(90, points.shoulder),
          points.shoulder
            .shiftTowards(points.shoulderTopR1, shoulderSa)
            .rotate(-90, points.shoulder),
          points.shoulderTopR1
            .shiftTowards(points.shoulder, shoulderSa)
            .rotate(90, points.shoulderTopR1)
        )
        points.saShoulderTop = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.shoulder.angle(points.shoulderTopR1), 1),
          points.shoulderTopR1
            .shiftTowards(points.shoulderTopCp2R1, bandSa)
            .rotate(-90, points.shoulderTopR1),
          points.shoulderTopCp2R1
            .shiftTowards(points.shoulderTopR1, bandSa)
            .rotate(90, points.shoulderTopCp2R1)
        )

        const drawSaShoulder = () => {
          if (options.sleeveStyle == 'raglan') {
            return new Path().move(points.saRaglanNeckSplit)
          } else {
            return new Path().move(points.saShoulderCorner).line(points.saShoulderTop)
          }
        }

        const drawSaNeck = () => {
          if (options.shapingStyle == 'gathers') {
            return paths.neckLine.offset(bandSa)
          }
          if (options.shapingStyle == 'pleats') {
            if (options.sleeveStyle == 'raglan') {
              paths.cbNeckR1 = paths.cbNeckR1.split(points.raglanNeckSplit)[1].hide()
            }
            return paths.cbNeckR1
              .split(points.neckSplit0)[0]
              .offset(bandSa)
              .join(
                paths.cbNeckR2
                  .split(points.neckSplit0R2)[1]
                  .split(points.neckSplit1)[0]
                  .offset(bandSa)
              )
              .join(
                paths.cbNeckR3
                  .split(points.neckSplit1R3)[1]
                  .split(points.neckSplit2)[0]
                  .offset(bandSa)
              )
              .join(paths.cbNeck.split(points.neckSplit2R4)[1].offset(bandSa))
          }
          if (options.shapingStyle == 'darts') {
            if (options.sleeveStyle == 'raglan') {
              paths.cbNeckR1 = paths.cbNeckR1.split(points.raglanNeckSplit)[1].hide()
            }
            return paths.cbNeckR1
              .split(points.neckSplit0)[0]
              .line(points.dartBottomEdge0)
              .line(points.neckSplit0R2)
              .join(paths.cbNeckR2.split(points.neckSplit0R2)[1].split(points.neckSplit1)[0])
              .line(points.dartBottomEdge1)
              .line(points.neckSplit1R3)
              .join(paths.cbNeckR3.split(points.neckSplit1R3)[1].split(points.neckSplit2)[0])
              .line(points.dartBottomEdge2)
              .line(points.neckSplit2R4)
              .join(paths.cbNeck.split(points.neckSplit2R4)[1])
              .offset(bandSa)
              .trim()
          }
        }

        points.saCbNeck = new Point(points.saCbNeck.x, points.cbNeck.y - bandSa)
        points.saCbHem = new Point(points.saCbNeck.x, points.cbHem.y + hemSa)

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(drawArmhole().offset(armholeSa))
          .join(drawSaShoulder())
          .join(drawSaNeck())
          .line(points.saCbNeck)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
