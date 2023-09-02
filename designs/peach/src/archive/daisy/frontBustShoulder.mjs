import { frontBaseBustShoulder } from './frontBaseBustShoulder.mjs'

export const frontBustShoulder = {
  name: 'peach.frontBustShoulder',
  from: frontBaseBustShoulder.from,
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
    frontBaseBustShoulder.draft(sh)
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    //let's begin
    paths.hemBase = new Path().move(points.cfWaist).line(points.waistDartLeft).hide()

    paths.princessSeam = new Path()
      .move(points.waistDartLeft)
      .curve(points.waistDartLeftCp, points.waistDartMidCp, points.bust)
      .curve(points.bustDartMidCp, points.bustDartTopCp, points.bustDartTop)
      .hide()

    paths.shoulder = new Path().move(points.bustDartTop).line(points.hps).hide()

    paths.cfNeck = new Path()
      .move(points.hps)
      .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.princessSeam)
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
      points.title = new Point(points.bust.x / 2, points.bust.y / 2)
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

        points.saPoint1 = utils.beamsIntersect(
          points.hps.shiftTowards(points.shoulderAnchor, shoulderSa).rotate(90, points.hps),
          points.shoulderAnchor
            .shiftTowards(points.hps, shoulderSa)
            .rotate(-90, points.shoulderAnchor),
          points.bustDartTopCp
            .shiftTowards(points.bustDartTop, princessSa)
            .rotate(-90, points.bustDartTopCp),
          points.bustDartTop
            .shiftTowards(points.bustDartTopCp, princessSa)
            .rotate(90, points.bustDartTop)
        )

        points.saPoint2 = points.saPoint6

        paths.sa = paths.hemBase
          .offset(sa)
          .line(points.saPoint0)
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saPoint1)
          .line(points.saPoint2)
          .line(paths.cfNeck.offset(neckSa).start())
          .join(paths.cfNeck.offset(neckSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
