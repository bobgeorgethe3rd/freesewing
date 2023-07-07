import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'

export const frontLeft = {
  name: 'shaun.frontLeft',
  from: frontBase,
  after: [backBase, back],
  hide: {
    from: true,
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
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //settings
    if (!options.independentPlacketStyles) {
      options.buttonPlacketStyle = options.buttonholePlacketStyle
    }
    //let's begin
    const drawSeamLeft = () => {
      if (options.placketOverlapSide == 'right') {
        if (options.buttonPlacketStyle == 'separate') {
          return new Path().move(points.buttonNeck).line(points.buttonHem)
        }
        if (options.buttonPlacketStyle == 'inbuilt') {
          return new Path().move(points.fBButtonNeck).line(points.fBButtonHem)
        }
        if (options.buttonPlacketStyle == 'facing') {
          return new Path().move(points.buttonNeckEx).line(points.buttonHemEx)
        }
      } else {
        if (options.buttonholePlacketStyle == 'separate') {
          return new Path().move(points.buttonholeNeck).line(points.buttonholeHem)
        }
        if (options.buttonholePlacketStyle == 'inbuilt') {
          return new Path().move(points.fBHButtonholeNeck).line(points.fBHButtonholeHem)
        }
        if (options.buttonholePlacketStyle == 'facing') {
          return new Path().move(points.buttonholeNeckEx).line(points.buttonholeHemEx)
        }
      }
    }

    const drawNeck = () => {
      if (options.placketOverlapSide == 'right') {
        if (options.buttonPlacketStyle == 'separate') {
          return new Path()
            .move(points.hps)
            .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
            .split(points.buttonNeck)[0]
        }
        if (options.buttonPlacketStyle == 'inbuilt') {
          return new Path()
            .move(points.hps)
            .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
            .line(points.fBCfNeck)
            .curve(points.fBCfNeckCp2, points.fBCfNeckCp1, points.fBHps)
            .split(points.fBButtonNeck)[0]
        }
        if (options.buttonPlacketStyle == 'facing') {
          return new Path()
            .move(points.hps)
            .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
            .line(points.buttonNeckEx)
        }
      } else {
        if (options.buttonholePlacketStyle == 'separate') {
          return new Path()
            .move(points.hps)
            .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
            .split(points.buttonholeNeck)[0]
        }
        if (options.buttonholePlacketStyle == 'inbuilt') {
          return new Path()
            .move(points.hps)
            .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
            .line(points.fBHCfNeck)
            .curve(points.fBHCfNeckCp2, points.fBHCfNeckCp1, points.fBHHps)
            .split(points.fBHButtonholeNeck)[0]
        }
        if (options.buttonholePlacketStyle == 'facing') {
          return new Path()
            .move(points.hps)
            .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
            .line(points.buttonholeNeckEx)
        }
      }
    }

    //paths
    paths.hemBase = new Path()
      .move(drawSeamLeft().end())
      .line(points.hemCurveStart)
      .curve(points.cHemCp2, points.sideHemCp1, points.sideHem)
    // .hide()

    paths.sideSeam = new Path()
      .move(points.sideHem)
      ._curve(points.sideWaistCp1, points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
    // .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
    // .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.hps)
    //.hide()

    paths.seam = paths.hemBase
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.shoulder)
      .join(drawNeck())
      .join(drawSeamLeft())
      .close()

    //guides
    // paths.byronGuide = new Path()
    // .move(points.cWaist)
    // .line(points.sideWaist)
    // .curve_(points.sideWaistCp2, points.armhole)
    // .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
    // .line(points.cWaist)
    // .close()
    // .attr('class', 'various dashed')

    if (complete) {
      //grainline
      points.grainlineFrom = points.cfNeckCorner
      points.grainlineTo = new Point(points.cfNeckCorner.x, points.sideHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['armholePitch', 'sideWaist'],
      })
      //title
      points.title = new Point(
        points.hps.x + (points.shoulder.x - points.hps.x) * 0.4,
        points.armhole.y
      )
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Front',
        scale: 2 / 3,
      })
      //logo
      points.logo = new Point(
        points.hps.x + (points.shoulder.x - points.hps.x) * 0.5,
        points.armhole.y + (points.sideHem.y - points.armhole.y) / 3
      )
      macro('logorg', {
        at: points.logo,
        scale: 0.6,
      })
      //scalebox
      points.scalebox = new Point(
        points.hps.x + (points.shoulder.x - points.hps.x) * 0.5,
        points.armhole.y + ((points.sideHem.y - points.armhole.y) * 2) / 3
      )
      macro('scalebox', {
        at: points.scalebox,
      })
      //button and buttonholes
      for (let i = 0; i <= options.buttonNumber - 1; i++) {
        snippets['buttonhole' + i] = new Snippet('buttonhole', points['button' + i])
        snippets['button' + i] = new Snippet('button', points['button' + i])
      }

      if (sa) {
        paths.saArmhole = new Path()
          .move(points.saArmhole)
          .curve(points.saArmholeCp1, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .hide()

        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .join(paths.sideSeam.offset(sa * options.sideSeamSaWidth * 100))
          .join(paths.saArmhole)
          .join(paths.shoulder.offset(sa))
          .join(drawNeck().offset(sa))
          .join(drawSeamLeft().offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
