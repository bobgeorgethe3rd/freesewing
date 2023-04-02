import { pluginBundle } from '@freesewing/plugin-bundle'

export const base = {
  name: 'calanthe.base',
  options: {
    //Constants
    cfPanel: 0.161,
    f1Panel: 0.134,
    f2Panel: 0.173,
    b2Panel: 0.169,
    b1Panel: 0.173,
    cbPanel: 0.182,
    // sideGap: 0.046,//0.061,
    //Fit
    chestEase: { pct: 2.3, min: 0, max: 10, menu: 'fit' },
    bustSpanEase: { pct: 4.4, min: 0, max: 10, menu: 'fit' },
    waistEase: { pct: -7.5, min: -20, max: 0, menu: 'fit' },
    hipsEase: { pct: 2.1, min: 0, max: 10, menu: 'fit' },

    //Style
    frontTopDepth: { pct: 8.2, min: 7.5, max: 16.4, menu: 'style' },
    cfTopCurve: { pct: 0, min: 0, max: 200, menu: 'style' },
    backTopDepth: { pct: 8.5, min: 0, max: 11.3, menu: 'style' },

    //Advanced
    sideGap: { pct: 4.6, min: 3.4, max: 6.1, menu: 'advanced.fit' },
    sideGapBalance: { pct: 100, min: 0, max: 100, menu: 'advanced.fit' },
    chestFrontBalance: { pct: 50, min: 40, max: 60, menu: 'advanced.fit' },
    waistF1Balance: { pct: 50, min: 40, max: 60, menu: 'advanced.fit' },
    waistB1Balance: { pct: 50, min: 40, max: 60, menu: 'advanced.fit' },
    cfHipsBonus: { pct: 0, min: -20, max: 20, menu: 'advanced.fit' },
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
    let bustSpan = measurements.bustSpan * (1 + options.bustSpanEase)
    let waist = measurements.waist * (1 + options.waistEase)
    let hips = measurements.hips * (1 + options.hipsEase)

    let waistCF = waist * options.cfPanel
    let waistF1 = waist * options.f1Panel
    let waistF2 = waist * options.f2Panel
    let waistB2 = waist * options.b2Panel
    let waistB1 = waist * options.b1Panel
    let waistCB = waist * options.cbPanel

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

    //the bust
    points.apex = points.cfChest.shift(0, bustSpan / 2)

    //front panels
    points.chest2 = points.apex.shiftFractionTowards(points.sideChest, options.chestFrontBalance)

    let j
    for (let i = 0; i < 2; i++) {
      j = i + 4
      points['chest' + j] = points.sideChest.shiftFractionTowards(points.cbChest, (i + 1) / 3)
    }

    //the waist
    points.waist01 = points.cfWaist.shift(0, waistCF / 2)
    points.waist50 = points.cbWaist.shift(180, waistCB / 2)

    points.waist21 = points.sideWaist.shift(180, waist * options.sideGap * options.sideGapBalance)
    points.waist30 = points.sideWaist.shift(
      0,
      waist * options.sideGap * (1 - options.sideGapBalance)
    )

    points.waist20 = points.waist21.shift(180, waistF2 / 2)
    points.waist31 = points.waist30.shift(0, waistB2 / 2)

    points.waist1 = points.waist01.shiftFractionTowards(points.waist20, options.waistF1Balance)
    points.waist4 = points.waist31.shiftFractionTowards(points.waist50, options.waistB1Balance)

    points.waist10 = points.waist1.shift(180, waistF1 / 4)
    points.waist11 = points.waist1.shift(0, waistF1 / 4)

    points.waist40 = points.waist4.shift(180, waistB1 / 4)
    points.waist41 = points.waist4.shift(0, waistB1 / 4)

    //the hips
    points.hips01 = new Point(points.waist01.x * (1 + options.cfHipsBonus), points.cfHips.y)

    let hipsDiff = hips - points.cfHips.dist(points.hips01) * 2

    let hipsF1 = hipsDiff * options.f1Panel
    let hipsF2 = hipsDiff * options.f2Panel
    let hipsB2 = hipsDiff * options.b2Panel
    let hipsB1 = hipsDiff * options.b1Panel
    let hipsCB = hipsDiff * options.cbPanel

    points.hips1 = new Point(points.waist1.x, points.cfHips.y)
    points.hips10 = points.hips1.shift(180, hipsF1 / 4)
    points.hips11 = points.hips1.shift(0, hipsF1 / 4)

    points.hips2 = new Point((points.waist20.x + points.waist21.x) / 2, points.cfHips.y)
    points.hips20 = points.hips2.shift(180, hipsF2 / 4)
    points.hips21 = points.hips2.shift(0, hipsF2 / 4)

    points.hips3 = new Point((points.waist30.x + points.waist31.x) / 2, points.cfHips.y)
    points.hips30 = points.hips3.shift(180, hipsB2 / 4)
    points.hips31 = points.hips3.shift(0, hipsB2 / 4)

    points.hips4 = new Point(points.waist4.x, points.cfHips.y)
    points.hips40 = points.hips4.shift(180, hipsB1 / 4)
    points.hips41 = points.hips4.shift(0, hipsB1 / 4)

    points.hips50 = points.cbHips.shift(180, hipsCB / 2)

    //style time
    //front top
    let frontTopDepth = measurements.hpsToBust * options.frontTopDepth
    points.f1Top = points.apex.shift(90, frontTopDepth)
    points.cfTop = new Point(points.cfHips.x, points.f1Top.y).shiftFractionTowards(
      points.cfChest,
      options.cfTopCurve
    )
    points.cfTopCp2 = new Point(points.f1Top.x * 0.2, points.f1Top.y)

    points.f1TopCp1 = new Point(points.chest2.x, points.f1Top.y)
    points.f2TopCp2 = points.chest2

    paths.frontCurve = new Path()
      .move(points.cfTop)
      ._curve(points.cfTopCp2, points.f1Top)
      .curve(points.f1TopCp1, points.f2TopCp2, points.sideChest)

    //back top
    let backTopDepth = measurements.hpsToWaistBack * options.backTopDepth

    points.cbTop = points.cbChest.shift(90, backTopDepth)
    points.b2Cp2 = points.chest4
    points.cbCp2 = new Point(points.chest5.x, points.cbTop.y)

    paths.backCurve = new Path()
      .move(points.sideChest)
      .curve(points.b2Cp2, points.cbCp2, points.cbTop)

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

    paths.f01 = new Path().move(points.hips01).line(points.waist01).line(points.apex)

    paths.f10 = new Path().move(points.apex).line(points.waist10).line(points.hips10)

    paths.f11 = new Path().move(points.hips11).line(points.waist11).line(points.chest2)

    paths.f20 = new Path().move(points.chest2).line(points.waist20).line(points.hips20)

    paths.f21 = new Path().move(points.hips21).line(points.waist21).line(points.sideChest)

    paths.b30 = new Path().move(points.sideChest).line(points.waist30).line(points.hips30)

    paths.b31 = new Path().move(points.hips31).line(points.waist31).line(points.chest4)

    paths.b40 = new Path().move(points.chest4).line(points.waist40).line(points.hips40)

    paths.b41 = new Path().move(points.hips41).line(points.waist41).line(points.chest5)

    paths.b50 = new Path().move(points.chest5).line(points.waist50).line(points.hips50)

    return part
  },
}
