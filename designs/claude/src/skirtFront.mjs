import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'
import { waistband } from './waistband.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const skirtFront = {
  name: 'claude.skirtFront',
  from: skirtBase,
  after: [pocket, waistband],
  hide: {
    from: true,
  },
  plugins: [pluginLogoRG],
  options: {
    //Style
    skirtPanels: { count: 1, min: 1, max: 20, menu: 'style' },
    //Construction
    skirtHemWidth: { pct: 2, min: 0, max: 5, menu: 'construction' },
    skirtFacings: { bool: true, menu: 'construction' },
    skirtFacingWidth: {
      pct: 25,
      min: 10,
      max: 50,
      menu: 'construction',
    },
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    //Advanced
    separateBack: { bool: false, menu: 'advanced.style' },
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
    const skirtLength = store.get('skirtLength')
    const skirtFacingWidth = skirtLength * options.skirtFacingWidth

    //let's begin
    if (points.sideFrontExtension) {
      paths.sideSeam = new Path()
        .move(points.frontHemExtension)
        .line(points.sideFrontExtension)
        .curve_(points.sideFrontExtensionCp2, points.sideWaistFront)
        .hide()

      if (points.frontHemExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.frontHemExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideFrontHem).line(points.sideWaistFront).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistFront)
      .curve(points.sideWaistFrontCp2, points.waistFrontMidCp1, points.waistFrontMid)
      .curve(points.waistFrontMidCp2, points.cfWaistCp1, points.cfWaist)
      .hide()

    paths.cf = new Path().move(points.cfWaist).line(points.cfHem).hide()

    paths.hemBase = new Path()
      .move(points.cfHem)
      .curve(points.cfHemCp2, points.frontHemMidCp1, points.frontHemMid)
      .curve(points.frontHemMidCp2, points.sideFrontHemCp1, points.sideFrontHem)
      .line(paths.sideSeam.start())
      .hide()

    //paths
    paths.seam = paths.hemBase.join(paths.sideSeam).join(paths.waist).join(paths.cf).close()

    //stores
    store.set('skirtFacingWidth', skirtFacingWidth)

    if (complete) {
      //grainline
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfWaist
        points.cutOnFoldTo = points.cfHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfWaistCp1, 1 / 3)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      if (store.get('pocketLength') < skirtLength) {
        points.pocketOpeningTop = paths.sideSeam.reverse().shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = paths.sideSeam
          .reverse()
          .shiftAlong(store.get('pocketOpeningLength'))
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //panels & title
      let titleFront
      if (
        !options.separateBack &&
        !options.useBackMeasures &&
        !options.independentSkirtFullness &&
        !options.independentSkirtGathering
      ) {
        titleFront = ''
      } else {
        titleFront = ' (Front)'
      }

      if (options.skirtPanels > 1) {
        let j
        let k
        for (let i = 0; i < options.skirtPanels - 1; i++) {
          j = String.fromCharCode(i + 98)
          k = String.fromCharCode(i + 66)

          points['waistFrontPanel' + i] = paths.waist
            .reverse()
            .shiftFractionAlong((i + 1) / options.skirtPanels)
          points['frontHemPanel' + i] = new Path()
            .move(points.cfHem)
            .curve(points.cfHemCp2, points.frontHemMidCp1, points.frontHemMid)
            .curve(points.frontHemMidCp2, points.sideFrontHemCp1, points.sideFrontHem)
            .shiftFractionAlong((i + 1) / options.skirtPanels)

          points['grainlineFrom' + i] = points['waistFrontPanel' + i].shiftFractionTowards(
            points['frontHemPanel' + i],
            0.01
          )
          points['grainlineTo' + i] = points['frontHemPanel' + i].shiftFractionTowards(
            points['waistFrontPanel' + i],
            0.01
          )

          paths['grainline' + i] = new Path()
            .move(points['waistFrontPanel' + i].rotate(-90, points['grainlineFrom' + i]))
            .line(points['frontHemPanel' + i].rotate(90, points['grainlineTo' + i]))
            .attr('class', 'note')
            .attr('data-text', 'Grainline')
            .attr('data-text-class', 'fill-note center')
            .attr('marker-start', 'url(#grainlineFrom)')
            .attr('marker-end', 'url(#grainlineTo)')

          paths['panel' + i] = new Path()
            .move(points['waistFrontPanel' + i])
            .line(points['frontHemPanel' + i])
            .attr('class', 'fabric help')
            .attr('data-text', 'Cut and add seam allowance')
            .attr('data-text-class', 'center')

          points['title' + i] = points['waistFrontPanel' + i]
            .shiftTowards(points['frontHemPanel' + i], (skirtLength - skirtFacingWidth) / 2)
            .shift(
              points['frontHemPanel' + i].angle(points['grainlineTo' + i]) - 90,
              points['frontHemPanel' + i].dist(points['grainlineTo' + i]) * 2
            )

          macro('title', {
            at: points['title' + i],
            nr: '1' + j,
            title: 'Skirt ' + k + titleFront,
            prefix: 'title ' + i,
            scale: 0.15,
            rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
          })

          if (options.skirtFacings && options.skirtBandStyle == 'none') {
            points['titleFacing' + i] = points['frontHemPanel' + i]
              .shiftTowards(points['waistFrontPanel' + i], skirtFacingWidth / 2)
              .shift(
                points['frontHemPanel' + i].angle(points['grainlineTo' + i]) - 90,
                points['frontHemPanel' + i].dist(points['grainlineTo' + i]) * 2
              )

            macro('title', {
              at: points['titleFacing' + i],
              nr: '5' + j,
              title: 'Skirt Facing ' + k + titleFront,
              prefix: 'titleFacing ' + i,
              scale: 0.15,
              rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
            })
            points.titleFacing = points.cfHem
              .shiftTowards(points.cfWaist, skirtFacingWidth / 2)
              .shift(0, skirtLength * 0.02)
            macro('title', {
              at: points.titleFacing,
              nr: '5a',
              title: 'Skirt Facing A' + titleFront,
              prefix: 'titleFacing',
              scale: 0.15,
            })
          }
          points.title = points.cfWaist
            .shiftTowards(points.cfHem, (skirtLength - skirtFacingWidth) / 2)
            .shift(0, skirtLength * 0.02)
          macro('title', {
            at: points.title,
            nr: '1a',
            title: 'Skirt A' + titleFront,
            scale: 0.15,
            prefix: 'title',
          })
        }
      } else {
        //title
        points.title = points.frontHemMid
          .shiftTowards(points.waistFrontMid, skirtFacingWidth)
          .shiftFractionTowards(points.waistFrontMid, 0.5)
        macro('title', {
          at: points.title,
          nr: '1',
          title: 'Skirt' + titleFront,
          scale: 0.5,
          prefix: 'title',
          rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
        })

        if (options.skirtFacings && options.skirtBandStyle == 'none') {
          points.titleFacing = points.frontHemMid.shiftTowards(
            points.waistFrontMid,
            skirtFacingWidth / 2
          )
          macro('title', {
            at: points.titleFacing,
            nr: '5',
            title: 'Skirt Facing' + titleFront,
            scale: 0.5,
            prefix: 'titleFacing',
            rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
          })
        }
      }
      //logo
      points.logo = points.frontHemMid
        .shiftTowards(points.waistFrontMid, skirtFacingWidth)
        .shiftFractionTowards(points.waistFrontMid, 2 / 3)
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
        rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
      })
      //scalebox
      points.scalebox = points.frontHemMid
        .shiftTowards(points.waistFrontMid, skirtFacingWidth)
        .shiftFractionTowards(points.waistFrontMid, 1 / 3)
      macro('scalebox', {
        at: points.scalebox,
        scale: 0.25,
      })
      //facing
      if (options.skirtFacings && options.skirtBandStyle == 'none') {
        points.cfHemFacing = points.cfHem.shiftTowards(points.cfWaist, skirtFacingWidth)
        points.frontHemFacingMid = points.frontHemMid.shiftTowards(
          points.waistFrontMid,
          skirtFacingWidth
        )
        points.sideFrontHemFacing = points.sideFrontHem.shiftTowards(
          points.sideWaistFront,
          skirtFacingWidth
        )
        points.cfHemFacingCp1 = utils.beamsIntersect(
          points.cfHemCp2,
          points.cfWaistCp1,
          points.cfHemFacing,
          points.cfWaist.rotate(-90, points.cfHemFacing)
        )
        points.frontHemFacingMidCp2 = utils.beamsIntersect(
          points.frontHemMidCp1,
          points.waistFrontMidCp2,
          points.frontHemFacingMid,
          points.waistFrontMid.rotate(90, points.frontHemFacingMid)
        )
        points.frontHemFacingMidCp1 = points.frontHemFacingMidCp2.rotate(
          180,
          points.frontHemFacingMid
        )
        points.sideFrontHemFacingCp2 = utils.beamsIntersect(
          points.sideFrontHemCp1,
          points.sideWaistFrontCp2,
          points.sideFrontHemFacing,
          points.sideWaistFront.rotate(90, points.sideFrontHemFacing)
        )

        paths.facing = new Path()
          .move(points.cfHemFacing)
          .curve(points.cfHemFacingCp1, points.frontHemFacingMidCp2, points.frontHemFacingMid)
          .curve(
            points.frontHemFacingMidCp1,
            points.sideFrontHemFacingCp2,
            points.sideFrontHemFacing
          )
          .attr('class', 'interfacing')
          .attr('data-text', 'Facing Line')
          .attr('data-text-class', 'center')

        paths.cfHemFacing = new Path().move(points.cfHemFacing).line(points.cfHem).hide()

        if (points.sideFrontExtension) {
          let facingFrontExtension = utils.lineIntersectsCurve(
            points.sideFrontHemFacing,
            points.sideFrontHemFacingCp2.shiftOutwards(
              points.sideFrontHemFacing,
              points.sideFrontHem.dist(points.frontHemExtension) * 29
            ),
            points.sideFrontExtension,
            points.sideFrontExtensionCp2,
            points.sideWaistFront,
            points.sideWaistFront
          )

          if (facingFrontExtension) {
            points.facingFrontExtension = facingFrontExtension
          } else {
            points.facingFrontExtension = utils.beamsIntersect(
              points.sideFrontHemFacingCp2,
              points.sideFrontHemFacing,
              points.frontHemExtension,
              points.sideFrontExtension
            )
          }
          paths.facing = paths.facing.line(points.facingFrontExtension)
        }
      }
      //sort seam allowance
      if (
        !options.separateBack &&
        !options.useBackMeasures &&
        !options.independentSkirtFullness &&
        !options.independentSkirtGathering &&
        (options.closurePosition == 'front' ||
          options.closurePosition == 'back' ||
          options.cbSaWidth > 0)
      ) {
        paths.cf
          .attr('class', 'fabric hidden')
          .attr('data-text', 'Need to Back Seam Allowance')
          .attr('data-text-class', 'center')
          .unhide()
      }
      if (sa) {
        void store.setIfUnset('waistSa', sa)
        let waistSa = sa
        if (options.waistbandStyle == 'none') waistSa = store.get('waistSa')
        const closureSa = sa * options.closureSaWidth * 100

        let hemSa
        if (
          (options.skirtFacings && options.skirtBandStyle == 'none') ||
          options.skirtBandStyle != 'none'
        )
          hemSa = sa
        else {
          hemSa = sa * options.skirtHemWidth * 100
        }

        let cfSa
        if (options.closurePosition == 'front' && !options.waistbandElastic) {
          cfSa = closureSa
        } else {
          cfSa = sa * options.cfSaWidth * 100
        }

        let sideSeamSa
        if (
          (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') &&
          !options.waistbandElastic
        ) {
          sideSeamSa = closureSa
        } else {
          sideSeamSa = sa * options.sideSeamSaWidth * 100
        }

        points.saSideFrontHem = utils.beamsIntersect(
          points.sideFrontHemCp1
            .shiftTowards(points.sideFrontHem, hemSa)
            .rotate(-90, points.sideFrontHemCp1),
          points.sideFrontHem
            .shiftTowards(points.sideFrontHemCp1, hemSa)
            .rotate(90, points.sideFrontHem),
          paths.sideSeam.offset(sideSeamSa).start(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.001)
        )
        points.saSideWaistFront = utils.beamsIntersect(
          paths.sideSeam.offset(sideSeamSa).end(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.998),
          points.sideWaistFront
            .shiftTowards(points.sideWaistFrontCp2, waistSa)
            .rotate(-90, points.sideWaistFront),
          points.sideWaistFrontCp2
            .shiftTowards(points.sideWaistFront, waistSa)
            .rotate(90, points.sideWaistFrontCp2)
        )

        points.saCfWaist = points.cfWaist.translate(-cfSa, -waistSa)
        points.saCfHem = points.cfHem.translate(-cfSa, hemSa)

        if (options.skirtFacings && options.skirtBandStyle == 'none') {
          points.saSideFrontHemFacing = utils.beamsIntersect(
            paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa).end(),
            paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa).shiftFractionAlong(0.99),
            points.sideFrontHemFacing
              .shiftTowards(points.sideFrontHemFacingCp2, sa)
              .rotate(-90, points.sideFrontHemFacing),
            points.sideFrontHemFacingCp2
              .shiftTowards(points.sideFrontHemFacing, sa)
              .rotate(90, points.sideFrontHemFacingCp2)
          )

          points.saCfFacing = points.cfHemFacing.translate(-cfSa, -sa)

          paths.facingSa = paths.hemBase
            .offset(hemSa)
            .line(points.saSideFrontHem)
            .join(paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa))
            .line(points.saSideFrontHemFacing)
            .join(paths.facing.reverse().offset(sa))
            .line(points.saCfFacing)
            .line(points.saCfHem)
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saSideFrontHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistFront)
          .join(paths.waist.offset(waistSa))
          .line(points.saCfWaist)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
