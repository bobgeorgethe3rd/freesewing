import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'

export const sideFront = {
  name: 'calanthe.sideFront',
  from: base,
  after: centreFront,
  hide: {
    // from: true,
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
    //paths
    paths.saBottom = new Path()
      .move(points.bottom2Left)
      ._curve(points.bottom2RightCp1, points.bottom2Right)
      .hide()

    paths.saRight = new Path()
      .move(points.bottom2Right)
      .curve(points.bottom2RightCp2, points.waist2RightCp1, points.waist2Right)
      .curve(points.waist2RightCp2, points.sideChestCp, points.sideChest)
      .line(points.sideTop)
      .hide()

    paths.saTop = new Path()
      .move(points.topMid)
      .curve(points.topMidCp2, points.topFrontMidCp1, points.topFrontMid)
      .split(points.sideTop)[1]
      .split(points.top2)[0]
      .hide()

    paths.saLeft = new Path()
      .move(points.top2)
      .line(points.chest2)
      .curve(points.chest2Cp, points.waist2LeftCp1, points.waist2Left)
      .curve(points.waist2LeftCp2, points.bottom2LeftCp1, points.bottom2Left)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .join(paths.saRight)
      .join(paths.saTop)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.chest2.x * 1.05, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.top2.x * 1.15, points.chest2Cp.y)
      macro('title', {
        nr: 'F3',
        title: 'Side Front',
        at: points.title,
        scale: 0.5,
      })
      //waist
      paths.waist = new Path()
        .move(points.waist2Left)
        .line(points.waist2Right)
        .attr('data-text', 'Waist-line')
        .attr('data-text-class', 'center')
        .attr('class', 'interfacing')

      if (sa) {
      }
    }

    return part
  },
}
