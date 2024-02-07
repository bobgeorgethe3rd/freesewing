import { pctBasedOn } from '@freesewing/core'
import { visor as visorHenry } from '@freesewing/henry'
import { peak as visorPerry } from '@freesewing/perry'
import { visorBarkley } from './visorBarkley.mjs'
import { crown } from './crown.mjs'

export const visor = {
  name: 'barkley.visor',
  options: {
    //Imported
    ...visorBarkley.options,
    ...visorHenry.options,
    ...visorPerry.options,
    //Constants
    peak: true, //Locked for Barkley
    peakWidth: 0, //Locked for Barkley
    //Style
    fitVisor: { bool: false, menu: 'style' },
    visorStyle: { dflt: 'barkley', list: ['barkley', 'henry', 'perry'], menu: 'style' },
    visorAngle: { deg: 45, min: 10, max: 75, menu: 'style' }, //Altered for Barkley
    visorWidth: { pct: 8.2, min: 1, max: 17, snap: 5, ...pctBasedOn('head'), menu: 'style' }, //Alterd for barkley
    //Advanced
    visorLength: { pct: 112.5, min: 80, max: 150, menu: 'advanced' }, //Altered for Barkley
  },
  after: [crown],
  draft: (sh) => {
    const {
      store,
      macro,
      points,
      utils,
      options,
      absoluteOptions,
      snippets,
      measurements,
      complete,
      part,
    } = sh

    if (options.fitVisor) {
      absoluteOptions.visorWidth = store.get('visorWidth')
    }

    absoluteOptions.peakWidth = absoluteOptions.visorWidth

    switch (options.visorStyle) {
      case 'perry':
        visorPerry.draft(sh)
        break
      case 'henry':
        visorHenry.draft(sh)
        break
      default:
        visorBarkley.draft(sh)
    }

    if (complete) {
      if (options.visorStyle == 'perry') {
        delete snippets.bottomInnerNotch
      }
      //title
      macro('title', {
        nr: 2,
        title: 'Visor ' + utils.capitalize(options.visorStyle),
        at: points.title,
        scale: 0.25,
      })
    }
    return part
  },
}
