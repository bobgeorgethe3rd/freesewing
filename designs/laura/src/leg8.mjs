import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const leg8 = {
  name: 'laura.leg8',
  options: {
    //Fit
    waistEase: { pct: -10, min: -15, max: 0, menu: 'fit' },
    seatEase: { pct: -10, min: -15, max: 0, menu: 'fit' },
    upperLegEase: { pct: -10, min: -15, max: 0, menu: 'fit' },
    kneeEase: { pct: -15, min: -20, max: 0, menu: 'fit' },
    ankleEase: { pct: -10, min: -20, max: 0, menu: 'fit' },
    considerCalf: { bool: false, menu: 'fit' },
    //Style
    lengthBonus: { pct: -10, min: -20, max: 10, menu: 'style' },
    menu: 'style',
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' },
    waistbandWidth: {
      pct: 3.3,
      min: 1,
      max: 9,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //12.7 og breaks to much darn it need to look into this
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'none'], menu: 'style' },
    gusset: { bool: true, menu: 'style' },
    //Construction
    crotchSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    crossSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    inseamWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    hemWidth: { pct: 2.5, min: 1, max: 10, menu: 'construction' },
    //Advanced
    crotchDrop: { pct: 0, min: 0, max: 15, menu: 'advanced' },
  },
  measurements: [
    'ankle',
    'crossSeam',
    'crossSeamFront',
    'knee',
    'seat',
    'upperLeg',
    'waist',
    'waistToHips',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToFloor',
  ],
  optionalMeasurements: ['hips'],
  plugins: [pluginBundle, pluginMirror, pluginLogoRG],
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
    //measures
    const crossSeam = measurements.crossSeam * (1 + options.crotchDrop)
    const crossSeamFront = measurements.crossSeamFront * (1 + options.crotchDrop)
    const crossSeamBack = crossSeam - crossSeamFront

    const waist = measurements.waist * (1 + options.waistEase)

    let seat = measurements.seat * (1 + options.seatEase)
    if (measurements.hips > measurements.seat) {
      seat = measurements.hips * (1 + options.seatEase)
      log.info(
        'measurements.hips > measurements.seat so measurements.hips is being used instead of measurements.seat'
      )
    }

    const upperLeg = measurements.upperLeg * (1 + options.upperLegEase)
    const knee = measurements.knee * (1 + options.kneeEase)
    const ankle = measurements.ankle * (1 + options.ankleEase)

    let waistDiff = upperLeg - waist / 2
    if (waistDiff < 0) {
      waistDiff = waistDiff * -1
    }

    let seatDiff = upperLeg - seat / 2
    if (seatDiff < 0) {
      seatDiff = seatDiff * -1
    }

    let waistBackDiff
    let waistFrontDiff
    let seatBackDiff
    let seatFrontDiff
    if (crossSeamFront > crossSeamBack) {
      waistBackDiff = waistDiff * (1 / 3)
      waistFrontDiff = waistDiff * (2 / 3)
      seatBackDiff = seatDiff * (1 / 3)
      seatFrontDiff = seatDiff * (2 / 3)
    } else {
      waistBackDiff = waistDiff * (2 / 3)
      waistFrontDiff = waistDiff * (1 / 3)
      seatBackDiff = seatDiff * (2 / 3)
      seatFrontDiff = seatDiff * (1 / 3)
    }

    let waistbandWidth = absoluteOptions.waistbandWidth
    if (options.waistbandStyle == 'none') {
      waistbandWidth = 0
    }
    //let's begin
    points.upperLeg = new Point(0, 0)
    points.upperLegLeft = points.upperLeg.shift(180, upperLeg / 2)
    points.upperLegRight = points.upperLeg.shift(0, upperLeg / 2)

    points.knee = new Point(0, measurements.waistToKnee - measurements.waistToUpperLeg)
    points.kneeLeft = points.knee.shift(180, knee / 2)
    points.kneeRight = points.knee.shift(0, knee / 2)

    points.floor = new Point(
      0,
      measurements.waistToFloor * (1 + options.lengthBonus) - measurements.waistToUpperLeg
    )
    points.floorLeft = points.floor.shift(180, ankle / 2)
    points.floorRight = points.floor.shift(0, ankle / 2)

    points.seatLeft = points.upperLegLeft.shift(0, seatBackDiff)
    points.seatRight = points.upperLegRight.shift(180, seatFrontDiff)

    points.waistLeft = points.upperLegLeft.shift(0, waistBackDiff)
    points.waistRight = points.upperLegRight.shift(180, waistFrontDiff)

    //above the upperLeg
    points.upperLegLeftCp1 = utils.beamIntersectsX(
      points.upperLegLeft,
      points.kneeLeft.rotate(90, points.upperLegLeft),
      points.seatLeft.x
    )
    points.upperLegRightCp2 = utils.beamIntersectsX(
      points.upperLegRight,
      points.kneeRight.rotate(-90, points.upperLegRight),
      points.seatRight.x
    )
    points.waistFrontCp1 = utils.beamIntersectsX(
      points.upperLegRight,
      points.kneeRight.rotate(-90, points.upperLegRight),
      points.waistRight.x
    )
    points.waistBackCp2 = utils.beamIntersectsX(
      points.upperLegLeft,
      points.kneeLeft.rotate(90, points.upperLegLeft),
      points.waistLeft.x
    )

    //drawing the crotch and cross seams
    let crotchTweak = 1
    let crotchDelta
    do {
      points.waistFrontMax = points.waistRight.shift(90, measurements.waistToUpperLeg * crotchTweak)

      paths.crotchSeam = new Path()
        .move(points.upperLegRight)
        .curve(points.upperLegRightCp2, points.waistFrontCp1, points.waistFrontMax)
        .hide()

      crotchDelta = paths.crotchSeam.length() - crossSeamFront
      if (crotchDelta > 0) crotchTweak = crotchTweak * 0.99
      else crotchTweak = crotchTweak * 1.01
    } while (Math.abs(crotchDelta) > 1)

    let crossTweak = 1
    let crossDelta
    do {
      points.waistBackMax = points.waistLeft.shift(90, measurements.waistToUpperLeg * crossTweak)

      paths.crossSeam = new Path()
        .move(points.waistBackMax)
        .curve(points.waistBackCp2, points.upperLegLeftCp1, points.upperLegLeft)
        .hide()

      crossDelta = paths.crossSeam.length() - crossSeamBack
      if (crossDelta > 0) crossTweak = crossTweak * 0.99
      else crossTweak = crossTweak * 1.01
    } while (Math.abs(crossDelta) > 1)

    //let's draft the waistLine
    points.waistMidMax = points.waistFrontMax.shiftFractionTowards(points.waistBackMax, 0.5)
    points.waistMid = points.waistMidMax.shift(
      -90,
      measurements.waistToHips * (1 - options.waistHeight) + waistbandWidth
    )

    points.waistFront =
      utils.lineIntersectsCurve(
        points.waistMid,
        points.waistMid.shift(points.waistBackMax.angle(points.waistFrontMax), seat),
        points.upperLegRight,
        points.upperLegRightCp2,
        points.waistFrontCp1,
        points.waistFrontMax
      ) || points.waistFrontMax

    points.waistBack =
      utils.lineIntersectsCurve(
        points.waistMid,
        points.waistMid.shift(points.waistFrontMax.angle(points.waistBackMax), seat),
        points.waistBackMax,
        points.waistBackCp2,
        points.upperLegLeftCp1,
        points.upperLegLeft
      ) || points.waistBackMax

    points.floorLeftCp1 = utils.beamIntersectsX(
      points.upperLegLeft,
      points.kneeLeft,
      points.floorLeft.x
    )

    points.floorRightCp2 = points.floorLeftCp1.flipX()
    points.upperLegLeftCp2 = points.upperLegLeft.shiftFractionTowards(points.kneeLeft, 1 / 3)
    points.upperLegRightCp1 = points.upperLegRight.shiftFractionTowards(points.kneeRight, 1 / 3)

    if (options.considerCalf) {
      points.kneeLeftCp1 = new Point(points.kneeLeft.x, (points.kneeLeft.y * 2) / 3)
      points.kneeLeftCp2 = new Point(points.kneeLeft.x, points.floorLeftCp1.y)
    } else {
      points.kneeLeftCp1 = points.kneeLeft.shiftFractionTowards(points.upperLegLeft, 0.25)
      points.kneeLeftCp2 = points.kneeLeft
    }

    points.kneeRightCp1 = points.kneeLeftCp2.flipX()
    points.kneeRightCp2 = points.kneeLeftCp1.flipX()

    // paths
    paths.hemBase = new Path().move(points.floorLeft).line(points.floorRight).hide()

    paths.saRight = new Path()
      .move(points.floorRight)
      .curve(points.floorRightCp2, points.kneeRightCp1, points.kneeRight)
      .curve(points.kneeRightCp2, points.upperLegRightCp1, points.upperLegRight)
      .hide()

    paths.crotchSeam = paths.crotchSeam.split(points.waistFront)[0].hide()

    paths.crossSeam = paths.crossSeam.split(points.waistBack)[1].hide()

    paths.saLeft = new Path()
      .move(points.upperLegLeft)
      .curve(points.upperLegLeftCp2, points.kneeLeftCp1, points.kneeLeft)
      .curve(points.kneeLeftCp2, points.floorLeftCp1, points.floorLeft)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.saRight)
      .join(paths.crotchSeam)
      .line(points.waistBack)
      .join(paths.crossSeam)
      .join(paths.saLeft)
      .close()

    //stores
    store.set('waistbandLength', points.waistBack.dist(points.waistFront) * 2)
    store.set('waistbandWidth', absoluteOptions.waistbandWidth)

    if (options.gusset) {
      points.backGusset = utils.lineIntersectsCurve(
        points.waistBackCp2,
        points.waistBackCp2
          .shiftTowards(points.upperLegLeft, waist)
          .rotate(-90, points.waistBackCp2),
        points.waistBackMax,
        points.waistBackCp2,
        points.upperLegLeftCp1,
        points.upperLegLeft
      )
      points.frontGusset = utils.lineIntersectsCurve(
        points.waistFrontCp1,
        points.waistFrontCp1
          .shiftTowards(points.upperLegRight, waist)
          .rotate(90, points.waistFrontCp1),
        points.upperLegRight,
        points.upperLegRightCp2,
        points.waistFrontCp1,
        points.waistFrontMax
      )
      store.set('gussetBackWidth', points.waistBackCp2.dist(points.backGusset))
      store.set('gussetBackLength', points.upperLegLeft.dist(points.backGusset))
      store.set('gussetFrontWidth', points.waistFrontCp1.dist(points.frontGusset))
      store.set('gussetFrontLength', points.upperLegRight.dist(points.frontGusset))
    }

    if (options.waistbandStyle == 'curved') {
      points.waistbandTop = points.waistMid.shift(90, waistbandWidth)
      points.waistbandTopRight =
        utils.lineIntersectsCurve(
          points.waistbandTop,
          points.waistbandTop.shift(
            points.waistFront.angle(points.waistBack),
            points.waistFront.dist(points.waistBack)
          ),
          points.waistBackMax,
          points.waistBackCp2,
          points.upperLegLeftCp1,
          points.upperLegLeft
        ) || points.waistBackMax

      points.waistbandTopLeft =
        utils.lineIntersectsCurve(
          points.waistbandTop,
          points.waistbandTop.shift(
            points.waistBack.angle(points.waistFront),
            points.waistBack.dist(points.waistFront)
          ),
          points.upperLegRight,
          points.upperLegRightCp2,
          points.waistFrontCp1,
          points.waistFrontMax
        ) || points.waistFrontMax

      store.set('waistbandLengthTop', points.waistbandTopRight.dist(points.waistbandTopLeft) * 2)
    }

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.upperLeg.x, points.waistMid.y)
      points.grainlineTo = points.floor
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //stretch
      points.stretchFrom = new Point(points.kneeLeft.x, points.kneeLeft.y / 3)
      points.stretchTo = new Point(points.kneeRight.x, points.kneeRight.y / 3)
      paths.stretch = new Path()
        .move(points.stretchFrom)
        .line(points.stretchTo)
        .attr('class', 'note')
        .attr('data-text', 'Stretch')
        .attr('data-text-class', 'fill-note center')
        .attr('marker-start', 'url(#grainlineFrom)')
        .attr('marker-end', 'url(#grainlineTo)')
      //notches
      points.crotchNotch = paths.crotchSeam.split(points.waistFront)[0].shiftFractionAlong(0.5)
      points.crossNotch = paths.crossSeam.split(points.waistBack)[1].shiftFractionAlong(0.5)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['waistMid', 'crotchNotch', 'kneeLeft', 'kneeRight'],
      })
      snippets.crossNotch = new Snippet('bnotch', points.crossNotch)
    }
    //title
    points.title = new Point(points.kneeLeft.x * 0.5, points.kneeLeft.y / 10)
    macro('title', {
      at: points.title,
      nr: '1h',
      title: 'Leg',
      scale: 0.5,
    })
    //logo
    points.logo = new Point(points.kneeLeft.x * 0.45, points.kneeLeft.y * 0.75)
    macro('logorg', {
      at: points.logo,
      scale: 2 / 3,
    })
    //scalebox
    points.scalebox = new Point(points.kneeLeft.x * 0.45, points.floorLeftCp1.y * 0.8)
    macro('scalebox', {
      at: points.scalebox,
    })
    if (sa) {
      const inseamSa = sa * options.inseamWidth * 100
      const hemSa = sa * options.hemWidth * 100
      const crotchSa = sa * options.crotchSaWidth * 100
      const crossSa = sa * options.crossSaWidth * 100

      points.fHemLeft = utils.lineIntersectsCurve(
        points.floor.shift(90, hemSa),
        new Point(points.kneeLeft.x, points.floor.y - hemSa),
        points.kneeLeft,
        points.kneeLeftCp2,
        points.floorLeftCp1,
        points.floorLeft
      )
      points.hemLeft = points.fHemLeft.flipY(points.floor)
      points.hemRight = points.hemLeft.flipX()

      points.saUpperLegRight = points.upperLegRight
        .shift(points.kneeRight.angle(points.upperLegRight), crotchSa)
        .shift(points.upperLegRightCp2.angle(points.upperLegRight), inseamSa)
      points.saUpperLegLeft = points.upperLegLeft
        .shift(points.kneeLeft.angle(points.upperLegLeft), crotchSa)
        .shift(points.upperLegLeftCp1.angle(points.upperLegLeft), inseamSa)

      macro('mirror', {
        mirror: [points.floorLeft, points.floorRight],
        paths: ['saLeft', 'saRight'],
        prefix: 'm',
      })

      if (options.waistbandStyle == 'none') {
        points.saWaistAnchor = points.waistMid
          .shiftTowards(points.waistFront, absoluteOptions.waistbandWidth)
          .rotate(-90, points.waistMid)
        points.saCrossSplit = utils.lineIntersectsCurve(
          points.saWaistAnchor,
          points.saWaistAnchor.shift(
            points.waistFront.angle(points.waistBack),
            points.waistFront.dist(points.waistBack)
          ),
          points.waistBackMax,
          points.waistBackCp2,
          points.upperLegLeftCp1,
          points.upperLegLeft
        )
        points.saCrotchSplit = utils.lineIntersectsCurve(
          points.saWaistAnchor,
          points.saWaistAnchor.shift(
            points.waistBack.angle(points.waistFront),
            points.waistBack.dist(points.waistFront)
          ),
          points.upperLegRight,
          points.upperLegRightCp2,
          points.waistFrontCp1,
          points.waistFrontMax
        )

        macro('mirror', {
          mirror: [points.waistBack, points.waistFront],
          paths: ['crossSeam', 'crotchSeam'],
          points: ['saCrossSplit', 'saCrotchSplit'],
          prefix: 'm',
        })

        paths.saWaist = paths.mCrotchSeam
          .split(points.mSaCrotchSplit)[1]
          .reverse()
          .offset(crotchSa)
          .line(points.mSaCrotchSplit)
          .line(points.mSaCrossSplit)
          .join(paths.mCrossSeam.split(points.mSaCrossSplit)[0].reverse().offset(crossSa))
          .hide()
      } else {
        points.saWaistAnchor = points.waistMid
          .shiftTowards(points.waistFront, sa)
          .rotate(90, points.waistMid)
        points.saWaistFront = utils.beamsIntersect(
          points.saWaistAnchor,
          points.saWaistAnchor.shift(
            points.waistBack.angle(points.waistFront),
            points.waistBack.dist(points.waistFront)
          ),
          paths.crotchSeam.offset(crotchSa).end(),
          paths.crotchSeam.offset(crotchSa).shiftFractionAlong(0.999)
        )
        points.saWaistBack = utils.beamsIntersect(
          points.saWaistAnchor,
          points.saWaistAnchor.shift(
            points.waistFront.angle(points.waistBack),
            points.waistFront.dist(points.waistBack)
          ),
          paths.crossSeam.offset(crossSa).start(),
          paths.crossSeam.offset(crossSa).shiftFractionAlong(0.001)
        )
        paths.saWaist = new Path().move(points.saWaistFront).line(points.saWaistBack).hide()
      }

      paths.sa = new Path()
        .move(points.hemLeft)
        .line(points.hemRight)
        .join(paths.mSaRight.split(points.hemRight)[0].reverse().offset(inseamSa))
        .join(paths.saRight.offset(inseamSa))
        .line(points.saUpperLegRight)
        .line(paths.crotchSeam.offset(crotchSa).start())
        .join(paths.crotchSeam.offset(crotchSa))
        .line(paths.saWaist.start())
        .join(paths.saWaist)
        .line(paths.crossSeam.offset(crossSa).start())
        .join(paths.crossSeam.offset(crossSa))
        .line(points.saUpperLegLeft)
        .line(paths.saLeft.offset(inseamSa).start())
        .join(paths.saLeft.offset(inseamSa))
        .join(paths.mSaLeft.split(points.hemLeft)[1].reverse().offset(inseamSa))
        .line(points.hemLeft)
        .close()
        .attr('class', 'fabric sa')
    }
    return part
  },
}
