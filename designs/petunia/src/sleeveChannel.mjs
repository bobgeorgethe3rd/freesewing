import { sleeveChannel as rbSleeveChannel } from '@freesewing/rufflebutterflysleeve'
import { sleeve } from './sleeve.mjs'

export const sleeveChannel = {
  name: 'petunia.sleeveChannel',
  after: sleeve,
  options: {
    //Imported
    ...rbSleeveChannel.options,
  },
  draft: (sh) => {
    const { macro, points, options, store, complete, part, log } = sh
    //set Render stroke Draft
    if (options.sleevesBool) {
      rbSleeveChannel.draft(sh)
    } else {
      part.hide()
      return part
    }

    if (complete && options.sleeveTieChannel == 'mid') {
      // title
      macro('title', {
        nr: 11,
        title: 'Sleeve Channel',
        at: points.title,
        cutNr: 2,
        scale: 0.1,
      })
    }

    return part
  },
}
