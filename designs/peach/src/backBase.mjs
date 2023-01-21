import { back as backDaisy } from '@freesewing/daisy'

export const backBase = {
  name: 'backBase',
  from: backDaisy,
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
  }) => {
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)
    //let's begin
    points.shoulderSplit = points.hps.shiftFractionTowards(
      points.shoulder,
      options.bustDartFraction
    )

    if (options.bustDartPlacement == 'armhole') {
      points.backCp1 = utils.beamsIntersect(
        points.dartLeftCp,
        points.dartTip,
        points.armholePitch,
        points.armholePitchCp1.rotate(-90, points.armholePitch)
      )
    } else {
      points.backCp1 = utils.beamsIntersect(
        points.dartBottomCenter,
        points.dartTip,
        points.armholePitchCp2,
        points.armholePitchCp2.shift(points.shoulder.angle(points.hps), 1)
      )
    }
    points.dartMiddleCp = points.backCp1.shiftOutwards(
      points.dartTip,
      points.dartTip.dist(points.dartBottomCenter) * 0.1
    )

    //guides
    paths.bellaGuide = new Path()
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

    let pitch
    if (options.bustDartPlacement == 'armhole') {
      pitch = points.armholePitch
    } else {
      pitch = points.shoulderSplit
    }
    paths.backSeam = new Path()
      .move(points.dartBottomLeft)
      .curve(points.dartLeftCp, points.dartMiddleCp, points.dartTip)
      .curve_(points.backCp1, pitch)

    paths.sideBackSeam = new Path()
      .move(pitch)
      ._curve(points.backCp1, points.dartTip)
      .curve(points.dartMiddleCp, points.dartRightCp, points.dartBottomRight)

    return part
  },
}
