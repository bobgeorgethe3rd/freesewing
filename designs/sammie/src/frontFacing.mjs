import { backFacing } from './backFacing.mjs'
import { frontBase } from './frontBase.mjs'

export const frontFacing = {
  name: 'sammie.frontFacing',
  from: frontBase,
  after: backFacing,
  hide: {
    from: true,
    inherited: true,
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
    //measurements
    const bodiceFacingWidth = store.get('bodiceFacingWidth')
    const rotAngle =
      points.bust.angle(points.frontTopRight) - points.bust.angle(points.sideFrontTopLeft)
    //let's begin
    points.cfFacing = points.cfTop.shiftTowards(points.cfWaist, bodiceFacingWidth)
    points.sideFacing = points.armholeDrop.shiftTowards(points.sideWaist, bodiceFacingWidth)

    const rot = [
      'sideFacing',
      'armholeDrop',
      'armholeDropCp2',
      'sideFrontTopLeftCp1',
      'sideFrontTopLeft',
    ]
    for (const p of rot) points[p] = points[p].rotate(rotAngle, points.bust)
    const shiftAngle = points.frontTopRight.angle(points.bust)
    points.facingBottomMid = points.frontTopRight.shiftTowards(points.bust, bodiceFacingWidth)
    points.facingBottomMidCp1 = points.frontTopRightCp2.shift(shiftAngle, bodiceFacingWidth)
    points.facingBottomMidCp2 = points.sideFrontTopLeftCp1.shift(shiftAngle, bodiceFacingWidth)
    points.sideFacingCp1 = points.armholeDropCp2
      .shiftTowards(points.armholeDrop, bodiceFacingWidth)
      .rotate(-90, points.armholeDropCp2)

    //paths
    paths.hemBase = new Path()
      .move(points.cfFacing)
      ._curve(points.facingBottomMidCp1, points.facingBottomMid)
      .curve(points.facingBottomMidCp2, points.sideFacingCp1, points.sideFacing)
      .hide()

    paths.saBase = new Path()
      .move(points.sideFacing)
      .line(points.armholeDrop)
      .curve(points.armholeDropCp2, points.sideFrontTopLeftCp1, points.frontTopRight)
      .curve_(points.frontTopRightCp2, points.cfTop)
      .hide()

    paths.cf = new Path().move(points.cfTop).line(points.cfFacing).hide()

    paths.seam = paths.hemBase.join(paths.saBase).join(paths.cf).close()

    if (complete) {
      //grainline
      let cfSa
      if (options.closurePosition != 'front' && !options.centreFrontSeam) {
        cfSa = 0
        points.cutOnFoldFrom = points.cfTop
        points.cutOnFoldTo = points.cfFacing.shiftFractionTowards(points.cfTop, 0.25)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        cfSa = sa

        points.grainlineFrom = points.frontTopRight
        points.grainlineTo = new Point(points.grainlineFrom.x, points.facingBottomMid.y)

        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //title
      points.title = points.sideFrontTopLeft
        .shiftFractionTowards(points.sideFrontTopLeftCp1, 0.25)
        .shift(-90, bodiceFacingWidth / 2)
      macro('title', {
        nr: 5,
        title: 'Front Facing',
        at: points.title,
        scale: 0.4,
      })
      if (sa) {
        paths.sa = paths.hemBase
          .offset(sa * options.bodiceFacingHemWidth * 100)
          .join(paths.saBase.offset(sa))
          .join(paths.cf.offset(cfSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
