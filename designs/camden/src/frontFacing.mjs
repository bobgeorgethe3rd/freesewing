import { sharedFront } from './sharedFront.mjs'

export const frontFacing = {
  name: 'camden.frontFacing',
  from: sharedFront,
  options: {
    //Construction
    bodiceFacingWidth: { pct: 100, min: 50, max: 100, menu: 'construction' },
    bodiceFacingHemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
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
    //set render
    if (!options.bodiceFacings) {
      part.hide()
      return part
    }
    //remove paths
    for (let i in paths) delete paths[i]
    //measures
    const bodiceFacingWidth = store.get('bodiceFacingWidth') * options.bodiceFacingWidth
    //let's begin
    points.cfFacing = points.cfTop.shiftTowards(points.cfHem, bodiceFacingWidth)
    points.sideFacing = points.armholeDrop.shiftTowards(points.bustDartTop, bodiceFacingWidth)
    points.cfFacingCp2 = new Point(points.strapLeft.x, points.cfFacing.y)
    points.sideFacingCp1 = new Point(points.strapRight.x, points.sideFacing.y)

    //paths
    paths.hemBase = new Path()
      .move(points.cfFacing)
      .curve(points.cfFacingCp2, points.sideFacingCp1, points.sideFacing)
      .hide()

    paths.sideSeam = new Path().move(points.sideFacing).line(points.armholeDrop).hide()

    paths.necklineRight = new Path()
      .move(points.armholeDrop)
      .curve(points.armholeDropCp2, points.strapRightCp1, points.strapRight)
      .hide()

    paths.strap = new Path().move(points.strapRight).line(points.strapLeft).hide()

    paths.necklineLeft = new Path()
      .move(points.strapLeft)
      ._curve(points.cfTopCp1, points.cfTop)
      .hide()

    paths.cf = new Path().move(points.cfTop).line(points.cfFacing).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.necklineRight)
      .join(paths.strap)
      .join(paths.necklineLeft)
      .join(paths.cf)
      .close()

    if (complete) {
      //grainline
      if (options.cfSaWidth > 0) {
        points.grainlineFrom = new Point(points.cfNeckCp1.x / 3, points.cfTop.y)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfFacing.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      } else {
        points.cutOnFoldFrom = points.cfTop
        points.cutOnFoldTo = points.cfFacing
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
        points.cfTop.shiftFractionTowards(points.cfFacing, 0.25).y
      )
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Front Facing',
        scale: 2 / 3,
      })
      if (sa) {
        const cfSa = sa * options.cfSaWidth * 100
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
          .shiftTowards(points.cfTopCp1, sa)
          .rotate(-90, points.strapLeft)

        if (
          points.cfTop.y == points.strapLeft.y ||
          points.necklineRightStart.y < points.saPoint3Anchor.y
        ) {
          points.saPoint3 = points.saPoint3Anchor
        } else {
          points.saPoint3 = utils.beamsIntersect(
            points.saPoint2,
            points.saPoint3Anchor,
            points.necklineRightStart,
            points.cfTopCp1.shiftTowards(points.strapLeft, sa).rotate(90, points.cfTopCp1)
          )
        }

        points.saPoint4 = points.cfTop.shift(180, cfSa)
        points.saPoint5 = points.cfFacing.translate(-cfSa, bodiceFacingHemSa)

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
