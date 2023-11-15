import { base } from './base.mjs'

export const sideFront = {
  name: 'calanthe.sideFront',
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

    paths.topCurve = new Path()
      .move(points.sideChest)
      .curve(points.sideTopCp1, points.top1Cp2, points.top1)
      .split(points.top2)[0]
      .hide()

    paths.seam = paths.topCurve
      .line(points.chest2)
      .curve(points.chest2Cp1, points.waist20Cp1, points.waist20)
      .curve(points.waist20Cp2, points.hips20Cp1, points.f2BottomLeft)
      ._curve(points.f2BottomCp1, points.f2BottomRight)
      .curve(points.hips21Cp2, points.waist21Cp1, points.waist21)
      .curve(points.waist21Cp2, points.sideChestCp2, points.sideChest)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.chest2.x * 1.05, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.top2.x * 1.15, points.chest2Cp2.y)
      macro('title', {
        nr: 'F3',
        title: 'Side Front',
        at: points.title,
        scale: 0.5,
      })
      //waist
      paths.waist = new Path()
        .move(points.waist20)
        .line(points.waist21)
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
