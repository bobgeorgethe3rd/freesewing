import { visor as draftVisor } from '@freesewing/barkley'
import { crown } from './crown.mjs'

export const visor = {
  name: 'nathaniel.visor',
  after: crown,
  options: {
    //Imported
    ...draftVisor.options,
  },
  draft: (sh) => {
    //draft
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
    //draft
    draftVisor.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Visor ' + utils.capitalize(options.visorStyle),
        at: points.title,
        cutNr: 2,
        scale: 0.25,
      })
    }

    return part
  },
}
