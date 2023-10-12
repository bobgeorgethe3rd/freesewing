import { backBase } from './backBase.mjs'

export const centreBack = {
  name: 'sammie.centreBack',
  from: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Construction
    closurePosition: { dflt: 'back', list: ['back', 'side', 'front'], menu: 'construction' },
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
    //remove paths & snippets
    let keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //let's begin
    //paths
    const drawCB = () => {
      if (options.centreBackFold || options.backDrop > 0.997) {
        return new Path().move(points.cbTop).line(points.cbWaistNew)
      } else {
        return new Path()
          .move(points.cbNeck)
          .curve_(points.cbNeckCp2, points.waistCenter)
          .split(points.cbTop)[1]
      }
    }

    paths.saBase = new Path()
      .move(drawCB().end())
      .line(points.dartBottomLeft)
      .join(
        new Path()
          .move(points.dartBottomLeft)
          .curve_(points.dartLeftCp, points.dartTip)
          .split(points.dartLeftSplit)[0]
      )
      ._curve(points.cbTopCp1, points.cbTop)
      .hide()

    paths.seam = paths.saBase.join(drawCB())

    if (complete) {
      //grainline
      let cbSa
      if (
        options.centreBackFold &&
        options.closurePosition != 'back' &&
        options.backDrop <= 0.997
      ) {
        cbSa = 0
        points.cutOnFoldFrom = points.cbTop
        points.cutOnFoldTo = points.cbWaistNew
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        cbSa = sa
        points.grainlineFrom = new Path()
          .move(points.dartLeftSplit)
          ._curve(points.cbTopCp1, points.cbTop)
          .shiftFractionAlong(0.5)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.dartBottomLeft.y)

        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      points.cbNotch = drawCB().shiftFractionAlong(0.5)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['dartLeftNotch', 'cbNotch'],
      })
      //title
      points.title = new Point(
        points.cbTop.shiftFractionTowards(points.dartLeftSplit, 2 / 3).x,
        (points.cbNotch.y + points.dartLeftNotch.y) / 2
      )
      macro('title', {
        nr: 4,
        title: 'Centre Back',
        at: points.title,
        scale: 0.4,
      })

      if (sa) {
        if (options.backDrop == 1) {
          paths.sa = paths.saBase
            .offset(sa)
            .line(points.cbTopCp1.shiftOutwards(points.cbTop, sa))
            .close()
            .attr('class', 'fabric sa')
        } else {
          paths.sa = paths.saBase
            .offset(sa)
            .join(drawCB().offset(cbSa))
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
