import { frontBase } from './frontBase.mjs'

export const sideFront = {
  name: 'peach.sideFront',
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
  }) => {
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)

    //seam paths
    const drawSaBase = () => {
      if (options.bustDartPlacement == 'armhole')
        return new Path()
          .move(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
      else
        return new Path()
          .move(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
          .line(points.bustDartBottom)
    }

    paths.seam = new Path()
      .move(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .join(drawSaBase())
      .curve(points.bustDartCpBottom, points.bustDartCpMiddle, points.bust)
      .curve(points.waistDartMiddleCp, points.waistDartRightCp, points.waistDartRight)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.armholePitchCp1.x, points.armhole.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.waistDartRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.bust = new Snippet('notch', points.bust)
      //title
      points.title = new Point(points.waistDartRightCp.x, points.waistDartRightCp.y * 0.9)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Side Front',
      })

      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
