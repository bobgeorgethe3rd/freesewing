import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'

export const waistbandTab = {
  name: 'denny.waistbandTab',
  after: [frontBase, backBase],
  hide: {
    after: true,
    inherited: true,
  },
  options: {
    //Style
    waistbandTabsBool: { bool: true, menu: 'style' },
    waistbandTabWidth: { pct: 85.8, min: 50, max: 100, menu: 'style' },
    waistbandTabLength: { pct: 12.7, min: 10, max: 20, menu: 'style' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
    utils,
  }) => {
    //set render
    if (!options.waistbandTabsBool) {
      part.hide()
      return part
    }
    //measurements
    const waistbandTabWidth = store.get('waistbandWidth') * options.waistbandTabWidth
    const waistbandTabLength = store.get('waistbandLength') * options.waistbandTabLength
    //let's begin
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.translate(-waistbandTabLength * 0.5, -waistbandTabWidth * 0.5)
    points.bottomLeft = points.topLeft.flipY(points.origin)
    points.bottomRight = points.bottomLeft.flipX(points.origin)
    points.topRight = points.bottomRight.flipY(points.origin)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.origin
      macro('title', {
        nr: 18,
        title: 'Waistband Tab',
        at: points.title,
        cutNr: 4,
        scale: 0.25,
      })
      //buttonhole
      points.buttonhole = new Point(points.topRight.x - waistbandTabWidth * 0.5, points.origin.y)
      snippets.buttonhole = new Snippet('buttonhole', points.buttonhole).attr('data-rotate', 90)
      if (sa) {
        points.saTopLeft = points.topLeft.translate(-sa, -sa)
        points.saBottomLeft = points.saTopLeft.flipY(points.origin)
        points.saBottomRight = points.saBottomLeft.flipX(points.origin)
        points.saTopRight = points.saBottomRight.flipY(points.origin)

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
