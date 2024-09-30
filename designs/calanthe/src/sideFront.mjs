import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'

export const sideFront = {
  name: 'calanthe.sideFront',
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
        cutNr: 2,
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
        const bottomSa = sa * options.bottomSaWidth * 100
        const topSa = sa * options.topSaWidth * 100
        const sideSa = sa * options.sideSaWidth * 100

        points.saBottom2Right = points.bottom2Right.translate(sideSa, bottomSa)
        points.saSideChest = utils.beamIntersectsX(
          paths.saTop.offset(topSa).start(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.001),
          points.sideChest.x + sideSa
        )
        if (points.saSideChest.y > paths.saRight.offset(sideSa).end().y) {
          points.saSideChest = paths.saRight.offset(sideSa).end()
        }

        points.saTop2 = utils.beamIntersectsX(
          paths.saTop.offset(topSa).end(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.998),
          points.top2.x - sideSa
        )

        if (points.saTop2.y > paths.saLeft.offset(sideSa).start().y) {
          points.saTop2 = paths.saLeft.offset(sideSa).start()
        }

        points.saBottom2Left = utils.beamIntersectsX(
          points.bottom2Left
            .shiftTowards(points.bottom2RightCp1, bottomSa)
            .rotate(-90, points.bottom2Left),
          points.bottom2RightCp1
            .shiftTowards(points.bottom2Left, bottomSa)
            .rotate(90, points.bottom2RightCp1),
          points.bottom2Left.x - sideSa
        )

        paths.sa = paths.saBottom
          .clone()
          .offset(bottomSa)
          .line(points.saBottom2Right)
          .join(paths.saRight.offset(sideSa))
          .line(points.saSideChest)
          .join(paths.saTop.offset(topSa))
          .line(points.saTop2)
          .join(paths.saLeft.offset(sideSa))
          .line(points.saBottom2Left)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
