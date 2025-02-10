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
    //Constants
    cpFraction: 0.55191502449,
    //Plackets
    flyWidth: { pct: 4.4, min: 4, max: 6, menu: 'plackets' },
    flyFrontLength: { pct: 70.2, min: 70, max: 80, menu: 'plackets' },
    //Construction
    crotchSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
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
    absoluteOptions,
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

    points.floorOutROut = points.floorOut.rotate(-outSeamRotAngle, points.pivotOut)

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
    const frontPocketOpeningDepth = store.get('frontPocketOpeningDepth')

    points.frontPocketOpeningTop = paths.outSeam.shiftAlong(frontPocketOpeningDepth)
    points.frontPocketOpeningBottom = paths.outSeam.shiftAlong(
      frontPocketOpeningDepth + store.get('frontPocketOpeningLength')
    )

    //fly
    paths.crotchSeam = new Path()
      .move(points.fork)
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .hide()

    const flyExtension = (1 - options.flyWidth) * 8
    const flyLength =
      (measurements.crossSeamFront - measurements.waistToHips) * options.flyFrontLength
    const flyWidth = measurements.waist * options.flyWidth

    points.flyCrotch = paths.crotchSeam
      .reverse()
      .shiftAlong(
        measurements.waistToHips * options.waistHeight + flyLength - absoluteOptions.waistbandWidth
      )

    points.flyCrotchEx = paths.crotchSeam.intersectsBeam(
      points.flyCrotch.shift(points.styleWaistIn.angle(points.crotchSeamCurveStart), flyExtension),
      points.flyCrotch
        .shift(points.styleWaistIn.angle(points.crotchSeamCurveStart), flyExtension)
        .shift(points.styleWaistIn.angle(points.crotchSeamCurveStart) + 90, 1)
    )[0]

    points.flyCrotchExSplit = paths.crotchSeam
      .offset(flyExtension)
      .intersectsBeam(
        points.flyCrotchEx,
        points.flyCrotchEx.shift(points.styleWaistIn.angle(points.crotchSeamCurveStart) + 90, 1)
      )[0]

    paths.flyCrotchEx = paths.crotchSeam
      .offset(flyExtension)
      .split(points.flyCrotchExSplit)[1]
      .hide()

    const flyWaistSplit = paths.crotchSeam
      .offset(flyExtension)
      .intersectsBeam(points.styleWaistOut, points.styleWaistIn)[0]
    if (flyWaistSplit) {
      points.flyWaistSplit = flyWaistSplit
      paths.flyCrotchEx.split(points.flyWaistSplit)[0]
    } else {
      points.flyWaistSplit = beamsIntersect(
        points.styleWaistIn
          .shiftTowards(points.crotchSeamCurveStart, flyExtension)
          .rotate(90, points.styleWaistIn),
        points.crotchSeamCurveStart
          .shiftTowards(points.styleWaistIn, flyExtension)
          .rotate(-90, points.crotchSeamCurveStart),
        points.styleWaistOut,
        points.styleWaistIn
      )
      paths.flyCrotchEx.line(points.flyWaistSplit)
    }

    points.flyWaist = points.styleWaistIn.shiftTowards(points.styleWaistOut, flyWidth)
    points.flyCurveEnd = utils.beamsIntersect(
      points.styleWaistIn,
      points.crotchSeamCurveStart,
      points.flyCrotch,
      points.flyCrotch.shift(points.styleWaistIn.angle(points.crotchSeamCurveStart) - 90, 1)
    )
    points.flyCpTarget = utils.beamsIntersect(
      points.flyWaist,
      points.flyWaist.shift(points.styleWaistIn.angle(points.crotchSeamCurveStart), 1),
      points.flyCrotch,
      points.flyCrotch.shift(points.styleWaistIn.angle(points.crotchSeamCurveStart) - 90, 1)
    )
    points.flyCurveStart = points.flyCurveEnd.rotate(90, points.flyCpTarget)
    points.flyCurveStartCp2 = points.flyCurveStart.shiftFractionTowards(
      points.flyCpTarget,
      options.cpFraction
    )
    points.flyCurveEndCp1 = points.flyCurveEnd.shiftFractionTowards(
      points.flyCpTarget,
      options.cpFraction
    )
    //stores
    store.set('flyWidth', flyWidth)
    store.set('frontOutSeamRotAngle', outSeamRotAngle)

    return part
  },
}
