import { pctBasedOn } from '@freesewing/core'
import { sleeve as basicsleeve } from '@freesewing/basicsleeve'
import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { frontBase } from './frontBase.mjs'

export const sleeve = {
  name: 'shaun.sleeve',
  after: [backBase, back, frontBase],
  measurements: [...basicsleeve.measurements],
  options: {
    //Imported
    ...basicsleeve.options,
    //Constants
    sleeveFlounces: 'none', //Locked for Shaun
    //Sleeves
    sleeveType: { dflt: 'long', list: ['short', 'long'], menu: 'sleeves' },
    sleevePleats: { bool: true, menu: 'sleeves' },
    sleeveLength: { pct: 25, min: 15, max: 50, menu: 'sleeves' }, //Altered for Shaun
    sleeveBandWidth: {
      pct: 9.2,
      min: 7,
      max: 17,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    }, //Altered for Shaun
    sleeveSideCurve: { pct: 50, min: 0, max: 100, menu: 'sleeves' },
    sleeveHemCurve: { pct: 1.7, min: 0, max: 2, menu: 'sleeves' },
  },
  draft: (sh) => {
    //draft
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
      Snippet,
      absoluteOptions,
      log,
    } = sh
    //settings
    if (options.sleeveType == 'long') {
      options.sleeveLength = 1
      options.sleeveBands = true
      options.fitSleeveWidth = true
    } else {
      absoluteOptions.sleeveBandWidth = new Number(0)
    }
    //draft
    basicsleeve.draft(sh)
    //let's begin
    if (options.sleeveType == 'short') {
      points.bottomLeftCp1Max = new Point(points.bottomLeft.x, points.bottomLeft.y / 2)

      const sleeveSideAngle =
        points.sleeveCapLeft.angle(points.bottomLeftCp1Max) -
        points.sleeveCapLeft.angle(points.bottomLeft)

      points.bottomLeftCp1 = points.bottomLeftCp1Max.rotate(
        sleeveSideAngle * (1 - options.sleeveSideCurve),
        points.bottomLeft
      )
      points.bottomRightCp2 = new Point(points.bottomRight.x, points.bottomRight.y / 2).rotate(
        sleeveSideAngle * (1 - options.sleeveSideCurve) * -1,
        points.bottomRight
      )

      paths.saLeft = new Path()
        .move(points.sleeveCapLeft)
        ._curve(points.bottomLeftCp1, points.bottomLeft)
        .hide()

      paths.saRight = new Path()
        .move(points.bottomRight)
        .curve_(points.bottomRightCp2, points.sleeveCapRight)
        .hide()

      paths.seam = paths.hemBase
        .join(paths.saRight)
        .join(paths.sleevecap)
        .join(paths.saLeft)
        .close()

      if (complete) {
        if (sa) {
          paths.sa = paths.hemBase
            .offset(sa * options.hemWidth * 100)
            .join(paths.saRight.offset(sa))
            .join(paths.sleevecap.offset(sa * options.armholeSaWidth * 100))
            .join(paths.saLeft.offset(sa))
            .close()
            .attr('class', 'fabric sa')
        }
      }
    } else {
      //measures
      const storedBottomWidth = points.bottomLeft.dist(points.bottomRight)
      const sleeveHemDrop = measurements.shoulderToWrist * options.sleeveHemCurve
      //settings
      if (
        options.sleevePleats &&
        storedBottomWidth < points.sleeveCapLeft.dist(points.sleeveCapRight) * (2 / 3)
      ) {
        points.bottomLeft = new Point(points.sleeveCapLeft.x * (2 / 3), points.bottomAnchor.y)
        points.bottomRight = new Point(points.sleeveCapRight.x * (2 / 3), points.bottomAnchor.y)
      }
      const sleeveSideAngle = points.sleeveCapLeft.angle(points.bottomLeft) - 270

      //let's begin
      points.bottomLeftCp1 = new Point(points.sleeveCapLeft.x, points.bottomAnchor.y / 2).rotate(
        sleeveSideAngle * (1 - options.sleeveSideCurve),
        points.sleeveCapLeft
      )
      points.bottomRightCp2 = new Point(points.sleeveCapRight.x, points.bottomAnchor.y / 2).rotate(
        sleeveSideAngle * (1 - options.sleeveSideCurve) * -1,
        points.sleeveCapRight
      )

      points.slitBottom = new Point(points.bottomLeft.x / 2, points.bottomAnchor.y + sleeveHemDrop)
      points.slitBottomCp1 = new Point((points.bottomLeft.x * 3) / 4, points.slitBottom.y)
      points.slitBottomCp2 = new Point(points.bottomLeft.x / 4, points.slitBottom.y)

      //paths
      paths.saLeft = new Path()
        .move(points.sleeveCapLeft)
        .curve_(points.bottomLeftCp1, points.bottomLeft)
        .hide()

      paths.hemBase = new Path()
        .move(points.bottomLeft)
        ._curve(points.slitBottomCp1, points.slitBottom)
        .curve_(points.slitBottomCp2, points.bottomAnchor)
        .line(points.bottomRight)
        .hide()

      paths.saRight = new Path()
        .move(points.bottomRight)
        ._curve(points.bottomRightCp2, points.sleeveCapRight)
        .hide()

      paths.seam = paths.hemBase
        .join(paths.saRight)
        .join(paths.sleevecap)
        .join(paths.saLeft)
        .close()

      if (complete) {
        if (sa) {
          paths.sa = paths.hemBase
            .offset(sa * options.hemWidth * 100)
            .join(paths.saRight.offset(sa))
            .join(paths.sleevecap.offset(sa * options.armholeSaWidth * 100))
            .join(paths.saLeft.offset(sa))
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: '6',
        title: 'Sleeve (' + utils.capitalize(options.sleeveType) + ')',
        scale: 0.5,
      })
    }

    return part
  },
}
