import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'

export const skirtFront = {
  name: 'claude.skirtFront',
  from: skirtBase,
  after: [pocket, waistbandStraight],
  hide: {
    from: true,
  },
  options: {
    //Construction
    skirtHemWidth: { pct: 2, min: 0, max: 5, menu: 'construction' },
    skirtFacings: { bool: true, menu: 'construction' },
    skirtFacingWidth: {
      pct: 25,
      min: 10,
      max: 50,
      menu: 'construction',
    },
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
    log,
    absoluteOptions,
  }) => {
    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    const skirtFacingWidth = store.get('skirtLength') * options.skirtFacingWidth

    //let's begin
    if (points.sideFrontExtension) {
      paths.sideSeam = new Path()
        .move(points.frontHemExtension)
        .line(points.sideFrontExtension)
        .curve_(points.sideSeamFrontCp, points.sideWaistFront)
        .hide()

      if (points.frontHemExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.frontHemExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideFrontHem).line(points.sideWaistFront).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistFront)
      .curve(points.waistFrontCp1, points.waistFrontCp2, points.waistFrontMid)
      .curve(points.waistFrontCp3, points.waistFrontCp4, points.cfWaist)
      .hide()

    paths.cf = new Path().move(points.cfWaist).line(points.cfHem).hide()

    paths.hemBase = new Path()
      .move(points.cfHem)
      .curve(points.frontHemCp1, points.frontHemCp2, points.frontHemMid)
      .curve(points.frontHemCp3, points.frontHemCp4, points.sideFrontHem)
      .line(paths.sideSeam.start())
      .hide()

    //paths
    paths.seam = paths.hemBase.join(paths.sideSeam).join(paths.waist).join(paths.cf).close()

    //stores
    store.set('skirtFacingWidth', skirtFacingWidth)
    if (complete) {
      //facing
      if (options.skirtFacings) {
        points.cfFacing = points.cfHem.shiftTowards(points.cfWaist, skirtFacingWidth)
        points.frontFacingMid = points.frontHemMid.shiftTowards(
          points.waistFrontMid,
          skirtFacingWidth
        )
        points.sideFrontFacing = points.sideFrontHem.shiftTowards(
          points.sideWaistFront,
          skirtFacingWidth
        )
        points.frontFacingCp4 = utils.beamsIntersect(
          points.frontHemCp1,
          points.waistFrontCp4,
          points.cfFacing,
          points.cfWaist.rotate(-90, points.cfFacing)
        )
        points.frontFacingCp3 = utils.beamsIntersect(
          points.frontHemCp2,
          points.waistFrontCp3,
          points.frontFacingMid,
          points.waistFrontMid.rotate(90, points.frontFacingMid)
        )
        points.frontFacingCp2 = points.frontFacingCp3.rotate(180, points.frontFacingMid)
        points.frontFacingCp1 = utils.beamsIntersect(
          points.frontHemCp4,
          points.waistFrontCp1,
          points.sideFrontFacing,
          points.sideWaistFront.rotate(90, points.sideFrontFacing)
        )

        paths.facing = new Path()
          .move(points.cfFacing)
          .curve(points.frontFacingCp4, points.frontFacingCp3, points.frontFacingMid)
          .curve(points.frontFacingCp2, points.frontFacingCp1, points.sideFrontFacing)
          .attr('class', 'interfacing')
          .attr('data-text', 'Facing Line')
          .attr('data-text-class', 'center')

        paths.cfFacing = new Path().move(points.cfFacing).line(points.cfHem).hide()

        if (points.sideFrontExtension) {
          let facingFrontExtension = utils.lineIntersectsCurve(
            points.sideFrontFacing,
            points.frontFacingCp1.shiftOutwards(
              points.sideFrontFacing,
              points.sideFrontHem.dist(points.frontHemExtension)
            ),
            points.sideFrontExtension,
            points.sideSeamFrontCp,
            points.sideWaistFront,
            points.sideWaistFront
          )

          if (facingFrontExtension) {
            points.facingFrontExtension = facingFrontExtension
          } else {
            points.facingFrontExtension = utils.beamsIntersect(
              points.frontFacingCp1,
              points.sideFrontFacing,
              points.frontHemExtension,
              points.sideFrontExtension
            )
          }
          paths.facing = paths.facing.line(points.facingFrontExtension)
        }
        paths.sideFrontFacing = paths.sideSeam
          .split(paths.hemBase.end())[1]
          .split(paths.facing.end())[0]
          .hide()
      }
      //grainline
      let cfSa
      if (
        options.waistbandClosurePosition == 'front' &&
        !options.waistbandElastic &&
        (options.useBackMeasures ||
          options.independentSkirtFullness ||
          options.independentSkirtGathering)
      ) {
        cfSa = sa
        points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfHem, 0.05)
        points.grainlineTo = points.cfHem.shiftFractionTowards(points.cfWaist, 0.05)
        macro('grainline', {
          from: points.cfWaist.rotate(-90, points.grainlineFrom),
          to: points.cfHem.rotate(90, points.grainlineTo),
        })
      } else {
        cfSa = 0
        points.cutOnFoldFrom = points.cfWaist
        points.cutOnFoldTo = points.cfHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //notches
      if (store.get('pocketOpeningLength') < paths.sideSeam.length()) {
        points.pocketOpeningTop = paths.sideSeam.reverse().shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = paths.sideSeam
          .reverse()
          .shiftAlong(store.get('pocketOpeningLength'))
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title

      if (sa) {
        let hemSa
        if (options.skirtFacings) {
          hemSa = sa
        } else {
          hemSa = sa * options.skirtHemWidth * 100
        }

        if (options.skirtFacings) {
          paths.facingSa = paths.hemBase
            .offset(hemSa)
            .join(paths.sideFrontFacing.offset(sa))
            .join(paths.facing.reverse().offset(sa))
            .join(paths.cfFacing.offset(cfSa))
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .offset(hemSa)
          .join(paths.sideSeam.join(paths.waist).offset(sa))
          .join(paths.cf.offset(cfSa))
          .close()
          .attr('class', 'fabric sa')

        store.set('hemSa', hemSa)
      }
    }

    return part
  },
}
