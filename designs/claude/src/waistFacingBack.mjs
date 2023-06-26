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
      (!options.useBackMeasures &&
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
      .curve(points.waistBackFacingCp1, points.waistBackFacingCp2, points.waistBackFacingMid)
      .curve(points.waistBackFacingCp3, points.waistBackFacingCp4, points.sideWaistBackFacing)
      .hide()

    if (points.sideBackExtension) {
      paths.sideSeam = new Path()
        .move(points.backHemExtension)
        .line(points.sideBackExtension)
        .curve_(points.sideSeamBackCp, points.sideWaistBack)
        .hide()

      if (points.backFacingExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.backFacingExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideWaistBackFacing).line(points.sideWaistBack).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistBack)
      .curve(points.waistBackCp1, points.waistBackCp2, points.waistBackMid)
      .curve(points.waistBackCp3, points.waistBackCp4, points.cbWaist)
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
      let cbSa
      if (
        options.closurePosition == 'back' &&
        !options.waistbandElastic &&
        (options.useBackMeasures ||
          options.independentSkirtFullness ||
          options.independentSkirtGathering)
      ) {
        cbSa = sa
        points.grainlineFrom = points.cbWaist.shiftFractionTowards(points.cbWaistFacing, 0.075)
        points.grainlineTo = points.cbWaistFacing.shiftFractionTowards(points.cbWaist, 0.075)
        macro('grainline', {
          from: points.cbWaist.rotate(-90, points.grainlineFrom),
          to: points.cbWaistFacing.rotate(90, points.grainlineTo),
        })
      } else {
        cbSa = 0
        points.cutOnFoldFrom = points.cbWaist.shiftFractionTowards(points.cbWaistFacing, 0.075)
        points.cutOnFoldTo = points.cbWaistFacing.shiftFractionTowards(points.cbWaist, 0.075)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //title
      points.title = points.cbWaist
        .shiftFractionTowards(points.waistBackCp4, 0.6)
        .shift(-90, points.cbWaist.dist(points.cbWaistFacing) / 2)
      macro('title', {
        at: points.title,
        nr: '4b',
        title: 'Skirt Waist Facing (Back)',
        scale: 0.25,
      })
      if (sa) {
        paths.sa = paths.cbWaistFacing
          .line(paths.sideSeam.start())
          .offset(sa)
          .join(paths.sideSeam.offset(sa))
          .join(paths.waist.offset(sa))
          .join(paths.cb.offset(cbSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
