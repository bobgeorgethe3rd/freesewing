import { sharedFront } from './sharedFront.mjs'

export const frontFacing = {
  name: 'bunny.frontFacing',
  from: sharedFront,
  options: {
    bodiceFacingHemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
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
    //set render
    if (!options.bodiceFacings) {
      part.hide()
      return part
    }
    //remove paths & snippets
    const keepPaths = ['armhole', 'cfNeck']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //guides
    if (options.daisyGuide) {
      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.bust)
        .line(points.waistDartRight)
        .line(points.sideWaist)
        .line(points.bustDartBottom)
        .line(points.bust)
        .line(points.bustDartTop)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .attr('class', 'various lashed')
    }
    //let's begin
    points.cfFacing = points.cfTop.shift(-90, points.armhole.dist(points.bustDartTop))
    points.cfFacingCp2 = new Point(points.bust.x, points.cfFacing.y)
    points.bustDartTopCp1 = new Point(points.bust.x, points.bustDartTop.y)
    //paths
    paths.hemBase = new Path()
      .move(points.cfFacing)
      .curve(points.cfFacingCp2, points.bustDartTopCp1, points.bustDartTop)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.armhole)
      .join(paths.armhole)
      .line(points.shoulderTop)
      .join(paths.cfNeck)
      .line(points.cfFacing)
      .close()

    if (complete) {
      //grainline
      if (options.cfSaWidth > 0) {
        points.grainlineFrom = new Point(points.cfNeckCp1.x / 3, points.cfTop.y)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfFacing.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      } else {
        points.cutOnFoldFrom = points.cfTop.shiftFractionTowards(points.cfFacing, 0.1)
        points.cutOnFoldTo = points.cfFacing.shiftFractionTowards(points.cfTop, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //notches
      snippets.armholePitch = new Snippet('notch', points.armholePitch)
      //title
      points.title = new Point(points.cfTopCp1.x, (points.cfTop.y + points.cfFacing.y) / 2)
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Front Facing',
        scale: 0.5,
      })
      if (sa) {
        const bodiceFacingHem = sa * options.bodiceFacingHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const neckSa = sa * options.necklineSaWidth * 100
        const cfSa = sa * options.cfSaWidth * 100

        points.saSideFacing = utils.beamsIntersect(
          points.bustDartTopCp1
            .shiftTowards(points.bustDartTop, bodiceFacingHem)
            .rotate(-90, points.bustDartTopCp1),
          points.bustDartTop
            .shiftTowards(points.bustDartTopCp1, bodiceFacingHem)
            .rotate(90, points.bustDartTop),
          points.bustDartTop
            .shiftTowards(points.armhole, sideSeamSa)
            .rotate(-90, points.bustDartTop),
          points.armhole.shiftTowards(points.bustDartTop, sideSeamSa).rotate(90, points.armhole)
        )

        points.saArmhole = utils.beamsIntersect(
          points.saSideFacing,
          points.saSideFacing.shift(points.bustDartTop.angle(points.armhole), 1),
          points.armhole.shiftTowards(points.armholeCp2, armholeSa).rotate(-90, points.armhole),
          points.armholeCp2.shiftTowards(points.armhole, armholeSa).rotate(90, points.armholeCp2)
        )

        points.saShoulder = points.shoulder
          .shift(points.shoulderTop.angle(points.shoulder), armholeSa)
          .shift(points.shoulderTop.angle(points.shoulder) + 90, sa * options.shoulderSaWidth * 100)

        points.saShoulderTop = utils.beamsIntersect(
          points.saShoulder,
          points.saShoulder.shift(points.shoulder.angle(points.shoulderTop), 1),
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.shoulderTop.angle(points.shoulder) + 90, 1)
        )

        points.saCfTop = utils.beamIntersectsX(
          paths.cfNeck.offset(neckSa).end(),
          paths.cfNeck.offset(neckSa).end().shift(180, 1),
          points.cfTop.x - cfSa
        )

        points.cfNeckEnd = paths.cfNeck.offset(neckSa).end()

        if (points.saCfTop.x > points.cfNeckEnd.x) {
          points.saCfTop = points.cfTop.shift(180, cfSa)
        }
        points.saCfFacing = points.cfFacing.translate(-cfSa, bodiceFacingHem)

        paths.sa = paths.hemBase
          .offset(bodiceFacingHem)
          .line(points.saSideFacing)
          .line(points.saArmhole)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saShoulder)
          .line(points.saShoulderTop)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfTop)
          .line(points.saCfFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
