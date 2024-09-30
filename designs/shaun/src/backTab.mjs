export const backTab = {
  name: 'shaun.backTab',
  measurements: ['chest', 'hpsToWaistBack'],
  options: {
    //Style
    backTabWidth: { pct: 2.7, min: 2, max: 5, menu: 'style' },
    backTabLength: { pct: 10.2, min: 10, max: 15, menu: 'style' },
    backTabPeak: { pct: 60, min: 40, max: 100, menu: 'style' },
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
    const backTabWidth = measurements.chest * options.backTabWidth
    const backTabLength = measurements.hpsToWaistBack * options.backTabLength
    const backTabPeak = backTabWidth * options.backTabPeak
    //let's begin
    points.topMid = new Point(0, 0)
    points.topLeft = points.topMid.shift(180, backTabWidth / 2)
    points.topRight = points.topLeft.flipX(points.topMid)
    points.bottomLeft = points.topLeft.shift(-90, backTabLength)
    points.bottomRight = points.bottomLeft.flipX(points.topMid)
    points.bottomPeak = points.topMid.shift(-90, backTabLength + backTabPeak)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomPeak)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y * 0.75)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.topNotch = new Snippet('notch', points.topMid)
      //title
      points.title = points.topLeft.translate(backTabWidth / 4, backTabLength / 2)
      macro('title', {
        nr: 11,
        title: 'Back Tab',
        at: points.title,
        cutNr: 2,
        scale: 0.1,
      })
      //buttonhole
      points.buttonhole = new Point(points.topMid.x, points.bottomLeft.y)
      snippets.buttonhole = new Snippet('buttonhole', points.buttonhole).attr('data-scale', 0.75)
      if (sa) {
        points.saTopLeft = points.topLeft.translate(-sa, -sa)
        points.saBottomLeft = utils.beamsIntersect(
          points.saTopLeft,
          points.bottomLeft.shift(180, sa),
          points.bottomLeft.shiftTowards(points.bottomPeak, sa).rotate(-90, points.bottomLeft),
          points.bottomPeak.shiftTowards(points.bottomLeft, sa).rotate(90, points.bottomPeak)
        )
        points.saBottomPeak = utils.beamsIntersect(
          points.bottomLeft.shiftTowards(points.bottomPeak, sa).rotate(-90, points.bottomLeft),
          points.bottomPeak.shiftTowards(points.bottomLeft, sa).rotate(90, points.bottomPeak),
          points.bottomPeak.shiftTowards(points.bottomRight, sa).rotate(-90, points.bottomPeak),
          points.bottomRight.shiftTowards(points.bottomPeak, sa).rotate(90, points.bottomRight)
        )
        points.saBottomRight = points.saBottomLeft.flipX(points.bottomPeak)
        points.saTopRight = points.topRight.translate(sa, -sa)
        paths.sa = new Path()
          .move(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomPeak)
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
