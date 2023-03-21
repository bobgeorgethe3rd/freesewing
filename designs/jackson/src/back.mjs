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

    //lets begin
    paths.crossSeam = new Path()
      .move(points.styleWaistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .hide()

    if (options.yoke) {
      paths.waist = new Path().move(points.yokeOut).line(points.yokeIn).hide()

      let outSeamSplit = drawOutseam().split(points.yokeOut)
      for (let i in outSeamSplit) {
        paths['outSeam' + i] = outSeamSplit[i].hide()
      }
      paths.outSeam = paths.outSeam0

      let crossSeamSplit = paths.crossSeam.split(points.yokeIn)
      for (let i in crossSeamSplit) {
        paths['crossSeam' + i] = crossSeamSplit[i].hide()
      }
      paths.crossSeam = paths.crossSeam1
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
      //backPockets
      if (options.backPocketsBool) {
        paths.backPocket = new Path()
          .move(points.backPocketTopIn)
          .line(points.backPocketBottomLeft)
          .line(points.backPocketPeak)
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
      if (options.sidePocketsBool) {
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
