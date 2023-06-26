import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'

export const backFacing = {
  name: 'sammie.backFacing',
  from: backBase,
  after: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Construction
    bodiceFacings: { bool: true, menu: 'construction' },
    bodiceFacingWidth: { pct: 50, min: 10, max: 50, menu: 'construction' },
    bodiceFacingHemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
  }) => {
    //set render
    if (!options.bodiceFacings) {
      part.hide()
      return part
    }
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //measures
    const bodiceFacingWidthTarget = store.get('sideLength') * options.bodiceFacingWidth
    const bodiceFacingWidthMax = store.get('bodiceFacingWidthMax')
    let bodiceFacingWidth
    if (bodiceFacingWidthTarget > bodiceFacingWidthMax) {
      bodiceFacingWidth = bodiceFacingWidthMax
    } else {
      bodiceFacingWidth = bodiceFacingWidthTarget
    }
    const dartOffset = points.dartLeftSplit.dist(points.dartRightSplit)
    //let's begin
    const shift = [
      'armhole',
      'waistSideCp2',
      'waistSide',
      'armholeDrop',
      'armholeDropCp2',
      'dartRightSplitCp1',
      'dartRightSplit',
    ]
    for (const p of shift) points[p] = points[p].shift(180, dartOffset)
    points.cbFacing = points.cbTop.shift(-90, bodiceFacingWidth)
    points.cbFacingCp2 = points.cbTopCp1.shift(-90, bodiceFacingWidth)
    points.armholeFacing = points.armholeDrop.shift(-90, bodiceFacingWidth)
    points.facingBottomMid = points.dartRightSplit.shift(-90, bodiceFacingWidth)
    points.facingBottomMidCp2 = points.dartRightSplitCp1.shift(-90, bodiceFacingWidth)

    points.armholeFacingTarget = points.facingBottomMidCp2.shiftOutwards(
      points.armholeFacing,
      measurements.waist * 10
    )

    paths.hemBase = new Path()
      .move(points.cbFacing)
      .curve_(points.cbFacingCp2, points.facingBottomMid)
      .curve_(points.facingBottomMidCp2, points.armholeFacing)
      .line(points.armholeFacingTarget)
      .hide()

    points.bottomTarget = points.cbNeckCp2.shiftOutwards(
      points.waistCenter,
      measurements.hpsToWaistBack * 10
    )

    paths.cb = new Path()
      .move(points.cbNeck)
      .curve_(points.cbNeckCp2, points.waistCenter)
      .line(points.bottomTarget)
      .split(points.cbTop)[1]
      .hide()

    const cbIntersect = utils.curvesIntersect(
      points.cbNeck,
      points.cbNeckCp2,
      points.waistCenter,
      points.waistCenter,
      points.cbFacing,
      points.cbFacingCp2,
      points.facingBottomMid,
      points.facingBottomMid
    )

    if (cbIntersect) {
      points.cbSplit = cbIntersect
    } else {
      points.cbSplit = utils.lineIntersectsCurve(
        points.waistCenter,
        points.bottomTarget,
        points.cbFacing,
        points.cbFacingCp2,
        points.facingBottomMid,
        points.facingBottomMid
      )
    }

    if (!options.centreBackFold) {
      paths.hemBase = paths.hemBase.split(points.cbSplit)[1].hide()
      paths.cb = paths.cb.split(points.cbSplit)[0].hide()
    } else {
      paths.cb = new Path().move(points.cbTop).line(points.cbFacing).hide()
    }

    const sideIntersect = utils.curvesIntersect(
      points.waistSide,
      points.waistSideCp2,
      points.armhole,
      points.armhole,
      points.facingBottomMid,
      points.facingBottomMidCp2,
      points.armholeFacing,
      points.armholeFacing
    )
    if (sideIntersect) {
      points.armholeSplit = sideIntersect
    } else {
      points.armholeSplit = utils.lineIntersectsCurve(
        points.facingBottomMidCp2,
        points.armholeFacingTarget,
        points.waistSide,
        points.waistSideCp2,
        points.armhole,
        points.armhole
      )
    }

    //paths
    paths.hemBase = paths.hemBase.split(points.armholeSplit)[0].hide()

    paths.saBase = new Path()
      .move(points.waistSide)
      .curve_(points.waistSideCp2, points.armhole)
      .split(points.armholeSplit)[1]
      .split(points.armholeDrop)[0]
      ._curve(points.dartRightSplitCp1, points.dartRightSplit)
      ._curve(points.cbTopCp1, points.cbTop)
      .hide()

    paths.seam = paths.hemBase.join(paths.saBase).join(paths.cb).close()

    //stores
    store.set('bodiceFacingWidth', bodiceFacingWidth)

    if (complete) {
      //grainline
      let cbSa
      if (options.centreBackFold && options.closurePosition != 'back') {
        cbSa = 0
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbFacing
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        cbSa = sa
        points.grainlineFrom = points.dartRightSplit
        points.grainlineTo = points.facingBottomMid

        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //title
      points.title = points.facingBottomMidCp2.shiftFractionTowards(points.dartRightSplitCp1, 0.5)
      macro('title', {
        nr: 6,
        title: 'Back Facing',
        at: points.title,
        scale: 1 / 3,
      })

      if (sa) {
        paths.sa = paths.hemBase
          .offset(sa * options.bodiceFacingHemWidth * 100)
          .join(paths.saBase.offset(sa))
          .join(paths.cb.offset(cbSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
