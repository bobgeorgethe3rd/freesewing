import { front as frontSarah } from '@freesewing/sarah'
import { back } from './back.mjs'

export const front = {
  name: 'antiope.front',
  from: frontSarah,
  after: back,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    shapeSkirtFrontDarts: true, //Locked for Antiope
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Antiope
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
    const keepPaths = ['hipsGuide', 'seatGuide', 'waistClosed', 'seam']
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
    //measures
    const pocketOpening = store.get('pocketOpening')
    const pocketOpeningLength = store.get('pocketOpeningLength')
    //let's begin
    points.cfHem = points.cfSeat.shift(-90, store.get('skirtLength'))
    points.sideHem = new Point(points.sideSeat.x, points.cfHem.y)

    const rotThese = [
      'sideHem',
      'sideSeat',
      'sideSeatCp2',
      'sideCurveEndCp1',
      'sideCurveEnd',
      'sideWaistFront',
    ]

    if (points.skirtFrontDartBottom0) {
      for (const p of rotThese) {
        points[p] = points[p].rotate(
          store.get('waistFrontDartAngle0'),
          points.skirtFrontDartBottom0
        )
      }
      for (const p of rotThese) {
        points[p] = points[p].rotate(
          store.get('waistFrontDartAngle1'),
          points.skirtFrontDartBottom1
        )
      }
    } else {
      for (const p of rotThese) {
        points[p] = points[p].rotate(store.get('waistFrontDartAngle'), points.skirtFrontDartBottom)
      }
    }

    //hem
    points.hemCurveStart = points.cfHem.shift(0, points.cfSeat.x * -0.25)

    points.hemCurveEnd = points.sideHem.shift(
      points.sideSeat.angle(points.sideSeatCp2) + 90,
      points.cfSeat.x * -0.25
    )

    points.hemOrigin = utils.beamIntersectsX(
      points.hemCurveEnd,
      points.hemCurveEnd.shift(points.sideSeat.angle(points.sideSeatCp2), 1),
      points.hemCurveStart.x
    )

    const hemRadius =
      (points.hemOrigin.dist(points.hemCurveStart) + points.hemOrigin.dist(points.hemCurveEnd)) / 2
    const hemCpDist =
      (4 / 3) *
      hemRadius *
      Math.tan(utils.deg2rad((points.hemOrigin.angle(points.hemCurveEnd) - 270) / 4))

    points.hemCurveStartCp2 = points.hemCurveStart.shift(0, hemCpDist)

    points.hemCurveEndCp1 = points.hemCurveEnd.shift(
      points.sideHem.angle(points.hemCurveEnd),
      hemCpDist
    )

    //paths
    paths.hemBase = new Path()
      .move(points.cfHem)
      .line(points.hemCurveStart)
      .curve(points.hemCurveStartCp2, points.hemCurveEndCp1, points.hemCurveEnd)
      .line(points.sideHem)
      .hide()

    paths.sideSeam = new Path()
      .move(options.skirtLength == 0 ? points.sideSeat : points.sideHem)
      .line(points.sideSeat)
      .curve(points.sideSeatCp2, points.sideCurveEndCp1, points.sideCurveEnd)
      .line(points.sideWaistFront)
      .hide()

    paths.waist = paths.waistClosed

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.waist)
      .line(points.cfHem)
      .close()

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
        points.grainlineTo = paths.hemBase.shiftFractionAlong(0.05)
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
        pocketOpening + pocketOpeningLength + store.get('pocketDepth') <
          store.get('pocketMaxLength')
      ) {
        points.pocketOpeningTop = paths.sideSeam.reverse().shiftAlong(pocketOpening)
        points.pocketOpeningBottom = paths.sideSeam
          .reverse()
          .shiftAlong(pocketOpening + pocketOpeningLength)
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      points.title = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(paths.hemBase.shiftFractionAlong(0.5), 0.5)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Skirt Front',
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
      //facings
      if (options.skirtFacings) {
        const skirtFacingWidth = store.get('skirtFacingWidth')
        points.cfFacing = points.cfHem.shift(90, skirtFacingWidth)
        points.sideFacing = paths.sideSeam.shiftAlong(skirtFacingWidth)
        points.facingCurveEnd = new Point(points.hemCurveStart.x, points.cfFacing.y)
        points.facingCurveStart = utils.beamsIntersect(
          points.sideFacing,
          points.sideFacing.shift(points.sideSeat.angle(points.sideSeatCp2) + 90, 1),
          points.hemCurveEnd,
          points.hemCurveEnd.shift(points.sideSeat.angle(points.sideSeatCp2), 1)
        )
        points.facingCurveStartCp2 = utils.beamsIntersect(
          points.hemCurveEndCp1,
          points.hemOrigin,
          points.sideFacing,
          points.facingCurveStart
        )
        points.facingCurveEndCp1 = utils.beamIntersectsY(
          points.hemCurveStartCp2,
          points.hemOrigin,
          points.cfFacing.y
        )

        paths.facing = new Path()
          .move(points.sideFacing)
          .line(points.facingCurveStart)
          .curve(points.facingCurveStartCp2, points.facingCurveEndCp1, points.facingCurveEnd)
          .line(points.cfFacing)
          .hide()

        paths.facingLine = paths.facing
          .clone()
          .reverse()
          .unhide()
          .attr('class', 'interfacing')
          .attr('data-text', 'Skirt Facing Line')
          .attr('data-text-class', 'center')

        store.set('skirtFacingWidth', skirtFacingWidth)

        points.titleFacing = paths.facing
          .shiftFractionAlong(0.5)
          .shiftFractionTowards(paths.hemBase.shiftFractionAlong(0.5), 0.5)
        macro('title', {
          at: points.titleFacing,
          nr: '7',
          title: 'Facing (Skirt Front)',
          cutNr: titleCutNum,
          prefix: 'facing',
          scale: 0.25,
        })
      }
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'side') sideSeamSa = sa * options.closureSaWidth * 100

        points.saSideHem = points.sideHem
          .shift(points.hemCurveEnd.angle(points.sideHem), sideSeamSa)
          .shift(points.sideSeatCp2.angle(points.sideSeat), hemSa)

        if (points.skirtFrontDartBottom0) {
          points.saSideWaistFront = points.saSideWaistFront
            .rotate(store.get('waistFrontDartAngle0'), points.skirtFrontDartBottom0)
            .rotate(store.get('waistFrontDartAngle1'), points.skirtFrontDartBottom1)
        } else {
          points.saSideWaistFront = points.saSideWaistFront.rotate(
            store.get('waistFrontDartAngle'),
            points.skirtFrontDartBottom
          )
        }

        points.saCfHem = new Point(points.saCfWaist.x, points.cfHem.y + hemSa)

        if (options.skirtFacings) {
          points.saSideFacing = utils.beamsIntersect(
            paths.sideSeam.split(points.sideFacing)[0].offset(sideSeamSa).shiftFractionAlong(0.995),
            paths.sideSeam.split(points.sideFacing)[0].offset(sideSeamSa).end(),
            paths.facing.offset(sa).start(),
            paths.facing
              .offset(sa)
              .start()
              .shift(points.facingCurveStart.angle(points.sideFacing), 1)
          )
          points.saCfFacing = new Point(points.saCfWaist.x, points.cfFacing.y - sa)

          paths.facingSa = paths.hemBase
            .clone()
            .offset(hemSa)
            .join(paths.sideSeam.split(points.sideFacing)[0].offset(sideSeamSa))
            .line(points.saSideFacing)
            .join(paths.facing.offset(sa))
            .line(points.saCfFacing)
            .line(points.saCfHem)
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistFront)
          .join(paths.waist.offset(sa))
          .line(points.saCfWaist)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
