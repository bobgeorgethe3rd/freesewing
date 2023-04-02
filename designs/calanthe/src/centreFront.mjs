import { base } from './base.mjs'

export const centreFront = {
  name: 'calanthe.centreFront',
  from: base,
  hide: {
    from: true,
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
    //let's begin

    paths.seam = new Path()
      .move(points.cfTop)
      .line(points.cfBottom)
      .line(points.f0BottomRight)
      .curve(points.hips01Cp2, points.waist01Cp1, points.waist01)
      .curve(points.waist01Cp2, points.apexCp1, points.apex)
      .line(points.top1)
      .curve_(points.top1Cp1, points.cfTop)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.top1Cp1.x * 0.5, points.cfTop.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.top1Cp1.x, points.apexCp1.y)
      macro('title', {
        nr: 'F1',
        title: 'Centre Front',
        at: points.title,
        scale: 0.5,
      })
      //waist
      paths.waist = new Path()
        .move(points.cfWaist)
        .line(points.waist01)
        .attr('data-text', 'Waist-line')
        .attr('data-text-class', 'center')
        .attr('class', 'interfacing')

      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
