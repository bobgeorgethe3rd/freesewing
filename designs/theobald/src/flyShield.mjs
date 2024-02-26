import { flyShield as flyShieldJackson } from '@freesewing/jackson'
import { frontBase } from './frontBase.mjs'

export const flyShield = {
  name: 'theobald.flyShield',
  from: frontBase,
  options: {
    //Imported
    ...flyShieldJackson.options,
    //Plackets
    flyShieldCurved: { bool: true, menu: 'plackets' }, //ALtered for Theobald
  },
  draft: (sh) => {
    const { macro, paths, Path, points, snippets, Snippet, sa, store, options, complete, part } = sh
    //set Render Draft
    if (options.daltonGuides) {
      paths.seam = paths.daltonGuide
    }
    flyShieldJackson.draft(sh)

    return part
  },
}
