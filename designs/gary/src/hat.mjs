import { feet } from './feet.mjs'

export const hat = {
  name: 'gary.hat',
  after: feet,
  draft: ({
    Point,
    points,
    Path,
    paths,
    options,
    paperless,
    macro,
    sa,
    store,
    utils,
    part,
    snippets,
    Snippet,
  }) => {
    //measures
    const hatWidth = 173 * options.scale
    //let's begin
    points.top = new Point(0, 0)
    points.bottom = points.top.shift(-90, 347 * options.scale)
    points.bottomRight = points.bottom.shift(0, hatWidth)

    //paths
    paths.saBase = new Path().move(points.bottom).line(points.bottomRight).line(points.top).hide()

    paths.seam = paths.saBase.clone().line(points.bottom).close().unhide()

    //stores
    store.set('hatWidth', hatWidth)
    //details
    //grainline
    points.cutOnFoldFrom = points.top.shiftFractionTowards(points.bottom, 0.2)
    points.cutOnFoldTo = points.bottom
    macro('cutonfold', {
      from: points.cutOnFoldFrom,
      to: points.cutOnFoldTo,
      grainline: true,
    })
    //notches
    snippets.notch = new Snippet('notch', points.bottom)
    //title
    points.title = new Point(points.bottomRight.x / 4, (points.bottom.y * 2) / 3)
    macro('title', {
      at: points.title,
      nr: '8',
      title: 'hat',
      scale: 0.5 * options.scale,
    })
    if (sa) {
      points.saTop = utils.beamIntersectsX(
        points.bottomRight.shiftTowards(points.top, sa).rotate(-90, points.bottomRight),
        points.top.shiftTowards(points.bottomRight, sa).rotate(90, points.top),
        points.top.x
      )
      paths.sa = paths.saBase
        .offset(sa)
        .line(points.saTop)
        .line(points.bottom)
        .close()
        .attr('class', 'fabric sa')
    }

    return part
  },
}
