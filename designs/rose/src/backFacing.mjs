import { frontFacing } from './frontFacing.mjs'
import { back } from './back.mjs'

export const backFacing = {
  name: 'rose.backFacing',
  after: frontFacing,
  from: back,
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
    //removing paths and snippets not required from Daisy
    const keepThese = ['daisyGuide', 'cbNeck']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    macro('title', false)
    macro('scalebox', false)
    //measures
    const facingWidth = store.get('bodiceFacingWidth')
    //let's begin
    points.cbFacing = points.cbNeck.shift(-90, facingWidth)
    points.sideFacing = points.armhole.shiftTowards(points.sideWaist, facingWidth)
    points.cbFacingCp2 = new Point(points.dartTip.x, points.cbFacing.y)
    points.sideFacingCp1 = new Point(points.dartTip.x, points.sideFacing.y)
    //paths
    paths.hemBase = new Path()
      .move(points.cbFacing)
      .curve(points.cbFacingCp2, points.sideFacingCp1, points.sideFacing)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.armhole)
      .join(paths.armhole)
      .line(points.shoulderTop)
      .join(paths.cbNeck)
      .line(points.cbFacing)

    if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck.shiftFractionTowards(points.cbFacing, 0.1)
        points.cutOnFoldTo = points.cbFacing.shiftFractionTowards(points.cbNeck, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cbFacing.shiftFractionTowards(points.cbFacingCp2, 0.15)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbNeck.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      snippets.notch = new Snippet('bnotch', points.armholePitch)
      //title
      points.title = new Point(points.cbNeckCp1.x * 0.95, (points.cbNeck.y + points.cbFacing.y) / 2)
      macro('title', {
        at: points.title,
        nr: '13',
        title: 'Back Facing',
        scale: 0.5,
      })
      if (sa) {
        const bodiceFacingHem = sa * options.bodiceFacingHemWidth * 100
        points.saSideFacing = utils.beamIntersectsY(
          points.saArmholeCorner,
          points.saArmholeCorner.shift(points.armhole.angle(points.sideWaist), 1),
          points.sideFacing.shift(-90, bodiceFacingHem).y
        )

        points.saCbFacing = new Point(points.saCbWaist.x, points.cbFacing.y + bodiceFacingHem)

        paths.sa = paths.hemBase
          .offset(bodiceFacingHem)
          .line(points.saSideFacing)
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.cbNeck.offset(sa * options.neckSaWidth * 100))
          .line(points.saCbNeck)
          .line(points.saCbFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
