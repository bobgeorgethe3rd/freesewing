import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { front as byronFront } from '@freesewing/byron'
import { back } from './back.mjs'

export const front = {
  name: 'terry.front',
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
    patchPocketDepth: { pct: 91.6, min: 70, max: 110, menu: 'pockets.patchPockets' },
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
      'neckbandLengthTop',
      store.get('neckbandBackTop') + paths.cfNeck.length() * 2 * (1 + options.neckbandEase)
    )
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
    //measurements
    const neckbandWidth = store.get('neckbandWidth')
    //let's begin
    points.shoulderTop = points.hps.shiftTowards(points.shoulder, store.get('neckShoulder'))
    points.cfHead = points.cfNeck.shift(-90, store.get('neckbandWidth'))
    points.cfHeadCorner = new Point(points.shoulderTop.x, points.cfHead.y)
    points.shoulderTopCp2 = points.shoulderTop.shiftFractionTowards(
      points.cfHeadCorner,
      options.cfNeck
    )
    points.cfHeadCp1 = points.cfHead.shiftFractionTowards(points.cfHeadCorner, options.cfNeck)
    //hem
    points.cfHem = points.cWaist.shift(-90, store.get('bodyLength'))
    if (options.fitSide) {
      points.sideHem = points.cfHem.shift(0, store.get('bodyWidth'))
    } else {
      points.sideHem = new Point(points.armhole.x, points.cfHem.y)
    }
    //sideHem
    points.sideHemCp2 = new Point(points.sideHem.x, (points.sideWaist.y + points.sideHem.y) / 2)
    points.sideWaistCp1 = new Point(points.sideWaist.x, (points.sideWaist.y + points.sideHem.y) / 2)
    //paths
    paths.hemBase = new Path().move(points.cfHem).line(points.sideHem).hide()

    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.sideWaistCp1, points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
      .hide()

    paths.cfNeck = new Path()
      .move(points.shoulderTop)
      .curve(points.shoulderTopCp2, points.cfHeadCp1, points.cfHead)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
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
    store.set('neckFrontDepth', points.cfHead.y - points.shoulderTop.y)
    store.set(
      'neckbandLength',
      (store.get('neckBack') + store.get('neckFront')) * 2 * (1 + options.neckbandEase)
    )
    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfHead
      points.cutOnFoldTo = points.cfHem
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
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
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cfSa = sa * options.cfSaWidth * 100

        points.saCfHem = points.cfHem.translate(-cfSa, hemSa)
        points.saSideHem = points.sideHem.translate(sideSeamSa, hemSa)

        points.saShoulderTop = utils.beamsIntersect(
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saShoulderCorner,
          points.saHps
        )
        points.saCfHead = points.cfHead.translate(-cfSa, -neckSa)

        paths.sa = new Path()
          .move(points.saCfHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfHead)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
