import { pluginMirror } from '@freesewing/plugin-mirror'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { back as backDalton } from '@freesewing/dalton'
import { pctBasedOn } from '@freesewing/core'

export const back = {
  name: 'caleb.back',
  from: backDalton,
  hide: {
    from: true,
  },
  options: {
    //Dalton
    //Constants
    useVoidStores: false, //Locked for Caleb
    fitWaist: false, //Locked for Caleb
    legBandWidth: {
      pct: 0,
      min: 0,
      max: 0,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
    }, //locked for Caleb
    legBandsBool: false, //Altered for Caleb
    calculateLegBandDiff: false, //Locked for Caleb
    hemWidth: 0.01, //Locked for Caleb
    //Fit
    waistEase: { pct: 6.4, min: 0, max: 20, menu: 'fit' }, //Altered for Caleb
    hipsEase: { pct: 5.9, min: 0, max: 20, menu: 'fit' }, //Altered for Caleb
    seatEase: { pct: 5.1, min: 0, max: 20, menu: 'fit' }, //Altered for Caleb
    kneeEase: { pct: 19.8, min: 0, max: 25, menu: 'fit' }, //Altered for Caleb
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Caleb
    daltonGuides: { bool: false, menu: 'fit' },
    //Style
    waistHeight: { pct: 0, min: 0, max: 100, menu: 'style' }, //Altered for Caleb
    waistbandWidth: {
      pct: 3.3,
      min: 1,
      max: 6,
      snap: 1.25,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Caleb
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved'], menu: 'style' }, //Altered for Caleb
    fitKnee: { bool: true, menu: 'style' }, //Altered for Caleb
    legLength: { pct: 50, min: 0, max: 100, menu: 'style' },
    legBandWidth: {
      pct: 5.1,
      min: 0.9,
      max: 10,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Caleb
    legBandStyle: { dflt: 'cuffed', list: ['cuffed', 'band', 'turnover'], menu: 'style' },
    fitWaistBack: { bool: true, menu: 'style' }, //Altered For Caleb
    //Darts
    backDartWidth: { pct: 3.2, min: 1, max: 6, menu: 'darts' }, //Altered for Caleb
    backDartDepth: { pct: 95, min: 75, max: 100, menu: 'darts' }, //Altered for Darts
    //Pockets
    backPocketsBool: { bool: true, menu: 'pockets' },
    sidePocketsBool: { bool: true, menu: 'pockets' },
    backPocketPlacement: { pct: 62.5, min: 50, max: 100, menu: 'pockets.backPockets' },
    backPocketBalance: { pct: 50, min: 40, max: 70, menu: 'pockets.backPockets' },
    backPocketWidth: { pct: (2 / 3) * 100, min: 40, max: 70, menu: 'pockets.backPockets' }, //Altered for Caleb
    sidePocketPlacement: { pct: 2.4, min: 0, max: 5, menu: 'pockets.sidePockets' },
    sidePocketBalance: { pct: 50, min: 40, max: 70, menu: 'pockets.sidePockets' },
    sidePocketWidth: { pct: 85.8, min: 40, max: 90, menu: 'pockets.sidePockets' },
    //Construction
    crossSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Caleb
    inseamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Caleb
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Caleb
    //Advanced
    backDartMultiplier: { count: 1, min: 0, max: 2, menu: 'advanced' }, //Altered for Caleb
  },
  plugins: [pluginMirror, pluginLogoRG],
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
    log,
    absoluteOptions,
  }) => {
    //removing paths and snippets not required from Dalton
    const keepPaths = ['seam', 'crossSeam', 'seatGuide', 'hipsGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    const keepSnippets = [
      'crossSeamCurveStart',
      'seatGuideIn-notch',
      'seatGuideOut-notch',
      'hipsGuideIn-notch',
      'hipsGuideOut-notch',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //remove macros
    macro('title', false)
    macro('scalebox', false)
    //measures
    const legBandWidth = absoluteOptions.legBandWidth
    //let's begin
    //draw paths
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, points.waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve_(points.floorOutCp2, points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, points.waistOut)
      } else {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.floorOut)
            .curve(points.floorOutCp2, points.seatOut, points.waistOut)
        else
          return new Path()
            .move(points.floorOut)
            .curve(points.floorOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, points.waistOut)
      }
    }
    const drawInseam = () =>
      options.fitKnee
        ? new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.kneeInCp1, points.kneeIn)
            ._curve(points.floorInCp1, points.floorIn)
        : new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.floorInCp1, points.floorIn)
    //new legs
    points.bottomMin = points.upperLeg.shiftFractionTowards(points.knee, 0.1)
    if (points.upperLeg.dist(points.bottomMin) < legBandWidth) {
      points.bottomMin = points.upperLeg
        .shiftTowards(points.knee, legBandWidth)
        .shiftFractionTowards(points.knee, 0.1)
    }
    if (options.legLength < 0.5) {
      points.bottom = points.bottomMin.shiftFractionTowards(points.knee, 2 * options.legLength)
    } else {
      points.bottom = points.knee.shiftFractionTowards(points.floor, 2 * options.legLength - 1)
    }

    points.split = points.bottom.shiftTowards(points.upperLeg, legBandWidth)
    points.splitIn = drawInseam().intersects(
      new Path().move(points.split).line(points.split.shift(180, measurements.waistToFloor * 10))
    )[0]
    points.splitOut = drawOutseam().intersects(
      new Path().move(points.split).line(points.split.shift(0, measurements.waistToFloor * 10))
    )[0]

    if (options.legLength < 1) {
      if (options.legLength == 0.5 && options.fitKnee) {
        points.bottomIn = points.kneeIn
        points.bottomOut = points.kneeOut
      } else {
        points.bottomIn = drawInseam().intersects(
          new Path()
            .move(points.bottom)
            .line(points.bottom.shift(180, measurements.waistToFloor * 10))
        )[0]
        points.bottomOut = drawOutseam().intersects(
          new Path()
            .move(points.bottom)
            .line(points.bottom.shift(0, measurements.waistToFloor * 10))
        )[0]
      }
      paths.inseam = drawInseam().split(points.bottomIn)[0].hide()
      paths.outSeam = drawOutseam().split(points.bottomOut)[1].hide()
    } else {
      paths.inseam = drawInseam().hide()
      paths.outSeam = drawOutseam().hide()
      points.bottomIn = points.floorIn
      points.bottomOut = points.floorOut
    }
    macro('mirror', {
      mirror: [points.bottomIn, points.bottomOut],
      points: ['splitIn', 'splitOut'],
      paths: ['inseam', 'outSeam'],
      prefix: 'm',
    })

    paths.inseam0 = paths.mInseam.reverse().split(points.mSplitIn)[0].hide()
    paths.outSeam1 = paths.mOutSeam.reverse().split(points.mSplitOut)[1].hide()

    // macro('mirror', {
    // mirror: [points.mSplitIn, points.mSplitOut],
    // paths: ['inseam0', 'outSeam1'],
    // prefix: 'm',
    // })
    //because of limitations of macro mirror I have had to do this instead

    const shift = [
      'upperLegIn',
      'upperLegInCp2',
      'kneeInCp1',
      'kneeIn',
      'floorInCp1',
      'floorIn',
      'floorOut',
      'floorOutCp2',
      'kneeOut',
      'kneeOutCp2',
      'seatOutCp1',
      'seatOut',
      'seatOutCp2',
      'waistOut',
    ]
    for (const p of shift)
      points['s' + utils.capitalize(p)] = points[p].shift(-90, legBandWidth * 2)

    const drawShiftInseam = () =>
      options.fitKnee
        ? new Path()
            .move(points.sUpperLegIn)
            .curve(points.sUpperLegInCp2, points.sKneeInCp1, points.sKneeIn)
            ._curve(points.sFloorInCp1, points.sFloorIn)
        : new Path()
            .move(points.sUpperLegIn)
            .curve(points.sUpperLegInCp2, points.sFloorInCp1, points.sFloorIn)

    const drawShiftOutseam = () => {
      if (options.fitKnee) {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.sFloorOut)
            .curve_(points.sFloorOutCp2, points.sKneeOut)
            .curve(points.sKneeOutCp2, points.sSeatOut, points.sWaistOut)
        else
          return new Path()
            .move(points.sFloorOut)
            .curve_(points.sFloorOutCp2, points.sKneeOut)
            .curve(points.sKneeOutCp2, points.sSeatOutCp1, points.sSeatOut)
            .curve_(points.sSeatOutCp2, points.sWaistOut)
      } else {
        if (points.seatOutAnchor.x > points.seatOut.x)
          return new Path()
            .move(points.sFloorOut)
            .curve(points.sFloorOutCp2, points.sSeatOut, points.sWaistOut)
        else
          return new Path()
            .move(points.sFloorOut)
            .curve(points.sFloorOutCp2, points.sSeatOutCp1, points.sSeatOut)
            .curve_(points.sSeatOutCp2, points.sWaistOut)
      }
    }

    points.mBottomIn = points.bottomIn.flipY(points.mSplitIn)
    points.mBottomOut = points.bottomOut.flipY(points.mSplitOut)

    paths.mInseam0 = drawShiftInseam().split(points.mSplitIn)[1].split(points.mBottomIn)[0].hide()
    paths.mOutSeam1 = drawShiftOutseam()
      .split(points.mBottomOut)[1]
      .split(points.mSplitOut)[0]
      .hide()

    const drawSeamLeft = () => {
      if (options.legBandStyle == 'cuffed') {
        return paths.inseam.join(paths.inseam0).join(paths.mInseam0)
      }
      if (options.legBandStyle == 'band') {
        return paths.inseam.split(points.splitIn)[0]
      }
      if (options.legBandStyle == 'turnover') {
        return paths.inseam.join(paths.inseam0)
      }
    }

    const drawSeamRight = () => {
      if (options.legBandStyle == 'cuffed') {
        return paths.mOutSeam1.join(paths.outSeam1).join(paths.outSeam)
      }
      if (options.legBandStyle == 'band') {
        return paths.outSeam.split(points.splitOut)[1]
      }
      if (options.legBandStyle == 'turnover') {
        return paths.outSeam1.join(paths.outSeam)
      }
    }
    points.hemIn = drawSeamLeft().end()
    points.hemOut = drawSeamRight().start()
    //paths
    paths.seam = new Path()
      .move(points.hemIn)
      .line(points.hemOut)
      .join(drawSeamRight())
      .line(points.dartOut)
      .line(points.dartTip)
      .line(points.dartIn)
      .line(points.waistIn)
      .join(paths.crossSeam)
      .join(drawSeamLeft())
      .close()
    //stores
    store.set('legBandWidth', legBandWidth)
    if (complete) {
      //grainline
      points.grainlineTo = points.split.shift(0, points.split.dx(points.crossSeamCurveStart) * 0.75)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crossSeamCurveStart.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.split.x,
        points.crossSeamCurveStart.y + points.crossSeamCurveStart.dy(points.split) * 0.1
      )
      macro('title', {
        nr: 1,
        title: 'Back',
        at: points.title,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(
        points.split.x,
        points.crossSeamCurveStart.y + points.crossSeamCurveStart.dy(points.split) * 0.425
      )
      macro('logorg', { at: points.logo, scale: 1 / 3 })
      //scalebox
      points.scalebox = new Point(
        points.split.x,
        points.crossSeamCurveStart.y + points.crossSeamCurveStart.dy(points.split) * 0.75
      )
      macro('scalebox', { at: points.scalebox })
      //fit guides
      if (
        options.fitGuides &&
        ((points.bottom.y > points.knee.y && options.legBandStyle != 'band') ||
          (points.split.y > points.knee.y && options.legBandStyle == 'band'))
      ) {
        paths.kneeGuide = new Path()
          .move(points.kneeGuideIn)
          .line(points.kneeGuideOut)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'right')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['kneeGuideIn', 'kneeGuideOut'],
        })
      }
      //paths
      if (options.legBandStyle != 'band') {
        paths.hemFold = new Path()
          .move(points.bottomIn)
          .line(points.bottomOut)
          .attr('class', 'mark help')
          .attr('data-text', 'Hem Fold-line')
          .attr('data-text-class', 'center')
        if (options.legBandStyle == 'cuffed') {
          paths.cuffFold = new Path()
            .move(points.mSplitIn)
            .line(points.mSplitOut)
            .attr('class', 'mark help')
            .attr('data-text', 'Cuff Fold-line')
            .attr('data-text-class', 'center')
        }
      }
      if (sa) {
        const inseamSa = sa * options.inseamSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saHemIn = utils.beamIntersectsY(
          drawSeamLeft().offset(inseamSa).shiftFractionAlong(0.995),
          drawSeamLeft().offset(inseamSa).end(),
          points.hemIn.y + sa
        )
        points.saHemOut = utils.beamIntersectsY(
          drawSeamRight().offset(sideSeamSa).start(),
          drawSeamRight().offset(sideSeamSa).shiftFractionAlong(0.005),
          points.hemOut.y + sa
        )

        paths.sa = new Path()
          .move(points.saHemIn)
          .line(points.saHemOut)
          .join(drawSeamRight().offset(sideSeamSa))
          .line(points.saWaistOut)
          .line(points.saWaistIn)
          .join(paths.crossSeam.offset(sa * options.crossSeamSaWidth * 100))
          .line(points.saUpperLegIn)
          .join(drawSeamLeft().offset(inseamSa))
          .line(points.saHemIn)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    //backPockets
    if (options.backPocketsBool) {
      const backPocketWidth =
        (points.waistIn.dist(points.dartIn) + points.dartOut.dist(points.waistOut)) *
        options.backPocketWidth
      points.dartPocket = points.dartMid.shiftFractionTowards(
        points.dartTip,
        options.backPocketPlacement
      )
      points.dartPocketIn = utils.beamsIntersect(
        points.dartPocket,
        points.dartMid.rotate(90, points.dartPocket),
        points.dartIn,
        points.dartTip
      )
      points.dartPocketOut = points.dartPocketIn.rotate(180, points.dartPocket)
      points.backPocketIn = points.dartPocketIn.shift(
        points.dartIn.angle(points.waistIn),
        backPocketWidth * (1 - options.backPocketBalance)
      )
      points.backPocketOut = points.dartPocketOut.shift(
        points.dartOut.angle(points.waistOut),
        backPocketWidth * options.backPocketBalance
      )
      //stores
      store.set('backPocketWidth', backPocketWidth)
      if (complete) {
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: ['backPocketIn', 'backPocketOut'],
        })
        //paths
        paths.backPocketLine = new Path()
          .move(points.backPocketIn)
          .line(points.dartPocketIn)
          .move(points.dartPocketOut)
          .line(points.backPocketOut)
          .attr('class', 'fabric help')
          .attr('data-text', 'Back Pocket-Line')
      }
    }
    //sidePockets
    if (options.sidePocketsBool) {
      const sidePocketWidth =
        (points.waistIn.dist(points.dartIn) + points.dartOut.dist(points.waistOut)) *
        options.sidePocketWidth
      points.sidePocketSplit = points.knee.shift(90, legBandWidth)
      points.sidePocketSplitOn = drawOutseam().intersects(
        new Path()
          .move(points.sidePocketSplit)
          .line(points.sidePocketSplit.shift(0, measurements.waistToFloor * 10))
      )[0]
      points.sidePocketOut = drawOutseam()
        .split(points.sidePocketSplitOn)[1]
        .shiftAlong(measurements.waistToFloor * options.sidePocketPlacement)
      //stores
      store.set('sidePocketPlacement', drawOutseam().split(points.sidePocketOut)[1].length())
      store.set('sidePocketWidth', sidePocketWidth)
      if (complete && points.split.y >= points.sidePocketOut.y) {
        points.sidePocketOutAnchor = drawOutseam()
          .split(points.sidePocketOut)[1]
          .shiftFractionAlong(0.005)
        points.sidePocketIn = points.sidePocketOut
          .shiftTowards(
            points.sidePocketOutAnchor,
            sidePocketWidth * (1 - options.sidePocketBalance)
          )
          .rotate(90, points.sidePocketOut)
        //notches
        snippets.sidePocketIn = new Snippet('notch', points.sidePocketIn)
        //paths
        paths.sidePocketLine = new Path()
          .move(points.sidePocketIn)
          .line(points.sidePocketOut)
          .attr('class', 'fabric help')
          .attr('data-text', 'Side Pocket-Line')
      }
    }

    return part
  },
}
