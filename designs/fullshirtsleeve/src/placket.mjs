import { sleeve } from './sleeve.mjs'

export const placket = {
  name: 'fullshirtsleeve.placket',
  after: sleeve,
  options: {
    sleevePlacketWidth: { pct: 15.5, min: 10, max: 20, menu: 'sleeves.plackets' },
    sleevePlacketTopFactor: { pct: 40, min: 30, max: 100, menu: 'sleeves.plackets' },
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
  }) => {
    //measures
    const placketWidth = measurements.wrist * options.sleevePlacketWidth
    const placketTopLength = placketWidth * options.sleevePlacketTopFactor
    const placketLength = store.get('sleevePlacketLength') + placketTopLength
    const sleeveSlitLength = store.get('sleeveSlitLength') + placketTopLength
    //let's begin
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.shift(-90, placketTopLength)
    points.bottomLeft = points.origin.shift(-90, placketLength)
    points.bottomRight = points.bottomLeft.shift(0, placketWidth * 3)
    points.topRight = points.bottomRight.shift(90, sleeveSlitLength)
    points.topCorner = points.topRight.shift(180, placketWidth * 2)
    points.peakRight = points.topLeft.shift(0, placketWidth)
    points.peakMid = points.topLeft.translate(placketWidth / 2, -placketTopLength)

    paths.saBase = new Path()
      .move(points.peakRight)
      .line(points.peakMid)
      .line(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .hide()

    paths.seam = paths.saBase.clone().line(points.topCorner).line(points.peakRight).close().unhide()

    //stores
    store.set('sleevePlacketWidth', placketWidth)

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topRight.x - placketWidth / 2, points.topRight.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.bottomLeft.translate(placketWidth * 1.15, -sleeveSlitLength * 0.75)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Placket (Sleeve)',
        scale: 0.25,
      })
      //slit line
      points.slitFrom = points.bottomLeft.translate(
        placketWidth * 2,
        -store.get('sleeveSlitLength')
      )
      points.slitTo = new Point(points.slitFrom.x, points.bottomLeft.y)
      paths.slit = new Path()
        .move(points.slitFrom)
        .line(points.slitTo)
        .attr('class', 'mark')
        .attr('data-text', 'Placket Slit')
        .attr('data-text-class', 'center')
      snippets.slitNotch = new Snippet('notch', points.slitFrom)
      //stitching line
      points.stitchingFrom = points.bottomLeft.shift(90, store.get('sleeveSlitLength'))
      points.stitchingTo = new Point(points.topRight.x, points.stitchingFrom.y)
      paths.stitchingLine = new Path()
        .move(points.stitchingFrom)
        .line(points.stitchingTo)
        .attr('class', 'mark help')
        .attr('data-text', 'Stitching Line')
        .attr('data-text-class', 'center')
      //buttonhole
      points.buttonhole = points.bottomLeft.translate(
        placketWidth / 2,
        store.get('sleeveSlitLength') / -2
      )
      snippets.buttonhole = new Snippet('buttonhole', points.buttonhole)
      //foldline
      points.foldlineFrom = points.topCorner
      points.foldlineTo = new Point(points.foldlineFrom.x, points.bottomLeft.y)
      paths.foldline = new Path()
        .move(points.foldlineFrom)
        .line(points.foldlineTo)
        .attr('class', 'mark help')
        .attr('data-text', 'Fold-line')
        .attr('data-text-class', 'center')

      if (sa) {
        points.saTopRight = points.topRight.shift(90, sa)
        points.saTopCorner = points.topCorner.translate(sa, -sa)
        points.saPeakRight = points.peakRight.shift(0, sa)
        paths.sa = paths.saBase
          .offset(sa)
          .line(points.saTopRight)
          .line(points.saTopCorner)
          .line(points.saPeakRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
