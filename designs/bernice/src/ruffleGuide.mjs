import { front } from './front.mjs'

export const ruffleGuide = {
  name: 'bernice.ruffleGuide',
  after: front,
  options: {
    //Construction
    hemSaWidth: { pct: 2, min: 1, max: 3, menu: 'style' },
  },
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
    //measurements
    const ruffleWidth = store.get('ruffleWidth')
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, ruffleWidth)
    points.bottomRight = points.bottomLeft.shift(0, ruffleWidth * 0.2)
    points.topRight = new Point(points.bottomRight.x, points.topLeft.y)
    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //title
      points.title = new Point(points.bottomRight.x / 4, points.bottomRight.y / 2)
      macro('title', {
        nr: 5,
        title: 'Ruffle Guide',
        at: points.title,
        cutNr: false,
        scale: 0.25,
      })
      if (sa) {
        const hemSa = sa * options.hemSaWidth * 100
        points.saTopLeft = points.topLeft.translate(-sa, -sa)
        points.saTopRight = points.topRight.translate(sa, -sa)
        points.saBottomLeft = points.bottomLeft.translate(-sa, hemSa)
        points.saBottomRight = points.bottomRight.translate(sa, hemSa)

        paths.sa = new Path()
          .move(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
