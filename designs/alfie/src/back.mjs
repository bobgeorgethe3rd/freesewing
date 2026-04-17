import { pctBasedOn } from '@freesewing/core'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { back as arthurBack } from '@freesewing/arthur'

export const back = {
  name: 'alfie.back',
  from: arthurBack,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    closurePosition: 'none', //Locked for Alfie
    //Fit
    chestEase: { pct: 10.2, min: 0, max: 20, menu: 'fit' }, //Altered for Alfie
    waistEase: { pct: 25, min: 0, max: 35, menu: 'fit' }, //Altered for Alfie
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
    //Sleeves
    sleeveLength: { pct: 25, min: 0, max: 100, menu: 'sleeves' }, //Altered for Alfie
    sleeveHemStyle: { dflt: 'turnover', list: ['cuffed', 'turnover'], menu: 'sleeves' },
    sleeveBandWidth: {
      pct: 3.5,
      min: 1,
      max: 17.4,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Alfie
    hemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' }, //Altered for Alfie
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Alfie
    sleeveHemWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    //Advanced
    fitWaist: { bool: false, menu: 'advanced' }, //Altered for Alfie
    fitHem: { bool: false, menu: 'advanced' },
    neckbandLengthBonus: { pct: 0, min: 0, max: 20, menu: 'advanced' },
  },
  measurements: ['hips', 'seat', 'waistToHips', 'waistToSeat'],
  plugins: [pluginMirror],
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
    store.set('neckbandBack', paths.cbNeck.length() * 2 * (1 + options.neckbandLengthBonus))
    store.set('neckbandBackTop', paths.cbNeck.length())
    const keepThese = ['sideSeam', 'byronGuide', 'armLine', 'anchorLines']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    // for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    macro('cutonfold', false)
    //let's begin
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

    points.sleeveBandAnchor = utils.beamsIntersect(
      points.sleeveBottom,
      points.sleeveBottom.shift(points.shoulderRise.angle(points.hps), 1),
      points.underArmCurveStart,
      points.underArmCurveStart.shift(points.hps.angle(points.shoulderRise) + 90, 1)
    )
    //due to buggy intersection it needs to 0.995 of the distance
    const sleeveBandWidth =
      absoluteOptions.sleeveBandWidth >= points.sleeveBottom.dist(points.sleeveBandAnchor)
        ? points.sleeveBottom.dist(points.sleeveBandAnchor) * 0.995
        : absoluteOptions.sleeveBandWidth
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
    //sleeveHem
    points.sleeveTurnoverTop = points.sleeveTop.shift(
      points.hps.angle(points.shoulderRise),
      sleeveBandWidth
    )
    points.sleeveTurnoverAnchor = points.sleeveTurnoverTop.rotate(180, points.sleeveTop)
    points.mSleeveTop = points.sleeveTop.rotate(180, points.sleeveTurnoverTop)

    const sleeveTurnoverI = utils.lineIntersectsCurve(
      points.sleeveTurnoverAnchor,
      points.sleeveTurnoverAnchor.shift(
        points.shoulderRise.angle(points.hps) + 90,
        points.sleeveTopMin.dist(points.sleeveBottomMin) * 10
      ),
      points.underArmCurveStart,
      points.underArmCurveStartCp2,
      points.sleeveBottomMinCp1,
      points.sleeveBottomMin
    )

    points.sleeveTurnoverSplit = sleeveTurnoverI
      ? sleeveTurnoverI
      : utils.beamsIntersect(
          points.sleeveTurnoverAnchor,
          points.sleeveTurnoverAnchor.shift(points.shoulderRise.angle(points.hps) + 90, 1),
          points.underArmCurveAnchor,
          points.sleeveBottomMax
        )

    paths.sideSeamSplit = sleeveTurnoverI
      ? paths.sideSeam.split(points.sleeveTurnoverSplit)[1].hide()
      : new Path().move(points.sleeveTurnoverSplit).line(points.sleeveBottom).hide()

    macro('mirror', {
      mirror: [points.sleeveBottom, points.sleeveTop],
      points: ['sleeveTurnoverSplit'],
      paths: ['sideSeamSplit'],
      prefix: 'm',
    })

    macro('mirror', {
      mirror: [points.mSleeveTurnoverSplit, points.sleeveTurnoverTop],
      points: ['sleeveBottom'],
      prefix: 'm',
    })

    paths.mSideSeamSplit = paths.mSideSeamSplit.reverse().hide()

    if (sleeveTurnoverI) {
      const shift = [
        'underArmCurveStart',
        'underArmCurveStartCp2',
        'sleeveBottomMinCp1',
        'sleeveBottomMin',
      ]
      for (const p of shift)
        points[p + 'S'] = points[p].shift(
          points.sleeveTurnoverSplit.angle(points.mSleeveTurnoverSplit),
          points.sleeveTurnoverSplit.dist(points.mSleeveTurnoverSplit)
        )
      paths.sleeveBottomCuff = new Path()
        .move(points.underArmCurveStartS)
        .curve(points.underArmCurveStartCp2S, points.sleeveBottomMinCp1S, points.sleeveBottomMinS)
        .line(points.mSleeveBottom)
        .split(points.mSleeveTurnoverSplit)[1]
        .hide()
    } else {
      paths.sleeveBottomCuff = new Path()
        .move(points.mSleeveTurnoverSplit)
        .line(points.mSleeveBottom)
        .hide()
    }

    //paths
    paths.sideSeamI = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.sideWaistCp1, points.sideWaist)
      .join(paths.sideSeam)
      .join(paths.mSideSeamSplit)
      .hide()

    paths.sideSeam =
      options.sleeveHemStyle == 'cuffed'
        ? paths.sideSeamI.join(paths.sleeveBottomCuff)
        : paths.sideSeamI.hide()

    paths.cbNeck = new Path().move(points.shoulderTop)._curve(points.cbTopCp1, points.cbTop).hide()

    paths.seam = new Path()
      .move(points.cbHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .line(options.sleeveHemStyle == 'cuffed' ? points.mSleeveTop : points.sleeveTurnoverTop)
      .line(points.shoulderTop)
      .join(paths.cbNeck)
      .line(points.cbHem)
      .close()

    //stores
    store.set('neckbandWidth', neckbandWidth)
    store.set('neckShoulder', points.hps.dist(points.shoulderTop))
    store.set('bodyLength', bodyLength)
    store.set('bodyWidth', bodyWidth)
    store.set('sleeveBandWidth', sleeveBandWidth)
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
      //title
      points.title = new Point(points.shoulderRise.x * 0.45, points.armholeDrop.y)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      //foldlines
      paths.hemFold = new Path()
        .move(points.sleeveBottom)
        .line(points.sleeveTop)
        .attr('class', 'mark help')
        .attr('data-text', 'Hem Fold-line')
        .attr('data-text-class', 'center')
      if (options.sleeveHemStyle == 'cuffed') {
        paths.cuffFold = new Path()
          .move(points.mSleeveTurnoverSplit)
          .line(points.sleeveTurnoverTop)
          .attr('class', 'mark help')
          .attr('data-text', 'Cuff Fold-line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100
        const sleeveHemSa = sa * options.sleeveHemWidth * 100

        points.saCbHem = points.cbHem.translate(-cbSa, hemSa)
        points.saSideHem = points.sideHem.translate(sideSeamSa, hemSa)

        points.saSleeveBottom =
          options.sleeveHemStyle == 'cuffed'
            ? utils.beamsIntersect(
                paths.sleeveBottomCuff.offset(sideSeamSa).shiftFractionAlong(0.995),
                paths.sleeveBottomCuff.offset(sideSeamSa).end(),
                points.mSleeveBottom.shift(points.hps.angle(points.shoulderRise), sleeveHemSa),
                points.mSleeveTop.shift(points.hps.angle(points.shoulderRise), sleeveHemSa)
              )
            : utils.beamsIntersect(
                paths.mSideSeamSplit.offset(sideSeamSa).shiftFractionAlong(0.995),
                paths.mSideSeamSplit.offset(sideSeamSa).end(),
                points.mSleeveTurnoverSplit.shift(
                  points.hps.angle(points.shoulderRise),
                  sleeveHemSa
                ),
                points.sleeveTurnoverTop.shift(points.hps.angle(points.shoulderRise), sleeveHemSa)
              )

        points.saSleeveTop = utils.beamsIntersect(
          points.saSleeveBottom,
          points.saSleeveBottom.shift(points.hps.angle(points.shoulderRise) + 90, 1),
          points.saHps,
          points.saSleeveTop
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
          .line(points.saSleeveBottom)
          .line(points.saSleeveTop)
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
