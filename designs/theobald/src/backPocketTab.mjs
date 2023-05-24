import { tab } from '@freesewing/weltpocket'
import { backPocketWelt } from './backPocketWelt.mjs'

export const backPocketTab = {
  name: 'theobald.backPocketTab',
  after: backPocketWelt,
  options: {
    //Imported
    ...tab.options,
  },
  draft: (sh) => {
    const { macro, points, options, complete, part } = sh
    //set Render stroke Draft
    if (options.backPocketsBool) {
      tab.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 5,
        title: 'Back Pocket Tab',
        at: points.title,
        scale: 0.25,
      })
    }

    return part
  },
}
