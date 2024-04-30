import { frontArmholeDart } from '@freesewing/daisy'
import { frontArmhole } from './frontArmhole.mjs'

export const sideFrontArmhole = {
  name: 'peach.sideFrontArmhole',
  after: frontArmhole,
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

    let tweak = 1
    let delta
    do {
      points.bustDartBottomCp2 = points.bustDartBottom.shiftFractionTowards(points.bust, tweak)

      paths.princessSeam = new Path()
        .move(points.bustDartBottom)
        .curve(points.bustDartBottomCp2, points.bust, points.waistDartRight)
        .hide()

      delta = paths.princessSeam.length() - store.get('princessSeamFrontLengthA')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 0.01)

    //paths
    paths.waist = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armholeR).hide()

    paths.armhole = new Path()
      .move(points.armholeR)
      .curve(points.armholeCp2R, points.armholePitchCp1R, points.armholePitchR)
      .curve_(points.armholePitchCp2R, points.shoulderR)
      .hide()

    if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
      paths.armhole = paths.armhole.split(points.bustDartBottom)[0].hide()
    } else {
      if (options.bustDartFraction >= 0.997) {
        paths.armhole = new Path().move(points.armholeR).line(points.bustDartBottom).hide()
      }
    }

    paths.seam = paths.waist
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.princessSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waistDartRight.x * 1.1, points.bust.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.waistDartRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.bustNotch = paths.princessSeam
        .reverse()
        .shiftAlong(points.waistDartLeft.dist(points.bust))
      points.sideNotch = points.sideWaist.shiftFractionTowards(points.armholeR, 0.5)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bustNotch', 'sideNotch'],
      })
      //title
      points.title = new Point(points.armholePitchCp1R.x, points.bust.y * 1.05)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Side Front',
        scale: 1 / 3,
      })

      //scalebox
      macro('scalebox', {
        at: points.scalebox,
      })
      if (sa) {
        const princessSa = sa * options.princessSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100

        points.saWaistDartRight = utils.beamsIntersect(
          points.waistDartRight
            .shiftTowards(points.bust, princessSa)
            .rotate(90, points.waistDartRight),
          points.bust.shiftTowards(points.waistDartRight, princessSa).rotate(-90, points.bust),
          points.waistDartRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.waistDartRight),
          points.sideWaist.shiftTowards(points.waistDartRight, sa).rotate(90, points.sideWaist)
        )

        points.saShoulderCorner = points.shoulderR
          .shift(
            points.armholePitchCp2R.angle(points.shoulderR),
            sa * options.shoulderSaWidth * 100
          )
          .shift(points.armholePitchCp2R.angle(points.shoulderR) - 90, armholeSa)

        points.saPrincessSeamStart = paths.princessSeam
          .offset(princessSa)
          .start()
          .shiftTowards(points.bustDartBottom, sa * (1 - options.bustDartFraction))
          .rotate(90, paths.princessSeam.offset(princessSa).start())

        if (options.bustDartFraction < 0.997) {
          paths.saArmhole = paths.armhole.offset(armholeSa).hide()
        } else {
          paths.saArmhole = new Path()
            .move(points.saArmholeCorner)
            .line(points.saArmholeCorner)
            .hide()
          points.saBustDartBottom = utils.beamsIntersect(
            points.saSideWaist,
            points.saSideWaist.shift(points.sideWaist.angle(points.armholeR), 1),
            points.saPrincessSeamStart,
            points.armholeR.rotate(90, points.saPrincessSeamStart)
          )
        }

        paths.sa = new Path()
          .move(points.saWaistDartRight)
          .line(points.saSideWaist)
          .line(points.saArmholeCorner)
          .join(paths.saArmhole)
          .line(points.saBustDartBottom)
          .line(points.saPrincessSeamStart)
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saWaistDartRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
