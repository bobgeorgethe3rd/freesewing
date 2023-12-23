export const feet = {
  name: 'gary.feet',
  options: {
    scale: { pct: 100, min: 25, max: 500, menu: 'style' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    paperless,
    macro,
    utils,
    part,
    snippets,
    Snippet,
  }) => {
    //measures
    const feetWidth = 40 * options.scale
    //let's begin
    points.topMid = new Point(0, 0)
    points.topLeft = points.topMid.shift(180, feetWidth)
    points.peakLeft = points.topMid.translate(-feetWidth / 2, 54 * options.scale)
    points.curveStart = points.topLeft.shift(-90, 24 * options.scale)
    points.peakLeftCp1 = new Point(points.curveStart.x, points.peakLeft.y)
    points.peakLeftCp2 = points.peakLeftCp1.flipX(points.peakLeft)
    points.curveMid = new Point(points.topMid.x, points.curveStart.y)

    paths.seamBase = new Path()
      .move(points.topMid)
      .line(points.topLeft)
      .line(points.curveStart)
      ._curve(points.peakLeftCp1, points.peakLeft)
      .curve_(points.peakLeftCp2, points.curveMid)
      .hide()

    macro('mirror', {
      mirror: [points.topMid, points.curveMid],
      paths: ['seamBase'],
      prefix: 'm',
    })

    paths.seam = paths.seamBase.join(paths.mSeamBase.reverse()).close()

    //stores
    store.set('feetWidth', feetWidth)

    //details
    //grainline
    points.grainlineFrom = new Point(points.peakLeft.x, points.topMid.y)
    points.grainlineTo = points.peakLeft
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //notches
    snippets.notch = new Snippet('notch', points.curveMid)
    //title
    points.title = new Point(points.topLeft.x / 3, points.peakLeft.y / 2).flipX()
    macro('title', {
      at: points.title,
      nr: '1',
      title: 'feet',
      scale: 0.25 * options.scale,
    })
    //foldine
    paths.foldline = new Path()
      .move(points.topMid)
      .line(points.curveMid)
      .attr('class', 'various')
      .attr('data-text', 'foldLine')
      .attr('data-text', 'center')
    if (sa) {
      points.saPeakLeft = points.peakLeft.shift(-90, sa)
      points.saPeakLeftCp2 = points.peakLeftCp2.translate(sa, sa)
      points.saCurveMid = points.curveMid.shift(0, sa)
      points.saSplit = utils.curveIntersectsX(
        points.saPeakLeft,
        points.saPeakLeftCp2,
        points.saCurveMid,
        points.saCurveMid,
        points.curveMid.x
      )

      paths.saBase = new Path()
        .move(points.topMid)
        .line(points.topLeft)
        .line(points.curveStart)
        ._curve(points.peakLeftCp1, points.peakLeft)
        .offset(sa)
        .curve_(points.saPeakLeftCp2, points.saCurveMid)
        .split(points.saSplit)[0]
        .hide()

      macro('mirror', {
        mirror: [points.topMid, points.curveMid],
        paths: ['saBase'],
        prefix: 'm',
      })

      paths.sa = paths.saBase.join(paths.mSaBase.reverse()).close().attr('class', 'fabric sa')
    }

    return part
  },
}
