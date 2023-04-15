import { skirtBase } from './skirtBase.mjs'
import { placket } from './placket.mjs'

export const swingFacing = {
  name: 'scarlett.swingFacing',
  from: skirtBase,
  after: placket,
  hide: {
    from: true,
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
    absoluteOptions,
    log,
  }) => {
    //removing paths
    for (let i in paths) delete paths[i]
    //measures
    let swingWidth = store.get('swingWidth')
    //let's begin
    paths.sideSeam = new Path()
      .move(points.waist0Left)
      .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
      .line(points.hemD)
    // .hide()

    paths.waist = new Path()
      .move(points.waistPanel0)
      .curve(points.waist0Cp3, points.waist0Cp4, points.waist0Left)
    // .hide()

    points.swingDLeft = paths.sideSeam.shiftAlong(store.get('placketLength'))
    points.swingDRight = points.swingDLeft
      .shiftTowards(points.dartTipD, swingWidth)
      .rotate(-90, points.swingDLeft)
    points.swingDartTipD = points.dartTipD
      .shiftTowards(points.waistD, swingWidth)
      .rotate(-90, points.dartTipD)
    points.swingDartTipDCp1 = points.dartTipDCp2
      .shiftTowards(points.waistD, swingWidth)
      .rotate(-90, points.dartTipDCp2)
    points.swingDartTipDCp2 = points.dartTipDCp1
      .shiftTowards(points.waist0Left, swingWidth)
      .rotate(-90, points.dartTipDCp1)
    points.swingWaist0Left = points.waist0Left.shiftTowards(points.waist0Cp4, swingWidth)

    points.waistSplit = utils.lineIntersectsCurve(
      points.swingDartTipDCp2,
      points.swingDartTipDCp2.shiftOutwards(points.swingWaist0Left, store.get('placketLength')),
      points.waistPanel0,
      points.waist0Cp3,
      points.waist0Cp4,
      points.waist0Left
    )

    if (complete) {
      //grainline
      // points.grainlineFrom = points.cfUpperLeg.shiftFractionTowards(points.crotch, 0.8)
      // points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
      // macro('grainline', {
      // from: points.grainlineFrom,
      // to: points.grainlineTo,
      // })
      //title

      // macro('title', {
      // nr: 10,
      // title: 'Swing Facing',
      // at: points.title,
      // })
      if (sa) {
      }
    }

    return part
  },
}
