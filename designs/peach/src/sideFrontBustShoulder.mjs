import { frontBustShoulderDart } from '@freesewing/daisy'
import { frontBustShoulder } from './frontBustShoulder.mjs'

export const sideFrontBustShoulder = {
  name: 'peach.sideFrontBustShoulder',
  after: frontBustShoulder,
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
    frontBustShoulderDart(sh)
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('scalebox', false)
    //guides
    // paths.daisyGuide = new Path()
    // .move(points.cfWaist)
    // .line(points.waistDartLeft)
    // .line(points.waistDartTip)
    // .line(points.waistDartRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.bustDartBottom)
    // .line(points.bust)
    // .line(points.bustDartTop)
    // .line(points.hps)
    // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    // .line(points.cfWaist)
    // .attr('class', 'various lashed')
    //let's begin

    let tweak = 1
    let delta
    do {
      points.bustDartBottomCp = points.bustDartBottom.shiftFractionTowards(points.bust, tweak)

      paths.princessSeam = new Path()
        .move(points.bustDartBottom)
        .curve(points.bustDartBottomCp, points.bust, points.waistDartRight)
        .hide()

      delta = paths.princessSeam.length() - store.get('princessSeamFrontLengthBS')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    //paths
    paths.hemBase = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armhole).hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.princessSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waistDartRight.x * 1.1, points.armhole.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.waistDartRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.bustNotch = paths.princessSeam
        .reverse()
        .shiftAlong(points.waistDartLeft.dist(points.bust))
      snippets.bustNotch = new Snippet('notch', points.bustNotch)
      //title
      points.title = new Point(points.armholePitchCp1.x, points.armhole.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Side Front',
        scale: 0.5,
      })

      //scalebox
      macro('scalebox', {
        at: points.scalebox,
      })
      if (sa) {
        const princessSa = sa * options.princessSaWidth * 100

        points.saPoint0 = points.saPoint1
        points.saPoint1 = points.saPoint2
        points.saPoint2 = points.saPoint3
        points.saPoint3 = utils.beamsIntersect(
          points.saPoint3,
          points.armholePitchCp2.shiftOutwards(points.shoulder, sa),
          paths.princessSeam.offset(princessSa).start(),
          paths.princessSeam
            .offset(princessSa)
            .start()
            .shift(points.shoulder.angle(points.saShoulder) + 90, 1)
        )
        points.saPoint4 = utils.beamsIntersect(
          points.waistDartRight
            .shiftTowards(points.bust, princessSa)
            .rotate(90, points.waistDartRight),
          points.bust.shiftTowards(points.waistDartRight, princessSa).rotate(-90, points.bust),
          points.waistDartRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.waistDartRight),
          points.sideWaist.shiftTowards(points.waistDartRight, sa).rotate(90, points.sideWaist)
        )

        paths.sa = paths.hemBase
          .offset(sa)
          .line(points.saPoint0)
          .line(points.saPoint1)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .line(points.saPoint2)
          .line(points.saPoint3)
          .line(paths.princessSeam.offset(princessSa).start())
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saPoint4)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
