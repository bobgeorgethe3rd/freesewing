import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginBandStraight } from '@freesewing/plugin-bandstraight'

export const waistband = {
  name: 'waistbandstraight.waistband',
  options: {
    //Constants
    useVoidStores: true,
    //Style
    waistbandFolded: { bool: false, menu: 'style' },
    waistbandOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'style' },
    waistbandOverlap: { pct: 0, min: 0, max: 15, menu: 'style' },
    //Construction
    closurePosition: {
      dflt: 'back',
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
      void store.setIfUnset('waistbandLength', 900)
      void store.setIfUnset('waistbandWidth', 50)
      void store.setIfUnset('waistbandPlacketWidth', 40)
    } else {
      void store.setIfUnset('waistbandPlacketWidth', 0)
    }
    void store.setIfUnset('waistbandBack', store.get('waistbandLength') * 0.5)
    void store.setIfUnset(
      'waistbandOverlap',
      store.get('waistbandLength') * options.waistbandOverlap
    )
    void store.setIfUnset('waistbandSideSa', sa)

    //begin
    macro('bandstraight', {
      length: store.get('waistbandLength'),
      lengthBack: store.get('waistbandBack'),
      width: store.get('waistbandWidth'),
      placketWidth: store.get('waistbandPlacketWidth'),
      overlap: store.get('waistbandOverlap'),
      overlapSide: options.waistbandOverlapSide,
      folded: options.waistbandFolded,
      closurePosition: options.closurePosition,
      maxButtons: store.get('waistbandMaxButtons'),
      sideSa: store.get('waistbandSideSa'),
      north: 'Centre Front',
      east: 'Side Seam',
      south: 'Centre Back',
      west: 'Side Seam',
      prefix: 'waistband',
    })

    if (complete) {
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Waistband',
        scale: 1 / 3,
      })
    }

    return part
  },
}
