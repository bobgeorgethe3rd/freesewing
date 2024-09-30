import { pocket } from './pocket.mjs'

export const welt = {
  name: 'weltpocket.welt',
  options: {
    //Pockets
    weltPocketWeltWidth: { pct: 6.6, min: 5, max: 10, menu: 'pockets.weltPockets' },
  },
  from: pocket,
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
  }) => {
    //keep paths
    const keepThese = ['opening']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const width = store.get('insertSeamLength') * options.weltPocketWeltWidth
    //let's begin
    if (width / -2 < points.topLeft.y) {
      points.topLeft = points.topLeft
    } else {
      points.topLeft = points.left.shift(90, width / 2)
    }

    // points.bottomLeft = points.topLeft.rotate(180, points.left)
    points.bottomLeft = points.left.shift(-90, width / 2)

    points.bottomRight = new Point(points.right.x, points.bottomLeft.y)
    points.topRight = new Point(points.right.x, points.topLeft.y)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    //stores
    store.set('weltWidth', points.topLeft.dist(points.bottomLeft))

    if (complete) {
      //grainline
      points.grainlineFrom = points.openingMid
      points.grainlineTo = new Point(points.openingMid.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.openingLeft.x, points.bottomLeft.y * 0.6)
      macro('title', {
        nr: 2,
        title: 'Welt Pocket Welt',
        at: points.title,
        cutNr: 4,
        scale: 1 / 3,
      })

      if (sa) {
        const pocketBagSa = sa * options.pocketBagSaWidth * 100

        points.saTopLeft = points.topLeft.translate(-pocketBagSa, -sa)
        points.saBottomLeft = points.bottomLeft.translate(-pocketBagSa, sa)
        points.saBottomRight = points.bottomRight.translate(pocketBagSa, sa)
        points.saTopRight = points.topRight.translate(pocketBagSa, -sa)

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
