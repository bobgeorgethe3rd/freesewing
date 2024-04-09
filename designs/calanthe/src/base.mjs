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
    bustSpanEase: { pct: 0, min: 0, max: 10, menu: 'fit' }, //4.4
    waistEase: { pct: -5.4, min: -20, max: 0, menu: 'fit' },
    hipsEase: { pct: 2.1, min: 0, max: 10, menu: 'fit' },
    chestBackReduction: { pct: 3.6, min: 0, max: 4, menu: 'fit' },
    //Style
    laceGap: { pct: 5.4, min: 0, max: 10, snap: 6.35, ...pctBasedOn('waist'), menu: 'style' },
    length: { pct: 100, min: 50, max: 100, menu: 'style' },
    lengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    waistDepth: { pct: 5.2, min: 0, max: 10, menu: 'style' },
    frontTopDepth: { pct: 14.4, min: 7.5, max: 20, menu: 'style' }, //8.2
    cfTopCurve: { pct: 0, min: 0, max: 200, menu: 'style' },
    backTopDepth: { pct: 8.5, min: 0, max: 11.3, menu: 'style' },
    frontBottomDepth: { pct: 29.9, min: 7.4, max: 44.9, menu: 'style' },
    sideBottomReduction: { pct: 7.4, min: 0, max: 15, menu: 'style' },
    backBottomDepth: { pct: 7.4, min: 7.4, max: 29.9, menu: 'style' },
    //Advanced
    chestFrontBalance: { pct: 50, min: 40, max: 60, menu: 'advanced.fit' },
    cfWaistWidth: { pct: 58, min: 40, max: 75, menu: 'advanced.fit' },
    cbWaistWidth: { pct: 97.2, min: 85, max: 98, menu: 'advanced.fit' },
    waistFrontBalance: { pct: 43.7, min: 40, max: 60, menu: 'advanced.fit' },
    waistBackBalance: { pct: 48.1, min: 40, max: 60, menu: 'advanced.fit' },
    cfHipsWidth: { pct: 0, min: -20, max: 50, menu: 'advanced.fit' },
    cbHipsWidth: { pct: 0, min: -20, max: 50, menu: 'advanced.fit' },
    hipsFrontBalance: { pct: 50, min: 25, max: 75, menu: 'advanced.fit' },
    hipsBackBalance: { pct: 50, min: 25, max: 75, menu: 'advanced.fit' },
  },
  measurements: [
    'chest',
    'waist',
    'hips',
    'hpsToBust',
    'hpsToWaistFront',
    'hpsToWaistBack',
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
    const bustFront = measurements.bustFront * (1 + options.chestEase)
    const chestBack =
      (measurements.chest * (1 + options.chestEase) - bustFront) *
        (1 - options.chestBackReduction) -
      laceGap
    const bustSpan = measurements.bustSpan * (1 + options.bustSpanEase)
    const waist = measurements.waist * (1 + options.waistEase) - laceGap
    const hips =
      measurements.waist * (1 + options.waistEase) * (1 - options.length) +
      measurements.hips * (1 + options.hipsEase) * options.length -
      laceGap
    const waistToHips = measurements.waistToHips * options.length * (1 + options.lengthBonus)
    //let's begin
    //scaffold
    points.cfHps = new Point(0, 0)
    points.cfChest = points.cfHps.shift(-90, measurements.hpsToBust)
    points.cfWaist = points.cfHps.shift(
      -90,
      measurements.hpsToWaistFront * (1 + options.waistDepth)
    )
    points.cfUnderbust = points.cfWaist.shift(90, measurements.waistToUnderbust)
    points.cfHips = points.cfWaist.shift(-90, waistToHips)

    //sideSeam
    points.sideChest = points.cfChest.shift(0, bustFront / 2)
    points.sideUnderbust = new Point(points.sideChest.x, points.cfUnderbust.y)
    points.sideWaist = new Point(points.sideChest.x, points.cfWaist.y)
    points.sideHips = new Point(points.sideChest.x, points.cfHips.y)

    //back
    points.cbChest = points.sideChest.shift(0, chestBack / 2)
    points.cbUnderbust = new Point(points.cbChest.x, points.cfUnderbust.y)
    points.cbWaist = new Point(points.cbChest.x, points.cfWaist.y)
    points.cbHips = new Point(points.cbChest.x, points.cfHips.y)

    //the bust
    points.apex = points.cfChest.shift(0, bustSpan / 2)

    //front panels
    points.chest2 = points.apex.shiftFractionTowards(points.sideChest, options.chestFrontBalance)

    let j
    for (let i = 0; i < 2; i++) {
      j = i + 4
      points['chest' + j] = points.sideChest.shiftFractionTowards(points.cbChest, (i + 1) / 3)
    }

    //waist
    points.waist0Right = points.cfWaist.shift(0, points.apex.x * options.cfWaistWidth)
    points.waist5Left = points.cbWaist.shift(
      180,
      points.chest5.dist(points.cbChest) * options.cbWaistWidth
    )

    const waistF1 =
      (waist * 0.25 - points.cfWaist.dist(points.waist0Right)) * options.waistFrontBalance
    const waistF2 =
      (waist * 0.25 - points.cfWaist.dist(points.waist0Right)) * (1 - options.waistFrontBalance)

    const waistB1 =
      (waist * 0.25 - points.cbWaist.dist(points.waist5Left)) * options.waistBackBalance
    const waistB2 =
      (waist * 0.25 - points.cbWaist.dist(points.waist5Left)) * (1 - options.waistBackBalance)

    points.waist1 = new Point((points.apex.x + points.chest2.x) / 2, points.cfWaist.y)
    points.waist2 = new Point((points.chest2.x + points.sideChest.x) / 2, points.cfWaist.y)
    points.waist3 = new Point((points.sideChest.x + points.chest4.x) / 2, points.cfWaist.y)
    points.waist4 = new Point((points.chest4.x + points.chest5.x) / 2, points.cfWaist.y)

    points.waist1Left = points.waist1.shift(180, waistF1 / 2)
    points.waist1Right = points.waist1.shift(0, waistF1 / 2)

    points.waist2Left = points.waist2.shift(180, waistF2 / 2)
    points.waist2Right = points.waist2.shift(0, waistF2 / 2)

    points.waist3Left = points.waist3.shift(180, waistB2 / 2)
    points.waist3Right = points.waist3.shift(0, waistB2 / 2)

    points.waist4Left = points.waist4.shift(180, waistB1 / 2)
    points.waist4Right = points.waist4.shift(0, waistB1 / 2)

    //hips
    points.hips0Right = new Point(points.waist0Right.x * (1 + options.cfHipsWidth), points.cfHips.y)
    points.hips5Left = points.cbHips.shiftFractionTowards(
      new Point(points.waist5Left.x, points.cbHips.y),
      1 + options.cbHipsWidth
    )

    const hipsFront1 =
      (hips * 0.25 - points.cfHips.dist(points.hips0Right)) * options.hipsFrontBalance
    const hipsFront2 =
      (hips * 0.25 - points.cfHips.dist(points.hips0Right)) * (1 - options.hipsFrontBalance)

    const hipsBack1 = (hips * 0.25 - points.cbHips.dist(points.hips5Left)) * options.hipsBackBalance
    const hipsBack2 =
      (hips * 0.25 - points.cbHips.dist(points.hips5Left)) * (1 - options.hipsBackBalance)

    points.hips1 = new Point(points.waist1.x, points.cfHips.y)
    points.hips1Left = points.hips1.shift(180, hipsFront1 / 2)
    points.hips1Right = points.hips1.shift(0, hipsFront1 / 2)

    points.hips2 = new Point(points.waist2.x, points.cfHips.y)
    points.hips2Left = points.hips2.shift(180, hipsFront2 / 2)
    points.hips2Right = points.hips2.shift(0, hipsFront2 / 2)

    points.hips3 = new Point(points.waist3.x, points.cfHips.y)
    points.hips3Left = points.hips3.shift(180, hipsBack2 / 2)
    points.hips3Right = points.hips3.shift(0, hipsBack2 / 2)

    points.hips4 = new Point(points.waist4.x, points.cfHips.y)
    points.hips4Left = points.hips4.shift(180, hipsBack1 / 2)
    points.hips4Right = points.hips4.shift(0, hipsBack1 / 2)

    //style time
    //bottom curve
    const sideBottomReduction = waistToHips * options.sideBottomReduction
    points.cfBottom = points.cfHips.shift(-90, waistToHips * options.frontBottomDepth)
    points.cbBottom = points.cbHips.shift(-90, waistToHips * options.backBottomDepth)

    points.bottom2Right = utils.beamsIntersect(
      points.sideHips.shift(90, sideBottomReduction),
      points.hips2Right.shift(90, sideBottomReduction),
      points.hips2Right,
      points.waist2Right
    )
    points.bottom3Left = utils.beamsIntersect(
      points.sideHips.shift(90, sideBottomReduction),
      points.hips3Left.shift(90, sideBottomReduction),
      points.waist3Left,
      points.hips3Left
    )

    const frontBottomDiff = points.cfBottom.y - points.bottom2Right.y
    const backBottomDiff = points.cbBottom.y - points.bottom3Left.y

    points.bottom0Right = utils.beamsIntersect(
      points.cfBottom.shift(90, (frontBottomDiff * 1) / 3),
      points.cfBottom.translate(1, (-frontBottomDiff * 1) / 3),
      points.waist0Right,
      points.hips0Right
    )

    points.bottom1Left = utils.beamsIntersect(
      points.bottom0Right,
      points.bottom0Right.shift(0, 1),
      points.waist1Left,
      points.hips1Left
    )

    points.bottom1Right = utils.beamsIntersect(
      points.bottom2Right.shift(-90, (frontBottomDiff * 1) / 3),
      points.bottom2Right.translate(1, (frontBottomDiff * 1) / 3),
      points.waist1Right,
      points.hips1Right
    )

    points.bottom2Left = utils.beamsIntersect(
      points.bottom1Right,
      points.bottom1Right.shift(180, 1),
      points.waist2Left,
      points.hips2Left
    )

    points.bottom3Right = utils.beamsIntersect(
      points.bottom2Right.shift(-90, (backBottomDiff * 1) / 3),
      points.bottom2Right.translate(1, (backBottomDiff * 1) / 3),
      points.waist3Right,
      points.hips3Right
    )

    points.bottom4Left = utils.beamsIntersect(
      points.bottom3Right,
      points.bottom3Right.shift(180, 1),
      points.waist4Left,
      points.hips4Left
    )

    points.bottom4Right = utils.beamsIntersect(
      points.cbBottom.shift(90, (backBottomDiff * 1) / 3),
      points.cbBottom.translate(1, (-backBottomDiff * 1) / 3),
      points.waist4Right,
      points.hips4Right
    )

    points.bottom5Left = utils.beamsIntersect(
      points.bottom4Right,
      points.bottom4Right.shift(180, 1),
      points.waist5Left,
      points.hips5Left
    )

    //bottom curves
    points.bottom1RightCp1 = new Point(points.hips1.x, points.bottom1Right.y)
    points.bottom2RightCp1 = new Point(points.hips2.x, points.bottom2Right.y)
    points.bottom3LeftCp2 = new Point(points.hips3.x, points.bottom3Left.y)
    points.bottom4LeftCp2 = new Point(points.hips4.x, points.bottom4Left.y)
    points.cbBottomCp1 = new Point(
      (points.bottom5Left.x + points.cbBottom.x) / 2,
      points.cbBottom.y
    )

    //top curves
    points.cbTop = points.cbChest.shift(90, measurements.hpsToWaistBack * options.backTopDepth)
    points.sideChestCp1 = points.chest4
    points.cbTopCp2 = new Point(points.chest5.x, points.cbTop.y)

    points.topFrontMid = points.apex
      .shiftFractionTowards(points.chest2, 0.5)
      .shift(90, measurements.hpsToBust * options.frontTopDepth)
    points.topMid = points.sideChest.shiftFractionTowards(points.chest4, 0.5)
    points.cbTopCp2 = new Point(points.chest5.x, points.cbTop.y)
    points.topMidCp1 = points.chest4.shiftFractionTowards(points.chest5, 0.5)
    points.topMidCp2 = points.sideChest.shiftFractionTowards(points.chest2, 0.5)
    points.topFrontMidCp1 = new Point(points.topMidCp2.x, points.topFrontMid.y)
    points.topFrontMidCp2 = new Point(points.apex.x * 0.2, points.topFrontMid.y)
    points.cfTop = new Point(points.cfChest.x, points.topFrontMid.y).shiftFractionTowards(
      points.cfChest,
      options.cfTopCurve
    )

    points.top1 = utils.lineIntersectsCurve(
      points.apex,
      new Point(points.apex.x, points.cfHps.y),
      points.topFrontMid,
      points.topFrontMidCp2,
      points.cfTop,
      points.cfTop
    )
    points.top2 = utils.lineIntersectsCurve(
      points.chest2,
      new Point(points.chest2.x, points.cfHps.y),
      points.topMid,
      points.topMidCp2,
      points.topFrontMidCp1,
      points.topFrontMid
    )
    points.sideTop = utils.lineIntersectsCurve(
      points.sideChest,
      new Point(points.sideChest.x, points.cfHps.y),
      points.topMid,
      points.topMidCp2,
      points.topFrontMidCp1,
      points.topFrontMid
    )
    points.top4 = utils.lineIntersectsCurve(
      points.chest4,
      new Point(points.chest4.x, points.cfHps.y),
      points.cbTop,
      points.cbTopCp2,
      points.topMidCp1,
      points.topMid
    )
    points.top5 = utils.lineIntersectsCurve(
      points.chest5,
      new Point(points.chest5.x, points.cfHps.y),
      points.cbTop,
      points.cbTopCp2,
      points.topMidCp1,
      points.topMid
    )

    //sides
    points.bottom0RightCp2 = points.bottom0Right.shift(
      90,
      (points.bottom0Right.y - points.waist0Right.y) * 0.1
    )
    points.waist0RightCp1 = points.waist0Right.shift(
      -90,
      (points.bottom0Right.y - points.waist0Right.y) * 0.1
    )
    points.waist0RightCp2 = new Point(
      points.waist0Right.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.apexCp = new Point(points.apex.x, points.cfUnderbust.y)

    points.waist1LeftCp1 = new Point(
      points.waist1Left.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.waist1LeftCp2 = points.waist1Left.shift(
      -90,
      (points.bottom1Left.y - points.waist1Left.y) * 0.1
    )
    points.bottom1LeftCp1 = points.bottom1Left.shift(
      90,
      (points.bottom1Left.y - points.waist1Left.y) * 0.1
    )
    points.bottom1RightCp2 = points.bottom1Right.shift(
      90,
      (points.bottom1Right.y - points.waist1Right.y) * 0.1
    )
    points.waist1RightCp1 = points.waist1Right.shift(
      -90,
      (points.bottom1Right.y - points.waist1Right.y) * 0.1
    )
    points.waist1RightCp2 = new Point(
      points.waist1Right.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.chest2Cp = new Point(points.chest2.x, points.cfUnderbust.y)

    points.waist2LeftCp1 = new Point(
      points.waist2Left.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.waist2LeftCp2 = points.waist2Left.shift(
      -90,
      (points.bottom2Left.y - points.waist2Left.y) * 0.1
    )
    points.bottom2LeftCp1 = points.bottom2Left.shift(
      90,
      (points.bottom2Left.y - points.waist2Left.y) * 0.1
    )
    points.bottom2RightCp2 = points.bottom2Right.shift(
      90,
      (waistToHips - sideBottomReduction) * 0.1
    )
    points.waist2RightCp1 = points.waist2Right.shift(-90, (waistToHips - sideBottomReduction) * 0.1)
    points.waist2RightCp2 = new Point(
      points.waist2Right.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.sideChestCp = new Point(points.sideChest.x, points.cfUnderbust.y)

    points.waist3LeftCp1 = new Point(
      points.waist3Left.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.waist3LeftCp2 = points.waist3Left.shift(-90, (waistToHips - sideBottomReduction) * 0.1)
    points.bottom3LeftCp1 = points.bottom3Left.shift(90, (waistToHips - sideBottomReduction) * 0.1)
    points.bottom3RightCp2 = points.bottom3Right.shift(
      90,
      (points.bottom3Right.y - points.waist3Right.y) * 0.1
    )
    points.waist3RightCp1 = points.waist3Right.shift(
      -90,
      (points.bottom3Right.y - points.waist3Right.y) * 0.1
    )
    points.waist3RightCp2 = new Point(
      points.waist3Right.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.chest4Cp = new Point(points.chest4.x, points.cfUnderbust.y)

    points.waist4LeftCp1 = new Point(
      points.waist4Left.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.waist4LeftCp2 = points.waist4Left.shift(
      -90,
      (points.bottom4Left.y - points.waist4Left.y) * 0.1
    )
    points.bottom4LeftCp1 = points.bottom4Left.shift(
      90,
      (points.bottom4Left.y - points.waist4Left.y) * 0.1
    )
    points.bottom4RightCp2 = points.bottom4Right.shift(
      90,
      (points.bottom4Right.y - points.waist4Right.y) * 0.1
    )
    points.waist4RightCp1 = points.waist4Right.shift(
      -90,
      (points.bottom4Right.y - points.waist4Right.y) * 0.1
    )
    points.waist4RightCp2 = new Point(
      points.waist4Right.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.chest5Cp = new Point(points.chest5.x, points.cfUnderbust.y)

    points.waist5LeftCp1 = new Point(
      points.waist5Left.x,
      (points.cfUnderbust.y + points.cfWaist.y) / 2
    )
    points.waist5LeftCp2 = points.waist5Left.shift(
      -90,
      (points.bottom5Left.y - points.waist5Left.y) * 0.1
    )
    points.bottom5LeftCp1 = points.bottom5Left.shift(
      90,
      (points.bottom5Left.y - points.waist5Left.y) * 0.1
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

    paths.lines = new Path()
      .move(points.cfChest)
      .line(points.cfBottom)
      .line(points.bottom0Right)
      .line(points.waist0Right)
      .line(points.apex)
      .line(points.waist1Left)
      .line(points.bottom1Left)
      .line(points.bottom1Right)
      .line(points.waist1Right)
      .line(points.chest2)
      .line(points.waist2Left)
      .line(points.bottom2Left)
      .line(points.bottom2Right)
      .line(points.waist2Right)
      .line(points.sideChest)
      .line(points.waist3Left)
      .line(points.bottom3Left)
      .line(points.bottom3Right)
      .line(points.waist3Right)
      .line(points.chest4)
      .line(points.waist4Left)
      .line(points.bottom4Left)
      .line(points.bottom4Right)
      .line(points.waist4Right)
      .line(points.chest5)
      .line(points.waist5Left)
      .line(points.bottom5Left)
      .line(points.cbBottom)
      .attr('class', 'various')

    paths.curves = new Path()
      .move(points.bottom0Right)
      .curve(points.bottom0RightCp2, points.waist0RightCp1, points.waist0Right)
      .curve(points.waist0RightCp2, points.apexCp, points.apex)
      .line(points.top1)
      .line(points.apex)
      .curve(points.apexCp, points.waist1LeftCp1, points.waist1Left)
      .curve(points.waist1LeftCp2, points.bottom1LeftCp1, points.bottom1Left)
      .move(points.bottom1Right)
      .curve(points.bottom1RightCp2, points.waist1RightCp1, points.waist1Right)
      .curve(points.waist1RightCp2, points.chest2Cp, points.chest2)
      .line(points.top2)
      .line(points.chest2)
      .curve(points.chest2Cp, points.waist2LeftCp1, points.waist2Left)
      .curve(points.waist2LeftCp2, points.bottom2LeftCp1, points.bottom2Left)
      .move(points.bottom2Right)
      .curve(points.bottom2RightCp2, points.waist2RightCp1, points.waist2Right)
      .curve(points.waist2RightCp2, points.sideChestCp, points.sideChest)
      .line(points.sideTop)
      .line(points.sideChest)
      .curve(points.sideChestCp, points.waist3LeftCp1, points.waist3Left)
      .curve(points.waist3LeftCp2, points.bottom3LeftCp1, points.bottom3Left)
      .move(points.bottom3Right)
      .curve(points.bottom3RightCp2, points.waist3RightCp1, points.waist3Right)
      .curve(points.waist3RightCp2, points.chest4Cp, points.chest4)
      .line(points.top4)
      .line(points.chest4)
      .curve(points.chest4Cp, points.waist4LeftCp1, points.waist4Left)
      .curve(points.waist4LeftCp2, points.bottom4LeftCp1, points.bottom4Left)
      .move(points.bottom4Right)
      .curve(points.bottom4RightCp2, points.waist4RightCp1, points.waist4Right)
      .curve(points.waist4RightCp2, points.chest5Cp, points.chest5)
      .line(points.top5)
      .line(points.chest5)
      .curve(points.chest5Cp, points.waist5LeftCp1, points.waist5Left)
      .curve(points.waist5LeftCp2, points.bottom5LeftCp1, points.bottom5Left)

    paths.bottomCurves = new Path()
      .move(points.cfBottom)
      .line(points.bottom0Right)
      .move(points.bottom1Left)
      ._curve(points.bottom1RightCp1, points.bottom1Right)
      .move(points.bottom2Left)
      ._curve(points.bottom2RightCp1, points.bottom2Right)
      .move(points.bottom3Left)
      .curve_(points.bottom3LeftCp2, points.bottom3Right)
      .move(points.bottom4Left)
      .curve_(points.bottom4LeftCp2, points.bottom4Right)
      .move(points.bottom5Left)
      ._curve(points.cbBottomCp1, points.cbBottom)

    paths.topCurve = new Path()
      .move(points.cbTop)
      .curve(points.cbTopCp2, points.topMidCp1, points.topMid)
      .curve(points.topMidCp2, points.topFrontMidCp1, points.topFrontMid)
      .curve_(points.topFrontMidCp2, points.cfTop)

    return part
  },
}
