import { pctBasedOn } from '@freesewing/core'
import { backBase } from './backBase.mjs'

export const back = {
  name: 'sydney.back',
  from: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Fit
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
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Sydney
    hemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' }, //Altered for Sydney
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Sydney
    //Advanced
    fitHem: { bool: false, menu: 'advanced' },
    neckbandLengthBonus: { pct: 0, min: 0, max: 20, menu: 'advanced' },
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
    //measurements
    const neckbandWidth = absoluteOptions.neckbandWidth
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
    points.hpsTop = points.hps.shiftTowards(points.cbNeckCp1, neckbandWidth).rotate(90, points.hps)
    points.cbTop = points.cbNeck.shift(-90, neckbandWidth)
    points.cbTopCp1 = utils.beamsIntersect(
      points.hpsTop,
      points.hps.rotate(90, points.hpsTop),
      points.cbTop,
      points.cbTop.shift(0, 1)
    )
    points.shoulderTop = utils.beamsIntersect(
      points.cbTopCp1,
      points.hpsTop,
      points.shoulderRise,
      points.hps
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
      .join(paths.sideSeam.split(points.underArmCurveStart)[0])
      .line(points.underArmCurveAnchor)
      .hide()

    paths.cbNeck = new Path().move(points.shoulderTop)._curve(points.cbTopCp1, points.cbTop).hide()

    paths.seam = new Path()
      .move(points.cbHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .line(points.shoulderSplit)
      .line(points.shoulderTop)
      .join(paths.cbNeck)
      .line(points.cbHem)
      .close()

    //stores
    store.set('neckbandWidth', neckbandWidth)
    store.set('neckShoulder', points.hps.dist(points.shoulderTop))
    store.set('bodyLength', bodyLength)
    store.set('bodyWidth', bodyWidth)
    store.set('neckBack', paths.cbNeck.length())
    store.set('neckBackDepth', points.cbTop.y - points.shoulderTop.y)
    store.set('neckBackWidth', points.shoulderTop.x)
    store.set('neckBackAngle', points.shoulderTop.angle(points.cbTopCp1))
    if (options.neckbandStyle == 'curved')
      store.set('neckbandBack', paths.cbNeck.length() * 2 * (1 + options.neckbandLengthBonus))

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
        snippets.sideWaist = new Snippet('notch', points.sideWaist)
      }
      macro('sprinkle', {
        snippet: 'notch',
        on: ['underArmCurveAnchor', 'shoulderSplit'],
      })
      //title
      points.title = new Point(points.shoulderSplit.x * 0.45, points.armholeDrop.y)
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
        const neckSa = sa * options.neckSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100

        points.saCbHem = points.cbHem.translate(-cbSa, hemSa)
        points.saSideHem = points.sideHem.translate(sideSeamSa, hemSa)

        if (points.sideWaist.x == points.armhole.x) {
          points.saUnderArmCurveAnchor = points.underArmCurveAnchor.shift(0, sideSeamSa)
        } else {
          points.saUnderArmCurveAnchor = utils.beamIntersectsX(
            points.underArmCurveStart
              .shiftTowards(points.underArmCurveAnchor, sideSeamSa)
              .rotate(-90, points.underArmCurveStart),
            points.underArmCurveAnchor
              .shiftTowards(points.underArmCurveStart, sideSeamSa)
              .rotate(90, points.underArmCurveAnchor),
            points.underArmCurveAnchor.x + sideSeamSa
          )
        }
        points.saShoulderSplit = utils.beamIntersectsX(
          points.saSleeveTop,
          points.saHps,
          points.saUnderArmCurveAnchor.x
        )

        points.saShoulderTop = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saSleeveTop,
          points.saHps
        )
        points.saCbTop = points.cbTop.translate(-cbSa, -neckSa)

        paths.sa = new Path()
          .move(points.saCbHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saUnderArmCurveAnchor)
          .line(points.saShoulderSplit)
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
