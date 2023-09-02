import { back as backDaisy } from '@freesewing/daisy'
import { front } from './front.mjs'

export const back = {
  name: 'aimee.back',
  from: backDaisy,
  after: front,
  hide: {
    from: true,
    inherited: true,
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
  }) => {
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    //measures
    const shoulderRise = store.get('shoulderRise')
    const shoulderTop = store.get('shoulderTop')
    const wrist = store.get('wrist')
    const armholeDrop = store.get('armholeDrop')
    const shoulderWidth = store.get('shoulderWidth')
    const underArmSleeveLength = store.get('underArmSleeveLength')
    const underArmLength = store.get('underArmLength')
    const underArmCurveLength = store.get('underArmCurveLength')

    //let's begin
    //shoudler top
    points.shoulderRise = points.armholePitchCp2.shiftOutwards(points.shoulder, shoulderRise)
    points.wristTop = points.hps.shiftTowards(points.shoulderRise, shoulderTop)

    points.armholeDrop = points.armhole.shiftTowards(points.waistSide, armholeDrop)
    points.wristBottomInitial = points.wristTop
      .shiftTowards(points.hps, wrist / 2)
      .rotate(90, points.wristTop)

    //let's try and make a curve
    points.bodiceSleeveTop = points.hps.shiftTowards(points.wristTop, shoulderWidth)
    points.bodiceSleeveBottom = utils.beamsIntersect(
      points.armholeDrop,
      points.armholeDrop.shift(points.hps.angle(points.shoulderRise), 1),
      points.bodiceSleeveTop,
      points.hps.rotate(90, points.bodiceSleeveTop)
    )

    if (options.fitSleeves) {
      points.wristBottom = points.wristBottomInitial
    } else {
      points.wristBottom = utils.beamsIntersect(
        points.bodiceSleeveBottom,
        points.bodiceSleeveBottom.shift(points.hps.angle(points.wristTop), 1),
        points.wristTop,
        points.hps.rotate(90, points.wristTop)
      )
    }

    //underarm curve and side
    if (options.fullSleeves) {
      points.underArmCpInitial = utils.beamsIntersect(
        points.armhole,
        points.waistSide,
        points.wristBottom,
        points.bodiceSleeveBottom
      )
      points.underArmCurveEnd = points.wristBottom.shiftTowards(
        points.bodiceSleeveBottom,
        underArmLength
      )
    } else {
      points.underArmCpInitial = utils.beamsIntersect(
        points.armhole,
        points.waistSide,
        points.bodiceSleeveBottom,
        points.bodiceSleeveTop.rotate(90, points.bodiceSleeveBottom)
      )
      points.underArmCurveEnd = points.bodiceSleeveBottom
    }

    points.underArmCurveStartInitial = points.underArmCpInitial.shiftTowards(
      points.waistSide,
      underArmSleeveLength * options.underArmCurve
    )

    let tweak = 1
    let target = underArmCurveLength
    let delta
    do {
      points.underArmCp = points.underArmCurveEnd.shiftTowards(
        points.underArmCpInitial,
        points.underArmCurveEnd.dist(points.underArmCurveStartInitial) * tweak
      )
      points.underArmCurveStart = utils.beamsIntersect(
        points.underArmCp,
        points.underArmCp.shift(points.armhole.angle(points.waistSide), 1),
        points.underArmCurveStartInitial,
        points.underArmCurveStartInitial.shift(0, 1)
      )

      paths.underArmCurve = new Path()
        .move(points.underArmCurveStart)
        .curve_(points.underArmCp, points.underArmCurveEnd)
        .hide()

      delta = paths.underArmCurve.length() - target
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    points.sideWaist = utils.beamsIntersect(
      points.underArmCurveStart,
      points.underArmCurveStart.shift(points.armhole.angle(points.waistSide), 1),
      points.waistSide,
      points.waistSide.shift(0, 1)
    )
    points.dartBottomRight = points.dartBottomRight.shift(
      0,
      points.waistSide.dist(points.sideWaist)
    )
    points.dartRightCp = new Point(points.dartBottomRight.x, points.dartLeftCp.y)
    points.dartBottomCenter = points.dartBottomLeft.shiftFractionTowards(
      points.dartBottomRight,
      0.5
    )
    points.dartTip = new Point(points.dartBottomCenter.x, points.dartTip.y)

    //resetting bust points of dart not sure if 100 needed but maybe in a future pattern
    if (!points.bustSide) log.error('Could not find bust height in side seam of back part')
    if (points.bustCenter.y < points.dartTip.y) {
      points.bustDartLeft = points.bustCenter.clone()
      points.bustDartLeft.x = points.dartTip.x
    } else {
      points.bustDartLeft = utils.curveIntersectsY(
        points.dartBottomLeft,
        points.dartLeftCp,
        points.dartTip,
        points.dartTip,
        measurements.hpsToBust
      )
    }
    if (!points.bustDartLeft) log.error('Could not find bust height in back dart')
    points.bustDartRight = points.bustDartLeft.flipX(points.dartTip)
    //guides
    // paths.bellaGuide = new Path()
    // .move(points.cbNeck)
    // .curve_(points.cbNeckCp2, points.waistCenter)
    // .line(points.dartBottomLeft)
    // .curve_(points.dartLeftCp, points.dartTip)
    // ._curve(points.dartRightCp, points.dartBottomRight)
    // .line(points.waistSide)
    // .curve_(points.waistSideCp2, points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // ._curve(points.cbNeckCp1, points.cbNeck)
    // .close()
    // .attr('class', 'various lashed')

    // paths.armscaffold = new Path()
    // .move(points.armholeDrop)
    // .line(points.wristBottom)
    // .line(points.wristTop)
    // .line(points.hps)

    // paths.side = new Path()
    // .move(points.dartBottomRight)
    // .line(points.sideWaist)
    // .line(points.underArmCurveStart)
    // .curve_(points.underArmCp, points.underArmCurveEnd)
    // .line(points.wristBottom)

    //seam paths

    const drawArm = () => {
      if (options.fullSleeves)
        return new Path()
          .move(points.underArmCurveEnd)
          .line(points.wristBottom)
          .line(points.wristTop)
          .line(points.bodiceSleeveTop)
      else return new Path().move(points.underArmCurveEnd).line(points.bodiceSleeveTop)
    }

    paths.seam = new Path()
      .move(points.cbNeck)
      .curve_(points.cbNeckCp2, points.waistCenter)
      .line(points.dartBottomLeft)
      .curve_(points.dartLeftCp, points.dartTip)
      ._curve(points.dartRightCp, points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.underArmCurveStart)
      .curve_(points.underArmCp, points.underArmCurveEnd)
      .join(drawArm())
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .close()

    // Complete?
    if (complete) {
      //grainline
      points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.dartBottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['underArmCurveStart', 'underArmCurveEnd'],
      })

      //title
      points.title = new Point(points.cbNeckCp1.x, points.dartTip.y * (3 / 4))
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'back',
      })
      if (sa) {
        paths.sa = new Path()
          .move(points.cbNeck)
          .curve_(points.cbNeckCp2, points.waistCenter)
          .line(points.dartBottomLeft)
          .line(points.dartBottomRight)
          .line(points.sideWaist)
          .line(points.underArmCurveStart)
          .curve_(points.underArmCp, points.underArmCurveEnd)
          .join(drawArm())
          .line(points.hps)
          ._curve(points.cbNeckCp1, points.cbNeck)
          .offset(sa)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
