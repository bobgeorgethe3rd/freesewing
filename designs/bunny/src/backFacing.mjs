import { frontFacing } from './frontFacing.mjs'
import { back } from './back.mjs'

export const backFacing = {
  name: 'bunny.backFacing',
  from: back,
  after: frontFacing,
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
    const keepPaths = ['daisyGuide', 'armhole', 'cbNeck']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //let's begin
    points.neckFacing = points.neckPlacket.shift(-90, points.armhole.dist(points.sideSeamCurveEnd))
    points.neckFacingCp2 = new Point(points.dartTip.x, points.neckFacing.y)
    points.sideSeamCurveEndCp1 = new Point(points.dartTip.x, points.sideSeamCurveEnd.y)
    //paths
    paths.hemBase = new Path()
      .move(points.neckFacing)
      .curve(points.neckFacingCp2, points.sideSeamCurveEndCp1, points.sideSeamCurveEnd)
      .hide()

    paths.cbNeck = paths.cbNeck.split(points.neckPlacket)[0]

    paths.seam = paths.hemBase
      .clone()
      .line(points.armhole)
      .join(paths.armhole)
      .line(points.shoulderTop)
      .join(paths.cbNeck)
      .line(points.neckFacing)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.neckPlacket.shiftFractionTowards(points.cbNeckCp1, 1 / 3)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.neckFacing.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
      //title
      points.title = new Point(points.cbNeckCp1.x, (points.neckPlacket.y + points.neckFacing.y) / 2)
      macro('title', {
        at: points.title,
        nr: '5',
        title: 'Back Facing',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const bodiceFacingHem = sa * options.bodiceFacingHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.necklineSaWidth * 100

        points.saSideFacing = utils.beamsIntersect(
          points.sideSeamCurveEndCp1
            .shiftTowards(points.sideSeamCurveEnd, bodiceFacingHem)
            .rotate(-90, points.sideSeamCurveEndCp1),
          points.sideSeamCurveEnd
            .shiftTowards(points.sideSeamCurveEndCp1, bodiceFacingHem)
            .rotate(90, points.sideSeamCurveEnd),
          points.sideSeamCurveEnd
            .shiftTowards(points.armhole, sideSeamSa)
            .rotate(-90, points.sideSeamCurveEnd),
          points.armhole
            .shiftTowards(points.sideSeamCurveEnd, sideSeamSa)
            .rotate(90, points.armhole)
        )

        points.saNeckPlacket = new Point(
          points.neckPlacket.x - sa,
          paths.cbNeck.offset(neckSa).end().y
        )
        points.saNeckFacing = points.neckFacing.translate(-sa, bodiceFacingHem)

        paths.sa = paths.hemBase
          .clone()
          .offset(bodiceFacingHem)
          .line(points.saSideFacing)
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saNeckPlacket)
          .line(points.saNeckFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
