import { backArmhole } from './backArmhole.mjs'

export const sideBackArmhole = {
  name: 'peach.sideBackArmhole',
  after: backArmhole,
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
    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()
    points.armholeSplit = paths.armhole.shiftFractionAlong(1 - options.bustDartFraction)

    if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.996) {
      paths.armhole = paths.armhole.split(points.armholeSplit)[0].hide()
    } else {
      if (options.bustDartFraction >= 0.996) {
        paths.armhole = new Path().move(points.armhole).line(points.armholeSplit).hide()
      }
    }

    points.dartBottomRightCp = points.dartBottomRight.shiftFractionTowards(points.dartTip, 7 / 6)

    let tweak = 1
    let delta
    do {
      points.armholeSplitCp = points.armholeSplit.shiftFractionTowards(points.dartTip, tweak)

      paths.princessSeam = new Path()
        .move(points.armholeSplit)
        .curve(points.armholeSplitCp, points.dartBottomRightCp, points.dartBottomRight)
        .hide()

      delta = paths.princessSeam.length() - store.get('princessSeamBackLengthA')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 0.01)

    //paths
    paths.waist = new Path().move(points.dartBottomRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armhole).hide()

    paths.seam = paths.waist
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

        paths.saArmhole = new Path()
          .move(points.saArmhole)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .line(points.saShoulderCorner)
          .hide()

        points.saArmholeSplit = paths.saArmhole.shiftFractionAlong(1 - options.bustDartFraction)

        if (options.bustDartFraction > 0.01 && options.bustDartFraction < 0.996) {
          paths.saArmhole = paths.saArmhole.split(points.saArmholeSplit)[0].hide()
        } else {
          if (options.bustDartFraction >= 0.996) {
            points.saArmholeSplit = points.saArmholeCorner
            paths.saArmhole = new Path().move(points.saArmhole).line(points.saArmholeSplit).hide()
          }
        }

        points.saPrincessSeamStart = paths.princessSeam.offset(princessSa).start()
        points.saPrincessSeamStartCorner = points.saPrincessSeamStart
          .shiftTowards(points.armholeSplit, sa)
          .rotate(90, points.saPrincessSeamStart)

        if (points.saPrincessSeamStartCorner.x > points.saArmholeSplit.x) {
          points.saPrincessSeamStartCorner = points.saArmholeSplit
        }

        paths.sa = new Path()
          .move(points.saDartBottomRight)
          .line(points.saSideWaist)
          .line(points.saArmholeCorner)
          .join(paths.saArmhole)
          .line(points.saPrincessSeamStartCorner)
          .line(points.saPrincessSeamStart)
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saDartBottomRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
