import { frontPocketBag } from './frontPocketBag.mjs'

export const frontPocketFacing = {
  name: 'caleb.frontPocketFacing',
  from: frontPocketBag,
  options: {
    //Pockets
    frontPocketFacingWidth: { pct: 25, min: 10, max: 50, menu: 'pockets.frontPockets' },
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
    if (!options.frontPocketsBool) {
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
        if (points.seatOutAnchor.x < points.seatOut.x)
          return new Path()
            .move(points.waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(points.waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
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
    //let's begin
    points.frontPocketFacingWaist = points.frontPocketOpeningWaist.shiftFractionTowards(
      points.frontPocketWaist,
      options.frontPocketFacingWidth
    )

    const frontPocketFacingBottomI = utils.lineIntersectsCurve(
      points.frontPocketFacingWaist,
      points.frontPocketFacingWaist.shift(
        points.frontPocketWaist.angle(points.frontPocketBottomMid),
        points.frontPocketWaist.dist(points.frontPocketBottomMid) * 10
      ),
      points.frontPocketOut,
      points.frontPocketOutCp2,
      points.frontPocketBottomCurveEndCp1,
      points.frontPocketBottomCurveEnd
    )
    if (frontPocketFacingBottomI) {
      points.frontPocketFacingBottom = frontPocketFacingBottomI
    } else {
      points.frontPocketFacingBottom = utils.beamsIntersect(
        points.frontPocketFacingWaist,
        points.waistOut.rotate(90, points.frontPocketFacingWaist),
        points.frontPocketBottomMid,
        points.frontPocketWaist.rotate(90, points.frontPocketBottomMid)
      )
    }
    //paths
    paths.seam = paths.bottomCurve
      .split(points.frontPocketFacingBottom)[0]
      .line(points.frontPocketFacingWaist)
      .line(points.waistOut)
      .join(drawOutseam().split(points.frontPocketOut)[0])
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.frontPocketOut.shiftFractionTowards(points.frontPocketOutCp2, 0.5)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.waistOut.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      if (options.frontPocketOpeningStyle == 'slanted') {
        snippets.frontPocketOpeningOut = new Snippet('notch', points.frontPocketOpeningOut)
      } else {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['frontPocketOpeningTopOut', 'frontPocketOpeningBottomOut'],
        })
      }
      snippets.frontPocketOut = new Snippet('notch', points.frontPocketOut)
      //title
      points.title = points.waistOut
        .shiftFractionTowards(points.frontPocketFacingWaist, 0.4)
        .shift(
          points.frontPocketWaist.angle(points.frontPocketBottomMid),
          points.frontPocketWaist.dist(points.frontPocketBottomMid) * 0.5
        )
      macro('title', {
        at: points.title,
        nr: 4,
        title: 'Front Pocket Facing',
        scale: 1 / 3,
        rotation: 90 - points.frontPocketBottomMid.angle(points.frontPocketWaist),
      })
      if (sa) {
        const saFrontPocketFacingBottomI = utils.lineIntersectsCurve(
          points.frontPocketFacingWaist.shift(points.waistOut.angle(points.waistIn), sa),
          points.frontPocketFacingWaist
            .shift(
              points.frontPocketWaist.angle(points.frontPocketBottomMid),
              points.frontPocketWaist.dist(points.frontPocketBottomMid) * 10
            )
            .shift(points.waistOut.angle(points.waistIn), sa),
          points.saFrontPocketOut,
          points.saFrontPocketOutCp2,
          points.saFrontPocketBottomCurveEndCp1,
          points.saFrontPocketBottomCurveEnd
        )
        if (saFrontPocketFacingBottomI) {
          points.saFrontPocketFacingBottom = saFrontPocketFacingBottomI
        } else {
          points.saFrontPocketFacingBottom = utils.beamsIntersect(
            points.frontPocketFacingWaist.shift(points.waistOut.angle(points.waistIn), sa),
            points.frontPocketFacingWaist
              .shift(points.waistOut.angle(points.waistIn), sa)
              .shift(points.waistOut.angle(points.waistIn) - 90, 1),
            points.saFrontPocketBottomMid,
            points.frontPocketWaist.rotate(90, points.saFrontPocketBottomMid)
          )
        }

        points.saFrontPocketFacingWaist = utils.beamsIntersect(
          points.saFrontPocketFacingBottom,
          points.saFrontPocketFacingBottom.shift(
            points.frontPocketBottomMid.angle(points.frontPocketWaist),
            1
          ),
          points.saWaistOut,
          points.mSaWaistOut
        )
        paths.sa = paths.saBottom
          .split(points.saFrontPocketFacingBottom)[0]
          .line(points.saFrontPocketFacingWaist)
          .line(points.saWaistOut)
          .join(
            drawOutseam()
              .split(points.frontPocketOut)[0]
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
