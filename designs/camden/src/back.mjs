import { back as backDaisy } from '@freesewing/daisy'
import { pctBasedOn } from '@freesewing/core'
import { front } from './front.mjs'

export const back = {
  name: 'camden.back',
  from: backDaisy,
  after: front,
  hide: {
    from: true,
  },
  options: {
    //Style
    backShoulderDepth: { pct: 80, min: 0, max: 100, menu: 'style' },
    backNeckDepth: { pct: 65, min: 0, max: 100, menu: 'style' },
    backNeckCurve: { pct: 50, min: 0, max: 100, menu: 'style' },
    backNeckCurveDepth: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
    strapWidth: {
      pct: 2.4,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
    //Advanced
    bellaGuide: { bool: false, menu: 'advanced.fit' },
  },
  measurements: [],
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
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    //measures
    const sideLength = store.get('sideLength')
    const strapWidth = store.get('strapWidth')
    const armholeCpAngle = store.get('armholeCpAngle')

    //let's begin
    points.shoulderPitch = points.hps.shiftFractionTowards(points.shoulder, options.shoulderPitch)
    points.shoulderPitchMax = new Point(points.shoulderPitch.x, points.armholePitch.y)
    points.strapMid = points.shoulderPitch.shiftFractionTowards(
      points.shoulderPitchMax,
      options.backShoulderDepth
    )
    points.strapLeft = points.strapMid.shift(180, strapWidth / 2)
    points.strapRight = points.strapLeft.rotate(180, points.strapMid)
    points.cbArmholePitch = new Point(points.cbNeck.x, points.armholePitch.y)
    points.cbBust = new Point(points.cbNeck.x, points.bustCenter.y)
    points.cbNeckNew = points.cbArmholePitch.shiftFractionTowards(
      points.cbBust,
      options.backNeckDepth
    )
    points.cbNeckCp1NewTarget = utils.beamsIntersect(
      points.strapLeft,
      points.strapLeft.shift(-90, 1),
      points.cbNeckNew,
      points.cbNeckNew.shift(points.cbNeckNew.angle(points.strapLeft) * options.backNeckCurve, 1)
    )
    points.cbNeckCp1New = points.cbNeckNew.shiftFractionTowards(
      points.cbNeckCp1NewTarget,
      options.backNeckCurveDepth
    )

    paths.side = new Path()
      .move(points.waistSide)
      .curve_(points.waistSideCp2, points.armhole)
      .hide()

    points.armholeDrop = paths.side.shiftAlong(sideLength)
    points.armholeDropTarget = paths.side
      .shiftAlong(sideLength * 0.999)
      .rotate(-90, points.armholeDrop)

    points.armholePitchCp1New = utils.beamsIntersect(
      points.strapRight,
      points.strapRight.shift(armholeCpAngle, 1),
      points.armholePitchCp1,
      points.armholePitch.rotate(90, points.armholePitchCp1)
    )

    points.armholeCpTargetNew = utils.beamsIntersect(
      points.armholeDrop,
      points.armholeDropTarget,
      points.strapRight,
      points.strapRight.shift(-90, 1)
    )
    points.armholeCp2New = points.armholeDrop.shiftFractionTowards(
      points.armholeCpTargetNew,
      options.frontArmholeCurvature
    )

    //guides
    if (options.bellaGuide) {
      paths.bellaGuide = new Path()
        .move(points.cbWaist)
        .line(points.waistSide)
        .curve_(points.waistSideCp2, points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        ._curve(points.cbNeckCp1, points.cbNeck)
        .line(points.cbWaist)
        .close()
        .attr('class', 'various lashed')
    }
    //paths

    paths.saBase = paths.side
      .split(points.armholeDrop)[0]
      .move(points.armholeDrop)
      .curve(points.armholeCp2New, points.armholePitchCp1New, points.strapRight)
      .line(points.strapLeft)
      ._curve(points.cbNeckCp1New, points.cbNeckNew)

    return part
  },
}
