import { pocket as draftWatchPocket } from '@freesewing/watchpocket'

export const watchPocket = {
  name: 'wanda.watchPocket',
  from: draftWatchPocket,
  hide: {
    from: true,
  },
  options: {
    watchPocket: { bool: true, menu: 'pockets.watchPockets' },
    watchPocketWidth: { pct: 7.5, min: 5, max: 10, menu: 'pockets.watchPockets' }, //altered for Wanda
    watchPocketDepth: { pct: 6.25, min: 5, max: 10, menu: 'pockets.watchPockets' }, //altered for Wanda
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
    log,
    absoluteOptions,
  }) => {
    //set Render
    if (!options.watchPocket || !options.pocketsBool) {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        nr: 7,
        title: 'Watch Pocket',
        at: points.title,
        scale: 0.25,
      })
    }

    return part
  },
}
