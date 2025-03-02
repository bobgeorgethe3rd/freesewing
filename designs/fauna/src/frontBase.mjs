import { pctBasedOn } from '@freesewing/core'
import { front as frontDaisy } from '@freesewing/daisy'

export const frontBase = {
  name: 'fauna.frontBase',
  from: frontDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constant
    closurePosition: 'front', //Locked for Fauna
    bustDartFraction: 0.5, //Locked for Fauna
    bustDartLength: 1, //Locked for Fauna
    waistDartLength: 1, //Locked for Fauna
    bustDartPlacment: 'bustSide', //Locked for Fauna
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    shoulderRise: { pct: 1.7, min: 0, max: 2, menu: 'fit' },
    //Style
    bodyLength: { pct: 50, min: 0, max: 100, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    //Plackets
    placketWidth: {
      pct: 5.5,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'plackets',
    },
    placketFacingWidth: { pct: 50, min: 0, max: 50, menu: 'plackets' },
  },
  measurements: ['waistToHips', 'waistToSeat'],
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
    absoluteOptions,
    snippets,
    Snippet,
  }) => {
    //delete inherited paths
    const keepThese = 'cfNeck'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('cutonfold', false)
    macro('scalebox', false)
    //measurements
    const shoulderRise = measurements.hpsToWaistBack * options.shoulderRise
    const placketWidth = absoluteOptions.placketWidth
    const bodyLength =
      options.bodyLength < 0.5
        ? measurements.waistToHips * 2 * options.bodyLength
        : measurements.waistToHips * (2 - 2 * options.bodyLength) +
          measurements.waistToSeat * (2 * options.bodyLength - 1)
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
    //migrate waist dart out of the way
    const rot = ['sideWaist', 'bustDartBottom']
    for (const p of rot) points[p] = points[p].rotate(-store.get('waistDartAngle'), points.bust)

    //guides
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.sideWaist)
        .line(points.bustDartBottom)
        .line(points.bustDartTip)
        .line(points.bustDartTop)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .close()
        .attr('class', 'various lashed')
    }
    //below waist
    points.cfWaistAnchor =
      points.sideWaist.y < points.cfWaist.y
        ? points.cfWaist
        : new Point(points.cfWaist.x, points.sideWaist.y)

    points.cfBottom = points.cfWaistAnchor.shift(-90, bodyLength)
    points.placketTopLeft = points.cfNeck.shift(180, placketWidth / 2)
    points.placketBottomLeft = new Point(points.placketTopLeft.x, points.cfBottom.y)
    points.facingBottom = points.placketBottomLeft.shift(
      0,
      placketWidth * (1 + options.placketFacingWidth * 2)
    )

    paths.cfNeck = paths.cfNeck.line(points.placketTopLeft)

    if (complete) {
      points.placketNotch = new Point(points.placketTopLeft.x, points.cArmhole.y)
      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100

        points.saShoulderCorner = points.shoulder
          .shift(points.hps.angle(points.shoulder), sa * options.armholeSaWidth * 100)
          .shift(points.hps.angle(points.shoulder) + 90, sa * options.shoulderSaWidth * 100)
        points.saHps = utils.beamsIntersect(
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.shoulder.angle(points.hps), 1)
        )
      }
    }

    macro('mirror', {
      mirror: [points.placketTopLeft, points.placketBottomLeft],
      paths: ['cfNeck'],
      points: ['facingBottom', 'shoulder', 'hps', 'saHps'],
      prefix: 'm',
    })

    points.facingShoulder = points.mHps.shiftFractionTowards(
      points.mShoulder,
      options.placketFacingWidth
    )
    points.facingShoulderCp2 = points.facingShoulder.shift(-90, points.cfBottom.y / 4)
    points.mFacingBottomCp1 = points.mFacingBottom.shift(90, points.cfBottom.y / 2)

    paths.facingCurve = new Path()
      .move(points.facingShoulder)
      .curve(points.facingShoulderCp2, points.mFacingBottomCp1, points.mFacingBottom)
      .hide()

    // paths.test = new Path()
    // .move(points.cfNeck)
    // .line(points.placketTopLeft)
    // .line(points.placketBottomLeft)
    // .line(points.placketBottomRight)

    // paths.test1 = paths.cfNeck
    // .join(paths.mCfNeck.reverse())
    // .line(points.facingShoulder)
    // .curve(points.facingShoulderCp2, points.mFacingBottomCp1, points.mFacingBottom)
    //stores
    store.set('shoulderRise', shoulderRise)
    store.set('placketWidth', placketWidth)
    store.set('bodyLength', bodyLength)
    store.set('scyeFrontWidth', points.armhole.dist(points.shoulder))
    store.set(
      'scyeFrontDepth',
      points.armhole.dist(points.shoulder) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.shoulder) - (points.shoulder.angle(points.hps) - 90)
          )
        )
    )
    store.set(
      'frontArmholeLength',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .length()
    )
    store.set(
      'frontArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .length()
    )

    return part
  },
}
