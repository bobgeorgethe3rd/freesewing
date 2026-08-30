import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { front as byronFront } from '@freesewing/byron'

export const frontBase = {
  name: 'denny.frontBase',
  plugins: [pluginBundle],
  from: byronFront,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    useVoidStore: false, //Locked for Denny
    closurePosition: 'front', //Locked for Denny
    hemWidth: 0, //Locked for Denny
    //Fit
    chestEase: { pct: 21.7, min: 0, max: 30, menu: 'fit' }, //Altered for Denny
    waistEase: { pct: 25.6, min: 0, max: 30, menu: 'fit' }, //Altered for Denny
    hipsEase: { pct: 5.9, min: 0, max: 30, menu: 'fit' },
    seatEase: { pct: 5.1, min: 0, max: 30, menu: 'fit' },
    byronGuides: { bool: false, menu: 'fit' },
    //Style
    shoulderShift: { pct: 2.2, min: 0, max: 4.5, menu: 'style' },
    frontHemDrop: { pct: 9.1, min: 0, max: 10, menu: 'style' },
    bodyLength: { pct: 75, min: 0, max: 100, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    waistbandWidth: {
      pct: 7.7,
      min: 1,
      max: 15,
      snap: 2.5,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'style',
    },
    frontTopWidth: { pct: 48.5, min: 40, max: 60, menu: 'style' },
    //Plackets
    buttonholePlacketWidth: {
      pct: 5.4,
      min: 3,
      max: 6,
      snap: 2.5,
      ...pctBasedOn('chest'),
      menu: 'plackets',
    },
    buttonholeStart: { pct: 4.4, min: 2, max: 5, menu: 'plackets' },
    buttonholeNum: { count: 5, min: 3, max: 7, menu: 'plackets' },
    //Pockets
    frontPocketWidth: { pct: 67.4, min: 45, max: 75, menu: 'pockets' }, //47.9
    weltPocketBool: { pct: true, menu: 'pockets' },
    weltPocketPlacement: { pct: 8.7, min: 5, max: 10, menu: 'pockets.weltPockets' },
    weltPocketBalance: { pct: 9.8, min: 5, max: 15, menu: 'pockets.weltPockets' },
    weltPocketWeltWidth: { pct: 2.6, min: 1, max: 5, menu: 'pockets.weltPockets' },
    weltPocketWeltLength: { pct: 29.4, min: 20, max: 35, menu: 'pockets.weltPockets' },
    //Construction
    armholeSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Denny
    shoulderSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Denny
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Denny
    frontPanelSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
  },
  measurements: ['waistToHips', 'waistToSeat', 'hips', 'seat'],
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
    log,
    utils,
  }) => {
    //removing paths and snippets not required from Byron
    const keepPaths = ['seam', 'armhole', 'cfNeck']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.byronGuides) {
      paths.byronGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    macro('cutonfold', false)
    //measurements
    const shoulderShift = measurements.hpsToWaistBack * options.shoulderShift
    const buttonholePlacketWidth = absoluteOptions.buttonholePlacketWidth
    const chest = store.get('chest')
    const waist = points.sideWaist.x * 4
    const hips = measurements.hips * (1 + options.hipsEase)
    const seat = measurements.seat * (1 + options.seatEase)

    const hemWidth =
      options.bodyLength < 0.5
        ? waist * (-2 * options.bodyLength + 1) + hips * options.bodyLength * 2
        : hips * (-2 * options.bodyLength + 2) + seat * (2 * options.bodyLength - 1)

    const hemDiff = chest - hemWidth
    const bodyLength =
      options.bodyLength < 0.5
        ? measurements.waistToHips * 2 * options.bodyLength * (1 + options.bodyLengthBonus)
        : (measurements.waistToHips * (-2 * options.bodyLength + 2) +
            measurements.waistToSeat * (2 * options.bodyLength - 1)) *
          (1 + options.bodyLengthBonus)

    const waistbandWidth = absoluteOptions.waistbandWidth
    const weltPocketWeltWidth = measurements.waist * options.weltPocketWeltWidth
    //let's begin
    points.armholeSplit = utils.lineIntersectsCurve(
      points.shoulder
        .shiftFractionTowards(points.hps, 10)
        .shift(points.shoulder.angle(points.hps) + 90, shoulderShift),
      points.hps
        .shiftFractionTowards(points.shoulder, 10)
        .shift(points.shoulder.angle(points.hps) + 90, shoulderShift),
      points.armholePitch,
      points.armholePitchCp2,
      points.shoulder,
      points.shoulder
    )

    points.neckSplit =
      options.shoulderShift > 0
        ? utils.lineIntersectsCurve(
            points.shoulder
              .shiftFractionTowards(points.hps, 10)
              .shift(points.shoulder.angle(points.hps) + 90, shoulderShift),
            points.hps
              .shiftFractionTowards(points.shoulder, 10)
              .shift(points.shoulder.angle(points.hps) + 90, shoulderShift),
            points.hps,
            points.hpsCp2,
            points.cfNeckCp1,
            points.cfNeck
          )
        : points.hps

    points.cfYoke = points.cArmholePitch.shiftFractionTowards(points.cArmhole, 1 / 3)
    points.yokeSplit = utils.curveIntersectsY(
      points.armhole,
      points.armholeCp2,
      points.armholePitchCp1,
      points.armholePitch,
      points.cfYoke.y
    )

    points.cfNeckEx = points.cfNeck.shift(180, buttonholePlacketWidth * 0.5)
    points.yokeEx = new Point(points.cfNeckEx.x, points.cfYoke.y)

    //hem
    points.cfHemAnchor = points.cWaist.shift(-90, bodyLength)
    points.cfHem = points.cfHemAnchor.shift(-90, measurements.waistToSeat * options.frontHemDrop)
    points.hemEx = points.cfHem.shift(180, buttonholePlacketWidth * 0.5)
    points.buttonholeHem = points.hemEx.flipX(points.cfHem)

    points.sideHemAnchor = new Point(points.armhole.x, points.cfHemAnchor.y)
    points.sideHem = points.sideHemAnchor.shift(180, hemDiff / 8)
    points.buttonholeHemCp2 = new Point(
      (points.sideHem.x + points.buttonholeHem.x) * 0.5,
      points.buttonholeHem.y
    )
    points.sideHemCp2 = new Point(points.sideHem.x, (points.armhole.y + points.sideHem.y) * 0.5)

    points.frontTopAnchor = points.cfYoke.shiftFractionTowards(points.yokeSplit, 0.5)
    points.buttonholeYoke = points.yokeEx.shift(0, buttonholePlacketWidth)
    points.frontTopLeft = points.frontTopAnchor.shift(
      180,
      points.buttonholeYoke.dist(points.yokeSplit) * options.frontTopWidth * 0.5
    )
    points.frontTopRight = points.frontTopLeft.flipX(points.frontTopAnchor)
    points.pocketHemAnchor = utils.curveIntersectsX(
      points.buttonholeHem,
      points.buttonholeHemCp2,
      points.sideHem,
      points.sideHem,
      points.frontTopLeft.x
    )

    points.centreFrontHemRight = utils.curveIntersectsX(
      points.buttonholeHem,
      points.buttonholeHemCp2,
      points.sideHem,
      points.sideHem,
      points.pocketHemAnchor.x - (hemDiff / 8) * (2 / 7) * 0.5
    )
    points.frontHemLeft = points.centreFrontHemRight.flipX(points.pocketHemAnchor)

    points.frontHemRight = utils.lineIntersectsCurve(
      points.frontTopRight,
      points.frontTopRight.shift(
        points.frontTopLeft.angle(points.centreFrontHemRight),
        points.frontTopLeft.dist(points.centreFrontHemRight)
      ),
      points.buttonholeHem,
      points.buttonholeHemCp2,
      points.sideHem,
      points.sideHem
    )
    points.sideFrontHemLeft = points.frontTopRight.shiftTowards(
      points.frontHemRight.shift(0, (hemDiff / 8) * (5 / 7)),
      points.frontTopRight.dist(points.frontHemRight)
    )

    paths.hemCurveInitial = new Path()
      .move(points.buttonholeHem)
      .curve_(points.buttonholeHemCp2, points.sideHem)
      .hide()

    points.frontHemLeftCp2 =
      options.frontHemDrop == 0
        ? points.frontHemLeft.shiftFractionTowards(points.frontHemRight, 0.4)
        : utils.beamsIntersect(
            points.frontHemLeft,
            // points.frontHemLeft.shift(paths.hemCurveInitial.split(points.centreFrontHemRight)[0].shiftFractionAlong(0.995).angle(points.centreFrontHemRight), 1),
            paths.hemCurveInitial
              .split(points.centreFrontHemRight)[0]
              .shiftFractionAlong(0.995)
              .rotate(
                points.frontTopLeft.angle(points.frontHemLeft) -
                  points.frontTopLeft.angle(points.centreFrontHemRight),
                points.frontTopLeft
              ),
            points.frontHemRight,
            paths.hemCurveInitial.split(points.frontHemRight)[0].shiftFractionAlong(0.995)
          )

    points.sideFrontHemLeftCp2 = utils.beamIntersectsX(
      points.sideFrontHemLeft,
      // points.sideFrontHemLeft.shift(points.frontHemLeftCp2.angle(points.frontHemRight), 1),
      points.frontHemLeftCp2.rotate(
        points.frontTopRight.angle(points.sideFrontHemLeft) -
          points.frontTopRight.angle(points.frontHemRight),
        points.frontTopRight
      ),
      (points.sideFrontHemLeft.x + points.sideHem.x) * 0.5
    )
    //facing
    points.facingCurveStartCp2 = new Point(points.buttonholeYoke.x, points.cArmholePitch.y)
    points.facingCurveStart = points.facingCurveStartCp2.flipY(points.buttonholeYoke)
    points.shoulderFacing = points.neckSplit.shiftTowards(
      points.armholeSplit,
      buttonholePlacketWidth
    )
    points.shoulderFacingCp1 = utils.beamsIntersect(
      points.shoulderFacing,
      // points.shoulderFacing.shift(points.neckSplit.angle(paths.cfNeck.split(points.neckSplit)[1].shiftFractionAlong(0.005)), 1),
      points.shoulderFacing.shift(points.shoulder.angle(points.hps) + 90, 1),
      points.hpsCp2,
      points.hpsCp2.shift(points.hps.angle(points.shoulder), 1)
    )

    points.buttonholeStart = points.cfNeck.shift(
      -90,
      measurements.hpsToWaistBack * options.buttonholeStart
    )
    points.buttonholeEnd = points.cfHem.shift(-90, waistbandWidth * 0.5)

    for (let i = 0; i < options.buttonholeNum - 1; i++) {
      points['buttonhole' + i] = points.buttonholeStart.shiftFractionTowards(
        points.buttonholeEnd,
        i / (options.buttonholeNum - 1)
      )
      // snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i]).attr('data-rotate', 90)
      // snippets['button' + i] = new Snippet('button', points['buttonhole' + i])
    }
    //front pocket
    points.frontPocketTarget = utils.curveIntersectsY(
      points.facingCurveStart,
      points.facingCurveStartCp2,
      points.shoulderFacingCp1,
      points.shoulderFacing,
      points.frontTopAnchor.y
    )

    points.frontPocketLeft = points.frontTopLeft.shiftFractionTowards(
      points.frontPocketTarget,
      options.frontPocketWidth
    )
    points.frontPocketRight = points.frontPocketLeft.flipX(points.frontTopAnchor)

    //welt pocket
    points.weltPocketOpeningBottomLeft = points.sideFrontHemLeft
      .shiftTowards(points.frontTopRight, measurements.hpsToWaistBack * options.weltPocketPlacement)
      .shift(
        points.sideFrontHemLeft.angle(points.frontTopRight) - 90,
        measurements.hpsToWaistBack * options.weltPocketBalance
      )

    points.weltPocketOpeningBottomRight = points.weltPocketOpeningBottomLeft.shift(
      points.sideFrontHemLeft.angle(points.frontTopRight) - 90,
      weltPocketWeltWidth
    )
    points.weltPocketOpeningTopLeft = points.weltPocketOpeningBottomLeft.shift(
      points.sideFrontHemLeft.angle(points.frontTopRight),
      measurements.hpsToWaistBack * options.weltPocketWeltLength
    )
    points.weltPocketOpeningTopRight = points.weltPocketOpeningTopLeft.shift(
      points.sideFrontHemLeft.angle(points.frontTopRight) - 90,
      points.weltPocketOpeningBottomLeft.dist(points.weltPocketOpeningBottomRight)
    )

    //guides
    // paths.centreFront = new Path()
    // .move(points.yokeEx)
    // .line(points.hemEx)
    // .join(paths.hemCurveInitial.split(points.centreFrontHemRight)[0])
    // .line(points.frontTopLeft)

    // paths.frontHem = new Path()
    // .move(points.frontTopLeft)
    // .line(points.frontHemLeft)
    // .curve_(points.frontHemLeftCp2, points.frontHemRight)
    // .line(points.frontTopRight)

    // paths.sideFrontHem = new Path()
    // .move(points.frontTopRight)
    // .line(points.sideFrontHemLeft)
    // .curve_(points.sideFrontHemLeftCp2, points.sideHem)
    // .curve_(points.sideHemCp2, points.armhole)

    // paths.facingLine = new Path()
    // .move(points.buttonholeHem)
    // .line(points.facingCurveStart)
    // .curve(points.facingCurveStartCp2, points.shoulderFacingCp1, points.shoulderFacing)

    // paths.welt = new Path()
    // .move(points.weltPocketOpeningBottomLeft)
    // .line(points.weltPocketOpeningBottomRight)
    // .line(points.weltPocketOpeningTopRight)
    // .line(points.weltPocketOpeningTopLeft)
    // .line(points.weltPocketOpeningBottomLeft)
    // .close()

    // paths.yoke = new Path()
    // .move(points.yokeEx)
    // .line(points.yokeSplit)
    // .join(paths.armhole.split(points.yokeSplit)[1].split(points.armholeSplit)[0])
    // .line(points.neckSplit)
    // .join(paths.cfNeck.split(points.neckSplit)[1])
    // .line(points.cfNeckEx)
    // .line(points.yokeEx)
    // .close()

    //stores
    store.set('bodyLength', bodyLength)
    store.set('hemDiff', hemDiff)
    try {
      paths.cfNeck.split(points.neckSplit)[0]
      store.set('shoulderNeckDist', paths.cfNeck.split(points.neckSplit)[0].length())
    } catch {
      store.set('shoulderNeckDist', 0)
      log.warning('cfNeck split has failed so using fall back store.')
    }
    store.set('shoulderArmholeDist', paths.armhole.split(points.armholeSplit)[1].length())
    store.set('frontArmholePitchCp2Dist', points.shoulder.dist(points.armholePitchCp2))
    store.set('frontArmholePitchDist', points.shoulder.dist(points.armholePitch))
    store.set(
      'frontArmholePitchAngle',
      points.shoulder.angle(points.armholePitch) - points.shoulder.angle(points.hps) + 90
    )
    store.set(
      'waistbandFront',
      paths.hemCurveInitial.split(points.centreFrontHemRight)[0].length() +
        new Path()
          .move(points.frontHemLeft)
          .curve_(points.frontHemLeftCp2, points.frontHemRight)
          .length() +
        new Path()
          .move(points.sideFrontHemLeft)
          .curve_(points.sideFrontHemLeftCp2, points.sideHem)
          .length()
    )
    store.set('waistbandWidth', waistbandWidth)
    store.set('waistbandPlacketWidth', buttonholePlacketWidth)
    store.set('waistbandOverlap', buttonholePlacketWidth)
    store.set('weltPocketWeltWidth', weltPocketWeltWidth)

    return part
  },
}
