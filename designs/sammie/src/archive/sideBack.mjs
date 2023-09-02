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
    //remove paths & snippets
    let keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //let's begin
    //paths
    paths.seam = new Path()
      .move(points.dartBottomRight)
      .line(points.waistSide)
      .join(
        new Path()
          .move(points.waistSide)
          .curve_(points.waistSideCp2, points.armhole)
          .split(points.armholeDrop)[0]
      )
      ._curve(points.dartRightSplitCp1, points.dartRightSplit)
      .join(
        new Path()
          .move(points.dartTip)
          ._curve(points.dartRightCp, points.dartBottomRight)
          .split(points.dartRightSplit)[1]
      )
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Path()
        .move(points.armholeDrop)
        ._curve(points.dartRightSplitCp1, points.dartRightSplit)
        .shiftFractionAlong(0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.waistSide.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })

      //notches
      snippets.dartRightNotch = new Snippet('bnotch', points.dartRightNotch)

      //title
      points.title = points.dartRightSplit
        .shiftFractionTowards(points.armholeDrop, 2 / 3)
        .shift(-90, store.get('sideLength') / 2)
      macro('title', {
        nr: 3,
        title: 'Side Back',
        at: points.title,
        scale: 0.4,
      })

      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
