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
    if (options.closurePosition == 'back' && options.placketStyle != 'none') {
      points.neckFacing = points.bodicePlacketNeckRight
    } else {
      points.neckFacing = points.cbNeck
    }

    points.bottomLeftFacing = points.neckFacing.shift(-90, facingWidth)
    points.sideFacing = points.armhole.shiftTowards(points.sideWaist, facingWidth)
    points.bottomLeftFacingCp2 = new Point(points.dartTip.x, points.bottomLeftFacing.y)
    points.sideFacingCp1 = new Point(points.dartTip.x, points.sideFacing.y)
    //paths
    const drawNeck = () => {
      if (options.closurePosition == 'back' && options.placketStyle != 'none') {
        return paths.cbNeck.split(points.bodicePlacketNeckRight)[0]
      } else {
        return paths.cbNeck
      }
    }
    paths.hemBase = new Path()
      .move(points.bottomLeftFacing)
      .curve(points.bottomLeftFacingCp2, points.sideFacingCp1, points.sideFacing)
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
      .join(drawNeck())
      .line(points.bottomLeftFacing)

    if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.neckFacing.shiftFractionTowards(points.bottomLeftFacing, 0.1)
        points.cutOnFoldTo = points.bottomLeftFacing.shiftFractionTowards(points.neckFacing, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.bottomLeftFacing.shiftFractionTowards(
          points.bottomLeftFacingCp2,
          0.15
        )
        points.grainlineFrom = new Point(points.grainlineTo.x, points.neckFacing.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      snippets.notch = new Snippet('bnotch', points.armholePitch)
      //title
      points.title = new Point(
        points.cbNeckCp1.x * 0.95,
        (points.neckFacing.y + points.bottomLeftFacing.y) / 2
      )
      macro('title', {
        at: points.title,
        nr: '13',
        title: 'Back Facing',
        scale: 0.5,
      })
      if (sa) {
        const bodiceFacingHem = sa * options.bodiceFacingHemWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        let cbSa
        if (options.closurePosition == 'back') {
          if (options.placketStyle == 'none') {
            cbSa = sa * options.closureSaWidth * 100
          } else {
            cbSa = sa
          }
        } else {
          cbSa = sa * options.cbSaWidth * 100
        }

        points.saSideFacing = utils.beamIntersectsY(
          points.saArmholeCorner,
          points.saArmholeCorner.shift(points.armhole.angle(points.sideWaist), 1),
          points.sideFacing.shift(-90, bodiceFacingHem).y
        )

        points.saNeckFacing = new Point(
          points.neckFacing.x - cbSa,
          drawNeck().offset(neckSa).end().y
        )
        points.saBottomLeftFacing = new Point(
          points.bottomLeftFacing.x - cbSa,
          points.bottomLeftFacing.y + bodiceFacingHem
        )

        paths.sa = paths.hemBase
          .offset(bodiceFacingHem)
          .line(points.saSideFacing)
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(drawNeck().offset(neckSa))
          .line(points.saNeckFacing)
          .line(points.saBottomLeftFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
