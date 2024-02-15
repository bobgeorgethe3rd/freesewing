import { frontBase } from './frontBase.mjs'

export const frontPocketFacing = {
  name: 'jackson.frontPocketFacing',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketFacingWidth: { pct: 71.4, min: 50, max: 75, menu: 'pockets.frontPockets' },
    coinPocketsBool: { pct: true, menu: 'pockets' },
    coinPocketWidth: { pct: 53.6, min: 50, max: 60, menu: 'pockets.coinPockets' },
    coinPocketHorizontal: { pct: 14.3, min: 14, max: 15, menu: 'pockets.coinPockets' },
    coinPocketVertical: { pct: 13.3, min: 13, max: 14, menu: 'pockets.coinPockets' },
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
      part.render = false
      return part
    }
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //measures
    const frontPocketFacingDepth =
      store.get('frontPocketOpeningDepth') +
      points.frontPocketOpeningWaist.dist(points.frontPocketWaist) * options.frontPocketFacingWidth
    //draw guides
    const drawOutseam = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      if (options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            .line(points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            .line(points.floorOut)
      }
      if (options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path()
            .move(waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
      }
      if (!options.fitKnee & !options.fitFloor) {
        if (points.waistOut.x < points.seatOut.x)
          return new Path().move(waistOut).curve(points.seatOut, points.kneeOutCp1, points.floorOut)
        else
          return new Path()
            .move(waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.floorOut)
      }
    }

    //lets begin
    points.frontPocketFacingOutSeam = drawOutseam().shiftAlong(frontPocketFacingDepth)
    points.frontPocketFacingCp1 = utils.beamsIntersect(
      points.frontPocketFacingOutSeam,
      points.frontPocketFacingOutSeam.shift(points.styleWaistOut.angle(points.styleWaistIn), 1),
      points.frontPocketOpeningCp2,
      points.frontPocketOpeningCp2.shift(points.styleWaistIn.angle(points.styleWaistOut) + 90, 1)
    )
    // points.frontPocketFacingCp1 = points.frontPocketOpeningCp2.rotate(-90, points.frontPocketFacingCp1Anchor)
    const frontPocketFacingWidth = points.frontPocketOpeningCp2.dist(points.frontPocketFacingCp1)
    points.frontPocketFacingWaist = points.frontPocketOpeningWaist.shiftTowards(
      points.frontPocketWaist,
      frontPocketFacingWidth
    )
    points.frontPocketFacingCp2 = points.frontPocketFacingWaist
      .shiftTowards(
        points.styleWaistOut,
        points.frontPocketOpeningWaist.dist(points.frontPocketOpeningCp1) + frontPocketFacingWidth
      )
      .rotate(90, points.frontPocketFacingWaist)

    //paths
    paths.outSeam = drawOutseam().split(points.frontPocketFacingOutSeam)[0].hide()

    paths.saBase = new Path()
      .move(points.frontPocketFacingOutSeam)
      .curve(
        points.frontPocketFacingCp1,
        points.frontPocketFacingCp2,
        points.frontPocketFacingWaist
      )
      .hide()

    paths.waist = new Path().move(points.frontPocketFacingWaist).line(points.styleWaistOut).hide()

    paths.seam = paths.saBase.clone().join(paths.waist).join(paths.outSeam)

    //coin pockets
    if (options.coinPocketsBool) {
      const coinPocketWidth =
        points.styleWaistOut.dist(points.frontPocketFacingWaist) * options.coinPocketWidth
      points.coinPocketOut = points.styleWaistOut
        .shiftFractionTowards(points.frontPocketFacingWaist, options.coinPocketHorizontal)
        .shift(
          points.styleWaistOut.angle(points.frontPocketFacingOutSeam),
          paths.outSeam.length() * options.coinPocketVertical
        )
      points.coinPocketIn = points.coinPocketOut.shift(
        points.styleWaistOut.angle(points.frontPocketFacingOutSeam) + 90,
        coinPocketWidth
      )
    }

    if (complete) {
      //guides
      paths.frontPocketOpeningGuide = new Path()
        .move(points.frontPocketOpeningOut)
        .curve(
          points.frontPocketOpeningCp2,
          points.frontPocketOpeningCp1,
          points.frontPocketOpeningWaist
        )
        .attr('class', 'interfacing lashed')
      //grainlineTo
      points.grainlineTo = points.frontPocketFacingOutSeam.shiftFractionTowards(
        points.frontPocketFacingCp1,
        0.1
      )
      points.grainlineFrom = new Point(points.grainlineTo.x, points.styleWaistOut.y * 1.1)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      if (options.coinPocketsBool) {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['coinPocketIn', 'coinPocketOut'],
        })
        paths.coinPocketLine = new Path()
          .move(points.coinPocketOut)
          .line(points.coinPocketIn)
          .attr('class', 'various')
          .attr('data-text', 'Coin Pocket - Line')
      }
      snippets.frontPocketOpeningOut = new Snippet('notch', points.frontPocketOpeningOut)
      //title
      points.title = new Point(
        points.frontPocketFacingOutSeam.x * 7,
        points.frontPocketOpeningOut.y * 0.87
      )
      macro('title', {
        nr: 5,
        title: 'Front Pocket Facing',
        at: points.title,
        scale: 1 / 3,
      })
      if (sa) {
        paths.sa = paths.saBase
          .clone()
          .offset(sa * 0.5)
          .join(paths.waist.offset(sa))
          .join(paths.outSeam.offset(sa * options.outSeamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
