import { frontPocketFacing } from './frontPocketFacing.mjs'

export const coinPocket = {
  name: 'jackson.coinPocket',
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
    if (!options.frontPocketsBool || !options.coinPocketsBool) {
      part.render = false
      return part
    }
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from previous
    macro('title', false)
    //lets begin
    points.coinPocketBottomOut = utils.lineIntersectsCurve(
      points.coinPocketOut,
      points.coinPocketOut.shift(
        points.coinPocketIn.angle(points.coinPocketOut) + 90,
        measurements.waistToFloor
      ),
      points.frontPocketFacingOutSeam,
      points.frontPocketFacingCp1,
      points.frontPocketFacingCp2,
      points.frontPocketFacingWaist
    )
    points.coinPocketBottomIn = utils.lineIntersectsCurve(
      points.coinPocketIn,
      points.coinPocketIn.shift(
        points.coinPocketIn.angle(points.coinPocketOut) + 90,
        measurements.waistToFloor
      ),
      points.frontPocketFacingOutSeam,
      points.frontPocketFacingCp1,
      points.frontPocketFacingCp2,
      points.frontPocketFacingWaist
    )

    //paths
    paths.bottomCurve = new Path()
      .move(points.frontPocketFacingOutSeam)
      .curve(
        points.frontPocketFacingCp1,
        points.frontPocketFacingCp2,
        points.frontPocketFacingWaist
      )
      .hide()

    let bottomCurveSplit0 = paths.bottomCurve.split(points.coinPocketBottomIn)
    for (let i in bottomCurveSplit0) {
      paths['bottomCurve0' + i] = bottomCurveSplit0[i].hide()
    }

    let bottomCurveSplit1 = paths.bottomCurve00.split(points.coinPocketBottomOut)
    for (let i in bottomCurveSplit1) {
      paths['bottomCurve1' + i] = bottomCurveSplit1[i].hide()
    }

    paths.saTop = new Path().move(points.coinPocketIn).line(points.coinPocketOut).hide()

    paths.saRight = new Path().move(points.coinPocketBottomIn).line(points.coinPocketIn).hide()

    paths.saLeft = new Path().move(points.coinPocketOut).line(points.coinPocketBottomOut).hide()

    paths.seam = paths.bottomCurve11
      .clone()
      .join(paths.saRight)
      .join(paths.saTop)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.coinPocketOut.shiftFractionTowards(points.coinPocketIn, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.coinPocketBottomOut.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.coinPocketOut
        .shiftFractionTowards(points.coinPocketIn, 0.5)
        .shift(-90, points.coinPocketOut.dist(points.coinPocketBottomOut) / 2)
      macro('title', {
        nr: 4,
        title: 'Coin Pocket',
        at: points.title,
        scale: 1 / 3,
      })

      if (sa) {
        paths.sa = paths.bottomCurve11
          .clone()
          .offset(sa * 0.5)
          .join(paths.saRight.offset(sa))
          .join(paths.saTop.offset(sa * 2))
          .join(paths.saLeft.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
