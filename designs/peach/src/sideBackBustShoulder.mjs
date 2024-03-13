import { backBustShoulder } from './backBustShoulder.mjs'

export const sideBackBustShoulder = {
  name: 'peach.sideBackBustShoulder',
  after: backBustShoulder,
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
    //guides
    if (options.daisyGuides) {
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
    }
    //let's begin
    points.shoulderSplit = points.hps.shiftTowards(points.shoulder, store.get('shoulderPlacement'))
    points.dartBottomRightCp1 = points.dartTip

    let tweak = 1
    let delta
    do {
      points.shoulderSplitCp2 = points.shoulderSplit.shiftFractionTowards(points.dartTip, tweak)

      paths.princessSeam = new Path()
        .move(points.shoulderSplit)
        .curve(points.shoulderSplitCp2, points.dartBottomRightCp1, points.dartBottomRight)
        .hide()

      delta = paths.princessSeam.length() - store.get('princessSeamBackLengthBS')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    //paths
    paths.waist = new Path().move(points.dartBottomRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armhole).hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.shoulder = new Path().move(points.shoulder).line(points.shoulderSplit).hide()

    paths.seam = paths.waist
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.shoulder)
      .join(paths.princessSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(
        points.dartTip.shiftFractionTowards(points.armhole, 0.25).x,
        points.armholePitchCp1.y
      )
      points.grainlineTo = new Point(points.grainlineFrom.x, points.dartBottomRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.princessNotch0 = paths.princessSeam.shiftFractionAlong(0.25)
      points.princessNotch1 = paths.princessSeam.shiftFractionAlong(0.75)
      points.sideNotch = points.sideWaist.shiftFractionTowards(points.armhole, 0.5)
      snippets.sideNotch = new Snippet('notch', points.sideNotch)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['princessNotch0', 'princessNotch1'],
      })
      //title
      points.title = points.dartTip
        .shiftFractionTowards(points.armhole, 0.4)
        .shift(-90, points.dartBottomMid.dist(points.dartTip) * 0.5)
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Side Back',
        scale: 2 / 3,
      })
      if (sa) {
        const princessSa = sa * options.princessSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100

        points.saDartBottomRight = utils.beamsIntersect(
          points.dartBottomRight
            .shiftTowards(points.dartTip, princessSa)
            .rotate(90, points.dartBottomRight),
          points.dartTip
            .shiftTowards(points.dartBottomRight, princessSa)
            .rotate(-90, points.dartTip),
          points.dartBottomRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.dartBottomRight),
          points.sideWaist.shiftTowards(points.dartBottomRight, sa).rotate(90, points.sideWaist)
        )

        points.saShoulderSplit = utils.beamsIntersect(
          points.shoulderSplit
            .shiftTowards(points.dartTip, princessSa)
            .rotate(-90, points.shoulderSplit),
          points.shoulderSplit
            .shiftTowards(points.dartTip, princessSa)
            .rotate(-90, points.shoulderSplit)
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saShoulderCorner,
          points.shoulderSplit.shift(points.hps.angle(points.shoulder) + 90, shoulderSa)
        )

        paths.sa = new Path()
          .move(points.saDartBottomRight)
          .line(points.saSideWaist)
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saShoulderSplit)
          .line(paths.princessSeam.offset(princessSa).start())
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saDartBottomRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
