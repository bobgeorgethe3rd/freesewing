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
    const keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //guides
    if (!options.daisyGuide) {
      delete paths.daisyGuide
    }
    //let's begin
    //paths
    paths.hemBase = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

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

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.topCurve)
      .join(paths.sideFrontSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.waistDartRight.shiftFractionTowards(points.sideWaist, 0.075)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.neckSideFront.y * 1.1)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //logo
      points.logo = new Point(points.scalebox.x * 1.1, points.bust.y)
      macro('logorg', {
        at: points.logo,
        scale: 1 / 3,
      })
      //title
      points.title = new Point(points.scalebox.x * 0.75, points.bust.y)
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

        points.saPoint0 = points.saPoint1
        points.saPoint1 = utils.beamsIntersect(
          points.sideWaist
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideWaist),
          points.armholeDrop
            .shiftTowards(points.sideWaist, sideSeamSa)
            .rotate(90, points.armholeDrop),
          points.armholeDrop.shiftTowards(points.armholeDropCp, sa).rotate(-90, points.armholeDrop),
          points.armholeDropCp.shiftTowards(points.armholeDrop, sa).rotate(90, points.armholeDropCp)
        )
        points.saPoint2 = utils.beamsIntersect(
          points.neckSideFrontCp
            .shiftTowards(points.neckSideFront, sideSeamSa)
            .rotate(-90, points.neckSideFrontCp),
          points.neckSideFront
            .shiftTowards(points.neckSideFrontCp, sideSeamSa)
            .rotate(90, points.neckSideFront),
          points.neckSideFront.shiftTowards(points.bustCp2, sa).rotate(-90, points.neckSideFront),
          points.bustCp2.shiftTowards(points.neckSideFront, sa).rotate(90, points.bustCp2)
        )
        points.saPoint3 = utils.beamsIntersect(
          points.waistDartRightCp
            .shiftTowards(points.waistDartRight, sideSeamSa)
            .rotate(-90, points.waistDartRightCp),
          points.waistDartRight
            .shiftTowards(points.waistDartRightCp, sideSeamSa)
            .rotate(90, points.waistDartRight),
          points.waistDartRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.waistDartRight),
          points.sideWaist.shiftTowards(points.waistDartRight, sa).rotate(90, points.sideWaist)
        )

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saPoint0)
          .line(paths.sideSeam.offset(sideSeamSa).start())
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saPoint1)
          .line(paths.topCurve.offset(sa).start())
          .join(paths.topCurve.offset(sa))
          .line(points.saPoint2)
          .line(paths.sideFrontSeam.offset(styleLineSa).start())
          .join(paths.sideFrontSeam.offset(styleLineSa))
          .line(points.saPoint3)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
