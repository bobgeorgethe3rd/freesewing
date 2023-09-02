import { frontBase } from '@freesewing/daisy'
import { frontArmholePitch } from './frontArmholePitch.mjs'
import { frontArmhole } from './frontArmhole.mjs'
import { frontShoulder } from './frontShoulder.mjs'
import { frontBustShoulder } from './frontBustShoulder.mjs'

export const front = {
  name: 'peach.front',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Constant
    neckSaWidth: 0.01,
    armholeSaWidth: 0.01,
    shoulderSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    neckSaWidth: 0.01,
    bustDartLength: 1,
    waistDartLength: 1,
    //Darts
    bustDartFraction: { pct: 50, min: 0, max: 100, menu: 'darts' },
    bustDartPlacement: {
      dflt: 'armholePitch',
      list: ['armhole', 'armholePitch', 'shoulder', 'bustshoulder'],
      menu: 'darts',
    },
    //Construction
    princessSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
  },
  draft: (sh) => {
    const { points, Path, store, utils, options, part } = sh

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
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .length()
    )
    store.set(
      'frontArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .length()
    )

    switch (options.bustDartPlacement) {
      case 'armhole':
        return frontArmhole.draft(sh)
      case 'shoulder':
        return frontShoulder.draft(sh)
      case 'bustshoulder':
        return frontBustShoulder.draft(sh)
      default:
        return frontArmholePitch.draft(sh)
    }

    return part
  },
}
