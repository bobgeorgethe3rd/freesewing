import { back as backDaisy } from '@freesewing/daisy'

export const backBaseArmholePitch = {
  name: 'peach.backBaseArmholePitch',
  from: backDaisy,
  hide: {
    from: true,
  },
  draft: ({
    store,
    sa,
    points,
    Point,
    Path,
    paths,
    complete,
    paperless,
    macro,
    part,
    options,
    snippets,
    Snippet,
    utils,
  }) => {
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    //let's begin
    points.dartTipCp1 = utils.beamsIntersect(
      points.dartBottomLeft,
      points.dartTip,
      points.armholePitch,
      points.armholePitch.shift(180, 1)
    )
    points.dartTipCp2 = points.dartTipCp1.shiftOutwards(
      points.dartTip,
      points.dartTip.dist(points.dartBottomMid) * 0.25
    )
    points.dartBottomRightCp = points.dartBottomRight.shiftFractionTowards(points.dartTip, 0.5)

    //guides
    paths.daisyGuide = new Path()
      .move(points.cbWaist)
      .line(points.dartBottomLeft)
      .line(points.dartTip)
      .line(points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.cbWaist)
      .attr('class', 'various lashed')

    paths.frontGuide = new Path()
      .move(points.cbWaist)
      .line(points.dartBottomLeft)
      .line(points.dartTip)
      .curve_(points.dartTipCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.cbWaist)

    paths.sideFrontGuide = new Path()
      .move(points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      ._curve(points.dartTipCp1, points.dartTip)
      .curve(points.dartTipCp2, points.dartBottomRightCp, points.dartBottomRight)

    return part
  },
}
