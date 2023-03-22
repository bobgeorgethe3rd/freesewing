import { frontBase } from './frontBase.mjs'

export const frontPocket = {
  name: 'jackson.frontPocket',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketWidth: { pct: 68.2, min: 65, max: 75, menu: 'pockets.frontPockets' },
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
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]

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
    points.frontPocketWaist = points.styleWaistOut.shiftFractionTowards(
      points.styleWaistIn,
      options.frontPocketWidth
    )
    let outSeamSplit0 = drawOutseam().split(points.frontPocketOutSeam)
    for (let i in outSeamSplit0) {
      paths['outSeam0' + i] = outSeamSplit0[i].hide()
    }

    let outSeamSplit1 = paths.outSeam00.split(points.frontPocketOpeningOut)
    for (let i in outSeamSplit1) {
      paths['outSeam1' + i] = outSeamSplit1[i].hide()
    }

    paths.test = new Path()
      .move(points.frontPocketWaist)
      .line(points.frontPocketOpeningWaist)
      .curve(
        points.frontPocketOpeningCp1,
        points.frontPocketOpeningCp2,
        points.frontPocketOpeningOut
      )
      .join(paths.outSeam11)

    return part
  },
}
