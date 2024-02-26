import { buttonholePlacket as buttonholePlacketJackson } from '@freesewing/jackson'
import { frontBase } from './frontBase.mjs'

export const buttonholePlacket = {
  name: 'theobald.buttonholePlacket',
  from: frontBase,
  options: {
    //Imported
    ...buttonholePlacketJackson.options,
  },
  draft: (sh) => {
    const { macro, points, paths, options, complete, part } = sh
    //set Render Draft
    if (options.daltonGuides) {
      paths.seam = paths.daltonGuide
    }
    buttonholePlacketJackson.draft(sh)

    return part
  },
}
