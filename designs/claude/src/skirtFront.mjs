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
      //back titles
      let titleBack
      let titleBackNum
      let titleBackFacingNum
      if (
        !options.useBackMeasures &&
        !options.independentSkirtFullness &&
        !options.independentSkirtGathering
      ) {
        if (options.skirtPanels > 1) {
          titleBack = ' & Back A'
          titleBackNum = ' & 2a'
          titleBackFacingNum = ' & 7a'
        } else {
          titleBack = ' & Back'
          titleBackNum = ' & 2'
          titleBackFacingNum = ' & 7'
        }
      } else {
        titleBack = ''
        titleBackNum = ''
        titleBackFacingNum = ''
      }
      //panels
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
            .curve(points.frontHemCp1, points.frontHemCp2, points.frontHemMid)
            .curve(points.frontHemCp3, points.frontHemCp4, points.sideFrontHem)
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

          let titleBackI
          let titleBackNumI
          let titleBackFacingNumI
          if (
            !options.useBackMeasures &&
            !options.independentSkirtFullness &&
            !options.independentSkirtGathering
          ) {
            titleBackI = ' & Back ' + k
            titleBackNumI = ' & 2' + j
            titleBackFacingNumI = ' & 7' + j
          } else {
            titleBackI = ''
            titleBackNumI = ''
            titleBackFacingNumI = ''
          }

          macro('title', {
            at: points['title' + i],
            nr: '1' + j + titleBackNumI,
            title: 'Skirt Front ' + k + titleBackI,
            prefix: 'title' + i,
            scale: 0.15,
            rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
          })

          if (options.skirtFacings) {
            points['titleFacing' + i] = points['frontHemPanel' + i]
              .shiftTowards(points['waistFrontPanel' + i], skirtFacingWidth / 2)
              .shift(
                points['frontHemPanel' + i].angle(points['grainlineTo' + i]) - 90,
                points['frontHemPanel' + i].dist(points['grainlineTo' + i]) * 2
              )

            macro('title', {
              at: points['titleFacing' + i],
              nr: '6' + j + titleBackFacingNumI,
              title: 'Skirt Facing (Front ' + k + titleBackI + ')',
              prefix: 'titleFacing' + i,
              scale: 0.15,
              rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
            })
            points.titleFacing = points.cfHem
              .shiftTowards(points.cfWaist, skirtFacingWidth / 2)
              .shift(0, skirtLength * 0.02)
            macro('title', {
              at: points.titleFacing,
              nr: '6a' + titleBackFacingNum,
              title: 'Skirt Facing (Front A' + titleBack + ')',
              prefix: 'titleFacing',
              scale: 0.15,
            })
          }
        }
        //title
        points.title = points.cfWaist
          .shiftTowards(points.cfHem, (skirtLength - skirtFacingWidth) / 2)
          .shift(0, skirtLength * 0.02)
        macro('title', {
          at: points.title,
          nr: '1a' + titleBackNum,
          title: 'Skirt Front' + titleBack,
          scale: 0.15,
          prefix: 'title',
        })
      } else {
        //title
        points.title = points.cfWaist
          .shiftTowards(points.cfHem, (skirtLength - skirtFacingWidth) / 2)
          .shift(0, skirtLength * 0.13)
        macro('title', {
          at: points.title,
          nr: '1' + titleBackNum,
          title: 'Skirt Front' + titleBack,
          scale: 0.5,
          prefix: 'title',
        })

        if (options.skirtFacings) {
          points.titleFacing = new Point(points.title.x, points.cfHem.y - skirtFacingWidth / 2)
          macro('title', {
            at: points.titleFacing,
            nr: '6' + titleBackFacingNum,
            title: 'Skirt Facing (Front' + titleBack + ')',
            scale: 0.5,
            prefix: 'titleFacing',
          })
        }
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
        points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfHem, 0.01)
        points.grainlineTo = points.cfHem.shiftFractionTowards(points.cfWaist, 0.01)
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
      //logo
      points.logo = points.cfWaist
        .shiftTowards(points.cfHem, (skirtLength - skirtFacingWidth) / 4)
        .shift(0, skirtLength * 0.15)
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = points.cfWaist
        .shiftTowards(points.cfHem, (skirtLength - skirtFacingWidth) * (3 / 4))
        .shift(0, skirtLength * 0.15)
      macro('scalebox', {
        at: points.scalebox,
        scale: 0.25,
      })
      //add seam allowance
      if (
        !options.useBackMeasures &&
        !options.independentSkirtFullness &&
        !options.independentSkirtGathering &&
        !options.waistbandElastic &&
        (options.waistbandClosurePosition == 'front' || options.waistbandClosurePosition == 'back')
      ) {
        let addSa
        if (options.waistbandClosurePosition == 'front') {
          addSa = 'FRONT'
        } else {
          addSa = 'BACK'
        }
        paths.cf
          .attr('class', 'fabric hidden')
          .attr('data-text', 'ADD SEAM ALLOWANCE FOR ' + addSa)
          .attr('data-text-class', 'center')
          .unhide()
      }

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
