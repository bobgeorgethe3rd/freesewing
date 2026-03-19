import { pctBasedOn } from '@freesewing/core'
import { back as byronBack } from '@freesewing/byron'

export const back = {
  name: 'darren.back',
  from: byronBack,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    closurePosition: 'none', //Locked for Darren
    //Fit
    byronGuides: { bool: false, menu: 'fit' },
    chestEase: { pct: 10.2, min: 0, max: 20, menu: 'fit' }, //Altered for Darren
    waistEase: { pct: 25, min: 0, max: 35, menu: 'fit' }, //Altered for Darren
    hipsEase: { pct: 5.9, min: 0, max: 25, menu: 'fit' },
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' },
    //Style
    neckbandWidth: {
      pct: 3.3,
      min: 1,
      max: 6.6,
      snap: 2.5,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'style',
    },
    neckbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'hood'], menu: 'style' },
    bodyLength: { pct: 100, min: 0, max: 100, menu: 'style' },
    bodyLengthBonus: { pct: 23.1, min: -20, max: 50, menu: 'style' },
    shoulderDrop: { pct: 34.5, min: 20, max: 50, menu: 'style' },
    armholeDrop: { pct: 60, min: 0, max: 150, menu: 'style' },
    //Armhole
    // backArmholePitchWidth: { pct: 96.5, min: 95, max: 98.5, menu: 'armhole' }, //Altered for Darren
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Darren
    hemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' }, //Altered for Darren
    //Advanced
    fitWaist: { bool: false, menu: 'advanced' }, //Altered for Darren
    fitHem: { bool: false, menu: 'advanced' }, //Altered for Darren
    neckbandLengthBonus: { pct: 0, min: 0, max: 20, menu: 'advanced' },
    shoulderRise: { pct: 2.2, min: 0, max: 2.5, menu: 'advanced' },
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

    const keepThese = ['seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.byronGuides) {
      paths.byronGuide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //measurements
    const neckbandWidth = absoluteOptions.neckbandWidth
    const shoulderExtension = measurements.hpsToShoulder * options.shoulderDrop
    const armholeDrop = shoulderExtension * options.armholeDrop

    const hips = measurements.hips * (1 + options.hipsEase)
    const seat = measurements.seat * (1 + options.seatEase)

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
    bodyWidth = bodyWidth + shoulderExtension
    bodyLength = bodyLength * (1 + options.bodyLengthBonus)
    //let's begin
    points.shoulderRise = points.shoulder.shift(
      points.shoulder.angle(points.hps) - 90,
      measurements.hpsToWaistBack * options.shoulderRise
    )
    points.cbNeckCp1 = utils.beamIntersectsY(
      points.hps,
      points.shoulderRise.rotate(
        (180 - (points.hps.angle(points.shoulderRise) - 270)) * -1,
        points.hps
      ),
      points.cbNeck.y
    )

    points.shoulderNew = points.hps.shiftOutwards(points.shoulderRise, shoulderExtension)
    //neck
    points.hpsTop = points.hps.shiftTowards(points.cbNeckCp1, neckbandWidth).rotate(90, points.hps)
    points.cbTop = points.cbNeck.shift(-90, neckbandWidth)
    points.cbTopCp1 = utils.beamIntersectsY(
      points.hpsTop,
      points.hps.rotate(90, points.hpsTop),
      points.cbTop.y
    )
    points.shoulderTop = utils.beamsIntersect(
      points.cbTopCp1,
      points.hpsTop,
      points.shoulderNew,
      points.hps
    )
    //armhole
    points.armholePitchNew = points.armholePitch.translate(shoulderExtension, armholeDrop)
    points.armholeNew = points.armhole.translate(shoulderExtension, armholeDrop)

    if (points.armholeNew.y > points.sideWaist.y) {
      points.armholeNew = new Point(points.armholeNew.x, points.sideWaistCp2.y)
    }

    points.armholePitchCp2New = utils.beamIntersectsX(
      points.shoulderNew,
      points.hps.rotate(90, points.shoulderNew),
      points.armholePitchNew.x
    )
    points.armholePitchCp1New = points.armholePitchNew.shiftFractionTowards(
      new Point(points.armholePitchNew.x, points.armholeNew.y),
      options.backArmholeDepth
    )
    points.armholeCp2New = points.armholeNew.shiftFractionTowards(
      new Point(points.armholePitchNew.x, points.armholeNew.y),
      options.backArmholeDepth
    )

    //sideseam & hem
    points.sideWaistNew = points.sideWaist.shift(0, shoulderExtension)
    points.sideWaistCp2New = new Point(
      points.sideWaistNew.x,
      (points.armholeNew.y + points.sideWaistNew.y) / 2
    )

    points.cbHem = points.cWaist.shift(-90, bodyLength)
    if (
      (options.fitHem || (measurements.seat / 4 || measurements.hips / 4) > points.sideWaist.x) &&
      bodyWidth > points.sideWaistNew.x
    ) {
      points.sideHem = points.cbHem.shift(0, bodyWidth)
    } else {
      points.sideHem = new Point(points.sideWaistNew.x, points.cbHem.y)
    }
    //sideHem
    points.sideHemCp2 = new Point(points.sideHem.x, (points.sideWaist.y + points.sideHem.y) / 2)
    points.sideWaistCp1New = new Point(
      points.sideWaistNew.x,
      (points.sideWaistNew.y + points.sideHem.y) / 2
    )

    //paths
    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.sideWaistCp1New, points.sideWaistNew)
      .curve_(points.sideWaistCp2New, points.armholeNew)
      .hide()

    paths.armhole = new Path()
      .move(points.armholeNew)
      .curve(points.armholeCp2New, points.armholePitchCp1New, points.armholePitchNew)
      .curve_(points.armholePitchCp2New, points.shoulderNew)
      .hide()

    paths.cbNeckNew = new Path()
      .move(points.shoulderTop)
      ._curve(points.cbTopCp1, points.cbTop)
      .hide()

    paths.seam = new Path()
      .move(points.cbHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.cbNeckNew)
      .line(points.cbHem)
      .close()

    //stores
    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()
    store.set('neckbandWidth', neckbandWidth)
    store.set('neckShoulder', points.hps.dist(points.shoulderTop))
    store.set('bodyLength', bodyLength)
    store.set('bodyWidth', bodyWidth)
    store.set('shoulderExtension', shoulderExtension)
    store.set('armholeDrop', armholeDrop)
    store.set('neckBack', paths.cbNeckNew.length())
    store.set('neckBackDepth', points.cbTop.y - points.shoulderTop.y)
    store.set('neckBackWidth', points.shoulderTop.x)
    store.set('neckBackAngle', points.shoulderTop.angle(points.cbTopCp1))
    store.set('neckbandBack', paths.cbNeck.length() * 2 * (1 + options.neckbandLengthBonus))
    store.set('neckbandBackTop', paths.cbNeck.length())
    if (options.neckbandStyle == 'curved')
      store.set('neckbandBack', paths.cbNeck.length() * 2 * (1 + options.neckbandLengthBonus))

    store.set('scyeBackWidth', points.armholeNew.dist(points.shoulderNew))
    store.set(
      'scyeBackDepth',
      points.armholeNew.dist(points.shoulderNew) *
        Math.sin(
          utils.deg2rad(
            points.armholeNew.angle(points.shoulderNew) -
              (points.shoulderNew.angle(points.hps) - 90)
          )
        )
    )
    store.set('backArmholeLength', paths.armhole.length())
    store.set(
      'backArmholeToArmholePitch',
      new Path()
        .move(points.armholeNew)
        .curve(points.armholeCp2New, points.armholePitchCp1New, points.armholePitchNew)
        .length()
    )

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      if (options.bodyLength > 0) {
        snippets.sideWaistNew = new Snippet('notch', points.sideWaistNew)
      }
      snippets.armholePitchNew = new Snippet('bnotch', points.armholePitchNew)
      //title
      points.title = new Point(
        points.shoulderNew.x * 0.45,
        points.armholePitchNew.y + (points.sideHem.y - points.armholePitchNew.y) * 0.25
      )
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100
        const hemSa = sa * options.hemWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100

        points.saCbHem = points.cbHem.translate(-cbSa, hemSa)
        points.saSideHem = points.sideHem.translate(sideSeamSa, hemSa)

        points.saArmholeCornerNew = utils.beamsIntersect(
          points.armholeCp2New.shift(90, armholeSa),
          points.armholeNew.shift(90, armholeSa),
          paths.sideSeam.offset(sideSeamSa).end(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.999)
        )
        points.saShoulderCornerNew = points.shoulderNew
          .shift(points.hps.angle(points.shoulderNew), armholeSa)
          .shift(points.hps.angle(points.shoulderNew) + 90, shoulderSa)
        points.saHpsNew = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulderNew) + 90, 1),
          points.saShoulderCornerNew,
          points.saShoulderCornerNew.shift(points.shoulderNew.angle(points.hps), 1)
        )

        points.saShoulderTop = utils.beamsIntersect(
          paths.cbNeckNew.offset(neckSa).start(),
          paths.cbNeckNew
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulderNew) + 90, 1),
          points.saShoulderCornerNew,
          points.saHpsNew
        )
        points.saCbTop = points.cbTop.translate(-cbSa, -neckSa)

        paths.sa = new Path()
          .move(points.saCbHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCornerNew)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCornerNew)
          .line(points.saShoulderTop)
          .join(paths.cbNeckNew.offset(neckSa))
          .line(points.saCbTop)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
