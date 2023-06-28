import { sharedBase } from './sharedBase.mjs'

export const back = {
  name: 'byron.back',
  from: sharedBase,
  hide: {
    from: true,
  },
  options: {
    //Armhole
    backArmholePitchWidth: { pct: 98.4, min: 97, max: 98.5, menu: 'armhole' },
    backArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
    //Construction
    hemWidth: { pct: 3, min: 1, max: 5, menu: 'construction' },
    //Advanced
    fitSide: { bool: true, menu: 'advanced' },
    // forceSide: { bool: false, menu: 'advanced' },
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
    const chestBack = store.get('chestBack')
    // const hipsBack = store.get('hipsBack')
    // const seatBack = store.get('seatBack')
    const shoulderToShoulder = store.get('shoulderToShoulder')
    const waistBack = store.get('waistBack')
    const waistbandWidth = absoluteOptions.waistbandWidth

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
    // if (options.fitSide) {
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
    points.cbNeckCp1 = new Point(points.hps.x * 0.8, points.cbNeck.y)

    //armhole
    points.armhole = points.cArmhole.shift(0, chestBack)
    points.armholePitch = points.cArmholePitch.shift(
      0,
      (shoulderToShoulder * options.backArmholePitchWidth) / 2
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
      options.backArmholeDepth
    )

    //body
    // points.sideChest = points.cChest.shift(0, chestBack)
    points.sideWaist = points.cWaist.shift(0, waistBack)
    // points.sideHips = points.cHips.shift(0, hipsBack)
    // points.sideSeat = points.cSeat.shift(0, seatBack)
    // points.sideHem = points.cHem.shift(0, hemLength)
    points.sideCp1 = new Point(points.sideWaist.x, (points.armhole.y + points.sideWaist.y) / 2)

    //guides
    // paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck)

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
    paths.hemBase = new Path().move(points.cWaist).line(points.sideWaist).hide()

    paths.saBase = new Path()
      .move(points.sideWaist)
      .curve_(points.sideCp1, points.armhole)
      .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).line(points.cWaist).close()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cbNeck
      points.cutOnFoldTo = points.cWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
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
        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .join(paths.saBase.offset(sa))
          .line(points.cbNeck)
          .line(points.cWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
