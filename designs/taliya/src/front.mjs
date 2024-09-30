import { pluginLogoRG } from '@freesewing/plugin-logorg'
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
    waistDartLength: 1, //Locked for Taliya
    bustDartFraction: 0.5, //Locked for Taliya
    //Style
    neckbandEnd: { pct: 21.1, min: 0, max: 25, menu: 'style' },
    frontNeckDepth: { pct: 22.5, min: 20, max: 75, menu: 'style' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    hemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
    shoulderSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
  },
  measurements: [
    'hips',
    'seat',
    'waistToHips',
    'waistToSeat',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToFloor',
  ],
  plugins: [pluginLogoRG],
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
      points['neckSplit' + i] = paths.cfNeck
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
      'neckSplit0',
    ]
    for (const p of rot2) points[p + 'R2'] = points[p].rotate((-bustDartAngle * 2) / 3, points.bust)

    const rot3 = [
      'shoulderTop',
      'shoulderTopCp2',
      'neckbandArmholeCp1',
      'neckbandArmhole',
      'neckSplit1',
    ]
    for (const p of rot3) points[p + 'R3'] = points[p].rotate(-bustDartAngle / 3, points.bust)

    //this is important these splits should only be rotated after
    points.neckSplit0 = points.neckSplit0.rotate(-bustDartAngle, points.bust)
    points.neckSplit1 = points.neckSplit1.rotate((-bustDartAngle * 2) / 3, points.bust)
    points.neckSplit2R4 = points.neckSplit2
    points.neckSplit2 = points.neckSplit2.rotate((-bustDartAngle * 1) / 3, points.bust)

    paths.cfNeckR1 = new Path()
      .move(points.shoulderTopR1)
      .curve(points.shoulderTopCp2R1, points.neckbandArmholeCp1R1, points.neckbandArmholeR1)
      .hide()
    paths.cfNeckR2 = new Path()
      .move(points.shoulderTopR2)
      .curve(points.shoulderTopCp2R2, points.neckbandArmholeCp1R2, points.neckbandArmholeR2)
      .hide()
    paths.cfNeckR3 = new Path()
      .move(points.shoulderTopR3)
      .curve(points.shoulderTopCp2R3, points.neckbandArmholeCp1R3, points.neckbandArmholeR3)
      .hide()
    paths.cfNeckR4 = paths.cfNeck.clone()
    let k
    for (let i = 0; i <= 2; i++) {
      k = i + 2
      points['bustDartMid' + i] = points['neckSplit' + i].shiftFractionTowards(
        points['neckSplit' + i + 'R' + k],
        0.5
      )
      points['bustDartTip' + i] = points['bustDartMid' + i].shiftFractionTowards(
        points.bust,
        options.bustDartLength
      )

      points['bustDartEdge' + i] = utils.beamsIntersect(
        points['bustDartTip' + i],
        points['bustDartMid' + i],
        points['neckSplit' + i + 'R' + k],
        paths['cfNeckR' + k].split(points['neckSplit' + i + 'R' + k])[1].shiftFractionAlong(0.005)
      )
    }

    if (options.daisyGuides) {
      points.bustDartBottom = points.hps.rotate(-bustDartAngle, points.bust)
      points.bustDartTip = points.bustDartBottom
        .shiftFractionTowards(points.hps, 0.5)
        .shiftFractionTowards(points.bust, options.bustDartLength)
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
      paths.cfNeckR2.attr('class', 'interfacing dashed').unhide()
      paths.cfNeckR3.attr('class', 'interfacing dashed').unhide()

      paths.neckGuide = paths.cfNeckR1
        .clone()
        .split(points.neckSplit0)[0]
        .line(points.bust)
        .line(points.neckSplit0R2)
        .join(paths.cfNeckR2.split(points.neckSplit0R2)[1].split(points.neckSplit1)[0])
        .line(points.bust)
        .line(points.neckSplit1R3)
        .join(paths.cfNeckR3.split(points.neckSplit1R3)[1].split(points.neckSplit2)[0])
        .line(points.bust)
        .line(points.neckSplit2R4)
        .join(paths.cfNeck.split(points.neckSplit2R4)[1])
        .attr('class', 'interfacing')
    }

    points.gatherNeckSplitCp1 = utils.beamsIntersect(
      paths.cfNeck.split(points.gatherNeckSplit)[1].shiftFractionAlong(0.005),
      points.gatherNeckSplit,
      points.bust,
      points.neckSplit2
    )
    points.raglanNeckSplitCp2 = utils.beamsIntersect(
      paths.cfNeckR1.split(points.raglanNeckSplit)[0].shiftFractionAlong(0.995),
      points.raglanNeckSplit,
      points.bust,
      points.neckSplit0R2
    )
    //paths
    paths.hemBase = new Path().move(points.cfHem).curve_(points.cfHemCp2, points.sideHem).hide()

    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.armholeCp1, points.armhole)
      .hide()

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

    const drawNeck = () => {
      if (options.shapingStyle == 'gathers') {
        return paths.cfNeckR1
          .split(points.raglanNeckSplit)[0]
          .curve(points.raglanNeckSplitCp2, points.gatherNeckSplitCp1, points.gatherNeckSplit)
          .join(paths.cfNeck.split(points.gatherNeckSplit)[1])
      }
      if (options.shapingStyle == 'pleats') {
        return paths.cfNeckR1
          .split(points.neckSplit0)[0]
          .line(points.neckSplit0R2)
          .join(paths.cfNeckR2.split(points.neckSplit0R2)[1].split(points.neckSplit1)[0])
          .line(points.neckSplit1R3)
          .join(paths.cfNeckR3.split(points.neckSplit1R3)[1].split(points.neckSplit2)[0])
          .line(points.neckSplit2R4)
          .join(paths.cfNeck.split(points.neckSplit2R4)[1])
      }
      if (options.shapingStyle == 'darts') {
        return paths.cfNeckR1
          .split(points.neckSplit0)[0]
          .line(points.bustDartTip0)
          .line(points.neckSplit0R2)
          .join(paths.cfNeckR2.split(points.neckSplit0R2)[1].split(points.neckSplit1)[0])
          .line(points.bustDartTip1)
          .line(points.neckSplit1R3)
          .join(paths.cfNeckR3.split(points.neckSplit1R3)[1].split(points.neckSplit2)[0])
          .line(points.bustDartTip2)
          .line(points.neckSplit2R4)
          .join(paths.cfNeck.split(points.neckSplit2R4)[1])
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
      .line(points.neckbandEnd)
      .line(points.cfNeckbandEnd)
      .line(points.cfHem)
      .close()
    //stores
    store.set('sideSeamLength', paths.sideSeam.length())
    if (complete) {
      //grainline
      let titleCutNum
      if (options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfNeckbandEnd.shiftFractionTowards(points.cfHem, 0.15)
        points.cutOnFoldTo = points.cfHem.shiftFractionTowards(points.cfNeckbandEnd, 0.15)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.neckbandEnd.shiftFractionTowards(
          new Point(points.neckbandEnd.x, points.cfHem.y),
          0.15
        )
        points.grainlineTo = new Point(points.neckbandEnd.x, points.cfHem.y).shiftFractionTowards(
          points.neckbandEnd,
          0.15
        )
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      snippets.gatherNeckSplit = new Snippet('bnotch', points.gatherNeckSplit)
      points.sideBottomNotch = paths.sideSeam.shiftFractionAlong(0.25)
      points.sideTopNotch = paths.sideSeam.shiftFractionAlong(0.75)
      if (options.sleeveStyle != 'raglan') {
        snippets.raglanNeckSplit = new Snippet('bnotch', points.raglanNeckSplit)
        snippets.armholePitch = new Snippet('notch', points.armholePitch)
      } else {
        snippets.raglanCurveEnd = new Snippet('notch', points.raglanCurveEnd)
      }
      macro('sprinkle', {
        snippet: 'notch',
        on: ['sideBottomNotch', 'sideTopNotch', 'neckbandEnd', 'neckbandArmhole'],
      })
      //title
      points.title = points.bust.shiftFractionTowards(points.cfChest, 0.45)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Front',
        scale: 0.5,
        cutNr: titleCutNum,
      })
      //logo
      points.logo = points.bust.shift(0, points.bust.dist(points.armhole) * 0.45)
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = points.bust.shift(-90, points.cfChest.dist(points.cfWaist) * 0.45)
      macro('scalebox', {
        at: points.scalebox,
      })
      //gather lines
      if (options.shapingStyle == 'gathers') {
        paths.gatheringLine = drawNeck()
          .split(points.raglanNeckSplit)[1]
          .split(points.gatherNeckSplit)[0]
          .attr('class', 'fabric hidden')

        macro('banner', {
          path: paths.gatheringLine,
          text: 'Gather',
          spaces: 8,
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
            .move(points['bustDartMid' + i])
            .line(
              points['bustDartMid' + i]
                .shiftFractionTowards(points['neckSplit' + i + 'R' + k], 6)
                .rotate(90, points['bustDartMid' + i])
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
            .line(points['bustDartEdge' + i])
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
          paths.bandSa = new Path()
            .move(points.neckbandArmhole)
            .line(points.neckbandEnd)
            .attr('class', 'fabric hidden')
            .attr('data-text', utils.units(bandSa) + ' Seam Allowance')
            .attr('data-text-class', 'center')
            .unhide()
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
          paths.cfNeckR1.split(points.raglanNeckSplit)[1].offset(bandSa).shiftFractionAlong(0.005),
          paths.cfNeckR1.split(points.raglanNeckSplit)[1].offset(bandSa).start()
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
              paths.cfNeckR1 = paths.cfNeckR1.split(points.raglanNeckSplit)[1].hide()
            }
            return paths.cfNeckR1
              .split(points.neckSplit0)[0]
              .offset(bandSa)
              .join(
                paths.cfNeckR2
                  .split(points.neckSplit0R2)[1]
                  .split(points.neckSplit1)[0]
                  .offset(bandSa)
              )
              .join(
                paths.cfNeckR3
                  .split(points.neckSplit1R3)[1]
                  .split(points.neckSplit2)[0]
                  .offset(bandSa)
              )
              .join(paths.cfNeck.split(points.neckSplit2R4)[1].offset(bandSa))
          }
          if (options.shapingStyle == 'darts') {
            if (options.sleeveStyle == 'raglan') {
              paths.cfNeckR1 = paths.cfNeckR1.split(points.raglanNeckSplit)[1].hide()
            }
            return paths.cfNeckR1
              .split(points.neckSplit0)[0]
              .line(points.bustDartEdge0)
              .line(points.neckSplit0R2)
              .join(paths.cfNeckR2.split(points.neckSplit0R2)[1].split(points.neckSplit1)[0])
              .line(points.bustDartEdge1)
              .line(points.neckSplit1R3)
              .join(paths.cfNeckR3.split(points.neckSplit1R3)[1].split(points.neckSplit2)[0])
              .line(points.bustDartEdge2)
              .line(points.neckSplit2R4)
              .join(paths.cfNeck.split(points.neckSplit2R4)[1])
              .offset(bandSa)
              .trim()
          }
        }

        points.saNeckbandEnd = points.neckbandEnd.translate(-bandSa, -sa)
        points.saCfNeckbandEnd = new Point(points.saCfNeck.x, points.saNeckbandEnd.y)
        points.saCfHem = new Point(points.saCfNeck.x, points.cfHem.y + hemSa)

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(drawArmhole().offset(armholeSa))
          .join(drawSaShoulder())
          .join(drawSaNeck())
          .line(points.saNeckbandEnd)
          .line(points.saCfNeckbandEnd)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
