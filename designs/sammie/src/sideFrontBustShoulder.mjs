import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { frontBaseBustShoulder } from './frontBaseBustShoulder.mjs'

export const sideFrontBustShoulder = {
  name: 'sammie.sideFrontBustShoulder',
  plugins: [pluginLogoRG],
  draft: (sh) => {
    const {
      store,
      sa,
      Point,
      points,
      Path,
      paths,
      options,
      absoluteOptions,
      complete,
      paperless,
      macro,
      utils,
      measurements,
      part,
      snippets,
      Snippet,
    } = sh

    frontBaseBustShoulder.draft(sh)
    //removing paths and snippets not required from Daisy
    //keep specific inherited paths
    const keepThese = 'daisyGuides'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    macro('cutonfold', false)
    //guides
    if (!options.daisyGuides) {
      delete paths.daisyGuides
    }
    //let's begin
    //paths
    paths.waist = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armholeDrop).hide()

    paths.topCurve = new Path()
      .move(points.armholeDrop)
      .curve(points.armholeDropCp, points.neckSideFrontCp, points.neckSideFront)
      .hide()

    paths.sideFrontSeam = new Path()
      .move(points.neckSideFront)
      ._curve(points.bustCp2, points.bust)
      .curve(points.bustCp1, points.waistDartRightCp, points.waistDartRight)
      .hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.sideSeam)
      .join(paths.topCurve)
      .join(paths.sideFrontSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.waistDartRight.shiftFractionTowards(points.sideWaist, 0.075)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.bustCp2.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.sideNotch = points.sideWaist.shiftFractionTowards(points.armholeDrop, 0.5)
      snippets.sideNotch = new Snippet('notch', points.sideNotch)
      //title
      points.title = new Point(points.scalebox.x * 0.75, points.armhole.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Side Front',
        cutNr: 2,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(points.scalebox.x * 1.1, points.bust.y)
      macro('logorg', {
        at: points.logo,
        scale: 1 / 3,
      })
      //scalebox
      macro('scalebox', {
        at: points.scalebox,
      })
      if (sa) {
        const styleLineSa = sa * options.styleLinesSaWidth * 100
        let sideSeamSa
        if (
          options.closurePosition == 'side' ||
          options.closurePosition == 'sideLeft' ||
          options.closurePosition == 'sideRight'
        ) {
          sideSeamSa = sa * options.closureSaWidth * 100
        } else {
          sideSeamSa = sa * options.sideSeamSaWidth * 100
        }

        points.saWaistDartRight = utils.beamsIntersect(
          points.waistDartRightCp
            .shiftTowards(points.waistDartRight, styleLineSa)
            .rotate(-90, points.waistDartRightCp),
          points.waistDartRight
            .shiftTowards(points.waistDartRightCp, styleLineSa)
            .rotate(90, points.waistDartRight),
          points.waistDartRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.waistDartRight),
          points.sideWaist.shiftTowards(points.waistDartRight, sa).rotate(90, points.sideWaist)
        )

        points.saArmholeDrop = utils.beamsIntersect(
          points.sideWaist
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideWaist),
          points.armholeDrop
            .shiftTowards(points.sideWaist, sideSeamSa)
            .rotate(90, points.armholeDrop),
          points.armholeDrop.shiftTowards(points.armholeDropCp, sa).rotate(-90, points.armholeDrop),
          points.armholeDropCp.shiftTowards(points.armholeDrop, sa).rotate(90, points.armholeDropCp)
        )
        points.saNeckSideFront = utils.beamsIntersect(
          points.neckSideFrontCp
            .shiftTowards(points.neckSideFront, sa)
            .rotate(-90, points.neckSideFrontCp),
          points.neckSideFront
            .shiftTowards(points.neckSideFrontCp, sa)
            .rotate(90, points.neckSideFront),
          points.neckSideFront
            .shiftTowards(points.bustCp2, styleLineSa)
            .rotate(-90, points.neckSideFront),
          points.bustCp2.shiftTowards(points.neckSideFront, styleLineSa).rotate(90, points.bustCp2)
        )

        paths.sa = new Path()
          .move(points.saWaistDartRight)
          .line(points.saSideWaist)
          .line(paths.sideSeam.offset(sideSeamSa).start())
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeDrop)
          .line(paths.topCurve.offset(sa).start())
          .join(paths.topCurve.offset(sa))
          .line(points.saNeckSideFront)
          .line(paths.sideFrontSeam.offset(styleLineSa).start())
          .join(paths.sideFrontSeam.offset(styleLineSa))
          .line(points.saWaistDartRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
