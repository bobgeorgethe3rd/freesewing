import { frontBaseArmhole } from './frontBaseArmhole.mjs'

export const sideFrontArmhole = {
  name: 'peach.sideFrontArmhole',
  from: frontBaseArmhole.from,
  hide: {
    from: true,
  },
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
    frontBaseArmhole.draft(sh)
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    //let's begin
    paths.hemBase = new Path().move(points.waistDartRight).line(points.sideWaist).hide()

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

    paths.princessSeam = new Path()
      .move(points.bustDartBottom)
      ._curve(points.bustDartBottomCp, points.bust)
      .curve(points.bustCp2, points.waistDartRightCp, points.waistDartRight)
      .hide()

    paths.seam = paths.hemBase
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.princessSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waistDartRight.x * 1.1, points.armholeCp2R.y * 0.9)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.waistDartRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.armholePitchCp1R.x, points.armholeR.y)
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

        points.saPoint2 = utils.beamsIntersect(
          points.waistDartRight
            .shiftTowards(points.waistDartRightCp, princessSa)
            .rotate(90, points.waistDartRight),
          points.waistDartRightCp
            .shiftTowards(points.waistDartRight, princessSa)
            .rotate(-90, points.waistDartRightCp),
          points.waistDartRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.waistDartRight),
          points.sideWaist.shiftTowards(points.waistDartRight, sa).rotate(90, points.sideWaist)
        )

        paths.saArmhole = new Path()
          .move(points.saArmholeR)
          .curve(points.saArmholeCp2R, points.saArmholePitchCp1R, points.saArmholePitchR)
          .curve_(points.saArmholePitchCp2R, points.saShoulderR)
          .line(points.saPoint4R)
          .hide()

        if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
          paths.saArmhole = paths.saArmhole.split(points.saArmholeBottomSplit)[0].hide()
        } else {
          if (options.bustDartFraction >= 0.997) {
            paths.saArmhole = new Path()
              .move(points.saArmholeR)
              .line(points.saArmholeBottomSplit)
              .hide()
          }
        }

        paths.sa = paths.hemBase
          .offset(sa)
          .line(points.saPoint0)
          .line(points.saPoint1)
          .join(paths.saArmhole)
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saPoint2)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
