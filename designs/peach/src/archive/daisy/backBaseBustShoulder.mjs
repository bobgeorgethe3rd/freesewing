import { back as backDaisy } from '@freesewing/daisy'
import { frontBaseBustShoulder } from './frontBaseShoulder'

export const backBaseBustShoulder = {
  name: 'peach.backBaseBustShoulder',
  from: backDaisy,
  after: frontBaseBustShoulder,
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
    points.shoulderSplit = points.hps.shiftTowards(points.shoulder, store.get('shoulderPoint'))

    //migrating the dart
    // points.dartBottomLeft = points.cbWaist.shift(0, dartPlacement)
    // points.shoulderCp = points.shoulderSplit.shift(/* points.shoulder.angle(points.armholePitchCp2) */ (270 * (1 - options.bustDartFraction)) + (points.shoulder.angle(points.armholePitchCp2) * options.bustDartFraction), points.shoulder.dist(points.armholePitchCp2))
    points.shoulderCp = utils
      .beamsIntersect(
        points.dartBottomMid,
        points.dartTip,
        points.armholePitchCp2,
        points.armholePitchCp2.shift(points.shoulder.angle(points.hps), 1)
      )
      .shiftFractionTowards(
        points.dartTip,
        points.hps.dist(points.shoulderSplit) / points.hps.dist(points.shoulder) / 4
      )
    // points.dartTipCp2 = points.dartTip.shift(90, points.dartTip.dist(points.shoulderSplit) * 0.25)
    points.dartTipCp1 = points.dartTip.shift(-90, points.dartTip.dist(points.dartBottomMid) * 0.25)
    points.dartBottomLeftCp = points.dartBottomLeft.shiftTowards(
      points.dartTip,
      points.dartTip.dist(points.dartBottomMid) * 0.5
    )
    points.dartBottomRightCp = points.dartBottomLeftCp.flipX(points.dartTip)

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
      .curve(points.dartBottomLeftCp, points.dartTipCp1, points.dartTip)
      .curve_(/* points.dartTipCp2,  */ points.shoulderCp, points.shoulderSplit)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.cbWaist)

    paths.sideFrontGuide = new Path()
      .move(points.dartBottomRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.shoulderSplit)
      ._curve(points.shoulderCp, /* points.dartTipCp2, */ points.dartTip)
      .curve(points.dartTipCp1, points.dartBottomRightCp, points.dartBottomRight)

    return part
  },
}
