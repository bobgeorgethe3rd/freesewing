import { sleeveBase } from './sleeveBase.mjs'
import { spreadSleeveCap } from './spreadSleeveCap.mjs'
import { spreadSleeveHem } from './spreadSleeveHem.mjs'
import { spreadSleeveBoth } from './spreadSleeveBoth.mjs'

const spreadSleeveSleeve = (params) => {
  switch (params.options.spreadType) {
    case 'hem':
      return spreadSleeveHem(params)
    case 'both':
      return spreadSleeveBoth(params)
    default:
      return spreadSleeveCap(params)
  }
}

export const sleeve = {
  name: 'spreadsleeve.sleeve',
  from: sleeveBase,
  hideDependencies: true,
  options: {
    //Style
    spreadType: { dflt: 'cap', list: ['cap', 'hem', 'both'], menu: 'style' },
  },
  draft: spreadSleeveSleeve,
}
