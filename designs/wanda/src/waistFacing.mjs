import { skirtBase } from './skirtBase.mjs'

export const waistFacing = {
  name: 'wanda.waistFacing',
  from: skirtBase,
  hide: {
    from: true,
  },
  options: {
    //Construction
    waistFacingHemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
      points.origin.dist(points.dartTipD) *
      Math.tan(utils.deg2rad((270 - points.origin.angle(points.dartTipD)) / 4))
    //let's begin
    points.cfWaistFacing = points.origin.shift(-90, points.origin.dist(points.dartTipD))
    points.dartTipDCp2 = points.dartTipD
      .shiftTowards(points.origin, cpDistance)
      .rotate(-90, points.dartTipD)
    points.cfWaistFacingCp1 = points.cfWaistFacing
      .shiftTowards(points.origin, cpDistance)
      .rotate(90, points.cfWaistFacing)
    //paths
    paths.hemBase = new Path()
      .move(points.dartTipD)
      .curve(points.dartTipDCp2, points.cfWaistFacingCp1, points.cfWaistFacing)
      .hide()

    paths.saWaist = new Path()
      .move(points.cfWaist)
      .curve(points.cfWaistCp2, points.waistPanel0Cp1, points.waistPanel0)
      .curve(points.waistPanel0Cp2, points.waist0LeftCp1, points.waist0Left)
      .hide()

    paths.saLeft = new Path()
      .move(points.waist0Left)
      .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.cfWaist)
      .join(paths.saWaist)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfWaistCp2, 0.9)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfWaistFacing.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.waist0LeftCp1.x,
        points.cfWaist.y + points.cfWaist.dy(points.cfWaistFacing) * 0.5
      )
      macro('title', {
        nr: 7,
        title: 'Waist Facing',
        at: points.title,
        cutNr: 4,
        scale: 0.25,
      })
      if (sa) {
        const waistFacingHem = sa * options.waistFacingHemWidth * 100

        points.saCfWaistFacing = points.cfWaistFacing.translate(sa, waistFacingHem)
        points.saCfWaist = points.cfWaist.translate(sa, -sa)
        points.saWaist0Left = points.waist0Left
          .shift(points.waist0LeftCp1.angle(points.waist0Left), sa)
          .shift(points.waist0LeftCp2.angle(points.waist0Left), sa)
        points.saDartTipD = points.dartTipD
          .shift(points.dartTipDCp2.angle(points.dartTipD), sa)
          .shift(points.dartTipDCp.angle(points.dartTipD), waistFacingHem)

        paths.sa = paths.hemBase
          .clone()
          .offset(waistFacingHem)
          .line(points.saCfWaistFacing)
          .line(points.saCfWaist)
          .join(paths.saWaist.offset(sa))
          .line(points.saWaist0Left)
          .join(paths.saLeft.offset(sa))
          .line(points.saDartTipD)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
