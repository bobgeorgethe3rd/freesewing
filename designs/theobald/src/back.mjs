import { backBase } from './backBase.mjs'

export const back = {
  name: 'theobald.back',
  from: backBase,
  hide: {
    from: true,
  },
  options: {
    //Style
    waistbandFishtailEmbedded: { bool: false, menu: 'style' },
    //Pockets
    backPocketsBool: { bool: true, menu: 'pockets' },
    backPocketPlacement: { pct: 50, min: 10, max: 100, menu: 'pockets.backPockets' },
    backPocketOpeningWidth: { pct: 62.2, min: 50, max: 80, menu: 'pockets.backPockets' },
    //Construction
    hemWidth: { pct: 4, min: 1, max: 10, menu: 'construction' }, //altered for Jackson
    crossSeamSaWidth: { pct: 2, min: 1, max: 4, menu: 'construction' },
    inseamSaWidth: { pct: 2, min: 1, max: 4, menu: 'construction' },
    outSeamSaWidth: { pct: 1, min: 1, max: 4, menu: 'construction' },
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

    const drawWaistSeam = () => {
      if (options.waistbandFishtailEmbedded && options.waistbandStyle == 'fishtail') {
        return new Path()
          .move(points.waistbandFOut)
          .curve_(points.waistbandFCp, points.waistbandFTop)
          .line(points.waistbandFIn)
      } else {
        return new Path()
          .move(points.styleWaistOut)
          .line(points.dartOut)
          .line(points.dartTip)
          .line(points.dartIn)
          .line(points.styleWaistIn)
      }
    }
    //measures
    let backPocketOpeningWidth =
      ((measurements.waistBack * (1 + options.waistEase)) / 2) * options.backPocketOpeningWidth
    //paths
    paths.crossSeam = new Path()
      .move(points.styleWaistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .hide()

    paths.outseam = drawOutseam().hide()

    if (options.waistbandFishtailEmbedded && options.waistbandStyle == 'fishtail') {
      paths.crossSeam = new Path()
        .move(points.waistbandFIn)
        .line(points.styleWaistIn)
        .join(paths.crossSeam)
        .hide()

      paths.outseam = paths.outseam.line(points.waistbandFOut).hide()
    }

    paths.hemBase = new Path()
      .move(points.floorIn)
      ._curve(points.floorCp1, points.floor)
      .curve_(points.floorCp2, points.floorOut)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.outseam)
      .join(drawWaistSeam())
      .join(paths.crossSeam)
      .join(drawInseam())
      .close()

    //stores
    store.set(
      'backPocketTopLength',
      points.dartMid.dist(points.dartTip) * options.backPocketPlacement
    )
    store.set('backPocketOpeningWidth', backPocketOpeningWidth)

    if (complete) {
      //grainline
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.crossSeamCurveStart = new Snippet('bnotch', points.crossSeamCurveStart)
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
        scale: 2 / 3,
      })
      //dart
      if (options.waistbandFishtailEmbedded && options.waistbandStyle == 'fishtail') {
        paths.dart = new Path()
          .move(points.waistbandFSplit)
          .line(points.dartIn)
          .line(points.dartTip)
          .line(points.dartOut)
          .line(points.waistbandFSplit)
          .close()
      }
      //fitGuides
      if (options.fitGuides) {
        if (points.hipsGuideOut) {
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
        points.backPocketMid = points.dartMid.shiftFractionTowards(
          points.dartTip,
          options.backPocketPlacement
        )
        points.backPocketDartIn = utils.beamsIntersect(
          points.backPocketMid,
          points.dartMid.rotate(90, points.backPocketMid),
          points.dartIn,
          points.dartTip
        )
        points.backPocketDartOut = utils.beamsIntersect(
          points.backPocketMid,
          points.dartMid.rotate(-90, points.backPocketMid),
          points.dartOut,
          points.dartTip
        )
        points.backPocketIn = points.backPocketDartIn.shift(
          points.styleWaistOut.angle(points.styleWaistIn),
          backPocketOpeningWidth / 2
        )
        points.backPocketOut = points.backPocketDartOut.shift(
          points.styleWaistIn.angle(points.styleWaistOut),
          backPocketOpeningWidth / 2
        )

        paths.backPocket = new Path()
          .move(points.backPocketIn)
          .line(points.backPocketDartIn)
          .move(points.backPocketDartOut)
          .line(points.backPocketOut)
          .attr('class', 'interfacing')
          .attr('data-text', 'Back Pocket Line')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['backPocketIn', 'backPocketOut'],
        })
      }
      if (sa) {
        const drawWaistSa = () => {
          if (options.waistbandFishtailEmbedded && options.waistbandStyle == 'fishtail') {
            return drawWaistSeam()
          } else {
            return new Path().move(points.styleWaistOut).line(points.styleWaistIn)
          }
        }
        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .join(paths.outseam.offset(sa * options.outSeamSaWidth * 100))
          .join(drawWaistSa().offset(sa))
          .join(paths.crossSeam.offset(sa * options.crossSeamSaWidth * 100))
          .join(drawInseam().offset(sa * options.inseamSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
