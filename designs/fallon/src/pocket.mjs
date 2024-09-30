import { pocket as wandaPocket } from '@freesewing/wanda'

export const pocket = {
  name: 'fallon.pocket',
  options: {
    //Imported
    ...wandaPocket.options,
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
    wandaPocket.draft(sh)
    if (complete) {
      let titleCutNum = 4
      if (options.pocketStyle == 'boxPleat') titleCutNum = 2
      //title
      macro('title', {
        nr: 5,
        title: 'Pocket',
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.5,
      })
    }

    return part
  },
}
