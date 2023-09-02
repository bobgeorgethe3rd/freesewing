export const backShoulder = {
  name: 'peach.backShoulder',
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
    points.shoulderSplit = points.hps.shiftFractionTowards(
      points.shoulder,
      options.bustDartFraction
    )
    points.dartBottomLeftCp = points.dartBottomLeft.shiftFractionTowards(points.dartTip, 7 / 6)
    points.shoulderSplitCp = points.shoulderSplit.shiftFractionTowards(points.dartTip, 7 / 6)

    //paths
    paths.hemBase = new Path().move(points.cbWaist).line(points.dartBottomLeft).hide()

    paths.princessSeam = new Path()
      .move(points.dartBottomLeft)
      .curve(points.dartBottomLeftCp, points.shoulderSplitCp, points.shoulderSplit)
      .hide()

    paths.shoulder = new Path().move(points.shoulderSplit).line(points.hps).hide()

    paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()

    paths.cb = new Path().move(points.cbNeck).line(points.cbWaist).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.princessSeam)
      .join(paths.shoulder)
      .join(paths.cbNeck)
      .join(paths.cb)

    //stores
    store.set('princessSeamBackLengthS', paths.princessSeam.length())

    if (complete) {
      //grainline
      points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cbWaist.y)
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
      points.title = points.cArmhole.shiftFractionTowards(points.dartTip, 1 / 3)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Back',
        scale: 0.75,
      })
      if (sa) {
        const princessSa = sa * options.princessSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100

        points.saPoint0 = utils.beamsIntersect(
          points.cbWaist.shiftTowards(points.dartBottomLeft, sa).rotate(-90, points.cbWaist),
          points.dartBottomLeft.shiftTowards(points.cbWaist, sa).rotate(90, points.dartBottomLeft),
          points.dartBottomLeft
            .shiftTowards(points.dartTip, princessSa)
            .rotate(-90, points.dartBottomLeft),
          points.dartTip.shiftTowards(points.dartBottomLeft, princessSa).rotate(90, points.dartTip)
        )
        points.saPoint1 = utils.beamsIntersect(
          points.dartTip.shiftTowards(points.shoulderSplit, princessSa).rotate(-90, points.dartTip),
          points.shoulderSplit
            .shiftTowards(points.dartTip, princessSa)
            .rotate(90, points.shoulderSplit),
          points.hps.shiftTowards(points.shoulder, shoulderSa).rotate(90, points.hps),
          points.shoulder.shiftTowards(points.hps, shoulderSa).rotate(-90, points.shoulder)
        )
        points.saPoint2 = points.saPoint4
        points.saPoint3 = points.saPoint5
        points.saPoint4 = points.saPoint6

        paths.sa = paths.hemBase
          .clone()
          .offset(sa)
          .line(points.saPoint0)
          .line(paths.princessSeam.offset(princessSa).start())
          .join(paths.princessSeam.offset(princessSa))
          .line(points.saPoint1)
          .line(points.saPoint2)
          .line(paths.cbNeck.offset(neckSa).start())
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saPoint3)
          .line(points.saPoint4)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
