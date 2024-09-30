import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { frontBase } from './frontBase.mjs'

export const centreFront = {
  name: 'petunia.centreFront',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    skirtSlit: { pct: 0, min: 0, max: 75, menu: 'style' },
    //Construction
    skirtHemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
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
    log,
  }) => {
    //removing paths and snippets not required from Bella
    if (options.daisyGuides) {
      const keepThese = 'daisyGuide'
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.cfHem)
      .curve(points.cfHemCp2, points.cfHemRightCp1, points.cfHemRight)
      .hide()

    paths.saTop = new Path()
      .move(points.sideWaist)
      .curve(points.sideWaistCp1, points.cfNeckCp2, points.cfNeck)
      .split(points.cfWaistLeft)[1]
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.cfWaistLeft)
      .join(paths.saTop)
      .line(points.cfHem)
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfChest
        points.cutOnFoldTo = points.cfHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cfHem.shiftFractionTowards(points.cfHemCp2, 0.35)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfChest.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      points.waistNotch = points.cfWaistLeft.shiftTowards(
        points.cfHemRight,
        points.cfWaistLeft.dist(points.waistDartLeft)
      )
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfWaist', 'waistNotch'],
      })
      //title
      points.title = new Point(
        points.cfWaistLeft.x * 0.4,
        points.cfWaistLeft.y + ((points.cfHemRight.y - points.cfWaistLeft.y) * 1) / 6
      )
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Centre Front',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(
        points.cfWaistLeft.x * 0.5,
        points.cfWaistLeft.y + ((points.cfHemRight.y - points.cfWaistLeft.y) * 2) / 3
      )
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
      })
      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100

        points.saCfHemRight = points.cfHemRight
          .shift(points.cfWaistLeft.angle(points.cfHemRight), hemSa)
          .shift(points.cfHemRightCp1.angle(points.cfHemRight), sa)

        if (options.skirtSlit > 0) {
          points.saSlitBottom = points.cfHemRight
            .shift(points.cfWaistLeft.angle(points.cfHemRight), hemSa)
            .shift(points.cfHemRightCp1.angle(points.cfHemRight), hemSa)
          points.saSlitTopRight = points.cfHemRight
            .shiftFractionTowards(points.cfWaistLeft, options.skirtSlit)
            .shift(points.cfHemRightCp1.angle(points.cfHemRight), hemSa)
          points.saSlitTopLeft = points.cfHemRight
            .shiftFractionTowards(points.cfWaistLeft, options.skirtSlit)
            .shift(points.cfHemRight.angle(points.cfWaistLeft), sa)
            .shift(points.cfHemRightCp1.angle(points.cfHemRight), sa)
        } else {
          points.saSlitBottom = points.saCfHemRight
          points.saSlitTopRight = points.saCfHemRight
          points.saSlitTopLeft = points.saCfHemRight
        }

        points.saWaistLeft = utils.beamsIntersect(
          points.saCfHemRight,
          points.saCfHemRight.shift(points.cfHemRight.angle(points.cfWaistLeft), 1),
          paths.saTop.offset(sa).start(),
          paths.saTop.offset(sa).shiftFractionAlong(0.01)
        )

        points.saCfNeck = utils.beamIntersectsX(
          points.cfNeckCp2.shiftTowards(points.cfNeck, sa).rotate(-90, points.cfNeckCp2),
          points.cfNeck.shiftTowards(points.cfNeckCp2, sa).rotate(90, points.cfNeck),
          points.cfNeck.x - sa * options.cfSaWidth * 100
        )

        points.saCfHem = new Point(points.saCfNeck.x, paths.hemBase.offset(hemSa).start().y)

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saCfHemRight)
          .line(points.saSlitBottom)
          .line(points.saSlitTopRight)
          .line(points.saSlitTopLeft)
          .line(points.saWaistLeft)
          .join(paths.saTop.offset(sa))
          .line(points.saCfNeck)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
