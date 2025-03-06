import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { frontPocketBag as frontPocketBagJackson } from '@freesewing/jackson'
import { front } from './front.mjs'

export const frontPocketBag = {
  name: 'jack.frontPocketBag',
  from: front,
  options: {
    //Imports
    ...frontPocketBagJackson.options,
  },
  plugins: [...frontPocketBagJackson.plugins, pluginLogoRG],
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
    macro('logorg', false)
    macro('scalebox', false)
    frontPocketBagJackson.draft(sh)

    return part
  },
}
