import { frontBase as frontBaseDaisy } from '@freesewing/daisy'
import { backBase } from './backBase.mjs'
import { frontFacingShoulder } from './frontFacingShoulder.mjs'
import { frontFacingBustShoulder } from './frontFacingBustShoulder.mjs'

export const frontFacing = {
  name: 'sammie.frontFacing',
  from: frontBaseDaisy,
  after: backBase,
  hide: {
    from: true,
  },
  options: {
    //Construction
    bodiceFacings: { bool: true, menu: 'construction' },
    bodiceFacingWidth: { pct: 100, min: 50, max: 100, menu: 'construction' },
    bodiceFacingHemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
  },
  draft: (sh) => {
    const { points, Path, store, utils, options, part } = sh

    if (options.bodiceFacings) {
      switch (options.bustDartPlacement) {
        case 'bustshoulder':
          return frontFacingBustShoulder.draft(sh)
        default:
          return frontFacingShoulder.draft(sh)
      }
    } else {
      part.hide()
      return part
    }

    return part
  },
}
