import { placket as wandaPlacket } from '@freesewing/wanda'

export const placket = {
  name: 'scarlett.placket',
  from: wandaPlacket,
  hide: {
    from: true,
  },
  options: {
    waistbandClosurePosition: {
      dflt: 'front',
      list: ['back', 'side', 'front'],
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
    //stores
    store.set('placketLength', points.topLeft.dist(points.bottomLeft))
    if (options.waistbandClosurePosition == 'front' && options.swingPanelStyle == 'connected') {
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
