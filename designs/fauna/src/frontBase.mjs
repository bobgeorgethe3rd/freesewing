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
    bustDartPlacement: 'bustSide', //Locked for Fauna
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    shoulderRise: { pct: 1.7, min: 0, max: 2, menu: 'fit' },
    hipsEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' },
    seatEase: { pct: 4.8, min: 0, max: 20, menu: 'fit' },
    //Style
    bodyLength: { pct: 75, min: 0, max: 100, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    //Plackets
    placketWidth: {
      pct: 5.5,
      min: 1,
      max: 6,
      snap: 1.25,
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
    const hips = measurements.hips * (1 + options.hipsEase)
    const seat = measurements.seat * (1 + options.seatEase)
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
    const midWidth = hips < points.sideWaist.x * 4 ? points.sideWaist.x * 1.25 : hips * 0.25

    const maxWidth = seat < points.sideWaist.x * 4 ? points.sideWaist.x * 1.25 : seat * 0.25
    points.sideHips = new Point(
      midWidth,
      points.sideWaist.y + measurements.waistToHips * (1 + options.bodyLengthBonus)
    )
    points.sideSeat = new Point(
      maxWidth,
      points.sideWaist.y + measurements.waistToSeat * (1 + options.bodyLengthBonus)
    )
    points.sideHem =
      options.bodyLength < 0.5
        ? points.sideWaist.shiftFractionTowards(points.sideHips, 2 * options.bodyLength)
        : points.sideHips.shiftFractionTowards(points.sideSeat, 2 * options.bodyLength - 1)
    points.placketBottomRightCp2 = points.sideHem.shift(
      points.sideSeat.angle(points.sideHips) + 90,
      points.sideHem.x * 0.5
    )

    points.cfHem = new Point(points.cfNeck.x, points.placketBottomRightCp2.y)

    if (points.cfHem.y < points.cfWaist.y) {
      points.cfHem = points.cfWaist
      points.placketBottomRightCp2 = new Point(points.sideWaist.x * 0.5, points.cfWaist.y)
    }

    points.placketTopLeft = points.cfNeck.shift(180, placketWidth / 2)
    points.placketBottomLeft = new Point(points.placketTopLeft.x, points.cfHem.y)
    points.placketBottomRight = points.placketBottomLeft.flipX(points.cfHem)
    points.facingBottom = utils.curveIntersectsX(
      points.placketBottomRight,
      points.placketBottomRightCp2,
      points.sideHem,
      points.sideHem,
      points.placketBottomLeft.shift(0, placketWidth * (1 + options.placketFacingWidth * 2)).x
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
    paths.hemBase = new Path()
      .move(points.placketBottomLeft)
      .line(points.placketBottomRight)
      .curve_(points.placketBottomRightCp2, points.sideHem)
      .hide()

    macro('mirror', {
      mirror: [points.placketTopLeft, points.placketBottomLeft],
      paths: ['hemBase', 'cfNeck'],
      points: ['facingBottom', 'shoulder', 'hps', 'saHps'],
      prefix: 'm',
    })

    points.facingShoulder = points.mHps.shiftFractionTowards(
      points.mShoulder,
      options.placketFacingWidth
    )
    points.facingShoulderCp2 = points.facingShoulder.shift(-90, points.cfHem.y / 4)
    points.mFacingBottomCp1 = points.mFacingBottom.shift(90, (points.cfHem.y * 2) / 3)

    paths.facingCurve = new Path()
      .move(points.facingShoulder)
      .curve(points.facingShoulderCp2, points.mFacingBottomCp1, points.mFacingBottom)
      .hide()

    paths.test = new Path()
      .move(points.cfNeck)
      .line(points.placketTopLeft)
      .line(points.placketBottomLeft)

    paths.test1 = paths.cfNeck
      .join(paths.mCfNeck.reverse())
      .line(points.facingShoulder)
      .curve(points.facingShoulderCp2, points.mFacingBottomCp1, points.mFacingBottom)
    //stores
    store.set('shoulderRise', shoulderRise)
    store.set('placketWidth', placketWidth)
    store.set('bodyLength', bodyLength)
    store.set('hips', hips)
    store.set('seat', seat)
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
