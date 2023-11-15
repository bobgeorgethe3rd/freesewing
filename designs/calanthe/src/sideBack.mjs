import { base } from './base.mjs'

export const sideBack = {
  name: 'calanthe.sideBack',
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
      .move(points.cbTop)
      .curve(points.cbCp1, points.sideTopCp2, points.sideChest)
      .split(points.top4)[1]
      .hide()

    paths.seam = paths.topCurve
      .curve(points.sideChestCp2, points.waist30Cp1, points.waist30)
      .curve(points.waist30Cp2, points.hips30Cp1, points.b2BottomLeft)
      .curve_(points.b2BottomCp1, points.b2BottomRight)
      .curve(points.hips31Cp2, points.waist31Cp1, points.waist31)
      .curve(points.waist31Cp2, points.chest4Cp1, points.chest4)
      .line(points.top4)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waist30.x * 1.05, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.waist30.x * 1.075, points.sideChestCp2.y)
      macro('title', {
        nr: 'B3',
        title: 'Side Back',
        at: points.title,
        scale: 0.5,
      })
      // waist
      paths.waist = new Path()
        .move(points.waist30)
        .line(points.waist31)
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
