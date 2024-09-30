import { welt } from './welt.mjs'

export const tab = {
  name: 'weltpocket.tab',
  options: {
    //Pockets
    weltPocketTabWidth: { pct: 18.2, min: 10, max: 20, menu: 'pockets.weltPockets' },
    weltPocketTabLengthBonus: { pct: 50, min: 40, max: 100, menu: 'pockets.weltPockets' },
  },
  after: welt,
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
    //measures
    const width = store.get('weltPocketOpeningWidth') * options.weltPocketTabWidth
    const length = store.get('weltWidth') * (1 + options.weltPocketTabLengthBonus)
    //let's begin
    points.topMid = new Point(0, 0)
    points.topLeft = points.topMid.shift(180, width / 2)
    points.topRight = points.topLeft.flipX(points.topMid)
    points.bottomLeft = points.topLeft.shift(-90, length)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
    points.peak = points.bottomLeft.translate(width / 2, width / 2)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.peak)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topRight.shiftFractionTowards(points.topMid, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomRight.y * 0.75)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.topMid = new Snippet('notch', points.topMid)
      //title
      points.title = new Point(points.topLeft.x * 0.75, points.bottomRight.y * 0.5)
      macro('title', {
        nr: 3,
        title: 'Welt Pocket Tab',
        at: points.title,
        cutNr: 4,
        scale: 0.25,
      })
      //buttonhole
      points.buttonhole = new Point(points.topMid.x, points.bottomLeft.y * 0.95)
      snippets.buttonhole = new Snippet('buttonhole', points.buttonhole).attr('data-scale', 1.5)
      if (sa) {
        points.saTopLeft = points.topLeft.translate(-sa, -sa)
        points.saBottomLeft = utils.beamIntersectsX(
          points.bottomLeft.shiftTowards(points.peak, sa).rotate(-90, points.bottomLeft),
          points.peak.shiftTowards(points.bottomLeft, sa).rotate(90, points.peak),
          points.saTopLeft.x
        )
        points.saPeak = utils.beamIntersectsX(
          points.bottomLeft.shiftTowards(points.peak, sa).rotate(-90, points.bottomLeft),
          points.peak.shiftTowards(points.bottomLeft, sa).rotate(90, points.peak),
          points.peak.x
        )
        points.saBottomRight = points.saBottomLeft.flipX()
        points.saTopRight = points.saTopLeft.flipX()

        paths.sa = new Path()
          .move(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saPeak)
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
