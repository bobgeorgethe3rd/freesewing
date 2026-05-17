import { crown } from './crown.mjs'

export const crownSide = {
  name: 'playtest.crownSide',
  after: crown,
  options: {
    cpFraction: 0.55191502449,
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
    utils,
    snippets,
    Snippet,
  }) => {
    //measures
    const crownWidth = store.get('crownWidth')
    const length = store.get('crownCircumference') / 4 - crownWidth / 2
    const width = (store.get('headCircumference') - crownWidth * 2) / 2
    //let's begin
    points.origin = new Point(0, 0)
    points.bottomLeft = points.origin.shift(-180, width / 2)
    points.top = points.origin.shift(90, length)
    points.bottomLeftCurveEnd = new Point(points.bottomLeft.x, points.top.y + width / 2)
    points.bottomLeftCurveEndCp1 = points.bottomLeftCurveEnd.shift(
      90,
      width * options.cpFraction * 0.5
    )
    points.topCp2 = points.top.shift(180, width * options.cpFraction * 0.5)
    points.bottomRight = points.bottomLeft.flipX()
    points.bottomRightCurveStart = points.bottomLeftCurveEnd.flipX()
    points.bottomRightCurveStartCp2 = points.bottomLeftCurveEndCp1.flipX()
    points.topCp1 = points.topCp2.flipX()

    paths.saBase = new Path()
      .move(points.bottomRight)
      .line(points.bottomRightCurveStart)
      .curve(points.bottomRightCurveStartCp2, points.topCp1, points.top)
      .curve(points.topCp2, points.bottomLeftCurveEndCp1, points.bottomLeftCurveEnd)
      .line(points.bottomLeft)
      .hide()

    paths.seam = paths.saBase.clone().line(points.bottomRight).close().unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.bottomLeft.x * 0.5, points.top.y * 0.8)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.top = new Snippet('notch', points.top)
      //title
      points.title = new Point(points.top.x, points.top.y * 0.5)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'crownSide',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const crownSa = sa * options.crownSaWidth * 100

        points.saBottomLeft = points.bottomLeft.translate(-sa, crownSa)
        points.saBottomRight = points.saBottomLeft.flipX()

        paths.sa = paths.saBase
          .offset(sa)
          .line(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(paths.saBase.offset(sa).start())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
