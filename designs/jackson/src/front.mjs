import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'jackson.front',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Construction
    crotchSeamSaWidth: { pct: 2, min: 1, max: 4, menu: 'construction' },
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

    const drawInseam = () => {
      if (options.fitKnee && !options.fitFloor) {
        return new Path()
          .move(points.floorIn)
          .line(points.kneeIn)
          .curve(points.kneeInCp2, points.forkCp1, points.fork)
      }
      if (options.fitFloor) {
        return new Path()
          .move(points.floorIn)
          .curve_(points.floorInCp2, points.kneeIn)
          .curve(points.kneeInCp2, points.forkCp1, points.fork)
      }
      if (!options.fitKnee & !options.fitFloor) {
        return new Path().move(points.floorIn).curve(points.kneeInCp2, points.forkCp1, points.fork)
      }
    }

    const drawWaistSeam = () => {
      if (options.frontPocketsBool) {
        return new Path()
          .move(points.styleWaistIn)
          .line(points.frontPocketOpeningWaist)
          .curve(
            points.frontPocketOpeningCp1,
            points.frontPocketOpeningCp2,
            points.frontPocketOpeningOut
          )
      } else {
        return new Path().move(points.styleWaistIn).line(points.styleWaistOut)
      }
    }

    //lets begin

    if (options.frontPocketsBool) {
      let outSeamSplit = drawOutseam().split(points.frontPocketOpeningOut)
      for (let i in outSeamSplit) {
        paths['outSeam' + i] = outSeamSplit[i].hide()
      }
    } else {
      paths.outSeam1 = drawOutseam().hide()
    }

    //paths
    paths.hemBase = new Path().move(points.floorOut).line(points.floorIn).hide()

    paths.crotch = new Path()
      .move(points.fork)
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(drawInseam())
      .join(paths.crotch)
      .join(drawWaistSeam())
      .join(paths.outSeam1)

    if (complete) {
      //grainline
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.flyCrotch = new Snippet('notch', points.flyCrotch)
      if (options.frontPocketsBool) {
        snippets.frontPocketOutSeam = new Snippet('notch', points.frontPocketOutSeam)
      }
      //title
      macro('title', {
        nr: 3,
        title: 'Front',
        at: points.title,
      })
      //fitGuides
      if (options.fitGuides) {
        if (points.hipsGuideIn) {
          paths.hipsGuide = new Path()
            .move(points.hipsGuideOut)
            .line(points.hipsGuideIn)
            .attr('class', 'various')
            .attr('data-text', 'Hips Guide')
            .attr('data-text-class', 'left')

          macro('sprinkle', {
            snippet: 'notch',
            on: ['hipsGuideOut', 'hipsGuideIn'],
          })
        }

        paths.seatGuide = new Path()
          .move(points.seatGuideOut)
          .line(points.seatGuideIn)
          .attr('class', 'various')
          .attr('data-text', 'Seat Guide')
          .attr('data-text-class', 'left')

        paths.kneeGuide = new Path()
          .move(points.kneeGuideOut)
          .line(points.kneeGuideIn)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'left')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['seatGuideOut', 'seatGuideIn', 'kneeGuideOut', 'kneeGuideIn'],
        })
      }

      if (sa) {
        paths.sa = paths.hemBase
          .clone()
          .offset(sa * options.hemWidth * 100)
          .join(drawInseam().offset(sa * options.inseamSaWidth * 100))
          .join(paths.crotch.offset(sa * options.crotchSeamSaWidth * 100))
          .join(drawWaistSeam().offset(sa))
          .join(paths.outSeam1.offset(sa * options.outSeamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
