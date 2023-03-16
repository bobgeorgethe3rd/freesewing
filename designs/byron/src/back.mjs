import { pluginBundle } from '@freesewing/plugin-bundle'
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
    let chestBack = store.get('chestBack')
    let hipsBack = store.get('hipsBack')
    let seatBack = store.get('seatBack')
    let shoulderToShoulder = store.get('shoulderToShoulder')
    let waistBack = store.get('waistBack')

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
    points.chest = points.cChest.shift(0, chestBack)
    points.waist = points.cWaist.shift(0, waistBack)
    points.hips = points.cHips.shift(0, hipsBack)
    points.seat = points.cSeat.shift(0, seatBack)

    //guides

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck)

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)

    paths.side = new Path()
      .move(points.seat)
      .line(points.hips)
      .line(points.waist)
      .line(points.chest)

    return part
  },
}
