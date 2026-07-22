import { pctBasedOn } from '@freesewing/core'
import { neckband as neckbandStraight } from '@freesewing/neckbandstraight'
import { body } from './body.mjs'

export const neckband = {
  name: 'frederick.neckband',
  options: {
    //Imported
    ...neckbandStraight.options,
    //Constants
    useVoidStores: false, //Altered for Frederick
    neckbandOverlapSide: 'left', //Locked for Frederick
    neckbandOverlap: 0, //Locked for Frederick
    //Style
    neckbandWidth: {
      pct: 6.6,
      min: 1,
      max: 13.1,
      snap: 2.5,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'style',
    },
  },
  after: [body],
  plugins: [...neckbandStraight.plugins],
  draft: (sh) => {
    const { macro, points, options, absoluteOptions, store, complete, part } = sh

    store.set('neckbandWidth', absoluteOptions.neckbandWidth)

    neckbandStraight.draft(sh)

    if (complete) {
      macro('title', {
        nr: 5,
        title: 'Neckband',
        at: points.title,
        cutNr: options.neckbandFolded ? 1 : 2,
        scale: 0.1,
      })
    }

    return part
  },
}
