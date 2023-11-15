import { base } from './base.mjs'

export const frontPanel = {
  name: 'calanthe.frontPanel',
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
      .split(points.top2)[1]
      .hide()

    paths.seam = paths.topCurve
      .line(points.apex)
      .curve(points.apexCp2, points.waist10Cp1, points.waist10)
      .curve(points.waist10Cp2, points.hips10Cp1, points.f1BottomLeft)
      .curve(points.f1BottomCp1, points.f1BottomCp2, points.f1BottomRight)
      .curve(points.hips11Cp2, points.waist11Cp1, points.waist11)
      .curve(points.waist11Cp2, points.chest2Cp1, points.chest2)
      .line(points.top2)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waist10.x * 1.05, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.top1.x * 1.25, points.apexCp2.y)
      macro('title', {
        nr: 'F2',
        title: 'Front Panel',
        at: points.title,
        scale: 0.5,
      })
      //waist
      paths.waist = new Path()
        .move(points.waist10)
        .line(points.waist11)
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
