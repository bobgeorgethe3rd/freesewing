import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginBandCurved } from '@freesewing/plugin-bandcurved'

export const neckband = {
  name: 'neckbandscurved.neckband',
  options: {
    //Constants
    useVoidStores: true,
    //Style
    neckbandOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'style' },
    neckbandOverlap: { pct: 0, min: 0, max: 15, menu: 'style' },
    //Construction
    neckbandClosurePosition: {
      dflt: 'sideLeft',
      list: ['back', 'sideLeft', 'sideRight', 'front'],
      menu: 'construction',
    },
  },
  plugins: [pluginBundle, pluginBandCurved],
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
    log,
  }) => {
    //void 	measures
    if (options.useVoidStores) {
      void store.setIfUnset('neckbandLength', 900)
      void store.setIfUnset('neckbandLengthTop', store.get('neckbandLength') * 0.98)
      void store.setIfUnset('neckbandWidth', 50)
      void store.setIfUnset('neckbandPlacketWidth', 40)
    } else {
      void store.setIfUnset('neckbandPlacketWidth', 0)
    }
    void store.setIfUnset('neckbandBack', store.get('neckbandLength') * 0.5)
    void store.setIfUnset('neckbandOverlap', store.get('neckbandLength') * options.neckbandOverlap)
    void store.setIfUnset('neckbandSideSa', sa)

    //begin
    macro('bandcurved', {
      length: store.get('neckbandLength'),
      lengthTop: store.get('neckbandLengthTop'),
      lengthBack: store.get('neckbandBack'),
      width: store.get('neckbandWidth'),
      placketWidth: store.get('neckbandPlacketWidth'),
      overlap: store.get('neckbandOverlap'),
      overlapSide: options.neckbandOverlapSide,
      closurePosition: options.neckbandClosurePosition,
      sideSa: store.get('neckbandSideSa'),
      north: 'Centre Front',
      east: 'Shoulder Seam',
      south: 'Centre Back',
      west: 'Shoulder Seam',
      prefix: 'neckband',
    })

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Neckband',
        cutNr: 1,
        scale: 0.25,
      })
    }

    return part
  },
}
