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
      .curve(points.waistFrontFacingCp1, points.waistFrontFacingCp2, points.waistFrontFacingMid)
      .curve(points.waistFrontFacingCp3, points.waistFrontFacingCp4, points.sideWaistFrontFacing)
      .hide()

    if (points.sideFrontExtension) {
      paths.sideSeam = new Path()
        .move(points.frontHemExtension)
        .line(points.sideFrontExtension)
        .curve_(points.sideSeamFrontCp, points.sideWaistFront)
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
      .curve(points.waistFrontCp1, points.waistFrontCp2, points.waistFrontMid)
      .curve(points.waistFrontCp3, points.waistFrontCp4, points.cfWaist)
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
      let cfSa
      if (
        options.waistbandClosurePosition == 'front' &&
        !options.waistbandElastic &&
        (options.useBackMeasures ||
          options.independentSkirtFullness ||
          options.independentSkirtGathering)
      ) {
        cfSa = sa
        points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfWaistFacing, 0.075)
        points.grainlineTo = points.cfWaistFacing.shiftFractionTowards(points.cfWaist, 0.075)
        macro('grainline', {
          from: points.cfWaist.rotate(-90, points.grainlineFrom),
          to: points.cfWaistFacing.rotate(90, points.grainlineTo),
        })
      } else {
        cfSa = 0
        points.cutOnFoldFrom = points.cfWaist.shiftFractionTowards(points.cfWaistFacing, 0.075)
        points.cutOnFoldTo = points.cfWaistFacing.shiftFractionTowards(points.cfWaist, 0.075)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //title
      let titleBack
      let titleBackNum
      if (
        !options.useBackMeasures &&
        !options.independentSkirtFullness &&
        !options.independentSkirtGathering
      ) {
        titleBack = ' & Back'
        titleBackNum = ' & 4b'
      } else {
        titleBack = ''
        titleBackNum = ''
      }
      points.title = points.cfWaist
        .shiftFractionTowards(points.waistFrontCp4, 0.6)
        .shift(-90, points.cfWaist.dist(points.cfWaistFacing) / 2)

      macro('title', {
        at: points.title,
        nr: '4a' + titleBackNum,
        title: 'Skirt Waist Facing (Front' + titleBack + ')',
        scale: 0.25,
      })
      //add seam allowance
      if (
        !options.useBackMeasures &&
        !options.independentSkirtFullness &&
        !options.independentSkirtGathering &&
        !options.waistbandElastic &&
        (options.waistbandClosurePosition == 'front' || options.waistbandClosurePosition == 'back')
      ) {
        let addSa
        if (options.waistbandClosurePosition == 'front') {
          addSa = 'FRONT'
        } else {
          addSa = 'BACK'
        }
        paths.cf
          .attr('class', 'fabric hidden')
          .attr('data-text', 'ADD SEAM ALLOWANCE FOR ' + addSa)
          .attr('data-text-class', 'center')
          .unhide()
      }
      if (sa) {
        paths.sa = paths.cfWaistFacing
          .line(paths.sideSeam.start())
          .offset(sa)
          .join(paths.sideSeam.offset(sa))
          .join(paths.waist.offset(sa))
          .join(paths.cf.offset(cfSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
