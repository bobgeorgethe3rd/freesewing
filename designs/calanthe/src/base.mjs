import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const base = {
  name: 'calanthe.base',
  options: {
    //Constants
    cfPanel: 0.161,
    f1Panel: 0.136, //0.134,
    f2Panel: 0.175, //0.173,
    b2Panel: 0.171, //0.169,
    b1Panel: 0.175, //0.173,
    cbPanel: 0.182,
    // sideGap: 0.046,//0.061,
    //Fit
    chestEase: { pct: 0, min: 0, max: 10, menu: 'fit' }, //2.3
    bustSpanEase: { pct: 4.4, min: 0, max: 10, menu: 'fit' },
    waistEase: { pct: -5.4, min: -20, max: 0, menu: 'fit' },
    hipsEase: { pct: 2.1, min: 0, max: 10, menu: 'fit' },
    laceGap: { pct: 5.4, min: 0, max: 10, snap: 5, ...pctBasedOn('waist'), menu: 'style' },
    //Style
    frontTopDepth: { pct: 8.2, min: 7.5, max: 16.4, menu: 'style' },
    cfTopCurve: { pct: 0, min: 0, max: 200, menu: 'style' },
    backTopDepth: { pct: 8.5, min: 0, max: 11.3, menu: 'style' },
    frontBottomDepth: { pct: 29.9, min: 7.4, max: 44.9, menu: 'style' },
    sideBottomReduction: { pct: 7.4, min: 0, max: 15, menu: 'style' },
    backBottomDepth: { pct: 7.4, min: 7.4, max: 29.9, menu: 'style' },
    waistHeightBonus: { pct: 5.2, min: 0, max: 10, menu: 'style' },
    //Advanced
    // sideGap: { pct: 4.6, min: 3.4, max: 6.1, menu: 'advanced.fit' },
    // sideGapBalance: { pct: 50, min: 0, max: 100, menu: 'advanced.fit' },
    chestFrontBalance: { pct: 50, min: 40, max: 60, menu: 'advanced.fit' },
    // waistF1Balance: { pct: 50, min: 40, max: 60, menu: 'advanced.fit' },
    // waistF1Balance: { pct: 100, min: 50, max: 150, menu: 'advanced.fit' },
    // waistB1Balance: { pct: 50, min: 40, max: 60, menu: 'advanced.fit' },
    // waistB1Balance: { pct: 100, min: 50, max: 150, menu: 'advanced.fit' },
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
    absoluteOptions,
  }) => {
    //measures
    const laceGap = absoluteOptions.laceGap
    const chest = measurements.chest * (1 + options.chestEase) - laceGap / 2
    const bustFront = measurements.bustFront * (1 + options.chestEase)
    const chestBack = chest - bustFront
    const bustSpan = measurements.bustSpan * (1 + options.bustSpanEase)
    const waist = measurements.waist * (1 + options.waistEase) - laceGap / 2
    const hips = measurements.hips * (1 + options.hipsEase) - laceGap / 2

    const waistCF = waist * options.cfPanel
    const waistF1 = waist * options.f1Panel
    const waistF2 = waist * options.f2Panel
    const waistB2 = waist * options.b2Panel
    const waistB1 = waist * options.b1Panel
    const waistCB = waist * options.cbPanel

    //let's begin
    //scaffold
    points.cfHps = new Point(0, 0)
    points.cfChest = points.cfHps.shift(-90, measurements.hpsToBust)
    points.cfWaist = points.cfHps.shift(
      -90,
      measurements.hpsToWaistFront * (1 + options.waistHeightBonus)
    )
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

    points.waist1 = new Point((points.apex.x + points.chest2.x) / 2, points.cfWaist.y)
    points.waist2 = new Point((points.chest2.x + points.sideChest.x) / 2, points.cfWaist.y)
    points.waist3 = new Point((points.sideChest.x + points.chest4.x) / 2, points.cfWaist.y)
    points.waist4 = new Point((points.chest4.x + points.chest5.x) / 2, points.cfWaist.y)

    points.waist10 = points.waist1.shift(180, waistF1 / 4)
    points.waist11 = points.waist1.shift(0, waistF1 / 4)

    points.waist20 = points.waist2.shift(180, waistF2 / 4)
    points.waist21 = points.waist2.shift(0, waistF2 / 4)

    points.waist30 = points.waist3.shift(180, waistB2 / 4)
    points.waist31 = points.waist3.shift(0, waistB2 / 4)

    points.waist40 = points.waist4.shift(180, waistB1 / 4)
    points.waist41 = points.waist4.shift(0, waistB1 / 4)

    //the hips
    points.hips01 = new Point(points.waist01.x * (1 + options.cfHipsBonus), points.cfHips.y)

    const hipsDiff = hips - points.cfHips.dist(points.hips01) * 2

    const hipsF1 = hipsDiff * options.f1Panel
    const hipsF2 = hipsDiff * options.f2Panel
    const hipsB2 = hipsDiff * options.b2Panel
    const hipsB1 = hipsDiff * options.b1Panel
    const hipsCB = hipsDiff * options.cbPanel

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
    const frontTopDepth = measurements.hpsToBust * options.frontTopDepth
    points.top1 = points.apex.shift(90, frontTopDepth)
    points.cfTop = new Point(points.cfHips.x, points.top1.y).shiftFractionTowards(
      points.cfChest,
      options.cfTopCurve
    )
    points.top1Cp1 = new Point(points.top1.x * 0.2, points.top1.y)

    points.sideTopCp1 = points.sideChest.shiftFractionTowards(points.apex, 0.5)
    points.top1Cp2 = new Point(points.sideTopCp1.x, points.top1.y)

    points.top2 = utils.lineIntersectsCurve(
      points.chest2,
      points.chest2.shift(90, measurements.hpsToWaistFront),
      points.top1,
      points.top1Cp2,
      points.sideTopCp1,
      points.sideChest
    )

    //back top
    const backTopDepth = measurements.hpsToWaistBack * options.backTopDepth

    points.cbTop = points.cbChest.shift(90, backTopDepth)
    points.sideTopCp2 = points.chest4
    points.cbCp1 = new Point(points.chest5.x, points.cbTop.y)

    points.top4 = utils.lineIntersectsCurve(
      points.chest4,
      points.chest4.shift(90, measurements.hpsToWaistFront),
      points.sideChest,
      points.sideTopCp2,
      points.cbCp1,
      points.cbTop
    )

    points.top5 = utils.lineIntersectsCurve(
      points.chest5,
      points.chest5.shift(90, measurements.hpsToWaistFront),
      points.sideChest,
      points.sideTopCp2,
      points.cbCp1,
      points.cbTop
    )

    //bottom
    const frontBottomDepth = measurements.waistToHips * options.frontBottomDepth
    const sideBottomReduction = measurements.waistToHips * options.sideBottomReduction
    const backBottomDepth = measurements.waistToHips * options.backBottomDepth

    points.cfBottom = points.cfHips.shift(-90, frontBottomDepth)
    points.sideBottom = points.hips30.shift(90, sideBottomReduction)
    points.cbBottom = points.cbHips.shift(-90, backBottomDepth)

    points.frontBottomAnchor = points.cfBottom.shiftFractionTowards(points.sideBottom, 0.5)
    points.bottomCp1 = utils.beamsIntersect(
      points.frontBottomAnchor,
      points.sideBottom.rotate(90, points.frontBottomAnchor),
      points.sideBottom,
      points.sideBottom.shift(180, 1)
    )

    points.backBottomAnchor = points.sideBottom.shiftFractionTowards(points.cbBottom, 0.5)
    points.bottomCp2 = utils.beamsIntersect(
      points.backBottomAnchor,
      points.cbBottom.rotate(90, points.backBottomAnchor),
      points.sideBottom,
      points.sideBottom.shift(0, 1)
    )
    points.bottomCp3 = new Point(points.backBottomAnchor.x, points.cbBottom.y)

    //front bottom

    points.f2BottomRight = utils.beamsIntersect(
      points.hips21,
      points.waist21,
      points.sideBottom,
      points.sideBottom.shift(180, 1)
    )

    points.f2BottomLeft = utils.lineIntersectsCurve(
      points.waist20,
      points.waist20.shiftOutwards(points.hips20, measurements.hpsToWaistFront),
      points.cfBottom,
      points.cfBottom,
      points.bottomCp1,
      points.sideBottom
    )
    points.f1BottomRight = utils.beamsIntersect(
      points.f2BottomLeft,
      points.f2BottomLeft.shift(180, 1),
      points.waist11,
      points.hips11
    )

    points.f1BottomLeft = utils.lineIntersectsCurve(
      points.waist10,
      points.waist10.shiftOutwards(points.hips10, measurements.hpsToWaistFront),
      points.cfBottom,
      points.cfBottom,
      points.bottomCp1,
      points.sideBottom
    )

    points.f0BottomRight = utils.beamsIntersect(
      points.f1BottomLeft,
      points.f1BottomLeft.shift(180, 1),
      points.waist01,
      points.hips01
    )

    points.f2BottomCp1 = new Point(
      points.hips2.shiftFractionTowards(points.hips21, 0.4).x,
      points.f2BottomRight.y
    )

    points.f1BottomCp2 = points.f1BottomRight.shift(
      points.f2BottomCp1.angle(points.f2BottomLeft),
      points.hips10.dist(points.hips11) * 0.25
    )
    points.f1BottomCp1 = points.f1BottomLeft.shift(
      points.cfBottom.angle(points.f0BottomRight),
      points.hips10.dist(points.hips11) * 0.25
    )
    //back bottom

    points.b2BottomLeft = utils.beamsIntersect(
      points.sideBottom,
      points.sideBottom.shift(0, 1),
      points.waist30,
      points.hips30
    )

    points.b2BottomRight = utils.lineIntersectsCurve(
      points.waist31,
      points.waist31.shiftOutwards(points.hips31, measurements.hpsToWaistFront),
      points.sideBottom,
      points.bottomCp2,
      points.bottomCp3,
      points.cbBottom
    )

    points.b1BottomLeft = utils.beamsIntersect(
      points.b2BottomRight,
      points.b2BottomRight.shift(0, 1),
      points.waist40,
      points.hips40
    )

    points.b0BottomLeft = utils.lineIntersectsCurve(
      points.waist50,
      points.waist50.shiftOutwards(points.hips50, measurements.hpsToWaistFront),
      points.sideBottom,
      points.bottomCp2,
      points.bottomCp3,
      points.cbBottom
    )

    points.b1BottomRight = utils.beamsIntersect(
      points.b0BottomLeft,
      points.b0BottomLeft.shift(0, 1),
      points.waist41,
      points.hips41
    )

    points.b2BottomCp1 = new Point(points.hips3.x, points.b2BottomLeft.y)
    points.cbBottomCp1 = points.cbBottom.shiftFractionTowards(points.bottomCp3, 0.45)

    points.b1BottomCp1 = points.b1BottomLeft.shift(
      points.b2BottomCp1.angle(points.b2BottomRight),
      points.hips40.dist(points.hips41) * 0.25
    )
    points.b1BottomCp2 = points.b1BottomRight.shift(
      points.cbBottomCp1.angle(points.b0BottomLeft),
      points.hips40.dist(points.hips41) * 0.25
    )

    //centre front
    points.hips01Cp2 = points.f0BottomRight.shiftFractionTowards(
      new Point(points.f0BottomRight.x, points.cfWaist.y),
      0.1
    )
    points.waist01Cp1 = points.waist01.shiftFractionTowards(
      new Point(points.waist01.x, points.f0BottomRight.y),
      0.1
    )

    points.apexCp1 = points.apex.shiftFractionTowards(
      new Point(points.apex.x, points.cfUnderbust.y),
      1
    )
    points.waist01Cp2 = points.waist01.shiftFractionTowards(
      new Point(points.waist01.x, points.cfUnderbust.y),
      0.5
    )

    //f1 panel
    points.apexCp2 = points.apex.shiftFractionTowards(
      new Point(points.apex.x, points.cfUnderbust.y),
      1
    )
    points.waist10Cp1 = points.waist10.shiftFractionTowards(
      new Point(points.waist10.x, points.cfUnderbust.y),
      0.5
    )

    points.hips10Cp1 = points.f1BottomLeft.shiftFractionTowards(
      new Point(points.f1BottomLeft.x, points.cfWaist.y),
      0.1
    )
    points.waist10Cp2 = points.waist10.shiftFractionTowards(
      new Point(points.waist10.x, points.f1BottomLeft.y),
      0.1
    )

    points.waist11Cp2 = points.waist11.shiftFractionTowards(
      new Point(points.waist11.x, points.cfUnderbust.y),
      0.5
    )
    points.chest2Cp1 = points.chest2.shiftFractionTowards(
      new Point(points.chest2.x, points.cfUnderbust.y),
      1
    )

    points.hips11Cp2 = points.f1BottomRight.shiftFractionTowards(
      new Point(points.f1BottomRight.x, points.cfWaist.y),
      0.1
    )
    points.waist11Cp1 = points.waist11.shiftFractionTowards(
      new Point(points.waist11.x, points.f1BottomRight.y),
      0.1
    )

    //f2 panel

    points.chest2Cp2 = points.chest2.shiftFractionTowards(
      new Point(points.chest2.x, points.cfUnderbust.y),
      1
    )
    points.waist20Cp1 = points.waist20.shiftFractionTowards(
      new Point(points.waist20.x, points.cfUnderbust.y),
      0.5
    )

    points.hips20Cp1 = points.f2BottomLeft.shiftFractionTowards(
      new Point(points.f2BottomLeft.x, points.cfWaist.y),
      0.1
    )
    points.waist20Cp2 = points.waist20.shiftFractionTowards(
      new Point(points.waist20.x, points.f2BottomLeft.y),
      0.1
    )

    points.waist21Cp2 = points.waist21.shiftFractionTowards(
      new Point(points.waist21.x, points.cfUnderbust.y),
      0.5
    )
    points.sideChestCp1 = points.sideChest.shiftFractionTowards(points.sideUnderbust, 1)

    points.hips21Cp2 = points.f2BottomRight.shiftFractionTowards(
      new Point(points.f2BottomRight.x, points.cfWaist.y),
      0.1
    )
    points.waist21Cp1 = points.waist21.shiftFractionTowards(
      new Point(points.waist21.x, points.f2BottomRight.y),
      0.1
    )

    //b2 panel
    points.sideChestCp2 = points.sideChest.shiftFractionTowards(points.sideUnderbust, 1)
    points.waist30Cp1 = points.waist30.shiftFractionTowards(
      new Point(points.waist30.x, points.cfUnderbust.y),
      0.5
    )

    points.hips30Cp1 = points.b2BottomLeft.shiftFractionTowards(
      new Point(points.b2BottomLeft.x, points.cfWaist.y),
      0.1
    )
    points.waist30Cp2 = points.waist30.shiftFractionTowards(
      new Point(points.waist30.x, points.b2BottomLeft.y),
      0.1
    )

    points.waist31Cp2 = points.waist31.shiftFractionTowards(
      new Point(points.waist31.x, points.cfUnderbust.y),
      0.5
    )
    points.chest4Cp1 = points.chest4.shiftFractionTowards(
      new Point(points.chest4.x, points.cfUnderbust.y),
      1
    )

    points.hips31Cp2 = points.b2BottomRight.shiftFractionTowards(
      new Point(points.b2BottomRight.x, points.cfWaist.y),
      0.1
    )
    points.waist31Cp1 = points.waist31.shiftFractionTowards(
      new Point(points.waist31.x, points.b2BottomRight.y),
      0.1
    )

    //b1 panel
    points.chest4Cp2 = points.chest4.shiftFractionTowards(
      new Point(points.chest4.x, points.cfUnderbust.y),
      1
    )
    points.waist40Cp1 = points.waist40.shiftFractionTowards(
      new Point(points.waist40.x, points.cfUnderbust.y),
      0.5
    )

    points.hips40Cp1 = points.b1BottomLeft.shiftFractionTowards(
      new Point(points.b1BottomLeft.x, points.cfWaist.y),
      0.1
    )
    points.waist40Cp2 = points.waist40.shiftFractionTowards(
      new Point(points.waist40.x, points.b1BottomLeft.y),
      0.1
    )

    points.waist41Cp2 = points.waist41.shiftFractionTowards(
      new Point(points.waist41.x, points.cfUnderbust.y),
      0.5
    )
    points.chest5Cp1 = points.chest4.shiftFractionTowards(
      new Point(points.chest5.x, points.cfUnderbust.y),
      1
    )

    points.hips41Cp2 = points.b1BottomRight.shiftFractionTowards(
      new Point(points.b1BottomRight.x, points.cfWaist.y),
      0.1
    )
    points.waist41Cp1 = points.waist41.shiftFractionTowards(
      new Point(points.waist41.x, points.b1BottomRight.y),
      0.1
    )

    //cb panel
    points.chest5Cp2 = points.chest4.shiftFractionTowards(
      new Point(points.chest5.x, points.cfUnderbust.y),
      1
    )
    points.waist50Cp1 = points.waist50.shiftFractionTowards(
      new Point(points.waist50.x, points.cfUnderbust.y),
      0.5
    )

    points.hips50Cp1 = points.b0BottomLeft.shiftFractionTowards(
      new Point(points.b0BottomLeft.x, points.cfWaist.y),
      0.1
    )
    points.waist50Cp2 = points.waist50.shiftFractionTowards(
      new Point(points.waist50.x, points.b0BottomLeft.y),
      0.1
    )

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

    paths.frontCurve = new Path()
      .move(points.cfTop)
      ._curve(points.top1Cp1, points.top1)
      .curve(points.top1Cp2, points.sideTopCp1, points.sideChest)

    paths.backCurve = new Path()
      .move(points.sideChest)
      .curve(points.sideTopCp2, points.cbCp1, points.cbTop)

    // paths.f01Line = new Path().move(points.hips01).line(points.waist01).line(points.apex).attr('class', 'various')

    // paths.f10Line = new Path().move(points.apex).line(points.waist10).line(points.hips10).attr('class', 'various')

    // paths.f11Line = new Path().move(points.hips11).line(points.waist11).line(points.chest2).attr('class', 'various')

    // paths.f20Line = new Path().move(points.chest2).line(points.waist20).line(points.hips20).attr('class', 'various')

    // paths.f21Line = new Path().move(points.hips21).line(points.waist21).line(points.sideChest).attr('class', 'various')

    // paths.b30Line = new Path().move(points.sideChest).line(points.waist30).line(points.hips30).attr('class', 'various')

    // paths.b31Line = new Path().move(points.hips31).line(points.waist31).line(points.chest4).attr('class', 'various')

    // paths.b40Line = new Path().move(points.chest4).line(points.waist40).line(points.hips40).attr('class', 'various')

    // paths.b41Line = new Path().move(points.hips41).line(points.waist41).line(points.chest5).attr('class', 'various')

    // paths.b50Line = new Path().move(points.chest5).line(points.waist50).line(points.hips50).attr('class', 'various')

    paths.f01 = new Path()
      .move(points.f0BottomRight)
      .curve(points.hips01Cp2, points.waist01Cp1, points.waist01)
      .curve(points.waist01Cp2, points.apexCp1, points.apex)
      .line(points.top1)

    paths.f10 = new Path()
      .move(points.top1)
      .line(points.apex)
      .curve(points.apexCp2, points.waist10Cp1, points.waist10)
      .curve(points.waist10Cp2, points.hips10Cp1, points.f1BottomLeft)

    paths.f11 = new Path()
      .move(points.f1BottomRight)
      .curve(points.hips11Cp2, points.waist11Cp1, points.waist11)
      .curve(points.waist11Cp2, points.chest2Cp1, points.chest2)
      .line(points.top2)

    paths.f20 = new Path()
      .move(points.top2)
      .line(points.chest2)
      .curve(points.chest2Cp2, points.waist20Cp1, points.waist20)
      .curve(points.waist20Cp2, points.hips20Cp1, points.f2BottomLeft)

    paths.f21 = new Path()
      .move(points.f2BottomRight)
      .curve(points.hips21Cp2, points.waist21Cp1, points.waist21)
      .curve(points.waist21Cp2, points.sideChestCp1, points.sideChest)

    paths.b20 = new Path()
      .move(points.sideChest)
      .curve(points.sideChestCp2, points.waist30Cp1, points.waist30)
      .curve(points.waist30Cp2, points.hips30Cp1, points.b2BottomLeft)

    paths.b21 = new Path()
      .move(points.b2BottomRight)
      .curve(points.hips31Cp2, points.waist31Cp1, points.waist31)
      .curve(points.waist31Cp2, points.chest4Cp1, points.chest4)
      .line(points.top4)

    paths.b10 = new Path()
      .move(points.top4)
      .line(points.chest4)
      .curve(points.chest4Cp2, points.waist40Cp1, points.waist40)
      .curve(points.waist40Cp2, points.hips40Cp1, points.b1BottomLeft)

    paths.b11 = new Path()
      .move(points.b1BottomRight)
      .curve(points.hips41Cp2, points.waist41Cp1, points.waist41)
      .curve(points.waist41Cp2, points.chest5Cp1, points.chest5)
      .line(points.top5)

    paths.b00 = new Path()
      .move(points.top5)
      .line(points.chest5)
      .curve(points.chest5Cp2, points.waist50Cp1, points.waist50)
      .curve(points.waist50Cp2, points.hips50Cp1, points.b0BottomLeft)

    // paths.frontBottomCurve = new Path()
    // .move(points.cfBottom)
    // ._curve(points.bottomCp1, points.sideBottom)
    // .attr('class', 'various')

    // paths.backBottomCurve = new Path()
    // .move(points.sideBottom)
    // .curve(points.bottomCp2, points.bottomCp3, points.cbBottom)
    // .attr('class', 'various')

    paths.bottom = new Path()
      .move(points.cfBottom)
      .line(points.f0BottomRight)
      .move(points.f1BottomLeft)
      .curve(points.f1BottomCp1, points.f1BottomCp2, points.f1BottomRight)
      .move(points.f2BottomLeft)
      .curve_(points.f2BottomCp1, points.f2BottomRight)
      .move(points.b2BottomLeft)
      .curve_(points.b2BottomCp1, points.b2BottomRight)
      .move(points.b1BottomLeft)
      .curve(points.b1BottomCp1, points.b1BottomCp2, points.b1BottomRight)
      .move(points.b0BottomLeft)
      ._curve(points.cbBottomCp1, points.cbBottom)

    return part
  },
}
