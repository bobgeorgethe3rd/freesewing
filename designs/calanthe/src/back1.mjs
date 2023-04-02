import { base } from './base.mjs'

export const back1 = {
  name: 'calanthe.back1',
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
      .hide()

    let topSplit0 = paths.topCurve.split(points.top4)
    for (let i in topSplit0) {
      paths['topCurve' + i] = topSplit0[i].hide()
    }

    let topSplit1 = paths.topCurve0.split(points.top5)
    for (let i in topSplit1) {
      paths['topCurve' + i] = topSplit1[i].hide()
    }

    paths.seam = paths.topCurve1
      .line(points.chest4)
      .curve(points.chest4Cp2, points.waist40Cp1, points.waist40)
      .curve(points.waist40Cp2, points.hips40Cp1, points.b1BottomLeft)
      .curve(points.b1BottomCp1, points.b1BottomCp2, points.b1BottomRight)
      .curve(points.hips41Cp2, points.waist41Cp1, points.waist41)
      .curve(points.waist41Cp2, points.chest5Cp1, points.chest5)
      .line(points.top5)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waist40.x * 1.05, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.waist40.x * 1.075, points.chest4Cp2.y)
      macro('title', {
        nr: 'B2',
        title: 'Back Panel 1',
        at: points.title,
        scale: 0.5,
      })
      // waist
      paths.waist = new Path()
        .move(points.waist40)
        .line(points.waist41)
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
