import { backBase } from './backBase.mjs'

export const back = {
  name: 'jackson.back',
  from: backBase,
  hide: {
    from: true,
  },
  options: {
    //Style
    yoke: { bool: true, menu: 'style' },
    //Pockets
    backPocketsBool: { bool: true, menu: 'pockets' },
    backPocketBalance: { pct: 45.9, min: 40, max: 70, menu: 'pockets.backPockets' },
    // backPocketPlacement: {pct: 3, min: 2.5, max: 5, menu:'pockets.backPockets'},
    backPocketPlacement: { pct: 73.5, min: 70, max: 100, menu: 'pockets.backPockets' }, //altered for Jackson
    patchPocketWidth: { pct: 20.8, min: 15, max: 22.5, menu: 'pockets.backPockets' }, //20.8 //altered for Jackson
    patchPocketDepth: { pct: 11.9, min: 8, max: 15, menu: 'pockets.backPockets' }, //11 //altered for Jackson
    patchPocketBottomWidth: { pct: 82.4, min: 80, max: 100, menu: 'pockets.backPockets' }, //altered for Jackson
    patchPocketPeak: { pct: 49.2, min: 0, max: 50, menu: 'pockets.backPockets' }, //altered for Jackson
    //remove sidePockets when making caleb, keeping for now.
    sidePocketsBool: { bool: false, menu: 'pockets' },
    sidePocketBalance: { pct: 50, min: 40, max: 70, menu: 'pockets.sidePockets' },
    sidePocketPlacement: { pct: 6, min: 0, max: 8, menu: 'pockets.sidePockets' },
    sidePocketWidth: { pct: 23.7, min: 20, max: 25, menu: 'pockets.sidePockets' }, //default of off 38
    sidePocketDepth: { pct: 29.2, min: 25, max: 30, menu: 'pockets.sidePockets' }, //default of off 38 //35 for higher back pocket
    //Construction
    hemWidth: { pct: 4, min: 1, max: 10, menu: 'construction' }, //altered for Jackson
    crossSeamSaWidth: { pct: 2, min: 1, max: 4, menu: 'construction' },
    inseamSaWidth: { pct: 2, min: 1, max: 4, menu: 'construction' },
    outSeamSaWidth: { pct: 1, min: 1, max: 4, menu: 'construction' },
    yokeSeamSaWidth: { pct: 2, min: 1, max: 4, menu: 'construction' },
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
    log,
    absoluteOptions,
  }) => {
    //removing paths and snippets not required from backBase
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //draw guide
    const drawOutseam = () => {
      let waistOut = points.styleWaistOut || points.waistOut
      if (options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
      if (options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
      if (!options.fitKnee && !options.fitFloor) {
        if (points.waistOut.x > points.seatOut.x)
          return new Path().move(points.floorOut).curve(points.kneeOutCp2, points.seatOut, waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, waistOut)
      }
    }

    const drawInseam = () => {
      if (options.fitKnee && !options.fitFloor) {
        return new Path()
          .move(points.fork)
          .curve(points.forkCp2, points.kneeInCp1, points.kneeIn)
          .line(points.floorIn)
      }
      if (options.fitFloor) {
        return new Path()
          .move(points.fork)
          .curve(points.forkCp2, points.kneeInCp1, points.kneeIn)
          ._curve(points.floorInCp1, points.floorIn)
      }
      if (!options.fitKnee && !options.fitFloor) {
        return new Path().move(points.fork).curve(points.forkCp2, points.kneeInCp1, points.floorIn)
      }
    }
    //measures
    // let backPocketPlacement = measurements.waistToFloor * options.backPocketPlacement
    const backPocketPlacement =
      points.dartTip.dist(points.dartSeat) * (1 - options.backPocketPlacement)
    const patchPocketDepth = measurements.waistToFloor * options.patchPocketDepth
    const patchPocketWidth = measurements.waist * options.patchPocketWidth
    const patchPocketBottomWidth = patchPocketWidth * options.patchPocketBottomWidth
    const backPocketPeak = patchPocketBottomWidth * options.patchPocketPeak * 0.5
    const sidePocketPlacement =
      drawOutseam().length() -
      measurements.waistToKnee * (1 - options.sidePocketPlacement) +
      measurements.waistToHips * (1 - options.waistHeight) +
      absoluteOptions.waistbandWidth
    const sidePocketWidth = measurements.waist * options.sidePocketWidth
    const sidePocketDepth = measurements.waistToKnee * options.sidePocketDepth
    //lets begin
    paths.crossSeam = new Path()
      .move(points.styleWaistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .hide()

    if (options.yoke) {
      paths.waist = new Path().move(points.yokeOut).line(points.yokeIn).hide()

      paths.outSeam = drawOutseam().split(points.yokeOut)[0].hide()

      paths.crossSeam = paths.crossSeam.split(points.yokeIn)[1].hide()
    } else {
      paths.waist = new Path()
        .move(points.styleWaistOut)
        .line(points.dartOut)
        .line(points.dartTip)
        .line(points.dartIn)
        .line(points.styleWaistIn)
        .hide()

      paths.outSeam = drawOutseam().hide()
    }

    //paths
    paths.hemBase = new Path().move(points.floorIn).line(points.floorOut).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.outSeam)
      .join(paths.waist)
      .join(paths.crossSeam)
      .join(drawInseam())
      .close()

    //stores
    store.set('patchPocketWidth', patchPocketWidth)
    store.set('patchPocketDepth', patchPocketDepth)
    store.set('sidePocketWidth', sidePocketWidth)
    store.set('sidePocketDepth', sidePocketDepth)
    store.set('sidePocketPlacement', sidePocketPlacement)
    if (complete) {
      //grainline
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      if (points.yokeInTarget.y < points.crossSeamCurveStart.y) {
        snippets.crossSeamCurveStart = new Snippet('bnotch', points.crossSeamCurveStart)
      }
      //title
      macro('title', {
        nr: 1,
        title: 'back',
        at: points.title,
      })
      //scalebox
      macro('scalebox', { at: points.scalebox })
      //logo
      macro('logorg', {
        at: points.logo,
        scale: 0.75,
      })
      //fitGuides
      if (options.fitGuides) {
        if (!options.yoke && points.hipsGuideOut) {
          paths.hipsGuide = new Path()
            .move(points.hipsGuideIn)
            .line(points.hipsGuideOut)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['hipsGuideIn', 'hipsGuideOut'],
          })
        }

        paths.seatGuide = new Path()
          .move(points.seatGuideIn)
          .line(points.seatGuideOut)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        paths.kneeGuide = new Path()
          .move(points.kneeGuideIn)
          .line(points.kneeGuideOut)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'right')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['seatGuideIn', 'seatGuideOut', 'kneeGuideIn', 'kneeGuideOut'],
        })
      }
      //backPocket
      if (options.backPocketsBool) {
        points.seatMid = points.styleSeatOut.shiftFractionTowards(points.styleSeatIn, 0.5)
        points.backPocketTopAnchor = points.seatMid
          .shiftTowards(points.seatOut, backPocketPlacement)
          .rotate(90, points.seatMid)
        points.backPocketTopIn = points.backPocketTopAnchor
          .shiftTowards(points.seatMid, patchPocketWidth * options.backPocketBalance)
          .rotate(-90, points.backPocketTopAnchor)
        points.backPocketTopOut = points.backPocketTopAnchor
          .shiftTowards(points.seatMid, patchPocketWidth * (1 - options.backPocketBalance))
          .rotate(90, points.backPocketTopAnchor)
        points.backPocketTopMid = points.backPocketTopIn.shiftFractionTowards(
          points.backPocketTopOut,
          0.5
        )
        points.backPocketBottomMid = points.backPocketTopMid
          .shiftTowards(points.backPocketTopIn, patchPocketDepth)
          .rotate(90, points.backPocketTopMid)
        points.backPocketBottomLeft = points.backPocketBottomMid
          .shiftTowards(points.backPocketTopMid, patchPocketBottomWidth / 2)
          .rotate(90, points.backPocketBottomMid)
        points.backPocketBottomRight = points.backPocketBottomLeft.rotate(
          180,
          points.backPocketBottomMid
        )
        points.patchPocketPeak = points.backPocketTopMid.shiftOutwards(
          points.backPocketBottomMid,
          backPocketPeak
        )
        paths.backPocket = new Path()
          .move(points.backPocketTopIn)
          .line(points.backPocketBottomLeft)
          .line(points.patchPocketPeak)
          .line(points.backPocketBottomRight)
          .line(points.backPocketTopOut)
          .attr('class', 'interfacing lashed')
          .attr('data-text', 'Back Pocket')
          .attr('data-text-class', 'right')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['backPocketTopIn', 'backPocketTopOut'],
        })
      }
      //sidePocket
      if (options.sidePocketsBool) {
        points.sidePocketBottomAnchor = drawOutseam().shiftAlong(sidePocketPlacement)
        points.sidePocketAngleAnchor = drawOutseam().shiftAlong(sidePocketPlacement * 1.001)
        points.sidePocketBottomLeft = points.sidePocketBottomAnchor
          .shiftTowards(points.sidePocketAngleAnchor, sidePocketWidth * options.sidePocketBalance)
          .rotate(90, points.sidePocketBottomAnchor)
        points.sidePocketTopLeft = points.sidePocketBottomLeft
          .shiftTowards(points.sidePocketBottomAnchor, sidePocketDepth)
          .rotate(90, points.sidePocketBottomLeft)
        paths.sidePocket = new Path()
          .move(points.sidePocketTopLeft)
          .line(points.sidePocketBottomLeft)
          .line(points.sidePocketBottomAnchor)
          .attr('class', 'interfacing lashed')
          .attr('data-text', 'Side Pocket')
          .attr('data-text-class', 'right')
      }
      if (sa) {
        let waistSa
        if (options.yoke) {
          waistSa = sa * options.yokeSeamSaWidth * 100
          paths.saWaist = paths.waist
        } else {
          paths.saWaist = new Path().move(points.styleWaistOut).line(points.styleWaistIn).hide()
          waistSa = sa
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(sa * options.hemWidth * 100)
          .join(paths.outSeam.offset(sa * options.outSeamSaWidth * 100))
          .join(paths.saWaist.offset(waistSa))
          .join(paths.crossSeam.offset(sa * options.crossSeamSaWidth * 100))
          .join(drawInseam().offset(sa * options.inseamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
