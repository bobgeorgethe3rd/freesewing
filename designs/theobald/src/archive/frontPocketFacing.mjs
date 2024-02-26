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
    //set Render
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }
    //Keep paths
    const keepThese = ['outSeam', 'outSeamR']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
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
      .line(points['styleWaistOut' + suffix])
      .hide()

    paths.seam = paths['outSeam' + suffix].join(paths.saBottom).join(paths.saBase).close()

    if (complete) {
      //grainline
      points.grainlineTo = points['frontPocketBottomLeft' + suffix]
      points.grainlineFrom = utils.beamsIntersect(
        points.grainlineTo,
        points.grainlineTo.shift(
          points['frontPocketBottom' + suffix].angle(points['frontPocketWaist' + suffix]),
          1
        ),
        points['styleWaistOut' + suffix],
        points['styleWaistIn' + suffix]
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
      if (options.frontPocketOpeningStyle == 'inseam') {
        snippets.frontPocketOpening = new Snippet('notch', points['frontPocketOpening' + suffix])
      }
      //title
      let titleSuffix
      if (options.frontPocketOpeningStyle == 'slanted') {
        titleSuffix = 'a'
      } else {
        titleSuffix = ''
      }
      points.title = points.title.shiftFractionTowards(points['styleWaistOut' + suffix], 0.4)
      macro('title', {
        nr: 6 + titleSuffix,
        title: 'Front Pocket Facing ' + utils.capitalize(titleSuffix),
        at: points.title,
        scale: 0.2,
        rotation:
          90 - points['frontPocketBottom' + suffix].angle(points['frontPocketWaist' + suffix]),
      })

      if (sa) {
        paths.sa = paths['outSeam' + suffix]
          .offset(sa * options.outSeamSaWidth * 100)
          .join(paths.saBottom.offset(sa * options.frontPocketBagSaWidth * 100))
          .join(paths.saBase.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
