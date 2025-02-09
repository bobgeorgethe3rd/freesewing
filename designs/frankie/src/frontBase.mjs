import { back } from './back.mjs'
import { front as frontTitan } from '@freesewing/titan'

export const frontBase = {
  name: 'frankie.frontBase',
  from: frontTitan,
  after: back,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketOpeningDepth: { pct: 4.9, min: 3, max: 6, menu: 'pockets.frontPockets' },
    frontPocketOpeningLength: { pct: 11.3, min: 10, max: 15, menu: 'pockets.frontPockets' },
  },
  draft: ({
    store,
    Point,
    points,
    Path,
    paths,
    options,
    measurements,
    macro,
    utils,
    part,
    snippets,
  }) => {
    //delete inherited paths
    const keepPaths = ['seam']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.titanGuide) {
      paths.titanGuide = paths.seam.setClass('various lashed')
    }
    delete paths.seam
    //macro & snippet removal
    macro('rmGrainline')
    macro('rmTitle')
    for (let i in snippets) delete snippets[i]
    //draw method
    const waistOut = points.styleWaistOut || points.waistOut
    const drawOutseam = () => {
      if (points.waistOut.x < points.seatOut.x)
        return new Path().move(waistOut).curve(points.seatOut, points.kneeOutCp1, points.floorOut)
      else
        return new Path()
          .move(waistOut)
          ._curve(points.seatOutCp1, points.seatOut)
          .curve(points.seatOutCp2, points.kneeOutCp1, points.floorOut)
    }
    //let's begin
    points.forkAnchor = new Point(points.knee.x, points.fork.y)
    points.pivot = points.forkAnchor.shiftFractionTowards(points.knee, 0.5)
    points.pivotIn = utils.curveIntersectsY(
      points.floorIn,
      points.kneeInCp2,
      points.forkCp1,
      points.fork,
      points.pivot.y
    )
    if (points.waistOut.x < points.seatOut.x) {
      points.pivotOut = utils.curveIntersectsY(
        waistOut,
        points.seatOut,
        points.kneeOutCp1,
        points.floorOut,
        points.pivot.y
      )
    } else {
      points.pivotOut = utils.curveIntersectsY(
        points.seatOut,
        points.seatOutCp2,
        points.kneeOutCp1,
        points.floorOut,
        points.pivot.y
      )
    }

    points.pivotSplit0 = points.pivotOut.shiftFractionTowards(points.pivotIn, 0.25)
    points.floorSplit0 = new Point(points.pivotSplit0.x, points.floor.y)

    //outseam rotation
    const outSeamRotAngle = options.legFlare * options.legFlareBalance

    points.floorOutR = points.floorOut.rotate(-outSeamRotAngle, points.pivotOut)

    paths.outSeamR = drawOutseam()
      .rotate(-outSeamRotAngle, points.pivotOut)
      .split(points.pivotOut)[1]
      .hide()

    //seam shaping
    points.split = points.forkAnchor.shiftFractionTowards(points.pivot, options.legFlareSplit)

    if (points.waistOut.x < points.seatOut.x) {
      points.splitOut = utils.curveIntersectsY(
        waistOut,
        points.seatOut,
        points.kneeOutCp1,
        points.floorOut,
        points.split.y
      )
    } else {
      points.splitOut = utils.curveIntersectsY(
        points.seatOut,
        points.seatOutCp2,
        points.kneeOutCp1,
        points.floorOut,
        points.split.y
      )
    }

    points.splitOutR = paths.outSeamR.shiftAlong(
      drawOutseam().split(points.pivotOut)[0].split(points.splitOut)[1].length()
    )

    paths.outSeamSplit = drawOutseam().split(points.splitOut)[0].hide()
    paths.outSeamRSplit = paths.outSeamR.split(points.splitOutR)[1].hide()

    points.splitOutCpTarget = utils.beamsIntersect(
      paths.outSeamRSplit.shiftFractionAlong(0.01),
      points.splitOutR,
      points.splitOut,
      paths.outSeamSplit.shiftFractionAlong(0.99)
    )

    points.splitOutRCp1 = points.splitOutR.shiftFractionTowards(
      points.splitOutCpTarget,
      options.legCurve
    )
    points.splitOutCp2 = points.splitOut.shiftFractionTowards(
      points.splitOutCpTarget,
      options.legCurve
    )

    paths.outSeam = paths.outSeamSplit
      .curve(points.splitOutCp2, points.splitOutRCp1, points.splitOutR)
      .join(paths.outSeamRSplit)
      .hide()

    //pocket
    const frontPocketOpeningDepth = measurements.waistToFloor * options.frontPocketOpeningDepth
    const frontPocketOpeningLength = measurements.waistToFloor * options.frontPocketOpeningLength

    points.frontPocketOpeningTop = paths.outSeam.shiftAlong(frontPocketOpeningDepth)
    points.frontPocketOpeningBottom = paths.outSeam.shiftAlong(
      frontPocketOpeningDepth + frontPocketOpeningLength
    )

    store.set('frontPocketOpeningDepth', frontPocketOpeningDepth)
    store.set('frontPocketOpeningLength', frontPocketOpeningLength)

    return part
  },
}
