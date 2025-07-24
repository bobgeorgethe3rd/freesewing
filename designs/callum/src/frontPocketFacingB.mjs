import { frontPocketFacing } from './frontPocketFacing.mjs'

export const frontPocketFacingB = {
  name: 'callum.frontPocketFacingB',
  from: frontPocketFacing,
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
    if (!options.frontPocketsBool || options.frontPocketOpeningStyle == 'inseam') {
      part.hide()
      return part
    }
    //remove paths
    const keepPaths = ['daltonGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //paths
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.floorOutCp1, points.floorOut)
        }
      }
    }

    paths.outSeam = drawOutseam().split(points.frontPocketFacingOut)[0]

    paths.seam = paths.outSeam
      .clone()
      .line(points.frontPocketFacingWaist)
      .line(points.waistOut)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistOut.shiftFractionTowards(
        points.frontPocketFacingWaist,
        0.1
      )
      points.grainlineTo = utils.beamsIntersect(
        points.grainlineFrom,
        points.grainlineFrom.shift(points.waistIn.angle(points.waistOut) + 90, 1),
        points.frontPocketFacingOut,
        points.frontPocketFacingWaist
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.frontPocketOpeningOut = new Snippet('notch', points.frontPocketOpeningOut)
      //title
      macro('title', {
        at: points.title,
        nr: '5b',
        title: 'Front Pocket Facing B',
        cutNr: 2,
        scale: 0.25,
        rotation: 90 - points.frontPocketBottomMid.angle(points.frontPocketWaist),
      })
      if (sa) {
        paths.sa = paths.outSeam
          .clone()
          .offset(sa * options.sideSeamSaWidth * 100)
          .line(points.saFrontPocketFacingOut)
          .line(points.saFrontPocketFacingWaist)
          .line(points.saWaistOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
