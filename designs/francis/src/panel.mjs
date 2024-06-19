import { leg } from './leg.mjs'

export const panel = {
  name: 'francis.panel',
  after: [leg],
  options: {
    //Construction
    beltLoops: { bool: true, menu: 'construction' },
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
  }) => {
    //let's begin
    points.origin = new Point(0, 0)
    points.bottomRight = new Point(store.get('panelWidth') / 2, store.get('panelLength') / 2)
    points.topRight = points.bottomRight.flipY()
    points.topLeft = points.topRight.flipX()
    points.bottomLeft = points.bottomRight.flipX()

    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x / 2, points.topLeft.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.bottomNotch = new Point(points.origin.x, points.bottomRight.y)
      snippets.bottomNotch = new Snippet('notch', points.bottomNotch)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['bottomLeft', 'bottomRight'],
      })
      if (options.waistbandStyle == 'none') {
        if (!options.beltLoops) {
          points.eyelet0 = new Point(
            (points.topLeft.x * 2) / 3,
            points.topLeft.y + absoluteOptions.waistbandWidth / 2
          )
            .attr('data-circle', 3.4)
            .attr('data-circle-class', 'mark dotted stroke-lg')
          points.eyelet1 = points.eyelet0
            .flipX()
            .attr('data-circle', 3.4)
            .attr('data-circle-class', 'mark dotted stroke-lg')
        }
      } else {
        points.topNotch = points.bottomNotch.flipY()
        snippets.topNotch = new Snippet('notch', points.topNotch)
      }
      //title
      points.title = points.origin
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'panel',
        scale: 0.5,
      })
      if (sa) {
        let topSa = sa
        if (options.waistbandStyle == 'none') topSa = topSa + absoluteOptions.waistbandWidth

        points.saBottomRight = points.bottomRight.translate(sa, sa)
        points.saTopRight = points.topRight.translate(sa, -topSa)
        points.saTopLeft = points.saTopRight.flipX()
        points.saBottomLeft = points.saBottomRight.flipX()

        if (options.waistbandStyle == 'none') {
          points.casingRight = points.topRight.shift(90, absoluteOptions.waistbandWidth)
          points.casingLeft = points.casingRight.flipX()
          paths.casing = new Path()
            .move(points.topRight)
            .line(points.casingRight)
            .line(points.casingLeft)
            .line(points.topLeft)

          paths.foldline = new Path()
            .move(points.topLeft)
            .line(points.topRight)
            .attr('class', 'mark')
            .attr('data-text', 'Fold - line')
            .attr('data-text-class', 'center')
        }
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
