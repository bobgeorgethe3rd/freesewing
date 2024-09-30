import { frontBase } from './frontBase.mjs'
import { backFacing } from './backFacing.mjs'

export const frontFacing = {
  name: 'petunia.frontFacing',
  from: frontBase,
  after: backFacing,
  hide: {
    from: true,
    inherited: true,
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
  }) => {
    //set render
    if (!options.sleevesBool || !options.bodiceFacings) {
      part.hide()
      return part
    }
    //remove paths & snippets
    if (options.daisyGuides) {
      const keepThese = 'daisyGuide'
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //let's begin
    points.shoulderMid = points.shoulder.shiftFractionTowards(points.shoulderTop, 0.5)
    points.cfFacing = points.cfNeck
      .shiftTowards(points.shoulderTopCp2, points.shoulderTop.dist(points.shoulderMid))
      .rotate(-90, points.cfNeck)
    points.cfFacingCp1 = utils.beamsIntersect(
      points.shoulderMid,
      points.shoulderTop.rotate(90, points.shoulderMid),
      points.cfFacing,
      points.cfNeck.rotate(-90, points.cfFacing)
    )
    //paths
    paths.hemBase = new Path()
      .move(points.cfFacing)
      .curve_(points.cfFacingCp1, points.shoulderMid)
      .hide()

    paths.cfNeck = new Path()
      .move(points.shoulderTop)
      ._curve(points.shoulderTopCp2, points.cfNeck)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.shoulderTop)
      .join(paths.cfNeck)
      .line(points.cfFacing)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.cfFacing
      points.grainlineFrom = utils.beamIntersectsX(
        points.shoulderTopCp2,
        points.cfNeck,
        points.grainlineTo.x
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.cfNeck = new Snippet('notch', points.cfNeck)
      //title
      points.title = paths.cfNeck
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(paths.hemBase.shiftFractionAlong(0.5), 0.25)
      macro('title', {
        nr: 15,
        title: 'Front Facing',
        at: points.title,
        cutNr: 2,
        scale: 0.15,
      })
      if (sa) {
        const bodiceFacingHem = sa * options.bodiceFacingHemWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saShoulderMid = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saHps,
          points.cfFacingCp1
            .shiftTowards(points.shoulderMid, bodiceFacingHem)
            .rotate(-90, points.cfFacingCp1),
          points.shoulderMid
            .shiftTowards(points.cfFacingCp1, bodiceFacingHem)
            .rotate(90, points.shoulderMid)
        )

        points.saShoulderTop = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saHps,
          points.shoulderTop
            .shiftTowards(points.shoulderTopCp2, neckSa)
            .rotate(-90, points.shoulderTop),
          points.shoulderTopCp2
            .shiftTowards(points.shoulderTop, neckSa)
            .rotate(90, points.shoulderTopCp2)
        )

        points.saCfNeck = points.cfNeck
          .shift(points.shoulderTopCp2.angle(points.cfNeck), bodiceFacingHem)
          .shift(points.cfFacing.angle(points.cfNeck), sa)

        points.saCfFaing = points.cfFacing
          .shift(points.cfNeck.angle(points.cfFacing), bodiceFacingHem)
          .shift(points.cfFacingCp1.angle(points.cfFacing), bodiceFacingHem)

        paths.sa = paths.hemBase
          .offset(bodiceFacingHem)
          .line(points.saShoulderMid)
          .line(points.saShoulderTop)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfNeck)
          .line(points.saCfFaing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
