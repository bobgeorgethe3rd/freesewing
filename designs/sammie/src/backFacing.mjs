import { backBase } from './backBase.mjs'
import { frontFacing } from './frontFacing.mjs'

export const backFacing = {
  name: 'sammie.backFacing',
  from: backBase,
  after: frontFacing,
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
  }) => {
    //set render
    if (!options.bodiceFacings) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    //measurements
    const bodiceFacingWidth = store.get('bodiceFacingWidth')
    const shiftDist = points.dartTopLeft.dist(points.dartTopRight)
    const backDartAngle =
      points.dartTip.angle(points.dartBottomRight) - points.dartTip.angle(points.dartBottomLeft)
    //let's begin

    points.cbFacing = points.cbTop.shift(-90, bodiceFacingWidth)
    points.sideFacing = points.armholeDrop.shift(
      points.armhole.angle(points.sideWaist),
      bodiceFacingWidth
    )

    const rot = ['armholeDrop', 'dartTopRightCp', 'sideFacing']
    for (const p of rot) points[p] = points[p].rotate(-backDartAngle, points.dartTip)

    points.cbFacingCp2 = points.cbFacing.shiftFractionTowards(
      utils.beamIntersectsX(points.cbFacing, points.cbFacing.shift(0, 1), points.dartTopLeftCp.x),
      1.125
    )

    points.sideFacingCp1 = points.sideFacing.shiftFractionTowards(
      utils.beamsIntersect(
        points.dartTopRightCp,
        points.dartTopRightCp.shift(points.armholeDrop.angle(points.sideFacing), 1),
        points.sideFacing,
        points.sideFacing.shift(points.armholeDrop.angle(points.dartTopRightCp), 1)
      ),
      0.375
    )

    //paths
    paths.waist = new Path()
      .move(points.cbFacing)
      .curve(points.cbFacingCp2, points.sideFacingCp1, points.sideFacing)
      .hide()

    paths.sideSeam = new Path().move(points.sideFacing).line(points.armholeDrop).hide()

    paths.topCurve = new Path()
      .move(points.armholeDrop)
      .curve(points.dartTopRightCp, points.dartTopLeftCp, points.cbTop)
      .hide()

    paths.cb = new Path().move(points.cbTop).line(points.cbFacing).hide()

    paths.seam = paths.waist.clone().join(paths.sideSeam).join(paths.topCurve).join(paths.cb)

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition == 'back' || options.cbSaWidth > 0) {
        points.grainlineFrom = points.cbTop.shiftFractionTowards(points.dartTopLeftCp, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbFacing.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      } else {
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbFacing
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      }
      //title
      points.title = points.dartTopLeft.shift(
        points.dartTopLeft.angle(points.dartBottomLeft),
        bodiceFacingWidth * 0.55
      )
      macro('title', {
        at: points.title,
        nr: '6',
        title: 'Back Facing',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      if (sa) {
        const bodiceFacingHem = sa * options.bodiceFacingHemWidth * 100
        const closureSa = sa * options.closureSaWidth * 100
        let cbSa
        if (options.closurePosition == 'back') {
          cbSa = closureSa
        } else {
          cbSa = sa * options.cbSaWidth * 100
        }

        let sideSeamSa
        if (
          options.closurePosition == 'side' ||
          options.closurePosition == 'sideLeft' ||
          options.closurePosition == 'sideRight'
        ) {
          sideSeamSa = closureSa
        } else {
          sideSeamSa = sa * options.sideSeamSaWidth * 100
        }

        points.saSideFacing = utils.beamsIntersect(
          points.sideFacingCp1
            .shiftTowards(points.sideFacing, bodiceFacingHem)
            .rotate(-90, points.sideFacingCp1),
          points.sideFacing
            .shiftTowards(points.sideFacingCp1, bodiceFacingHem)
            .rotate(90, points.sideFacing),
          points.sideFacing
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideFacing),
          points.armholeDrop
            .shiftTowards(points.sideFacing, sideSeamSa)
            .rotate(90, points.armholeDrop)
        )

        points.hemEnd = paths.waist.offset(bodiceFacingHem).end()

        if (points.saSideFacing.x < points.hemEnd.x) {
          points.saSideFacing = points.hemEnd
        }

        points.saArmholeDrop = utils.beamsIntersect(
          points.sideFacing
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideFacing),
          points.armholeDrop
            .shiftTowards(points.sideFacing, sideSeamSa)
            .rotate(90, points.armholeDrop),
          points.armholeDrop
            .shiftTowards(points.dartTopRightCp, sa)
            .rotate(-90, points.armholeDrop),
          points.dartTopRightCp
            .shiftTowards(points.armholeDrop, sa)
            .rotate(90, points.dartTopRightCp)
        )

        points.saCbTop = points.cbTop.translate(-cbSa, -sa)
        points.saCbFacing = points.cbFacing.translate(-cbSa, bodiceFacingHem)

        paths.sa = paths.waist
          .offset(bodiceFacingHem)
          .line(points.saSideFacing)
          .line(paths.sideSeam.offset(sideSeamSa).start())
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeDrop)
          .line(paths.topCurve.offset(sa).start())
          .join(paths.topCurve.offset(sa))
          .line(points.saCbTop)
          .line(points.saCbFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
