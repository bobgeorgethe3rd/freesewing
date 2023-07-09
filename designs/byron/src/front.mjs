import { sharedBase } from './sharedBase.mjs'

export const front = {
  name: 'byron.front',
  from: sharedBase,
  options: {
    //Constants
    cfNeck: 0.55191502449,
    useVoidStores: false,
    //Armhole
    frontArmholePitchWidth: { pct: 95.3, min: 95, max: 97, menu: 'armhole' },
    frontArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
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
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    //measures
    const chestFront = store.get('chestFront')
    // const hipsFront = store.get('hipsFront')
    const neck = store.get('neck')
    // const seatFront = store.get('seatFront')
    const shoulderToShoulder = store.get('shoulderToShoulder')
    const waistDiff = store.get('waistDiff')

    // let hemLengthTarget
    // if (options.bodyLength < 0.5) {
    // if (waistFront > hipsFront) {
    // hemLengthTarget = waistFront
    // } else {
    // hemLengthTarget =
    // waistFront * (1 - options.bodyLength * 2) + hipsFront * options.bodyLength * 2
    // }
    // } else {
    // if (waistFront > seatFront) {
    // hemLengthTarget = waistFront
    // } else {
    // if (waistFront > hipsFront) {
    // hemLengthTarget =
    // waistFront * (1 - (2 * options.bodyLength - 1)) +
    // seatFront * (2 * options.bodyLength - 1)
    // } else {
    // hemLengthTarget =
    // hipsFront * (1 - (2 * options.bodyLength - 1)) +
    // seatFront * (2 * options.bodyLength - 1)
    // }
    // }
    // }

    // let hemLength
    // if (options.fitSide) {
    // hemLength = hemLengthTarget
    // } else {
    // if (hemLengthTarget > chestFront) {
    // if (options.forceSide) {
    // hemLength = chestFront
    // log.warning('options.forceSide is on but chestFront is less than front hem length')
    // } else {
    // hemLength = hemLengthTarget
    // log.info('Front hem length is greater than chestFront so has been fit accordingly')
    // }
    // } else {
    // hemLength = chestFront
    // }
    // }
    //cfNeck
    points.cfNeck = points.origin.shift(-90, neck / 4)
    points.cfNeckCorner = new Point(points.hps.x, points.cfNeck.y)
    points.hpsCp2 = points.hps.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)
    points.cfNeckCp1 = points.cfNeck.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)

    //armhole
    points.armhole = points.cArmhole.shift(0, chestFront)
    points.armholePitch = points.cArmholePitch.shift(
      0,
      (shoulderToShoulder * options.frontArmholePitchWidth) / 2
    )
    points.armholePitchCp2 = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    points.armholePitchCp1 = points.armholePitchCp2.rotate(180, points.armholePitch)
    points.armholeCp1 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.frontArmholeDepth
    )

    //body
    // points.sideChest = points.cChest.shift(0, chestFront)
    points.sideWaistAnchor = new Point(points.armhole.x, points.cWaist.y)
    if (options.fitSide || waistDiff < 0) {
      points.sideWaist = points.sideWaistAnchor.shift(180, waistDiff)
      if (waistDiff < 0) {
        log.warning('waist is > chest so options.fitSide is locked on')
      }
    } else {
      points.sideWaist = points.sideWaistAnchor
    }
    // points.sideHips = points.cHips.shift(0, hipsFront)
    // points.sideSeat = points.cSeat.shift(0, seatFront)
    // points.sideHem = points.cHem.shift(0, hemLength)
    points.sideWaistCp2 = new Point(points.sideWaist.x, (points.armhole.y + points.sideWaist.y) / 2)

    //guides
    // paths.cfNeck = new Path()
    // .move(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)

    // paths.armhole = new Path()
    // .move(points.armhole)
    // .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
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
    paths.saWaist = new Path()
      .move(points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.saBase = new Path()
      .move(points.shoulder)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.saWaist)
      .join(paths.armhole)
      .join(paths.saBase)
      .line(points.cWaist)
      .close()

    //stores
    store.set('scyeFrontWidth', points.armhole.dist(points.shoulder))
    store.set(
      'scyeFrontDepth',
      points.armhole.dist(points.shoulder) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.shoulder) - (points.shoulder.angle(points.hps) - 90)
          )
        )
    )
    store.set(
      'frontArmholeLength',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .length()
    )
    store.set(
      'frontArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
        .length()
    )
    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfNeck
      points.cutOnFoldTo = points.cWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //notches
      snippets.armholePitch = new Snippet('notch', points.armholePitch)
      //title
      points.title = new Point(points.hps.x, points.armholePitch.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Front',
      })
      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100
        points.saArmhole = points.armhole.shift(45, armholeSa)
        points.saArmholeCp1 = points.armholeCp1.shift(45, armholeSa)
        points.saArmholePitch = points.armholePitch.shift(0, armholeSa)
        points.saArmholePitchCp1 = utils.beamsIntersect(
          points.saArmholePitch,
          points.armholePitch.rotate(-90, points.saArmholePitch),
          points.armholePitchCp1,
          points.armholePitchCp1.shift(45, 1)
        )
        points.saArmholePitchCp2 = utils.beamsIntersect(
          points.armholePitchCp2,
          points.shoulder.rotate(-90, points.armholePitchCp2),
          points.saArmholePitchCp1,
          points.saArmholePitch
        )
        points.saShoulder = points.hps.shiftOutwards(points.shoulder, armholeSa)
        paths.saArmhole = new Path()
          .move(points.saArmhole)
          .curve(points.saArmholeCp1, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .hide()

        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .join(paths.saWaist.offset(sa))
          .join(paths.saArmhole)
          .join(paths.saBase.offset(sa))
          .line(points.cfNeck)
          .line(points.cWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
