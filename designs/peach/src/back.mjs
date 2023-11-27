import { back as backDaisy } from '@freesewing/daisy'
import { front } from './front.mjs'
import { backArmholePitch } from './backArmholePitch.mjs'
import { backArmhole } from './backArmhole.mjs'
import { backShoulder } from './backShoulder.mjs'
import { backBustShoulder } from './backBustShoulder.mjs'

export const back = {
  name: 'peach.back',
  from: backDaisy,
  after: front,
  hide: {
    from: true,
  },
  options: {
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Peach
  },
  draft: (sh) => {
    const { points, Path, store, utils, options, part } = sh

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

    switch (options.bustDartPlacement) {
      case 'armhole':
        return backArmhole.draft(sh)
      case 'shoulder':
        return backShoulder.draft(sh)
      case 'bustshoulder':
        return backBustShoulder.draft(sh)
      default:
        return backArmholePitch.draft(sh)
    }

    return part
  },
}
