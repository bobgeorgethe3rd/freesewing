import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'
import { backBase } from './backBase.mjs'
import { sleeve as basicSleeve } from '@freesewing/basicsleeve'

export const sleeveBase = {
  name: 'denny.sleeveBase',
  from: basicSleeve,
  after: [frontBase, backBase],
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    sleeveBands: true, //Locked for Denny
    sleeveFlounces: false, //Locked for Denny
    sleeveLength: 1, //Locked for Denny
    sleeveHemWidth: 1, //Locked for Denny
    //Fit
    sleeveGuides: { bool: false, menu: 'fit' },
    wristEase: { pct: 30.8, min: 0, max: 50, menu: 'fit' }, //Altered for Denny
    //Sleeves
    sleevePleats: { bool: true, menu: 'sleeves' },
    sleevePleatWidth: { pct: 18.2, min: 15, max: 20, menu: 'sleeves' },
    sleeveBandWidth: {
      pct: 6.1,
      min: 1,
      max: 17.4,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
    utils,
  }) => {
    //removing paths and snippets not required from Dalton
    const keepPaths = ['seam', 'sleevecap']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.sleeveGuides) {
      paths.sleeveGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //measurements
    const sleevePleatWidth = measurements.wrist * options.sleevePleatWidth
    //let's begin
    if (options.fitSleeveWidth) {
      points.bottomRight = options.sleevePleats
        ? points.bottomRight.shift(0, sleevePleatWidth * 0.5)
        : points.bottomRight.shift(0, sleevePleatWidth * (1 / 3) * 0.5)
      points.bottomLeft = points.bottomRight.flipX(points.bottomAnchor)
    }
    points.backBottomRight = points.bottomAnchor.shiftFractionTowards(points.bottomLeft, 1 / 3)
    points.frontBottomLeft = points.backBottomRight.shift(0, (sleevePleatWidth * 1) / 3)

    points.sleevecapSplit = paths.sleevecap
      .reverse()
      .shiftAlong(store.get('backArmholeToArmholePitch') - store.get('sleeveBackDrop'))
    points.backBottomCurveEnd = points.frontBottomLeft.shiftFractionTowards(
      points.sleevecapSplit,
      0.5
    )
    points.backBottomCurveEndCp1 = points.backBottomCurveEnd.shiftFractionTowards(
      points.frontBottomLeft,
      0.5
    )

    if (options.sleevePleats) {
      points.sleevePleatAnchor = points.bottomAnchor.shiftFractionTowards(points.bottomRight, 0.5)
      points.sleevePleatBottomLeft = points.sleevePleatAnchor.shift(
        180,
        sleevePleatWidth * (2 / 3) * 0.5
      )
      points.sleevePleatBottomRight = points.sleevePleatBottomLeft.flipX(points.sleevePleatAnchor)
      points.sleevePleatTopLeft = points.sleevePleatBottomLeft.shift(90, sleevePleatWidth * 2)
      points.sleevePleatTopRight = new Point(
        points.sleevePleatBottomRight.x,
        points.sleevePleatTopLeft.y
      )

      paths.sleevePleats = new Path()
        .move(points.sleevePleatTopLeft)
        .line(points.sleevePleatBottomLeft)
        .move(points.sleevePleatTopRight)
        .line(points.sleevePleatBottomRight)
    }

    //guides
    paths.sleeveBackGuide = new Path()
      .move(points.sleeveCapLeft)
      .line(points.bottomLeft)
      .line(points.backBottomRight)
      ._curve(points.backBottomCurveEndCp1, points.backBottomCurveEnd)
    // .move(points.backBottomRight)
    // .curve(points.backBottomCurveEnd, points.backBottomCurveEnd, points.sleevecapSplit)

    paths.sleeveFrontGuide = new Path()
      .move(points.sleevecapSplit)
      .line(points.frontBottomLeft)
      .line(points.bottomRight)
      .line(points.sleeveCapRight)

    return part
  },
}
