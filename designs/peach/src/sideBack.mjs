import { backBase } from './backBase.mjs'

export const sideBack = {
  name: 'peach.sideBack',
  from: backBase,
  hideDependencies: true,
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
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)

    //seam paths

    const drawSeamBase = () => {
      if (options.bustDartPlacement == 'armhole')
        return new Path().move(points.armholePitch)._curve(points.backCp1, points.dartTip)
      else
        return new Path()
          .move(points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
          .line(points.shoulderSplit)
          ._curve(points.backCp1, points.dartTip)
    }

    paths.seam = new Path()
      .move(points.dartTip)
      .curve(points.dartMiddleCp, points.dartRightCp, points.dartBottomRight)
      .line(points.waistSide)
      .curve_(points.waistSideCp2, points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .join(drawSeamBase())
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.armholeCp2
      points.grainlineTo = new Point(points.armholeCp2.x, points.waistSide.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.dartTip = new Snippet('notch', points.dartTip)
      //title
      points.title = new Point(points.dartRightCp.x * 1.1, points.dartRightCp.y)
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Side Back',
      })
      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
