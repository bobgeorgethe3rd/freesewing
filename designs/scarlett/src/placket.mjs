import { placket as wandaPlacket } from '@freesewing/wanda'

export const placket = {
  name: 'scarlett.placket',
  options: {
    //Imported
    ...wandaPlacket.options,
  },
  draft: (sh) => {
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      utils,
      options,
      measurements,
      snippets,
      Snippet,
      store,
      complete,
      part,
    } = sh
    //set Render
    if (!options.plackets) {
      part.hide()
    }
    wandaPlacket.draft(sh)
    //stores
    store.set('placketLength', points.topLeft.dist(points.bottomLeft))
    store.set('swingWidth', points.topLeft.dist(points.topRight))
    if (options.closurePosition == 'front' && options.swingPanelStyle == 'connected') {
      store.set('waistbandPlacketWidth', 0)
    }

    if (complete) {
      //title
      macro('title', {
        nr: 7,
        title: 'Placket',
        at: points.title,
        scale: 0.15,
      })
    }

    return part
  },
}
