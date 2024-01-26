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
  options: {},
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
        points.armholePitch.y + (points.sideHem.y - points.armholePitch.y) * 0.25
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
        points.armholePitch.y + (points.sideHem.y - points.armholePitch.y) * 0.5
      )
      macro('logorg', { at: points.logo, scale: 0.5 })
      //scalebox
      points.scalebox = new Point(
        points.shoulder.x * 0.5,
        points.armholePitch.y + (points.sideHem.y - points.armholePitch.y) * 0.75
      )
      macro('scalebox', { at: points.scalebox })
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
          .line(points.saArmhole)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
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
