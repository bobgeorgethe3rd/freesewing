import { sleeveBase } from '@freesewing/spreadsleeve'
import { sleeve as spreadsleeve } from '@freesewing/spreadsleeve'

export const sleeve = {
  name: 'capsleeve.sleeve',
  from: sleeveBase,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...spreadsleeve.options,
    //Constants
    bicepsEase: 0, //Locked for Capsleeve
    elbowEase: 0, //Locked for Capsleeve
    wristEase: 0, //Locked for Capsleeve
    fitSleeveWidth: false, //Locked for Capsleeve
    flounces: 'none', //Locked for Capsleeve
    sleeveBandWidth: 0, //Locked for Capsleeve
    sleeveBands: false, //Locked for Capsleeve
    sleeveLength: 0, //Locked for Capsleeve
    sleeveLengthBonus: 0, //Locked for Capsleeve
    //Sleeves
    spread: { pct: 0, min: 0, max: 120, menu: 'sleeves' },
    sleeveReduction: { pct: 9, min: 7.5, max: 12, menu: 'sleeves' },
    //Construction
    sleeveCapSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sleeveHemWidth: { pct: 2, min: 1, max: 10, menu: 'construction' },
  },
  // plugins: [...spreadsleeve.plugins],
  draft: (sh) => {
    const {
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
    } = sh
    //draft basicsleeve
    spreadsleeve.draft(sh)
    //removing any paths from sleeveBase. This may not be necessary but is useful when working with the guides on.
    for (let i in paths) delete paths[i]
    //removing macros not required from sleevecap
    macro('title', false)
    //measures
    const sleeveReduction = measurements.shoulderToElbow * options.sleeveReduction
    //let's begin
    points.hemAnchor = points.midAnchor.shift(90, sleeveReduction)

    //hem
    // points.hemCp1Anchor = utils.beamsIntersect(
    // points.capQ4,
    // points.capQ4Cp1,
    // points.hemAnchor,
    // points.hemAnchor.shift(180, 1)
    // )
    // points.hemCp2Anchor = utils.beamsIntersect(
    // points.capQ1,
    // points.capQ1Cp2,
    // points.hemAnchor,
    // points.hemAnchor.shift(0, 1)
    // )
    points.hemCp1 = new Point(points.capQ3.x, points.hemAnchor.y)
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
      .curve_(points.capQ2Cp2, points.sleeveTip)
      ._curve(points.capQ3Cp1, points.capQ3)
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
      points.title = new Point(points.capQ3.x * 0.65, (points.sleeveTip.y + points.hemAnchor.y) / 2)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Cap Sleeve (' + utils.capitalize(options.spreadType) + ' Spread)',
        scale: 0.4,
      })
      if (sa) {
        const capSa = sa * options.sleeveCapSaWidth * 100
        const hemA = sa * options.sleeveHemWidth * 100

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
