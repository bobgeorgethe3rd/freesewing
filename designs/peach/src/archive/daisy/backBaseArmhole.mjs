import { back as backDaisy } from '@freesewing/daisy'

export const backBaseArmhole = {
  name: 'peach.backBaseArmhole',
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
    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    points.armholeSplit = paths.armhole.shiftFractionAlong(1 - options.bustDartFraction)

    points.dartTipCp1 = utils.beamsIntersect(
      points.dartBottomLeft,
      points.dartTip,
      points.armholeSplit,
      points.armholeSplit.shift(180, 1)
    )
    points.dartTipCp2 = points.dartTipCp1.shiftOutwards(
      points.dartTip,
      points.dartTip.dist(points.dartBottomMid) * 0.25
    )
    points.dartBottomRightCp = points.dartBottomRight.shiftFractionTowards(points.dartTip, 0.5)

    //guides

    if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.997) {
      paths.armholeTop = paths.armhole.split(points.armholeSplit)[1]
      paths.armholeBottom = paths.armhole.split(points.armholeSplit)[0]
    } else {
      if (options.bustDartFraction <= 0.01) {
        paths.armholeTop = new Path().move(points.armholeSplit).line(points.shoulder).hide()
        paths.armholeBottom = paths.armhole
      } else {
        paths.armholeTop = paths.armhole
        paths.armholeBottom = new Path().move(points.armhole).line(points.armholeSplit).hide()
      }
    }

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
      .curve_(points.dartTipCp1, points.armholeSplit)
      .join(paths.armholeTop)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.cbWaist)

    paths.sideFrontGuide = new Path()
      .move(points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .join(paths.armholeBottom)
      ._curve(points.dartTipCp1, points.dartTip)
      .curve(points.dartTipCp2, points.dartBottomRightCp, points.dartBottomRight)

    return part
  },
}
