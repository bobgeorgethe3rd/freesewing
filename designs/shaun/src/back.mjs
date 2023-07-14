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
    skirtWidth: { pct: 36.4, min: 0, max: 50, menu: 'style' }, //15.4
    skirtCurve: { pct: 50, min: 10, max: 50, menu: 'style' }, //15.4
    // hemStyle: { dflt: 'curved', list: ['curved', 'straight'], menu: 'style' },
    //Darts
    backDarts: { bool: false, menu: 'darts' },
    backDartWidth: { pct: 75, min: 50, max: 100, menu: 'darts' },
    backDartPlacement: { pct: 50, min: 40, max: 60, menu: 'darts' },
    backDartLength: { pct: 80, min: 50, max: 90, menu: 'darts' },
    //Construction
    armholeSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Shaun
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    hemWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Shaun
    backOnFold: { bool: true, menu: 'construction' },
    //Advanced
    backTopCurve: { pct: 54.8, min: 50, max: 60, menu: 'advanced.style' }, // 45.2, 40, 50
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
    const skirtWidth = measurements.waistToSeat * options.skirtWidth
    const backBoxPleatWidth = measurements.chest * options.backBoxPleatWidth
    //let's begin
    //hem
    points.cHemAnchor = points.cWaist.shift(-90, shirtLength)
    points.sideHemAnchor = new Point(points.armhole.x, points.cHemAnchor.y)
    if (options.fitSide || hemDiff <= 0) {
      points.sideHem = points.sideHemAnchor.shift(180, hemDiff)
    } else {
      points.sideHem = points.sideHemAnchor
    }
    points.sideWaistCp1 = new Point(points.sideWaist.x, (points.sideWaist.y + points.sideHem.y) / 2)
    points.sideHemCp1Anchor = new Point(
      points.sideHem.x * (1 - options.skirtCurve),
      points.sideHem.y
    )

    points.sideHemCp1 = utils.beamsIntersect(
      points.sideHem,
      points.sideWaistCp1.rotate(90, points.sideHem),
      points.sideHemCp1Anchor,
      points.sideHemCp1Anchor.shift(-90, 1)
    )

    points.cHemMin = new Point(points.cbNeck.x, points.sideHemCp1.y)
    points.cHem = points.cHemMin.shift(-90, skirtWidth)
    points.cHemCp2 = new Point(points.sideHem.x / 2, points.cHem.y)

    if (skirtWidth == 0 && options.skirtCurve == 0.5) {
      points.sideHemCp1 = points.sideHem.shiftFractionTowards(points.sideHemCp1, 0.8)
      points.cHemCp2 = points.cHem.shiftFractionTowards(points.cHemCp2, 0.8)
    }

    //yoke
    if (options.yokeBack) {
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
      if (points.armholePitch.x < points.sideWaist.x) {
        points.dartAnchor = new Point(points.armholePitch.x, points.cWaist.y)
      } else {
        points.dartAnchor = points.sideWaist
      }
      points.dartMid = points.dartAnchor.shiftFractionTowards(
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

    paths.hemBase = new Path()
      .move(drawSeamLeft().end())
      .line(points.cHem)
      .curve(points.cHemCp2, points.sideHemCp1, points.sideHem)
      .hide()

    paths.sideSeam = new Path()
      .move(points.sideHem)
      ._curve(points.sideWaistCp1, points.sideWaist)
      .curve_(points.sideWaistCp2, points.armhole)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
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

    paths.seam = paths.hemBase
      .join(paths.sideSeam)
      .join(drawArmhole())
      .join(drawSaTop())
      .join(drawSeamLeft())
      .close()

    //guides
    // paths.byronGuide = new Path()
    // .move(points.cWaist)
    // .line(points.sideWaist)
    // .curve_(points.sideWaistCp2, points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // ._curve(points.cbNeckCp1, points.cbNeck)
    // .line(points.cWaist)
    // .close()
    // .attr('class', 'various dashed')

    // paths.seamLeftGuide = drawSeamLeft()
    // paths.armholeGuide = drawArmhole().unhide()
    // paths.seamTopGuide = drawSaTop()

    if (complete) {
      //grainline
      let cbSa
      if (options.backOnFold) {
        cbSa = 0
        points.cutOnFoldFrom = drawSeamLeft().start()
        points.cutOnFoldTo = drawSeamLeft().end()
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        cbSa = sa
        points.grainlineFrom = new Point(points.cbNeckCp1.x / 2, drawSeamLeft().start().y)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }

      //notches
      snippets.sideWaist = new Snippet('notch', points.sideWaist)
      if (
        !options.yokeBack ||
        (options.yokeBack && points.armholePitch.y > (points.yokeBack.y && points.backTopRight.y))
      ) {
        snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
      }
      if (options.yokeBack) {
        snippets.backTopCurveEnd = new Snippet('notch', points.backTopCurveEnd)
      }
      if (options.backDarts) {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['dartLeft', 'dartRight'],
        })
      }
      //title
      points.title = new Point(
        points.armholePitchCp1.x / 3,
        (points.armholePitchCp1.y + points.armhole.y) / 2
      )
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Back',
        scale: 2 / 3,
      })
      //foldline
      if (options.backBoxPleat && options.yokeBack) {
        paths.cb = new Path()
          .move(points.cbYoke)
          .line(points.cHem)
          .attr('class', 'mark help')
          .attr('data-text', 'Centre Back')
          .attr('data-text-class', 'center')
      }

      if (sa) {
        paths.saArmhole = new Path()
          .move(points.saArmhole)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .hide()
        if (options.yokeBack) {
          let saArmholeIntersect = utils.lineIntersectsCurve(
            points.backTopCurveCp1,
            points.backTopCurveCp1.shiftOutwards(points.backTopRight, shirtLength),
            points.saArmholePitch,
            points.saArmholePitchCp2,
            points.saShoulder,
            points.saShoulder
          )

          if (saArmholeIntersect) {
            points.saArmholeSplit = saArmholeIntersect
          } else {
            points.saArmholeSplit = utils.lineIntersectsCurve(
              points.backTopCurveCp1,
              points.backTopCurveCp1.shiftOutwards(points.backTopRight, shirtLength),
              points.saArmhole,
              points.saArmholeCp2,
              points.saArmholePitchCp1,
              points.saArmholePitch
            )
          }
        }
        const drawSaArmhole = () => {
          if (options.yokeBack) {
            return paths.saArmhole.split(points.saArmholeSplit)[0]
          } else {
            return paths.saArmhole
          }
        }

        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .join(paths.sideSeam.offset(sa * options.sideSeamSaWidth * 100))
          .join(drawSaArmhole())
          .join(drawSaTop().offset(sa))
          .join(drawSeamLeft().offset(cbSa))
          .attr('class', 'fabric sa')
          .close()
      }
    }
    return part
  },
}
