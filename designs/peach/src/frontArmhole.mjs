import { frontArmholeDart } from '@freesewing/daisy'

export const frontArmhole = {
  name: 'peach.frontArmhole',
  draft: (sh) => {
    const {
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
    } = sh
    //draft
    frontArmholeDart(sh)
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('scalebox', false)
    //guides
    if (options.daisyGuides) {
      paths.armhole = new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .hide()

      paths.armholeR = new Path()
        .move(points.armholeR)
        .curve(points.armholeCp2R, points.armholePitchCp1R, points.armholePitchR)
        .curve_(points.armholePitchCp2R, points.shoulderR)
        .hide()

      if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
        paths.armhole = paths.armhole.split(points.bustDartTop)[1]
        paths.armholeR = paths.armholeR.split(points.bustDartBottom)[0]
      } else {
        if (options.bustDartFraction <= 0.01) {
          paths.armhole = new Path().move(points.bustDartTop).line(points.shoulder).hide()
        } else {
          paths.armholeR = new Path().move(points.armholeR).line(points.bustDartBottom).hide()
        }
      }
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.bust)
        .line(points.waistDartRight)
        .line(points.sideWaist)
        .line(points.armholeR)
        .join(paths.armholeR)
        .line(points.bust)
        .line(points.bustDartTop)
        .join(paths.armhole)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .attr('class', 'various lashed')
    }
    //let's begin
    paths.waist = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

    paths.princessSeam = new Path()
      .move(points.waistDartLeft)
      .curve(points.bust, points.bust, points.bustDartTop)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
      paths.armhole = paths.armhole.split(points.bustDartTop)[1].hide()
    } else {
      if (options.bustDartFraction <= 0.01) {
        paths.armhole = new Path().move(points.bustDartTop).line(points.shoulder).hide()
      }
    }

    paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.princessSeam)
      .join(paths.armhole)
      .join(paths.shoulder)
      .join(paths.cfNeck)
      .line(points.cfWaist)
      .close()

    //stores
    store.set('princessSeamFrontLengthA', paths.princessSeam.length())

    if (complete) {
      //grainline
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfNeck
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cfWaist.shiftFractionTowards(points.waistDartLeft, 0.15)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfNeck.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      points.bustNotch = paths.princessSeam.shiftAlong(points.waistDartLeft.dist(points.bust))
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bustNotch', 'cfChest'],
      })
      //title
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Front',
        scale: 2 / 3,
      })
      if (sa) {
        const princessSa = sa * options.princessSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        points.saWaistDartLeft = utils.beamsIntersect(
          points.cfWaist.shiftTowards(points.waistDartLeft, sa).rotate(-90, points.cfWaist),
          points.waistDartLeft.shiftTowards(points.cfWaist, sa).rotate(90, points.waistDartLeft),
          points.waistDartLeft
            .shiftTowards(points.bust, princessSa)
            .rotate(-90, points.waistDartLeft),
          points.bust.shiftTowards(points.waistDartLeft, princessSa).rotate(90, points.bust)
        )

        points.saShoulderCorner = points.shoulder
          .shift(points.armholePitchCp2.angle(points.shoulder), sa * options.shoulderSaWidth * 100)
          .shift(points.hps.angle(points.shoulder), armholeSa)

        if (options.bustDartFraction > 0.01) {
          paths.saArmhole = paths.armhole.offset(armholeSa).hide()
        } else {
          if (options.bustDartFraction <= 0.01) {
            paths.saArmhole = new Path()
              .move(points.saShoulderCorner)
              .line(points.saShoulderCorner)
              .hide()
          }
        }

        points.saArmholeTop = paths.saArmhole
          .shiftFractionAlong(0.001)
          .shiftOutwards(paths.saArmhole.start(), sa)
        points.saPrincessSeamEnd = paths.princessSeam.offset(princessSa).end()

        if (
          points.saArmholeTop.y > points.saPrincessSeamEnd.y ||
          options.bustDartFraction <= 0.01
        ) {
          points.saArmholeTop = points.saPrincessSeamEnd
        }
        points.saArmholeBottom = utils.beamsIntersect(
          points.saArmholeTop,
          points.saArmholeTop.shift(-90, 1),
          paths.princessSeam.offset(princessSa).shiftFractionAlong(0.999),
          points.saPrincessSeamEnd
        )

        paths.sa = new Path()
          .move(points.saCfWaist)
          .line(points.saWaistDartLeft)
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saArmholeBottom)
          .line(points.saArmholeTop)
          .join(paths.saArmhole)
          .line(points.saShoulderCorner)
          .line(points.saHps)
          .line(paths.cfNeck.offset(neckSa).start())
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfNeck)
          .line(points.saCfWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
