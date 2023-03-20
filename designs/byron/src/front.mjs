import { sharedBase } from './sharedBase.mjs'

export const front = {
  name: 'byron.front',
  from: sharedBase,
  options: {
    //Constants
    cfNeck: 0.55191502449,
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
    let chestFront = store.get('chestFront')
    let hipsFront = store.get('hipsFront')
    let neck = store.get('neck')
    let seatFront = store.get('seatFront')
    let shoulderToShoulder = store.get('shoulderToShoulder')
    let waistFront = store.get('waistFront')

    let hemLengthTarget
    if (options.bodyLength < 0.5) {
      if (waistFront > hipsFront) {
        hemLengthTarget = waistFront
      } else {
        hemLengthTarget =
          waistFront * (1 - options.bodyLength * 2) + hipsFront * options.bodyLength * 2
      }
    } else {
      if (waistFront > seatFront) {
        hemLengthTarget = waistFront
      } else {
        if (waistFront > hipsFront) {
          hemLengthTarget =
            waistFront * (1 - (2 * options.bodyLength - 1)) +
            seatFront * (2 * options.bodyLength - 1)
        } else {
          hemLengthTarget =
            hipsFront * (1 - (2 * options.bodyLength - 1)) +
            seatFront * (2 * options.bodyLength - 1)
        }
      }
    }

    let hemLength
    if (options.fitSide) {
      hemLength = hemLengthTarget
    } else {
      if (hemLengthTarget > chestFront) {
        if (options.forceSide) {
          hemLength = chestFront
          log.warning('options.forceSide is on but chestFront is less than front hem length')
        } else {
          hemLength = hemLengthTarget
          log.info('Front hem length is greater than chestFront so has been fit accordingly')
        }
      } else {
        hemLength = chestFront
      }
    }
    //cfNeck
    points.cfNeck = points.origin.shift(-90, neck / 4)
    points.cfNeckCorner = new Point(points.hps.x, points.cfNeck.y)
    points.cfNeckCp1 = points.hps.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)
    points.cfNeckCp2 = points.cfNeck.shiftFractionTowards(points.cfNeckCorner, options.cfNeck)

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
    points.sideChest = points.cChest.shift(0, chestFront)
    points.sideWaist = points.cWaist.shift(0, waistFront)
    points.sideHips = points.cHips.shift(0, hipsFront)
    points.sideSeat = points.cSeat.shift(0, seatFront)
    points.sideHem = points.cHem.shift(0, hemLength)
    points.sideCp1 = new Point(points.sideHem.x, (points.armhole.y + points.sideHem.y) / 2)

    //guides
    // paths.cfNeck = new Path()
    // .move(points.hps)
    // .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)

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
    // .curve_(points.sideCp1, points.armhole)

    //seam paths
    paths.hemBase = new Path().move(points.cHem).line(points.sideHem).hide()

    paths.saBase = new Path()
      .move(points.sideHem)
      .curve_(points.sideCp1, points.armhole)
      .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).line(points.cHem).close()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfNeck
      points.cutOnFoldTo = points.cHem
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
        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .join(paths.saBase.offset(sa))
          .line(points.cfNeck)
          .line(points.cHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
