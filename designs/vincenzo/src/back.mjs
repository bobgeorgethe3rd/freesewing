import { pctBasedOn } from '@freesewing/core'
import { back as byronBack } from '@freesewing/byron'

export const back = {
  name: 'vincenzo.back',
  from: byronBack,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    closurePosition: 'none', //Locked for Vincenzo
    //Fit
    byronGuides: { bool: false, menu: 'fit' },
    chestEase: { pct: 5.5, min: 0, max: 20, menu: 'fit' }, //Altered for Vincenzo
    waistEase: { pct: 12.8, min: 0, max: 35, menu: 'fit' }, //Altered for Vincenzo
    hipsEase: { pct: 5.9, min: 0, max: 25, menu: 'fit' },
    seatEase: { pct: 5.8, min: 0, max: 20, menu: 'fit' },
    //Style
    armholeDrop: { pct: 0, min: 0, max: 25, menu: 'style' },
    bodyLength: { pct: 50, min: 0, max: 100, menu: 'style' },
    bodyLengthBonus: { pct: 38.1, min: -20, max: 50, menu: 'style' },
    shoulderPitch: { pct: 60, min: 25, max: 75, menu: 'style' },
    shoulderWidth: {
      pct: 38,
      min: 20,
      max: 45,
      snap: 2.5,
      ...pctBasedOn('hpsToShoulder'),
      menu: 'style',
    },
    //Construction
    armholeSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Vincenzo
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Vincenzo
    neckSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Vincenzo
    hemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' }, //Altered for Vincenzo
    //Advanced
    fitWaist: { bool: false, menu: 'advanced' }, //Altered for Vincenzo
    fitHem: { bool: false, menu: 'advanced' }, //Altered for Vincenzo
  },
  measurements: ['hips', 'seat', 'waistToHips', 'waistToSeat'],
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
    log,
  }) => {
    //remove paths & snippets
    const keepThese = ['sideSeam', 'seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.byronGuides) {
      paths.byronGuide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    delete snippets.armholePitch
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //measurements
    const hips = measurements.hips * (1 + options.hipsEase)
    const seat = measurements.seat * (1 + options.seatEase)
    const shoulderWidth = absoluteOptions.shoulderWidth

    let bodyLength
    let bodyWidth
    if (options.bodyLength < 0.5) {
      bodyLength = measurements.waistToHips * 2 * options.bodyLength
      bodyWidth =
        points.sideWaist.x * (1 - 2 * options.bodyLength) + (hips / 4) * (2 * options.bodyLength)
    } else {
      bodyLength =
        measurements.waistToHips * (-2 * options.bodyLength + 2) +
        measurements.waistToSeat * (2 * options.bodyLength - 1)
      bodyWidth =
        (hips / 4) * (-2 * options.bodyLength + 2) + (seat / 4) * (2 * options.bodyLength - 1)
    }
    bodyLength = bodyLength * (1 + options.bodyLengthBonus)

    //let's begin
    //neck & armhole
    points.shoulderPitch = points.shoulder.shiftFractionTowards(points.hps, options.shoulderPitch)
    points.hpsTop = points.shoulderPitch.shiftTowards(points.hps, shoulderWidth * 0.5)
    points.shoulder = points.shoulderPitch.shiftTowards(points.shoulder, shoulderWidth * 0.5)
    points.armhole = paths.sideSeam.reverse().shiftFractionAlong(options.armholeDrop)
    points.armholePitch = points.cArmholePitch.shift(
      0,
      points.shoulder.x * options.backArmholePitchWidth
    )
    points.armholePitchCp2 = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )
    points.armholeCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )

    points.cbTop = utils.beamIntersectsX(
      points.hpsTop,
      points.hpsTop.shift(points.hps.angle(points.cbNeck), 1),
      points.cbNeck.x
    )

    points.cbTopCp1 = utils.beamIntersectsY(
      points.hpsTop,
      points.hpsTop.shift(points.hps.angle(points.cbNeckCp1), 1),
      points.cbTop.y
    )

    //hem
    points.cbHem = points.cWaist.shift(-90, bodyLength)
    if (
      (options.fitHem || (measurements.seat / 4 || measurements.hips / 4) > points.sideWaist.x) &&
      bodyWidth > points.sideWaist.x
    ) {
      points.sideHem = points.cbHem.shift(0, bodyWidth)
    } else {
      points.sideHem = new Point(points.sideWaist.x, points.cbHem.y)
    }
    //sideHem
    points.sideHemCp2 = new Point(points.sideHem.x, (points.sideWaist.y + points.sideHem.y) / 2)
    points.sideWaistCp1 = new Point(points.sideWaist.x, (points.sideWaist.y + points.sideHem.y) / 2)
    //paths
    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.sideWaistCp1, points.sideWaist)
      .join(paths.sideSeam)
      .hide()

    if (!points.armhole.sitsRoughlyOn(paths.sideSeam.end())) {
      paths.sideSeam = paths.sideSeam.split(points.armhole)[0]
    }

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.cbNeck = new Path().move(points.hpsTop)._curve(points.cbTopCp1, points.cbTop).hide()

    paths.seam = new Path()
      .move(points.cbHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.hpsTop)
      .join(paths.cbNeck)
      .line(points.cbHem)
      .close()

    //stores
    store.set('bodyLength', bodyLength)
    store.set('bodyWidth', bodyWidth)
    store.set('shoulderWidth', shoulderWidth)
    store.set('neckBack', paths.cbNeck.length())
    store.set('armholeBack', paths.armhole.length())

    if (complete) {
      //grainline
      let titleCutNum
      if (options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cbTop.shiftFractionTowards(points.cbTopCp1, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      if (options.bodyLength > 0) {
        snippets.sideWaist = new Snippet('notch', points.sideWaist)
      }
      snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
      //title
      points.title = new Point(
        points.shoulder.x * 0.45,
        points.armholePitch.y + (points.sideHem.y - points.armholePitch.y) * 0.25
      )
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100

        points.saCbHem = points.cbHem.translate(-cbSa, hemSa)
        points.saSideHem = points.sideHem.translate(sideSeamSa, hemSa)

        points.saArmholeCorner = utils.beamIntersectsY(
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.995),
          paths.sideSeam.offset(sideSeamSa).end(),
          points.armhole.y - armholeSa
        )

        points.saShoulderCorner = utils.beamsIntersect(
          points.armholePitchCp2
            .shiftTowards(points.shoulder, armholeSa)
            .rotate(-90, points.armholePitchCp2),
          points.shoulder
            .shiftTowards(points.armholePitchCp2, armholeSa)
            .rotate(90, points.shoulder),
          points.saShoulderCorner,
          points.saHps
        )

        points.saShoulderTop = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saShoulderCorner,
          points.saHps
        )
        points.saCbTop = points.cbTop.translate(-cbSa, -neckSa)

        paths.sa = new Path()
          .move(points.saCbHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbTop)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
