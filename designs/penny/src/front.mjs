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
    //measures
    const pocketOpening = store.get('pocketOpening')
    const pocketOpeningLength = store.get('pocketOpeningLength')
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

    paths.seam = new Path()
      .move(points.cfHem)
      .line(points.sideHem)
      .join(drawSideSeam())
      .join(paths.waist)
      .line(points.cfHem)
      .close()
    //vents
    points.cfVent = points.cfHem.shiftFractionTowards(points.cfSeat, options.frontVentDepth)
    if (
      options.pocketsBool &&
      pocketOpening + pocketOpeningLength + store.get('pocketDepth') < store.get('pocketMaxLength')
    ) {
      points.pocketOpeningTop = drawSideSeam().reverse().shiftAlong(pocketOpening)
      points.pocketOpeningBottom = drawSideSeam()
        .reverse()
        .shiftAlong(pocketOpening + pocketOpeningLength)
    }
    if (options.sideSeamVentDepth > 0 && options.skirtLength > 0) {
      points.sideVent = drawSideSeam()
        .split(points.sideSeat)[0]
        .shiftFractionAlong(options.sideSeamVentDepth)
    }
    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfWaist
        points.cutOnFoldTo = points.cfHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cfHem.shiftFractionTowards(points.sideHem, 0.1)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      if (points.pocketOpeningTop) {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      if (points.cfVent) snippets.cfVent = new Snippet('notch', points.cfVent)
      if (points.sideVent && !points.sideVent.sitsRoughlyOn(points.sideHem)) {
        snippets.sideVent = new Snippet('notch', points.sideVent)
      }
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
        if (options.closurePosition == 'side') sideSeamSa = closureSa
        let cfSa = sa * options.cfSaWidth * 100
        if (options.closurePosition == 'front') cfSa = closureSa

        if (points.cfVent) {
          points.saCfHem = points.cfHem.translate(cfSa * -2, hemSa)
          points.saCfVentLeft = points.cfVent.shift(0, cfSa * -2)
          points.saCfVentRight = points.cfVent.translate(-cfSa, -cfSa)
          points.saCfWaist = points.cfWaist.translate(-cfSa, -sa)
        } else {
          points.saCfHem = new Point(points.saCfWaist.x, points.cfHem.y + hemSa)
          points.saCfVentLeft = points.saCfHem
          points.saCfVentRight = points.saCfHem
        }

        if (points.sideVent && !points.sideVent.sitsRoughlyOn(points.sideHem)) {
          paths.saSideSeam = drawSideSeam()
            .split(points.sideVent)[0]
            .offset(sideSeamSa * 2)
            .join(
              drawSideSeam()
                .split(points.sideVent)[1]
                .offset(sideSeamSa)
                .split(
                  drawSideSeam().split(points.sideVent)[1].offset(sideSeamSa).shiftAlong(sideSeamSa)
                )[1]
            )
            .hide()
        } else {
          paths.saSideSeam = drawSideSeam().offset(sideSeamSa).hide()
        }

        points.saSideHem = new Point(paths.saSideSeam.start().x, points.saCfHem.y)

        paths.sa = new Path()
          .move(points.saCfHem)
          .line(points.saSideHem)
          .join(paths.saSideSeam)
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
