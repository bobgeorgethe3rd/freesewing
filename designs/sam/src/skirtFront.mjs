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
    separateBack: false, //Locked for Sam
    fitWaist: true, //Altered for Sam
    fitWaistBack: true, //Locked for Sam
    fitWaistFront: true, //Locked for Sam
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
      let titleCutNum = 2
      if (options.closurePosition != 'front' && options.cfSaWidth == 9) titleCutNum = 1
      if (options.skirtPanels <= 1) {
        macro('title', {
          at: points.title,
          nr: '7',
          title: 'Skirt (Front)',
          cutNr: titleCutNum,
          scale: 0.5,
          prefix: 'title',
          rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '11',
            title: 'Skirt Facing (Front)',
            cutNr: titleCutNum,
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
          cutNr: titleCutNum,
          scale: 0.15,
          prefix: 'title',
        })
        if (options.skirtFacings) {
          macro('title', {
            at: points.titleFacing,
            nr: '11a',
            title: 'Skirt Facing A (Front)',
            cutNr: titleCutNum,
            scale: 0.15,
            prefix: 'titleFacing',
          })
        }
        let j
        let k
        for (let i = 0; i < options.skirtPanels - 1; i++) {
          j = String.fromCharCode(i + 98)
          k = String.fromCharCode(i + 66)

          macro('title', {
            at: points['title' + i],
            nr: '7' + j,
            title: 'Skirt ' + k + ' (Front)',
            prefix: 'title ' + i,
            cutNr: 2,
            onFold: false,
            scale: 0.15,
            rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
          })

          if (options.skirtFacings) {
            macro('title', {
              at: points['titleFacing' + i],
              nr: '11' + j,
              title: 'Skirt Facing ' + k + ' (Front)',
              prefix: 'titleFacing ' + i,
              cutNr: 2,
              onFold: false,
              scale: 0.15,
              rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
            })
          }
        }
      }
    }

    return part
  },
}
