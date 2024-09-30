import { pctBasedOn } from '@freesewing/core'
import { crown } from './crown.mjs'

export const visor = {
  name: 'henry.visor',
  after: crown,
  options: {
    visorAngle: { deg: 60, min: 10, max: 90, menu: 'style' },
    visorWidth: { pct: 9.4, min: 1, max: 17, snap: 5, ...pctBasedOn('head'), menu: 'style' },
    //Advanced
    visorLength: { pct: 114.2, min: 80, max: 150, menu: 'advanced' },
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
    log,
    absoluteOptions,
  }) => {
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    void store.setIfUnset('headRadius', store.get('headCircumference') / 2 / Math.PI)

    const headCircumference = store.get('headCircumference')
    const headRadius = store.get('headRadius')
    const visorRadius = headRadius / Math.sin((options.visorAngle * Math.PI) / 180)
    const sectorAngle = (Math.PI / 3) * options.visorLength
    const visorSectorAngle = (sectorAngle * headRadius) / visorRadius
    const cpDistance =
      ((4 / 3) * visorRadius * (1 - Math.cos(visorSectorAngle / 2))) /
      Math.sin(visorSectorAngle / 2)
    //let's begin
    points.topMid = new Point(0, 0)
    points.topRight = points.topMid.shift(
      (90 / Math.PI) * visorSectorAngle,
      2 * visorRadius * Math.sin(visorSectorAngle / 2)
    )
    points.topMidCp1 = points.topMid.shift(0, cpDistance)
    points.topRightCp2 = points.topRight.shift(180 + (180 / Math.PI) * visorSectorAngle, cpDistance)

    points.topMidCp2 = points.topMidCp1.flipX()
    points.topLeft = points.topRight.flipX()
    points.topLeftCp1 = points.topRightCp2.flipX()

    points.bottomMid = points.topMid.shift(-90, absoluteOptions.visorWidth)
    points.bottomMidCp2 = points.bottomMid.shift(0, 0.5 * points.topRight.x)
    points.topRightCp1 = points.topRight.shift(
      -90,
      (points.bottomMid.y - points.topRight.y) *
        (2 / (1 + Math.exp(-absoluteOptions.visorWidth / 15)) - 1)
    )

    points.bottomMidCp1 = points.bottomMidCp2.flipX()
    points.topLeftCp2 = points.topRightCp1.flipX()

    //paths
    paths.hemBase = new Path()
      .move(points.topRight)
      .curve(points.topRightCp2, points.topMidCp1, points.topMid)
      .curve(points.topMidCp2, points.topLeftCp1, points.topLeft)
      .hide()

    paths.saBase = new Path()
      .move(points.topLeft)
      .curve(points.topLeftCp2, points.bottomMidCp1, points.bottomMid)
      .curve(points.bottomMidCp2, points.topRightCp1, points.topRight)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid.shiftFractionTowards(points.topMidCp2, 1 / 3)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.topMidCp2.x, points.bottomMid.y * 0.45)
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'visor',
        cutNr: 4,
        scale: 0.25,
      })
      //centre line
      paths.centreLine = new Path()
        .move(points.topMid)
        .line(points.bottomMid)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Line')
        .attr('data-text-class', 'center')

      if (sa) {
        const crownSa = sa * options.crownSaWidth * 100

        points.saHemBaseEnd = points.topLeft.rotate(-90, paths.hemBase.offset(crownSa).end())
        points.saTopLeft = new Point(points.topLeft.x - sa, points.saHemBaseEnd.y)

        points.saHemBaseStart = points.saHemBaseEnd.flipX(points.topMid)
        points.saTopRight = points.saTopLeft.flipX(points.topMid)

        paths.sa = new Path()
          .move(points.saTopRight)
          .line(points.saHemBaseStart)
          .line(paths.hemBase.offset(crownSa).start())
          .join(paths.hemBase.offset(crownSa))
          .line(points.saHemBaseEnd)
          .line(points.saTopLeft)
          .line(paths.saBase.offset(sa).start())
          .join(paths.saBase.offset(sa))
          .line(points.saTopRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
