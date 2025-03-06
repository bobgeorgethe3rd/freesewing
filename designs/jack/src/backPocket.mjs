import { backPocket as backPocketJackson } from '@freesewing/jackson'
import { back } from './back.mjs'

export const backPocket = {
  name: 'jack.backPocket',
  after: back,
  options: {
    //Imports
    ...backPocketJackson.options,
  },
  plugins: backPocketJackson.plugins,
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
      log,
      absoluteOptions,
    } = sh
    //draft
    if (store.get('backPocketsBool') < 1) {
      part.hide()
      return part
    } else {
      backPocketJackson.draft(sh)
    }

    return part
  },
}
