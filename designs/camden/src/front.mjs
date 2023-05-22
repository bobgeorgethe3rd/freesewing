import { front as frontDaisy } from '@freesewing/daisy'
import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const front = {
  name: 'camden.front',
  from: frontDaisy,
  hide: {
    from: true,
  },
  options: {
    //Constants
    waistDartLength: 1, //locked for Camden
    bustDartPlacement: 'side', //locked for Camden
    //Fit
    bellaGuide: { bool: false, menu: 'fit' },
    //Style
    armholeDrop: { pct: 25, min: 0, max: 75, menu: 'style' },
    shoulderPitch: { pct: 50, min: 30, max: 60, menu: 'style' },
    frontShoulderDepth: { pct: 80, min: 0, max: 100, menu: 'style' },
    frontNeckDepth: { pct: 60, min: 0, max: 100, menu: 'style' },
    frontNeckCurve: { pct: 50, min: 0, max: 100, menu: 'style' },
    frontNeckCurveDepth: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
    //Darts
    bustDartLength: { pct: 80, min: 60, max: 100, menu: 'darts' }, //altered for Camden
  },
  plugins: [pluginLogoRG],
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
    macro('scalebox', false)
    //measures
    const strapWidth = absoluteOptions.strapWidth

    //let's begin
    points.shoulderPitch = points.hps.shiftFractionTowards(points.shoulder, options.shoulderPitch)
    points.shoulderPitchMax = new Point(points.shoulderPitch.x, points.armholePitch.y)
    points.strapMid = points.shoulderPitch.shiftFractionTowards(
      points.shoulderPitchMax,
      options.frontShoulderDepth
    )
    points.strapLeft = points.strapMid.shift(180, strapWidth / 2)
    points.strapRight = points.strapLeft.rotate(180, points.strapMid)
    //neck
    points.cfArmholePitch = new Point(points.cfNeck.x, points.armholePitch.y)
    points.cfNeckNew = points.cfArmholePitch.shiftFractionTowards(
      points.cfBust,
      options.frontNeckDepth
    )
    points.cfNeckCp1NewTarget = utils.beamsIntersect(
      points.strapLeft,
      points.strapLeft.shift(-90, 1),
      points.cfNeckNew,
      points.cfNeckNew.shift(points.cfNeckNew.angle(points.strapLeft) * options.frontNeckCurve, 1)
    )
    points.cfNeckCp1New = points.cfNeckNew.shiftFractionTowards(
      points.cfNeckCp1NewTarget,
      options.frontNeckCurveDepth
    )
    points.armholeDrop = points.armhole.shiftFractionTowards(
      points.bustDartTop,
      options.armholeDrop
    )

    points.armholePitchCp1New = utils.beamsIntersect(
      points.strapRight,
      points.strapRight.shift(points.armholePitch.angle(points.armholePitchCp1), 1),
      points.armholePitchCp1,
      points.armholePitch.rotate(90, points.armholePitchCp1)
    )

    points.armholeCpTargetNew = utils.beamsIntersect(
      points.armholeDrop,
      points.armholeDrop.shift(points.armhole.angle(points.armholeCp2), 1),
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
        .move(points.cfWaist)
        .line(points.sideWaist)
        .line(points.bustDartBottom)
        ._curve(points.bustDartCpBottom, points.bustDartTip)
        .curve_(points.bustDartCpTop, points.bustDartTop)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .close()
        .attr('class', 'various lashed')
    }

    //paths
    paths.saBase = new Path()
      .move(points.bustDartBottom)
      ._curve(points.bustDartCpBottom, points.bustDartTip)
      .curve_(points.bustDartCpTop, points.bustDartTop)
      .line(points.armholeDrop)
      .curve(points.armholeCp2New, points.armholePitchCp1New, points.strapRight)
      .line(points.strapLeft)
      ._curve(points.cfNeckCp1New, points.cfNeckNew)

    //stores
    store.set('strapWidth', strapWidth)
    store.set(
      'sideLength',
      points.sideWaist.dist(points.bustDartBottom) + points.bustDartTop.dist(points.armholeDrop)
    )
    store.set('armholeCpAngle', points.armholePitch.angle(points.armholePitchCp1))

    return part
  },
}
