import { pocket as wandaPocket } from '@freesewing/wanda'

export const pocket = {
  name: 'scarlett.pocket',
  options: {
    //Imported
    ...wandaPocket.options,
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
      return part
    }
    wandaPocket.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 5,
        title: 'Pocket',
        at: points.title,
        scale: 0.5,
      })
    }

    return part
  },
}
