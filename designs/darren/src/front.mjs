import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { front as byronFront } from '@freesewing/byron'
import { back } from './back.mjs'

export const front = {
  name: 'darren.front',
  from: byronFront,
  after: back,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Armhole
    // frontArmholePitchWidth: { pct: 95.4, min: 95, max: 97, menu: 'armhole' }, //Altered for Darren
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    patchPocketWidth: { pct: 46.6, min: 30, max: 60, menu: 'pockets.patchPockets' },
    patchPocketDepth: { pct: 95, min: 70, max: 110, menu: 'pockets.patchPockets' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Darren
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
    //measurements
    const neckbandWidth = store.get('neckbandWidth')
    const bodyWidth = store.get('bodyWidth')
    const shoulderExtension = store.get('shoulderExtension')
    const armholeDrop = store.get('armholeDrop')
    //let's begin
    points.shoulderRise = points.shoulder.shift(
      points.shoulder.angle(points.hps) - 90,
      measurements.hpsToWaistBack * options.shoulderRise
    )
    points.shoulderNew = points.hps.shiftOutwards(points.shoulderRise, shoulderExtension)

    points.shoulderTop = points.hps.shiftTowards(points.shoulderNew, store.get('neckShoulder'))
    points.cfTop = points.cfNeck.shift(-90, store.get('neckbandWidth'))
    points.cfTopCorner = new Point(points.shoulderTop.x, points.cfTop.y)
    points.shoulderTopCp2 = points.shoulderTop.shiftFractionTowards(
      points.cfTopCorner,
      options.cfNeck
    )
    points.cfTopCp1 = points.cfTop.shiftFractionTowards(points.cfTopCorner, options.cfNeck)
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
    points.cfHem = points.cWaist.shift(-90, store.get('bodyLength'))
    if (
      (options.fitHem || (measurements.seat / 4 || measurements.hips / 4) > points.sideWaist.x) &&
      bodyWidth > points.sideWaistNew.x
    ) {
      points.sideHem = points.cfHem.shift(0, bodyWidth)
    } else {
      points.sideHem = new Point(points.sideWaistNew.x, points.cfHem.y)
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

    paths.cfNeck = new Path()
      .move(points.shoulderTop)
      .curve(points.shoulderTopCp2, points.cfTopCp1, points.cfTop)
      .hide()

    paths.seam = new Path()
      .move(points.cfHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.shoulderTop)
      .join(paths.cfNeck)
      .line(points.cfHem)
      .close()

    //pocket
    const patchPocketWidth = points.shoulderNew.x * options.patchPocketWidth
    points.pocketMid = new Point(
      points.armholePitchNew.x / 2,
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

    store.set('scyeFrontWidth', points.armholeNew.dist(points.shoulderNew))
    store.set(
      'scyeFrontDepth',
      points.armholeNew.dist(points.shoulderNew) *
        Math.sin(
          utils.deg2rad(
            points.armholeNew.angle(points.shoulderNew) -
              (points.shoulderNew.angle(points.hps) - 90)
          )
        )
    )
    store.set('frontArmholeLength', paths.armhole.length())
    store.set(
      'frontArmholeToArmholePitch',
      new Path()
        .move(points.armholeNew)
        .curve(points.armholeCp2New, points.armholePitchCp1New, points.armholePitchNew)
        .length()
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
        snippets.sideWaistNew = new Snippet('notch', points.sideWaistNew)
      }
      snippets.armholePitchNew = new Snippet('notch', points.armholePitchNew)
      //title
      points.title = new Point(
        points.shoulderNew.x * 0.45,
        points.armholeNew.y + (points.sideHem.y - points.armholeNew.y) * 0.1
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
        points.shoulderNew.x * 0.5,
        points.armholeNew.y + (points.sideHem.y - points.armholeNew.y) * 0.4
      )
      macro('logorg', { at: points.logo, scale: 0.5 })
      //scalebox
      points.scalebox = new Point(
        points.shoulderNew.x * 0.5,
        points.armholeNew.y + (points.sideHem.y - points.armholeNew.y) * 0.8
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
        const armholeSa = sa * options.armholeSaWidth * 100
        const hemSa = sa * options.hemWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cfSa = sa * options.cfSaWidth * 100

        points.saCfHem = points.cfHem.translate(-cfSa, hemSa)
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
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulderNew) + 90, 1),
          points.saShoulderCornerNew,
          points.saShoulderCornerNew.shift(points.shoulderNew.angle(points.hps), 1)
        )
        points.saShoulderTop = utils.beamsIntersect(
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulderNew) + 90, 1),
          points.saShoulderCornerNew,
          points.saHpsNew
        )
        points.saCfTop = points.cfTop.translate(-cfSa, -neckSa)

        paths.sa = new Path()
          .move(points.saCfHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCornerNew)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCornerNew)
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
