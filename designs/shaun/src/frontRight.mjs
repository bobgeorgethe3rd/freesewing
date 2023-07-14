import { flipPlugin } from '@freesewing/plugin-flip'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { frontLeft } from './frontLeft.mjs'

export const frontRight = {
  name: 'shaun.frontRight',
  from: frontBase,
  after: [backBase, back, frontLeft],
  hide: {
    from: true,
  },
  options: {
    rightPocket: { bool: false, menu: 'pockets' },
  },
  plugins: [flipPlugin],
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
    //settings
    if (!options.independentPlacketStyles) {
      options.buttonPlacketStyle = options.buttonholePlacketStyle
    }
    //set render
    if (
      !options.separateFronts &&
      store.get('buttonholePlacketWidth') == store.get('buttonPlacketWidth') &&
      (!options.independentPlacketStyles ||
        options.buttonholePlacketStyle == options.buttonPlacketStyle)
    ) {
      part.hide()
      return part
    }
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //let's begin
    const drawSeamLeft = () => {
      if (options.placketOverlapSide == 'right') {
        if (options.buttonholePlacketStyle == 'separate') {
          return new Path().move(points.buttonholeNeck).line(points.buttonholeHem)
        }
        if (options.buttonholePlacketStyle == 'inbuilt') {
          return new Path().move(points.fBHButtonholeNeck).line(points.fBHButtonholeHem)
        }
        if (options.buttonholePlacketStyle == 'facing') {
          return new Path().move(points.buttonholeNeckEx).line(points.buttonholeHemEx)
        }
      } else {
        if (options.buttonPlacketStyle == 'separate') {
          return new Path().move(points.buttonNeck).line(points.buttonHem)
        }
        if (options.buttonPlacketStyle == 'inbuilt') {
          return new Path().move(points.fBButtonNeck).line(points.fBButtonHem)
        }
        if (options.buttonPlacketStyle == 'facing') {
          return new Path().move(points.buttonNeckEx).line(points.buttonHemEx)
        }
      }
    }

    const drawNeck = () => {
      if (options.placketOverlapSide == 'right') {
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
      } else {
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
    paths.byronGuide = new Path()
      .move(points.cWaist)
      .line(points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cWaist)
      .close()
      .attr('class', 'various dashed')

    if (complete && sa) {
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
    //flip macro
    macro('flip')

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
      points.title = new Point(
        points.hps.x + (points.shoulder.x - points.hps.x) * 0.6,
        points.armhole.y * 1.1
      )
      macro('title', {
        at: points.title,
        nr: '1b',
        title: 'Front Right',
        scale: 2 / 3,
      })
      //button and buttonholes
      for (let i = 0; i <= options.buttonNumber - 1; i++) {
        if (
          (options.placketOverlapSide == 'right' && options.buttonholePlacketStyle != 'separate') ||
          (store.get('buttonholePlacketWidth') == store.get('buttonPlacketWidth') &&
            (!options.independentPlacketStyles ||
              options.buttonholePlacketStyle == options.buttonPlacketStyle) &&
            options.placketOverlapSide == 'left' &&
            !options.separateFronts)
        ) {
          snippets['buttonhole' + i] = new Snippet('buttonhole', points['button' + i])
        }
        if (
          (options.placketOverlapSide == 'left' && options.buttonPlacketStyle != 'separate') ||
          (store.get('buttonholePlacketWidth') == store.get('buttonPlacketWidth') &&
            (!options.independentPlacketStyles ||
              options.buttonholePlacketStyle == options.buttonPlacketStyle) &&
            options.placketOverlapSide == 'right' &&
            !options.separateFronts)
        ) {
          snippets['button' + i] = new Snippet('button', points['button' + i])
        }
      }
      //lines
      if (options.placketOverlapSide == 'right' && options.buttonholePlacketStyle != 'separate') {
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

      if (options.placketOverlapSide == 'left' && options.buttonPlacketStyle != 'separate') {
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
      if (options.pockets && options.rightPocket) {
        paths.pocketline = new Path()
          .move(points.pocketRight)
          .line(points.pocketLeft)
          .attr('class', 'mark')
          .attr('data-text', 'Pocket line')
          .attr('data-text-class', 'center')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketLeft', 'pocketRight'],
        })
      }
    }
    return part
  },
}
