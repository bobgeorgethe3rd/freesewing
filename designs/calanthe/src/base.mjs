import { pluginBundle } from '@freesewing/plugin-bundle'

export const base = {
  name: 'calanthe.base',
  options: {
    //Fit
    chestEase: { pct: 2.3, min: 0, max: 10, menu: 'fit' },
    bustSpanEase: { pct: 4.4, min: 0, max: 10, menu: 'fit' },
    waistEase: { pct: -7.5, min: -20, max: 0, menu: 'fit' },
  },
  measurements: [
    'chest',
    'underbust',
    'waist',
    'hips',
    'hpsToBust',
    'hpsToWaistBack',
    'hpsToWaistFront',
    'waistToUnderbust',
    'waistToHips',
    'bustSpan',
    'bustFront',
    'waistBack',
  ],
  plugins: [pluginBundle],
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
    //measures
    let chest = measurements.chest * (1 + options.chestEase)
    let bustFront = measurements.bustFront * (1 + options.chestEase)
    let chestBack = chest - bustFront
    let bustSpan = measurements.bustSpan * (1 + options.chestEase)
    let waist = measurements.waist * (1 + options.waistEase)
    let waistBack = measurements.waistBack * (1 + options.waistEase)
    let waistFront = waist - waistBack

    //Let's begin

    //scaffold
    points.cfHps = new Point(0, 0)
    points.cfChest = points.cfHps.shift(-90, measurements.hpsToBust)
    points.cfWaist = points.cfHps.shift(-90, measurements.hpsToWaistFront)
    points.cfUnderbust = points.cfWaist.shift(90, measurements.waistToUnderbust)
    points.cfHips = points.cfWaist.shift(-90, measurements.waistToHips)

    points.cbChest = points.cfChest.shift(0, chest / 2)
    points.cbUnderbust = points.cfUnderbust.shift(0, chest / 2)
    points.cbWaist = points.cfWaist.shift(0, chest / 2)
    points.cbHips = points.cfHips.shift(0, chest / 2)

    //sideSeam
    points.sideChest = points.cfChest.shift(0, bustFront / 2)
    points.sideUnderbust = new Point(points.sideChest.x, points.cfUnderbust.y)
    points.sideWaist = new Point(points.sideChest.x, points.cfWaist.y)
    points.sideHips = new Point(points.sideChest.x, points.cfHips.y)

    //the waist
    let waistFrontDiff = (bustFront - waistFront) / 5
    let waistFrontPanel = waistFront / 6

    let waistBackDiff = (chestBack - waistBack) / 5
    let waistBackPanel = waistBack / 6

    points.waist01 = points.cfWaist.shift(0, waistFrontPanel)

    points.waist21 = points.sideWaist.shift(180, (waistFrontDiff + waistBackDiff) / 4)
    points.waist30 = points.waist21.flipX(points.sideChest)
    points.waist20 = points.waist21.shift(180, waistFrontPanel)

    points.waist1 = points.waist01.shiftFractionTowards(points.waist20, 0.5)
    points.waist10 = points.waist1.shift(180, waistFrontPanel / 2)
    points.waist11 = points.waist10.flipX(points.waist1)

    points.waist31 = points.waist30.shift(0, waistBackPanel)
    points.waist50 = points.cbWaist.shift(180, waistBackPanel)
    points.waist4 = points.waist31.shiftFractionTowards(points.waist50, 0.5)

    points.waist40 = points.waist4.shift(180, waistBackPanel / 2)
    points.waist41 = points.waist40.flipX(points.waist4)

    //cf panel
    points.apex = points.cfChest.shift(0, bustSpan / 2)

    //front panels
    points.chest2 = points.apex.shiftFractionTowards(points.sideChest, 0.5)
    points.chest4 = new Point((points.waist31.x + points.waist40.x) / 2, points.cfChest.y)
    points.chest5 = new Point((points.waist41.x + points.waist50.x) / 2, points.cfChest.y)

    //cb panel

    //guides

    paths.scaffold = new Path()
      .move(points.cfHps)
      .line(points.cfHips)
      .move(points.cfChest)
      .line(points.cbChest)
      .move(points.cfUnderbust)
      .line(points.cbUnderbust)
      .move(points.cfWaist)
      .line(points.cbWaist)
      .move(points.cfHips)
      .line(points.cbHips)
      .attr('class', 'fabric help')

    paths.ft1 = new Path().move(points.waist01).line(points.apex).line(points.waist10)

    paths.ft2 = new Path().move(points.waist11).line(points.chest2).line(points.waist20)

    paths.sideTri = new Path().move(points.waist21).line(points.sideChest).line(points.waist30)

    paths.ft4 = new Path().move(points.waist31).line(points.chest4).line(points.waist40)

    paths.ft5 = new Path().move(points.waist41).line(points.chest5).line(points.waist50)

    return part
  },
}
