import { back as backSarah } from '@freesewing/sarah'
import { pocket } from '@freesewing/inseampocket'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { pctBasedOn } from '@freesewing/core'

export const back = {
  name: 'antiope.back',
  from: backSarah,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Imported
    ...pocket.options,
    //Constants
    shapeSkirtBackDarts: true, //Locked for Antiope
    kneeLengthBonus: 0, //Locked for Antiope
    //Fit
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Antiope
    sarahGuides: { bool: false, menu: 'fit' },

    //Style
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'none'], menu: 'style' }, //Altered for Antiope
    waistbandWidth: {
      pct: 2.4,
      min: 1,
      max: 6,
      snap: 2.5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Antiope
    skirtLength: { pct: 62.5, min: 0, max: 100, menu: 'style' },
    skirtLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    pocketOpening: { pct: 7.2, min: 5, max: 15, menu: 'pockets' }, //Altered for Antiope
    inseamPocketWidth: { pct: 75, min: 40, max: 90, menu: 'pockets.inseamPockets' }, //Altered for Antiope
    inseamPocketDepth: { pct: 15, min: 15, max: 40, menu: 'pockets.inseamPockets' }, //Altered for Antiope
    //Construction
    skirtFacings: { bool: false, menu: 'construction' },
    skirtFacingWidth: { pct: 15, min: 5, max: 50, menu: 'construction' },
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Antiope
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Antiope
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Antiope
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
      'cbSeat',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //removing macros not required from Sarah
    macro('title', false)
    macro('scalebox', false)
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
    points.cbHem = points.cbSeat.shift(-90, skirtLength)
    points.sideHem = new Point(points.sideSeat.x, points.cbHem.y)

    const rotThese = [
      'sideWaistBack',
      'sideCurveStart',
      'sideCurveStartCp2',
      'sideSeatCp1',
      'sideSeat',
      'sideHem',
    ]

    if (points.skirtBackDartBottom0) {
      for (const p of rotThese) {
        points[p] = points[p].rotate(-store.get('waistBackDartAngle0'), points.skirtBackDartBottom0)
      }
      for (const p of rotThese) {
        points[p] = points[p].rotate(-store.get('waistBackDartAngle1'), points.skirtBackDartBottom1)
      }
    } else {
      for (const p of rotThese) {
        points[p] = points[p].rotate(-store.get('waistBackDartAngle'), points.skirtBackDartBottom)
      }
    }

    //hem
    points.hemCurveStart = points.sideHem.shift(
      points.sideSeat.angle(points.sideSeatCp1) - 90,
      points.cbSeat.x * 0.25
    )
    points.hemCurveEnd = points.cbHem.shift(180, points.cbSeat.x * 0.25)

    points.hemOrigin = utils.beamIntersectsX(
      points.hemCurveStart,
      points.hemCurveStart.shift(points.sideSeat.angle(points.sideSeatCp1), 1),
      points.hemCurveEnd.x
    )

    const hemRadius =
      (points.hemOrigin.dist(points.hemCurveStart) + points.hemOrigin.dist(points.hemCurveEnd)) / 2
    const hemCpDist =
      (4 / 3) *
      hemRadius *
      Math.tan(utils.deg2rad((270 - points.hemOrigin.angle(points.hemCurveStart)) / 4))

    points.hemCurveStartCp2 = points.hemCurveStart.shift(
      points.sideHem.angle(points.hemCurveStart),
      hemCpDist
    )
    points.hemCurveEndCp1 = points.hemCurveEnd.shift(180, hemCpDist)

    //paths
    paths.hemBase = new Path()
      .move(points.sideHem)
      .line(points.hemCurveStart)
      .curve(points.hemCurveStartCp2, points.hemCurveEndCp1, points.hemCurveEnd)
      .line(points.cbHem)
      .hide()

    paths.sideSeam = new Path()
      .move(points.sideWaistBack)
      .line(points.sideCurveStart)
      .curve(points.sideCurveStartCp2, points.sideSeatCp1, points.sideSeat)
      .line(options.skirtLength == 0 ? points.sideSeat : points.sideHem)
      .hide()

    paths.waist = paths.waistClosed

    paths.seam = paths.hemBase
      .clone()
      .line(points.cbWaist)
      .join(paths.waist)
      .join(paths.sideSeam)
      .close()

    //store
    const pocketMaxLength = paths.sideSeam.split(points.sideCurveStart)[1].length()
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
        points.grainlineTo = paths.hemBase.shiftFractionAlong(0.95)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      if (
        options.pocketsBool &&
        pocketOpening + pocketOpeningLength + pocketDepth < pocketMaxLength
      ) {
        points.pocketOpeningTop = paths.sideSeam.shiftAlong(pocketOpening)
        points.pocketOpeningBottom = paths.sideSeam.shiftAlong(pocketOpening + pocketOpeningLength)
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      points.title = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(paths.hemBase.shiftFractionAlong(0.5), 0.25)
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
        .shiftFractionTowards(paths.hemBase.shiftFractionAlong(0.5), 0.5)
      macro('logorg', { at: points.logo, scale: 0.5 })
      //scalebox
      points.scalebox = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(paths.hemBase.shiftFractionAlong(0.5), 0.75)
      macro('scalebox', { at: points.scalebox })
      //fitGuides
      if (
        options.fitGuides &&
        points.sideSeat.dist(points.sideHem) > measurements.waistToKnee - measurements.waistToSeat
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
      //facings
      if (options.skirtFacings) {
        const skirtFacingWidth =
          paths.sideSeam.split(points.sideCurveStart)[1].length() * options.skirtFacingWidth
        points.cbFacing = points.cbHem.shift(90, skirtFacingWidth)
        points.sideFacing = paths.sideSeam.reverse().shiftAlong(skirtFacingWidth)
        points.facingCurveStart = new Point(points.hemCurveEnd.x, points.cbFacing.y)
        points.facingCurveEnd = utils.beamsIntersect(
          points.sideFacing,
          points.sideFacing.shift(points.sideSeat.angle(points.sideSeatCp1) - 90, 1),
          points.hemCurveStart,
          points.hemCurveStart.shift(points.sideSeat.angle(points.sideSeatCp1), 1)
        )
        points.facingCurveStartCp2 = utils.beamIntersectsY(
          points.hemCurveEndCp1,
          points.hemOrigin,
          points.cbFacing.y
        )
        points.facingCurveEndCp1 = utils.beamsIntersect(
          points.hemCurveStartCp2,
          points.hemOrigin,
          points.sideFacing,
          points.facingCurveEnd
        )

        paths.facing = new Path()
          .move(points.cbFacing)
          .line(points.facingCurveStart)
          .curve(points.facingCurveStartCp2, points.facingCurveEndCp1, points.facingCurveEnd)
          .line(points.sideFacing)
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
          title: 'Facing (Skirt Back)',
          cutNr: titleCutNum,
          prefix: 'facing',
          scale: 0.25,
        })
      }

      if (sa) {
        if (options.skirtFacings) options.hemWidth = 0.01
        const hemSa = sa * options.hemWidth * 100
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'side') sideSeamSa = sa * options.closureSaWidth * 100

        points.saCbHem = new Point(points.saCbWaist.x, points.cbHem.y + hemSa)

        if (points.skirtBackDartBottom0) {
          points.saSideWaistBack = points.saSideWaistBack
            .rotate(-store.get('waistBackDartAngle0'), points.skirtBackDartBottom0)
            .rotate(-store.get('waistBackDartAngle1'), points.skirtBackDartBottom1)
        } else {
          points.saSideWaistBack = points.saSideWaistBack.rotate(
            -store.get('waistBackDartAngle'),
            points.skirtBackDartBottom
          )
        }

        points.saSideHem = points.sideHem
          .shift(points.hemCurveStart.angle(points.sideHem), sideSeamSa)
          .shift(points.sideSeatCp1.angle(points.sideSeat), hemSa)

        if (options.skirtFacings) {
          points.saCbFacing = new Point(points.saCbWaist.x, points.cbFacing.y - sa)
          points.saSideFacing = utils.beamsIntersect(
            paths.sideSeam.split(points.sideFacing)[1].offset(sideSeamSa).shiftFractionAlong(0.005),
            paths.sideSeam.split(points.sideFacing)[1].offset(sideSeamSa).start(),
            paths.facing.offset(sa).end(),
            paths.facing.offset(sa).end().shift(points.facingCurveEnd.angle(points.sideFacing), 1)
          )

          paths.facingSa = paths.hemBase
            .clone()
            .offset(hemSa)
            .line(points.saCbHem)
            .line(points.saCbFacing)
            .join(paths.facing.offset(sa))
            .line(points.saSideFacing)
            .join(paths.sideSeam.split(points.sideFacing)[1].offset(sideSeamSa))
            .line(points.saSideHem)
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saCbHem)
          .line(points.saCbWaist)
          .join(paths.waist.offset(sa))
          .line(points.saSideWaistBack)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
