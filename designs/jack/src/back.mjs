import { back as backJackson } from '@freesewing/jackson'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { pctBasedOn } from '@freesewing/core'

export const back = {
  name: 'jack.back',
  from: backJackson,
  hide: {
    from: true,
  },
  options: {
    //Constants
    legBandWidth: {
      pct: 0,
      min: 0,
      max: 0,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
    }, //locked for Jack
    legBandsBool: false, //Altered for Jack
    calculateLegBandDiff: false, //Locked for Jack
    hemWidth: 0.01, //Locked for Jack
    //Fit
    kneeEase: { pct: 19.6, min: 0, max: 25, menu: 'fit' }, //Altered for Jack
    //Style
    fitKnee: { bool: true, menu: 'style' }, //Altered for Jack
    legLength: { pct: 50, min: 0, max: 100, menu: 'style' },
    legBandWidth: {
      pct: 1.5,
      min: 0.9,
      max: 10,
      snap: 2.5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Jack
    legBandStyle: {
      dflt: 'turnover',
      list: ['cuffed', 'bandStraight', 'bandCurved', 'turnover'],
      menu: 'style',
    },
  },
  plugins: [pluginLogoRG],
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
    //remove macros
    macro('title', false)
    macro('logorg', false)
    macro('scalebox', false)
    delete paths.grainline
    //drawGuides
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOut, points.waistOut)
          else
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
              .curve_(points.seatOutCp2, points.waistOut)
        } else {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOut, points.waistOut)
          else
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
              .curve_(points.seatOutCp2, points.waistOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.seatOut, points.waistOut)
          else
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.seatOutCp1, points.seatOut)
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
    }

    const drawInseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.floorInCp1, points.floorIn)
        } else {
          return new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.floorInCp1, points.floorIn)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.floorInCp1, points.floorIn)
        } else {
          return new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.floorInCp1, points.floorIn)
        }
      }
    }
    //measures
    const legBandWidth = absoluteOptions.legBandWidth
    //let's begin
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
      'kneeInCp2',
      'calfInCp1',
      'calfIn',
      'calfInCp2',
      'floorInCp1',
      'floorIn',
      'floorOut',
      'floorOutCp2',
      'calfOutCp1',
      'calfOut',
      'calfOutCp2',
      'kneeOutCp1',
      'kneeOut',
      'kneeOutCp2',
      'seatOutCp1',
      'seatOut',
      'seatOutCp2',
      'waistOut',
    ]
    for (const p of shift)
      points['s' + utils.capitalize(p)] = points[p].shift(-90, legBandWidth * 2)

    const drawShiftOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.sFloorOut)
              .curve(points.sFloorOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sSeatOut, points.sWaistOut)
          else
            return new Path()
              .move(points.sFloorOut)
              .curve(points.sFloorOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sSeatOutCp1, points.sSeatOut)
              .curve_(points.sSeatOutCp2, points.sWaistOut)
        } else {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.sFloorOut)
              .curve(points.sFloorOutCp2, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sSeatOut, points.sWaistOut)
          else
            return new Path()
              .move(points.sFloorOut)
              .curve(points.sFloorOutCp2, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sSeatOutCp1, points.sSeatOut)
              .curve_(points.sSeatOutCp2, points.sWaistOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.sFloorOut)
              .curve(points.sFloorOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sSeatOut, points.sWaistOut)
          else
            return new Path()
              .move(points.sFloorOut)
              .curve(points.sFloorOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sSeatOutCp1, points.sSeatOut)
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
    }

    const drawShiftInseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.sUpperLegIn)
            .curve(points.sUpperLegInCp2, points.sKneeInCp1, points.sKneeIn)
            .curve(points.sKneeInCp2, points.sCalfInCp1, points.sCalfIn)
            .curve(points.sCalfInCp2, points.sFloorInCp1, points.sFloorIn)
        } else {
          return new Path()
            .move(points.sUpperLegIn)
            .curve(points.sUpperLegInCp2, points.sKneeInCp1, points.sKneeIn)
            .curve(points.sKneeInCp2, points.sFloorInCp1, points.sFloorIn)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.sUpperLegIn)
            .curve(points.sUpperLegInCp2, points.sCalfInCp1, points.sCalfIn)
            .curve(points.sCalfInCp2, points.sFloorInCp1, points.sFloorIn)
        } else {
          return new Path()
            .move(points.sUpperLegIn)
            .curve(points.sUpperLegInCp2, points.sFloorInCp1, points.sFloorIn)
        }
      }
    }

    points.mBottomIn = points.bottomIn.flipY(points.mSplitIn)
    points.mBottomOut = points.bottomOut.flipY(points.mSplitOut)

    if (options.legLength < 1) {
      paths.mInseam0 = drawShiftInseam().split(points.mSplitIn)[1].split(points.mBottomIn)[0].hide()
    } else {
      paths.mInseam0 = drawShiftInseam().split(points.mSplitIn)[1].hide()
    }
    paths.mOutSeam1 = drawShiftOutseam()
      .split(points.mBottomOut)[1]
      .split(points.mSplitOut)[0]
      .hide()

    const drawSeamLeft = () => {
      if (options.legBandStyle == 'cuffed') {
        return paths.inseam.join(paths.inseam0).join(paths.mInseam0)
      }
      if (options.legBandStyle == 'bandStraight' || options.legBandStyle == 'bandCurved') {
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
      if (options.legBandStyle == 'bandStraight' || options.legBandStyle == 'bandCurved') {
        return paths.outSeam.split(points.splitOut)[1]
      }
      if (options.legBandStyle == 'turnover') {
        return paths.outSeam1.join(paths.outSeam)
      }
    }

    const drawWaist = () => {
      if (options.yoke) {
        return new Path().move(points.yokeOut).line(points.yokeIn)
      } else {
        return new Path()
          .move(points.waistOut)
          .line(points.dartOut)
          .line(points.dartTip)
          .line(points.dartIn)
          .line(points.waistIn)
      }
    }

    paths.seamRight = options.yoke
      ? drawSeamRight().split(points.yokeOut)[0].hide()
      : drawSeamRight().hide()

    points.hemIn = drawSeamLeft().end()
    points.hemOut = paths.seamRight.start()
    //paths
    paths.seam = new Path()
      .move(points.hemIn)
      .line(points.hemOut)
      .join(paths.seamRight)
      .join(drawWaist())
      .join(paths.crossSeam)
      .join(drawSeamLeft())
      .close()
    //stores
    points.bottomAnchor =
      options.legBandStyle == 'bandStraight' || options.legBandStyle == 'bandCurved'
        ? points.split
        : points.bottom
    const backPocketsBool = options.backPocketsBool
      ? points.backPocketPeakDepth.y < points.bottomAnchor.y
        ? 1
        : 0
      : 0
    store.set('legBandWidth', legBandWidth)
    store.set('backPocketsBool', backPocketsBool)
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
        points.crossSeamCurveStart.y + points.crossSeamCurveStart.dy(points.split) * 0.75
      )
      macro('title', {
        nr: 1,
        title: 'Back',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      //fit guides
      if (options.fitGuides && points.bottomAnchor.y <= points.kneeGuideIn.y) {
        delete paths.kneeGuide
        delete snippets['kneeGuideIn-notch']
        delete snippets['kneeGuideOut-notch']
      }
      //pockets
      if (backPocketsBool < 1 && options.backPocketsBool) {
        delete paths.backPocket
        delete snippets['backPocketTopIn-notch']
        delete snippets['backPocketTopOut-notch']
        log.warning('backPocket unable to draft at this length')
      }
      //paths
      if (options.legBandStyle != 'bandStraight' && options.legBandStyle != 'bandCurved') {
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
        if (sa) {
          const inseamSa = sa * options.inseamSaWidth * 100
          const sideSeamSa = sa * options.sideSeamSaWidth * 100

          points.saHemIn = utils.beamIntersectsY(
            drawSeamLeft().offset(inseamSa).shiftFractionAlong(0.995),
            drawSeamLeft().offset(inseamSa).end(),
            points.hemIn.y + sa
          )
          points.saHemOut = utils.beamIntersectsY(
            paths.seamRight.offset(sideSeamSa).start(),
            paths.seamRight.offset(sideSeamSa).shiftFractionAlong(0.005),
            points.hemOut.y + sa
          )

          const drawSaWaist = () => {
            if (options.yoke) {
              return new Path().move(points.saYokeOut).line(points.saYokeIn)
            } else {
              return new Path().move(points.saWaistOut).line(points.saWaistIn)
            }
          }

          paths.sa = new Path()
            .move(points.saHemIn)
            .line(points.saHemOut)
            .join(paths.seamRight.offset(sideSeamSa))
            .join(drawSaWaist())
            .join(paths.crossSeam.offset(sa * options.crossSeamSaWidth * 100))
            .line(points.saUpperLegIn)
            .join(drawSeamLeft().offset(inseamSa))
            .line(points.saHemIn)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
