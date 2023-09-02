import { backBase } from './backBase.mjs'

export const back = {
  name: 'sammie.back',
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
    paths.hemBase = new Path().move(points.cbWaist).line(points.dartBottomLeft).hide()

    paths.sideBackSeam = new Path().move(points.dartBottomLeft).line(points.dartTopLeft).hide()

    paths.topCurve = new Path()
      .move(points.dartTopLeft)
      ._curve(points.dartTopLeftCp, points.cbTop)
      .hide()

    paths.cb = new Path().move(points.cbTop).line(points.cbWaist).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideBackSeam)
      .join(paths.topCurve)
      .join(paths.cb)
      .close()

    if (complete) {
      //grainline
      if (options.closurePosition == 'back' || options.cbSaWidth > 0) {
        points.grainlineFrom = new Point(
          points.dartBottomLeft.x * 0.85,
          (points.dartTopLeft.y + points.cbTop.y) / 2
        )
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      } else {
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //notches
      points.sideBackSeamNotch = points.dartBottomLeft.shiftFractionTowards(points.dartTopLeft, 0.5)
      points.cbNotch = new Point(points.cbTop.x, points.sideBackSeamNotch.y)
      snippets.sideBackSeamNotch = new Snippet('bnotch', points.sideBackSeamNotch)
      if (points.cbNotch.y > points.cbTop.y) {
        snippets.cbNotch = new Snippet('bnotch', points.cbNotch)
      }
      //title
      points.title = new Point(
        points.dartBottomLeft.shiftFractionTowards(points.dartTopLeft, 0.5).x / 3,
        points.dartBottomLeft.shiftFractionTowards(points.dartTopLeft, 0.5).y
      )
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Back',
        scale: 0.5,
      })
      if (points.title.y < points.cbTop.y) {
        macro('bannerbox', {
          topLeft: new Point(points.cbWaist.x - sa - 15, points.dartTopLeft.y - sa - 15),
          bottomRight: new Point(points.dartTopLeft.x + sa + 15, points.dartBottomLeft.y + sa + 15),
          text: 'bounding box please disregard',
          ...store.get('bannerbox.macro'),
        })
      }
      if (sa) {
        const styleLineSa = sa * options.styleLinesSaWidth * 100
        let cbSa
        if (options.closurePosition == 'back') {
          cbSa = sa * options.closureSaWidth * 100
        } else {
          cbSa = sa * options.cbSaWidth * 100
        }

        points.saPoint0 = utils.beamsIntersect(
          points.cbWaist.shiftTowards(points.dartBottomLeft, sa).rotate(-90, points.cbWaist),
          points.dartBottomLeft.shiftTowards(points.cbWaist, sa).rotate(90, points.dartBottomLeft),
          points.dartBottomLeft
            .shiftTowards(points.dartTopLeft, styleLineSa)
            .rotate(-90, points.dartBottomLeft),
          points.dartTopLeft
            .shiftTowards(points.dartBottomLeft, styleLineSa)
            .rotate(90, points.dartTopLeft)
        )
        points.saPoint1 = utils.beamsIntersect(
          points.dartBottomLeft
            .shiftTowards(points.dartTopLeft, styleLineSa)
            .rotate(-90, points.dartBottomLeft),
          points.dartTopLeft
            .shiftTowards(points.dartBottomLeft, styleLineSa)
            .rotate(90, points.dartTopLeft),
          points.dartTopLeft.shiftTowards(points.dartTopLeftCp, sa).rotate(-90, points.dartTopLeft),
          points.dartTopLeftCp.shiftTowards(points.dartTopLeft, sa).rotate(90, points.dartTopLeftCp)
        )
        points.saPoint2 = points.cbTop.translate(-cbSa, -sa)
        points.saPoint3 = points.cbWaist.translate(-cbSa, sa)

        if (options.backDrop == 1 && options.closurePosition != 'back' && options.cbSaWidth == 0) {
          macro('cutonfold', {
            from: points.saPoint2,
            to: points.saPoint3,
            grainline: true,
          })
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saPoint0)
          .line(paths.sideBackSeam.offset(styleLineSa).start())
          .join(paths.sideBackSeam.offset(styleLineSa))
          .line(points.saPoint1)
          .line(paths.topCurve.offset(sa).start())
          .join(paths.topCurve.offset(sa))
          .line(points.saPoint2)
          .line(points.saPoint3)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
