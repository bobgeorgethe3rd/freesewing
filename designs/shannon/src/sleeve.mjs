import { sleeve as basicSleeve } from '@freesewing/basicsleeve'
import { sleeve as dolmanSleeve } from '@freesewing/dolmansleeve'
import { back } from './back.mjs'

export const sleeve = {
  name: 'shannon.sleeve',
  from: basicSleeve.from,
  after: back,
  measurements: basicSleeve.measurements,
  options: {
    //Imported
    ...basicSleeve.options,
    ...dolmanSleeve.options,
    //Constant
    sleeveBands: false, //Locked for Shannon
    sleeveBandWidth: 0, //Locked for Shannon
    sleeveFlounces: 'none', //Locked for Shannon
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
    //settings && draft
    if (options.sleeveStyle == 'inbuilt') {
      part.hide()
      return part
    } else {
      if (options.sleeveStyle == 'dolman') {
        dolmanSleeve.draft(sh)
      } else {
        basicSleeve.draft(sh)
      }
    }

    if (complete) {
      //title
      macro('title', {
        nr: 9,
        title: 'Sleeve (' + utils.capitalize(options.sleeveStyle) + ')',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
    }

    return part
  },
}
