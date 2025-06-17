import { back as backSarah } from '@freesewing/sarah'
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
      snap: 1.25,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Antiope
    skirtLength: { pct: 62.5, min: 0, max: 100, menu: 'style' },
    skirtLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Antiope
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Antiope
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Antiope
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
    for (let i in snippets) delete snippets[i]
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
    store.set('skirtLength', skirtLength)

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
      if (points.cbHem.y > points.cbSeat.y) snippets.cbSeat = new Snippet('bnotch', points.cbSeat)
      //title
      points.title = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(paths.hemBase.shiftFractionAlong(0.5), 0.25)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
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

      if (sa) {
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
