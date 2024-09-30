import { frontShoulderDart } from '@freesewing/daisy'
import { frontShoulder } from './frontShoulder.mjs'

export const sideFrontShoulder = {
  name: 'peach.sideFrontShoulder',
  after: frontShoulder,
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
    frontShoulderDart(sh)
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('scalebox', false)
    macro('cutonfold', false)
    //guides
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.bust)
        .line(points.waistDartRight)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.bustDartBottom)
        .line(points.bust)
        .line(points.bustDartTop)
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

      delta = paths.princessSeam.length() - store.get('princessSeamFrontLengthS')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 0.01)

    //paths
    paths.waist = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armhole).hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.hps).hide()

    paths.seam = paths.waist
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
      points.sideNotch = points.sideWaist.shiftFractionTowards(points.armhole, 0.5)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bustNotch', 'sideNotch'],
      })
      //title
      points.title = new Point(points.armholePitchCp1.x, points.armhole.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Side Front',
        cutNr: 2,
        scale: 0.5,
      })

      //scalebox
      macro('scalebox', {
        at: points.scalebox,
      })
      if (sa) {
        const princessSa = sa * options.princessSaWidth * 100

        points.saPrincessSeamStart = paths.princessSeam.offset(princessSa).start()

        points.saBustDartBottom = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.armholePitchCp2.angle(points.shoulder) + 90, 1),
          points.saPrincessSeamStart,
          points.bustDartBottom.rotate(90, points.saPrincessSeamStart)
        )
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

        paths.sa = new Path()
          .line(points.saWaistDartRight)
          .line(points.saSideWaist)
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
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
