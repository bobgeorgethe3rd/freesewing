import { placket as wandaPlacket } from '@freesewing/wanda'

export const placket = {
  name: 'fallon.placket',
  options: {
    //Imported
    ...wandaPlacket.options,
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
      absoluteOptions,
      log,
    } = sh
    //set Render
    if (!options.plackets) {
      part.hide()
    }
    //set draft
    wandaPlacket.draft(sh)
    if (complete) {
      //title
      macro('title', {
        nr: 7,
        title: 'Placket',
        at: points.title,
        cutNr: 2,
        scale: 0.15,
      })
    }

    return part
  },
}
