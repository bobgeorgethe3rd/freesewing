import { backArmholePitch } from './backArmholePitch.mjs'

export const sideBackArmholePitch = {
  name: 'peach.sideBackArmholePitch',
  after: backArmholePitch,
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
    // paths.daisyGuide = new Path()
    // .move(points.cbWaist)
    // .line(points.dartBottomLeft)
    // .line(points.dartTip)
    // .line(points.dartBottomRight)
    // .line(points.sideWaist)
    // .line(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // ._curve(points.cbNeckCp1, points.cbNeck)
    // .line(points.cbWaist)
    // .attr('class', 'various lashed')
    //let's begin
    points.dartBottomRightCp = points.dartBottomRight.shiftFractionTowards(points.dartTip, 7 / 6)

    let tweak = 1
    let delta
    do {
      points.armholePitchCp3 = points.armholePitch.shiftFractionTowards(points.dartTip, tweak)

      paths.princessSeam = new Path()
        .move(points.armholePitch)
        .curve(points.armholePitchCp3, points.dartBottomRightCp, points.dartBottomRight)
        .hide()

      delta = paths.princessSeam.length() - store.get('princessSeamBackLengthAP')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 0.01)

    //paths
    paths.hemBase = new Path().move(points.dartBottomRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armhole).hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.princessSeam)
      .close()

    if (complete) {
      //grainline
      ;(points.grainlineFrom = points.dartTip.shiftFractionTowards(points.armhole, 0.25)),
        (points.grainlineTo = new Point(points.grainlineFrom.x, points.dartBottomRight.y))
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.princessNotch0 = paths.princessSeam.shiftFractionAlong(0.25)
      points.princessNotch1 = paths.princessSeam.shiftFractionAlong(0.75)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['princessNotch0', 'princessNotch1', 'cArmhole'],
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

        points.saPoint0 = points.saPoint1
        points.saPoint1 = points.saPoint2
        points.saPoint2 = new Point(
          points.saArmholePitch.x,
          paths.princessSeam.offset(princessSa).start().y
        )
        points.saPoint3 = utils.beamsIntersect(
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

        paths.sa = paths.hemBase
          .offset(sa)
          .line(points.saPoint0)
          .line(points.saPoint1)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .line(points.saPoint2)
          .line(paths.princessSeam.offset(princessSa).start())
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saPoint3)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
