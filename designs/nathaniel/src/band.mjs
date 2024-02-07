import { band as draftBand } from '@freesewing/perry'
import { crown } from './crown.mjs'

export const band = {
  name: 'nathaniel.band',
  after: crown,
  options: {
    //Imported
    ...draftBand.options,
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
    draftBand.draft(sh)

    return part
  },
}
