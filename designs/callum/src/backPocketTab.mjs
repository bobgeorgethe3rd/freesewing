import { tab as weltPocketTab } from '@freesewing/weltpocket'
import { backPocketWelt } from './backPocketWelt.mjs'

export const backPocketTab = {
  name: 'callum.backPocketTab',
  after: backPocketWelt,
  options: {
    //Imported
    ...weltPocketTab.options,
    //Pockets
    weltPocketTab: { bool: false, menu: 'pockets.weltPockets' },
  },
  draft: (sh) => {
    const { macro, points, options, complete, part } = sh
    //set Render stroke Draft
    if (options.backPocketStyle == 'welt' && options.weltPocketTab) {
      weltPocketTab.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 13,
        title: 'Back Pocket Tab',
        at: points.title,
        cutNr: 2,
        scale: 0.25,
      })
    }

    return part
  },
}
