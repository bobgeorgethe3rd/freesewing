import { fly as flyJackson } from '@freesewing/jackson'
import { frontBase } from './frontBase.mjs'

export const fly = {
  name: 'theobald.fly',
  from: frontBase,
  options: {
    //Imported
    ...flyJackson.options,
  },
  draft: (sh) => {
    const { macro, points, paths, options, complete, part } = sh
    //set Render Draft
    if (options.daltonGuides) {
      paths.seam = paths.daltonGuide
    }
    flyJackson.draft(sh)

    return part
  },
}
