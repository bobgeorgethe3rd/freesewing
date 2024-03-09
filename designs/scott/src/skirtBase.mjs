import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'
import { skirtBase as skirtBaseClaude } from '@freesewing/claude'
import { skirtBase as skirtBaseHarriet } from '@freesewing/harriet'

export const skirtBase = {
  name: 'scott.skirtBase',
  after: [backBase, frontBase],
  measurements: [...skirtBaseClaude.measurements, ...skirtBaseHarriet.measurements],
  optionalMeasurements: [
    ...skirtBaseClaude.optionalMeasurements,
    ...skirtBaseHarriet.optionalMeasurements,
  ],
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
    //Fit
    waistEase: { pct: 5, min: 0, max: 20, menu: 'fit' }, //Altered for Scott
    //Style
    skirtType: { dflt: 'harriet', list: ['claude', 'harriet', 'none'], menu: 'style' },
    waistbandStyle: { dflt: 'none', list: ['none', 'straight', 'curved'], menu: 'style' }, //Altered for Scott
    skirtGatheringMethod: { dflt: 'increase', list: ['increase', 'spread'], menu: 'style' }, //Altered for Scott
    skirtGathering: { pct: 100, min: 0, max: 300, menu: 'style' }, //Altered for Scott
    skirtHighLengthBonus: { pct: 10, min: -20, max: 30, menu: 'style' }, //Altered for Scott
    skirtLengthBonus: { pct: -2, min: -20, max: 50, menu: 'style' }, //Altered for Scott
    //Advanced
    skirtFrontGatheringMethod: {
      dflt: 'increase',
      list: ['increase', 'spread'],
      menu: 'advanced.style',
    }, //Altered for Scott
    skirtBackGatheringMethod: {
      dflt: 'increase',
      list: ['increase', 'spread'],
      menu: 'advanced.style',
    }, //Altered for Scott
    skirtFrontGathering: { pct: 100, min: 0, max: 300, menu: 'advanced.style' }, //Altered for Scott
    skirtBackGathering: { pct: 100, min: 0, max: 300, menu: 'advanced.style' }, //Altered for Scott
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
    if (options.skirtType != 'none') {
      if (options.skirtType == 'harriet') {
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
