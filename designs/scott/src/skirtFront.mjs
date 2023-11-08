import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { skirtBase } from '@freesewing/harriet'
import { skirtFront as skirtFrontDaisy } from '@freesewing/harriet'

export const skirtFront = {
  name: 'scott.skirtFront',
  from: skirtBase,
  after: backBase,
  frontBase,
  hide: {
    from: true,
    after: true,
    inherited: true,
  },
  options: {
    //Imported
    ...skirtFrontDaisy.options,
    //Constants
    waistHeight: 1, //Locked for Scott
    waistbandElastic: false, //Locked for Scott
    calculateWaistbandDiff: false, //Locked for Scott
    useBackMeasures: true, //Locked for Scott
    separateBack: true, //Locked for Scott
    //Style
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
    skirtFrontDaisy.draft(sh)

    return part
  },
}
