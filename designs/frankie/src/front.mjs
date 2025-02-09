import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'frankie.front',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Construction
    crotchSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    measurements,
    paperless,
    macro,
    utils,
    part,
    snippets,
  }) => {
    //measures
    const outSeamRotAngle = store.get('frontOutSeamRotAngle')
    //leg's begin
    //guide for when tweaking. Please DO NOT remove.
    /*
paths.pivot = new Path()
.move(points.pivotOut)
.line(points.pivotIn)

paths.pivotSplit0 = new Path()
.move(points.floorSplit0)
.line(points.pivotSplit0)
*/

    for (let i = 1; i <= 2; i++) {
      points['pivotSplit' + i] = points.pivotOut.shiftFractionTowards(points.pivotIn, (i + 1) / 4)
      points['floorSplit' + i] = new Point(points['pivotSplit' + i].x, points.floor.y)

      //guide for when tweaking. Please DO NOT remove.
      /*
paths['split' + i] = new Path()
.move(points['floorSplit' + i])
.line(points['pivotSplit' + i])
*/
    }
    //outseam rotate
    const rotOut0 = ['pivotSplit0', 'pivotSplit1', 'floorSplit0', 'floorSplit1']
    for (const p of rotOut0)
      points[p + 'ROut'] = points[p].rotate(-outSeamRotAngle, points.pivotOut)

    //guide for when tweaking. Please DO NOT remove.
    /*
    paths.segmentOut0 = paths.outSeamR
    .clone()
    .line(points.floorSplit0ROut)
    .line(points.pivotSplit0ROut)
    .line(points.pivotOut)
    .unhide()
 */
    const rotOut1 = ['pivotSplit1ROut', 'floorSplit0ROut', 'floorSplit1ROut']
    for (const p of rotOut1) {
      points[p + 'Initial'] = points[p]
      points[p] = points[p].rotate((outSeamRotAngle * 2) / 3, points.pivotSplit0ROut)
    }

    //guide for when tweaking. Please DO NOT remove.
    /*
    paths.segmentOut1 = new Path()
    .move(points.pivotSplit0ROut)
    .line(points.floorSplit0ROut)
    .line(points.floorSplit1ROut)
    .line(points.pivotSplit1ROut)
    .line(points.pivotSplit0ROut)
    */

    //inseam rotation
    const inseamRotAngle = options.legFlare * (1 / options.legFlareBalance)
    paths.inseamInitial = new Path()
      .move(points.floorIn)
      .curve(points.kneeInCp2, points.forkCp1, points.fork)
      .hide()

    const rotIn0 = ['floorIn', 'pivotSplit2', 'pivotSplit1', 'floorSplit2', 'floorSplit1']
    for (const p of rotIn0) points[p + 'RIn'] = points[p].rotate(inseamRotAngle, points.pivotIn)

    paths.inseamR = paths.inseamInitial
      .rotate(inseamRotAngle, points.pivotIn)
      .split(points.pivotIn)[0]
      .hide()

    //guide for when tweaking. Please DO NOT remove.
    /*
      paths.segmentIn0 = paths.inseamR
      .clone()
      .line(points.pivotSplit2RIn)
      .line(points.floorSplit2RIn)
      .line(points.floorInRIn)
      .unhide()
*/
    const rotIn1 = ['pivotSplit1RIn', 'floorSplit2RIn', 'floorSplit1RIn']
    for (const p of rotIn1) {
      points[p + 'Initial'] = points[p]
      points[p] = points[p].rotate((-inseamRotAngle * 2) / 3, points.pivotSplit2RIn)
    }

    //guide for when tweaking. Please DO NOT remove.
    /*
      paths.segmentIn1 = new Path()
      .move(points.pivotSplit1RIn)
      .line(points.floorSplit1RIn)
      .line(points.floorSplit2RIn)
      .line(points.pivotSplit2RIn)
      .line(points.pivotSplit1RIn)
      */
    //seam shaping
    points.splitIn = utils.curveIntersectsY(
      points.floorIn,
      points.kneeInCp2,
      points.forkCp1,
      points.fork,
      points.split.y
    )

    points.splitInR = paths.inseamR
      .reverse()
      .shiftAlong(paths.inseamInitial.split(points.pivotIn)[1].split(points.splitIn)[0].length())

    paths.inseamSplit = paths.inseamInitial.split(points.splitIn)[1].hide()
    paths.inseamRSplit = paths.inseamR.split(points.splitInR)[0].hide()

    points.splitInCpTarget = utils.beamsIntersect(
      paths.inseamSplit.shiftFractionAlong(0.05),
      points.splitIn,
      paths.inseamRSplit.shiftFractionAlong(0.99),
      points.splitInR
    )

    points.splitInCp1 = points.splitIn.shiftFractionTowards(
      points.splitInCpTarget,
      options.legCurve
    )
    points.splitInRCp2 = points.splitInR.shiftFractionTowards(
      points.splitInCpTarget,
      options.legCurve
    )

    //hem
    points.hemOrigin = utils.beamsIntersect(
      points.floorSplit2RInInitial,
      points.pivotSplit2RIn,
      points.floorSplit0ROutInitial,
      points.pivotSplit0ROut
    )

    const hemRadius =
      points.hemOrigin.dist(points.floorSplit0ROutInitial) <
      points.hemOrigin.dist(points.floorSplit2RInInitial)
        ? points.hemOrigin.dist(points.floorSplit0ROutInitial)
        : points.hemOrigin.dist(points.floorSplit2RInInitial)

    const hemAngle =
      points.hemOrigin.angle(points.floorSplit2RInInitial) -
      points.hemOrigin.angle(points.floorSplit0ROutInitial)

    const hemCpDistance = (4 / 3) * hemRadius * Math.tan(utils.deg2rad(hemAngle / 4))

    points.floorSplit0ROutInitialCp2 = points.floorSplit0ROutInitial.shift(
      points.floorSplit0ROutInitial.angle(points.hemOrigin) - 90,
      hemCpDistance
    )
    points.floorSplit2RInInitialCp1 = points.floorSplit2RInInitial.shift(
      points.floorSplit2RInInitial.angle(points.hemOrigin) + 90,
      hemCpDistance
    )
    //paths
    paths.hemBase = new Path()
      .move(points.floorOutROut)
      .line(points.floorSplit0ROutInitial)
      .curve(
        points.floorSplit0ROutInitialCp2,
        points.floorSplit2RInInitialCp1,
        points.floorSplit2RInInitial
      )
      .line(points.floorInRIn)
      .hide()

    paths.inseam = paths.inseamRSplit
      .curve(points.splitInRCp2, points.splitInCp1, points.splitIn)
      .join(paths.inseamSplit)
      .hide()

    paths.crossSeam = new Path()
      .move(points.fork)
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .hide()

    paths.waist = new Path().move(points.styleWaistIn).line(points.styleWaistOut).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.inseam)
      .join(paths.crossSeam)
      .join(paths.waist)
      .join(paths.outSeam)
      .close()
      .setClass('fabric')

    //fly
    const flyExtension = 10 //this is a seam allowance that has to be present so is hard coded

    return part
  },
}
