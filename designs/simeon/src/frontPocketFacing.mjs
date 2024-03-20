import { frontPocketBag } from './frontPocketBag.mjs'

export const frontPocketFacing = {
  name: 'simeon.frontPocketFacing',
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
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }
    //delete paths & snippets
    const keepThese = ['outseam', 'daltonGuide', 'grainline']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //remove macros
    macro('title', false)
    //let's begin
    //paths
    paths.seam = new Path()
      .move(points.frontPocketOut)
      .line(points.frontPocketFacingBottom)
      .line(points.frontPocketFacingWaist)
      .line(points.waistOut)
      .join(paths.outseam)
      .close()

    if (complete) {
      //title
      points.title = points.frontPocketOut
        .shift(
          points.frontPocketOut.angle(points.frontPocketFacingBottom),
          points.frontPocketOut.dist(points.frontPocketFacingBottom) * 0.5
        )
        .shift(
          points.frontPocketFacingBottom.angle(points.frontPocketFacingWaist),
          points.frontPocketFacingBottom.dist(points.frontPocketFacingWaist) * 0.5
        )
      macro('title', {
        nr: 4,
        title: 'Front Pocket Facing',
        at: points.title,
        scale: 1 / 3,
        rotation: 90 - points.frontPocketFacingBottom.angle(points.frontPocketFacingWaist),
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saFrontPocketFacingBottom = points.frontPocketFacingBottom
          .shift(points.frontPocketOut.angle(points.frontPocketFacingBottom), sa)
          .shift(points.frontPocketFacingWaist.angle(points.frontPocketFacingBottom), sideSeamSa)

        points.saFrontPocketFacingWaist = points.frontPocketFacingWaist
          .shift(points.frontPocketFacingBottom.angle(points.frontPocketFacingWaist), sa)
          .shift(points.waistOut.angle(points.waistIn), sideSeamSa)

        paths.sa = new Path()
          .move(points.saFrontPocketOut)
          .line(points.saFrontPocketFacingBottom)
          .line(points.saFrontPocketFacingWaist)
          .line(points.saWaistOut)
          .join(paths.outseam.offset(sideSeamSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
