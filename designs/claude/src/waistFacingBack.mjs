import { waistFacingBase } from './waistFacingBase.mjs'

export const waistFacingBack = {
  name: 'claude.waistFacingBack',
  from: waistFacingBase,
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
    log,
    absoluteOptions,
  }) => {
    //set render
    if (
      options.waistbandStyle != 'none' ||
      (!options.separateBack &&
        !options.useBackMeasures &&
        !options.independentSkirtFullness &&
        !options.independentSkirtGathering)
    ) {
      part.hide()
      return part
    }
    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    //paths
    paths.cbWaistFacing = new Path()
      .move(points.cbWaistFacing)
      .curve(points.cbWaistFacingCp2, points.waistBackFacingMidCp1, points.waistBackFacingMid)
      .curve(
        points.waistBackFacingMidCp2,
        points.sideWaistBackFacingCp1,
        points.sideWaistBackFacing
      )
      .hide()

    if (points.sideBackExtension) {
      paths.sideSeam = new Path()
        .move(points.backHemExtension)
        .line(points.sideBackExtension)
        .curve_(points.sideBackExtensionCp2, points.sideWaistBack)
        .hide()

      if (points.backFacingExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.backFacingExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideWaistBackFacing).line(points.sideWaistBack).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistBack)
      .curve(points.sideWaistBackCp2, points.waistBackMidCp1, points.waistBackMid)
      .curve(points.waistBackMidCp2, points.cbWaistCp1, points.cbWaist)
      .hide()

    paths.cb = new Path().move(points.cbWaist).line(points.cbWaistFacing).hide()

    paths.seam = paths.cbWaistFacing
      .line(paths.sideSeam.start())
      .join(paths.sideSeam)
      .join(paths.waist)
      .join(paths.cb)
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbWaist.shiftFractionTowards(points.cbWaistFacing, 0.1)
        points.cutOnFoldTo = points.cbWaistFacing.shiftFractionTowards(points.cbWaist, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cbWaist.shiftFractionTowards(points.cbWaistCp1, 1 / 3)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbWaistFacing.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //title
      points.title = points.cbWaist
        .shiftFractionTowards(points.cbWaistCp1, 0.6)
        .shift(-90, points.cbWaist.dist(points.cbWaistFacing) / 2)

      macro('title', {
        at: points.title,
        nr: '10',
        title: 'Skirt Waist Facing Back',
        cutNr: titleCutNum,
        scale: 0.25,
      })
      if (sa) {
        const waistSa = store.get('waistSa')
        const closureSa = sa * options.sideSeamSaWidth * 100

        let cbSa
        if (options.closurePosition == 'back' && !options.waistbandElastic) {
          cbSa = closureSa
        } else {
          cbSa = sa * options.cbSaWidth * 100
        }

        let sideSeamSa
        if (
          (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') &&
          !options.waistbandElastic
        ) {
          sideSeamSa = closureSa
        } else {
          sideSeamSa = sa * options.sideSeamSaWidth * 100
        }

        points.saSideWaistBackFacing = utils.beamsIntersect(
          points.sideWaistBackFacingCp1
            .shiftTowards(points.sideWaistBackFacing, waistSa)
            .rotate(-90, points.sideWaistBackFacingCp1),
          points.sideWaistBackFacing
            .shiftTowards(points.sideWaistBackFacingCp1, waistSa)
            .rotate(90, points.sideWaistBackFacing),
          paths.sideSeam.offset(sideSeamSa).start(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.001)
        )
        points.saSideWaistBack = utils.beamsIntersect(
          paths.sideSeam.offset(sideSeamSa).end(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.995),
          points.sideWaistBack
            .shiftTowards(points.sideWaistBackCp2, waistSa)
            .rotate(-90, points.sideWaistBack),
          points.sideWaistBackCp2
            .shiftTowards(points.sideWaistBack, waistSa)
            .rotate(90, points.sideWaistBackCp2)
        )

        points.saCfWaist = points.cbWaist.translate(-cbSa, -waistSa)
        points.saCfWaistFacing = points.cbWaistFacing.translate(-cbSa, sa)

        paths.sa = paths.cbWaistFacing
          .line(paths.sideSeam.start())
          .offset(sa)
          .line(points.saSideWaistBackFacing)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistBack)
          .join(paths.waist.offset(waistSa))
          .line(points.saCfWaist)
          .line(points.saCfWaistFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
