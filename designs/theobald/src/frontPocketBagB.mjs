import { frontPocketBag } from './frontPocketBag.mjs'

export const frontPocketBagB = {
  name: 'theobald.frontPocketBagB',
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
    //setRender
    if (
      !options.frontPocketsBool ||
      options.frontPocketStyle != 'original' ||
      options.frontPocketOpeningStyle != 'slanted'
    ) {
      part.hide()
      return part
    }
    //remove paths & snippets
    const deleteThese = ['seam', 'sa', 'foldline']
    for (const p of deleteThese) {
      delete paths[p]
    }
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //let's begin
    //paths
    paths.seam = paths.saBase
      .clone()
      .line(points.frontPocketOut)
      .join(paths.waist.split(points.frontPocketOut)[1].split(points.frontPocketOpeningWaist)[0])
      .line(points.frontPocketOpeningOut)
      .close()

    if (complete) {
      //notches
      snippets.frontPocketOpeningOut = new Snippet('notch', points.frontPocketOpeningOut)
      //title
      macro('title', {
        nr: '5b',
        title: 'Front Pocket Bag B',
        at: points.title,
        scale: 0.5,
        rotation: 90 - points.frontPocketBottomMid.angle(points.frontPocketWaist),
      })
      if (sa) {
        paths.sa = paths.saBase
          .offset(sa * options.frontPocketBagSaWidth * 100)
          .line(points.saFrontPocketBottomOut)
          .line(points.saFrontPocketOut)
          .join(
            paths.waist
              .split(points.frontPocketOut)[1]
              .split(points.frontPocketOpeningWaist)[0]
              .offset(sa)
          )
          .line(points.saFrontPocketOpeningWaist)
          .line(points.saFrontPocketOpeningOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
