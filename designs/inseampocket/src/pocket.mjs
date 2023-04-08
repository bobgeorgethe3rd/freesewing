import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'inseampocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    // cpFraction: 0.55191502449,
    //Pocket
    inseamPocketWidth: { pct: 50, min: 40, max: 200, menu: 'pockets.inseamPockets' },
    // inseamPocketDepth: { pct: 0, min: -50, max: 200, menu: 'pockets.inseamPockets' },
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
  }) => {
    //measures
    if (options.useVoidStores) {
      void store.setIfUnset('anchorSeamLength', 423)
    }
    let witdth = store.get('anchorSeamLength') * options.inseamPocketWidth

    //let's begin

    if (complete) {
      if (sa) {
      }
    }

    return part
  },
}
