import { frontBustShoulderDart } from '@freesewing/daisy'

export const frontBustShoulder = {
  name: 'peach.frontBustShoulder',
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
    paths.waist = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

    paths.princessSeam = new Path()
      .move(points.waistDartLeft)
      .curve(points.bust, points.bust, points.bustDartTop)
      .hide()

    paths.shoulder = new Path().move(points.bustDartTop).line(points.hps).hide()

    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.princessSeam)
      .join(paths.shoulder)
      .join(paths.cfNeck)
      .line(points.cfWaist)
      .close()

    //stores
    store.set('princessSeamFrontLengthBS', paths.princessSeam.length())
    store.set('shoulderPlacement', points.hps.dist(points.bustDartTop))

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfNeck
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cfWaist.shiftFractionTowards(points.waistDartLeft, 0.15)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfNeck.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      points.bustNotch = paths.princessSeam.shiftAlong(points.waistDartLeft.dist(points.bust))
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bustNotch', 'cfChest'],
      })
      //title
      points.title = new Point(points.bust.x / 2, points.bust.y * 0.75)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Front',
        cutNr: titleCutNum,
        scale: 2 / 3,
      })
      if (sa) {
        const princessSa = sa * options.princessSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        points.saWaistDartLeft = utils.beamsIntersect(
          points.cfWaist.shiftTowards(points.waistDartLeft, sa).rotate(-90, points.cfWaist),
          points.waistDartLeft.shiftTowards(points.cfWaist, sa).rotate(90, points.waistDartLeft),
          points.waistDartLeft
            .shiftTowards(points.bust, princessSa)
            .rotate(-90, points.waistDartLeft),
          points.bust.shiftTowards(points.waistDartLeft, princessSa).rotate(90, points.bust)
        )

        points.saBustDartTop = utils.beamsIntersect(
          points.hps.shiftTowards(points.shoulderAnchor, shoulderSa).rotate(90, points.hps),
          points.shoulderAnchor
            .shiftTowards(points.hps, shoulderSa)
            .rotate(-90, points.shoulderAnchor),
          points.bust.shiftTowards(points.bustDartTop, princessSa).rotate(-90, points.bust),
          points.bustDartTop.shiftTowards(points.bust, princessSa).rotate(90, points.bustDartTop)
        )

        paths.sa = new Path()
          .move(points.saCfWaist)
          .line(points.saWaistDartLeft)
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saBustDartTop)
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
