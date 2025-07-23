import { frontPocketBag } from './frontPocketBag.mjs'

export const frontPocketBagB = {
  name: 'caleb.frontPocketBagB',
  from: frontPocketBag,
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
  }) => {
    //render
    if (
      !options.frontPocketsBool ||
      options.frontPocketFolded ||
      options.frontPocketOpeningStyle == 'inseam'
    ) {
      part.hide()
      return part
    }
    //remove paths
    const keepPaths = ['outSeam', 'saBottom', 'grainline', 'facingLine', 'daltonGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    const keepSnippets = ['frontPocketOpeningOut', 'frontPocketOut']
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //remove macros
    macro('title', false)
    //paths
    paths.seam = paths.saBottom
      .clone()
      .line(points.frontPocketWaist)
      .line(points.waistOut)
      .join(paths.outSeam)
      .close()

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '4b',
        title: 'Front Pocket Bag B',
        cutNr: 2,
        scale: 0.5,
        rotation: 90 - points.frontPocketBottomMid.angle(points.frontPocketWaist),
      })
      if (sa) {
        paths.sa = paths.saBottom
          .clone()
          .offset(sa * options.frontPocketBagSaWidth * 100)
          .line(points.saFrontPocketWaist)
          .line(points.saWaistOut)
          .join(paths.outSeam.offset(sa * options.sideSeamSaWidth * 100))
          .line(points.saFrontPocketOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
