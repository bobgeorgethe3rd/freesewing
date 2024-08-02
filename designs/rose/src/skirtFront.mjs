import { skirtFront as skirtFrontClaude } from '@freesewing/claude'
import { pocket } from './pocket.mjs'

export const skirtFront = {
  name: 'rose.skirtFront',
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
    calculateWaistbandDiff: false, //Locked for Rose
    useBackMeasures: true, //Locked for Rose
    useVoidStores: false, //Locked for Rose
    waistbandElastic: false, //Locked for Rose
    waistHeight: 1, //Locked for Rose
    separateBack: false, //Locked for Rose
    fitWaist: true, //Altered for Rose
    fitWaistBack: true, //Locked for Rose
    fitWaistFront: true, //Locked for Rose
    //Fit
    waistEase: { pct: 5, min: 0, max: 20, menu: 'fit' }, //Altered for Rose
    //Style
    skirtLengthBonus: { pct: 26.3, min: -20, max: 50, menu: 'style' }, //Altered for Rose
    waistbandStyle: { dflt: 'none', list: ['straight', 'curved', 'none'], menu: 'style' }, //Altered for Rose
    //Construction
    skirtFacings: { bool: false, menu: 'construction' }, //Altered for Rose
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
    if (!options.skirtBool) {
      part.hide()
      return part
    } else {
      skirtFrontClaude.draft(sh)
    }
    //remove macros
    macro('logorg', false)
    macro('scalebox', false)

    if (complete) {
      //title
      if (options.skirtPanels <= 1) {
        macro('title', {
          at: points.title,
          nr: '4',
          title: 'Skirt (Front)',
          scale: 0.5,
          prefix: 'title',
          rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '10',
            title: 'Skirt Facing (Front)',
            scale: 0.5,
            prefix: 'titleFacing',
            rotation: 90 - points.frontHemMid.angle(points.frontHemFacingMid),
          })
        }
      } else {
        macro('title', {
          at: points.title,
          nr: '4a',
          title: 'Skirt A (Front)',
          scale: 0.15,
          prefix: 'title',
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '10a',
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
