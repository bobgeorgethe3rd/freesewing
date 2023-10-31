import { backBase } from './backBase.mjs'

export const sideBack = {
  name: 'sammie.sideBack',
  from: backBase,
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
  }) => {
    //removing paths and snippets not required from Daisy
    //keep specific inherited paths
    const keepThese = 'daisyGuides'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //guides
    if (!options.daisyGuides) {
      delete paths.daisyGuides
    }
    //measures
    const backDartAngle =
      points.dartTip.angle(points.dartBottomRight) - points.dartTip.angle(points.dartBottomLeft)
    //let's begin
    //paths
    paths.waist = new Path().move(points.dartBottomRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armholeDrop).hide()

    paths.topCurve = new Path()
      .move(points.armholeDrop)
      .curve(
        points.dartTopRightCp,
        points.dartTopLeftCp.rotate(backDartAngle, points.dartTip),
        points.cbTop.rotate(backDartAngle, points.dartTip)
      )
      .split(points.dartTopRight)[0]
      .hide()

    paths.sideBackSeam = new Path().move(points.dartTopRight).line(points.dartBottomRight).hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.sideSeam)
      .join(paths.topCurve)
      .join(paths.sideBackSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.dartBottomRight.shiftFractionTowards(points.sideWaist, 0.075)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.dartTopRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.sideBackSeamNotch = points.dartBottomRight.shiftFractionTowards(
        points.dartTopRight,
        0.5
      )
      snippets.sideBackSeamNotch = new Snippet('bnotch', points.sideBackSeamNotch)
      //title
      points.title = new Point(
        points.dartTopRightCp.x,
        ((points.dartBottomRight.y + points.dartTopRight.y) / 2) * 0.975
      )
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Side Back',
        scale: 0.5,
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

        points.saDartBottomRight = utils.beamsIntersect(
          points.dartTopRight
            .shiftTowards(points.dartBottomRight, styleLineSa)
            .rotate(-90, points.dartTopRight),
          points.dartBottomRight
            .shiftTowards(points.dartTopRight, styleLineSa)
            .rotate(90, points.dartBottomRight),
          points.dartBottomRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.dartBottomRight),
          points.sideWaist.shiftTowards(points.dartBottomRight, sa).rotate(90, points.sideWaist)
        )

        points.saArmholeDrop = utils.beamsIntersect(
          points.sideWaist
            .shiftTowards(points.armholeDrop, sideSeamSa)
            .rotate(-90, points.sideWaist),
          points.armholeDrop
            .shiftTowards(points.sideWaist, sideSeamSa)
            .rotate(90, points.armholeDrop),
          points.armholeDrop
            .shiftTowards(points.dartTopRightCp, sa)
            .rotate(-90, points.armholeDrop),
          points.dartTopRightCp
            .shiftTowards(points.armholeDrop, sa)
            .rotate(90, points.dartTopRightCp)
        )
        points.saDartTopRight = utils.beamsIntersect(
          points.dartTopRightCp
            .shiftTowards(points.dartTopRight, sa)
            .rotate(-90, points.dartTopRightCp),
          points.dartTopRight
            .shiftTowards(points.dartTopRightCp, sa)
            .rotate(90, points.dartTopRight),
          points.dartTopRight
            .shiftTowards(points.dartBottomRight, styleLineSa)
            .rotate(-90, points.dartTopRight),
          points.dartBottomRight
            .shiftTowards(points.dartTopRight, styleLineSa)
            .rotate(90, points.dartBottomRight)
        )

        paths.sa = new Path()
          .move(points.saDartBottomRight)
          .line(points.saSideWaist)
          .line(paths.sideSeam.offset(sideSeamSa).start())
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeDrop)
          .line(paths.topCurve.offset(sa).start())
          .join(paths.topCurve.offset(sa))
          .line(points.saDartTopRight)
          .line(paths.sideBackSeam.offset(styleLineSa).start())
          .join(paths.sideBackSeam.offset(styleLineSa))
          .line(points.saDartBottomRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
