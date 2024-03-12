import { frontPocketFacing } from './frontPocketFacing.mjs'

export const frontPocketFacingB = {
  name: 'jackson.frontPocketFacingB',
  from: frontPocketFacing,
  options: {
    frontPocketFacingBBool: { bool: false, menu: 'pockets.frontPockets' },
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
  }) => {
    //set render
    if (!options.frontPocketsBool || !options.frontPocketFacingBBool) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Dalton
    const keepThese = ['daltonGuide', 'outSeam', 'bottom']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //removing macros not required
    macro('title', false)
    //let's begin
    //paths
    paths.outSeam = paths.outSeam.split(points.frontPocketOpeningOut)[1]
    paths.pocketCurve = new Path()
      .move(points.frontPocketOpeningWaist)
      .curve(
        points.frontPocketOpeningWaistCp2,
        points.frontPocketOpeningOutCp1,
        points.frontPocketOpeningOut
      )
      .hide()

    paths.seam = paths.bottom
      .clone()
      .line(points.frontPocketOpeningWaist)
      .join(paths.pocketCurve)
      .join(paths.outSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.frontPocketOpeningOut.shiftFractionTowards(
        points.frontPocketOpeningOutCp1,
        0.1
      )
      points.grainlineTo = new Point(points.grainlineFrom.x, points.frontPocketFacingOut.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontPocketOpeningWaist', 'frontPocketOpeningOut'],
      })
      //title
      macro('title', {
        nr: '14',
        title: 'Front Pocket Facing B',
        at: points.title,
        scale: 0.25,
      })
      if (sa) {
        paths.sa = paths.bottom
          .clone()
          .offset(sa)
          .line(points.saFrontPocketFacingWaist)
          .line(points.saFrontPocketOpeningWaist)
          .join(paths.pocketCurve.offset(sa))
          .line(points.saFrontPocketOpeningOut)
          .join(paths.outSeam.offset(sa))
          .line(points.saFrontPocketFacingOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
