import { base } from './base.mjs'
import { centreFront } from './centreFront.mjs'

export const backPanel = {
  name: 'calanthe.backPanel',
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
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    //let's begin
    //paths
    paths.saBottom = new Path()
      .move(points.bottom4Left)
      .curve_(points.bottom4LeftCp2, points.bottom4Right)
      .hide()

    paths.saRight = new Path()
      .move(points.bottom4Right)
      .curve(points.bottom4RightCp2, points.waist4RightCp1, points.waist4Right)
      .curve(points.waist4RightCp2, points.chest5Cp, points.chest5)
      .line(points.top5)
      .hide()

    paths.saTop = new Path()
      .move(points.cbTop)
      .curve(points.cbTopCp2, points.topMidCp1, points.topMid)
      .curve(points.topMidCp2, points.topFrontMidCp1, points.topFrontMid)
      .split(points.top5)[1]
      .split(points.top4)[0]
      .hide()

    paths.saLeft = new Path()
      .move(points.top4)
      .line(points.chest4)
      .curve(points.chest4Cp, points.waist4LeftCp1, points.waist4Left)
      .curve(points.waist4LeftCp2, points.bottom4LeftCp1, points.bottom4Left)
      .hide()

    paths.seam = paths.saBottom.join(paths.saRight).join(paths.saTop).join(paths.saLeft).close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waist4Left.x * 1.05, points.cfChest.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.waist4Left.x * 1.075, points.chest4Cp.y)
      macro('title', {
        nr: 'B2',
        title: 'Back Panel',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      // waist
      paths.waist = new Path()
        .move(points.waist4Left)
        .line(points.waist4Right)
        .attr('data-text', 'Waist-line')
        .attr('data-text-class', 'center')
        .attr('class', 'interfacing')

      if (sa) {
        const bottomSa = sa * options.bottomSaWidth * 100
        const topSa = sa * options.topSaWidth * 100
        const sideSa = sa * options.sideSaWidth * 100

        points.saBottom4Right = utils.beamIntersectsX(
          points.bottom4LeftCp2
            .shiftTowards(points.bottom4Right, bottomSa)
            .rotate(-90, points.bottom4LeftCp2),
          points.bottom4Right
            .shiftTowards(points.bottom4LeftCp2, bottomSa)
            .rotate(90, points.bottom4Right),
          points.bottom4Right.x + sideSa
        )

        points.saTop5 = utils.beamIntersectsX(
          paths.saTop.offset(topSa).start(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.001),
          points.top5.x + sideSa
        )
        if (points.saTop5.y > paths.saRight.offset(sideSa).end().y) {
          points.saTop5 = paths.saRight.offset(sideSa).end()
        }

        points.saTop4 = utils.beamIntersectsX(
          paths.saTop.offset(topSa).end(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.998),
          points.top4.x - sideSa
        )

        if (points.saTop4.y > paths.saLeft.offset(sideSa).start().y) {
          points.saTop4 = paths.saLeft.offset(sideSa).start()
        }
        points.saBottom4Left = points.bottom4Left.translate(-sideSa, bottomSa)

        paths.sa = paths.saBottom
          .clone()
          .offset(bottomSa)
          .line(points.saBottom4Right)
          .join(paths.saRight.offset(sideSa))
          .line(points.saTop5)
          .join(paths.saTop.offset(topSa))
          .line(points.saTop4)
          .join(paths.saLeft.offset(sideSa))
          .line(points.saBottom4Left)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
