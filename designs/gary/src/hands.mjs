import { util } from 'chai'
import { arms } from './arms.mjs'

export const hands = {
  name: 'gary.hands',
  after: arms,
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    paperless,
    macro,
    utils,
    snippets,
    Snippet,
    part,
  }) => {
    //measures
    const armWidth = store.get('armWidth')
    //let's begin
    points.topMid = new Point(0, 0)
    points.topLeft = points.topMid.shift(180, armWidth / 2)
    points.curveStart = points.topLeft.shift(-90, 40 * options.scale)
    points.curveMid = points.topMid.shift(-90, 45 * options.scale)
    points.peakLeft = new Point((points.topLeft.x * 2) / 3, 52 * options.scale)
    points.peakLeftCp1 = new Point(points.topLeft.x, points.peakLeft.y)
    points.peakLeftCp2 = utils.beamIntersectsY(
      points.curveMid,
      points.curveMid.shift(235, 1),
      points.peakLeft.y
    )

    paths.seamBase = new Path()
      .move(points.topMid)
      .line(points.topLeft)
      .line(points.curveStart)
      ._curve(points.peakLeftCp1, points.peakLeft)
      .curve_(points.peakLeftCp2, points.curveMid)
      .hide()

    macro('mirror', {
      mirror: [points.topMid, points.curveMid],
      paths: ['seamBase'],
      prefix: 'm',
    })

    paths.seam = paths.seamBase.join(paths.mSeamBase.reverse()).close()

    //details
    //grainline
    points.grainlineFrom = points.topMid
    points.grainlineTo = points.curveMid
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //notches
    snippets.notch = new Snippet('notch', points.curveMid)
    //title
    points.title = new Point(points.topLeft.x / 3, points.peakLeft.y / 2).flipX()
    macro('title', {
      at: points.title,
      nr: '7',
      title: 'hand',
      scale: 0.25 * options.scale,
    })
    if (sa) {
      points.saPeakLeft = points.peakLeft.shift(-90, sa)
      points.saCurveMid = points.curveMid.shift(315, sa)
      points.saPeakLeftCp2 = utils.beamIntersectsY(
        points.saCurveMid,
        points.saCurveMid.shift(235, 1),
        points.saPeakLeft.y
      )
      points.saSplit = utils.curveIntersectsX(
        points.saPeakLeft,
        points.saPeakLeftCp2,
        points.saCurveMid,
        points.saCurveMid,
        points.curveMid.x
      )

      paths.saBase = new Path()
        .move(points.topMid)
        .line(points.topLeft)
        .line(points.curveStart)
        ._curve(points.peakLeftCp1, points.peakLeft)
        .offset(sa)
        .curve_(points.saPeakLeftCp2, points.saCurveMid)
        .split(points.saSplit)[0]
        .hide()

      macro('mirror', {
        mirror: [points.topMid, points.curveMid],
        paths: ['saBase'],
        prefix: 'm',
      })

      paths.sa = paths.saBase.join(paths.mSaBase.reverse()).close().attr('class', 'fabric sa')
    }

    return part
  },
}
