import { pluginRingSector } from '@freesewing/plugin-ringsector'
import { escape } from 'mustache'

export const dress = {
  name: 'siona.dress',
  options: {
    //Fit
    shoulderToShoulderEase: { pct: -0.5, min: -1, max: 5, menu: 'fit' },
    //Style
    neckOpening: { pct: 20.5, min: 15, max: 25, menu: 'style' },
    dressAngle: { deg: 60, min: 45, max: 90, menu: 'style' },
    length: { pct: 200, min: 0, max: 250, menu: 'style' },
    lengthBonus: { pct: 0, min: -50, max: 50, menu: 'style' },
    //Armhole
    scyeDepth: { pct: 45.5, min: 40, max: 50, menu: 'armhole' },
    //Construction
    hemWidth: { pct: 1.5, min: 0, max: 3, menu: 'construction' },
    sideSeamSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
    neckSaWidth: { pct: 1.5, min: 0, max: 3, menu: 'construction' },
    centreSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
  },
  measurements: [
    'head',
    'shoulderToShoulder',
    'hpsToWaistFront',
    'waistToArmpit',
    'waistToHips',
    'waistToSeat',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToFloor',
  ],
  plugins: [pluginRingSector],
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
    //measurements
    const arcLength = measurements.head * (1 + options.neckOpening) * 0.25
    const innerRadius = arcLength / utils.deg2rad(options.dressAngle)
    const shoulderLength =
      measurements.shoulderToShoulder * (1 + options.shoulderToShoulderEase) * 0.5 -
      (arcLength * 4) / 5
    const toWaistLength = shoulderLength + measurements.hpsToWaistFront

    let skirtLength
    if (options.length < 0.5) {
      skirtLength = measurements.waistToHips * options.length * 2
    } else {
      if (options.length >= 0.5 && options.length < 1) {
        skirtLength =
          measurements.waistToHips * (-2 * options.length + 2) +
          measurements.waistToSeat * (2 * options.length - 1)
      }
      if (options.length >= 1 && options.length < 1.5) {
        skirtLength =
          measurements.waistToSeat * (-2 * options.length + 3) +
          measurements.waistToUpperLeg * (2 * options.length - 2)
      }
      if (options.length >= 1.5 && options.length < 2) {
        skirtLength =
          measurements.waistToUpperLeg * (-2 * options.length + 4) +
          measurements.waistToKnee * (2 * options.length - 3)
      }
      if (options.length >= 2) {
        skirtLength =
          measurements.waistToKnee * (-2 * options.length + 5) +
          measurements.waistToFloor * (2 * options.length - 4)
      }
    }
    skirtLength = skirtLength * (1 + options.lengthBonus)

    //let's begin
    points.origin = new Point(0, 0)

    macro('ringsector', {
      point: points.origin,
      angle: options.dressAngle,
      insideRadius: innerRadius,
      outsideRadius: innerRadius + toWaistLength + skirtLength,
      rotate: true,
    })

    //renaming for easier coding
    points.sideNeck = points.__macro_ringsector_ringsector_in2
    points.sideHem = points.__macro_ringsector_ringsector_ex2

    //points
    points.shoulder = points.sideNeck.shiftTowards(points.sideHem, shoulderLength)
    points.sideWaist = points.sideNeck.shiftTowards(points.sideHem, toWaistLength)
    points.armhole = points.sideWaist.shiftTowards(
      points.sideNeck,
      measurements.waistToArmpit * (1 - options.scyeDepth)
    )

    //stores
    store.set('upperArmWidth', points.shoulder.dist(points.armhole))

    //details
    if (options.centreSaWidth > 0) {
      points.grainlineFrom = points.__macro_ringsector_ringsector_in2Flipped.shiftFractionTowards(
        points.__macro_ringsector_ringsector_in2cFlipped,
        0.15
      )
      points.grainlineTo = new Point(
        points.grainlineFrom.x,
        points.__macro_ringsector_ringsector_ex2Flipped.y
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
    } else {
      points.cutOnFoldFrom = points.__macro_ringsector_ringsector_in2Flipped
      points.cutOnFoldTo = points.__macro_ringsector_ringsector_ex2Flipped
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
    }

    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['shoulder', 'armhole'],
    })

    //title
    points.title = points.__macro_ringsector_ringsector_in1.shiftFractionTowards(
      points.__macro_ringsector_ringsector_ex1,
      1 / 3
    )
    macro('title', { at: points.title, nr: 1, title: 'dress' })

    //logo
    points.logo = points.__macro_ringsector_ringsector_in1.shiftFractionTowards(
      points.__macro_ringsector_ringsector_ex1,
      0.5
    )
    snippets.logo = new Snippet('logo', points.logo)

    //scalebox
    points.scalebox = points.__macro_ringsector_ringsector_in1.shiftFractionTowards(
      points.__macro_ringsector_ringsector_ex1,
      2 / 3
    )
    macro('scalebox', {
      at: points.scalebox,
    })

    if (sa) {
      paths.hemBase = new Path()
        .move(points.__macro_ringsector_ringsector_ex2Flipped)
        .curve(
          points.__macro_ringsector_ringsector_ex2cFlipped,
          points.__macro_ringsector_ringsector_ex1cFlipped,
          points.__macro_ringsector_ringsector_ex1
        )
        .curve(
          points.__macro_ringsector_ringsector_ex1c,
          points.__macro_ringsector_ringsector_ex2c,
          points.__macro_ringsector_ringsector_ex2
        )
        .hide()

      paths.sideSeam = new Path()
        .move(points.__macro_ringsector_ringsector_ex2)
        .line(points.__macro_ringsector_ringsector_in2)
        .hide()

      paths.neck = new Path()
        .move(points.__macro_ringsector_ringsector_in2)
        .curve(
          points.__macro_ringsector_ringsector_in2c,
          points.__macro_ringsector_ringsector_in1c,
          points.__macro_ringsector_ringsector_in1
        )
        .curve(
          points.__macro_ringsector_ringsector_in1cFlipped,
          points.__macro_ringsector_ringsector_in2cFlipped,
          points.__macro_ringsector_ringsector_in2Flipped
        )
        .hide()

      paths.centre = new Path()
        .move(points.__macro_ringsector_ringsector_in2Flipped)
        .line(points.__macro_ringsector_ringsector_ex2Flipped)
        .hide()

      paths.sa = paths.hemBase
        .offset(sa * options.hemWidth * 100)
        .join(paths.sideSeam.offset(sa * options.sideSeamSaWidth * 100))
        .join(paths.neck.offset(sa * options.neckSaWidth * 100))
        .join(paths.centre.offset(sa * options.centreSaWidth * 100))
        .close()
        .attr('class', 'fabric sa')
    }

    if (paperless) {
    }

    return part
  },
}
