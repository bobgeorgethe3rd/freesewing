import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { front as arthurFront } from '@freesewing/arthur'
import { back } from './back.mjs'

export const front = {
  name: 'alfie.front',
  from: arthurFront,
  after: back,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    patchPocketWidth: { pct: 46.6, min: 30, max: 60, menu: 'pockets.patchPockets' },
    patchPocketDepth: { pct: 95, min: 70, max: 110, menu: 'pockets.patchPockets' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for alfie
  },
  plugins: [pluginLogoRG, pluginMirror],
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
    store.set(
      'neckbandLength',
      store.get('neckbandBack') + paths.cfNeck.length() * 2 * (1 + options.neckbandLengthBonus)
    )
    store.set(
      'neckbandLengthTop',
      (store.get('neckbandBackTop') + paths.cfNeck.length()) * 2 * (1 + options.neckbandLengthBonus)
    )
    const keepThese = ['sideSeam', 'byronGuide', 'armLine', 'anchorLines']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    macro('title', false)
    //measurements
    const neckbandWidth = store.get('neckbandWidth')
    const bodyWidth = store.get('bodyWidth')
    //let's begin
    points.shoulderTop = points.hps.shiftTowards(points.shoulderRise, store.get('neckShoulder'))
    points.cfTop = points.cfNeck.shift(-90, store.get('neckbandWidth'))
    points.cfTopCorner = new Point(points.shoulderTop.x, points.cfTop.y)
    points.shoulderTopCp2 = points.shoulderTop.shiftFractionTowards(
      points.cfTopCorner,
      options.cfNeck
    )
    points.cfTopCp1 = points.cfTop.shiftFractionTowards(points.cfTopCorner, options.cfNeck)

    //hem
    points.cfHem = points.cWaist.shift(-90, store.get('bodyLength'))
    if (
      (options.fitHem || (measurements.seat / 4 || measurements.hips / 4) > points.sideWaist.x) &&
      bodyWidth > points.sideWaist.x
    ) {
      points.sideHem = points.cfHem.shift(0, bodyWidth)
    } else {
      points.sideHem = new Point(points.sideWaist.x, points.cfHem.y)
    }
    //sideHem
    points.sideHemCp2 = new Point(points.sideHem.x, (points.sideWaist.y + points.sideHem.y) / 2)
    points.sideWaistCp1 = new Point(points.sideWaist.x, (points.sideWaist.y + points.sideHem.y) / 2)

    //sleeveHem
    points.sleeveTurnoverTop = points.sleeveTop.shift(
      points.hps.angle(points.shoulderRise),
      store.get('sleeveBandWidth')
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

    paths.cfNeck = new Path()
      .move(points.shoulderTop)
      .curve(points.shoulderTopCp2, points.cfTopCp1, points.cfTop)
      .hide()

    paths.seam = new Path()
      .move(points.cfHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .line(options.sleeveHemStyle == 'cuffed' ? points.mSleeveTop : points.sleeveTurnoverTop)
      .line(points.shoulderTop)
      .join(paths.cfNeck)
      .line(points.cfHem)
      .close()

    //pocket
    const patchPocketWidth = points.shoulder.x * options.patchPocketWidth
    points.pocketMid = new Point(
      points.armholePitch.x / 2,
      points.cArmholePitch.shiftFractionTowards(points.cArmhole, 2 / 3).y
    )
    points.pocketLeft = points.pocketMid.shift(180, patchPocketWidth / 2)
    points.pocketRight = points.pocketLeft.flipX(points.pocketMid)

    //stores
    store.set('patchPocketWidth', patchPocketWidth)
    store.set('patchPocketDepth', patchPocketWidth * options.patchPocketDepth)
    store.set('neckFront', paths.cfNeck.length())
    store.set('neckFrontDepth', points.cfTop.y - points.shoulderTop.y)
    if (options.neckbandStyle == 'curved')
      store.set(
        'neckbandLength',
        store.get('neckbandBack') + paths.cfNeck.length() * 2 * (1 + options.neckbandLengthBonus)
      )
    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfTop
        points.cutOnFoldTo = points.cfHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cfNeck.shiftFractionTowards(points.cfNeckCp1, 1 / 3)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
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
      points.title = new Point(
        points.shoulder.x * 0.45,
        points.armhole.y + (points.sideHem.y - points.armhole.y) * 0.1
      )
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Front',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(
        points.shoulder.x * 0.5,
        points.armhole.y + (points.sideHem.y - points.armhole.y) * 0.4
      )
      macro('logorg', { at: points.logo, scale: 0.5 })
      //scalebox
      points.scalebox = new Point(
        points.shoulder.x * 0.5,
        points.armhole.y + (points.sideHem.y - points.armhole.y) * 0.8
      )
      macro('scalebox', { at: points.scalebox })
      //pockets
      if (options.pocketsBool) {
        paths.pocketline = new Path()
          .move(points.pocketLeft)
          .line(points.pocketRight)
          .attr('class', 'mark')
          .attr('data-text', 'Pocket line')
          .attr('data-text-class', 'center')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketLeft', 'pocketRight'],
        })
      }
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
        const cfSa = sa * options.cfSaWidth * 100
        const sleeveHemSa = sa * options.sleeveHemWidth * 100

        points.saCfHem = points.cfHem.translate(-cfSa, hemSa)
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
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saSleeveTop,
          points.saHps
        )
        points.saCfTop = points.cfTop.translate(-cfSa, -neckSa)

        paths.sa = new Path()
          .move(points.saCfHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSleeveBottom)
          .line(points.saSleeveTop)
          .line(points.saShoulderTop)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfTop)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
