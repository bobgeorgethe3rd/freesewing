import { front as frontDaisy } from '@freesewing/daisy'
import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
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
    bustDartFraction: 0.5, //locked for Camden
    parallelShoulder: false, //locked for Camden
    //Fit
    daisyGuide: { bool: false, menu: 'fit' },
    hipsEase: { pct: 11, min: 0, max: 20, menu: 'fit' },
    seatEase: { pct: 11, min: 0, max: 20, menu: 'fit' },
    //Style
    armholeDrop: { pct: 25, min: 0, max: 75, menu: 'style' },
    shoulderPitch: { pct: 50, min: 30, max: 60, menu: 'style' },
    frontShoulderDepth: { pct: 80, min: 0, max: 100, menu: 'style' },
    frontNeckDepth: { pct: 60, min: 0, max: 100, menu: 'style' },
    frontNeckCurve: { pct: 50, min: 0, max: 100, menu: 'style' },
    frontNeckCurveDepth: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
    backShoulderDepth: { pct: 80, min: 0, max: 100, menu: 'style' },
    length: { pct: 75, min: 0, max: 100, menu: 'style' },
    lengthBonus: { pct: 0, min: -50, max: 150, menu: 'style' },
    strapWidth: {
      pct: 4.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
    //Darts
    bustDartLength: { pct: 70, min: 60, max: 100, menu: 'darts' }, //altered for Camden
    //Construction
    hemWidth: { pct: 2, min: 0, max: 10, menu: 'construction' },
    //Advanced
    waistOffset: { pct: 25, min: 12.5, max: 50, menu: 'advanced' },
    sideCurve: { pct: 100, min: 0, max: 100, menu: 'advanced' },
  },
  measurements: ['hips', 'waistToHips', 'seat', 'waistToSeat'],
  plugins: [pluginBundle, pluginLogoRG],
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
    const keepThese = 'dart'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
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
    if (options.frontShoulderDepth == 0 && options.backShoulderDepth == 0) {
      points.strapLeft = points.strapMid.shiftTowards(points.hps, strapWidth / 2)
    } else {
      points.strapLeft = points.strapMid.shift(180, strapWidth / 2)
    }
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
    //moving sideWaist
    points.sideWaist = utils.beamsIntersect(
      points.waistDartRight,
      points.sideWaist,
      points.bustDartBottom,
      points.bust.rotate(
        points.armhole.angle(points.bustDartTop) - points.bust.angle(points.bustDartTop),
        points.bustDartBottom
      )
    )
    //hem
    const waistFront = points.cfWaist.dist(points.sideWaist)
    const hips = (measurements.hips * (1 + options.hipsEase)) / 4
    const seat = (measurements.seat * (1 + options.seatEase)) / 4

    let midWidth
    if (waistFront > hips) {
      midWidth = waistFront * (1 + options.waistOffset * 0.5)
      log.warning(
        'Waist Front being used to draft width at 50% length, options.waistOffset unlocked'
      )
    } else {
      midWidth = hips
    }

    let maxWidth
    if (midWidth > seat) {
      maxWidth = waistFront * (1 + options.waistOffset)
      log.warning(
        'Waist Front being used to draft width at 100% length, options.waistOffset unlocked'
      )
    } else {
      maxWidth = seat
    }

    let length
    let width
    let sideSeamFraction
    if (options.length < 0.5) {
      length = measurements.waistToHips * (2 * options.length) * (1 + options.lengthBonus)

      width = waistFront * (1 - options.length * 2) + midWidth * options.length * 2
      sideSeamFraction = 0.5
    } else {
      length =
        (measurements.waistToHips +
          (measurements.waistToSeat - measurements.waistToHips) * (2 * options.length - 1)) *
        (1 + options.lengthBonus)

      width = midWidth * (1 - (2 * options.length - 1)) + maxWidth * (2 * options.length - 1)

      sideSeamFraction = options.length
    }

    const widthDiff = width - waistFront
    const sideAngle =
      utils.rad2deg(Math.atan(widthDiff / (length / (1 + options.lengthBonus)))) || 0

    points.sideHem = points.sideWaist.shift(270 + sideAngle, length)
    points.sideHemCp1 = utils.beamsIntersect(
      points.sideHem,
      points.sideHem.shift(180 + sideAngle, 1),
      new Point(points.sideHem.x / 2, points.sideHem.y),
      new Point(points.sideHem.x / 2, points.sideHem.y * 1.1)
    )
    points.cfHem = utils.beamsIntersect(
      points.cfNeckNew,
      points.cfWaist,
      points.sideHemCp1,
      points.sideHemCp1.shift(180, 1)
    )

    points.sideHemCp2 = points.sideHem.shiftFractionTowards(
      points.sideWaist,
      options.length * options.sideCurve
    )
    points.sideWaistCp1 = points.bustDartBottom.shiftFractionTowards(
      points.sideWaist,
      options.length * options.sideCurve
    )

    //guides
    if (options.daisyGuide) {
      paths.daisyGuide = new Path()
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
    paths.hemBase = new Path().move(points.cfHem).curve_(points.sideHemCp1, points.sideHem).hide()

    paths.side = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.sideWaistCp1, points.bustDartBottom)
      .hide()

    paths.dartPath = new Path()
      .move(points.bustDartBottom)
      ._curve(points.bustDartCpBottom, points.bustDartTip)
      .curve_(points.bustDartCpTop, points.bustDartTop)
      .hide()

    paths.top = new Path()
      .move(points.bustDartTop)
      .line(points.armholeDrop)
      .curve(points.armholeCp2New, points.armholePitchCp1New, points.strapRight)
      .line(points.strapLeft)
      ._curve(points.cfNeckCp1New, points.cfNeckNew)
      .hide()
    paths.seam = paths.hemBase
      .join(paths.side)
      .join(paths.dartPath)
      .join(paths.top)
      .line(points.cfHem)
      .close()

    //stores
    store.set('strapWidth', strapWidth)
    store.set('strapFrontLength', points.strapMid.dist(points.shoulderPitch))
    store.set(
      'sideLength',
      points.sideWaist.dist(points.bustDartBottom) + points.bustDartTop.dist(points.armholeDrop)
    )
    store.set('armholeCpAngle', points.armholePitch.angle(points.armholePitchCp1))
    store.set('length', length)
    store.set('sideAngle', sideAngle)

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfNeckNew
      points.cutOnFoldTo = points.cfHem
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
      })
      //notches
      const sideWaistNotchPot = utils.lineIntersectsCurve(
        points.cfWaist,
        points.cfWaist.shiftFractionTowards(points.sideWaist, 1000),
        points.sideHem,
        points.sideHemCp2,
        points.sideWaistCp1,
        points.bustDartBottom
      )

      if (sideWaistNotchPot) {
        points.sideWaistNotch = sideWaistNotchPot
      } else {
        points.sideWaistNotch = points.sideWaist
      }
      points.cfWaistNotch = utils.beamsIntersect(
        points.cfNeckNew,
        points.cfWaist,
        points.sideWaistNotch,
        points.sideWaistNotch.shift(180, 1)
      )

      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfBust', 'bust', 'sideWaistNotch', 'cfWaistNotch'],
      })
      //title
      points.title = new Point(
        (points.bust.x + points.waistDartLeftCp.x) / 2,
        (points.bust.y + points.cfNeckNew.y) / 2
      )
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Front',
        scale: 0.75,
      })
      //logo
      points.logo = new Point(
        points.title.x * 1.25,
        points.title.y + (points.cfHem.y - points.title.y) / 3
      )
      macro('logorg', {
        at: points.logo,
        scale: 2 / 3,
      })
      //scalebox
      points.scalebox = new Point(points.logo.x, (points.logo.y + points.cfHem.y) / 2)
      macro('scalebox', {
        at: points.scalebox,
      })

      if (sa) {
        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .join(paths.side.offset(sa))
          .join(paths.dart.reverse().offset(sa))
          .join(paths.top.offset(sa))
          .line(points.cfNeckNew)
          .line(points.cfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
