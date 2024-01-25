import { back as backDaisy } from '@freesewing/daisy'
import { frontBase } from './frontBase.mjs'

export const backBase = {
  name: 'petunia.backBase',
  from: backDaisy,
  after: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    cbPanelFullness: { pct: (2 / 45) * 100, min: 1.1, max: 25, menu: 'style' },
    //Advanced
    backNeckCurve: { pct: 100, min: 0, max: 100, menu: 'advanced.style' },
    backNeckCurveDepth: { pct: 100, min: 0, max: 100, menu: 'advanced.style' },
    backNeckDepth: { pct: 100, min: 50, max: 100, menu: 'advanced.style' },
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
  }) => {
    //remove paths & snippets
    const keepThese = 'seam'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daisyGuides) {
      paths.daisyGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    //measurements
    const sideSkirtLength = store.get('sideSkirtLength')
    //let's begin
    points.shoulderTop = points.shoulder.shiftFractionTowards(points.hps, options.shoulderWidth)
    points.cbNeck = points.cbNeck.shiftFractionTowards(
      utils.beamIntersectsX(
        points.shoulderTop,
        points.shoulderTop.shift(points.hps.angle(points.cbNeck), 1),
        points.cbNeck.x
      ),
      options.backNeckDepth
    )

    points.cbNeckCp1 = points.cbNeck.shiftFractionTowards(
      utils.beamsIntersect(
        points.cbNeck,
        points.cbNeck.shift(
          points.cbNeck.angle(points.shoulderTop) * (1 - options.backNeckCurve),
          1
        ),
        points.shoulderTop,
        points.hps.rotate(90, points.shoulderTop)
      ),
      options.backNeckCurveDepth
    )

    points.shoulderMid = points.shoulder.shiftFractionTowards(points.shoulderTop, 0.5)

    //side kirt
    points.cbSkirtOrigin = utils.beamIntersectsX(
      points.dartBottomLeft,
      points.dartBottomLeft.shift(270 + 90 * options.skirtFullness * options.cbPanelFullness, 1),
      points.cbWaist.x
    )

    const cbSkirtAngle = points.cbSkirtOrigin.angle(points.dartBottomLeft) - 270

    const sideSkirtAngle = 90 * options.skirtFullness - cbSkirtAngle
    points.sideSkirtOrigin = utils.beamsIntersect(
      points.dartBottomRight,
      points.sideWaist.rotate(90 - sideSkirtAngle / 2, points.dartBottomRight),
      points.sideWaist,
      points.dartBottomRight.rotate(-90 + sideSkirtAngle / 2, points.sideWaist)
    )

    let sideTweak = 1
    let sideDelta
    do {
      points.sideHemRight = points.sideSkirtOrigin.shiftOutwards(
        points.sideWaist,
        sideSkirtLength * sideTweak
      )
      // points.sideCurveEnd = points.sideWaist.shiftFractionTowards(points.armhole, 1)
      points.sideCurveRight = points.sideWaist.shiftFractionTowards(points.sideHemRight, 0.5)

      sideDelta =
        new Path()
          .move(points.sideHemRight)
          .line(points.sideCurveRight)
          .curve(points.sideWaist, points.sideWaist, points.armhole)
          .length() -
        sideSkirtLength -
        points.armhole.dist(points.sideWaist)
      if (sideDelta > 0) sideTweak = sideTweak * 0.99
      else sideTweak = sideTweak * 1.01
    } while (Math.abs(sideDelta) > 0.01)

    points.sideHemLeft = points.sideSkirtOrigin.shiftTowards(
      points.dartBottomRight,
      points.sideSkirtOrigin.dist(points.sideHemRight)
    )
    points.sideCurveLeft = points.dartBottomRight.shiftFractionTowards(points.sideHemLeft, 0.5)

    const sideSkirtRadius = points.sideSkirtOrigin.dist(points.sideHemRight)
    const sideSkirtAngleT =
      points.sideSkirtOrigin.angle(points.sideHemRight) -
      points.sideSkirtOrigin.angle(points.sideHemLeft)
    const sideSkirtCpDistance =
      (4 / 3) * sideSkirtRadius * Math.tan(utils.deg2rad(sideSkirtAngleT / 4))

    points.sideHemLeftCp2 = points.sideHemLeft
      .shiftTowards(points.sideSkirtOrigin, sideSkirtCpDistance)
      .rotate(-90, points.sideHemLeft)
    points.sideHemRightCp1 = points.sideHemRight
      .shiftTowards(points.sideSkirtOrigin, sideSkirtCpDistance)
      .rotate(90, points.sideHemRight)

    //cb skirt
    let cbTweak = 1
    let cbDelta
    do {
      points.cbHemRight = points.cbSkirtOrigin.shiftOutwards(
        points.dartBottomLeft,
        points.dartBottomRight.dist(points.sideHemLeft) * cbTweak
      )
      points.cbCurveRight = points.dartBottomLeft.shiftFractionTowards(points.cbHemRight, 0.5)
      cbDelta =
        new Path()
          .move(points.cbHemRight)
          .line(points.cbCurveRight)
          .curve(points.dartBottomLeft, points.dartBottomLeft, points.dartTip)
          .length() -
        new Path()
          .move(points.dartTip)
          .curve(points.dartBottomRight, points.dartBottomRight, points.sideCurveLeft)
          .line(points.sideHemLeft)
          .length()
      if (cbDelta > 0) cbTweak = cbTweak * 0.99
      else cbTweak = cbTweak * 1.01
    } while (Math.abs(cbDelta) > 0.1)

    const cbSkirtRadius = points.cbSkirtOrigin.dist(points.cbHemRight)
    const cbSkirtCpDistance = (4 / 3) * cbSkirtRadius * Math.tan(utils.deg2rad(cbSkirtAngle / 4))

    points.cbHem = points.cbSkirtOrigin.shift(-90, cbSkirtRadius)
    points.cbHemCp2 = points.cbHem
      .shiftTowards(points.cbSkirtOrigin, cbSkirtCpDistance)
      .rotate(-90, points.cbHem)
    points.cbHemRightCp1 = points.cbHemRight
      .shiftTowards(points.cbSkirtOrigin, cbSkirtCpDistance)
      .rotate(90, points.cbHemRight)

    //top
    points.dartTipCp1 = utils.beamsIntersect(
      points.dartBottomRight,
      points.dartTip,
      points.shoulderMid,
      points.hps.rotate(90, points.shoulderMid)
    )

    points.dartTipCp2 = utils.beamsIntersect(
      points.dartBottomLeft,
      points.dartTip,
      points.shoulderMid,
      points.hps.rotate(90, points.shoulderMid)
    )

    //guides
    paths.cbNeck = new Path().move(points.shoulderTop)._curve(points.cbNeckCp1, points.cbNeck)

    paths.sideBack = new Path()
      .move(points.shoulderMid)
      ._curve(points.dartTipCp1, points.dartTip)
      .curve(points.dartBottomRight, points.dartBottomRight, points.sideCurveLeft)
      .line(points.sideHemLeft)
      .curve(points.sideHemLeftCp2, points.sideHemRightCp1, points.sideHemRight)
      .line(points.sideCurveRight)
      .curve(points.sideWaist, points.sideWaist, points.armhole)

    paths.cb = new Path()
      .move(points.cbNeck)
      .line(points.cbHem)
      .curve(points.cbHemCp2, points.cbHemRightCp1, points.cbHemRight)
      .line(points.cbCurveRight)
      .curve(points.dartBottomLeft, points.dartBottomLeft, points.dartTip)
      .curve_(points.dartTipCp2, points.shoulderMid)

    return part
  },
}
