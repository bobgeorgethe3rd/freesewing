import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { skirtBase as skirtBaseClaude } from '@freesewing/claude'
import { skirtBase as skirtBaseHarriet } from '@freesewing/harriet'

export const skirtBase = {
  name: 'scott.skirtBase',
  after: [backBase, frontBase],
  hide: {
    after: true,
    inherited: true,
  },
  options: {
    //Imported
    ...skirtBaseClaude.options,
    ...skirtBaseHarriet.options,
    //Constants
    waistHeight: 1, //Locked for Scott
    waistbandElastic: false, //Locked for Scott
    calculateWaistbandDiff: false, //Locked for Scott
    useBackMeasures: true, //Locked for Scott
    separateBack: true, //Locked for Scott
    highLow: false, //Locked for Scott
    //Style
    skirtStyle: { dflt: 'harriet', list: ['claude', 'harriet', 'none'], menu: 'style' },
    waistbandStyle: { dflt: 'none', list: ['none', 'straight', 'curved'], menu: 'style' }, //Altered for Scott
    skirtHighLengthBonus: { pct: 2, min: -20, max: 30, menu: 'style' }, //Altered for Scott
    skirtLengthBonus: { pct: -2, min: -20, max: 50, menu: 'style' }, //Altered for Scott
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
    if (options.skirtStyle != 'none') {
      if (options.skirtStyle == 'harriet') {
        options.highLow = true
        skirtBaseHarriet.draft(sh)
      } else {
        skirtBaseClaude.draft(sh)
      }
    } else {
      part.hide()
      return part
    }

    return part
  },
}
