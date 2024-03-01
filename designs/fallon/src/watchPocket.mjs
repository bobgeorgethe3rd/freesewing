import { watchPocket as wandaWatchPocket } from '@freesewing/wanda'

export const watchPocket = {
  name: 'fallon.watchPocket',
  from: wandaWatchPocket,
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
        nr: 6,
        title: 'Watch Pocket',
        at: points.title,
        scale: 0.25,
      })
    }

    return part
  },
}
