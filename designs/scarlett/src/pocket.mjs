import { pocket as wandaPocket } from '@freesewing/wanda'

export const pocket = {
  name: 'scarlett.pocket',
  from: wandaPocket,
  hide: {
    from: true,
  },
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
    //set Render
    if (!options.pocketsBool) {
      part.hide()
    }

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
