import { skirtBase } from './skirtBase.mjs'
import { pocket } from './skirtBase.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'

export const skirtFront = {
  name: 'claude.skirtFront',
  from: skirtBase,
  after: pocket,
  waistbandStraight,
  hide: {
    from: true,
  },
  options: {
    //Construction
    skirtHemWidth: { pct: 2, min: 0, max: 5, menu: 'construction' },
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
    //removing paths from base
    for (let i in paths) delete paths[i]

    //let's begin
    if (points.sideFrontExtension) {
      paths.sideSeam = new Path()
        .move(points.frontHemExtension)
        .line(points.sideFrontExtension)
        .curve_(points.sideSeamFrontCp, points.sideWaistFront)
        .hide()

      if (points.frontHemExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.frontHemExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideFrontHem).line(points.sideWaistFront).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistFront)
      .curve(points.waistFrontCp1, points.waistFrontCp2, points.waistFrontMid)
      .curve(points.waistFrontCp3, points.waistFrontCp4, points.cfWaist)
      .hide()

    paths.cf = new Path().move(points.cfWaist).line(points.cfHem).hide()

    paths.hemBase = new Path()
      .move(points.cfHem)
      .curve(points.frontHemCp1, points.frontHemCp2, points.frontHemMid)
      .curve(points.frontHemCp3, points.frontHemCp4, points.sideFrontHem)
      .line(paths.sideSeam.start())
      .hide()

    //paths
    paths.seam = paths.hemBase.join(paths.sideSeam).join(paths.waist).join(paths.cf).close()

    if (complete) {
      if (sa) {
        let cfSa
        if (options.waistbandClosurePosition == 'front' && !options.waistbandElastic) {
          cfSa = sa
        } else {
          cfSa = 0
        }

        paths.sa = paths.hemBase
          .offset(sa * options.skirtHemWidth * 100)
          .join(paths.sideSeam.join(paths.waist).offset(sa))
          .join(paths.cf.offset(cfSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
