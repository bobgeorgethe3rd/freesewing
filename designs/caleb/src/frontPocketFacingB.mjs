import { frontPocketFacing } from './frontPocketFacing.mjs'

export const frontPocketFacingB = {
  name: 'caleb.frontPocketFacingB',
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
    //set render
    if (!options.frontPocketsBool || options.frontPocketOpeningStyle != 'slanted') {
      part.hide()
      return part
    }
    //remove paths
    const keepPaths = ['daltonGuide', 'bottomCurve', 'saBottom']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //macro
    macro('title', false)
    //draw paths
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
    //let's begin
    //paths
    paths.seam = paths.bottomCurve
      .split(points.frontPocketFacingBottom)[0]
      .line(points.frontPocketFacingWaist)
      .line(points.frontPocketOpeningWaist)
      .line(points.frontPocketOpeningCorner)
      .line(points.frontPocketOpeningOut)
      .join(drawOutseam().split(points.frontPocketOut)[0].split(points.frontPocketOpeningOut)[1])
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.frontPocketOut.shiftFractionTowards(points.frontPocketOutCp2, 0.5)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.frontPocketOpeningOut.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontPocketOpeningCorner', 'frontPocketOut'],
      })
      //title
      macro('title', {
        at: points.title,
        nr: '4b',
        title: 'Front Pocket Facing B',
        scale: 1 / 3,
        rotation: 90 - points.frontPocketBottomMid.angle(points.frontPocketWaist),
      })
      if (sa) {
        paths.sa = paths.saBottom
          .split(points.saFrontPocketFacingBottom)[0]
          .line(points.saFrontPocketFacingWaist)
          .line(points.saFrontPocketOpeningWaist)
          .line(points.saFrontPocketOpeningCorner)
          .line(points.saFrontPocketOpeningOut)
          .join(
            drawOutseam()
              .split(points.frontPocketOut)[0]
              .split(points.frontPocketOpeningOut)[1]
              .offset(sa * options.sideSeamSaWidth * 100)
          )
          .line(points.saFrontPocketOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
