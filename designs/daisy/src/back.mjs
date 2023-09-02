import { sharedBase } from './sharedBase.mjs'
import { frontBase } from './frontBase.mjs'

export const back = {
  name: 'daisy.back',
  from: sharedBase,
  after: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Constants
    neckSaWidth: 0.01,
    cbSaWidth: 0.01,
    shoulderSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    //Armhole
    backArmholePitchWidth: { pct: 97, min: 95, max: 98.5, menu: 'armhole' },
    backArmholeDepth: { pct: 55.2, min: 45, max: 65, menu: 'armhole' },
    backArmholePitchDepth: { pct: 50, min: 45, max: 65, menu: 'armhole' },
  },
  measurements: ['bustFront', 'chest'],
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
    //measures
    const chestBack = (measurements.chest - measurements.bustFront) * (1 + options.chestEase)
    const waistToArmhole = store.get('waistToArmhole')
    const waistBack = measurements.waistBack * (1 + options.waistEase)
    //let's begin
    // points.cbArmhole = points.origin.shift(-90, measurements.hpsToWaistBack - waistToArmhole)
    points.armhole = points.cArmhole.shift(0, chestBack / 2)
    points.cbWaist = points.origin.shift(-90, measurements.hpsToWaistBack)
    points.sideWaistAnchor = new Point(points.armhole.x, points.cbWaist.y)
    //dart
    const waistDiff = points.armhole.x - waistBack / 2

    if (waistDiff < 0) {
      points.sideWaist = points.sideWaistAnchor.shift(180, waistDiff * 2)
      points.dartTip = points.cArmhole.shiftFractionTowards(points.armhole, 0.5)
      points.dartBottomMid = new Point(points.dartTip.x, points.cbWaist.y)
      points.dartBottomLeft = points.dartBottomMid.shift(180, waistDiff / -2)
      points.dartBottomRight = points.dartBottomLeft.flipX(points.dartBottomMid)
    } else {
      points.sideWaist = points.armhole.shiftTowards(
        points.sideWaistAnchor.shift(180, waistDiff / 3),
        waistToArmhole
      )
      points.dartTip = points.cArmhole.shift(0, points.sideWaist.x / 2)
      points.dartBottomMid = new Point(points.dartTip.x, points.cbWaist.y)
      points.dartBottomLeft = points.dartBottomMid.shift(180, waistDiff / 3)
      points.dartBottomRight = points.dartBottomLeft.flipX(points.dartBottomMid)
    }
    points.dartBottomEdge = utils.beamsIntersect(
      points.dartBottomLeft,
      points.dartTip.rotate(-90, points.dartBottomLeft),
      points.dartTip,
      points.dartBottomMid
    )

    //cbNeck
    points.cbNeckCp1 = utils.beamsIntersect(
      points.hps,
      points.shoulder.rotate((180 - (points.hps.angle(points.shoulder) - 270)) * -1, points.hps),
      points.cbNeck,
      points.cbNeck.shift(0, 1)
    )

    //armhole
    points.cArmholePitch = points.cbNeck.shiftFractionTowards(
      points.cArmhole,
      options.backArmholePitchDepth
    )
    points.armholePitch = points.cArmholePitch.shift(
      0,
      points.shoulder.x * options.backArmholePitchWidth
    )
    points.armholePitchCp2 = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    // points.armholeCpMax = utils.beamsIntersect(
    // points.armholePitchCp2,
    // points.armholePitch,
    // points.armhole,
    // points.sideWaist.rotate(-90, points.armhole)
    // )
    points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
      /* points.armholeCpMax, // */ new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )
    points.armholeCp2 = points.armhole.shiftFractionTowards(
      /* points.armholeCpMax, // */ new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )

    //paths
    paths.hemLeft = new Path().move(points.cbWaist).line(points.dartBottomLeft).hide()

    paths.dart = new Path()
      .move(points.dartBottomLeft)
      .line(points.dartTip)
      .line(points.dartBottomRight)
      .hide()

    paths.hemRight = new Path().move(points.dartBottomRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armhole).hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.cb = new Path().move(points.cbNeck).line(points.cbWaist).hide()

    paths.seam = paths.hemLeft
      .clone()
      .join(paths.dart)
      .join(paths.hemRight)
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.shoulder)
      .join(paths.cbNeck)
      .join(paths.cb)

    //stores
    store.set('scyeBackWidth', points.armhole.dist(points.shoulder))
    store.set(
      'scyeBackDepth',
      points.armhole.dist(points.shoulder) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.shoulder) - (points.shoulder.angle(points.hps) - 90)
          )
        )
    )
    store.set(
      'backArmholeLength',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .length()
    )
    store.set(
      'backArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .length()
    )

    if (complete) {
      //grainline
      points.grainlineTo = points.cbWaist.shiftFractionTowards(points.dartBottomLeft, 0.15)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.cbNeck.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
      //title
      points.title = new Point(points.hps.x, points.armholePitch.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'back',
        scale: 0.5,
      })

      //dart
      paths.dartEdge = new Path()
        .move(points.dartBottomLeft)
        .line(points.dartBottomEdge)
        .line(points.dartBottomRight)
        .attr('class', 'fabric help')

      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        points.saArmhole = new Point(
          points.armhole.shift(45, armholeSa).x,
          points.armhole.y - armholeSa
        )
        points.saArmholeCp2 = new Point(
          points.armholeCp2.shift(45, armholeSa).x,
          points.armholeCp2.y - armholeSa
        )
        points.saArmholePitch = points.armholePitch.shift(0, armholeSa)
        points.saArmholePitchCp1 = utils.beamsIntersect(
          points.saArmholePitch,
          points.armholePitch.rotate(-90, points.saArmholePitch),
          points.armholePitchCp1,
          points.armholePitchCp1.shift(45, 1)
        )
        points.saArmholePitchCp2 = utils.beamsIntersect(
          points.armholePitchCp2,
          points.shoulder.rotate(-90, points.armholePitchCp2),
          points.saArmholePitchCp1,
          points.saArmholePitch
        )
        points.saShoulder = points.hps.shiftOutwards(points.shoulder, armholeSa)

        paths.saArmhole = new Path()
          .move(points.saArmhole)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .hide()

        points.saPoint0 = utils.beamsIntersect(
          points.dartTip,
          points.dartBottomMid,
          points.dartBottomLeft
            .shiftTowards(points.dartBottomEdge, sideSeamSa)
            .rotate(-90, points.dartBottomLeft),
          points.dartBottomEdge
            .shiftTowards(points.dartBottomLeft, sideSeamSa)
            .rotate(90, points.dartBottomEdge)
        )

        points.saPoint1 = utils.beamsIntersect(
          points.sideWaist.shiftTowards(points.armhole, sideSeamSa).rotate(-90, points.sideWaist),
          points.armhole.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armhole),
          points.sideWaist.shiftTowards(points.dartBottomRight, sa).rotate(90, points.sideWaist),
          points.dartBottomRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.dartBottomRight)
        )
        points.saPoint2 = utils.beamsIntersect(
          points.sideWaist.shiftTowards(points.armhole, sideSeamSa).rotate(-90, points.sideWaist),
          points.armhole.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armhole),
          points.saArmholeCp2,
          points.saArmhole
        )

        points.saPoint3 = points.shoulder
          .shift(points.armholePitchCp2.angle(points.shoulder) - 90, armholeSa)
          .shift(points.armholePitchCp2.angle(points.shoulder), shoulderSa)

        points.saPoint4 = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saPoint3,
          points.saPoint3.shift(points.shoulder.angle(points.hps), 1)
        )

        points.saPoint5 = paths.cbNeck.offset(neckSa).end().shift(180, cbSa)
        points.saPoint6 = new Point(points.saPoint5.x, paths.hemLeft.offset(sa).start().y)

        paths.sa = paths.hemLeft
          .offset(sa)
          .line(points.saPoint0)
          .line(paths.hemRight.offset(sa).start())
          .join(paths.hemRight.offset(sa))
          .line(points.saPoint1)
          .line(points.saPoint2)
          .line(points.saArmhole)
          .join(paths.saArmhole)
          .line(points.saPoint3)
          .line(points.saPoint4)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saPoint5)
          .line(points.saPoint6)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
