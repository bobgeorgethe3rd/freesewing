import { cuff } from '@freesewing/fullshirtsleeve'
import { sleeve } from './sleeve.mjs'
import { sleevePlacket } from './sleevePlacket.mjs'

export const sleeveCuff = {
  name: 'shaun.sleeveCuff',
  after: [sleeve, sleevePlacket],
  options: {
    //Imported
    ...cuff.options,
    //Sleeves
    sleeveBandType: { dflt: 'curved', list: ['straight', 'curved'], menu: 'sleeves.cuffs' },
  },
  draft: (sh) => {
    //draft
    const {
      store,
      sa,
      Point,
      points,
      Path,
      paths,
      options,
      complete,
      paperless,
      macro,
      utils,
      measurements,
      part,
      snippets,
      Snippet,
      absoluteOptions,
      log,
    } = sh
    //draft
    cuff.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 8,
        title: 'Placket (Cuff)',
        at: points.title,
        cutNr: options.sleeveBandFolded ? 1 : 2,
        scale: 0.25,
      })
    }

    return part
  },
}
