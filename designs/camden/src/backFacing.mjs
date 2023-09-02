import { back } from './back.mjs'
import { frontFacing } from './frontFacing.mjs'

export const backFacing = {
  name: 'camden.backFacing',
  after: frontFacing,
  from: back,
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
    //set render
    if (!options.bodiceFacings) {
      part.hide()
      return part
    }
    //remove paths
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //measures
    const bodiceFacingWidth = store.get('bodiceFacingWidth') * options.bodiceFacingWidth
    //let's begin
    points.cbFacing = points.cbTop.shiftTowards(points.cbHem, bodiceFacingWidth)
    points.sideFacing = points.armholeDrop.shiftTowards(points.sideWaist, bodiceFacingWidth)
    points.cbFacingCp2 = new Point(points.strapLeft.x, points.cbFacing.y)
    points.sideFacingCp1 = new Point(points.strapRight.x, points.sideFacing.y)

    //paths
    paths.hemBase = new Path()
      .move(points.cbFacing)
      .curve(points.cbFacingCp2, points.sideFacingCp1, points.sideFacing)
      .hide()

    paths.sideSeam = new Path().move(points.sideFacing).line(points.armholeDrop).hide()

    paths.necklineRight = new Path()
      .move(points.armholeDrop)
      .curve(points.armholeDropCp2, points.strapRightCp1, points.strapRight)
      .hide()

    paths.strap = new Path().move(points.strapRight).line(points.strapLeft).hide()

    paths.necklineLeft = new Path()
      .move(points.strapLeft)
      ._curve(points.cbTopCp1, points.cbTop)
      .hide()

    paths.cb = new Path().move(points.cbTop).line(points.cbFacing).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.necklineRight)
      .join(paths.strap)
      .join(paths.necklineLeft)
      .join(paths.cb)
      .close()

    if (complete) {
      //grainline
      if (options.cbSaWidth > 0) {
        points.grainlineFrom = new Point(points.cbNeckCp1.x / 3, points.cbTop.y)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbFacing.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      } else {
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbFacing
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //notches
      snippets.strapMid = new Snippet('notch', points.strapMid)
      //title
      points.title = new Point(
        points.strapLeft.x,
        points.cbTop.shiftFractionTowards(points.cbFacing, 0.25).y
      )
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'back Facing',
        scale: 2 / 3,
      })
      if (sa) {
        const cbSa = sa * options.cbSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const bodiceFacingHemSa = sa * options.bodiceFacingHemWidth * 100

        points.saPoint0 = utils.beamsIntersect(
          points.sideFacingCp1
            .shiftTowards(points.sideFacing, bodiceFacingHemSa)
            .rotate(-90, points.sideFacingCp1),
          points.sideFacing
            .shiftTowards(points.sideFacingCp1, bodiceFacingHemSa)
            .rotate(90, points.sideFacing),
          points.sideFacing
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideFacing),
          points.armholeDrop
            .shiftTowards(points.sideFacing, sideSeamSa)
            .rotate(90, points.armholeDrop)
        )

        points.saPoint1 = utils.beamsIntersect(
          points.sideFacing
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideFacing),
          points.armholeDrop
            .shiftTowards(points.sideFacing, sideSeamSa)
            .rotate(90, points.armholeDrop),
          points.armholeDrop
            .shiftTowards(points.armholeDropCp2, sa)
            .rotate(-90, points.armholeDrop),
          points.armholeDropCp2
            .shiftTowards(points.armholeDrop, sa)
            .rotate(90, points.armholeDropCp2)
        )

        points.saPoint2 = points.strapRight.translate(sa, -sa)
        points.saPoint3Anchor = points.strapLeft.shift(90, sa)

        points.necklineRightStart = points.strapLeft
          .shiftTowards(points.cbTopCp1, sa)
          .rotate(-90, points.strapLeft)

        if (
          points.cbTop.y == points.strapLeft.y ||
          points.necklineRightStart.y < points.saPoint3Anchor.y
        ) {
          points.saPoint3 = points.saPoint3Anchor
        } else {
          points.saPoint3 = utils.beamsIntersect(
            points.saPoint2,
            points.saPoint3Anchor,
            points.necklineRightStart,
            points.cbTopCp1.shiftTowards(points.strapLeft, sa).rotate(90, points.cbTopCp1)
          )
        }

        points.saPoint4 = points.cbTop.shift(180, cbSa)
        points.saPoint5 = points.cbFacing.translate(-cbSa, bodiceFacingHemSa)

        paths.sa = paths.hemBase
          .offset(bodiceFacingHemSa)
          .line(points.saPoint0)
          .line(paths.sideSeam.offset(sideSeamSa).start())
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saPoint1)
          .line(paths.necklineRight.offset(sa).start())
          .join(paths.necklineRight.offset(sa))
          .line(points.saPoint2)
          .line(paths.strap.offset(sa).start())
          .join(paths.strap.offset(sa))
          .line(points.saPoint3)
          .line(paths.necklineLeft.offset(sa).start())
          .join(paths.necklineLeft.offset(sa))
          .line(points.saPoint4)
          .line(points.saPoint5)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
