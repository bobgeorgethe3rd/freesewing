import { front as frontSarah } from '@freesewing/sarah'
import { back } from './back.mjs'

export const front = {
  name: 'penny.front',
  from: frontSarah,
  after: back,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Penny
    frontVentDepth: { pct: 0, min: 0, max: 90, menu: 'construction' },
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
  }) => {
    //remove paths & snippets
    const keepPaths = [
      'hipsGuide',
      'seatGuide',
      'waist',
      'dartEdges',
      'dartEdge',
      'seam',
      'saWaist',
    ]
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.sarahGuides) {
      paths.sarahGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    const keepSnippets = [
      'hipsGuideLeft-notch',
      'hipsGuideRight-notch',
      'seatGuideLeft-notch',
      'seatGuideRight-notch',
      'cfSeat-notch',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //removing macros not required from Sarah
    macro('title', false)
    if (options.frontVentDepth > 0 && options.skirtLength > 0 && options.cfSaWidth < 0.01) {
      options.cfSaWidth = 0.01
      macro('cutonfold', false)
    }
    //let's begin
    points.sideSeatCp1 = points.sideSeat.shiftFractionTowards(
      points.sideKnee,
      options.sideSeamCurve
    )
    if (options.shapeKnee > 0)
      points.sideKnee = points.sideKnee.shiftFractionTowards(
        new Point(points.sideWaistFront.x, points.cfKnee.y),
        options.shapeKnee
      )
    points.sideKneeCp2 = points.sideKnee.shiftFractionTowards(
      new Point(points.sideKnee.x, points.sideSeat.y),
      options.sideSeamCurve
    )
    points.cfHem = points.cfSeat.shift(-90, store.get('skirtLength'))
    if (points.cfHem.y < points.cfKnee.y) {
      points.sideHem = utils.curveIntersectsY(
        points.sideKnee,
        points.sideKneeCp2,
        points.sideSeatCp1,
        points.sideSeat,
        points.cfHem.y
      )
    } else {
      points.sideHem = new Point(points.sideKnee.x, points.cfHem.y)
    }
    //paths
    paths.sideSeamInitial = new Path()
      .move(points.sideKnee)
      .curve(points.sideKneeCp2, points.sideSeatCp1, points.sideSeat)
      .curve(points.sideSeatCp2, points.sideCurveEndCp1, points.sideCurveEnd)
      .line(points.sideWaistFront)
      .hide()

    const drawSideSeam = () => {
      if (options.shapeKnee > 0) {
        if (points.cfHem.y < points.cfKnee.y) {
          return paths.sideSeamInitial.split(points.sideHem)[1].hide()
        } else {
          return new Path()
            .move(points.sideHem)
            .line(points.sideKnee)
            .join(paths.sideSeamInitial)
            .hide()
        }
      } else {
        return new Path()
          .move(options.skirtLength == 0 ? points.sideSeat : points.sideHem)
          .line(points.sideSeat)
          .curve(points.sideSeatCp2, points.sideCurveEndCp1, points.sideCurveEnd)
          .line(points.sideWaistFront)
          .hide()
      }
    }

    points.cfVent = points.cfHem.shiftFractionTowards(points.cfSeat, options.frontVentDepth)

    paths.seam = new Path()
      .move(points.cfHem)
      .line(points.sideHem)
      .join(drawSideSeam())
      .join(paths.waist)
      .line(points.cfHem)
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfWaist
        points.cutOnFoldTo = points.cfKnee
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cfKnee.shiftFractionTowards(points.sideKnee, 0.1)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      if (
        options.pocketsBool &&
        store.get('pocketLength') < drawSideSeam().split(points.sideCurveEnd)[0].length()
      ) {
        points.pocketOpeningTop = drawSideSeam().reverse().shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = drawSideSeam()
          .reverse()
          .shiftAlong(store.get('pocketOpeningLength'))
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      if (options.frontVentDepth > 0) snippets.cfVent = new Snippet('notch', points.cfVent)
      //title
      points.title = new Point(
        paths.waist.reverse().shiftFractionAlong(0.1).x,
        points.cfSeat.y * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Front',
        cutNr: titleCutNum,
        scale: 2 / 3,
      })
      //fitGuides
      if (
        options.fitGuides &&
        points.sideSeat.dist(points.sideHem) > measurements.waistToKnee - measurements.waistToSeat
      ) {
        points.kneeGuideLeft = new Point(points.seatGuideLeft.x, points.cfKnee.y)
        points.kneeGuideRight = new Point(points.seatGuideRight.x, points.cfKnee.y)
        paths.kneeGuide = new Path()
          .move(points.kneeGuideLeft)
          .line(points.kneeGuideRight)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'right')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['kneeGuideLeft', 'kneeGuideRight'],
        })
      }
      if (sa) {
        const closureSa = sa * options.closureSaWidth * 100
        const hemSa = sa * options.hemWidth * 100
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'side') closureSa
        let cfSa = sa * options.cfSaWidth * 100
        if (options.closurePosition == 'front') cfSa = closureSa

        if (options.frontVentDepth > 0 && options.skirtLength > 0) {
          points.saCfHem = points.cfHem.translate(cfSa * -2, hemSa)
          points.saCfVentLeft = points.cfVent.shift(0, cfSa * -2)
          points.saCfVentRight = points.cfVent.translate(-cfSa, -cfSa)
          points.saCfWaist = points.cfWaist.translate(-cfSa, -sa)
        } else {
          points.saCfHem = new Point(points.saCfWaist.x, points.cfHem.y + hemSa)
          points.saCfVentLeft = points.saCfHem
          points.saCfVentRight = points.saCfHem
        }

        points.saSideHem = points.sideHem.translate(sideSeamSa, hemSa)

        paths.sa = new Path()
          .move(points.saCfHem)
          .line(points.saSideHem)
          .join(drawSideSeam().offset(sideSeamSa))
          .line(points.saSideWaistFront)
          .join(paths.saWaist)
          .line(points.saCfWaist)
          .line(points.saCfVentRight)
          .line(points.saCfVentLeft)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
