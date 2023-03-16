import { pluginBundle } from '@freesewing/plugin-bundle'
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
    points.chest = points.cChest.shift(0, chestFront)
    points.waist = points.cWaist.shift(0, waistFront)
    points.hips = points.cHips.shift(0, hipsFront)
    points.seat = points.cSeat.shift(0, seatFront)

    //guides
    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)

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
