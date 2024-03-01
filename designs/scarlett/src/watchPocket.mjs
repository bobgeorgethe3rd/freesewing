import { watchPocket as wandaWatchPocket } from '@freesewing/wanda'

export const watchPocket = {
  name: 'scarlett.watchPocket',
  options: {
    //Imported
    ...wandaWatchPocket.options,
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
    if (!options.pocketsBool) {
      part.hide()
    }
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
