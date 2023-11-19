import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'

export const sideBack = {
  name: 'calanthe.sideBack',
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
    //removing paths and snippets not required from Base
    for (let i in paths) delete paths[i]
    //let's begin
    //paths
    paths.saBottom = new Path()
      .move(points.bottom3Left)
      ._curve(points.bottom3LeftCp2, points.bottom3Right)
      .hide()

    paths.saRight = new Path()
      .move(points.bottom3Right)
      .curve(points.bottom3RightCp2, points.waist3RightCp1, points.waist3Right)
      .curve(points.waist3RightCp2, points.chest4Cp, points.chest4)
      .line(points.top4)
      .hide()

    paths.saTop = new Path()
      .move(points.cbTop)
      .curve(points.cbTopCp2, points.topMidCp1, points.topMid)
      .curve(points.topMidCp2, points.topFrontMidCp1, points.topFrontMid)
      .split(points.top4)[1]
      .split(points.sideTop)[0]
      .hide()

    paths.saLeft = new Path()
      .move(points.sideTop)
      .line(points.sideChest)
      .curve(points.sideChestCp, points.waist3LeftCp1, points.waist3Left)
      .curve(points.waist3LeftCp2, points.bottom3LeftCp1, points.bottom3Left)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .join(paths.saRight)
      .join(paths.saTop)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waist3Left.x * 1.05, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.waist3Left.x * 1.075, points.sideChestCp.y)
      macro('title', {
        nr: 'B3',
        title: 'Side Back',
        at: points.title,
        scale: 0.5,
      })
      // waist
      paths.waist = new Path()
        .move(points.waist3Left)
        .line(points.waist3Right)
        .attr('data-text', 'Waist-line')
        .attr('data-text-class', 'center')
        .attr('class', 'interfacing')

      if (sa) {
      }
    }

    return part
  },
}
