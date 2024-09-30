import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'

export const sideBack = {
  name: 'calanthe.sideBack',
  from: base,
  after: centreFront,
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
        cutNr: 2,
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
        const bottomSa = sa * options.bottomSaWidth * 100
        const topSa = sa * options.topSaWidth * 100
        const sideSa = sa * options.sideSaWidth * 100

        points.saBottom3Right = utils.beamIntersectsX(
          points.bottom3LeftCp2
            .shiftTowards(points.bottom3Right, bottomSa)
            .rotate(-90, points.bottom3LeftCp2),
          points.bottom3Right
            .shiftTowards(points.bottom3LeftCp2, bottomSa)
            .rotate(90, points.bottom3Right),
          points.bottom3Right.x + sideSa
        )

        points.saTop4 = utils.beamIntersectsX(
          paths.saTop.offset(topSa).start(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.001),
          points.top4.x + sideSa
        )
        if (points.saTop4.y > paths.saRight.offset(sideSa).end().y) {
          points.saTop4 = paths.saRight.offset(sideSa).end()
        }

        points.saSideTop = utils.beamIntersectsX(
          paths.saTop.offset(topSa).end(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.998),
          points.sideTop.x - sideSa
        )

        if (points.saSideTop.y > paths.saLeft.offset(sideSa).start().y) {
          points.saSideTop = paths.saLeft.offset(sideSa).start()
        }
        points.saBottom3Left = points.bottom3Left.translate(-sideSa, bottomSa)

        paths.sa = paths.saBottom
          .clone()
          .offset(bottomSa)
          .line(points.saBottom3Right)
          .join(paths.saRight.offset(sideSa))
          .line(points.saTop4)
          .join(paths.saTop.offset(topSa))
          .line(points.saSideTop)
          .join(paths.saLeft.offset(sideSa))
          .line(points.saBottom3Left)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
