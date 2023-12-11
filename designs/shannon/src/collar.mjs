import { pctBasedOn } from '@freesewing/core'
import { collarBase } from '@freesewing/shirtcollar'
import { back } from './back.mjs'

export const collar = {
  name: 'shannon.collar',
  after: back,
  options: {
    //Imported
    ...collarBase.options,
    //Collar
    collarCurve: { pct: 0, min: 0, max: 100, menu: 'collar' },
    collarBandWidth: {
      pct: 7.7,
      min: 5,
      max: 10,
      snap: 5,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'collar',
    }, //altered for Shannon
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
      absoluteOptions,
      snippets,
      Snippet,
    } = sh
    //draft
    collarBase.draft(sh)
    //measurements
    //let's begin
    points.topCorner = utils.beamsIntersect(
      points.bottom,
      points.top.rotate(store.get('collarAngle'), points.bottom),
      points.topCp2,
      points.top
    )
    points.fTopCorner = points.topCorner.flipX(points.topMid)
    points.topCurveEnd = points.topCorner.shiftTowards(
      points.topCp2,
      points.bottom.dist(points.top) * options.collarCurve
    )
    points.fTopCurveEnd = points.topCurveEnd.flipX(points.topMid)

    //paths
    paths.saBottom = new Path()
      .move(points.fBottom)
      .curve(points.fBottomCp1, points.fBottomMidCp2, points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomCp1, points.bottom)
      .hide()

    paths.saRight = new Path()
      .move(points.bottom)
      ._curve(points.topCorner, points.topCurveEnd)
      .hide()

    paths.saTop = new Path()
      .move(points.topCurveEnd)
      .curve(points.topCp2, points.topMidCp1, points.topMid)
      .curve(points.fTopMidCp1, points.fTopCp2, points.fTopCurveEnd)
      .hide()

    paths.saLeft = new Path()
      .move(points.fTopCurveEnd)
      .curve_(points.fTopCorner, points.fBottom)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .join(paths.saRight)
      .join(paths.saTop)
      .join(paths.saLeft)
      .close()

    return part
  },
}
