import { base } from './base.mjs'

export const centreFront = {
  name: 'calanthe.centreFront',
  from: base,
  hide: {
    from: true,
  },
  options: {
    //Construction
    bottomSaWidth: { pct: 1, min: 0, max: 1, menu: 'construction' },
    topSaWidth: { pct: 1, min: 0, max: 1, menu: 'construction' },
    sideSaWidth: { pct: 1.5, min: 0.5, max: 2, menu: 'construction' },
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
    paths.saRight = new Path()
      .move(points.bottom0Right)
      .curve(points.bottom0RightCp2, points.waist0RightCp1, points.waist0Right)
      .curve(points.waist0RightCp2, points.apexCp, points.apex)
      .line(points.top1)
      .hide()

    paths.saTop = new Path()
      .move(points.topFrontMid)
      .curve_(points.topFrontMidCp2, points.cfTop)
      .split(points.top1)[1]
      .hide()

    paths.seam = new Path()
      .move(points.cfBottom)
      .line(points.bottom0Right)
      .join(paths.saRight)
      .join(paths.saTop)
      .line(points.cfBottom)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topFrontMidCp2.x * 0.5, points.cfTop.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHips.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.topFrontMidCp2.x, points.apexCp.y)
      macro('title', {
        nr: 'F1',
        title: 'Centre Front',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      //waist
      paths.waist = new Path()
        .move(points.cfWaist)
        .line(points.waist0Right)
        .attr('data-text', 'Waist-line')
        .attr('data-text-class', 'center')
        .attr('class', 'interfacing')

      if (sa) {
        const bottomSa = sa * options.bottomSaWidth * 100
        const topSa = sa * options.topSaWidth * 100
        const sideSa = sa * options.sideSaWidth * 100

        points.saCfBottom = utils.beamIntersectsX(
          points.cfBottom.shiftTowards(points.bottom0Right, bottomSa).rotate(-90, points.cfBottom),
          points.bottom0Right
            .shiftTowards(points.cfBottom, bottomSa)
            .rotate(90, points.bottom0Right),
          points.cfBottom.x - sa
        )

        points.saBottom0Right = utils.beamIntersectsX(
          points.cfBottom.shiftTowards(points.bottom0Right, bottomSa).rotate(-90, points.cfBottom),
          points.bottom0Right
            .shiftTowards(points.cfBottom, bottomSa)
            .rotate(90, points.bottom0Right),
          points.bottom0Right.x + sideSa
        )

        points.saTop1 = utils.beamIntersectsX(
          paths.saTop.offset(topSa).start(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.001),
          points.top1.x + sideSa
        )

        points.saCfTop = utils.beamIntersectsX(
          paths.saTop.offset(topSa).end(),
          paths.saTop.offset(topSa).shiftFractionAlong(0.999),
          points.cfTop.x - sa
        )

        paths.sa = new Path()
          .move(points.saCfBottom)
          .line(points.saBottom0Right)
          .join(paths.saRight.offset(sideSa))
          .line(points.saTop1)
          .join(paths.saTop.offset(topSa))
          .line(points.saCfTop)
          .line(points.saCfBottom)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
