import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { front as arthurFront } from '@freesewing/arthur'
import { back } from './back.mjs'

export const front = {
  name: 'sydney.front',
  from: arthurFront,
  after: back,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    patchPocketWidth: { pct: 38.7, min: 30, max: 60, menu: 'pockets.patchPockets' },
    patchPocketDepth: { pct: 120, min: 70, max: 130, menu: 'pockets.patchPockets' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Sydney
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
    for (let i in snippets) delete snippets[i]
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
    points.shoulderSplit = utils.beamIntersectsX(
      points.hps,
      points.sleeveTop,
      points.underArmCurveAnchor.x
    )
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
    //paths
    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.sideWaistCp1, points.sideWaist)
      .join(paths.sideSeam.split(points.underArmCurveStart)[0])
      .line(points.underArmCurveAnchor)
      .hide()

    paths.cfNeck = new Path()
      .move(points.shoulderTop)
      .curve(points.shoulderTopCp2, points.cfTopCp1, points.cfTop)
      .hide()

    paths.seam = new Path()
      .move(points.cfHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .line(points.shoulderSplit)
      .line(points.shoulderTop)
      .join(paths.cfNeck)
      .line(points.cfHem)
      .close()

    //pocket
    const patchPocketWidth = points.shoulderSplit.x * options.patchPocketWidth
    points.pocketMid = new Point(
      points.shoulderSplit.x / 2,
      points.cfNeck.shiftFractionTowards(new Point(points.cfNeck.x, points.armholeDrop.y), 2 / 3).y
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
      macro('sprinkle', {
        snippet: 'notch',
        on: ['underArmCurveAnchor', 'shoulderSplit'],
      })
      //title
      points.title = new Point(points.shoulderSplit.x * 0.45, points.armholeDrop.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Front',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(
        points.shoulderSplit.x * 0.5,
        points.armholeDrop.y + ((points.sideHem.y - points.armholeDrop.y) * 1) / 3
      )
      macro('logorg', { at: points.logo, scale: 0.5 })
      //scalebox
      points.scalebox = new Point(
        points.shoulderSplit.x * 0.5,
        points.armholeDrop.y + ((points.sideHem.y - points.armholeDrop.y) * 2) / 3
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
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cfSa = sa * options.cfSaWidth * 100

        points.saCfHem = points.cfHem.translate(-cfSa, hemSa)
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
          .line(points.saUnderArmCurveAnchor)
          .line(points.saShoulderSplit)
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
