import { back as backTitan } from '@freesewing/titan'
import { pctBasedOn } from '@freesewing/core'

export const back = {
  name: 'frankie.back',
  from: backTitan,
  hide: {
    from: true,
  },
  options: {
    //Constants
    fitKnee: false, //Locked for Frankie
    kneeEase: 0.06, //Locked for Frankie
    //Fit
    waistEase: { pct: 2.7, min: 0, max: 20, menu: 'fit' }, //Altered for Frankie
    seatEase: { pct: 2.4, min: 0, max: 20, menu: 'fit' }, //Altered for Frankie
    titanGuide: { bool: false, menu: 'fit' },
    //Style
    waistbandWidth: {
      pct: 4.1,
      min: 1,
      max: 6,
      snap: 1.25,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Frankie
    legFlare: { deg: 15, min: 5, max: 30, menu: 'style' },
    legFlareBalance: { pct: 150, min: 50, max: 175, menu: 'style' },
    legFlareHeight: { pct: 50, min: 10, max: 100, menu: 'style' },
    legCurve: { pct: 66.7, min: 50, max: 100, menu: 'style' },
    legFlareSplit: { pct: 15, min: 10, max: 90, menu: 'style' },
    legFlareLock: { bool: true, menu: 'style' },
    //Pockets
    frontPocketsBool: { bool: true, menu: 'pockets' },
    frontPocketOpeningDepth: { pct: 4.9, min: 3, max: 6, menu: 'pockets.frontPockets' },
    frontPocketOpeningLength: { pct: 11.3, min: 10, max: 15, menu: 'pockets.frontPockets' },
    sidePocketsBool: { bool: true, menu: 'pockets' },
    sidePocketDepth: { pct: 20, min: 15, max: 30, menu: 'pockets.sidePockets' },
    sidePocketWidth: { pct: 75, min: 50, max: 100, menu: 'pockets.sidePockets' },
    sidePocketPlacement: { pct: 5, min: 3, max: 6, menu: 'pockets.sidePockets' },
    //Construction
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    crossSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    inseamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    hemWidth: { pct: 2, min: 0, max: 10, menu: 'construction' },
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
    complete,
    macro,
    utils,
    part,
    snippets,
    Snippet,
    log,
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
    macro('rmScalebox')
    for (let i in snippets) delete snippets[i]
    //draw methods
    const waistOut = points.styleWaistOut || points.waistOut
    const drawOutseam = () => {
      if (points.waistOut.x > points.seatOut.x)
        return new Path().move(points.floorOut).curve(points.kneeOutCp2, points.seatOut, waistOut)
      else
        return new Path()
          .move(points.floorOut)
          .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
          .curve_(points.seatOutCp2, waistOut)
    }
    //measures
    const frontPocketOpeningDepth = measurements.waistToFloor * options.frontPocketOpeningDepth
    const frontPocketOpeningLength = measurements.waistToFloor * options.frontPocketOpeningLength
    //let's begin
    points.forkAnchor = new Point(points.knee.x, points.fork.y)
    points.pivotOutAnchorMin = options.legFlareLock
      ? points.forkAnchor
      : new Point(points.knee.x, points.styleWaistOut.y)

    points.pivotInAnchor = points.forkAnchor.shiftFractionTowards(
      points.knee,
      options.legFlareHeight
    )
    points.pivotOutAnchor = points.pivotOutAnchorMin.shiftFractionTowards(
      points.knee,
      options.legFlareHeight
    )

    points.pivotIn = utils.curveIntersectsY(
      points.fork,
      points.forkCp2,
      points.kneeInCp1,
      points.floorIn,
      points.pivotInAnchor.y
    )
    /*
    if (points.waistOut.x > points.seatOut.x) {
      points.pivotOut = utils.curveIntersectsY(
        points.floorOut,
        points.kneeOutCp2,
        points.seatOut,
        waistOut,
        points.pivotOutAnchor.y
      )
    } else {
      points.pivotOut = utils.curveIntersectsY(
        points.floorOut,
        points.kneeOutCp2,
        points.seatOutCp1,
        points.seatOut,
        points.pivotOutAnchor.y
      )
    }
      */
    points.pivotOut = drawOutseam().intersectsY(points.pivotOutAnchor.y)[0]

    //guide for when tweaking. Please DO NOT remove.
    /*
paths.pivot = new Path()
.move(points.pivotIn)
.line(points.pivotOut)
*/
    for (let i = 0; i <= 2; i++) {
      points['pivotSplit' + i] = points.pivotIn.shiftFractionTowards(points.pivotOut, (i + 1) / 4)
      points['floorSplit' + i] = new Point(points['pivotSplit' + i].x, points.floor.y)

      //guide for when tweaking. Please DO NOT remove.
      /*
paths['split' + i] = new Path()
.move(points['floorSplit' + i])
.line(points['pivotSplit' + i])
*/
    }

    //inseam rotation
    const inseamRotAngle = options.legFlare * (1 / options.legFlareBalance)
    paths.inseamInitial = new Path()
      .move(points.fork)
      .curve(points.forkCp2, points.kneeInCp1, points.floorIn)
      .hide()

    const rotIn0 = ['floorIn', 'pivotSplit0', 'pivotSplit1', 'floorSplit0', 'floorSplit1']
    for (const p of rotIn0) points[p + 'RIn'] = points[p].rotate(-inseamRotAngle, points.pivotIn)

    paths.inseamR = paths.inseamInitial
      .rotate(-inseamRotAngle, points.pivotIn)
      .split(points.pivotIn)[1]
      .hide()

    //guide for when tweaking. Please DO NOT remove.

    /*
    paths.segmentIn0 = paths.inseamR
    .clone()
    .line(points.floorSplit0RIn)
    .line(points.pivotSplit0RIn)
    .line(points.pivotIn)
    .unhide()
    */

    const rotIn1 = ['pivotSplit1RIn', 'floorSplit0RIn', 'floorSplit1RIn']
    for (const p of rotIn1) {
      points[p + 'Initial'] = points[p]
      points[p] = points[p].rotate((inseamRotAngle * 2) / 3, points.pivotSplit0RIn)
    }

    //guide for when tweaking. Please DO NOT remove.

    /*
    paths.segmentIn1 = new Path()
    .move(points.pivotSplit0RIn)
    .line(points.floorSplit0RIn)
    .line(points.floorSplit1RIn)
    .line(points.pivotSplit1RIn)
    .line(points.pivotSplit0RIn)
    */

    //outseam rotation
    const outSeamRotAngle = options.legFlare * options.legFlareBalance
    const rotOut0 = ['floorOut', 'pivotSplit2', 'pivotSplit1', 'floorSplit2', 'floorSplit1']
    for (const p of rotOut0) points[p + 'ROut'] = points[p].rotate(outSeamRotAngle, points.pivotOut)

    paths.outSeamR = drawOutseam()
      .rotate(outSeamRotAngle, points.pivotOut)
      .split(points.pivotOut)[0]
      .hide()

    //guide for when tweaking. Please DO NOT remove.

    /*
      paths.segmentOut0 = paths.outSeamR
      .clone()
      .line(points.pivotSplit2ROut)
      .line(points.floorSplit2ROut)
      .line(points.floorOutROut)
      .unhide()
*/

    const rotOut1 = ['pivotSplit1ROut', 'floorSplit2ROut', 'floorSplit1ROut']
    for (const p of rotOut1) {
      points[p + 'Initial'] = points[p]
      points[p] = points[p].rotate((-outSeamRotAngle * 2) / 3, points.pivotSplit2ROut)
    }

    //guide for when tweaking. Please DO NOT remove.
    /*
      paths.segmentOut1 = new Path()
      .move(points.pivotSplit1ROut)
      .line(points.floorSplit1ROut)
      .line(points.floorSplit2ROut)
      .line(points.pivotSplit2ROut)
      .line(points.pivotSplit1ROut)
      */

    //seam shaping
    points.splitInAnchor = points.forkAnchor.shiftFractionTowards(
      points.pivotInAnchor,
      options.legFlareSplit
    )
    points.splitOutAnchor = points.pivotOutAnchorMin.shiftFractionTowards(
      points.pivotOutAnchor,
      options.legFlareSplit
    )

    points.splitIn = utils.curveIntersectsY(
      points.fork,
      points.forkCp2,
      points.kneeInCp1,
      points.floorIn,
      points.splitInAnchor.y
    )
    /*
    if (points.waistOut.x > points.seatOut.x) {
      points.splitOut = utils.curveIntersectsY(
        points.floorOut,
        points.kneeOutCp2,
        points.seatOut,
        waistOut,
        points.splitOutAnchor.y
      )
    } else {
      points.splitOut = utils.curveIntersectsY(
        points.floorOut,
        points.kneeOutCp2,
        points.seatOutCp1,
        points.seatOut,
        points.splitOutAnchor.y
      )
    }
      */
    points.splitOut = drawOutseam().intersectsY(points.splitOutAnchor.y)[0]

    points.splitInR = paths.inseamR.shiftAlong(
      paths.inseamInitial.split(points.pivotIn)[0].split(points.splitIn)[1].length()
    )

    paths.inseamSplit = paths.inseamInitial.split(points.splitIn)[0].hide()
    paths.inseamRSplit = paths.inseamR.split(points.splitInR)[1].hide()

    const splitInCpTarget = utils.beamsIntersect(
      paths.inseamSplit.reverse().shiftAlong(0.05),
      points.splitIn,
      paths.inseamRSplit.shiftAlong(0.05),
      points.splitInR
    )
    //ok so this was shiftFractionAlong but that kept breaking
    //also if the intersect fails there is a fail safe

    if (
      splitInCpTarget &&
      splitInCpTarget.y > points.splitIn.y &&
      splitInCpTarget.y < points.splitInR.y
    ) {
      points.splitInCpTarget = splitInCpTarget
    } else {
      points.splitInCpTarget = points.pivotIn
      log.warn('points.splitInCpTarget in back.mjs drafted with the back up method')
    }

    points.splitInCp2 = points.splitIn.shiftFractionTowards(
      points.splitInCpTarget,
      options.legCurve
    )
    points.splitInRCp1 = points.splitInR.shiftFractionTowards(
      points.splitInCpTarget,
      options.legCurve
    )

    points.splitOutR = paths.outSeamR
      .reverse()
      .shiftAlong(drawOutseam().split(points.pivotOut)[1].split(points.splitOut)[0].length())

    paths.outSeamSplit = drawOutseam().split(points.splitOut)[1].hide()
    paths.outSeamRSplit = paths.outSeamR.split(points.splitOutR)[0].hide()

    const splitOutCpTarget = utils.beamsIntersect(
      paths.outSeamRSplit.reverse().shiftAlong(0.05),
      points.splitOutR,
      points.splitOut,
      paths.outSeamSplit.shiftAlong(0.05)
    )

    if (
      splitOutCpTarget &&
      splitOutCpTarget.y > points.splitOut.y &&
      splitOutCpTarget.y < points.splitOutR.y
    ) {
      points.splitOutCpTarget = splitOutCpTarget
    } else {
      points.splitOutCpTarget = points.pivotOut
      log.warn('points.splitOutCpTarget in back.mjs drafted with the back up method')
    }

    //ok so this was shiftFractionAlong but that kept breaking
    //also if the intersect fails there is a fail safe

    points.splitOutRCp2 = points.splitOutR.shiftFractionTowards(
      points.splitOutCpTarget,
      options.legCurve
    )
    points.splitOutCp1 = points.splitOut.shiftFractionTowards(
      points.splitOutCpTarget,
      options.legCurve
    )

    //hem
    points.hemOrigin = utils.beamsIntersect(
      points.floorSplit0RInInitial,
      points.pivotSplit0RIn,
      points.floorSplit2ROutInitial,
      points.pivotSplit2ROut
    )

    const hemRadius =
      points.hemOrigin.dist(points.floorSplit0RInInitial) <
      points.hemOrigin.dist(points.floorSplit2ROutInitial)
        ? points.hemOrigin.dist(points.floorSplit0RInInitial)
        : points.hemOrigin.dist(points.floorSplit2ROutInitial)

    const hemAngle =
      points.hemOrigin.angle(points.floorSplit2ROutInitial) -
      points.hemOrigin.angle(points.floorSplit0RInInitial)

    const hemCpDistance = (4 / 3) * hemRadius * Math.tan(utils.deg2rad(hemAngle / 4))

    points.floorSplit0RInInitialCp2 = points.floorSplit0RInInitial.shift(
      points.floorSplit0RInInitial.angle(points.hemOrigin) - 90,
      hemCpDistance
    )
    points.floorSplit2ROutInitialCp1 = points.floorSplit2ROutInitial.shift(
      points.floorSplit2ROutInitial.angle(points.hemOrigin) + 90,
      hemCpDistance
    )
    //paths
    paths.hemBase = new Path()
      .move(points.floorInRIn)
      .line(points.floorSplit0RInInitial)
      .curve(
        points.floorSplit0RInInitialCp2,
        points.floorSplit2ROutInitialCp1,
        points.floorSplit2ROutInitial
      )
      .line(points.floorOutROut)
      .hide()

    paths.outSeam = paths.outSeamRSplit
      .curve(points.splitOutRCp2, points.splitOutCp1, points.splitOut)
      .join(paths.outSeamSplit)
      .hide()

    paths.waist = new Path().move(points.styleWaistOut).line(points.styleWaistIn).hide()

    paths.crossSeam = new Path()
      .move(points.styleWaistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .hide()

    paths.inseam = paths.inseamSplit
      .curve(points.splitInCp2, points.splitInRCp1, points.splitInR)
      .join(paths.inseamRSplit)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.outSeam)
      .join(paths.waist)
      .join(paths.crossSeam)
      .join(paths.inseam)
      .close()
      .setClass('fabric')

    if (sa) {
      paths.sa = paths.hemBase
        .offset(sa * options.hemWidth * 100)
        .join(paths.outSeam.offset(sa * options.sideSeamSaWidth * 100))
        .join(paths.waist.offset(sa))
        .join(paths.crossSeam.offset(sa * options.crossSeamSaWidth * 100))
        .join(paths.inseam.offset(sa * options.inseamSaWidth * 100))
        .close()
        .setClass('fabric sa')
    }

    //stores
    const sidePocketDepth =
      (paths.outSeam.length() - measurements.waistToHips) * options.sidePocketDepth
    const sidePocketWidth = sidePocketDepth * options.sidePocketWidth
    const sidePocketPlacement =
      frontPocketOpeningDepth * 2 +
      frontPocketOpeningLength +
      sidePocketDepth +
      measurements.waistToFloor * options.sidePocketPlacement
    store.set('sidePocketDepth', sidePocketDepth)
    store.set('sidePocketWidth', sidePocketWidth)
    store.set('sidePocketPlacement', sidePocketPlacement)
    store.set('frontPocketOpeningDepth', frontPocketOpeningDepth)
    store.set('frontPocketOpeningLength', frontPocketOpeningLength)
    store.set('waistBack', points.styleWaistIn.dist(points.styleWaistOut))

    //details
    //grainline
    points.grainlineFrom = points.styleWaistIn
    points.grainlineTo = new Point(points.grainlineFrom.x, points.floor.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
      grainline: true,
    })
    //notches
    if (options.frontPocketsBool) {
      points.frontPocketOpeningTop = paths.outSeam.reverse().shiftAlong(frontPocketOpeningDepth)
      points.frontPocketOpeningBottom = paths.outSeam
        .reverse()
        .shiftAlong(frontPocketOpeningDepth + frontPocketOpeningLength)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontPocketOpeningTop', 'frontPocketOpeningBottom'],
      })
    }
    snippets.crossSeamCurveStart = new Snippet('bnotch', points.crossSeamCurveStart)
    //cutlist
    store.cutlist.setCut({ cut: 2, from: 'fabric', identical: 'true' })
    //title
    points.title = new Point(
      (points.styleWaistIn.x + points.styleWaistOut.x) / 2,
      (points.styleWaistIn.y + points.pivotInAnchor.y) / 2
    )
    macro('title', {
      at: points.title,
      nr: 1,
      title: 'back',
      scale: 0.75,
    })
    //logo
    points.logo = new Point(points.title.x, points.pivotInAnchor.y)
    snippets.logo = new Snippet('logo', points.logo)
    //scalebox
    points.scalebox = new Point(points.title.x, (points.floor.y + points.pivotInAnchor.y) / 2)
    macro('scalebox', { at: points.scalebox })
    //side pockets
    if (options.sidePocketsBool) {
      points.sidePocketBottom = paths.outSeam.reverse().shiftAlong(sidePocketPlacement)
      points.sidePocketLeft = points.sidePocketBottom.shift(
        points.sidePocketBottom.angle(
          paths.outSeam.reverse().shiftAlong(sidePocketPlacement * 0.99)
        ) + 90,
        sidePocketWidth * 0.5
      )
      if (complete)
        paths.sidePocketLine = new Path()
          .move(points.sidePocketLeft)
          .line(points.sidePocketBottom)
          .setClass('fabric help')
          .setText('sidePocketLine', 'center')

      snippets.sidePocketLeft = new Snippet('notch', points.sidePocketLeft)
    }
    //paperless
    if (paperless) {
      points.bottomLeftAnchor = paths.seam.edge('bottomLeft')
      points.topRightAnchor = paths.seam.edge('topRight')
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: paths.hemBase.edge('bottom'),
        y: paths.hemBase.edge('bottom').y,
        id: 'hdIn0',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.floorInRIn,
        y: points.floorInRIn.y,
        id: 'hdIn1',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: paths.inseam.edge('right'),
        y: paths.inseam.edge('right').y,
        id: 'hdIn2',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.fork,
        y: points.fork.y,
        id: 'hdIn3',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.crossSeamCurveStart,
        y: points.crossSeamCurveStart.y,
        id: 'hdIn4',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.styleWaistIn,
        y: points.styleWaistIn.y,
        id: 'hdIn5',
      })
      if (points.styleWaistOut.y < points.styleWaistIn.y) {
        macro('hd', {
          from: points.bottomLeftAnchor,
          to: points.styleWaistOut,
          y: points.styleWaistOut.y,
          id: 'hdIn6',
        })
        macro('vd', {
          from: points.styleWaistIn,
          to: points.styleWaistOut,
          x: points.bottomLeftAnchor.x,
          id: 'vdIn5',
        })
      } else {
        macro('hd', {
          from: points.styleWaistIn,
          to: points.topRightAnchor,
          y: points.styleWaistIn.y,
          id: 'hdOut0',
        })
        macro('vd', {
          from: points.styleWaistOut,
          to: points.styleWaistIn,
          x: points.topRightAnchor.x,
          id: 'vdOut0',
        })
      }
      macro('hd', {
        from: points.styleWaistOut,
        to: points.topRightAnchor,
        y: points.styleWaistOut.y,
        id: 'hdOut1',
      })
      if (points.waistOut.x < points.seatOut.x) {
        macro('hd', {
          from: points.seatOut,
          to: points.topRightAnchor,
          y: points.seatOut.y,
          id: 'hdOut2',
        })
        macro('vd', {
          from: points.seatOut,
          to: points.styleWaistOut,
          x: points.topRightAnchor.x,
          id: 'vdOut1',
        })
        macro('vd', {
          from: paths.outSeam.edge('left'),
          to: points.seatOut,
          x: points.topRightAnchor.x,
          id: 'vdOut2',
        })
      } else {
        macro('vd', {
          from: paths.outSeam.edge('left'),
          to: points.styleWaistOut,
          x: points.topRightAnchor.x,
          id: 'vdOut3',
        })
      }
      macro('hd', {
        from: paths.outSeam.edge('left'),
        to: points.topRightAnchor,
        y: paths.outSeam.edge('left').y,
        id: 'hdOut3',
      })
      macro('hd', {
        from: points.floorOutROut,
        to: points.topRightAnchor,
        y: points.floorOutROut.y,
        id: 'hdOut4',
      })
      macro('hd', {
        from: paths.hemBase.edge('bottom'),
        to: points.topRightAnchor,
        y: paths.hemBase.edge('bottom').y,
        id: 'hdOut5',
      })
      macro('vd', {
        from: paths.hemBase.edge('bottom'),
        to: points.floorInRIn,
        x: points.bottomLeftAnchor.x,
        id: 'vdIn0',
      })
      macro('vd', {
        from: points.floorInRIn,
        to: paths.inseam.edge('right'),
        x: points.bottomLeftAnchor.x,
        id: 'vdIn1',
      })
      macro('vd', {
        from: paths.inseam.edge('right'),
        to: points.fork,
        x: points.bottomLeftAnchor.x,
        id: 'vdIn2',
      })
      macro('vd', {
        from: points.fork,
        to: points.crossSeamCurveStart,
        x: points.bottomLeftAnchor.x,
        id: 'vdIn3',
      })
      macro('vd', {
        from: points.crossSeamCurveStart,
        to: points.styleWaistIn,
        x: points.bottomLeftAnchor.x,
        id: 'vdIn4',
      })
      macro('vd', {
        from: points.floorOutROut,
        to: paths.outSeam.edge('left'),
        x: points.topRightAnchor.x,
        id: 'vdOut4',
      })
      macro('vd', {
        from: paths.hemBase.edge('bottom'),
        to: points.floorOutROut,
        x: points.topRightAnchor.x,
        id: 'vdOut5',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        y: points.bottomLeftAnchor.y + 15,
        id: 'hd0',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        y: points.topRightAnchor.y - 15,
        id: 'hd1',
      })
      macro('vd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        x: points.bottomLeftAnchor.x - 15,
        id: 'vd0',
      })
      macro('vd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        x: points.topRightAnchor.x + 15,
        id: 'vd1',
      })
    }

    return part
  },
}
