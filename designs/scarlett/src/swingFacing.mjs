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
    //Set Render
    if (
      options.waistbandStyle == 'none' ||
      options.closurePosition != 'front' ||
      options.swingPanelStyle != 'connected'
    ) {
      part.hide()
      return part
    }
    //removing paths
    for (let i in paths) delete paths[i]
    //measures
    const swingWidth = store.get('swingWidth')
    //let's begin
    paths.sideSeam = new Path()
      .move(points.waist0Left)
      .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
      .line(points.hemD)
      .hide()

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

    paths.waist = new Path()
      .move(points.waistPanel0)
      .curve(points.waist0Cp3, points.waist0Cp4, points.waist0Left)
      .split(points.waistSplit)[1]
      .hide()

    paths.saBase = new Path()
      .move(points.swingDLeft)
      .line(points.swingDRight)
      .line(points.swingDartTipD)
      .curve(points.swingDartTipDCp1, points.swingDartTipDCp2, points.swingWaist0Left)
      .line(points.waistSplit)
      .join(paths.waist)
      .hide()

    paths.sideFrontSeam = new Path()
      .move(points.waist0Left)
      .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
      .line(points.swingDLeft)
      .hide()

    paths.seam = paths.saBase.clone().join(paths.sideFrontSeam).close()

    if (complete) {
      //grainline
      points.grainlineTo = points.swingDLeft.shiftFractionTowards(points.swingDRight, 0.75)
      points.grainlineFrom = utils.beamsIntersect(
        points.grainlineTo,
        points.swingDRight.rotate(90, points.grainlineTo),
        points.dartTipDCp1,
        points.dartTipDCp1.shift(points.swingDLeft.angle(points.swingDRight), 1)
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.dartTipD.shiftFractionTowards(points.swingDartTipD, 0.15)
      macro('title', {
        nr: 10,
        title: 'Swing Facing',
        at: points.title,
        rotation: points.swingDLeft.angle(points.dartTipD) * -1 - 270,
        scale: 0.25,
      })
      if (sa) {
        paths.sa = paths.saBase
          .offset(sa)
          .join(paths.sideFrontSeam.offset(sa * options.sideFrontSaWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
