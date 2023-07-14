import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { pocket } from './pocket.mjs'

export const frontLeft = {
  name: 'shaun.frontLeft',
  from: frontBase,
  after: [backBase, back, pocket],
  hide: {
    from: true,
  },
  options: {
    //Plackets
    buttonholePlacketStyle: {
      dflt: 'separate',
      list: ['separate', 'inbuilt', 'facing'],
      menu: 'plackets',
    },
    placketOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'plackets' },
    //Advanced
    independentPlacketStyles: { bool: false, menu: 'advanced.plackets' },
    buttonPlacketStyle: {
      dflt: 'separate',
      list: ['separate', 'inbuilt', 'facing'],
      menu: 'advanced.plackets',
    },
    separateFronts: { bool: false, menu: 'advanced' },
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
            .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
            .split(points.buttonNeck)[0]
        }
        if (options.buttonPlacketStyle == 'inbuilt') {
          return new Path()
            .move(points.hps)
            .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
            .line(points.fBCfNeck)
            .curve(points.fBCfNeckCp1, points.fBHpsCp2, points.fBHps)
            .split(points.fBButtonNeck)[0]
        }
        if (options.buttonPlacketStyle == 'facing') {
          return new Path()
            .move(points.hps)
            .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
            .line(points.buttonNeckEx)
        }
      } else {
        if (options.buttonholePlacketStyle == 'separate') {
          return new Path()
            .move(points.hps)
            .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
            .split(points.buttonholeNeck)[0]
        }
        if (options.buttonholePlacketStyle == 'inbuilt') {
          return new Path()
            .move(points.hps)
            .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
            .line(points.fBHCfNeck)
            .curve(points.fBHCfNeckCp1, points.fBHHpsCp2, points.fBHHps)
            .split(points.fBHButtonholeNeck)[0]
        }
        if (options.buttonholePlacketStyle == 'facing') {
          return new Path()
            .move(points.hps)
            .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
            .line(points.buttonholeNeckEx)
        }
      }
    }

    //paths
    paths.hemBase = new Path()
      .move(drawSeamLeft().end())
      .line(points.hemCurveStart)
      .curve(points.cHemCp2, points.sideHemCp1, points.sideHem)
      .hide()

    paths.sideSeam = new Path()
      .move(points.sideHem)
      ._curve(points.sideWaistCp1, points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

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
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    // .line(points.cWaist)
    // .close()
    // .attr('class', 'various dashed')

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.cfNeckCorner.x, points.armhole.y)
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
      let titleNum
      let titleName
      if (
        options.separateFronts ||
        store.get('buttonholePlacketWidth') != store.get('buttonPlacketWidth') ||
        (options.independentPlacketStyles &&
          options.buttonholePlacketStyle != options.buttonPlacketStyle)
      ) {
        titleNum = '1a'
        titleName = 'Front Left'
      } else {
        titleNum = '1'
        titleName = 'Front'
      }
      points.title = new Point(
        points.hps.x + (points.shoulder.x - points.hps.x) * 0.4,
        points.armhole.y * 1.1
      )
      macro('title', {
        at: points.title,
        nr: titleNum,
        title: titleName,
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
        if (
          (options.placketOverlapSide == 'left' && options.buttonholePlacketStyle != 'separate') ||
          (store.get('buttonholePlacketWidth') == store.get('buttonPlacketWidth') &&
            (!options.independentPlacketStyles ||
              options.buttonholePlacketStyle == options.buttonPlacketStyle) &&
            options.placketOverlapSide == 'right' &&
            !options.separateFronts &&
            options.buttonPlacketStyle != 'separate')
        ) {
          snippets['buttonhole' + i] = new Snippet('buttonhole', points['button' + i])
        }
        if (
          (options.placketOverlapSide == 'right' && options.buttonPlacketStyle != 'separate') ||
          (store.get('buttonholePlacketWidth') == store.get('buttonPlacketWidth') &&
            (!options.independentPlacketStyles ||
              options.buttonholePlacketStyle == options.buttonPlacketStyle) &&
            options.placketOverlapSide == 'left' &&
            !options.separateFronts &&
            options.buttonholePlacketStyle != 'separate')
        ) {
          snippets['button' + i] = new Snippet('button', points['button' + i])
        }
      }
      //lines
      if (options.placketOverlapSide == 'left' && options.buttonholePlacketStyle != 'separate') {
        paths.facingLing = new Path()
          .move(points.buttonholeNeck)
          .line(points.buttonholeHem)
          .attr('class', 'mark sa')
          .attr('data-text', 'Facing line')
          .attr('data-text-class', 'center')
        if (options.buttonholePlacketStyle == 'inbuilt') {
          paths.foldline = new Path()
            .move(points.buttonholeNeckEx)
            .line(points.buttonholeHemEx)
            .attr('class', 'mark help')
            .attr('data-text', 'Fold-line')
            .attr('data-text-class', 'center')
        }
      }

      if (options.placketOverlapSide == 'right' && options.buttonPlacketStyle != 'separate') {
        paths.facingLing = new Path()
          .move(points.buttonNeck)
          .line(points.buttonHem)
          .attr('class', 'mark sa')
          .attr('data-text', 'Facing line')
          .attr('data-text-class', 'center')
        if (options.buttonPlacketStyle == 'inbuilt') {
          paths.foldline = new Path()
            .move(points.buttonNeckEx)
            .line(points.buttonHemEx)
            .attr('class', 'mark help')
            .attr('data-text', 'Fold-line')
            .attr('data-text-class', 'center')
        }
      }
      //pockets
      if (options.pockets) {
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
        paths.saArmhole = new Path()
          .move(points.saArmhole)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .hide()

        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .line(points.saPoint0)
          .join(paths.sideSeam.offset(sa * options.sideSeamSaWidth * 100))
          .line(points.saPoint1)
          .join(paths.saArmhole)
          .line(points.saPoint2)
          .join(paths.shoulder.offset(sa * options.shoulderSaWidth * 100))
          .line(points.saPoint3)
          .join(drawNeck().offset(sa))
          .join(drawSeamLeft().offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
