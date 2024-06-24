import { frontBase as frontBaseDaisy } from '@freesewing/daisy'
// import { pctBasedOn } from '@freesewing/core'
import { backBase } from './backBase.mjs'
import { frontShoulder } from './frontShoulder.mjs'
import { frontBustShoulder } from './frontBustShoulder.mjs'

export const front = {
  name: 'sammie.front',
  from: frontBaseDaisy,
  after: backBase,
  hide: {
    from: true,
  },
  options: {
    //Constants
    frontArmholeDepth: 0.552, //Locked for Sammie
    frontArmholePitchDepth: 0.5, //Locked for Sammie
    frontArmholePitchWidth: 0.911, //Locked for Sammie
    bustDartLength: 1,
    waistDartLength: 1,
    //Fit
    // frontContour: {
    // pct: 5.2,
    // min: 0,
    // max: 6,
    // snap: 1,
    // ...pctBasedOn('chest'),
    // menu: 'fit',
    // },
    //Style
    sweetheart: { bool: true, menu: 'style' },
    neckDrop: { pct: 70, min: 50, max: 100, menu: 'style' },
    frontCurve: { pct: 75, min: 0, max: 100, menu: 'style' },
    sideFrontCurve: { pct: 75, min: 0, max: 100, menu: 'style' },
    frontAngle: { deg: 0, min: -20, max: 20, menu: 'style' },
    heartDrop: { pct: 37.5, min: 0, max: 100, menu: 'style' },
    //Darts
    bustDartFraction: { pct: 50, min: 0, max: 100, menu: 'darts' },
    bustDartPlacement: {
      dflt: 'shoulder',
      list: ['shoulder', 'bustshoulder'],
      menu: 'darts',
    },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    //Advanced
    guaranteeSideFrontCurve: { bool: true, menu: 'advanced' },
  },
  draft: (sh) => {
    const { points, Path, store, utils, options, part } = sh

    switch (options.bustDartPlacement) {
      case 'bustshoulder':
        return frontBustShoulder.draft(sh)
      default:
        return frontShoulder.draft(sh)
    }

    return part
  },
}
