import { pctBasedOn } from '@freesewing/core'
import { sleeve as basicsleeve } from '@freesewing/basicsleeve'

export const sleeveBase = {
  name: 'spreadsleeve.sleeveBase',
  options: {
    //Imported
    ...basicsleeve.options,
    //Sleeves
    sleeveLength: { pct: 50, min: 0, max: 100, menu: 'sleeves' }, //60
    spread: { pct: 60, min: 0, max: 120, menu: 'sleeves' }, //60
  },
  measurements: [...basicsleeve.measurements],
  plugins: [...basicsleeve.plugins],
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
    //draft basic sleeve
    basicsleeve.draft(sh)
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from sleevecap
    macro('title', false)

    //Setting the stage
    points.capQ4Bottom = new Point(points.capQ4.x, points.bottomAnchor.y)
    points.capQ3Bottom = new Point(points.capQ3.x, points.bottomAnchor.y)
    points.capQ2Bottom = new Point(points.capQ2.x, points.bottomAnchor.y)
    points.capQ1Bottom = new Point(points.capQ1.x, points.bottomAnchor.y)

    //intersects
    const capQ1I = utils.linesIntersect(
      points.capQ1,
      points.capQ1Bottom,
      points.sleeveCapRight,
      points.bottomRight
    )
    if (capQ1I) {
      points.capQ1Bottom = capQ1I
    }
    const capQ4I = utils.linesIntersect(
      points.capQ4,
      points.capQ4Bottom,
      points.sleeveCapLeft,
      points.bottomLeft
    )
    if (capQ4I) {
      points.capQ4Bottom = capQ4I
    }

    points.sleeveTipLeft = points.sleeveTip
    points.sleeveTipRight = points.sleeveTip
    points.sleeveTipBottomLeft = points.sleeveTipBottom
    points.sleeveTipBottomRight = points.sleeveTipBottom

    //spread path
    //Uncomment below to see how the spread works.
    paths.spread = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.bottomLeft)
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
      .line(points.sleeveCapRight)
      .curve_(points.capQ1Cp1, points.capQ1)
      .curve(points.capQ1Cp2, points.capQ2Cp1, points.capQ2)
      .curve_(points.capQ2Cp2, points.sleeveTip)
      ._curve(points.capQ3Cp1, points.capQ3)
      .curve(points.capQ3Cp2, points.capQ4Cp1, points.capQ4)
      ._curve(points.capQ4Cp2, points.sleeveCapLeft)
      .line(points.bottomLeft)
      .attr('class', 'various lashed')

    //Stores
    store.set('spreadAngle', options.spread * 100)

    return part
  },
}
