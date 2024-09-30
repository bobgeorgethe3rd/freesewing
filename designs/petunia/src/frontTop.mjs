import { frontBase } from './frontBase.mjs'

export const frontTop = {
  name: 'petunia.frontTop',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
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
    log,
  }) => {
    //removing paths and snippets not required from Bella
    if (options.daisyGuides) {
      const keepThese = 'daisyGuide'
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    macro('cutonfold', false)
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.cfNeck)
      .curve(points.cfNeckCp2, points.sideWaistCp1, points.sideWaist)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.cfNeck = new Path()
      .move(points.shoulderTop)
      ._curve(points.shoulderTopCp2, points.cfNeck)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.armhole)
      .line(points.shoulderTop)
      .join(paths.cfNeck)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.cfNeck
      points.grainlineTo = points.grainlineFrom
        .shiftTowards(points.cfNeckCp2, points.grainlineFrom.dist(points.armholePitchCp1))
        .rotate(45, points.grainlineFrom)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfNeck', 'armholePitch'],
      })
      //title
      points.title = new Point(points.bust.x, (points.cfNeck.y + points.armholePitch.y) / 2)
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'Front Top',
        cutNr: 2,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = new Point(
        (points.armholePitch.x + points.armholeCp2.x) / 2,
        points.sideChest.y
      )
      macro('scalebox', {
        at: points.scalebox,
      })
      //ease
      paths.hemBase
        .unhide()
        .attr('class', 'fabric hidden')
        .attr('data-text', 'Ease')
        .attr('data-text-class', 'center')
      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100

        points.saSideWaist = utils.beamsIntersect(
          points.sideWaistCp1.shiftTowards(points.sideWaist, sa).rotate(-90, points.sideWaistCp1),
          points.sideWaist.shiftTowards(points.sideWaistCp1, sa).rotate(90, points.sideWaist),
          points.saArmholeCorner,
          points.saSideWaist
        )

        points.saShoulderTop = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saHps,
          points.shoulderTop
            .shiftTowards(points.shoulderTopCp2, neckSa)
            .rotate(-90, points.shoulderTop),
          points.shoulderTopCp2
            .shiftTowards(points.shoulderTop, neckSa)
            .rotate(90, points.shoulderTopCp2)
        )

        points.saCfNeck = utils.beamsIntersect(
          points.shoulderTopCp2
            .shiftTowards(points.cfNeck, neckSa)
            .rotate(-90, points.shoulderTopCp2),
          points.cfNeck.shiftTowards(points.shoulderTopCp2, neckSa).rotate(90, points.cfNeck),
          points.cfNeck.shiftTowards(points.cfNeckCp2, sa).rotate(-90, points.cfNeck),
          points.cfNeckCp2.shiftTowards(points.cfNeck, sa).rotate(90, points.cfNeckCp2)
        )

        paths.sa = paths.hemBase
          .offset(sa)
          .line(points.saSideWaist)
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfNeck)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
