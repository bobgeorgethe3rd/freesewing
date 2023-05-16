import { backBase } from './backBase.mjs'

export const back = {
  name: 'peach.back',
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
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)

    //seam paths

    const drawSeamBase = () => {
      if (options.bustDartPlacement == 'armhole')
        return new Path()
          .move(points.dartTip)
          .curve_(points.backCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
      else return new Path().move(points.dartTip).curve_(points.backCp1, points.shoulderSplit)
    }

    paths.seam = new Path()
      .move(points.waistCenter)
      .line(points.dartBottomLeft)
      .curve(points.dartLeftCp, points.dartMiddleCp, points.dartTip)
      .join(drawSeamBase())
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .curve_(points.cbNeckCp2, points.waistCenter)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cbWaist.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.dartTip = new Snippet('notch', points.dartTip)
      //title
      points.title = new Point(points.cbNeckCp1.x * (3 / 4), points.cbWaist.y / 2)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Back',
      })
      //scalebox
      points.scalebox = new Point(points.cbNeckCp1.x, points.cbArmhole.y / 2)
      macro('scalebox', {
        at: points.scalebox,
      })
      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
