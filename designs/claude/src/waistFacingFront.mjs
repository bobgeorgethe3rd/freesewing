import { waistFacingBase } from './waistFacingBase.mjs'

export const waistFacingFront = {
  name: 'claude.waistFacingFront',
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
    if (options.waistbandStyle != 'none') {
      part.hide()
      return part
    }
    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    //paths
    paths.cfWaistFacing = new Path()
      .move(points.cfWaistFacing)
      .curve(points.cfWaistFacingCp2, points.waistFrontFacingMidCp1, points.waistFrontFacingMid)
      .curve(
        points.waistFrontFacingMidCp2,
        points.sideWaistFrontFacingCp1,
        points.sideWaistFrontFacing
      )
      .hide()

    if (points.sideFrontExtension) {
      paths.sideSeam = new Path()
        .move(points.frontHemExtension)
        .line(points.sideFrontExtension)
        .curve_(points.sideFrontExtensionCp2, points.sideWaistFront)
        .hide()

      if (points.frontFacingExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.frontFacingExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path()
        .move(points.sideWaistFrontFacing)
        .line(points.sideWaistFront)
        .hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistFront)
      .curve(points.sideWaistFrontCp2, points.waistFrontMidCp1, points.waistFrontMid)
      .curve(points.waistFrontMidCp2, points.cfWaistCp1, points.cfWaist)
      .hide()

    paths.cf = new Path().move(points.cfWaist).line(points.cfWaistFacing).hide()

    paths.seam = paths.cfWaistFacing
      .line(paths.sideSeam.start())
      .join(paths.sideSeam)
      .join(paths.waist)
      .join(paths.cf)
      .close()

    if (complete) {
      //grainline
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfWaist.shiftFractionTowards(points.cfWaistFacing, 0.1)
        points.cutOnFoldTo = points.cfWaistFacing.shiftFractionTowards(points.cfWaist, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfWaistCp1, 1 / 3)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfWaistFacing.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //title
      points.title = points.cfWaist
        .shiftFractionTowards(points.cfWaistCp1, 0.6)
        .shift(-90, points.cfWaist.dist(points.cfWaistFacing) / 2)

      macro('title', {
        at: points.title,
        nr: '9',
        title: 'Skirt Waist Facing',
        scale: 0.25,
      })
      if (
        !options.separateBack &&
        !options.useBackMeasures &&
        !options.independentSkirtFullness &&
        !options.independentSkirtGathering &&
        (options.closurePosition == 'front' ||
          options.closurePosition == 'back' ||
          options.cbSaWidth > 0)
      ) {
        paths.cf
          .attr('class', 'fabric hidden')
          .attr('data-text', 'Need to Back Seam Allowance')
          .attr('data-text-class', 'center')
          .unhide()
      }
      if (sa) {
        const waistSa = store.get('waistSa')
        const closureSa = sa * options.sideSeamSaWidth * 100

        let cfSa
        if (options.closurePosition == 'front' && !options.waistbandElastic) {
          cfSa = closureSa
        } else {
          cfSa = sa * options.cfSaWidth * 100
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

        points.saSideWaistFrontFacing = utils.beamsIntersect(
          points.sideWaistFrontFacingCp1
            .shiftTowards(points.sideWaistFrontFacing, sa)
            .rotate(-90, points.sideWaistFrontFacingCp1),
          points.sideWaistFrontFacing
            .shiftTowards(points.sideWaistFrontFacingCp1, sa)
            .rotate(90, points.sideWaistFrontFacing),
          paths.sideSeam.offset(sideSeamSa).start(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.001)
        )
        points.saSideWaistFront = utils.beamsIntersect(
          paths.sideSeam.offset(sideSeamSa).end(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.998),
          points.sideWaistFront
            .shiftTowards(points.sideWaistFrontCp2, waistSa)
            .rotate(-90, points.sideWaistFront),
          points.sideWaistFrontCp2
            .shiftTowards(points.sideWaistFront, waistSa)
            .rotate(90, points.sideWaistFrontCp2)
        )

        points.saCfWaist = points.cfWaist.translate(-cfSa, -waistSa)
        points.saCfWaistFacing = points.cfWaistFacing.translate(-cfSa, sa)

        paths.sa = paths.cfWaistFacing
          .line(paths.sideSeam.start())
          .offset(sa)
          .line(points.saSideWaistFrontFacing)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistFront)
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
