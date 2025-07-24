import { frontPocketBag } from './frontPocketBag.mjs'

export const frontPocketFacing = {
  name: 'caleb.frontPocketFacing',
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
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }
    //remove paths
    const keepPaths = ['outSeam', 'daltonGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //paths

    if (options.frontPocketOpeningStyle == 'slanted') {
      paths.outSeam = paths.outSeam
        .split(points.frontPocketOpeningOut)[1]
        .split(points.frontPocketFacingOut)[0]
        .hide()
    }

    paths.seam = new Path()
      .move(
        options.frontPocketOpeningStyle == 'slanted'
          ? points.frontPocketFacingOut
          : points.frontPocketFacingBottom
      )
      .line(points.frontPocketFacingWaist)
      .line(
        options.frontPocketOpeningStyle == 'slanted'
          ? points.frontPocketOpeningWaist
          : points.waistOut
      )
      .line(paths.outSeam.start())
      .join(paths.outSeam)
      .line(
        options.frontPocketOpeningStyle == 'slanted'
          ? points.frontPocketFacingOut
          : points.frontPocketFacingBottom
      )
      .close()

    if (complete) {
      //grainline & notches
      if (options.frontPocketOpeningStyle == 'slanted') {
        points.grainlineFrom = points.frontPocketOpeningOut.shiftFractionTowards(
          points.frontPocketOpeningWaist,
          0.25
        )
        points.grainlineTo = utils.beamsIntersect(
          points.grainlineFrom,
          points.grainlineFrom.shift(points.waistIn.angle(points.waistOut) + 90, 1),
          points.frontPocketFacingOut,
          points.frontPocketFacingWaist
        )
        points.title = points.frontPocketOpeningWaist.shift(
          points.waistIn.angle(points.waistOut) + 90,
          points.frontPocketOpeningWaist.dist(points.frontPocketFacingWaist) * 0.5
        )
        snippets.frontPocketOpeningOut = new Snippet('notch', points.frontPocketOpeningOut)
      } else {
        points.title = points.waistOut
          .shiftFractionTowards(points.frontPocketFacingWaist, 0.25)
          .shift(
            points.waistIn.angle(points.waistOut) + 90,
            points.waistOut.dist(points.frontPocketFacingWaist)
          )
        macro('sprinkle', {
          snippet: 'notch',
          on: ['frontPocketOpeningTopOut', 'frontPocketOpeningBottomOut'],
        })
      }
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      macro('title', {
        at: points.title,
        nr: 5,
        title: 'Front Pocket Facing',
        cutNr: options.frontPocketOpeningStyle == 'inseam' ? 4 : 2,
        scale: 0.25,
        rotation: 90 - points.frontPocketBottomMid.angle(points.frontPocketWaist),
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saFrontPocketFacingOut = utils.beamsIntersect(
          points.frontPocketFacingOut
            .shiftTowards(points.frontPocketFacingWaist, sa)
            .rotate(-90, points.frontPocketFacingOut),
          points.frontPocketFacingWaist
            .shiftTowards(points.frontPocketFacingOut, sa)
            .rotate(90, points.frontPocketFacingWaist),
          paths.outSeam.offset(sideSeamSa).shiftFractionAlong(0.995),
          paths.outSeam.offset(sideSeamSa).end()
        )

        points.saFrontPocketFacingBottom = points.frontPocketFacingBottom
          .shift(points.waistOut.angle(points.waistIn), sa)
          .shift(
            points.waistOut.angle(points.waistIn) - 90,
            sa * options.frontPocketBagSaWidth * 100
          )

        if (options.frontPocketOpeningStyle == 'slanted') {
          points.saFrontPocketFacingWaist = utils.beamsIntersect(
            points.saFrontPocketFacingOut,
            points.saFrontPocketFacingOut.shift(
              points.frontPocketFacingOut.angle(points.frontPocketFacingWaist),
              1
            ),
            points.saWaistOut,
            points.saWaistIn
          )
        } else {
          points.saFrontPocketFacingWaist = points.frontPocketFacingWaist
            .shift(points.waistOut.angle(points.waistIn), sa)
            .shift(points.waistOut.angle(points.waistIn) + 90, sa)
        }

        paths.sa = new Path()
          .move(
            options.frontPocketOpeningStyle == 'slanted'
              ? points.saFrontPocketFacingOut
              : points.saFrontPocketFacingBottom
          )
          .line(points.saFrontPocketFacingWaist)
          .line(
            options.frontPocketOpeningStyle == 'slanted'
              ? points.saFrontPocketOpeningWaist
              : points.saWaistOut
          )
          .line(
            options.frontPocketOpeningStyle == 'slanted'
              ? points.saFrontPocketOpeningOut
              : paths.outSeam.offset(sideSeamSa).start()
          )
          .join(paths.outSeam.offset(sideSeamSa))
          .line(
            options.frontPocketOpeningStyle == 'slanted'
              ? points.saFrontPocketFacingOut
              : points.saFrontPocketOut
          )
          .line(
            options.frontPocketOpeningStyle == 'slanted'
              ? points.saFrontPocketFacingOut
              : points.saFrontPocketFacingBottom
          )
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
