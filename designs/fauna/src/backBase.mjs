import { back as backDaisy } from '@freesewing/daisy'
import { frontBase } from './frontBase.mjs'

export const backBase = {
  name: 'fauna.backBase',
  from: backDaisy,
  after: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    yokeBackDepth: { pct: (1 / 3) * 100, min: 25, max: 75, menu: 'style' },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Fauna
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
    //delete inherited paths
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('cutonfold', false)
    //measurements
    const shoulderRise = store.get('shoulderRise')
    //tweak armhole for shoulder pads
    points.shoulder = points.armholePitchCp2.shiftOutwards(points.shoulder, shoulderRise)
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
    points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )
    points.armholeCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )

    points.cbNeckCp1 = utils.beamIntersectsY(
      points.hps,
      points.shoulder.rotate((180 - (points.hps.angle(points.shoulder) - 270)) * -1, points.hps),
      points.cbNeck.y
    )

    //guides
    if (options.daisyGuides) {
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
        .close()
        .attr('class', 'various lashed')
    }
    //yokeBack
    points.cbYoke =
      points.shoulder.y < points.cbNeck.y
        ? points.cbNeck.shiftFractionTowards(points.cArmhole, options.yokeBackDepth)
        : new Point(points.cbNeck.x, points.shoulder.y).shiftFractionTowards(
            points.cArmhole,
            options.yokeBackDepth
          )

    points.yokeBackSplit =
      points.cbYoke.y < points.armholePitch.y
        ? utils.curveIntersectsY(
            points.armholePitch,
            points.armholePitchCp2,
            points.shoulder,
            points.shoulder,
            points.cbYoke.y
          )
        : utils.curveIntersectsY(
            points.armhole,
            points.armholeCp2,
            points.armholePitchCp1,
            points.armholePitch,
            points.cbYoke.y
          )

    //paths.yoke = new Path().move(points.cbYoke).line(points.yokeBackSplit)

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

    return part
  },
}
