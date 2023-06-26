import { back as backDaisy } from '@freesewing/daisy'
import { front as frontDaisy } from '@freesewing/daisy'

export const backBase = {
  name: 'sammie.backBase',
  from: backDaisy,
  after: frontDaisy,
  hide: {
    from: true,
    after: true,
    inherited: true,
  },
  options: {
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    //Style
    armholeDrop: { pct: 15, min: 10, max: 50, menu: 'style' },
    backDrop: { pct: 0, min: 0, max: 100, menu: 'style' },
    straightBack: { bool: false, menu: 'style' },
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
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    //let's begin
    //side
    paths.side = new Path()
      .move(points.waistSide)
      .curve_(points.waistSideCp2, points.armhole)
      .hide()

    points.armholeDrop = paths.side.shiftFractionAlong(1 - options.armholeDrop)

    //centre back
    points.cbSplit = utils.lineIntersectsCurve(
      points.armholeDrop,
      points.armholeDrop.shift(180, measurements.chest * 10),
      points.cbNeck,
      points.cbNeckCp2,
      points.waistCenter,
      points.waistCenter
    )

    points.cbTop = new Path()
      .move(points.cbNeck)
      .curve_(points.cbNeckCp2, points.waistCenter)
      .split(points.cbSplit)[1]
      .shiftFractionAlong(options.backDrop)

    points.cbWaistNew = new Point(points.cbTop.x, points.cbWaist.y)

    //control points and splits
    points.cbTopCp1 = points.cbTop.shift(
      points.waistCenter.angle(points.dartBottomLeft) * options.backDrop,
      points.waistCenter.dist(points.dartBottomLeft) * 0.25
    )
    points.armholeDropCp2 = points.armholeDrop.shiftFractionTowards(points.cbTopCp1, 0.125)

    points.dartLeftSplit = utils.curvesIntersect(
      points.armholeDrop,
      points.armholeDropCp2,
      points.cbTopCp1,
      points.cbTop,
      points.dartBottomLeft,
      points.dartLeftCp,
      points.dartTip,
      points.dartTip
    )
    points.dartRightSplit = points.dartLeftSplit.flipX(points.dartBottomCenter)
    points.dartRightSplitCp1 = points.dartRightSplit.shift(
      points.cbTopCp1.angle(points.dartLeftSplit),
      points.dartBottomRight.dist(points.waistSide) * 0.25
    )
    points.dartLeftNotch = new Path()
      .move(points.dartBottomLeft)
      .curve_(points.dartLeftCp, points.dartTip)
      .split(points.dartLeftSplit)[0]
      .shiftFractionAlong(0.5)
    points.dartRightNotch = points.dartLeftNotch.flipX(points.dartBottomCenter)
    //stores
    store.set('sideLength', paths.side.split(points.armholeDrop)[0].length())
    store.set(
      'cpAngle',
      points.armholeDrop.angle(points.dartRightSplitCp1) - points.armhole.angle(points.armholeCp2)
    )
    if (options.straightBack) {
      store.set(
        'waistBack',
        (points.cbWaistNew.dist(points.dartBottomLeft) +
          points.dartBottomRight.dist(points.waistSide)) *
          4
      )
    } else {
      store.set(
        'waistBack',
        (points.waistCenter.dist(points.dartBottomLeft) +
          points.dartBottomRight.dist(points.waistSide)) *
          4
      )
    }

    //guides
    if (options.daisyGuides) {
      paths.daisyGuide = new Path()
        .move(points.cbNeck)
        .curve_(points.cbNeckCp2, points.waistCenter)
        .line(points.dartBottomLeft)
        .curve_(points.dartLeftCp, points.dartTip)
        ._curve(points.dartRightCp, points.dartBottomRight)
        .line(points.waistSide)
        .curve_(points.waistSideCp2, points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        ._curve(points.cbNeckCp1, points.cbNeck)
        .close()
        .attr('class', 'various lashed')
    }

    // paths.fullCurve = new Path()
    // .move(points.armholeDrop)
    // .curve(points.armholeDropCp2, points.cbTopCp1, points.cbTop)
    // .attr('class', 'various lashed')

    // paths.backNeck = new Path().move(points.dartLeftSplit)._curve(points.cbTopCp1, points.cbTop)

    // paths.sideBackNeck = new Path()
    // .move(points.armholeDrop)
    // ._curve(points.dartRightSplitCp1, points.dartRightSplit)

    return part
  },
}
