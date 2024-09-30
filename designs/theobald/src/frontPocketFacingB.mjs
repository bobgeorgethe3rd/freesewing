import { frontPocketBag } from './frontPocketBag.mjs'

export const frontPocketFacingB = {
  name: 'theobald.frontPocketFacingB',
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
    if (!options.frontPocketsBool || options.frontPocketOpeningStyle != 'slanted') {
      part.hide()
      return part
    }
    //remove paths & snippets
    const deleteThese = ['seam', 'sa', 'outseam', 'foldline', 'grainline']
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
      .join(
        paths.waist.split(points.frontPocketFacingOut)[1].split(points.frontPocketOpeningWaist)[0]
      )
      .line(points.frontPocketOpeningOut)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = new Point(
        (points.frontPocketOpeningOutCp2.x + points.frontPocketBottomLeft.x) / 2,
        points.frontPocketOpeningOutCp2.y
      )
      points.grainlineFrom = new Point(points.grainlineTo.x, points.frontPocketOpeningOut.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.frontPocketOpeningOut = new Snippet('notch', points.frontPocketOpeningOut)
      //title
      points.title = new Point(
        points.frontPocketOpeningWaist.x * 0.99,
        (points.seatOutCp1.y + points.waistOut.y) / 2
      )
      macro('title', {
        nr: '6b',
        title: 'Front Pocket Facing B',
        at: points.title,
        cutNr: 2,
        scale: 0.2,
      })
      if (sa) {
        paths.sa = paths.curve
          .offset(sa * options.frontPocketBagSaWidth * 100)
          .line(points.saFrontBottomLeftFacing)
          .line(points.saFrontPocketFacingOut)
          .join(
            paths.waist
              .split(points.frontPocketFacingOut)[1]
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
