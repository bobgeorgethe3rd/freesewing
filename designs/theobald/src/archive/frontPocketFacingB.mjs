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
    //set Render
    if (!options.frontPocketsBool || options.frontPocketOpeningStyle != 'slanted') {
      part.hide()
      return part
    }
    //delete paths
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    macro('title', false)
    //measurements
    const suffix = store.get('frontPleatSuffix')
    //let's begin
    //paths
    paths.saBottom = new Path()
      .move(points['frontPocketOpeningOut' + suffix])
      .curve_(points['frontPocketCp1' + suffix], points['frontPocketBottomLeft' + suffix])
      .hide()

    paths.saBase = new Path()
      .move(points['frontPocketBottomLeft' + suffix])
      .line(points['frontPocketFacingWaist' + suffix])
      .line(points['frontPocketOpeningWaist' + suffix])
      .line(points['frontPocketOpeningOut' + suffix])
      .hide()

    paths.seam = paths.saBottom.join(paths.saBase).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points['frontPocketOpeningWaist' + suffix].shiftFractionTowards(
        points['frontPocketFacingWaist' + suffix],
        0.5
      )
      points.grainlineTo = utils.beamsIntersect(
        points.grainlineFrom,
        points.grainlineFrom.shift(
          points['frontPocketWaist' + suffix].angle(points['frontPocketBottom' + suffix]),
          1
        ),
        points['frontPocketBottomLeft' + suffix],
        points['frontPocketFacingWaist' + suffix]
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.frontPocketOpeningOut = new Snippet(
        'notch',
        points['frontPocketOpeningOut' + suffix]
      )
      //title
      points.title = points['frontPocketOpeningOut' + suffix].shift(
        points['styleWaistOut' + suffix].angle(points['styleWaistIn' + suffix]),
        points['frontPocketOpeningWaist' + suffix].dist(points['frontPocketFacingWaist' + suffix]) /
          4
      )

      macro('title', {
        nr: '6b',
        title: 'Front Pocket Facing B',
        at: points.title,
        scale: 0.2,
        rotation:
          90 - points['frontPocketBottom' + suffix].angle(points['frontPocketWaist' + suffix]),
      })

      if (sa) {
        paths.sa = paths.saBottom
          .offset(sa * options.frontPocketBagSaWidth * 100)
          .join(paths.saBase.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
