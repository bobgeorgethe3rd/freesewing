import { flipPlugin } from '@freesewing/plugin-flip'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'
import { frontLeft } from './frontLeft.mjs'

export const buttonPlacket = {
  name: 'shaun.buttonPlacket',
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
    //settings
    if (!options.independentPlacketStyles) {
      options.buttonPlacketStyle = options.buttonholePlacketStyle
    }
    //set render
    if (
      options.buttonPlacketStyle == 'inbuilt' ||
      (!options.separateFronts &&
        store.get('buttonholePlacketWidth') == store.get('buttonPlacketWidth') &&
        (!options.independentPlacketStyles ||
          options.buttonholePlacketStyle == options.buttonPlacketStyle))
    ) {
      part.hide()
      return part
    }
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //let's begin
    //paths
    paths.saLeft = new Path().move(points.buttonHem).line(points.buttonNeck).hide()

    const drawNeck = () => {
      if (options.buttonPlacketStyle == 'separate') {
        return new Path()
          .move(points.hps)
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
          .line(points.fBCfNeck)
          .curve(points.fBCfNeckCp1, points.fBHpsCp2, points.fBHps)
          .split(points.buttonNeck)[1]
          .split(points.fBButtonNeck)[0]
      }

      if (options.buttonPlacketStyle == 'facing') {
        return new Path()
          .move(points.hps)
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
          .line(points.buttonNeckEx)
          .split(points.buttonNeck)[1]
      }
    }

    const drawSaRight = () => {
      if (options.buttonPlacketStyle == 'separate') {
        return new Path().move(points.fBButtonNeck).line(points.fBButtonHem)
      }

      if (options.buttonPlacketStyle == 'facing') {
        return new Path().move(points.buttonNeckEx).line(points.buttonHemEx)
      }
    }

    paths.hemBase = new Path().move(drawSaRight().end()).line(points.buttonHem).hide()

    paths.seam = paths.hemBase.join(paths.saLeft).join(drawNeck()).join(drawSaRight())

    //complete
    if (complete && sa) {
      const hemSa = sa * options.hemWidth * 100

      points.saPoint0 = new Point(
        paths.saLeft.offset(sa).start().x,
        paths.hemBase.offset(hemSa).end().y
      )
      points.saPoint1 = new Point(paths.saLeft.offset(sa).end().x, drawNeck().offset(sa).start().y)
      points.saPoint2 = new Point(drawSaRight().offset(sa).start().x, drawNeck().offset(sa).end().y)
      points.saPoint3 = new Point(
        drawSaRight().offset(sa).end().x,
        paths.hemBase.offset(hemSa).start().y
      )

      paths.sa = paths.hemBase
        .offset(hemSa)
        .line(points.saPoint0)
        .join(paths.saLeft.offset(sa))
        .line(points.saPoint1)
        .join(drawNeck().offset(sa))
        .line(points.saPoint2)
        .join(drawSaRight().offset(sa))
        .line(points.saPoint3)
        .close()
        .attr('class', 'fabric sa')
    }
    //flip macro
    if (options.placketOverlapSide == 'left') {
      macro('flip')
    }

    if (complete) {
      //grainline
      points.grainlineFrom = points.cfNeck.shiftFractionTowards(points.buttonNeckEx, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.button2.shiftFractionTowards(points.button3, 0.5)
      macro('title', {
        at: points.title,
        nr: '5b',
        title: 'Button Placket',
        scale: 0.15,
      })
      //buttonholes
      for (let i = 0; i <= options.buttonNumber - 1; i++) {
        snippets['button' + i] = new Snippet('button', points['button' + i])
      }
      //foldline
      if (options.buttonPlacketStyle == 'separate') {
        paths.foldline = new Path()
          .move(points.buttonNeckEx)
          .line(points.buttonHemEx)
          .attr('class', 'mark help')
          .attr('data-text', 'Fold-line')
          .attr('data-text-class', 'center')
      }
    }

    return part
  },
}
