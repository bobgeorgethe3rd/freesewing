import { placket as wandaPlacket } from '@freesewing/wanda'

export const placket = {
  name: 'scarlett.placket',
  from: wandaPlacket,
  hide: {
    from: true,
  },
  options: {
    closurePosition: {
      dflt: 'front',
      list: ['back', 'sideLeft', 'sideRight', 'front'],
      menu: 'construction',
    }, //altered for Scarlett
  },
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
    absoluteOptions,
    log,
  }) => {
    //set Render
    if (!options.plackets) {
      part.hide()
    }
    //stores
    store.set('placketLength', points.topLeft.dist(points.bottomLeft))
    store.set('swingWidth', points.topLeft.dist(points.topRight))
    if (options.closurePosition == 'front' && options.swingPanelStyle == 'connected') {
      store.set('placketWidth', 0)
    }

    if (complete) {
      //title
      macro('title', {
        nr: '8',
        title: 'Placket',
        at: points.title,
        scale: 1 / 3,
      })
    }

    return part
  },
}
