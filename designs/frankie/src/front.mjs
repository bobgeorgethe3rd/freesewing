import { beamsIntersect, Snippet } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'frankie.front',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Plackets
    flyWidth: { pct: 4.4, min: 4, max: 6, menu: 'plackets' },
    flyFrontLength: { pct: 70.2, min: 70, max: 80, menu: 'plackets' },
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
    complete,
    macro,
    utils,
    part,
    absoluteOptions,
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

    paths.crotchSeam = new Path()
      .move(points.fork)
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .hide()

    paths.waist = new Path().move(points.styleWaistIn).line(points.styleWaistOut).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.inseam)
      .join(paths.crotchSeam)
      .join(paths.waist)
      .join(paths.outSeam)
      .close()
      .setClass('fabric')

    //fly
    const flyExtension = (1 - options.flyWidth) * 8
    const flyLength =
      (measurements.crossSeamFront - measurements.waistToHips) * options.flyFrontLength

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

    paths.flyCrotchExDetail = new Path()
      .move(points.flyCrotchEx)
      .line(points.flyCrotchExSplit)
      .join(paths.flyCrotchEx)
      .line(points.styleWaistIn)
      .setText('rightLegExtension', 'center')

    //seam allowance
    if (sa) {
      const crotchSeamSa = sa * options.crotchSeamSaWidth * 100

      points.saFlyCrotchEx = paths.crotchSeam
        .offset(crotchSeamSa)
        .intersectsBeam(points.flyCrotchEx, points.flyCrotchExSplit)[0]

      paths.sa = paths.hemBase
        .offset(sa * options.hemWidth * 100)
        .join(paths.inseam.offset(sa * options.inseamSaWidth * 100))
        .join(paths.crotchSeam.offset(crotchSeamSa).split(points.saFlyCrotchEx)[0])
        .join(paths.flyCrotchEx.offset(crotchSeamSa))
        .join(paths.waist.offset(sa))
        .join(paths.outSeam.offset(sa * options.sideSeamSaWidth * 100))
        .close()
        .attr('class', 'fabric sa')
    }

    //details
    //grainline
    points.grainlineFrom = points.styleWaistOut.shiftFractionTowards(points.styleWaistIn, 0.25)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.floor.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
      grainline: true,
    })
    //notches
    if (options.frontPocketsBool) {
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontPocketOpeningTop', 'frontPocketOpeningBottom'],
      })
    }
    snippets.flyCrotchEx = new Snippet('notch', points.flyCrotchEx)
    //cutlist
    store.cutlist.setCut({ cut: 2, from: 'fabric', identical: 'true' })
    //title
    points.title = points.forkAnchor
    macro('title', {
      at: points.title,
      nr: 2,
      title: 'back',
      scale: 0.75,
    })
    //side pockets
    if (options.sidePocketsBool) {
      const sidePocketPlacement = store.get('sidePocketPlacement')
      points.sidePocketBottom = paths.outSeam.shiftAlong(sidePocketPlacement)
      points.sidePocketRight = points.sidePocketBottom.shift(
        points.sidePocketBottom.angle(paths.outSeam.shiftAlong(sidePocketPlacement * 0.99)) - 90,
        store.get('sidePocketWidth') * 0.5
      )
      if (complete)
        paths.sidePocketLine = new Path()
          .move(points.sidePocketBottom)
          .line(points.sidePocketRight)
          .setClass('fabric help')
          .setText('sidePocketLine', 'center')

      snippets.sidePocketRight = new Snippet('notch', points.sidePocketRight)
    }
    //paperless
    if (paperless) {
      points.bottomLeftAnchor = paths.seam.edge('bottomLeft')
      points.topRightAnchor = paths.seam.edge('topRight')
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: paths.hemBase.edge('bottom'),
        y: paths.hemBase.edge('bottom').y,
        id: 'hdOut0',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.floorOutROut,
        y: points.floorOutROut.y,
        id: 'hdOut1',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: paths.outSeam.edge('right'),
        y: paths.outSeam.edge('right').y,
        id: 'hdOut2',
      })
      if (points.waistOut.x > points.seatOut.x) {
        macro('hd', {
          from: points.bottomLeftAnchor,
          to: points.seatOut,
          y: points.seatOut.y,
          id: 'hdOut3',
        })
        macro('vd', {
          from: paths.outSeam.edge('right'),
          to: points.seatOut,
          x: points.bottomLeftAnchor.x,
          id: 'vdOut2',
        })
        macro('vd', {
          from: points.seatOut,
          to: points.styleWaistOut,
          x: points.bottomLeftAnchor.x,
          id: 'vdOut3',
        })
      } else {
        macro('vd', {
          from: paths.outSeam.edge('right'),
          to: points.styleWaistOut,
          x: points.bottomLeftAnchor.x,
          id: 'vdOut4',
        })
      }
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.styleWaistOut,
        y: points.styleWaistOut.y,
        id: 'hdOut4',
      })
      if (points.styleWaistIn.y < points.styleWaistOut.y) {
        macro('hd', {
          from: points.bottomLeftAnchor,
          to: points.styleWaistIn,
          y: points.styleWaistIn.y,
          id: 'hdOut5',
        })
        macro('vd', {
          from: points.styleWaistOut,
          to: points.styleWaistIn,
          x: points.bottomLeftAnchor.x,
          id: 'vdOut4',
        })
      } else {
        macro('hd', {
          from: points.styleWaistOut,
          to: points.topRightAnchor,
          y: points.styleWaistOut.y,
          id: 'hdIn0',
        })
        macro('vd', {
          from: points.styleWaistOut,
          to: points.styleWaistIn,
          x: points.topRightAnchor.x,
          id: 'vdIn0',
        })
      }
      macro('hd', {
        from: points.crotchSeamCurveStart,
        to: points.topRightAnchor,
        y: points.crotchSeamCurveStart.y,
        id: 'hdIn1',
      })
      macro('hd', {
        from: points.flyCrotchEx,
        to: points.topRightAnchor,
        y: points.flyCrotchEx.y,
        id: 'hdIn2',
      })
      macro('hd', {
        from: points.fork,
        to: points.topRightAnchor,
        y: points.fork.y,
        id: 'hdIn3',
      })
      macro('hd', {
        from: paths.inseam.edge('left'),
        to: points.topRightAnchor,
        y: paths.inseam.edge('left').y,
        id: 'hdIn4',
      })
      macro('hd', {
        from: points.floorInRIn,
        to: points.topRightAnchor,
        y: points.floorInRIn.y,
        id: 'hdIn5',
      })
      macro('hd', {
        from: paths.hemBase.edge('bottom'),
        to: points.topRightAnchor,
        y: paths.hemBase.edge('bottom').y,
        id: 'hdIn6',
      })
      macro('vd', {
        from: paths.hemBase.edge('bottom'),
        to: points.floorOutROut,
        x: points.bottomLeftAnchor.x,
        id: 'vdOut0',
      })
      macro('vd', {
        from: points.floorOutROut,
        to: paths.outSeam.edge('right'),
        x: points.bottomLeftAnchor.x,
        id: 'vdOut1',
      })
      if (points.crotchSeamCurveStart.y < points.flyCrotchEx.y) {
        macro('vd', {
          from: points.crotchSeamCurveStart,
          to: points.styleWaistIn,
          x: points.topRightAnchor.x,
          id: 'vdIn1',
        })
        macro('vd', {
          from: points.flyCrotchEx,
          to: points.crotchSeamCurveStart,
          x: points.topRightAnchor.x,
          id: 'vdIn2',
        })
        macro('vd', {
          from: points.fork,
          to: points.flyCrotchEx,
          x: points.topRightAnchor.x,
          id: 'vdIn3',
        })
      } else {
        macro('vd', {
          from: points.flyCrotchEx,
          to: points.styleWaistIn,
          x: points.topRightAnchor.x,
          id: 'vdIn1',
        })
        macro('vd', {
          from: points.crotchSeamCurveStart,
          to: points.flyCrotchEx,
          x: points.topRightAnchor.x,
          id: 'vdIn2',
        })
        macro('vd', {
          from: points.fork,
          to: points.crotchSeamCurveStart,
          x: points.topRightAnchor.x,
          id: 'vdIn3',
        })
      }
      macro('vd', {
        from: paths.inseam.edge('left'),
        to: points.fork,
        x: points.topRightAnchor.x,
        id: 'vdIn4',
      })
      macro('vd', {
        from: points.floorInRIn,
        to: paths.inseam.edge('left'),
        x: points.topRightAnchor.x,
        id: 'vdIn5',
      })
      macro('vd', {
        from: paths.hemBase.edge('bottom'),
        to: points.floorInRIn,
        x: points.topRightAnchor.x,
        id: 'vdIn6',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        y: points.topRightAnchor.y - 15,
        id: 'hd0',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        y: points.bottomLeftAnchor.y + 15,
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
