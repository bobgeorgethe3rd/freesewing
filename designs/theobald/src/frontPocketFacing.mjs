import { frontPocketBag } from './frontPocketBag.mjs'

export const frontPocketFacing = {
  name: 'theobald.frontPocketFacing',
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
    //remove paths & snippets
    const deleteThese = ['seam', 'sa', 'foldline', 'grainline']
    for (const p of deleteThese) {
      delete paths[p]
    }
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //let's begin
    //paths
    paths.seam = paths.curve
      .clone()
      .line(points.frontPocketFacingOut)
      .join(paths.waist.split(points.frontPocketFacingOut)[1])
      .join(paths.outSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = new Point(
        (points.frontPocketOpeningOutCp2.x + points.frontPocketBottomLeft.x) / 2,
        points.frontPocketOpeningOutCp2.y
      )
      points.grainlineFrom = new Point(points.grainlineTo.x, points.waistOut.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontPocketOpeningOutTop', 'frontPocketOpeningOut'],
      })
      //title
      points.title = new Point(
        points.frontPocketOpeningWaist.x * 0.99,
        (points.seatOutCp1.y + points.waistOut.y) / 2
      )
      macro('title', {
        nr: '6',
        title: 'Front Pocket Facing',
        at: points.title,
        scale: 0.2,
      })
      if (sa) {
        paths.sa = paths.curve
          .offset(sa * options.frontPocketBagSaWidth * 100)
          .line(points.saFrontBottomLeftFacing)
          .line(points.saFrontPocketFacingOut)
          .join(paths.waist.split(points.frontPocketFacingOut)[1].offset(sa))
          .line(points.saWaistOut)
          .join(paths.outSeam.offset(sa * options.sideSeamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
