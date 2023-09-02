import { frontBase as frontBaseDaisy } from '@freesewing/daisy'
import { front } from './front.mjs'
import { sideFrontShoulder } from './sideFrontShoulder.mjs'
import { sideFrontBustShoulder } from './sideFrontBustShoulder.mjs'

export const sideFront = {
  name: 'sammie.sideFront',
  from: frontBaseDaisy,
  after: front,
  hide: {
    from: true,
  },
  plugins: [...sideFrontShoulder.plugins, ...sideFrontBustShoulder.plugins],
  draft: (sh) => {
    const { points, Path, store, utils, options, part } = sh

    switch (options.bustDartPlacement) {
      case 'bustshoulder':
        return sideFrontBustShoulder.draft(sh)
      default:
        return sideFrontShoulder.draft(sh)
    }

    return part
  },
}
