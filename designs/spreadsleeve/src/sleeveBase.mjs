import { pctBasedOn } from '@freesewing/core'
import { sleeve as basicsleeve } from '@freesewing/basicsleeve'

export const sleeveBase = {
  name: 'spreadsleeve.sleeveBase',
  from: basicsleeve,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //style
    sleeveLength: { pct: 50, min: 0, max: 100, menu: 'style' }, //60
    spread: { pct: 60, min: 0, max: 120, menu: 'style' }, //60
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
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from sleevecap
    macro('title', false)

    //Setting the stage
    points.capQ4Bottom = new Point(points.capQ4.x, points.bottomAnchor.y)
    points.capQ3Bottom = new Point(points.capQ3.x, points.bottomAnchor.y)
    points.capQ2Bottom = new Point(points.capQ2.x, points.bottomAnchor.y)
    points.capQ1Bottom = new Point(points.capQ1.x, points.bottomAnchor.y)

    points.sleeveTipBottomLeft = points.sleeveTipBottom
    points.sleeveTipBottomRight = points.sleeveTipBottom

    //spread path
    //Uncomment below to see how the spread works. note the sleeve head between capQ2 and capQ3 is not altered fully in this path but is below.
    paths.spread = new Path()
      .move(points.bottomLeft)
      .line(points.capQ4Bottom)
      .line(points.capQ4)
      .line(points.capQ4Bottom)
      .line(points.capQ3Bottom)
      .line(points.capQ3)
      .line(points.capQ3Bottom)
      .line(points.sleeveTipBottom)
      .line(points.sleeveTip)
      .line(points.sleeveTipBottom)
      .line(points.capQ2Bottom)
      .line(points.capQ2)
      .line(points.capQ2Bottom)
      .line(points.capQ1Bottom)
      .line(points.capQ1)
      .line(points.capQ1Bottom)
      .line(points.bottomRight)
      .line(points.bicepsRight)
      .curve(points.bicepsRight, points.capQ1Cp1, points.capQ1)
      .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
      .curve(points.capQ2Cp2, points.capQ3Cp1, points.capQ3)
      .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
      .curve(points.capQ4Cp2, points.bicepsLeft, points.bicepsLeft)
      .line(points.bottomLeft)
      .attr('class', 'various lashed')

    //Stores
    store.set('spreadAngle', options.spread * 100)

    return part
  },
}
