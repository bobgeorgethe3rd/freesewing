import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginBandCurved } from '@freesewing/plugin-bandcurved'

export const legBand = {
  name: 'legbandCurved.legBand',
  options: {
    //Constants
    useVoidStores: true,
    //Style
    legBandOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'style' },
    legBandOverlap: { pct: 0, min: 0, max: 15, menu: 'style' },
    //Construction
    legBandClosurePosition: {
      dflt: 'sideRight',
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
      void store.setIfUnset('legBandLength', 400)
      void store.setIfUnset('legBandLengthTop', store.get('legBandLength') * 1.02)
      void store.setIfUnset('legBandWidth', 50)
      void store.setIfUnset('legBandPlacketWidth', 40)
    } else {
      void store.setIfUnset('legBandPlacketWidth', 0)
    }
    void store.setIfUnset('legBandBack', store.get('legBandLength') * 0.5)
    void store.setIfUnset('legBandOverlap', store.get('legBandLength') * options.legBandOverlap)
    void store.setIfUnset('legBandSideSa', sa)

    //begin
    macro('bandcurved', {
      length: store.get('legBandLength'),
      lengthTop: store.get('legBandLengthTop'),
      lengthBack: store.get('legBandBack'),
      width: store.get('legBandWidth'),
      placketWidth: store.get('legBandPlacketWidth'),
      overlap: store.get('legBandOverlap'),
      overlapSide: options.legBandOverlapSide,
      closurePosition: options.legBandClosurePosition,
      sideSa: store.get('legBandSideSa'),
      north: 'Centre Front',
      east: 'Insean',
      south: 'Centre Back',
      west: 'Side Seam',
      prefix: 'legBand',
      prefix: 'legBand',
    })

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Neckband',
        scale: 1 / 3,
      })
      // if (options.legBandClosurePosition == 'back') {
      // paths.legBandLeft.attr('data-text', 'Inseam', true)
      // }
      // if (options.legBandClosurePosition == 'sideLeft') {
      // paths.legBandMid.attr('data-text', 'Inseam', true)
      // }
      // if (options.legBandClosurePosition == 'sideRight') {
      // if (paths.legBandLeftEx) paths.legBandLeftEx.attr('data-text', 'Inseam', true)
      // if (paths.legBandRightEx) paths.legBandRightEx.attr('data-text', 'Inseam', true)
      // }
      // if (options.legBandClosurePosition == 'front') {
      // paths.legBandRight.attr('data-text', 'Inseam', true)
      // }
    }

    return part
  },
}
