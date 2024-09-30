import { skirtBase } from './skirtBase.mjs'
import { waistFacing } from './waistFacing.mjs'

export const sideWaistFacing = {
  name: 'wanda.sideWaistFacing',
  from: skirtBase,
  after: waistFacing,
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
    absoluteOptions,
    log,
  }) => {
    //set render
    if (options.waistbandStyle != 'none') {
      part.hide()
      return part
    }
    //removing paths
    if (options.wandaGuides) {
      const keepThese = ['wandaGuide']
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //measurements
    const cpDistance =
      (4 / 3) *
      points.origin.dist(points.dartTipE) *
      Math.tan(
        utils.deg2rad(
          (points.origin.angle(points.dartTipD) - points.origin.angle(points.dartTipE)) / 4
        )
      )
    //let's begin
    points.dartTipECp2 = points.dartTipE
      .shiftTowards(points.origin, cpDistance)
      .rotate(-90, points.dartTipE)
    points.dartTipDCp1 = points.dartTipD
      .shiftTowards(points.origin, cpDistance)
      .rotate(90, points.dartTipD)
    //paths
    paths.hemBase = new Path()
      .move(points.dartTipE)
      .curve(points.dartTipECp2, points.dartTipDCp1, points.dartTipD)
      .hide()

    paths.saRight = new Path()
      .move(points.dartTipD)
      .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)
      .hide()

    paths.saWaist = new Path()
      .move(points.waist1Right)
      .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
      .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
      .hide()

    paths.saLeft = new Path()
      .move(points.waist1Left)
      .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.saRight)
      .join(paths.saWaist)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waist1RightCp2
      points.grainlineTo = points.waist1RightCp2.shift(
        points.waistD.angle(points.dartTipD),
        points.waist1Right.dist(points.dartTipD) * 0.95
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.origin.shiftOutwards(
        points.waistPanel1,
        points.waist1Right.dist(points.dartTipD) * 0.45
      )
      macro('title', {
        nr: 8,
        title: 'Side Waist Facing',
        at: points.title,
        cutNr: 4,
        scale: 0.25,
        rotation: 90 - points.dartTipD.angle(points.waistD),
      })
      if (sa) {
        const waistFacingHem = sa * options.waistFacingHemWidth * 100

        points.saDartTipD = points.dartTipD
          .shift(points.dartTipDCp1.angle(points.dartTipD), sa)
          .shift(points.dartTipDCp.angle(points.dartTipD), waistFacingHem)
        points.saWaist1Right = points.waist1Right
          .shift(points.waist1RightCp1.angle(points.waist1Right), sa)
          .shift(points.waist1RightCp2.angle(points.waist1Right), sa)
        points.saWaist1Left = points.waist1Left
          .shift(points.waist1LeftCp1.angle(points.waist1Left), sa)
          .shift(points.waist1LeftCp2.angle(points.waist1Left), sa)
        points.saDartTipE = points.dartTipE
          .shift(points.dartTipECp2.angle(points.dartTipE), sa)
          .shift(points.dartTipECp.angle(points.dartTipE), waistFacingHem)

        paths.sa = paths.hemBase
          .clone()
          .offset(waistFacingHem)
          .line(points.saDartTipD)
          .join(paths.saRight.offset(sa))
          .line(points.saWaist1Right)
          .join(paths.saWaist.offset(sa))
          .line(points.saWaist1Left)
          .join(paths.saLeft.offset(sa))
          .line(points.saDartTipE)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
