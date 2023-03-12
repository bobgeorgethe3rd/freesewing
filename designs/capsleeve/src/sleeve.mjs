import { sleevecap } from '@freesewing/sleevecap'

export const sleeve = {
  name: 'capsleeve.sleeve',
  from: sleevecap,
  hide: {
    from: true,
    inherited: true,
  },
  measurements: ['shoulderToElbow'],
  options: {
    //Style
    sleeveReduction: { pct: 10.6, min: 9, max: 12, menu: 'style' },
    //Advanced
    sleeveCapDepthFactor: { pct: 50, min: 30, max: 50, menu: 'advanced' },
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
    absoluteOptions,
    log,
  }) => {
    //removing any paths from sleeveBase. This may not be necessary but is useful when working with the guides on.
    for (let i in paths) delete paths[i]
    // for (let i in snippets) delete snippets[i]
    //removing macros not required from sleevecap
    macro('title', false)
    //measures
    let sleeveReduction = measurements.shoulderToElbow * options.sleeveReduction
    //let's begin
    points.hemAnchor = points.gridAnchor.shift(90, sleeveReduction)

    //hem
    points.hemCp1Anchor = utils.beamsIntersect(
      points.capQ4,
      points.capQ4Cp1,
      points.hemAnchor,
      points.hemAnchor.shift(180, 1)
    )
    points.hemCp2Anchor = utils.beamsIntersect(
      points.capQ1,
      points.capQ1Cp2,
      points.hemAnchor,
      points.hemAnchor.shift(0, 1)
    )
    points.hemCp1 = new Point(
      (points.hemCp1Anchor.x - points.hemCp2Anchor.x) / 2,
      points.hemAnchor.y
    )
    points.hemCp2 = points.hemCp1.flipX(points.hemAnchor)

    //paths
    paths.hemBase = new Path()
      .move(points.capQ4)
      .curve(points.capQ4Cp1, points.hemCp1, points.hemAnchor)
      .curve(points.hemCp2, points.capQ1Cp2, points.capQ1)
      .hide()

    paths.saBase = new Path()
      .move(points.capQ1)
      .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
      .curve(points.capQ2Cp2, points.capQ3Cp1, points.capQ3)
      .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
      .hide()

    paths.seam = paths.hemBase.join(paths.saBase).close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.hemAnchor.x, points.sleeveTip.y)
      points.grainlineTo = points.hemAnchor
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.capQ3.x * 0.5, points.capQ3.y * 0.9)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Cap Sleeve',
        scale: 0.4,
      })
      if (sa) {
        let capSa = sa * options.sleeveCapSaWidth * 100
        let hemA = sa * options.sleeveHemWidth * 100

        points.saLeft = points.capQ4Cp1.shiftOutwards(points.capQ4, sa)
        points.saRight = points.capQ1Cp2.shiftOutwards(points.capQ1, sa)
        paths.sa = paths.hemBase
          .offset(hemA)
          .line(points.saRight)
          .line(paths.saBase.offset(capSa).start())
          .join(paths.saBase.offset(capSa))
          .line(points.saLeft)
          .line(paths.hemBase.offset(hemA).start())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
