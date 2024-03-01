import { watchPocket as wandaWatchPocket } from '@freesewing/wanda'

export const watchPocket = {
  name: 'fallon.watchPocket',
  options: {
    //Imported
    ...wandaWatchPocket.options,
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
    if (!options.pocketsBool) {
      part.hide()
    }
    //set draft
    wandaWatchPocket.draft(sh)
    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: 'Watch Pocket',
        at: points.title,
        scale: 0.25,
      })
    }

    return part
  },
}
