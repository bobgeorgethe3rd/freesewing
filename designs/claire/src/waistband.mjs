import { waistband as waistbandClaude } from '@freesewing/claude'
import { legFront } from './legFront.mjs'
import { placket } from './placket.mjs'

export const waistband = {
  name: 'claire.waistband',
  options: {
    //Imported
    ...waistbandClaude.options,
    //Style
    waistbandOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'style' }, //Altered for Claire
  },
  after: [legFront, placket],
  plugins: [...waistbandClaude.plugins],
  draft: waistbandClaude.draft,
}
