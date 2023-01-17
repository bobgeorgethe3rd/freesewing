import { front as frontDaisy } from '@freesewing/daisy'

export const frontBase = {
  name: 'frontBase',
  from: frontDaisy,
  hideDependencies: true,
  measurements: ['shoulderToWrist', 'wrist'],
  options: {
    //Fit
    wristEase: { pct: 10, min: 0, max: 20, menu: 'fit' },
    //Style
    fitSleeves: { bool: true, menu: 'style' },
    sleeveLengthBonus: { pct: 0, min: -10, max: 20, menu: 'style' },
    armholeDrop: { pct: 12.4, min: 10, max: 15, menu: 'style' },
    underArmSleeveLength: { pct: 6.4, min: 6, max: 8, menu: 'style' },
    //Darts
    bustDartPlacement: {
      dflt: 'armhole',
      list: ['waist', 'armhole'],
      menu: 'darts',
    },
    //Advanced
    shoulderRise: { pct: 1.5, min: 0, max: 2, menu: 'advanced' },
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
  }) => {
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //measures
    let shoulderRise = measurements.hpsToWaistBack * options.shoulderRise
    let shoulderToWrist = measurements.shoulderToWrist * (1 + options.sleeveLengthBonus)
    let wrist = measurements.wrist * (1 + options.wristEase)
    let armholeDrop = measurements.hpsToWaistBack * options.armholeDrop
    let underArmSleeveLength = measurements.shoulderToWrist * options.underArmSleeveLength

    //creating shoulder Top
    points.shoulderRise = points.armholePitchCp2.shiftOutwards(points.shoulder, shoulderRise)
    points.wristTop = points.hps.shiftOutwards(points.shoulderRise, shoulderToWrist)

    //undearm
    points.armholeDrop = points.armhole.shiftTowards(points.sideWaist, armholeDrop)
    if (options.fitSleeves) {
      points.wristBottom = points.wristTop
        .shiftTowards(points.hps, wrist / 2)
        .rotate(90, points.wristTop)
    } else {
      points.wristBottom = utils.beamsIntersect(
        points.armholeDrop,
        points.armholeDrop.shift(points.hps.angle(points.wristTop), 1),
        points.wristTop,
        points.hps.rotate(90, points.wristTop)
      )
    }

    points.bodiceSleeveBottom = points.armholeDrop.shiftTowards(
      points.wristBottom,
      underArmSleeveLength
    )
    points.bodiceSleeveTop = utils.beamsIntersect(
      points.hps,
      points.wristTop,
      points.bodiceSleeveBottom,
      points.bodiceSleeveBottom.shift(points.wristBottom.angle(points.wristTop), 1)
    )
    points.armholeCp = utils.beamsIntersect(
      points.armhole,
      points.sideWaist,
      points.bodiceSleeveBottom,
      points.bodiceSleeveTop.rotate(90, points.bodiceSleeveBottom)
    )

    //guides

    const drawBellaGuide = () => {
      if (options.bustDartPlacement == 'armhole')
        return new Path()
          .move(points.cfHem)
          .line(points.waistDartLeft)
          .curve_(points.waistDartLeftCp, points.waistDartTip)
          ._curve(points.waistDartRightCp, points.waistDartRight)
          .line(points.sideWaist)
          .line(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
          ._curve(points.bustDartCpBottom, points.bust)
          .curve_(points.bustDartCpTop, points.bustDartTop)
          .curve_(points.armholePitchCp2, points.shoulder)
          .line(points.hps)
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
          .line(points.cfHem)
          .close()
          .attr('class', 'various lashed')
      else
        return new Path()
          .move(points.cfWaist)
          .line(points.waistDartLeft)
          .curve_(points.waistDartLeftCp, points.waistDartTip)
          ._curve(points.waistDartRightCp, points.waistDartRight)
          .line(points.sideWaist)
          .line(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
          .line(points.hps)
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
          .line(points.cfWaist)
          .close()
          .attr('class', 'various lashed')
    }

    paths.bellaGuide = drawBellaGuide()

    paths.armscaffold = new Path()
      .move(points.armholeDrop)
      .line(points.wristBottom)
      .line(points.wristTop)
      .line(points.hps)

    return part
  },
}
