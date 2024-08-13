import { pctBasedOn } from '@freesewing/core'
import { back as byronBack } from '@freesewing/byron'

export const back = {
  name: 'terry.back',
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
    chestEase: { pct: 10.2, min: 0, max: 20, menu: 'fit' }, //Altered for Vincenzo
    waistEase: { pct: 25, min: 0, max: 35, menu: 'fit' }, //Altered for Vincenzo
    hipsEase: { pct: 5.9, min: 0, max: 25, menu: 'fit' },
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' },
    //Style
    bodyLength: { pct: 50, min: 0, max: 100, menu: 'style' },
    bodyLengthBonus: { pct: 38.1, min: -20, max: 50, menu: 'style' },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Vincenzo
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
    const keepThese = ['armhole', 'seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.byronGuides) {
      paths.byronGuide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //measurements
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
    bodyLength = bodyLength * (1 + options.bodyLengthBonus)

    //let's begin
    //neck

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

    store.set('bodyLength', bodyLength)
    store.set('bodyWidth', bodyWidth)

    /*  if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      if (options.bodyLength > 0) {
        snippets.sideWaist = new Snippet('notch', points.sideWaist)
      }
      //title
      points.title = new Point(
        points.shoulder.x * 0.45,
        points.armholePitch.y + (points.sideHem.y - points.armholePitch.y) * 0.25
      )
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
        scale: 0.5,
      })
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100

        points.saCbHem = points.cbHem.translate(-cbSa, hemSa)
        points.saSideHem = points.sideHem.translate(sideSeamSa, hemSa)

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
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbTop)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    } */
    return part
  },
}
