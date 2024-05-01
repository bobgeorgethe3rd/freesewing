import { back } from './back.mjs'

export const placket = {
  name: 'bunny.placket',
  from: back,
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
    //set render
    if (options.placketStyle == 'inbuilt') {
      part.hide()
      return part
    }
    //remove paths & snippets
    const keepPaths = ['daisyGuide', 'placketNeck', 'mPlacketNeck']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //macros
    macro('title', false)
    //let's begin
    //paths
    if (options.placketStyle == 'separate') {
      paths.hemBase = new Path().move(points.mHemPlacket).line(points.hemPlacket).hide()

      paths.placketNeck = paths.placketNeck.join(paths.mPlacketNeck.reverse()).hide()
    } else {
      paths.hemBase = new Path().move(points.hemCorner).line(points.hemPlacket).hide()
    }

    paths.seam = paths.hemBase
      .clone()
      .line(points.neckPlacket)
      .join(paths.placketNeck)
      .line(paths.hemBase.start())
      .close()

    return part
  },
}
