import { pctBasedOn } from '@freesewing/core'
import { crown } from './crown.mjs'

export const band = {
  name: 'perry.band',
  after: crown,
  options: {
    //Style
    bandWidth: { pct: 4.9, min: 4.9, max: 16.4, snap: 5, ...pctBasedOn('head'), menu: 'style' },
    //Construction
    crownSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    const headCircumference = store.get('headCircumference')
    const bandWidth = absoluteOptions.bandWidth

    //let's begin
    points.topMid = new Point(0, 0)
    points.bottomMid = points.topMid.shift(-90, bandWidth)

    points.topLeft = points.topMid.shift(180, headCircumference / 2)
    points.topRight = points.topLeft.flipX()
    points.bottomLeft = new Point(points.topLeft.x, points.bottomMid.y)
    points.bottomRight = new Point(points.topRight.x, points.bottomMid.y)

    //paths
    paths.hemBase = new Path().move(points.bottomLeft).line(points.bottomRight).hide()

    paths.saBase = new Path()
      .move(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .line(points.bottomLeft)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid.shiftFractionTowards(points.topLeft, 1 / 6)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      for (let i = 0; i < 3; i++) {
        points['notch' + i] = points.topLeft.shiftFractionTowards(points.topRight, (i + 1) / 4)
        snippets['notch' + i] = new Snippet('bnotch', points['notch' + i])
      }
      snippets.bottomMidNotch = new Snippet('notch', points.bottomMid)
      //title
      points.title = points.topMid
        .shiftFractionTowards(points.topLeft, 1 / 3)
        .shift(-90, bandWidth * 0.55)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Band',
        scale: 0.25,
      })
    }
    //centre line
    paths.centreLine = new Path()
      .move(points.topMid)
      .line(points.bottomMid)
      .attr('class', 'mark')
      .attr('data-text', 'Centre Line')
      .attr('data-text-class', 'center')

    if (sa) {
      const hemSa = sa * options.crownSaWidth * 100

      points.saBottomLeft = points.bottomLeft.translate(-sa, hemSa)
      points.saBottomRight = points.bottomRight.translate(sa, hemSa)
      points.saTopRight = points.topRight.translate(sa, -sa)
      points.saTopLeft = points.topLeft.translate(-sa, -sa)

      paths.sa = new Path()
        .move(points.saBottomLeft)
        .line(points.saBottomRight)
        .line(points.saTopRight)
        .line(points.saTopLeft)
        .line(points.saBottomLeft)
        .close()
        .attr('class', 'fabric sa')
    }

    return part
  },
}
