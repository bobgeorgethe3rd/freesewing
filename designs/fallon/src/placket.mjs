import { placket as wandaPlacket } from '@freesewing/wanda'

export const placket = {
  name: 'fallon.placket',
  from: wandaPlacket,
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
    if (!options.plackets) {
      part.hide()
    }

    if (complete) {
      //title
      macro('title', {
        nr: 7,
        title: 'Placket',
        at: points.title,
        scale: 0.15,
      })
    }

    return part
  },
}
