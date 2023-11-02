import { pluginRingSector } from '@freesewing/plugin-ringsector'
import { pctBasedOn } from '@freesewing/core'

export const dress = {
  name: 'siona.dress',
  options: {
    //Fit
    shoulderToShoulderEase: { pct: -0.5, min: -1, max: 5, menu: 'fit' },
    //Style
    neckOpening: { pct: 20.5, min: 15, max: 25, menu: 'style' },
    dressFullness: { deg: 60, min: 45, max: 90, menu: 'style' },
    length: { pct: 200, min: 0, max: 250, menu: 'style' },
    lengthBonus: { pct: 0, min: -50, max: 50, menu: 'style' },
    bandType: { dflt: 'belt', list: ['belt', 'channel', 'none'], menu: 'style' },
    bandWidth: {
      pct: 4.2,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    pocketOpening: { pct: 8.1, min: 6, max: 12, menu: 'pockets' },
    pocketOpeningLength: { pct: 63.5, min: 40, max: 70, menu: 'pockets' },
    pocketDepth: { pct: 15, min: 5, max: 40, menu: 'pockets' },
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
    'wrist',
    'waist',
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
    paperless,
    macro,
    utils,
    measurements,
    part,
    snippets,
    Snippet,
    absoluteOptions,
  }) => {
    //measurements
    const arcLength = measurements.head * (1 + options.neckOpening) * 0.25
    const innerRadius = arcLength / utils.deg2rad(options.dressFullness)
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
      angle: options.dressFullness,
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

    if (options.bandType != 'none') {
      //when channel needs to be slightly wider for elastic to fit. options.bandWidth == elasticWidth when options.bandType == 'channel'
      const bandWidth =
        options.bandType == 'belt'
          ? absoluteOptions.bandWidth * 0.5
          : absoluteOptions.bandWidth * 0.5375

      points.sideBandTop = points.sideWaist.shiftTowards(points.sideNeck, bandWidth)
      points.sideBandBottom = points.sideBandTop.rotate(180, points.sideWaist)

      points.cBandTop = points.sideBandTop.rotate(
        -options.dressFullness,
        points.__macro_ringsector_ringsector_center
      )
      points.cBandBottom = points.sideBandBottom.rotate(
        -options.dressFullness,
        points.__macro_ringsector_ringsector_center
      )
      store.set(
        'channelInnerRadius',
        points.__macro_ringsector_ringsector_center.dist(points.sideBandTop)
      )
      store.set('bandWidth', bandWidth * 2)
    }

    //stores
    store.set('upperArmWidth', points.shoulder.dist(points.armhole))
    store.set('outerRadius', points.__macro_ringsector_ringsector_center.dist(points.sideHem))
    //details
    //grainline
    if (options.centreSaWidth > 0) {
      points.grainlineFrom = points.__macro_ringsector_ringsector_in2Flipped.shiftFractionTowards(
        points.__macro_ringsector_ringsector_in2cFlipped,
        0.5
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

    //notches && guide lines
    const guideLength = arcLength / 5
    macro('sprinkle', {
      snippet: 'notch',
      on: ['shoulder', 'armhole'],
    })

    paths.shoulderGuide = new Path()
      .move(points.shoulder.shiftTowards(points.sideNeck, guideLength).rotate(90, points.shoulder))
      .line(points.shoulder)
      .attr('class', 'various')
      .attr('data-text', 'shoulder')
      .attr('data-text-class', 'center')

    paths.armholeGuide = new Path()
      .move(points.armhole.shiftTowards(points.sideNeck, guideLength).rotate(90, points.armhole))
      .line(points.armhole)
      .attr('class', 'various')
      .attr('data-text', 'armhole')
      .attr('data-text-class', 'center')

    if (points.sideHem.x > points.sideWaist.x) {
      paths.waistGuide = new Path()
        .move(
          points.sideWaist.shiftTowards(points.sideNeck, guideLength).rotate(90, points.sideWaist)
        )
        .line(points.sideWaist)
        .attr('class', 'various')
        .attr('data-text', 'waist')
        .attr('data-text-class', 'center')

      if (options.bandType == 'none') {
        points.cWaist = points.__macro_ringsector_ringsector_in2Flipped.shiftTowards(
          points.__macro_ringsector_ringsector_ex2Flipped,
          toWaistLength
        )
        macro('sprinkle', {
          snippet: 'notch',
          on: ['cWaist', 'sideWaist'],
        })
      } else {
        if (points.sideBandBottom.x > points.sideWaist.x) {
          macro('sprinkle', {
            snippet: 'notch',
            on: ['cBandTop', 'cBandBottom', 'sideBandTop', 'sideBandBottom'],
          })
          paths.bandTopGuide = new Path()
            .move(
              points.sideBandTop
                .shiftTowards(points.sideNeck, guideLength)
                .rotate(90, points.sideBandTop)
            )
            .line(points.sideBandTop)
            .attr('class', 'various')
            .attr('data-text', 'bandTop')
            .attr('data-text-class', 'center')

          paths.bandBottomGuide = new Path()
            .move(
              points.sideBandBottom
                .shiftTowards(points.sideNeck, guideLength)
                .rotate(90, points.sideBandBottom)
            )
            .line(points.sideBandBottom)
            .attr('class', 'various')
            .attr('data-text', 'bandBottom')
            .attr('data-text-class', 'center')
        }
      }
    }
    //pocket notches && guides
    if (options.pocketsBool) {
      points.pocketOpeningTop = points.sideWaist.shift(
        points.sideNeck.angle(points.sideHem),
        measurements.waistToFloor * options.pocketOpening
      )
      points.pocketOpeningBottom = points.pocketOpeningTop.shift(
        points.sideNeck.angle(points.sideHem),
        measurements.wrist * options.pocketOpeningLength
      )
      points.pocketBottom = points.pocketOpeningBottom.shift(
        points.sideNeck.angle(points.sideHem),
        measurements.waistToFloor * options.pocketDepth
      )
      store.set('pocketOpening', points.sideWaist.dist(points.pocketOpeningTop))
      store.set('pocketOpeningLength', points.pocketOpeningTop.dist(points.pocketOpeningBottom))
      store.set('pocketDepth', points.pocketOpeningBottom.dist(points.pocketBottom))
      store.set(
        'pocketRadius',
        points.__macro_ringsector_ringsector_center.dist(points.pocketBottom)
      )
      if (points.pocketBottom.x < points.sideHem.x) {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
        paths.pocketOpeningTopGuide = new Path()
          .move(
            points.pocketOpeningTop
              .shiftTowards(points.sideNeck, guideLength)
              .rotate(90, points.pocketOpeningTop)
          )
          .line(points.pocketOpeningTop)
          .attr('class', 'various')
          .attr('data-text', 'pocketOpeningTop')
          .attr('data-text-class', 'center')

        paths.pocketOpeningBottomGuide = new Path()
          .move(
            points.pocketOpeningBottom
              .shiftTowards(points.sideNeck, guideLength)
              .rotate(90, points.pocketOpeningBottom)
          )
          .line(points.pocketOpeningBottom)
          .attr('class', 'various')
          .attr('data-text', 'pocketOpeningBottom')
          .attr('data-text-class', 'center')
      }
    }
    //title
    points.title = points.__macro_ringsector_ringsector_in1.shiftFractionTowards(
      points.__macro_ringsector_ringsector_ex1,
      0.25
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
      macro('vd', {
        from: points.__macro_ringsector_ringsector_center,
        to: points.__macro_ringsector_ringsector_in2Flipped,
        x: points.__macro_ringsector_ringsector_center.x - sa * options.centreSaWidth * 100 - 15,
        force: true,
        id: 'vRadius',
      })
      macro('vd', {
        from: points.__macro_ringsector_ringsector_in2Flipped,
        to: points.__macro_ringsector_ringsector_ex2Flipped,
        x: points.__macro_ringsector_ringsector_center.x - sa * options.centreSaWidth * 100 - 15,
        force: true,
        id: 'vLength',
      })
      macro('vd', {
        from: points.__macro_ringsector_ringsector_center,
        to: points.__macro_ringsector_ringsector_ex2Flipped,
        x: points.__macro_ringsector_ringsector_center.x - sa * options.centreSaWidth * 100 - 30,
        force: true,
        id: 'vFull',
      })
      if (options.dressFullness < 90) {
        macro('vd', {
          from: points.__macro_ringsector_ringsector_center,
          to: points.__macro_ringsector_ringsector_in2,
          x: points.__macro_ringsector_ringsector_center.x,
          force: true,
          id: 'vSide',
        })
        macro('ld', {
          from: points.__macro_ringsector_ringsector_center,
          to: points.__macro_ringsector_ringsector_in2,
          force: true,
          id: 'lSide',
        })
      }
      macro('hd', {
        from: points.__macro_ringsector_ringsector_center,
        to: points.__macro_ringsector_ringsector_in2,
        y: points.__macro_ringsector_ringsector_in2.y,
        force: true,
        id: 'hSide',
      })
      const sideSeamSa = sa * options.sideSeamSaWidth * 100
      macro('ld', {
        from: points.__macro_ringsector_ringsector_in2,
        to: points.shoulder,
        force: true,
        d: sideSeamSa + 15,
        id: 'lShoulder',
      })
      macro('ld', {
        from: points.shoulder,
        to: points.armhole,
        force: true,
        d: sideSeamSa + 15,
        id: 'lArmhole',
      })
      macro('ld', {
        from: points.armhole,
        to: points.sideWaist,
        force: true,
        d: sideSeamSa + 15,
        id: 'lWaist',
      })
      if (points.sideHem.x > points.sideWaist.x) {
        macro('ld', {
          from: points.sideWaist,
          to: points.sideHem,
          force: true,
          d: sideSeamSa + 15,
          id: 'lSkirtLength',
        })
      }
      macro('ld', {
        from: points.sideNeck,
        to: points.sideHem,
        force: true,
        d: sideSeamSa + 30,
        id: 'lLength',
      })
    }

    return part
  },
}
