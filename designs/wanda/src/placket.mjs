export const placket = {
  name: 'wanda.placket',
  options: {
    plackets: { bool: true, menu: 'plackets' },
    placketWidth: {
      pct: (1 / 24) * 100,
      min: (1 / 32) * 100,
      max: (5 / 96) * 100,
      menu: 'plackets',
    },
    placketLength: { pct: 20, min: 15, max: 30, menu: 'plackets' },
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
    //set Render
    if (!options.plackets) {
      part.hide()
    }
    //measures
    const placketWidth = measurements.waist * options.placketWidth
    const placketLength = measurements.waistToFloor * options.placketLength
    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = points.topLeft.shift(0, placketWidth)
    points.bottomLeft = points.topLeft.shift(-90, placketLength)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    //stores
    if (options.plackets) {
      store.set('waistbandPlacketWidth', placketWidth)
    }
    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topRight.x / 4, points.topLeft.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.topRight.x / 2, points.bottomLeft.y / 2)
      macro('title', {
        nr: '5',
        title: 'Placket',
        at: points.title,
        scale: 0.15,
      })

      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
