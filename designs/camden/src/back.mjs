import { back as backDaisy } from '@freesewing/daisy'
import { sharedFront } from './sharedFront.mjs'

export const back = {
  name: 'camden.back',
  from: backDaisy,
  after: sharedFront,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    backNeckDepth: { pct: 65, min: 0, max: 100, menu: 'style' },
    backNeckCurve: { pct: 50, min: 0, max: 100, menu: 'style' },
    backNeckCurveDepth: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
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
    //macros
    macro('title', false)
    //guide
    if (options.daisyGuide) {
      paths.daisyGuide = new Path()
        .move(points.cbWaist)
        .line(points.dartBottomLeft)
        .line(points.dartTip)
        .line(points.dartBottomRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        ._curve(points.cbNeckCp1, points.cbNeck)
        .line(points.cbWaist)
        .attr('class', 'various lashed')
    }
    //measures
    const strapWidth = store.get('strapWidth')
    const sideAngle = store.get('sideAngle')
    const length = store.get('length')
    //let's begin
    //strap placement
    points.shoulderPitch = points.hps.shiftFractionTowards(points.shoulder, options.shoulderPitch)
    points.shoulderPitchMax = new Point(points.shoulderPitch.x, points.armholePitch.y)
    points.strapMid = points.shoulderPitch.shiftFractionTowards(
      points.shoulderPitchMax,
      options.backShoulderDepth
    )
    if (options.frontShoulderDepth == 0 && options.backShoulderDepth == 0) {
      points.strapLeft = points.strapMid.shiftTowards(points.hps, strapWidth / 2)
    } else {
      points.strapLeft = points.strapMid.shift(180, strapWidth / 2)
    }
    points.strapRight = points.strapLeft.rotate(180, points.strapMid)
    //neck
    if (points.strapLeft.y > points.cbNeck.y) {
      points.cbTopMin = new Point(points.cbNeck.x, points.strapLeft.y)
    } else {
      points.cbTopMin = points.cbNeck
    }
    points.cbTop = points.cbTopMin.shiftFractionTowards(points.cArmhole, options.backNeckDepth)
    points.cbTopCp1Target = utils.beamsIntersect(
      points.strapLeft,
      points.strapLeft.shift(-90, 1),
      points.cbTop,
      points.cbTop.shift(points.cbTop.angle(points.strapLeft) * options.backNeckCurve, 1)
    )
    points.cbTopCp1 = points.cbTop.shiftFractionTowards(
      points.cbTopCp1Target,
      options.backNeckCurveDepth
    )
    //armhole
    points.armholeDrop = points.armhole.shiftTowards(points.sideWaist, store.get('armholeDrop'))
    points.strapRightCp1 = utils.beamsIntersect(
      points.strapRight,
      points.strapRight.shift(points.armholePitch.angle(points.armholePitchCp1), 1),
      points.armholePitchCp1,
      points.armholePitch.rotate(90, points.armholePitchCp1)
    )
    points.armholeDropCp2Target = utils.beamsIntersect(
      points.armholeDrop,
      points.armholeDrop.shift(points.armhole.angle(points.armholeCp2), 1),
      points.strapRight,
      points.strapRight.shift(-90, 1)
    )
    points.armholeDropCp2 = points.armholeDrop.shiftFractionTowards(
      points.armholeDropCp2Target,
      options.backArmholeDepth
    )
    //hem
    points.sideHem = points.sideWaist.shift(270 + sideAngle, length)
    points.sideHemCp1 = utils.beamsIntersect(
      points.sideHem,
      points.sideHem.shift(180 + sideAngle, 1),
      new Point(points.sideHem.x / 2, points.sideHem.y),
      new Point(points.sideHem.x / 2, points.sideHem.y * 1.1)
    )
    points.cbHem = utils.beamsIntersect(
      points.cbTop,
      points.cbWaist,
      points.sideHemCp1,
      points.sideHemCp1.shift(180, 1)
    )

    //sideseam
    points.sideSeamCurveEnd = points.armholeDrop.shiftTowards(
      points.sideWaist,
      store.get('bodiceFacingWidth')
    )
    points.sideHemCp2 = points.sideHem.shiftFractionTowards(
      points.sideWaist,
      options.length * options.sideCurve
    )
    points.sideSeamCurveCp1 = points.sideSeamCurveEnd.shiftFractionTowards(
      points.sideWaist,
      options.length * options.sideCurve
    )

    //paths
    paths.hemBase = new Path().move(points.cbHem).curve_(points.sideHemCp1, points.sideHem).hide()

    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.sideSeamCurveCp1, points.sideSeamCurveEnd)
      .line(points.armholeDrop)
      .hide()

    paths.necklineRight = new Path()
      .move(points.armholeDrop)
      .curve(points.armholeDropCp2, points.strapRightCp1, points.strapRight)
      .hide()

    paths.strap = new Path().move(points.strapRight).line(points.strapLeft).hide()

    paths.necklineLeft = new Path()
      .move(points.strapLeft)
      ._curve(points.cbTopCp1, points.cbTop)
      .hide()

    paths.cb = new Path().move(points.cbTop).line(points.cbHem).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.necklineRight)
      .join(paths.strap)
      .join(paths.necklineLeft)
      .join(paths.cb)
      .close()

    //stores
    store.set(
      'strapLength',
      store.get('strapFrontLength') + points.shoulderPitch.dist(points.strapMid)
    )

    if (complete) {
      //grainline
      if (options.cbSaWidth > 0) {
        points.grainlineFrom = new Point(points.cbNeckCp1.x / 3, points.cbTop.y)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      } else {
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //notches
      snippets.strapMid = new Snippet('bnotch', points.strapMid)
      if (points.cbTop.y < points.cArmhole.y) {
        snippets.cArmhole = new Snippet('bnotch', points.cArmhole)
      }
      //title
      points.title = new Point(points.dartTip.x * 0.55, points.armholeDrop.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Back',
        scale: 2 / 3,
      })
      if (sa) {
        const cbSa = sa * options.cbSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const hemSa = sa * options.hemWidth * 100

        let necklineSa
        if (options.bodiceFacings) {
          necklineSa = sa
        } else {
          necklineSa = sa * options.necklineSaWidth * 100
        }

        if (options.length == 0) {
          points.saPoint0 = utils.beamsIntersect(
            points.sideHemCp1.shiftTowards(points.sideHem, hemSa).rotate(-90, points.sideHemCp1),
            points.sideHem.shiftTowards(points.sideHemCp1, hemSa).rotate(90, points.sideHem),
            points.sideHem.shiftTowards(points.armholeDrop, sideSeamSa).rotate(-90, points.sideHem),
            points.armholeDrop
              .shiftTowards(points.sideHem, sideSeamSa)
              .rotate(90, points.armholeDrop)
          )
        } else {
          points.saPoint0 = utils.beamsIntersect(
            points.sideHemCp1.shiftTowards(points.sideHem, hemSa).rotate(-90, points.sideHemCp1),
            points.sideHem.shiftTowards(points.sideHemCp1, hemSa).rotate(90, points.sideHem),
            points.sideHem.shiftTowards(points.sideHemCp2, sideSeamSa).rotate(-90, points.sideHem),
            points.sideHemCp2.shiftTowards(points.sideHem, sideSeamSa).rotate(90, points.sideHemCp2)
          )
        }

        points.saPoint1 = utils.beamsIntersect(
          points.sideWaist
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideWaist),
          points.armholeDrop
            .shiftTowards(points.sideWaist, sideSeamSa)
            .rotate(90, points.armholeDrop),
          points.armholeDrop
            .shiftTowards(points.armholeDropCp2, necklineSa)
            .rotate(-90, points.armholeDrop),
          points.armholeDropCp2
            .shiftTowards(points.armholeDrop, necklineSa)
            .rotate(90, points.armholeDropCp2)
        )

        points.saPoint2 = points.strapRight.translate(necklineSa, -sa)
        points.saPoint3Anchor = points.strapLeft.shift(90, sa)

        points.necklineRightStart = points.strapLeft
          .shiftTowards(points.cbTopCp1, necklineSa)
          .rotate(-90, points.strapLeft)

        if (
          points.cbTop.y == points.strapLeft.y ||
          points.necklineRightStart.y < points.saPoint3Anchor.y
        ) {
          points.saPoint3 = points.saPoint3Anchor
        } else {
          points.saPoint3 = utils.beamsIntersect(
            points.saPoint2,
            points.saPoint3Anchor,
            points.necklineRightStart,
            points.cbTopCp1.shiftTowards(points.strapLeft, necklineSa).rotate(90, points.cbTopCp1)
          )
          if (points.saPoint3.x > points.saPoint3Anchor.x) {
            points.saPoint3 = points.saPoint3Anchor
          }
        }

        points.saPoint4 = points.cbTop.shift(180, cbSa)
        points.saPoint5 = points.cbHem.translate(-cbSa, hemSa)

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saPoint0)
          .line(paths.sideSeam.offset(sideSeamSa).start())
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saPoint1)
          .line(paths.necklineRight.offset(necklineSa).start())
          .join(paths.necklineRight.offset(necklineSa))
          .line(points.saPoint2)
          .line(paths.strap.offset(sa).start())
          .join(paths.strap.offset(sa))
          .line(points.saPoint3)
          .line(paths.necklineLeft.offset(necklineSa).start())
          .join(paths.necklineLeft.offset(necklineSa))
          .line(points.saPoint4)
          .line(points.saPoint5)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
