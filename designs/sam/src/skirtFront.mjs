import { skirtFront as skirtFrontClaude } from '@freesewing/claude'
import { pocket } from './pocket.mjs'

export const skirtFront = {
  name: 'sam.skirtFront',
  after: pocket,
  from: skirtFrontClaude.from,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...skirtFrontClaude.options,
    //Constant
    calculateWaistbandDiff: false, //Locked for Sam
    useBackMeasures: true, //Locked for Sam
    useVoidStores: false, //Locked for Sam
    waistbandElastic: false, //Locked for Sam
    waistHeight: 1, //Locked for Sam
    //Fit
    waistEase: { pct: 5, min: 0, max: 20, menu: 'fit' }, //Altered for Sam
    //Style
    backDrop: { pct: 0, min: 0, max: 100, menu: 'style' }, //Altered for Sam
    skirtFullness: { pct: 75, min: 5, max: 200, menu: 'style' }, //Altered for Sam
    waistbandStyle: { dflt: 'none', list: ['straight', 'curved', 'none'], menu: 'style' }, //Altered for Sam
    skirtGatheringMethod: { dflt: 'increase', list: ['increase', 'spread'], menu: 'style' }, //Altered for Sam
    //Construction
    closurePosition: {
      dflt: 'sideLeft',
      list: ['front', 'sideLeft', 'sideRight', 'back'],
      menu: 'construction',
    }, //Altered for Sam
    skirtFacings: { bool: false, menu: 'construction' }, //Altered for Sam
    skirtHemWidth: { pct: 2.5, min: 0, max: 3, menu: 'construction' }, //Altered for Sam
    //Advanced
    skirtBackFullness: { pct: 75, min: 5, max: 200, menu: 'advanced.style' }, //Altered for Sam
    skirtFrontFullness: { pct: 75, min: 5, max: 200, menu: 'advanced.style' }, //Altered for Sam
    skirtFrontGatheringMethod: {
      dflt: 'increase',
      list: ['increase', 'spread'],
      menu: 'advanced.style',
    }, //Altered for Sam
    skirtBackGatheringMethod: {
      dflt: 'increase',
      list: ['increase', 'spread'],
      menu: 'advanced.style',
    }, //Altered for Sam
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
    } = sh
    //draft
    skirtFrontClaude.draft(sh)
    //remove macros
    macro('logorg', false)
    macro('scalebox', false)

    if (complete) {
      //title
      if (options.skirtPanels <= 1) {
        macro('title', {
          at: points.title,
          nr: '7',
          title: 'Skirt (Front)',
          scale: 0.5,
          prefix: 'title',
          rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '11',
            title: 'Skirt Facing (Front)',
            scale: 0.5,
            prefix: 'titleFacing',
            rotation: 90 - points.frontHemMid.angle(points.frontHemFacingMid),
          })
        }
      } else {
        macro('title', {
          at: points.title,
          nr: '7a',
          title: 'Skirt A (Front)',
          scale: 0.15,
          prefix: 'title',
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '11a',
            title: 'Skirt Facing A (Front)',
            scale: 0.15,
            prefix: 'titleFacing',
          })
        }
      }
    }

    return part
  },
}
