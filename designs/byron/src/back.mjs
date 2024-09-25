import { sharedBase } from './sharedBase.mjs'

export const back = {
  name: 'byron.back',
  from: sharedBase,
  hide: {
    from: true,
  },
  options: {
    //Constants
    armholeSaWidth: 0.01,
    shoulderSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    neckSaWidth: 0.01,
    closureSaWidth: 0.01,
    cbSaWidth: 0,
    //Fit
    // chestEase: { pct: 4.6, min: 0, max: 20, menu: 'fit' },
    // waistEase: { pct: 5.8, min: 0, max: 20, menu: 'fit' },
    //Armhole
    backArmholePitchWidth: { pct: 97, min: 95, max: 98.5, menu: 'armhole' },
    backArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
    //Construction
    hemWidth: { pct: 3, min: 1, max: 5, menu: 'construction' },
    closurePosition: { dflt: 'back', list: ['front', 'side', 'back'], menu: 'construction' },
    //Advanced
    fitWaist: { bool: true, menu: 'advanced' },
    draftForHighBust: { bool: false, menu: 'advanced' },
  },
  measurements: [
    'neck',
    'chest',
    'hpsToWaistBack',
    'shoulderSlope',
    'hpsToShoulder',
    'waist',
    'waistToArmpit',
  ],
  optionalMeasurements: ['highBust'],
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
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    //measures
    // const hipsBack = store.get('hipsBack')
    // const seatBack = store.get('seatBack')
    // const shoulderToShoulder = store.get('shoulderToShoulder')
    // const waistbandWidth = absoluteOptions.waistbandWidth

    // let hemLengthTarget
    // if (options.bodyLength < 0.5) {
    // if (waistBack > hipsBack) {
    // hemLengthTarget = waistBack
    // } else {
    // hemLengthTarget =
    // waistBack * (1 - options.bodyLength * 2) + hipsBack * options.bodyLength * 2
    // }
    // } else {
    // if (waistBack > seatBack) {
    // hemLengthTarget = waistBack
    // } else {
    // if (waistBack > hipsBack) {
    // hemLengthTarget =
    // waistBack * (1 - (2 * options.bodyLength - 1)) + seatBack * (2 * options.bodyLength - 1)
    // } else {
    // hemLengthTarget =
    // hipsBack * (1 - (2 * options.bodyLength - 1)) + seatBack * (2 * options.bodyLength - 1)
    // }
    // }
    // }

    // let hemLength
    // if (options.fitWaist) {
    // hemLength = hemLengthTarget
    // } else {
    // if (hemLengthTarget > chestBack) {
    // if (options.forceSide) {
    // hemLength = chestBack
    // log.warning('options.forceSide is on but chestBack is less than back hem length')
    // } else {
    // hemLength = hemLengthTarget
    // log.info('Back hem length is greater than chestBack so has been fit accordingly')
    // }
    // } else {
    // hemLength = chestBack
    // }
    // }
    //cbNeck
    // points.cbNeckCp1 = new Point(points.hps.x * 0.8, points.cbNeck.y)
    points.cbNeckCp1 = utils.beamsIntersect(
      points.hps,
      points.shoulder.rotate((180 - (points.hps.angle(points.shoulder) - 270)) * -1, points.hps),
      points.cbNeck,
      points.cbNeck.shift(0, 1)
    )

    //armhole
    // points.armholePitch = points.cArmholePitch.shift(
    // 0,
    // (shoulderToShoulder * options.backArmholePitchWidth) / 2
    // )
    points.armholePitch = points.cArmholePitch.shift(
      0,
      points.shoulder.x * options.backArmholePitchWidth
    )
    points.armholePitchCp2 = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    // points.armholePitchCp1 = points.armholePitchCp2.rotate(180, points.armholePitch)
    points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )
    points.armholeCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )

    //guides
    // paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck)

    // paths.armhole = new Path()
    // .move(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)

    // paths.side = new Path()
    // .move(points.sideSeat)
    // .line(points.sideHips)
    // .line(points.sideWaist)
    // .line(points.sideChest)

    // paths.hem = new Path()
    // .move(points.cHem)
    // .line(points.sideHem)
    // .curve_(points.sideWaistCp2, points.armhole)

    //seam paths
    paths.hemBase = new Path().move(points.cWaist).line(points.sideWaist).hide()
    paths.sideSeam = new Path()
      .move(points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.shoulder)
      .join(paths.cbNeck)
      .line(points.cWaist)
      .close()

    //stores
    // store.set('chest', chest)
    // store.set('waist', waist)
    // store.set('waistDiff', waistDiff)
    store.set('scyeBackWidth', points.armhole.dist(points.shoulder))
    store.set(
      'scyeBackDepth',
      points.armhole.dist(points.shoulder) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.shoulder) - (points.shoulder.angle(points.hps) - 90)
          )
        )
    )
    store.set(
      'backArmholeLength',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .length()
    )
    store.set(
      'backArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .length()
    )
    if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck
        points.cutOnFoldTo = points.cWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
      //title
      points.title = new Point(points.hps.x, points.armholePitch.y)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
      })
      //scalebox
      points.scalebox = new Point((points.hps.x + points.shoulder.x) / 3, points.armhole.y)
      macro('scalebox', {
        at: points.scalebox,
      })

      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100
        const hemSa = sa * options.hemWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const closureSa = sa * options.closureSaWidth * 100

        let cbSa
        if (options.closurePosition == 'back') {
          cbSa = closureSa
        } else {
          cbSa = sa * options.cbSaWidth * 100
        }
        let sideSeamSa
        if (
          options.closurePosition == 'side' ||
          options.closurePosition == 'sideLeft' ||
          options.closurePosition == 'sideRight'
        ) {
          sideSeamSa = closureSa
        } else {
          sideSeamSa = sa * options.sideSeamSaWidth * 100
        }

        // points.saArmhole = new Point(
        // points.armhole.shift(45, armholeSa).x,
        // points.armhole.y - armholeSa
        // )
        // points.saArmholeCp2 = new Point(
        // points.armholeCp2.shift(45, armholeSa).x,
        // points.armholeCp2.y - armholeSa
        // )
        // points.saArmholePitch = points.armholePitch.shift(0, armholeSa)
        // points.saArmholePitchCp1 = utils.beamsIntersect(
        // points.saArmholePitch,
        // points.armholePitch.rotate(-90, points.saArmholePitch),
        // points.armholePitchCp1,
        // points.armholePitchCp1.shift(45, 1)
        // )
        // points.saArmholePitchCp2 = utils.beamsIntersect(
        // points.armholePitchCp2,
        // points.shoulder.rotate(-90, points.armholePitchCp2),
        // points.saArmholePitchCp1,
        // points.saArmholePitch
        // )
        // points.saShoulder = points.hps.shiftOutwards(points.shoulder, armholeSa)
        // paths.saArmhole = new Path()
        // .move(points.saArmhole)
        // .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
        // .curve_(points.saArmholePitchCp2, points.saShoulder)
        // .hide()

        points.saSideWaist = new Point(points.sideWaist.x + armholeSa, points.sideWaist.y + hemSa)
        points.saArmholeCorner = utils.beamsIntersect(
          points.armholeCp2.shift(90, armholeSa),
          points.armhole.shift(90, armholeSa),
          paths.sideSeam.offset(sideSeamSa).end(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.999)
        )
        points.saShoulderCorner = points.shoulder
          .shift(points.hps.angle(points.shoulder), armholeSa)
          .shift(points.hps.angle(points.shoulder) + 90, shoulderSa)
        points.saHps = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          paths.shoulder.offset(shoulderSa).start(),
          paths.shoulder.offset(shoulderSa).end()
        )
        points.saCbNeck = points.cbNeck.translate(-cbSa, -neckSa)
        points.saCWaist = points.cWaist.translate(-cbSa, hemSa)

        paths.sa = new Path()
          .move(points.saCWaist)
          .line(points.saSideWaist)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saShoulderCorner)
          .line(points.saHps)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbNeck)
          .line(points.saCWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
