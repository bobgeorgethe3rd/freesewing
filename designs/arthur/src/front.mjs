import { front as byronFront } from '@freesewing/byron'
import { back } from './back.mjs'

export const front = {
  name: 'arthur.front',
  from: byronFront,
  after: back,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    frontArmholeDepth: 55.2, //Locked for Arthur
    frontArmholePitchWidth: 91.1, //Locked for Arthur
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
    //remove paths & snippets
    const keepThese = ['sideSeam', 'cfNeck', 'seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.byronGuides) {
      paths.byronGuide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //measurements
    const underArmCurveCpDist = store.get('underArmCurveCpDist')
    //let's begin
    points.shoulderRise = points.shoulder.shift(
      points.shoulder.angle(points.hps) - 90,
      store.get('shoulderRise')
    )

    points.armholeDrop = paths.sideSeam.reverse().shiftFractionAlong(options.armholeDrop)
    points.sleeveTopMax = points.hps.shiftOutwards(points.shoulderRise, store.get('sleeveLength'))
    points.elbowTop = points.hps.shiftOutwards(points.shoulderRise, store.get('elbowLength'))

    points.sleeveBottomMax = options.fitSleeveWidth
      ? points.sleeveTopMax.shift(
          points.sleeveTopMax.angle(points.hps) + 90,
          store.get('wrist') * 0.5
        )
      : utils.beamsIntersect(
          points.armholeDrop,
          points.armholeDrop.shift(points.hps.angle(points.shoulderRise), 1),
          points.sleeveTopMax,
          points.sleeveTopMax.shift(points.shoulderRise.angle(points.hps) + 90, 1)
        )

    points.elbowBottom = utils.beamsIntersect(
      points.armholeDrop,
      points.sleeveBottomMax,
      points.elbowTop,
      points.elbowTop.shift(points.shoulderRise.angle(points.hps) + 90, 1)
    )

    points.sleeveBottomMin = points.armholeDrop.shiftTowards(
      points.sleeveBottomMax,
      store.get('underArmSleeveLength')
    )
    points.sleeveTopMin = utils.beamsIntersect(
      points.hps,
      points.shoulderRise,
      points.sleeveBottomMin,
      points.sleeveBottomMin.shift(points.sleeveBottomMax.angle(points.sleeveTopMax), 1)
    )

    points.underArmCurveStart =
      options.armholeDrop > 0
        ? paths.sideSeam
            .split(points.armholeDrop)[0]
            .reverse()
            .shiftAlong(store.get('underArmSideSeamLength'))
        : paths.sideSeam.reverse().shiftAlong(underArmSideSeamLength)

    points.underArmCurveAnchor = utils.beamsIntersect(
      points.underArmCurveStart,
      paths.sideSeam.split(points.underArmCurveStart)[0].shiftFractionAlong(0.995),
      points.sleeveBottomMax,
      points.sleeveBottomMin
    )

    points.underArmCurveOrigin = utils.beamsIntersect(
      points.underArmCurveAnchor,
      points.underArmCurveStart.shiftFractionTowards(points.sleeveBottomMin, 0.5),
      points.sleeveBottomMin,
      points.underArmCurveAnchor.rotate(90, points.sleeveBottomMin)
    )

    points.underArmCurveStartCp2 = points.underArmCurveStart.shiftTowards(
      points.underArmCurveAnchor,
      underArmCurveCpDist
    )
    points.sleeveBottomMinCp1 = points.sleeveBottomMin.shiftTowards(
      points.underArmCurveAnchor,
      underArmCurveCpDist
    )

    if (points.underArmCurveStartCp2.y < points.underArmCurveAnchor.y)
      points.underArmCurveStartCp2 = points.underArmCurveAnchor

    points.sleeveBottom = options.fullSleeves
      ? options.sleeveLength < 0.5
        ? points.sleeveBottomMin.shiftFractionTowards(points.elbowBottom, options.sleeveLength * 2)
        : points.elbowBottom.shiftFractionTowards(
            points.sleeveBottomMax,
            2 * options.sleeveLength - 1
          )
      : points.sleeveBottomMin

    points.sleeveTop = options.fullSleeves
      ? options.sleeveLength < 0.5
        ? points.sleeveTopMin.shiftFractionTowards(points.elbowTop, options.sleeveLength * 2)
        : points.elbowTop.shiftFractionTowards(points.sleeveTopMax, 2 * options.sleeveLength - 1)
      : points.sleeveTopMin

    //paths
    if (options.byronGuides) {
      paths.armLine = paths.sideSeam
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

    paths.sideSeam = paths.sideSeam
      .split(points.underArmCurveStart)[0]
      .curve(points.underArmCurveStartCp2, points.sleeveBottomMinCp1, points.sleeveBottomMin)
      .line(points.sleeveBottom)
      .hide()

    paths.seam = new Path()
      .move(points.cWaist)
      .line(points.sideWaist)
      .join(paths.sideSeam)
      .line(points.sleeveTop)
      .line(points.hps)
      .join(paths.cfNeck)
      .line(points.cWaist)
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfNeck
        points.cutOnFoldTo = points.cWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cfNeck.shiftFractionTowards(points.cfNeckCp1, 1 / 3)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      snippets.underArmCurveStart = new Snippet('notch', points.underArmCurveStart)
      if (points.sleeveBottomMin.dist(points.sleeveBottom) > 0) {
        snippets.sleeveBottomMin = new Snippet('notch', points.sleeveBottomMin)
      }
      //title
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Front',
        scale: 0.75,
        cutNr: titleCutNum,
      })

      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const sleeveHemSa = sa * options.sleeveHemWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100

        points.saSleeveBottom = utils.beamsIntersect(
          points.sleeveBottomMinCp1
            .shiftTowards(points.sleeveBottomMin, sideSeamSa)
            .rotate(-90, points.sleeveBottomMinCp1),
          points.sleeveBottomMin
            .shiftTowards(points.sleeveBottomMinCp1, sideSeamSa)
            .rotate(90, points.sleeveBottomMin),
          points.sleeveBottom
            .shiftTowards(points.sleeveTop, sleeveHemSa)
            .rotate(-90, points.sleeveBottom),
          points.sleeveTop
            .shiftTowards(points.sleeveBottom, sleeveHemSa)
            .rotate(90, points.sleeveTop)
        )

        points.saSleeveTop = utils.beamsIntersect(
          points.sleeveTop.shiftTowards(points.hps, shoulderSa).rotate(-90, points.sleeveTop),
          points.hps.shiftTowards(points.sleeveTop, shoulderSa).rotate(90, points.hps),
          points.saSleeveBottom,
          points.saSleeveBottom.shift(points.sleeveBottom.angle(points.sleeveTop), 1)
        )

        points.saHps = utils.beamsIntersect(
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulderRise) + 90, 1),
          points.saSleeveTop,
          points.saSleeveTop.shift(points.shoulderRise.angle(points.hps), 1)
        )

        paths.sa = new Path()
          .move(points.saCWaist)
          .line(points.saSideWaist)
          .join(paths.sideSeam.split(points.sleeveBottomMin)[0].offset(sideSeamSa))
          .line(points.saSleeveBottom)
          .line(points.saSleeveTop)
          .line(points.saHps)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfNeck)
          .line(points.saCWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
