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
    sleeveFlounces: 'none', //Locked for Capsleeve
    sleeveBandWidth: 0, //Locked for Capsleeve
    sleeveBands: false, //Locked for Capsleeve
    sleeveLength: 0, //Locked for Capsleeve
    sleeveLengthBonus: 0, //Locked for Capsleeve
    sideSeamSaWidth: 0.01, //Locked for Capsleeve
    //Sleeves
    spread: { pct: 0, min: 0, max: 120, menu: 'sleeves' },
    sleeveReduction: { pct: (1 / 3) * 100, min: 25, max: 50, menu: 'sleeves' },
  },
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
    // const sleeveReduction = measurements.shoulderToElbow * options.sleeveReduction
    //let's begin
    points.hemAnchor = points.midAnchor.shiftFractionTowards(
      new Point(points.midAnchor.x, points.sleeveTip.y),
      options.sleeveReduction
    )

    //hem
    // points.hemAnchorCp1Anchor = utils.beamsIntersect(
    // points.capQ4,
    // points.capQ4Cp1,
    // points.hemAnchor,
    // points.hemAnchor.shift(180, 1)
    // )
    // points.hemAnchorCp2Anchor = utils.beamsIntersect(
    // points.capQ1,
    // points.capQ1Cp2,
    // points.hemAnchor,
    // points.hemAnchor.shift(0, 1)
    // )
    points.hemAnchorCp1 = new Point(points.capQ3.x, points.hemAnchor.y)
    points.hemAnchorCp2 = new Point(points.capQ2.x, points.hemAnchor.y)

    //paths
    paths.hemBase = new Path()
      .move(points.capQ4)
      .curve(points.capQ4Cp1, points.hemAnchorCp1, points.hemAnchor)
      .curve(points.hemAnchorCp2, points.capQ1Cp2, points.capQ1)
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
        cutNr: 2,
        scale: 1 / 3,
      })
      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100
        const hemSa = sa * options.sleeveHemWidth * 100

        points.saCapQ4 = points.capQ4Cp1.shiftOutwards(points.capQ4, sa)
        points.saCapQ1 = points.capQ1Cp2.shiftOutwards(points.capQ1, sa)

        points.saBaseStart = paths.saBase.offset(armholeSa).start()
        points.saBaseEnd = paths.saBase.offset(armholeSa).end()

        points.hemBaseStart = paths.hemBase.offset(hemSa).start()
        points.hemBaseEnd = paths.hemBase.offset(hemSa).end()

        points.saTopLeft = utils.beamsIntersect(
          points.saBaseEnd,
          points.capQ4.rotate(-90, points.saBaseEnd),
          points.saCapQ4,
          points.capQ4.rotate(90, points.saCapQ4)
        )

        points.saBottomLeft = utils.beamsIntersect(
          points.saTopLeft,
          points.saCapQ4,
          points.hemBaseStart,
          points.capQ4.rotate(90, points.hemBaseStart)
        )

        points.saTopRight = utils.beamsIntersect(
          points.saCapQ1,
          points.capQ1.rotate(-90, points.saCapQ1),
          points.saBaseStart,
          points.capQ1.rotate(90, points.saBaseStart)
        )
        points.saBottomRight = utils.beamsIntersect(
          points.saTopRight,
          points.saCapQ1,
          points.hemBaseEnd,
          points.capQ1.rotate(-90, points.hemBaseEnd)
        )

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saBottomRight)
          .line(points.saCapQ1)
          .line(points.saTopRight)
          .line(points.saBaseStart)
          .join(paths.saBase.offset(armholeSa))
          .line(points.saTopLeft)
          .line(points.saCapQ4)
          .line(points.saBottomLeft)
          .line(points.hemBaseStart)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
