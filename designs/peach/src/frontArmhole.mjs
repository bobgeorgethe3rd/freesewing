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
    // paths.armhole = new Path()
    // .move(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .hide()

    // paths.armholeR = new Path()
    // .move(points.armholeR)
    // .curve(points.armholeCp2R, points.armholePitchCp1R, points.armholePitchR)
    // .curve_(points.armholePitchCp2R, points.shoulderR)
    // .hide()

    // if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
    // paths.armhole = paths.armhole.split(points.bustDartTop)[1]
    // paths.armholeR = paths.armholeR.split(points.bustDartBottom)[0]
    // }
    // else {
    // if (options.bustDartFraction<= 0.01) {
    // paths.armhole = new Path()
    // .move(points.bustDartTop)
    // .line(points.shoulder)
    // .hide()
    // }
    // else {
    // paths.armholeR = new Path()
    // .move(points.armholeR)
    // .line(points.bustDartBottom)
    // .hide()
    // }

    // }

    // paths.daisyGuide = new Path()
    // .move(points.cfWaist)
    // .line(points.waistDartLeft)
    // .line(points.waistDartTip)
    // .line(points.waistDartRight)
    // .line(points.sideWaist)
    // .line(points.armholeR)
    // .join(paths.armholeR)
    // .line(points.bust)
    // .line(points.bustDartTop)
    // .join(paths.armhole)
    // .line(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    // .line(points.cfWaist)
    // .attr('class', 'various lashed')

    //let's begin
    paths.hemBase = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

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

    paths.seam = paths.hemBase
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
      points.cutOnFoldFrom = points.cfNeck
      points.cutOnFoldTo = points.cfWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
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
        const armholeSa = sa * options.armholeSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        points.saPoint0 = utils.beamsIntersect(
          points.cfWaist.shiftTowards(points.waistDartLeft, sa).rotate(-90, points.cfWaist),
          points.waistDartLeft.shiftTowards(points.cfWaist, sa).rotate(90, points.waistDartLeft),
          points.waistDartLeft
            .shiftTowards(points.bust, princessSa)
            .rotate(-90, points.waistDartLeft),
          points.bust.shiftTowards(points.waistDartLeft, princessSa).rotate(90, points.bust)
        )

        points.princessEnd = paths.princessSeam.offset(princessSa).end()

        points.saPoint1 = utils.beamsIntersect(
          points.saArmholeTopSplit,
          points.saArmholeTopSplit.shift(-90, 1),
          points.princessEnd,
          paths.princessSeam.offset(princessSa).shiftFractionAlong(0.99)
        )

        if (
          points.saPoint1.y > points.princessEnd ||
          points.saPoint1.y < points.saArmholeTopSplit.y
        ) {
          points.saPoint1 = points.saArmholeTopSplit
        }

        points.saPoint2 = points.shoulder
          .shift(points.hps.angle(points.shoulder), armholeSa)
          .shift(points.hps.angle(points.shoulder) + 90, shoulderSa)

        points.saPoint3 = points.saPoint5

        paths.saArmhole = new Path()
          .move(points.saArmhole)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .line(points.saPoint2)
          .hide()

        if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
          paths.saArmhole = paths.saArmhole.split(points.saArmholeTopSplit)[1].hide()
        } else {
          if (options.bustDartFraction <= 0.01) {
            paths.saArmhole = new Path().move(points.saPoint2).line(points.saPoint2).hide()
          }
        }

        paths.sa = paths.hemBase
          .offset(sa)
          .line(points.saPoint0)
          .line(paths.princessSeam.offset(princessSa).start())
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saPoint1)
          .line(points.saArmholeTopSplit)
          .join(paths.saArmhole)
          .line(points.saPoint2)
          .line(points.saPoint3)
          .line(paths.cfNeck.offset(neckSa).start())
          .join(paths.cfNeck.offset(neckSa))
          .line(points.cfWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
