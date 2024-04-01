import { backBase } from './backBase.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const back = {
  name: 'jackson.back',
  from: backBase,
  hide: {
    from: true,
  },
  options: {
    //Fit
    daltonGuides: { bool: false, menu: 'fit' },
    //Style
    yoke: { bool: true, menu: 'style' },
    //Pockets
    backPocketsBool: { bool: true, menu: 'pockets' },
    backPocketBalance: { pct: 45.9, min: 40, max: 70, menu: 'pockets.backPockets' },
    // backPocketPlacement: {pct: 3, min: 2.5, max: 5, menu:'pockets.backPockets'},
    backPocketPlacement: { pct: 140.3, min: 70, max: 150, menu: 'pockets.backPockets' }, //Altered for Jackson
    patchPocketWidth: { pct: 22.2, min: 15, max: 30, menu: 'pockets.backPockets' }, //Altered for Jackson
    patchPocketDepth: { pct: 13.1, min: 10, max: 25, menu: 'pockets.backPockets' }, //Altered for Jackson
    patchPocketBottomWidth: { pct: 82.4, min: 80, max: 100, menu: 'pockets.backPockets' }, //Altered for Jackson
    patchPocketPeak: { pct: 49.2, min: 0, max: 50, menu: 'pockets.backPockets' }, //Altered for Jackson
    patchPocketPeakDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.backPockets' }, //Moved for Jackson
    //Construction
    yokeSeamSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  plugins: [pluginLogoRG],
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
    //let's begin
    //draw paths
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, points.waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, points.waistOut)
      } else {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve(points.floorOutCp2, points.seatOut, points.waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve(points.floorOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, points.waistOut)
      }
    }

    const drawInseam = () =>
      options.fitKnee
        ? new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.kneeInCp1, points.kneeIn)
            ._curve(points.floorInCp1, points.floorIn)
        : new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.floorInCp1, points.floorIn)

    if (options.yoke) {
      if (options.daltonGuides) {
        paths.daltonGuide = paths.seam.attr('class', 'various lashed')
      }
      delete paths.seam
      delete paths.sa

      paths.outSeam = drawOutseam().split(points.yokeOut)[0].hide()
      paths.crossSeam = paths.crossSeam.split(points.yokeIn)[1].hide()

      paths.seam = paths.hemBase
        .clone()
        .join(paths.outSeam)
        .line(points.yokeIn)
        .join(paths.crossSeam)
        .join(drawInseam())
        .close()

      if (complete) {
        if (points.hipsGuideIn && points.hipsGuideIn.y < points.yokeIn.y) {
          delete paths.hipsGuide
          for (let i in snippets) delete snippets[i]
          macro('sprinkle', {
            snippet: 'notch',
            on: ['seatGuideIn', 'seatGuideOut'],
          })
          snippets.crossSeamCurveStart = new Snippet('bnotch', points.crossSeamCurveStart)
        }
        if (points.seatGuideIn && points.seatGuideIn.y < points.yokeIn.y) {
          delete paths.seatGuide
          delete snippets.seatGuideIn - notch
          delete snippets.seatGuideOut - notch
        }
        if (points.yokeIn.y > points.crossSeamCurveStart.y) {
          delete snippets.crossSeamCurveStart
        }
        if (sa) {
          const yokeSeamSa = sa * options.yokeSeamSaWidth * 100
          const sideSeamSa = sa * options.sideSeamSaWidth * 100
          const crossSeamSa = sa * options.crossSeamSaWidth * 100

          points.saYokeOut = utils.beamsIntersect(
            paths.outSeam.offset(sideSeamSa).end(),
            paths.outSeam.offset(sideSeamSa).shiftFractionAlong(0.99),
            points.yokeOut.shiftTowards(points.yokeIn, yokeSeamSa).rotate(-90, points.yokeOut),
            points.yokeIn.shiftTowards(points.yokeOut, yokeSeamSa).rotate(90, points.yokeIn)
          )

          points.saYokeIn = utils.beamsIntersect(
            points.saYokeOut,
            points.saYokeOut.shift(points.yokeOut.angle(points.yokeIn), 1),
            paths.crossSeam.offset(crossSeamSa).shiftFractionAlong(0.01),
            paths.crossSeam.offset(crossSeamSa).start()
          )

          paths.sa = paths.hemBase
            .offset(sa * options.hemWidth * 100)
            .line(points.saFloorOut)
            .join(drawOutseam().split(points.yokeOut)[0].offset(sideSeamSa))
            .line(points.saYokeOut)
            .line(points.saYokeIn)
            .join(paths.crossSeam.offset(crossSeamSa))
            .line(points.saUpperLegIn)
            .join(drawInseam().offset(sa * options.inseamSaWidth * 100))
            .line(points.saFloorIn)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }
    //backPocket
    if (options.backPocketsBool) {
      const backPocketPlacement =
        points.dartTip.dist(points.seatDart) * (1 - options.backPocketPlacement)
      const patchPocketDepth = measurements.waistToFloor * options.patchPocketDepth
      const patchPocketWidth = measurements.waist * options.patchPocketWidth
      const patchPocketBottomWidth = patchPocketWidth * options.patchPocketBottomWidth
      const backPocketPeak = patchPocketBottomWidth * options.patchPocketPeak * 0.5
      points.seatMid = points.seatIn.shiftFractionTowards(points.seatOut, 0.5)
      points.backPocketTopAnchor = points.seatMid
        .shiftTowards(points.seatOut, backPocketPlacement)
        .rotate(90, points.seatMid)
      points.backPocketTopIn = points.backPocketTopAnchor.shift(
        points.waistOut.angle(points.waistIn),
        patchPocketWidth * options.backPocketBalance
      )
      points.backPocketTopOut = points.backPocketTopAnchor.shift(
        points.waistIn.angle(points.waistOut),
        patchPocketWidth * (1 - options.backPocketBalance)
      )
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
      //stores
      store.set('patchPocketWidth', patchPocketWidth)
      store.set('patchPocketDepth', patchPocketDepth)
      if (complete) {
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
    }

    if (complete) {
      //logo
      points.logo = points.knee
      macro('logorg', { at: points.logo, scale: 0.5 })
    }

    return part
  },
}
