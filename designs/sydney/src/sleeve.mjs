import { pctBasedOn } from '@freesewing/core'
import { backBase } from './backBase.mjs'

export const sleeve = {
  name: 'sydney.sleeve',
  from: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Sleeves
    sleevesBool: { bool: true, menu: 'sleeves' },
    sleeveHemStyle: { dflt: 'turnover', list: ['cuffed', 'turnover'], menu: 'sleeves' },
    sleeveBandWidth: {
      pct: 3.5,
      min: 1,
      max: 17.4,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    }, //Altered for Sydney
    //Construction
    sleeveHemWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    sleeveCutOnFold: { bool: false, menu: 'construction' },
  },
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
    log,
  }) => {
    if (!options.sleevesBool) {
      part.hide()
      return part
    }
    //remove path
    for (let i in paths) delete paths[i]
    //rotate
    const rotAngle = points.hps.angle(points.sleeveTopMax) - 270
    for (let i in points) points[i] = points[i].rotate(-rotAngle, points.underArmCurveAnchor)
    //guide
    if (options.byronGuides) {
      paths.sideSeamGuide = new Path()
        .move(points.sideWaist)
        .curve_(points.sideWaistCp2, points.armhole)
        .hide()

      paths.byronGuide = new Path()
        .move(points.cWaist)
        .line(points.sideWaist)
        .join(paths.sideSeamGuide)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        ._curve(points.cbNeckCp1, points.cbNeck)
        .line(points.cWaist)
        .close()
        .attr('class', 'various lashed')

      paths.armLine = paths.sideSeamGuide
        .clone()
        .split(points.underArmCurveStart)[0]
        .curve(points.underArmCurveStartCp2, points.sleeveBottomMinCp1, points.sleeveBottomMin)
        .line(points.sleeveBottomMax)
        .line(points.sleeveTopMax)
        .line(points.hps)
        .attr('class', 'various lashed')

      paths.anchorLines = new Path()
        .move(points.sleeveBottomMax)
        .line(points.sleeveTopMax)
        .move(points.elbowBottom)
        .line(points.elbowTop)
        .move(points.sleeveBottomMin)
        .line(points.sleeveTopMin)
        .attr('class', 'various lashed')
    }
    //measurements
    const sleeveBandWidth =
      points.underArmCurveAnchor.dist(points.sleeveBottomMax) > absoluteOptions.sleeveBandWidth
        ? absoluteOptions.sleeveBandWidth
        : points.underArmCurveAnchor.dist(points.sleeveBottomMax) * 0.5
    //let's begin
    points.sleeveTurnoverBottom = utils
      .beamIntersectsY(
        points.underArmCurveAnchor,
        points.sleeveBottom,
        points.sleeveBottom.y - sleeveBandWidth
      )
      .flipY(points.sleeveBottom)
    points.sleeveBottomF = points.sleeveBottom.flipY(points.sleeveTurnoverBottom)

    points.sleeveTurnoverTop = points.sleeveTop.shift(-90, sleeveBandWidth)
    points.sleeveTopF = points.sleeveTop.shift(-90, sleeveBandWidth * 2)

    //paths

    paths.hemBase =
      options.sleeveHemStyle == 'turnover'
        ? new Path()
            .move(points.sleeveBottom)
            .line(points.sleeveTurnoverBottom)
            .line(points.sleeveTurnoverTop)
            .line(points.sleeveTop)
            .hide()
        : new Path()
            .move(points.sleeveBottom)
            .line(points.sleeveTurnoverBottom)
            .line(points.sleeveBottomF)
            .line(points.sleeveTopF)
            .line(points.sleeveTurnoverTop)
            .line(points.sleeveTop)
            .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.shoulderSplit)
      .line(points.underArmCurveAnchor)
      .line(points.sleeveBottom)
      .close()
      .unhide()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.sleeveCutOnFold) {
        points.cutOnFoldFrom = points.sleeveTop
        points.cutOnFoldTo = points.shoulderSplit.shiftFractionTowards(points.sleeveTop, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 2
      } else {
        points.grainlineTo = points.sleeveTop.shiftFractionTowards(points.sleeveBottom, 0.1)
        points.grainlineFrom = new Point(
          points.grainlineTo.x,
          points.shoulderSplit.shiftFractionTowards(points.sleeveTop, 0.1).y
        )
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 4
      }
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['underArmCurveAnchor', 'shoulderSplit'],
      })
      //title
      points.title = new Point(
        points.sleeveBottom.x + (points.sleeveTop.x - points.sleeveBottom.x) * 0.45,
        (points.sleeveBottom.y + points.underArmCurveAnchor.y) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Sleeve',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      //foldines
      paths.hemFold = new Path()
        .move(points.sleeveBottom)
        .line(points.sleeveTop)
        .attr('class', 'mark help')
        .attr('data-text', 'Hem Fold-line')
        .attr('data-text-class', 'center')
      if (options.sleeveHemStyle == 'cuffed') {
        paths.cuffFold = new Path()
          .move(points.sleeveTurnoverBottom)
          .line(points.sleeveTurnoverTop)
          .attr('class', 'mark help')
          .attr('data-text', 'Cuff Fold-line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        const sleeveHemSa = sa * options.sleeveHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const shoulderSa = options.sleeveCutOnFold ? 0 : sa * options.shoulderSaWidth * 100

        points.saSleeveBottom = utils.beamIntersectsY(
          points.underArmCurveAnchor
            .shiftTowards(points.sleeveBottom, sideSeamSa)
            .rotate(-90, points.underArmCurveAnchor),
          points.sleeveBottom
            .shiftTowards(points.underArmCurveAnchor, sideSeamSa)
            .rotate(90, points.sleeveBottom),
          points.sleeveBottom.y
        )

        points.saSleeveBottomF = utils.beamIntersectsY(
          points.sleeveTurnoverBottom
            .shiftTowards(points.sleeveBottomF, sideSeamSa)
            .rotate(-90, points.sleeveTurnoverBottom),
          points.sleeveBottomF
            .shiftTowards(points.sleeveTurnoverBottom, sideSeamSa)
            .rotate(90, points.sleeveBottomF),
          points.sleeveBottomF.y + sleeveHemSa
        )

        points.saSleeveTopF = points.sleeveTopF.translate(shoulderSa, sleeveHemSa)

        if (options.sleeveHemStyle == 'turnover') {
          points.saSleeveTurnoverBottom = utils.beamIntersectsY(
            points.sleeveBottom
              .shiftTowards(points.sleeveTurnoverBottom, sideSeamSa)
              .rotate(-90, points.sleeveBottom),
            points.sleeveTurnoverBottom
              .shiftTowards(points.sleeveBottom, sideSeamSa)
              .rotate(90, points.sleeveTurnoverBottom),
            points.sleeveTurnoverBottom.y + sleeveHemSa
          )
          points.saSleeveTurnoverTop = points.sleeveTurnoverTop.translate(shoulderSa, sleeveHemSa)
        } else {
          points.saSleeveTurnoverBottom = utils.beamIntersectsY(
            points.underArmCurveAnchor
              .shiftTowards(points.sleeveTurnoverBottom, sideSeamSa)
              .rotate(-90, points.underArmCurveAnchor),
            points.sleeveTurnoverBottom
              .shiftTowards(points.underArmCurveAnchor, sideSeamSa)
              .rotate(90, points.sleeveTurnoverBottom),
            points.sleeveTurnoverBottom.y
          )
          points.saSleeveTurnoverTop = points.sleeveTurnoverTop.shift(0, shoulderSa)
        }

        // points.saShoulderCorner = utils.beamIntersectsX(
        // points.shoulderSplit
        // .shiftTowards(points.underArmCurveAnchor, sideSeamSa)
        // .rotate(-90, points.shoulderSplit),
        // points.underArmCurveAnchor
        // .shiftTowards(points.shoulderSplit, sideSeamSa)
        // .rotate(90, points.underArmCurveAnchor),
        // points.sleeveTop.x
        // )

        // points.saShoulderSplit = utils.beamIntersectsX(
        // points.saShoulderCorner,
        // points.saShoulderCorner.shift(
        // points.shoulderSplit.angle(points.underArmCurveAnchor) * -1,
        // 1
        // ),
        // points.saSleeveTurnoverTop.x
        // )

        points.saShoulderSplit = utils.beamIntersectsX(
          points.underArmCurveAnchor,
          points.shoulderSplit,
          points.sleeveTop.x + shoulderSa
        )

        points.saShoulderCorner = utils.beamsIntersect(
          points.saShoulderSplit,
          points.saShoulderSplit.shift(
            270 - (270 - points.shoulderSplit.angle(points.underArmCurveAnchor)) * 2,
            1
          ),
          points.shoulderSplit
            .shiftTowards(points.underArmCurveAnchor, sideSeamSa)
            .rotate(-90, points.shoulderSplit),
          points.underArmCurveAnchor
            .shiftTowards(points.shoulderSplit, sideSeamSa)
            .rotate(90, points.underArmCurveAnchor)
        )

        points.saUnderArmCurveAnchor = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.shoulderSplit.angle(points.underArmCurveAnchor), 1),
          points.saSleeveBottom,
          points.saSleeveBottom.shift(points.sleeveBottom.angle(points.underArmCurveAnchor), 1)
        )

        paths.saHem =
          options.sleeveHemStyle == 'turnover'
            ? new Path()
                .move(points.saSleeveBottom)
                .line(points.saSleeveTurnoverBottom)
                .line(points.saSleeveTurnoverTop)
                .hide()
            : new Path()
                .move(points.saSleeveBottom)
                .line(points.saSleeveTurnoverBottom)
                .line(points.saSleeveBottomF)
                .line(points.saSleeveTopF)
                .hide()

        paths.sa = paths.saHem
          .clone()
          .line(points.saShoulderSplit)
          .line(points.saShoulderCorner)
          .line(points.saUnderArmCurveAnchor)
          .line(points.saSleeveBottom)
          .close()
          .attr('class', 'fabric sa')
          .unhide()
      }
    }

    return part
  },
}
