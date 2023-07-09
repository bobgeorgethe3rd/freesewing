import { pluginBundle } from '@freesewing/plugin-bundle'
import { back as byronBack } from '@freesewing/byron'

export const backBase = {
  name: 'shaun.backBase',
  from: byronBack,
  hide: {
    from: true,
  },
  options: {
    //Constants
    useVoidStores: false, //Altered for Shaun
    waistDiffDivider: 8, //Altered for Shaun
    //Fit
    chestEase: { pct: 10, min: 0, max: 20, menu: 'fit' }, //Altered for Shaun
    waistEase: { pct: 9.5, min: 0, max: 20, menu: 'fit' }, //Altered for Shaun
    hipsEase: { pct: 10, min: 0, max: 20, menu: 'fit' },
    seatEase: { pct: 8.9, min: 0, max: 20, menu: 'fit' },
    //Style
    shirtLength: { pct: 100, min: 0, max: 100, menu: 'style' },
    shirtLengthBonus: { pct: 0, min: -20, max: 20, menu: 'style' },
    yokeBack: { bool: true, menu: 'style' },
    yokeBackDepth: { pct: 20, min: 10, max: 50, menu: 'style' },
    yokeBackDip: { pct: 1.6, min: 0, max: 2, menu: 'style' },
  },
  measurements: ['hips', 'seat', 'waistToHips', 'waistToSeat'],
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
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //measurements
    const hips = measurements.hips * (1 + options.hipsEase)
    const seat = measurements.seat * (1 + options.seatEase)
    const shirtLength =
      (measurements.waistToHips +
        (measurements.waistToSeat - measurements.waistToHips) * options.shirtLength) *
      (1 + options.shirtLengthBonus)
    const yokeBackDip = measurements.hpsToWaistBack * options.yokeBackDip

    let hemWidth
    if (hips > seat) {
      hemWidth = hips
    } else {
      hemWidth = (hips * (1 - options.shirtLength) + seat * (1 + options.shirtLength)) / 2
    }

    const waistDiff = store.get('waistDiff')

    let hemDiff = (store.get('chest') - hemWidth) / 4
    if (hemDiff > waistDiff) {
      hemDiff = waistDiff
    }

    //let's begin
    //yoke
    if (points.shoulder.y < points.cbNeck.y) {
      points.cbYokeMin = points.cbNeck
    } else {
      points.cbYokeMin = new Point(points.cbNeck.x, points.shoulder.y)
    }

    if (options.yokeBack) {
      points.cbYoke = points.cbYokeMin.shiftFractionTowards(points.cArmhole, options.yokeBackDepth)
      points.yokeBackAnchor = new Point(points.armhole.x * 10, points.cbYoke.y)
      let yokeBackIntersect = utils.lineIntersectsCurve(
        points.cbYoke,
        points.yokeBackAnchor,
        points.armholePitch,
        points.armholePitchCp2,
        points.shoulder,
        points.shoulder
      )

      if (yokeBackIntersect) {
        points.yokeBack = yokeBackIntersect
      } else {
        points.yokeBack = utils.lineIntersectsCurve(
          points.cbYoke,
          points.yokeBackAnchor,
          points.armhole,
          points.armholeCp1,
          points.armholePitchCp1,
          points.armholePitch
        )
      }
      points.backTopCurveEnd = points.yokeBack.shiftFractionTowards(
        points.cbYoke,
        options.backTopCurve
      )

      points.backTopRight = new Path()
        .move(points.armhole)
        .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .split(points.yokeBack)[0]
        .reverse()
        .shiftAlong(yokeBackDip)

      //yoke guides
      // paths.yokeLine = new Path().move(points.cbYoke).line(points.yokeBack)
    }
    //stores
    store.set('shirtLength', shirtLength)
    store.set('hemDiff', hemDiff)
    store.set(
      'backNeck',
      new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).length()
    )
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
    if (options.yokeBack) {
      store.set(
        'backArmholeLength',
        new Path()
          .move(points.armhole)
          .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
          .length() - yokeBackDip
      )
      paths.armholePitch = new Path()
        .move(points.armhole)
        .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
        .hide()
      if (points.backTopRight.y > points.armholePitch.y) {
        let backArmholeToArmholePitch
        if (points.yokeBack.y < points.armholePitch.y) {
          backArmholeToArmholePitch = paths.armholePitch.split(points.backTopRight)[0].length()
        } else {
          backArmholeToArmholePitch = paths.armholePitch.length() - yokeBackDip
        }
        store.set('backArmholeToArmholePitch', backArmholeToArmholePitch)
      }
    } else {
      store.set(
        'backArmholeLength',
        new Path()
          .move(points.armhole)
          .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
          .length()
      )
      store.set(
        'backArmholeToArmholePitch',
        new Path()
          .move(points.armhole)
          .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
          .length()
      )
    }

    //guides
    // paths.byronGuide = new Path()
    // .move(points.cWaist)
    // .line(points.sideWaist)
    // .curve_(points.sideWaistCp2, points.armhole)
    // .curve(points.armholeCp1, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // ._curve(points.cbNeckCp1, points.cbNeck)
    // .line(points.cWaist)
    // .close()
    // .attr('class', 'various dashed')

    return part
  },
}
