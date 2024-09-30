import { front as frontAimee } from '@freesewing/aimee'
import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const front = {
  name: 'shannon.front',
  from: frontAimee.from,
  after: frontAimee.after,
  hide: {
    from: true,
    after: true,
    inherited: true,
  },
  plugins: [pluginLogoRG],
  measurements: [
    ...frontAimee.measurements,
    'waistToHips',
    'waistToSeat',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToFloor',
  ],
  optionalMeasurements: frontAimee.optionalMeasurements,
  options: {
    //Imported
    ...frontAimee.options,
    //Constants
    useVoidStores: false, //Locked for Shannon
    waistDartLength: 1, //Locked for Shannon
    fullSleeves: true, //Locked for Shannon
    closurePosition: 'side', //Locked for Shannon
    closureSaWidth: 0.01, //Locked for Shannon
    cpFraction: 0.55191502449,
    //Style
    skirtFullness: { pct: 50, min: 25, max: 100, menu: 'style' },
    skirtLength: { pct: 150, min: 0, max: 200, menu: 'style' },
    skirtLengthBonus: { pct: 0, min: -50, max: 50, menu: 'style' },
    neckTieWidth: { pct: 6.5, min: 5, max: 8, snap: 3.175, ...pctBasedOn('hpsToWaistBack') },
    //Armhole
    frontArmholePitchDepth: { pct: 50, min: 45, max: 65, menu: 'armhole' }, //Unlocked for Shannon
    frontArmholePitchWidth: { pct: 91.1, min: 90, max: 95, menu: 'armhole' }, //Unlocked for Shannon
    frontArmholeDepth: { pct: /* 44.8 */ 55.2, min: 40, max: 65, menu: 'armhole' }, //Unlocked for Shannon
    //Darts
    bustDartLength: { pct: 70, min: 60, max: 100, menu: 'darts' }, //Unlocked for Shannon
    //Plackets
    frontPlacketWidth: { pct: 76.2, min: 50, max: 90, menu: 'plackets' },
    frontPlacketLength: { pct: 100, min: 75, max: 100, menu: 'plackets' },
    neckOpeningLength: { pct: 85, min: 75, max: 100, menu: 'plackets' },
    neckOpeningWidth: { pct: 2.4, min: 1, max: 3, menu: 'plackets' },
    //Pockets
    patchPocketsBool: { bool: true, menu: 'pockets' },
    patchPocketAngle: { pct: 50, min: 30, max: 70, menu: 'pockets' },
    patchPocketPlacement: { pct: 7, min: 0, max: 10, menu: 'pockets' },
    patchPocketWidth: { pct: 70, min: 10, max: 75, menu: 'pockets.patchPockets' }, //Altered for Shannon
    patchPocketPeakDepth: { pct: 100, min: 0, max: 100, menu: 'pockets.patchPockets' }, //Altered for Shannon
    patchPocketDepth: { pct: 39.3, min: 10, max: 60, menu: 'pockets.patchPockets' }, //Altered for Shannon
    //Sleeves
    sleeveLength: { pct: 0, min: 0, max: 100, menu: 'sleeves' }, //Altered for Shannon
    sleeveStyle: { dflt: 'inbuilt', list: ['inbuilt', 'dolman', 'inset'], menu: 'sleeves' }, //Altered for Shannon
    //Construction
    armholeSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Shannon
    cfSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Shannon
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Shannon
    skirtHemWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Shannon
  },
  draft: (sh) => {
    const {
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
      absoluteOptions,
      snippets,
      Snippet,
    } = sh
    //draft
    frontAimee.draft(sh)
    //removing paths and snippets not required from Bella
    const keepThese = ['daisyGuide', 'armLine', 'anchorLines']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //measures
    const frontPlacketWidth = points.hps.x * options.frontPlacketWidth
    const neckOpeningWidth = measurements.neck * options.neckOpeningWidth
    const skirtFullnessRatio =
      points.cfWaist.dist(points.waistDartLeft) /
      (points.cfWaist.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideWaist))
    const neckTieWidth = absoluteOptions.neckTieWidth

    let skirtLength
    if (options.skirtLength < 0.5) {
      skirtLength =
        measurements.waistToHips * (1 - options.skirtLength * 2) +
        measurements.waistToSeat * 2 * options.skirtLength
    }
    if (options.skirtLength >= 0.5 && options.skirtLength < 1) {
      skirtLength =
        measurements.waistToSeat * (-2 * options.skirtLength + 2) +
        measurements.waistToUpperLeg * (2 * options.skirtLength - 1)
    }
    if (options.skirtLength >= 1 && options.skirtLength < 1.5) {
      skirtLength =
        measurements.waistToUpperLeg * (-2 * options.skirtLength + 3) +
        measurements.waistToKnee * (2 * options.skirtLength - 2)
    }
    if (options.skirtLength >= 1.5) {
      skirtLength =
        measurements.waistToKnee * (-2 * options.skirtLength + 4) +
        measurements.waistToFloor * (2 * options.skirtLength - 3)
    }
    skirtLength = skirtLength * (1 + options.skirtLengthBonus)
    //let's begin
    //placket
    points.frontPlacketBottom = points.cfNeck.shiftFractionTowards(
      points.cfChest,
      options.frontPlacketLength
    )
    //neckOpening
    points.cfNeckOpening = points.cfNeck.shiftFractionTowards(
      new Point(points.cfNeck.x, points.frontPlacketBottom.y - frontPlacketWidth),
      options.neckOpeningLength
    )
    points.neckOpeningBottom = points.cfNeckOpening.translate(neckOpeningWidth, -neckOpeningWidth)
    points.neckOpening = utils.lineIntersectsCurve(
      points.neckOpeningBottom,
      new Point(points.neckOpeningBottom.x, points.hps.y),
      points.hps,
      points.hpsCp2,
      points.cfNeckCp1,
      points.cfNeck
    )
    points.neckOpeningBottomCp2 = points.neckOpeningBottom.shift(
      -90,
      neckOpeningWidth * options.cpFraction
    )
    points.cfNeckOpeningCp1 = points.cfNeckOpening.shift(0, neckOpeningWidth * options.cpFraction)
    //skirt
    const skirtAngle = 90 * options.skirtFullness
    points.sideHem = points.sideWaist.shift(
      -90 + skirtAngle * (1 - skirtFullnessRatio),
      skirtLength
    )
    points.skirtOrigin = utils.beamsIntersect(
      points.sideHem,
      points.sideWaist,
      points.cfWaist,
      points.cfWaist.shift(90 - skirtAngle * skirtFullnessRatio, 1)
    )
    const skirtRadius = points.skirtOrigin.dist(points.sideHem)
    const skirtCpDistance = (4 / 3) * skirtRadius * Math.tan(utils.deg2rad(skirtAngle / 4))
    points.cfHem = points.skirtOrigin.shiftTowards(points.cfWaist, skirtRadius)
    points.cfHemCp2 = points.cfHem
      .shiftTowards(points.skirtOrigin, skirtCpDistance)
      .rotate(-90, points.cfHem)
    points.sideHemCp1 = points.sideHem
      .shiftTowards(points.skirtOrigin, skirtCpDistance)
      .rotate(90, points.sideHem)

    points.underArmCurveStartCp1 = points.underArmCurveStartCp2.rotate(
      180,
      points.underArmCurveStart
    )
    //dolman sleeves
    paths.underArmCurve = new Path()
      .move(points.underArmCurveStart)
      .curve(
        points.underArmCurveStartCp2,
        points.bodiceSleeveBottomMinCp1,
        points.bodiceSleeveBottomMin
      )
      .hide()

    points.dolmanSleeveFront = paths.underArmCurve.shiftFractionAlong(0.5)
    points.dolmanSleeveTip = points.shoulderRise.shiftFractionTowards(
      points.bodiceSleeveTopMin,
      0.5
    )
    points.dolmanSleeveCpTarget = utils.beamsIntersect(
      points.dolmanSleeveTip,
      points.hps.rotate(90, points.dolmanSleeveTip),
      points.dolmanSleeveFront,
      paths.underArmCurve.shiftFractionAlong(0.49).rotate(-90, points.dolmanSleeveFront)
    )
    points.dolmanSleeveTipCp1 = points.dolmanSleeveTip.shiftFractionTowards(
      points.dolmanSleeveCpTarget,
      0.5
    )
    points.dolmanSleeveFrontCp2 = points.dolmanSleeveFront.shiftFractionTowards(
      points.dolmanSleeveCpTarget,
      0.5
    )
    points.dolmanMidAnchor = utils.beamsIntersect(
      points.bodiceSleeveBottomMin,
      points.bodiceSleeveBottomMin.shift(
        points.dolmanSleeveCpTarget.angle(points.dolmanSleeveTip),
        1
      ),
      points.hps,
      points.shoulderRise
    )
    points.dolmanSleeveFrontAnchor = utils.beamsIntersect(
      points.dolmanSleeveFront,
      points.dolmanSleeveFront.shift(points.dolmanSleeveCpTarget.angle(points.dolmanSleeveTip), 1),
      points.hps,
      points.shoulderRise
    )
    //paths
    paths.hemBase = new Path()
      .move(points.cfHem)
      .curve(points.cfHemCp2, points.sideHemCp1, points.sideHem)
      .hide()

    paths.saRight = new Path()
      .move(points.sideHem)
      .curve(points.sideWaist, points.underArmCurveStartCp1, points.underArmCurveStart)
      .hide()

    paths.dolman = new Path()
      .move(points.dolmanSleeveFront)
      .curve(points.dolmanSleeveFrontCp2, points.dolmanSleeveTipCp1, points.dolmanSleeveTip)
      .hide()

    points.dolmanMid = paths.dolman.shiftFractionAlong(0.5)

    const drawSaRight = () => {
      if (options.sleeveStyle == 'inbuilt') {
        return paths.saRight.join(paths.underArmCurve).line(points.bodiceSleeveBottom)
      }
      if (options.sleeveStyle == 'dolman') {
        return paths.saRight.join(paths.underArmCurve).split(points.dolmanSleeveFront)[0]
      }
      if (options.sleeveStyle == 'inset') {
        return paths.saRight.line(points.armhole)
      }
    }

    const drawArm = () => {
      if (options.sleeveStyle == 'inbuilt') {
        return new Path().move(points.bodiceSleeveBottom).line(points.bodiceSleeveTop)
      }
      if (options.sleeveStyle == 'dolman') {
        return paths.dolman
      }
      if (options.sleeveStyle == 'inset') {
        return new Path()
          .move(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
          .line(points.bustDartTip)
          .line(points.bustDartTop)
          .curve_(points.armholePitchCp2, points.shoulder)
      }
    }
    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .hide()

    paths.saLeft = new Path()
      .move(points.cfNeckOpening)
      .line(points.cfChest)
      .curve(points.cfWaist, points.cfWaist, points.cfHem)
      .hide()

    paths.seam = paths.hemBase
      .join(drawSaRight())
      .join(drawArm())
      .line(points.hps)
      .join(paths.cfNeck)
      .line(points.cfNeckOpening)
      .join(paths.saLeft)
      .close()
    //front pockets
    if (options.patchPocketsBool) {
      points.patchPocketAnchor = utils.lineIntersectsCurve(
        points.skirtOrigin,
        points.cfHem.rotate(skirtAngle * options.patchPocketAngle, points.skirtOrigin),
        points.cfWaist,
        points.waistDartRight,
        points.waistDartRight,
        points.sideWaist
      )
      points.patchPocketMid = points.skirtOrigin.shiftOutwards(
        points.patchPocketAnchor,
        measurements.waistToFloor * options.patchPocketPlacement
      )
      points.patchPocketLeft = points.patchPocketMid.shift(
        points.skirtOrigin.angle(points.cfHem) + skirtAngle * options.patchPocketAngle - 90,
        measurements.waist * 0.125 * options.patchPocketWidth
      )
      points.patchPocketRight = points.patchPocketLeft.rotate(180, points.patchPocketMid)
      points.patchPocketBottom = points.patchPocketMid.shift(
        points.patchPocketRight.angle(points.patchPocketLeft) + 90,
        measurements.waist * 0.25 * options.patchPocketDepth +
          points.patchPocketMid.dist(points.patchPocketLeft) * options.patchPocketPeak
      )
      store.set('patchPocketWidth', points.patchPocketLeft.dist(points.patchPocketRight))
      store.set(
        'patchPocketDepth',
        points.patchPocketMid.dist(points.patchPocketBottom) -
          points.patchPocketMid.dist(points.patchPocketLeft) * options.patchPocketPeak
      )
      store.set('patchPocketRadius', points.skirtOrigin.dist(points.patchPocketBottom))
    }
    //stores
    store.set('skirtLength', skirtLength)
    store.set('skirtCentreAngle', points.cfWaist.angle(points.cfHem))
    store.set('skirtSideAngle', points.sideWaist.angle(points.sideHem))
    store.set('neckFront', paths.cfNeck.split(points.neckOpening)[0].length())
    store.set('frontPlacketWidth', frontPlacketWidth)
    store.set('neckOpeningWidth', neckOpeningWidth)
    store.set('neckTieWidth', neckTieWidth)
    store.set(
      'collarAngle',
      points.neckOpening.angle(paths.cfNeck.split(points.neckOpening)[0].shiftFractionAlong(0.99))
    )
    store.set('skirtRadius', points.skirtOrigin.dist(points.cfHem))
    store.set(
      'cummerbundLength',
      points.cfWaist.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideWaist)
    )

    if (options.sleeveStyle == 'dolman') {
      store.set('scyeFrontWidth', points.dolmanSleeveFront.dist(points.dolmanSleeveTip))
      store.set('scyeFrontDepth', points.dolmanSleeveFrontAnchor.dist(points.dolmanSleeveTip))
      store.set('frontArmholeLength', paths.dolman.length())
      store.set('frontArmholeToArmholePitch', paths.dolman.length() * 0.5)
      store.set('dolmanFrontExWidth', points.bodiceSleeveBottomMin.dist(points.dolmanMidAnchor))
      store.set('dolmanFrontExDepth', points.dolmanMidAnchor.dist(points.dolmanSleeveFrontAnchor))
    }

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.hps.x * 0.5, points.cfNeck.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.neckTieTop0 = points.neckOpening.shiftFractionTowards(points.neckOpeningBottom, 0.15)
      points.neckTieBottom0 = points.neckTieTop0.shiftTowards(
        points.neckOpeningBottom,
        neckTieWidth * 0.98
      )
      points.neckTieBottom1 = points.neckOpeningBottom.shiftFractionTowards(
        points.neckOpening,
        0.15
      )
      points.neckTieTop1 = points.neckTieBottom1.shiftTowards(
        points.neckOpening,
        neckTieWidth * 0.98
      )
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfNeckOpening', 'cfChest', 'underArmCurveStart', 'neckTieTop0', 'neckTieTop1'],
      })
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['neckTieBottom0', 'neckTieBottom1'],
      })
      if (options.sleeveLength > 0 && options.fullSleeves && options.sleeveStyle == 'inbuilt') {
        snippets.bodiceSleeveBottomMin = new Snippet('notch', points.bodiceSleeveBottomMin)
      }
      if (options.sleeveStyle == 'dolman') {
        snippets.dolmanMid = new Snippet('notch', points.dolmanMid)
      }
      if (
        options.patchPocketsBool &&
        points.skirtOrigin.dist(points.patchPocketBottom) < points.skirtOrigin.dist(points.cfHem)
      ) {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['patchPocketLeft', 'patchPocketRight'],
        })
        paths.pocketLine = new Path()
          .move(points.patchPocketLeft)
          .line(points.patchPocketRight)
          .attr('class', 'mark')
          .attr('data-text', 'Pocket line')
          .attr('data-text-class', 'center')
      }
      //title
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Front',
        cutNr: 2,
        scale: 0.5,
      })
      //logo
      points.logo = points.scalebox
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = new Point(points.scalebox.x, (points.cfChest.y + points.cfWaist.y) / 2)
      macro('scalebox', {
        at: points.scalebox,
      })
      //stitching line
      paths.stitchingGuide = new Path()
        .move(points.neckOpening)
        .line(points.neckOpeningBottom)
        .curve(points.neckOpeningBottomCp2, points.cfNeckOpeningCp1, points.cfNeckOpening)
        .attr('class', 'fabric help')
        .attr('data-text', 'Stitching - Line')
        .attr('data-text-class', 'center')
      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const cfSa = sa * options.cfSaWidth * 100

        points.saCfHem = points.cfHem
          .shift(points.cfWaist.angle(points.cfHem), hemSa)
          .shift(points.cfHemCp2.angle(points.cfHem), cfSa)
        points.saSideHem = points.sideHem
          .shift(points.sideWaist.angle(points.sideHem), hemSa)
          .shift(points.sideHemCp1.angle(points.sideHem), sideSeamSa)
        points.saRightEnd = drawSaRight().offset(sideSeamSa).end()
        points.saDolmanSleeveFront = points.saRightEnd.shift(
          points.dolmanSleeveFront.angle(points.saRightEnd) + 90,
          armholeSa
        )
        points.saDolmanSleeveTip = points.dolmanSleeveTip
          .shift(points.dolmanSleeveTipCp1.angle(points.dolmanSleeveTip), shoulderSa)
          .shift(points.hps.angle(points.shoulderRise), armholeSa)

        const drawSaArm = () => {
          if (options.sleeveStyle == 'inbuilt') {
            return new Path()
              .move(points.saRightEnd)
              .line(points.saBodiceSleeveBottom)
              .line(points.saBodiceSleeveTop)
          }
          if (options.sleeveStyle == 'dolman') {
            return new Path()
              .move(points.saRightEnd)
              .line(points.saDolmanSleeveFront)
              .join(paths.dolman.offset(armholeSa))
              .line(points.saDolmanSleeveTip)
          }
          if (options.sleeveStyle == 'inset') {
            points.saHps = utils.beamsIntersect(
              paths.cfNeck.offset(neckSa).start(),
              paths.cfNeck
                .offset(neckSa)
                .start()
                .shift(points.hps.angle(points.shoulder) + 90, 1),
              points.shoulder.shiftTowards(points.hps, shoulderSa).rotate(-90, points.shoulder),
              points.hps.shiftTowards(points.shoulder, shoulderSa).rotate(90, points.hps)
            )
            return new Path()
              .move(points.saArmholeCorner)
              .join(
                new Path()
                  .move(points.armhole)
                  .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
                  .offset(armholeSa)
              )
              .line(points.saBustDartBottom)
              .line(points.saBustDartEdge)
              .join(
                new Path()
                  .move(points.armholePitch)
                  .curve_(points.armholePitchCp2, points.shoulder)
                  .offset(armholeSa)
                  .split(points.saArmholeSplit)[1]
                  .line(points.saShoulderCorner)
              )
          }
        }

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saSideHem)
          .join(drawSaRight().offset(sideSeamSa))
          .join(drawSaArm())
          .line(points.saHps)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.cfNeck)
          .line(points.cfNeckOpening)
          .join(paths.saLeft.offset(cfSa))
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
