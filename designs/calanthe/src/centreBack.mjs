import { base } from './base.mjs'

export const centreBack = {
  name: 'calanthe.centreBack',
  from: base,
  hide: {
    from: true,
  },
  options: {
    eyeletExtension: { pct: 2.9, min: 0, max: 6, menu: 'style' },
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
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    //measures
    let eyeletExtension = measurements.waist * options.eyeletExtension
    //let's begin
    points.eyeletBottom = points.cbBottom.shift(0, eyeletExtension)
    points.eyeletTop = points.cbTop.shift(0, eyeletExtension)

    paths.topCurve = new Path()
      .move(points.cbTop)
      .curve(points.cbCp1, points.sideTopCp2, points.sideChest)
      .hide()

    let topSplit = paths.topCurve.split(points.top5)
    for (let i in topSplit) {
      paths['topCurve' + i] = topSplit[i].hide()
    }

    paths.seam = paths.topCurve0
      .line(points.chest5)
      .curve(points.chest5Cp2, points.waist50Cp1, points.waist50)
      .curve(points.waist50Cp2, points.hips50Cp1, points.b0BottomLeft)
      ._curve(points.cbBottomCp1, points.cbBottom)
      .line(points.eyeletBottom)
      .line(points.eyeletTop)
      .line(points.cbTop)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waist50.x * 1.025, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.waist50.x * 1.075, points.chest5Cp2.y)
      macro('title', {
        nr: 'F6',
        title: 'Centre Back',
        at: points.title,
        scale: 0.5,
      })
      // waist
      paths.waist = new Path()
        .move(points.waist50)
        .line(points.cbWaist.shift(0, eyeletExtension))
        .attr('data-text', 'Waist-line')
        .attr('data-text-class', 'center')
        .attr('class', 'interfacing')

      //eyelet
      if (options.eyeletExtension > 0) {
        paths.centreBack = new Path()
          .move(points.cbTop)
          .line(points.cbBottom)
          .attr('data-text', 'Centre Back')
          .attr('data-text-class', 'center')
          .attr('class', 'interfacing')
      }
      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
