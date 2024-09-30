import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginBandStraight } from '@freesewing/plugin-bandstraight'

export const neckband = {
  name: 'neckbandstraight.neckband',
  options: {
    //Constants
    useVoidStores: true,
    //Style
    neckbandFolded: { bool: true, menu: 'style' },
    neckbandOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'style' },
    neckbandOverlap: { pct: 0, min: 0, max: 15, menu: 'style' },
    //Construction
    neckbandClosurePosition: {
      dflt: 'sideLeft',
      list: ['back', 'sideLeft', 'sideRight', 'front'],
      menu: 'construction',
    },
  },
  plugins: [pluginBundle, pluginBandStraight],
  draft: ({
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
  }) => {
    //measures
    if (options.useVoidStores) {
      void store.setIfUnset('neckbandLength', 900)
      void store.setIfUnset('neckbandWidth', 50)
      void store.setIfUnset('neckbandPlacketWidth', 40)
    } else {
      void store.setIfUnset('neckbandPlacketWidth', 0)
    }
    void store.setIfUnset('neckbandBack', store.get('neckbandLength') * 0.5)
    void store.setIfUnset('neckbandOverlap', store.get('neckbandLength') * options.neckbandOverlap)
    void store.setIfUnset('neckbandSideSa', sa)

    //begin
    macro('bandstraight', {
      length: store.get('neckbandLength'),
      lengthBack: store.get('neckbandBack'),
      width: store.get('neckbandWidth'),
      placketWidth: store.get('neckbandPlacketWidth'),
      overlap: store.get('neckbandOverlap'),
      overlapSide: options.neckbandOverlapSide,
      folded: options.neckbandFolded,
      closurePosition: options.neckbandClosurePosition,
      sideSa: store.get('neckbandSideSa'),
      north: 'Centre Front',
      east: 'Shoulder Seam',
      south: 'Centre Back',
      west: 'Shoulder Seam',
      prefix: 'neckband',
    })

    if (complete) {
      let titleCutNum = 2
      if (options.neckbandFolded) titleCutNum = 1
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Neckband',
        cutNr: titleCutNum,
        scale: 0.25,
      })
    }

    return part
  },
}
