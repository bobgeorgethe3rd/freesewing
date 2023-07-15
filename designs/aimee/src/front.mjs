import { front as frontDaisy } from '@freesewing/daisy'

export const front = {
  name: 'aimee.front',
  from: frontDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  measurements: ['shoulderToWrist', 'wrist'],
  options: {
    //Constamt
    bustDartLength: 1,
    bustDartCurve: 1,
    bustDartFraction: 0.5,
    parallelShoulder: false,
    //Fit
    wristEase: { pct: 10, min: 0, max: 20, menu: 'fit' },
    //Style
    fitSleeves: { bool: true, menu: 'style' },
    sleeveLengthBonus: { pct: 0, min: -10, max: 20, menu: 'style' },
    armholeDrop: { pct: 12.4, min: 0, max: 15, menu: 'style' },
    underArmSleeveLength: { pct: 6.4, min: 6, max: 8, menu: 'style' },
    fullSleeves: { bool: true, menu: 'style' },
    underArmCurve: { pct: 100, min: 50, max: 150, menu: 'style' },
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
    const shoulderRise = measurements.hpsToWaistBack * options.shoulderRise
    const shoulderToWrist = measurements.shoulderToWrist * (1 + options.sleeveLengthBonus)
    const wrist = measurements.wrist * (1 + options.wristEase)
    const armholeDrop = measurements.hpsToWaistBack * options.armholeDrop
    const underArmSleeveLength = measurements.shoulderToWrist * options.underArmSleeveLength

    //creating shoulder Top
    points.shoulderRise = points.armholePitchCp2.shiftOutwards(points.shoulder, shoulderRise)
    points.wristTop = points.hps.shiftOutwards(points.shoulderRise, shoulderToWrist)

    //undearm
    points.armholeDrop = points.armhole.shiftTowards(points.sideWaist, armholeDrop)
    points.wristBottomInitial = points.wristTop
      .shiftTowards(points.hps, wrist / 2)
      .rotate(90, points.wristTop)
    // points.bodiceSleeveBottom = points.armholeDrop.shiftTowards(
    // points.wristBottomInitial,
    // underArmSleeveLength
    // )
    points.bodiceSleeveBottom = points.armholeDrop.shift(
      points.hps.angle(points.shoulderRise),
      underArmSleeveLength
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

    points.bodiceSleeveTop = utils.beamsIntersect(
      points.hps,
      points.wristTop,
      points.bodiceSleeveBottom,
      points.bodiceSleeveBottom.shift(points.wristBottom.angle(points.wristTop), 1)
    )
    if (options.fullSleeves) {
      points.underArmCp = utils.beamsIntersect(
        points.armhole,
        points.sideWaist,
        points.wristBottom,
        points.bodiceSleeveBottom
      )
    } else {
      points.underArmCp = utils.beamsIntersect(
        points.armhole,
        points.sideWaist,
        points.bodiceSleeveBottom,
        points.bodiceSleeveTop.rotate(90, points.bodiceSleeveBottom)
      )
    }
    points.underArmCurveStart = points.underArmCp.shiftTowards(
      points.sideWaist,
      underArmSleeveLength * options.underArmCurve
    )

    //guides

    // const drawBellaGuide = () => {
    // if (options.bustDartPlacement == 'armhole')
    // return new Path()
    // .move(points.cfHem)
    // .line(points.waistDartLeft)
    // .curve_(points.waistDartLeftCp, points.waistDartTip)
    // ._curve(points.waistDartRightCp, points.waistDartRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
    // ._curve(points.bustDartCpBottom, points.bust)
    // .curve_(points.bustDartCpTop, points.bustDartTop)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    // .line(points.cfHem)
    // else
    // return new Path()
    // .move(points.cfWaist)
    // .line(points.waistDartLeft)
    // .curve_(points.waistDartLeftCp, points.waistDartTip)
    // ._curve(points.waistDartRightCp, points.waistDartRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    // .line(points.cfWaist)
    // }

    // paths.bellaGuide = drawBellaGuide().close().attr('class', 'various lashed')

    // paths.armscaffold = new Path()
    // .move(points.armholeDrop)
    // .line(points.wristBottom)
    // .line(points.wristTop)
    // .line(points.hps)

    // paths.underArmCurve = new Path()
    // .move(points.sideWaist)
    // .line(points.underArmCurveStart)
    // .curve_(points.underArmCp, points.bodiceSleeveBottom)
    // .line(points.wristBottom)

    //seam paths

    const drawArm = () => {
      if (options.fullSleeves)
        return new Path()
          .move(points.bodiceSleeveBottom)
          .line(points.wristBottom)
          .line(points.wristTop)
          .line(points.bodiceSleeveTop)
      else return new Path().move(points.bodiceSleeveBottom).line(points.bodiceSleeveTop)
    }

    paths.seam = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .curve_(points.waistDartLeftCp, points.waistDartTip)
      ._curve(points.waistDartRightCp, points.waistDartRight)
      .line(points.sideWaist)
      .line(points.underArmCurveStart)
      .curve_(points.underArmCp, points.bodiceSleeveBottom)
      .join(drawArm())
      .line(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .line(points.cfWaist)
      .close()

    //Stores
    store.set('shoulderTop', points.hps.dist(points.wristTop))
    store.set('shoulderRise', shoulderRise)
    store.set('armholeDrop', armholeDrop)
    store.set('wrist', wrist)
    store.set('shoulderWidth', points.hps.dist(points.bodiceSleeveTop))
    store.set('underArmSleeveLength', underArmSleeveLength)
    store.set('underArmLength', points.wristBottom.dist(points.bodiceSleeveBottom))
    store.set(
      'underArmCurveLength',
      new Path()
        .move(points.underArmCurveStart)
        .curve_(points.underArmCp, points.bodiceSleeveBottom)
        .length()
    )

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfNeck
      points.cutOnFoldTo = points.cfWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfBust', 'bust', 'underArmCurveStart', 'bodiceSleeveBottom'],
      })
      //title
      points.title = new Point(points.waistDartLeftCp.x, points.waistDartLeftCp.y / 2)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'front',
      })
      //scalebox
      points.scalebox = new Point(
        points.shoulderRise.x,
        points.waistDartLeftCp.y * (17 / 24)
      ).shift(0, 15)
      macro('scalebox', { at: points.scalebox })
      if (sa) {
        paths.sa = new Path()
          .move(points.cfWaist)
          .line(points.waistDartEdge)
          .line(points.waistDartRight)
          .line(points.sideWaist)
          .line(points.underArmCurveStart)
          .curve_(points.underArmCp, points.bodiceSleeveBottom)
          .join(drawArm())
          .line(points.hps)
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
          .offset(sa)
          .close()
          .line(points.cfNeck)
          .line(points.cfWaist)
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
