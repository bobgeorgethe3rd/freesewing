import { pctBasedOn } from '@freesewing/core'
import { earFlap as henryEarFlap } from '@freesewing/henry'
import { brim } from './brim.mjs'

export const earFlap = {
  name: 'minerva.earFlap',
  after: brim,
  options: {
    //Imported
    ...henryEarFlap.options,
    //Constants
    buttonholeEarFlap: false, //locked for Minerva
    //Style
    earFlapStyle: {
      dflt: 'curved',
      list: ['curved', 'rounded', 'pointed', 'triangle'],
      menu: 'style',
    }, //altered from Henry
    earFlapLength: { pct: 100, min: 80, max: 150, menu: 'style' }, //altered for Minerva
    earFlapWidthBonus: { pct: 0, min: -20, max: 50, menu: 'style' }, //altered for Minerva
  },
  draft: (sh) => {
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
    //draft brimBase
    henryEarFlap.draft(sh)
    //remove macros
    macro('title', false)
    macro('miniscale', false)
    macro('logorg', false)
    //delete points
    delete points.logo
    delete points.scalebox

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'earFlap' + utils.capitalize(options.earFlapStyle),
        scale: 0.25,
      })
    }

    return part
  },
}
