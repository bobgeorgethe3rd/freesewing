import { flipPlugin } from '@freesewing/plugin-flip'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { frontLeft } from './frontLeft.mjs'

export const buttonholePlacket = {
  name: 'shaun.buttonholePlacket',
  from: frontBase,
  after: [backBase, back, frontLeft],
  hide: {
    from: true,
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
    //set render
    if (options.buttonholePlacketStyle == 'inbuilt') {
      part.hide()
      return part
    }
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //let's begin
    //paths
    paths.saLeft = new Path().move(points.buttonholeHem).line(points.buttonholeNeck).hide()

    const drawNeck = () => {
      if (options.buttonholePlacketStyle == 'separate') {
        return new Path()
          .move(points.hps)
          .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
          .line(points.fBHCfNeck)
          .curve(points.fBHCfNeckCp2, points.fBHCfNeckCp1, points.fBHHps)
          .split(points.buttonholeNeck)[1]
          .split(points.fBHButtonholeNeck)[0]
      }

      if (options.buttonholePlacketStyle == 'facing') {
        return new Path()
          .move(points.hps)
          .curve(points.cfNeckCp1, points.cfNeckCp2, points.cfNeck)
          .line(points.buttonholeNeckEx)
          .split(points.buttonholeNeck)[1]
      }
    }

    const drawSaRight = () => {
      if (options.buttonholePlacketStyle == 'separate') {
        return new Path().move(points.fBHButtonholeNeck).line(points.fBHButtonholeHem)
      }

      if (options.buttonholePlacketStyle == 'facing') {
        return new Path().move(points.buttonholeNeckEx).line(points.buttonholeHemEx)
      }
    }

    paths.hemBase = new Path().move(drawSaRight().end()).line(points.buttonholeHem).hide()

    paths.seam = paths.hemBase.join(paths.saLeft).join(drawNeck()).join(drawSaRight())

    //complete
    if (complete && sa) {
      paths.sa = paths.hemBase
        .offset(sa * options.hemWidth * 100)
        .join(paths.saLeft.offset(sa))
        .join(drawNeck().offset(sa))
        .join(drawSaRight().offset(sa))
        .close()
        .attr('class', 'fabric sa')
    }
    //flip macro
    if (
      options.placketOverlapSide == 'right' &&
      (options.separateFronts ||
        store.get('buttonholePlacketWidth') != store.get('buttonPlacketWidth') ||
        (options.independentPlacketStyles &&
          options.buttonholePlacketStyle != options.buttonPlacketStyle))
    ) {
      macro('flip')
    }

    if (complete) {
      //grainline
      points.grainlineFrom = points.cfNeck.shiftFractionTowards(points.buttonholeNeckEx, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
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
        titleNum = '5a'
        titleName = 'Buttonhole Placket'
      } else {
        titleNum = '5'
        titleName = 'Button & Buttonhole Placket'
      }
      points.title = points.button2.shiftFractionTowards(points.button3, 0.5)
      macro('title', {
        at: points.title,
        nr: titleNum,
        title: titleName,
        scale: 0.15,
      })
      //buttonholes
      for (let i = 0; i <= options.buttonNumber - 1; i++) {
        snippets['buttonhole' + i] = new Snippet('buttonhole', points['button' + i])

        if (
          store.get('buttonholePlacketWidth') == store.get('buttonPlacketWidth') &&
          (!options.independentPlacketStyles ||
            options.buttonholePlacketStyle == options.buttonPlacketStyle) &&
          !options.separateFronts
        ) {
          snippets['button' + i] = new Snippet('button', points['button' + i])
        }
      }
      //foldline
      if (options.buttonholePlacketStyle == 'separate') {
        paths.foldline = new Path()
          .move(points.buttonholeNeckEx)
          .line(points.buttonholeHemEx)
          .attr('class', 'mark help')
          .attr('data-text', 'Fold-line')
          .attr('data-text-class', 'center')
      }
    }

    return part
  },
}
