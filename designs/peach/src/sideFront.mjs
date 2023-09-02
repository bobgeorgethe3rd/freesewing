import { frontBase } from '@freesewing/daisy'
import { front } from './front.mjs'
import { sideFrontArmholePitch } from './sideFrontArmholePitch.mjs'
import { sideFrontArmhole } from './sideFrontArmhole.mjs'
import { sideFrontShoulder } from './sideFrontShoulder.mjs'
import { sideFrontBustShoulder } from './sideFrontBustShoulder.mjs'

export const sideFront = {
  name: 'peach.sideFront',
  from: frontBase,
  after: front,
  hide: {
    from: true,
  },
  draft: (sh) => {
    const { options, part } = sh

    switch (options.bustDartPlacement) {
      case 'armhole':
        return sideFrontArmhole.draft(sh)
      case 'shoulder':
        return sideFrontShoulder.draft(sh)
      case 'bustshoulder':
        return sideFrontBustShoulder.draft(sh)
      default:
        return sideFrontArmholePitch.draft(sh)
    }

    return part
  },
}
