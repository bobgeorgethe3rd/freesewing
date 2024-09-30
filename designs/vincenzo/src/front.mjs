import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { front as byronFront } from '@freesewing/byron'
import { back } from './back.mjs'

export const front = {
  name: 'vincenzo.front',
  from: byronFront,
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
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Vincenzo
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
    //measurements
    const shoulderWidth = store.get('shoulderWidth')
    const bodyWidth = store.get('bodyWidth')
    const patchPocketWidth = points.shoulder.x * options.patchPocketWidth
    //let's begin
    //neck & armhole
    points.shoulderPitch = points.shoulder.shiftFractionTowards(points.hps, options.shoulderPitch)
    points.hpsTop = points.shoulderPitch.shiftTowards(points.hps, shoulderWidth * 0.5)
    points.shoulder = points.shoulderPitch.shiftTowards(points.shoulder, shoulderWidth * 0.5)
    points.armhole = paths.sideSeam.reverse().shiftFractionAlong(options.armholeDrop)
    points.armholePitch = points.cArmholePitch.shift(
      0,
      points.shoulder.x * options.frontArmholePitchWidth
    )
    points.armholePitchCp2 = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.frontArmholeDepth
    )

    points.armholeCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.frontArmholeDepth
    )
    points.cfTop = utils.beamIntersectsX(
      points.hpsTop,
      points.hpsTop.shift(points.hps.angle(points.cfNeck), 1),
      points.cfNeck.x
    )

    points.cfTopCorner = new Point(points.hpsTop.x, points.cfTop.y)
    points.hpsTopCp2 = points.hpsTop.shiftFractionTowards(points.cfTopCorner, options.cfNeck)
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
    //paths
    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.sideWaistCp1, points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
      .hide()

    if (!points.armhole.sitsRoughlyOn(paths.sideSeam.end())) {
      paths.sideSeam = paths.sideSeam.split(points.armhole)[0]
    }

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.cfNeck = new Path()
      .move(points.hpsTop)
      .curve(points.hpsTopCp2, points.cfTopCp1, points.cfTop)
      .hide()

    paths.seam = new Path()
      .move(points.cfHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.hpsTop)
      .join(paths.cfNeck)
      .close()

    //pocket
    points.pocketMid = new Point(
      points.armholePitch.x / 2,
      points.cArmholePitch.shiftFractionTowards(points.cArmhole, 2 / 3).y
    )
    points.pocketLeft = points.pocketMid.shift(180, patchPocketWidth / 2)
    points.pocketRight = points.pocketLeft.flipX(points.pocketMid)

    //stores
    store.set('patchPocketWidth', patchPocketWidth)
    store.set('patchPocketDepth', patchPocketWidth * options.patchPocketDepth)
    if (complete) {
      //grainline
      let titleCutNum
      if (options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfTop
        points.cutOnFoldTo = points.cfHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cfTop.shiftFractionTowards(points.cfTopCp1, 1 / 3)
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
      snippets.armholePitch = new Snippet('notch', points.armholePitch)
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
      //binding info
      points.neckBinding = new Point(points.armholePitch.x, points.sideHem.y * 0.85).attr(
        'data-text',
        'Neck Binding Length: ' + utils.units((paths.cfNeck.length() + store.get('neckBack')) * 2)
      )
      points.armholeBinding = new Point(points.armholePitch.x, points.sideHem.y * 0.9).attr(
        'data-text',
        'Armhole Binding Length: ' + utils.units(paths.armhole.length() + store.get('armholeBack'))
      )
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cfSa = sa * options.cfSaWidth * 100

        points.saCfHem = points.cfHem.translate(-cfSa, hemSa)
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
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saShoulderCorner,
          points.saHps
        )
        points.saCfTop = points.cfTop.translate(-cfSa, -neckSa)

        paths.sa = new Path()
          .move(points.saCfHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saShoulderCorner)
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
