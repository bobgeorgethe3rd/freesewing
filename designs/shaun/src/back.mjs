import { backBase } from './backBase.mjs'

export const back = {
  name: 'shaun.back',
  from: backBase,
  hide: {
    from: true,
  },
  options: {
    //Style
    backBoxPleat: { bool: false, menu: 'style' },
    backBoxPleatWidth: { pct: 4.3, min: 4, max: 6, menu: 'style' },
    skirtWidth: { pct: 36.4, min: 0, max: 50, menu: 'style' },
    //Darts
    backDarts: { bool: false, menu: 'darts' },
    backDartWidth: { pct: 75, min: 50, max: 100, menu: 'darts' },
    backDartPlacement: { pct: 50, min: 40, max: 60, menu: 'darts' },
    backDartLength: { pct: 80, min: 50, max: 90, menu: 'darts' },
    //Construction
    armholeSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Shaun
    hemWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Shaun
    backOnFold: { bool: true, menu: 'construction' },
    //Advanced
    backTopCurve: { pct: 45.2, min: 40, max: 50, menu: 'advanced' },
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
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //measurements
    const shirtLength = store.get('shirtLength')
    const waistDiff = store.get('waistDiff')
    const hemDiff = store.get('hemDiff')
    const hemWidth = measurements.waistToSeat * options.skirtWidth
    const backBoxPleatWidth = measurements.chest * options.backBoxPleatWidth
    //let's begin
    //hem
    points.cHemMin = points.cWaist.shift(-90, shirtLength)
    points.cHem = points.cHemMin.shift(-90, hemWidth)
    points.sideHemAnchor = new Point(points.armhole.x, points.cHemMin.y)
    points.sideHem = points.sideHemAnchor.shift(180, hemDiff)
    points.sideWaistCp1 = new Point(points.sideWaist.x, (points.sideWaist.y + points.sideHem.y) / 2)
    //yoke
    if (options.yokeBack) {
      points.backTopCurveEnd = points.yokeBack.shiftFractionTowards(
        points.cbYoke,
        options.backTopCurve
      )
      points.backTopCurveCp1 = points.backTopCurveEnd.shiftFractionTowards(
        points.yokeBack,
        options.backTopCurve
      )
      //box pleat extension
      if (options.backBoxPleat) {
        points.yokeBackPleat = points.cbYoke.shift(180, backBoxPleatWidth / 2)
        points.hemBackPleat = new Point(points.yokeBackPleat.x, points.cHem.y)
      }
    }

    //dart
    if (options.backDarts && waistDiff > 0) {
      const dartWidth =
        ((store.get('chest') - store.get('waist')) / (options.waistDiffDivider / 2)) *
        options.backDartWidth
      points.cHips = points.cWaist.shift(
        -90,
        measurements.waistToHips * (1 + options.shirtLengthBonus)
      )
      points.dartMid = new Point(points.armholePitch.x, points.cWaist.y).shiftFractionTowards(
        points.cWaist,
        options.backDartPlacement
      )
      points.dartLeft = points.dartMid.shift(180, dartWidth / 2)
      points.dartRight = points.dartLeft.flipX(points.dartMid)
      points.dartTop = points.dartMid.shiftFractionTowards(
        new Point(points.dartMid.x, points.cArmhole.y),
        options.backDartLength
      )
      points.dartBottom = points.dartMid.shiftFractionTowards(
        new Point(points.dartMid.x, points.cHips.y),
        options.backDartLength
      )
      paths.dart = new Path()
        .move(points.dartRight)
        .line(points.dartTop)
        .line(points.dartLeft)
        .line(points.dartBottom)
        .line(points.dartRight)
        .close()
        .attr('class', 'fabric help')
    }
    //paths
    const drawSeamLeft = () => {
      if (options.yokeBack) {
        if (options.backBoxPleat) {
          return new Path().move(points.yokeBackPleat).line(points.hemBackPleat)
        } else {
          return new Path().move(points.cbYoke).line(points.cHem)
        }
      } else {
        return new Path().move(points.cbNeck).line(points.cHem)
      }
    }

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    const drawArmhole = () => {
      if (options.yokeBack) {
        return paths.armhole.split(points.backTopRight)[0]
      } else {
        return paths.armhole
      }
    }

    const drawSaTop = () => {
      if (options.yokeBack) {
        return new Path()
          .move(points.backTopRight)
          .curve_(points.backTopCurveCp1, points.backTopCurveEnd)
          .line(drawSeamLeft().start())
      } else {
        return new Path()
          .move(points.shoulder)
          .line(points.hps)
          ._curve(points.cbNeckCp1, points.cbNeck)
      }
    }

    //guides
    paths.byronGuide = new Path()
      .move(points.cWaist)
      .line(points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
      .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.cWaist)
      .close()
      .attr('class', 'various dashed')

    paths.seamLeftGuide = drawSeamLeft()
    paths.armholeGuide = drawArmhole().unhide()
    paths.seamTopGuide = drawSaTop()

    paths.hemGuide = new Path()
      .move(points.cWaist)
      .line(points.cHem)
      .line(points.sideHem)
      ._curve(points.sideWaistCp1, points.sideWaist)

    if (complete) {
      //grainline
      if (options.backOnFold) {
        points.cutOnFoldFrom = drawSeamLeft().start()
        points.cutOnFoldTo = drawSeamLeft().end()
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = new Point(points.cbNeckCp1.x / 2, drawSeamLeft().start().y)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
    }

    return part
  },
}
