import { back as backSarah } from '@freesewing/sarah'
import { pocket } from '@freesewing/inseampocket'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { pctBasedOn } from '@freesewing/core'

export const back = {
  name: 'penny.back',
  from: backSarah,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...pocket.options,
    //Constants
    kneeLengthBonus: 0, //Locked for Penny
    //Fit
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Penny
    sarahGuides: { bool: false, menu: 'fit' },
    //Style
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'none'], menu: 'style' }, //Altered for Penny
    waistbandWidth: {
      pct: 2.4,
      min: 1,
      max: 6,
      snap: 2.5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Penny
    shapeKnee: { pct: 0, min: 0, max: 200, menu: 'style' },
    skirtLength: { pct: 50, min: 0, max: 100, menu: 'style' },
    skirtLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    sideSeamCurve: { pct: 50, min: 10, max: 50, menu: 'style' },
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    pocketOpening: { pct: 7.2, min: 5, max: 15, menu: 'pockets' }, //Altered for Antiope
    inseamPocketWidth: { pct: 75, min: 40, max: 90, menu: 'pockets.inseamPockets' }, //Altered for Antiope
    inseamPocketDepth: { pct: 15, min: 15, max: 40, menu: 'pockets.inseamPockets' }, //Altered for Antiope
    //Construction
    // skirtFacings: { bool: false, menu: 'construction' },
    // skirtFacingWidth: { pct: 15, min: 5, max: 50, menu: 'construction' },
    backVentDepth: { pct: (2 / 3) * 100, min: 0, max: 90, menu: 'construction' },
    sideSeamVentDepth: { pct: 0, min: 0, max: 90, menu: 'construction' },
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Penny
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Penny
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Penny
  },
  measurements: [...pocket.measurements],
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
      'cbSeat',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //removing macros not required from Sarah
    macro('title', false)
    macro('scalebox', false)
    if (options.backVentDepth > 0 && options.skirtLength > 0 && options.cbSaWidth < 0.01) {
      options.cbSaWidth = 0.01
      macro('cutonfold', false)
    }
    //measures
    let skirtLength
    if (options.skirtLength < 0.5) {
      skirtLength = (measurements.waistToKnee - measurements.waistToSeat) * 2 * options.skirtLength
    } else {
      skirtLength =
        (measurements.waistToKnee - measurements.waistToSeat) * (2 - 2 * options.skirtLength) +
        (measurements.waistToFloor - measurements.waistToSeat) * (-1 + 2 * options.skirtLength)
    }
    skirtLength = skirtLength * (1 + options.skirtLengthBonus)
    const pocketDepth = measurements.waistToFloor * options.inseamPocketDepth
    const pocketOpening =
      measurements.waistToFloor * options.pocketOpening - store.get('waistbandWidth')
    const pocketOpeningLength = measurements.wrist * options.pocketOpeningLength
    //let's begin
    points.sideSeatCp2 = points.sideSeat.shiftFractionTowards(
      points.sideKnee,
      options.sideSeamCurve
    )
    if (options.shapeKnee > 0)
      points.sideKnee = points.sideKnee.shiftFractionTowards(
        new Point(points.sideWaistBack.x, points.cbKnee.y),
        options.shapeKnee
      )
    points.sideKneeCp1 = points.sideKnee.shiftFractionTowards(
      new Point(points.sideKnee.x, points.sideSeat.y),
      options.sideSeamCurve
    )
    points.cbHem = points.cbSeat.shift(-90, skirtLength)
    if (points.cbHem.y < points.cbKnee.y) {
      points.sideHem = utils.curveIntersectsY(
        points.sideSeat,
        points.sideSeatCp2,
        points.sideKneeCp1,
        points.sideKnee,
        points.cbHem.y
      )
    } else {
      points.sideHem = new Point(points.sideKnee.x, points.cbHem.y)
    }
    //paths
    paths.sideSeamInitial = new Path()
      .move(points.sideWaistBack)
      .line(points.sideCurveStart)
      .curve(points.sideCurveStartCp2, points.sideSeatCp1, points.sideSeat)
      .curve(points.sideSeatCp2, points.sideKneeCp1, points.sideKnee)
      .hide()

    const drawSideSeam = () => {
      if (options.shapeKnee > 0) {
        if (points.cbHem.y < points.cbKnee.y) {
          return paths.sideSeamInitial.split(points.sideHem)[0].hide()
        } else {
          return paths.sideSeamInitial.line(points.sideHem).hide()
        }
      } else {
        return new Path()
          .move(points.sideWaistBack)
          .line(points.sideCurveStart)
          .curve(points.sideCurveStartCp2, points.sideSeatCp1, points.sideSeat)
          .line(options.skirtLength == 0 ? points.sideSeat : points.sideHem)
          .hide()
      }
    }

    paths.seam = new Path()
      .move(points.sideHem)
      .line(points.cbHem)
      .line(points.cbWaist)
      .join(paths.waist)
      .join(drawSideSeam())
      .close()

    //vents
    const pocketMaxLength = drawSideSeam().split(points.sideCurveStart)[1].length()
    if (options.backVentDepth > 0 && options.skirtLength > 0)
      points.cbVent = points.cbHem.shiftFractionTowards(points.cbSeat, options.backVentDepth)

    if (
      options.pocketsBool &&
      pocketOpening + pocketOpeningLength + pocketDepth < pocketMaxLength
    ) {
      points.pocketOpeningTop = drawSideSeam().shiftAlong(pocketOpening)
      points.pocketOpeningBottom = drawSideSeam().shiftAlong(pocketOpening + pocketOpeningLength)
    }
    if (options.sideSeamVentDepth > 0 && options.skirtLength > 0) {
      points.sideVent = drawSideSeam()
        .split(points.sideSeat)[1]
        .shiftFractionAlong(1 - options.sideSeamVentDepth)
    }
    //store
    store.set('skirtLength', skirtLength)
    store.set('pocketDepth', pocketDepth)
    store.set('pocketOpening', pocketOpening)
    store.set('pocketOpeningLength', pocketOpeningLength)
    store.set('pocketMaxLength', pocketMaxLength)
    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbHem
        points.cutOnFoldTo = points.cbWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cbHem.shiftFractionTowards(points.sideHem, 0.1)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbWaist.y)
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
      if (points.cbVent) snippets.cbVent = new Snippet('bnotch', points.cbVent)
      if (points.sideVent && !points.sideVent.sitsRoughlyOn(points.sideHem)) {
        snippets.sideVent = new Snippet('notch', points.sideVent)
      }
      //title
      points.title = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(points.sideHem.shiftFractionTowards(points.cbHem, 0.5), 0.35)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Skirt Back',
        cutNr: titleCutNum,
        scale: 2 / 3,
      })
      //logo
      points.logo = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(points.sideHem.shiftFractionTowards(points.cbHem, 0.5), 0.55)
      macro('logorg', { at: points.logo, scale: 0.5 })
      //scalebox
      points.scalebox = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(points.sideHem.shiftFractionTowards(points.cbHem, 0.5), 0.75)
      macro('scalebox', { at: points.scalebox })
      //fitGuides
      if (
        options.fitGuides &&
        new Point(points.sideHem.x, points.sideSeat.y).dist(points.sideHem) >
          measurements.waistToKnee - measurements.waistToSeat
      ) {
        points.kneeGuideRight = new Point(points.seatGuideRight.x, points.cbKnee.y)
        points.kneeGuideLeft = new Point(points.seatGuideLeft.x, points.cbKnee.y)
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
        let cbSa = sa * options.cbSaWidth * 100
        if (options.closurePosition == 'back') cbSa = closureSa
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'side') sideSeamSa = closureSa

        if (points.cbVent) {
          points.saCbHem = points.cbHem.translate(cbSa * 2, hemSa)
          points.saCbVentRight = points.cbVent.shift(0, cbSa * 2)
          points.saCbVentLeft = points.cbVent.translate(cbSa, -cbSa)
          points.saCbWaist = points.cbWaist.translate(cbSa, -sa)
        } else {
          points.saCbHem = new Point(points.saCbWaist.x, points.cbHem.y + hemSa)
          points.saCbVentRight = points.saCbHem
          points.saCbVentLeft = points.saCbHem
        }

        if (points.sideVent && !points.sideVent.sitsRoughlyOn(points.sideHem)) {
          paths.saSideSeam = drawSideSeam()
            .split(points.sideVent)[0]
            .offset(sideSeamSa)
            .split(
              drawSideSeam()
                .split(points.sideVent)[0]
                .offset(sideSeamSa)
                .reverse()
                .shiftAlong(sideSeamSa)
            )[0]
            .join(
              drawSideSeam()
                .split(points.sideVent)[1]
                .offset(sideSeamSa * 2)
                .start().x > points.sideVent.x
                ? drawSideSeam()
                    .split(points.sideSeat)[1]
                    .offset(sideSeamSa * 2)
                : drawSideSeam()
                    .split(points.sideVent)[1]
                    .offset(sideSeamSa * 2)
            )
            .hide()
        } else {
          paths.saSideSeam = drawSideSeam().offset(sideSeamSa).hide()
        }

        points.saSideHem = new Point(paths.saSideSeam.end().x, points.saCbHem.y)

        paths.sa = new Path()
          .move(points.saSideHem)
          .line(points.saCbHem)
          .line(points.saCbVentRight)
          .line(points.saCbVentLeft)
          .line(points.saCbWaist)
          .join(paths.saWaist)
          .line(points.saSideWaistBack)
          .join(paths.saSideSeam)
          .line(points.saSideHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
