import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'

export const frontPanel = {
  name: 'calanthe.frontPanel',
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
      .move(points.bottom1Left)
      ._curve(points.bottom1RightCp1, points.bottom1Right)
      .hide()

    paths.saRight = new Path()
      .move(points.bottom1Right)
      .curve(points.bottom1RightCp2, points.waist1RightCp1, points.waist1Right)
      .curve(points.waist1RightCp2, points.chest2Cp, points.chest2)
      .line(points.top2)
      .hide()

    paths.saTop = new Path()
      .move(points.topMid)
      .curve(points.topMidCp2, points.topFrontMidCp1, points.topFrontMid)
      .curve_(points.topFrontMidCp2, points.cfTop)
      .split(points.top2)[1]
      .split(points.top1)[0]
      .hide()

    paths.saLeft = new Path()
      .move(points.top1)
      .line(points.apex)
      .curve(points.apexCp, points.waist1LeftCp1, points.waist1Left)
      .curve(points.waist1LeftCp2, points.bottom1LeftCp1, points.bottom1Left)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .join(paths.saRight)
      .join(paths.saTop)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waist1Left.x * 1.05, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.top1.x * 1.25, points.apexCp.y)
      macro('title', {
        nr: 'F2',
        title: 'Front Panel',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      //waist
      paths.waist = new Path()
        .move(points.waist1Left)
        .line(points.waist1Right)
        .attr('data-text', 'Waist-line')
        .attr('data-text-class', 'center')
        .attr('class', 'interfacing')

      if (sa) {
        const bottomSa = sa * options.bottomSaWidth * 100
        const topSa = sa * options.topSaWidth * 100
        const sideSa = sa * options.sideSaWidth * 100

        points.saBottom1Right = points.bottom1Right.translate(sideSa, bottomSa)
        points.saTop2 = utils.beamIntersectsX(
          paths.saTop.offset(topSa).start(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.001),
          points.top2.x + sideSa
        )
        if (points.saTop2.y > paths.saRight.offset(sideSa).end().y) {
          points.saTop2 = paths.saRight.offset(sideSa).end()
        }

        points.saTop1 = utils.beamIntersectsX(
          paths.saTop.offset(topSa).end(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.998),
          points.top1.x - sideSa
        )

        if (points.saTop1.y > paths.saLeft.offset(sideSa).start().y) {
          points.saTop1 = paths.saLeft.offset(sideSa).start()
        }

        points.saBottom1Left = utils.beamIntersectsX(
          points.bottom1Left
            .shiftTowards(points.bottom1RightCp1, bottomSa)
            .rotate(-90, points.bottom1Left),
          points.bottom1RightCp1
            .shiftTowards(points.bottom1Left, bottomSa)
            .rotate(90, points.bottom1RightCp1),
          points.bottom1Left.x - sideSa
        )

        paths.sa = paths.saBottom
          .clone()
          .offset(bottomSa)
          .line(points.saBottom1Right)
          .join(paths.saRight.offset(sideSa))
          .line(points.saTop2)
          .join(paths.saTop.offset(topSa))
          .line(points.saTop1)
          .join(paths.saLeft.offset(sideSa))
          .line(points.saBottom1Left)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
