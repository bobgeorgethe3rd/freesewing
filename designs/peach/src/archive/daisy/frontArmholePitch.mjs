import { frontBaseArmholePitch } from './frontBaseArmholePitch.mjs'

export const frontArmholePitch = {
  name: 'peach.frontArmholePitch',
  from: frontBaseArmholePitch.from,
  options: {
    //Constant
    neckSaWidth: 0.01,
    //Construction
    princessSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
  },
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
    frontBaseArmholePitch.draft(sh)
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    //let's begin
    paths.hemBase = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

    paths.princessSeam = new Path()
      .move(points.waistDartLeft)
      .line(points.bust)
      .curve_(points.bustDartTopCp, points.bustDartTop)
      .hide()

    paths.armhole = new Path()
      .move(points.bustDartTop)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

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
      snippets.cfChest = new Snippet('notch', points.cfChest)
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
        const neckSa = sa * options.neckSaWidth * 100
        points.saPoint0 = utils.beamsIntersect(
          points.cfWaist.shiftTowards(points.waistDartLeft, sa).rotate(-90, points.cfWaist),
          points.waistDartLeft.shiftTowards(points.cfWaist, sa).rotate(90, points.waistDartLeft),
          points.waistDartLeft
            .shiftTowards(points.bust, princessSa)
            .rotate(-90, points.waistDartLeft),
          points.bust.shiftTowards(points.waistDartLeft, princessSa).rotate(90, points.bust)
        )

        points.saPoint1 = points.bust
          .shiftTowards(points.waistDartLeft, princessSa)
          .rotate(90, points.bust)

        points.saPoint2 = points.armholePitchCp2
          .shiftOutwards(points.bustDartTop, princessSa)
          .shift(0, armholeSa)
        points.saBustDartTopCp = utils.beamsIntersect(
          points.saPoint2,
          points.saPoint2.shift(180, 1),
          points.waistDartLeft
            .shiftTowards(points.bust, princessSa)
            .rotate(-90, points.waistDartLeft),
          points.bust.shiftTowards(points.waistDartLeft, princessSa).rotate(90, points.bust)
        )
        points.saPoint3 = points.saPoint4
        points.saPoint4 = points.saPoint5

        paths.sa = paths.hemBase
          .offset(sa)
          .line(points.saPoint0)
          .line(points.saPoint1)
          .curve_(points.saBustDartTopCp, points.saPoint2)
          .line(points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .line(points.saPoint3)
          .line(points.saPoint4)
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
