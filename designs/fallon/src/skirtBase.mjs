import { pluginBundle } from '@freesewing/plugin-bundle'
import { skirtBase as wandaSkirtBase } from '@freesewing/wanda'

export const skirtBase = {
  name: 'fallon.skirtBase',
  from: wandaSkirtBase,
  hide: {
    from: true,
  },
  options: {
    //Constants
    fullDress: true, //altered frot Fallon
    umbrellaFullness: 0,
    umbrellaExtenstion: 0,
    //Style
    sidePanelFullness: { pct: 50, min: 50, max: 75, menu: 'style' },
  },
  plugins: [pluginBundle],
  draft: ({
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
  }) => {
    //removing paths
    // for (let i in paths) delete paths[i]
    //let's begin

    return part
  },
}
