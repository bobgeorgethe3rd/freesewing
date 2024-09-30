import { pluginMirror } from '@freesewing/plugin-mirror'
import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'caleb.front',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    frontPocketOpeningStyle: {
      dflt: 'slanted',
      list: ['slanted', 'inseam'],
      menu: 'pockets.frontPockets',
    },
  },
  plugins: [pluginMirror],
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
    absoluteOptions,
  }) => {
    //remove paths
    const keepPaths = [
      'daltonGuide',
      'crotchSeam',
      'seatGuide',
      'hipsGuide',
      'placketCurve',
      'placketCurveDetail',
      'flyShieldEx',
      'flyShieldExDetail',
      'saFlyShieldEx',
      'saFlyShieldExDetail',
    ]
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const legBandWidth = store.get('legBandWidth')
    //draw paths
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.floorOutCp1, points.floorOut)
        }
      }
    }
    const drawInseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.upperLegInCp1, points.upperLegIn)
        } else {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.upperLegInCp1, points.upperLegIn)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.upperLegInCp1, points.upperLegIn)
        } else {
          return new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.upperLegInCp1, points.upperLegIn)
        }
      }
    }
    //let's begin
    points.split = points.bottom.shiftTowards(points.upperLeg, legBandWidth)
    points.splitOut = drawOutseam().intersects(
      new Path().move(points.split).line(points.split.shift(180, measurements.waistToFloor * 10))
    )[0]
    points.splitIn = drawInseam().intersects(
      new Path().move(points.split).line(points.split.shift(0, measurements.waistToFloor * 10))
    )[0]

    if (options.legLength < 1) {
      if (options.legLength == 0.5 && options.fitKnee) {
        points.bottomOut = points.kneeOut
        points.bottomIn = points.kneeIn
      } else {
        points.bottomOut = drawOutseam().intersects(
          new Path()
            .move(points.bottom)
            .line(points.bottom.shift(180, measurements.waistToFloor * 10))
        )[0]
        points.bottomIn = drawInseam().intersects(
          new Path()
            .move(points.bottom)
            .line(points.bottom.shift(0, measurements.waistToFloor * 10))
        )[0]
      }
      paths.outSeam = drawOutseam().split(points.bottomOut)[0].hide()
      paths.inseam = drawInseam().split(points.bottomIn)[1].hide()
    } else {
      paths.outSeam = drawOutseam().hide()
      paths.inseam = drawInseam().hide()
      points.bottomOut = points.floorOut
      points.bottomIn = points.floorIn
    }

    macro('mirror', {
      mirror: [points.bottomIn, points.bottomOut],
      points: ['splitIn', 'splitOut'],
      paths: ['inseam', 'outSeam'],
      prefix: 'm',
    })

    paths.outSeam0 = paths.mOutSeam.reverse().split(points.mSplitOut)[0].hide()
    paths.inseam1 = paths.mInseam.reverse().split(points.mSplitIn)[1].hide()

    //because of limitations of macro mirror I have had to do this instead

    const shift = [
      'waistOut',
      'seatOutCp1',
      'seatOut',
      'seatOutCp2',
      'kneeOutCp1',
      'kneeOut',
      'kneeOutCp2',
      'calfOutCp1',
      'calfOut',
      'calfOutCp2',
      'floorOutCp1',
      'floorOut',
      'floorIn',
      'floorInCp2',
      'calfInCp1',
      'calfIn',
      'calfInCp2',
      'kneeInCp1',
      'kneeIn',
      'kneeInCp2',
      'upperLegInCp1',
      'upperLegIn',
    ]
    for (const p of shift)
      points['s' + utils.capitalize(p)] = points[p].shift(-90, legBandWidth * 2)

    const drawShiftOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.sWaistOut)
              .curve(points.sSeatOut, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sFloorOutCp1, points.sFloorOut)
          else
            return new Path()
              .move(points.sWaistOut)
              ._curve(points.sSeatOutCp1, points.sSeatOut)
              .curve(points.sSeatOutCp2, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sFloorOutCp1, points.sFloorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.sWaistOut)
              .curve(points.sSeatOut, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sFloorOutCp1, points.sFloorOut)
          else
            return new Path()
              .move(points.sWaistOut)
              ._curve(points.sSeatOutCp1, points.sSeatOut)
              .curve(points.sSeatOutCp2, points.sKneeOutCp1, points.sKneeOut)
              .curve(points.sKneeOutCp2, points.sFloorOutCp1, points.sFloorOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.sWaistOut)
              .curve(points.sSeatOut, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sFloorOutCp1, points.sFloorOut)
          else
            return new Path()
              .move(points.sWaistOut)
              ._curve(points.sSeatOutCp1, points.sSeatOut)
              .curve(points.sSeatOutCp2, points.sCalfOutCp1, points.sCalfOut)
              .curve(points.sCalfOutCp2, points.sFloorOutCp1, points.sFloorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.sWaistOut)
              .curve(points.sSeatOut, points.sFloorOutCp1, points.sFloorOut)
          else
            return new Path()
              .move(points.sWaistOut)
              ._curve(points.sSeatOutCp1, points.sSeatOut)
              .curve(points.sSeatOutCp2, points.sFloorOutCp1, points.sFloorOut)
        }
      }
    }
    const drawShiftInseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.sFloorIn)
            .curve(points.sFloorInCp2, points.sCalfInCp1, points.sCalfIn)
            .curve(points.sCalfInCp2, points.sKneeInCp1, points.sKneeIn)
            .curve(points.sKneeInCp2, points.sUpperLegInCp1, points.sUpperLegIn)
        } else {
          return new Path()
            .move(points.sFloorIn)
            .curve(points.sFloorInCp2, points.sKneeInCp1, points.sKneeIn)
            .curve(points.sKneeInCp2, points.sUpperLegInCp1, points.sUpperLegIn)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.sFloorIn)
            .curve(points.sFloorInCp2, points.sCalfInCp1, points.sCalfIn)
            .curve(points.sCalfInCp2, points.sUpperLegInCp1, points.sUpperLegIn)
        } else {
          return new Path()
            .move(points.sFloorIn)
            .curve(points.sFloorInCp2, points.sUpperLegInCp1, points.sUpperLegIn)
        }
      }
    }

    points.mBottomOut = points.bottomOut.flipY(points.mSplitOut)
    points.mBottomIn = points.bottomIn.flipY(points.mSplitIn)

    if (options.legLength < 1) {
      paths.mOutSeam0 = drawShiftOutseam()
        .split(points.mSplitOut)[1]
        .split(points.mBottomOut)[0]
        .hide()
    } else {
      paths.mOutSeam0 = drawShiftOutseam().split(points.mSplitOut)[1].hide()
    }
    paths.mInseam1 = drawShiftInseam().split(points.mBottomIn)[1].split(points.mSplitIn)[0].hide()

    const drawSeamLeft = () => {
      if (options.legBandStyle == 'cuffed') {
        return paths.outSeam.join(paths.outSeam0).join(paths.mOutSeam0)
      }
      if (options.legBandStyle == 'bandStraight' || options.legBandStyle == 'bandCurved') {
        return paths.outSeam.split(points.splitOut)[0]
      }
      if (options.legBandStyle == 'turnover') {
        return paths.outSeam.join(paths.outSeam0)
      }
    }

    paths.saLeft = drawSeamLeft().hide()

    if (options.frontPocketOpeningStyle == 'slanted' && options.frontPocketsBool) {
      paths.saLeft = paths.saLeft.split(points.frontPocketOpeningOut)[1].hide()
    }

    const drawSeamRight = () => {
      if (options.legBandStyle == 'cuffed') {
        return paths.mInseam1.join(paths.inseam1).join(paths.inseam)
      }
      if (options.legBandStyle == 'bandStraight' || options.legBandStyle == 'bandCurved') {
        return paths.inseam.split(points.splitIn)[1]
      }
      if (options.legBandStyle == 'turnover') {
        return paths.inseam1.join(paths.inseam)
      }
    }
    points.hemOut = drawSeamLeft().end()
    points.hemIn = drawSeamRight().start()
    //paths
    const drawWaist = () =>
      options.frontPocketOpeningStyle == 'slanted' && options.frontPocketsBool
        ? new Path()
            .move(points.waistIn)
            .line(points.frontPocketOpeningWaist)
            .line(points.frontPocketOpeningCorner)
            .line(points.frontPocketOpeningOut)
        : new Path().move(points.waistIn).line(points.waistOut)

    paths.seam = new Path()
      .move(points.hemOut)
      .line(points.hemIn)
      .join(drawSeamRight())
      .join(paths.crotchSeam)
      .join(drawWaist())
      .join(paths.saLeft)
    //stores
    if (options.legBandStyle == 'straight') {
      store.set('legBandLength', store.get('legBandBack') + points.splitIn.dist(points.splitOut))
    } else {
      store.set('legBandLength', store.get('legBandBack') + points.bottomIn.dist(points.bottomOut))
    }
    store.set(
      'legBandLengthTop',
      store.get('legBandBackTop') + points.splitIn.dist(points.splitOut)
    )
    if (complete) {
      //grainline
      points.grainlineTo = points.split.shift(0, points.split.dx(points.crotchSeamCurveEnd) * 0.5)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.crotchSeamCurveEnd.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      if (options.frontPocketsBool) {
        if (options.frontPocketOpeningStyle == 'slanted') {
          snippets.frontPocketOpeningCorner = new Snippet('notch', points.frontPocketOpeningCorner)
        } else {
          macro('sprinkle', {
            snippet: 'notch',
            on: ['frontPocketOpeningTopOut', 'frontPocketOpeningBottomOut'],
          })
        }
        snippets.frontPocketOut = new Snippet('notch', points.frontPocketOut)
      }
      //title
      points.title = new Point(
        points.split.x,
        points.crotchSeamCurveEnd.y + points.crotchSeamCurveEnd.dy(points.split) * 0.5
      )
      macro('title', {
        nr: 5,
        title: 'Front',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      //fit guides
      if (
        options.fitGuides &&
        ((points.bottom.y > points.knee.y &&
          options.legBandStyle != 'bandStraight' &&
          options.legBandStyle != 'bandCurved') ||
          (points.split.y > points.knee.y && options.legBandStyle == 'bandStraight') ||
          options.legBandStyle == 'bandCurved')
      ) {
        paths.kneeGuide = new Path()
          .move(points.kneeGuideOut)
          .line(points.kneeGuideIn)
          .attr('class', 'various')
          .attr('data-text', 'Knee Guide')
          .attr('data-text-class', 'right')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['kneeGuideIn', 'kneeGuideOut'],
        })
      }
      //paths
      if (options.legBandStyle != 'bandStraight' && options.legBandStyle != 'bandCurved') {
        paths.hemFold = new Path()
          .move(points.bottomOut)
          .line(points.bottomIn)
          .attr('class', 'mark help')
          .attr('data-text', 'Hem Fold-line')
          .attr('data-text-class', 'center')
        if (options.legBandStyle == 'cuffed') {
          paths.cuffFold = new Path()
            .move(points.mSplitOut)
            .line(points.mSplitIn)
            .attr('class', 'mark help')
            .attr('data-text', 'Cuff Fold-line')
            .attr('data-text-class', 'center')
        }
      }
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const inseamSa = sa * options.inseamSaWidth * 100

        points.saHemOut = utils.beamIntersectsY(
          drawSeamLeft().offset(inseamSa).shiftFractionAlong(0.995),
          drawSeamLeft().offset(inseamSa).end(),
          points.hemIn.y + sa
        )
        points.saHemIn = utils.beamIntersectsY(
          drawSeamRight().offset(sideSeamSa).start(),
          drawSeamRight().offset(sideSeamSa).shiftFractionAlong(0.005),
          points.hemOut.y + sa
        )

        const drawSaWaist = () =>
          options.frontPocketOpeningStyle == 'slanted' && options.frontPocketsBool
            ? new Path()
                .move(points.saWaistIn)
                .line(points.saFrontPocketOpeningWaist)
                .line(points.saFrontPocketOpeningCorner)
                .line(points.saFrontPocketOpeningOut)
            : new Path().move(points.saWaistIn).line(points.saWaistOut)

        paths.sa = new Path()
          .move(points.saHemOut)
          .line(points.saHemIn)
          .join(drawSeamRight().offset(inseamSa))
          .line(points.saUpperLegIn)
          .join(paths.crotchSeam.offset(sa * options.crotchSeamSaWidth * 100))
          .line(points.saWaistIn)
          .join(drawSaWaist())
          .join(paths.saLeft.offset(sideSeamSa))
          .line(points.saHemOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    if (store.get('sidePocketsBool')) {
      points.sidePocketOut = drawOutseam().shiftAlong(store.get('sidePocketPlacement'))
      if (complete /*  && points.split.y >= points.sidePocketOut.y */) {
        points.sidePocketOutAnchor = drawOutseam()
          .split(points.sidePocketOut)[0]
          .shiftFractionAlong(0.995)
        points.sidePocketIn = points.sidePocketOut
          .shiftTowards(
            points.sidePocketOutAnchor,
            store.get('sidePocketWidth') * options.sidePocketBalance
          )
          .rotate(-90, points.sidePocketOut)
        //notches
        snippets.sidePocketIn = new Snippet('notch', points.sidePocketIn)
        //paths
        paths.sidePocketLine = new Path()
          .move(points.sidePocketOut)
          .line(points.sidePocketIn)
          .attr('class', 'fabric help')
          .attr('data-text', 'Side Pocket-Line')
      }
    }

    return part
  },
}
