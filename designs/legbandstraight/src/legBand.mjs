import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginBandStraight } from '@freesewing/plugin-bandstraight'

export const legBand = {
  name: 'legbandStraight.legBand',
  options: {
    //Constants
    useVoidStores: true,
    //Style
    legBandFolded: { bool: true, menu: 'style' },
    legBandOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'style' },
    legBandOverlap: { pct: 0, min: 0, max: 15, menu: 'style' },
    //Construction
    legBandClosurePosition: {
      dflt: 'sideRight',
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
      void store.setIfUnset('legBandLength', 400)
      void store.setIfUnset('legBandWidth', 50)
      void store.setIfUnset('legBandPlacketWidth', 40)
    } else {
      void store.setIfUnset('legBandPlacketWidth', 0)
    }
    void store.setIfUnset('legBandBack', store.get('legBandLength') * 0.5)
    void store.setIfUnset('legBandOverlap', store.get('legBandLength') * options.legBandOverlap)
    void store.setIfUnset('legBandSideSa', sa)

    //begin
    macro('bandstraight', {
      length: store.get('legBandLength'),
      lengthBack: store.get('legBandBack'),
      width: store.get('legBandWidth'),
      placketWidth: store.get('legBandPlacketWidth'),
      overlap: store.get('legBandOverlap'),
      overlapSide: options.legBandOverlapSide,
      folded: options.legBandFolded,
      closurePosition: options.legBandClosurePosition,
      sideSa: store.get('legBandSideSa'),
      prefix: 'legBand',
    })

    if (complete) {
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Leg band',
        scale: 1 / 3,
      })
      if (options.legBandClosurePosition == 'back') {
        paths.legBandLeft.attr('data-text', 'Inseam', true)
      }
      if (options.legBandClosurePosition == 'sideLeft') {
        paths.legBandMid.attr('data-text', 'Inseam', true)
      }
      if (options.legBandClosurePosition == 'sideRight') {
        if (paths.legBandLeftEx) paths.legBandLeftEx.attr('data-text', 'Inseam', true)
        if (paths.legBandRightEx) paths.legBandRightEx.attr('data-text', 'Inseam', true)
      }
      if (options.legBandClosurePosition == 'front') {
        paths.legBandRight.attr('data-text', 'Inseam', true)
      }
    }

    return part
  },
}
