import { pocket } from './pocket.mjs'

export const welt = {
  name: 'weltpocket.welt',
  options: {
    //Pockets
    weltPocketWeltWidth: { pct: 5.9, min: 5, max: 10, menu: 'pockets.weltPockets' },
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
      points.weltTopLeft = points.topLeft
    } else {
      points.weltTopLeft = points.left.shift(90, width / 2)
    }

    // points.weltBottomLeft = points.weltTopLeft.rotate(180, points.left)
    points.weltBottomLeft = points.left.shift(-90, width / 2)

    points.weltBottomRight = new Point(points.right.x, points.weltBottomLeft.y)
    points.weltTopRight = new Point(points.right.x, points.weltTopLeft.y)

    //paths
    paths.saLeft = new Path().move(points.weltTopLeft).line(points.weltBottomLeft).hide()

    paths.saBottom = new Path().move(points.weltBottomLeft).line(points.weltBottomRight).hide()

    paths.saRight = new Path().move(points.weltBottomRight).line(points.weltTopRight).hide()

    paths.saTop = new Path().move(points.weltTopRight).line(points.weltTopLeft).hide()

    paths.seam = paths.saLeft.clone().join(paths.saBottom).join(paths.saRight).join(paths.saTop)

    //stores
    store.set('weltWidth', points.weltTopLeft.dist(points.weltBottomLeft))

    if (complete) {
      //grainline
      points.grainlineFrom = points.openingMid
      points.grainlineTo = new Point(points.openingMid.x, points.weltBottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.openingLeft.x, points.weltBottomLeft.y * 0.6)
      macro('title', {
        nr: 2,
        title: 'Welt Pocket Welt',
        at: points.title,
        scale: 1 / 3,
      })

      if (sa) {
        paths.sa = paths.saLeft
          .clone()
          .offset(sa * options.pocketBagSaWidth * 100)
          .join(paths.saBottom.offset(sa))
          .join(paths.saRight.offset(sa * options.pocketBagSaWidth * 100))
          .join(paths.saTop.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
