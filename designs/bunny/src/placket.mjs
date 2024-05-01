import { back } from './back.mjs'

export const placket = {
  name: 'bunny.placket',
  from: back,
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
    if (options.placketStyle == 'inbuilt') {
      part.hide()
      return part
    }
    //remove paths & snippets
    const keepPaths = ['daisyGuide', 'placketNeck', 'mPlacketNeck']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //macros
    macro('title', false)
    //let's begin
    //paths
    if (options.placketStyle == 'separate') {
      paths.hemBase = new Path().move(points.mHemPlacket).line(points.hemPlacket).hide()

      paths.placketNeck = paths.placketNeck.join(paths.mPlacketNeck.reverse()).hide()
    } else {
      paths.hemBase = new Path().move(points.hemCorner).line(points.hemPlacket).hide()
    }

    paths.seam = paths.hemBase
      .clone()
      .line(points.neckPlacket)
      .join(paths.placketNeck)
      .line(paths.hemBase.start())
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.neckCorner.shiftFractionTowards(points.cbNeck, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.backNotch = new Point(points.neckPlacket.x, points.cArmhole.y)
      points.mBackNotch = new Point(paths.placketNeck.end().x, points.cArmhole.y)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['backNotch', 'mBackNotch'],
      })
      //title
      points.title = new Point(points.neckPlacket.x * 0.25, points.cArmhole.y)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Placket',
        scale: 0.1,
      })
      //buttonholes & lines
      if (options.placketStyle == 'separate') {
        for (let i = 0; i < options.buttonholeNum; i++) {
          snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i]).attr(
            'data-rotate',
            90
          )
          snippets['button' + i] = new Snippet('button', points['buttonhole' + i])
        }
        if (points.skirtButtonhole0) {
          for (let i = 0; i < store.get('skirtButtonholeNum'); i++) {
            snippets['skirtButtonhole' + i] = new Snippet(
              'buttonhole',
              points['skirtButtonhole' + i]
            ).attr('data-rotate', 90)
            snippets['skirtButton' + i] = new Snippet('button', points['skirtButtonhole' + i])
          }
        }
        paths.foldLine = new Path()
          .move(points.neckCorner)
          .line(points.hemCorner)
          .attr('class', 'mark')
          .attr('data-text', 'Fold - Line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        points.saHemLeft = paths.hemBase.start().translate(-sa, sa)
        points.saHemPlacket = points.hemPlacket.translate(sa, sa)
        points.saNeckPlacket = new Point(
          points.saHemPlacket.x,
          paths.placketNeck.offset(sa).start().y
        )
        points.saNeckLeft = new Point(points.saHemLeft.x, paths.placketNeck.offset(sa).end().y)
        paths.sa = new Path()
          .move(points.saHemLeft)
          .line(points.saHemPlacket)
          .line(points.saNeckPlacket)
          .join(paths.placketNeck.offset(sa))
          .line(points.saNeckLeft)
          .line(points.saHemLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
