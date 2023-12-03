import { skirtBase } from './skirtBase.mjs'
import { skirtFront } from './skirtFront.mjs'
import { pocket } from './pocket.mjs'
import { waistband } from './waistband.mjs'

export const skirtBack = {
  name: 'claude.skirtBack',
  from: skirtBase,
  after: [skirtFront, pocket, waistband],
  hide: {
    from: true,
  },
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
    //set Render
    if (
      !options.separateBack &&
      !options.useBackMeasures &&
      !options.independentSkirtFullness &&
      !options.independentSkirtGathering
    ) {
      part.hide()
      return part
    }

    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    const skirtLength = store.get('skirtLength')
    const skirtFacingWidth = skirtLength * options.skirtFacingWidth

    //let's begin
    if (points.sideBackExtension) {
      paths.sideSeam = new Path()
        .move(points.backHemExtension)
        .line(points.sideBackExtension)
        .curve_(points.sideBackExtensionCp2, points.sideWaistBack)
        .hide()

      if (points.backHemExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.backHemExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideBackHem).line(points.sideWaistBack).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistBack)
      .curve(points.sideWaistBackCp2, points.waistBackMidCp1, points.waistBackMid)
      .curve(points.waistBackMidCp2, points.cbWaistCp1, points.cbWaist)
      .hide()

    paths.cb = new Path().move(points.cbWaist).line(points.cbHem).hide()

    paths.hemBase = new Path()
      .move(points.cbHem)
      .curve(points.cbHemCp2, points.backHemMidCp1, points.backHemMid)
      .curve(points.backHemMidCp2, points.sideBackHemCp1, points.sideBackHem)
      .line(paths.sideSeam.start())
      .hide()

    //paths
    paths.seam = paths.hemBase.join(paths.sideSeam).join(paths.waist).join(paths.cb).close()

    //stores
    store.set('skirtFacingWidth', skirtFacingWidth)
    if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbWaist
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cbWaist.shiftFractionTowards(points.cbWaistCp1, 1 / 3)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
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
      //panels && titles
      if (options.skirtPanels > 1) {
        let j
        let k
        for (let i = 0; i < options.skirtPanels - 1; i++) {
          j = String.fromCharCode(i + 98)
          k = String.fromCharCode(i + 66)

          points['waistBackPanel' + i] = paths.waist
            .reverse()
            .shiftFractionAlong((i + 1) / options.skirtPanels)
          points['backHemPanel' + i] = new Path()
            .move(points.cbHem)
            .curve(points.cbHemCp2, points.backHemMidCp1, points.backHemMid)
            .curve(points.backHemMidCp2, points.sideBackHemCp1, points.sideBackHem)
            .shiftFractionAlong((i + 1) / options.skirtPanels)

          points['grainlineFrom' + i] = points['waistBackPanel' + i].shiftFractionTowards(
            points['backHemPanel' + i],
            0.01
          )
          points['grainlineTo' + i] = points['backHemPanel' + i].shiftFractionTowards(
            points['waistBackPanel' + i],
            0.01
          )

          paths['grainline' + i] = new Path()
            .move(points['waistBackPanel' + i].rotate(-90, points['grainlineFrom' + i]))
            .line(points['backHemPanel' + i].rotate(90, points['grainlineTo' + i]))
            .attr('class', 'note')
            .attr('data-text', 'Grainline')
            .attr('data-text-class', 'fill-note center')
            .attr('marker-start', 'url(#grainlineFrom)')
            .attr('marker-end', 'url(#grainlineTo)')

          paths['panel' + i] = new Path()
            .move(points['waistBackPanel' + i])
            .line(points['backHemPanel' + i])
            .attr('class', 'fabric help')
            .attr('data-text', 'Cut and add seam allowance')
            .attr('data-text-class', 'center')

          points['title' + i] = points['waistBackPanel' + i]
            .shiftTowards(points['backHemPanel' + i], (skirtLength - skirtFacingWidth) / 2)
            .shift(
              points['backHemPanel' + i].angle(points['grainlineTo' + i]) - 90,
              points['backHemPanel' + i].dist(points['grainlineTo' + i]) * 2
            )

          macro('title', {
            at: points['title' + i],
            nr: '6' + j,
            title: 'Skirt Back ' + k + ' (Back)',
            prefix: 'title ' + i,
            scale: 0.15,
            rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
          })

          if (options.skirtFacings) {
            points['titleFacing' + i] = points['backHemPanel' + i]
              .shiftTowards(points['waistBackPanel' + i], skirtFacingWidth / 2)
              .shift(
                points['backHemPanel' + i].angle(points['grainlineTo' + i]) - 90,
                points['backHemPanel' + i].dist(points['grainlineTo' + i]) * 2
              )

            macro('title', {
              at: points['titleFacing' + i],
              nr: '6' + j,
              title: 'Skirt Facing ' + k + ' (Back)',
              prefix: 'titleFacing ' + i,
              scale: 0.15,
              rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
            })

            points.titleFacing = points.cbHem
              .shiftTowards(points.cbWaist, skirtFacingWidth / 2)
              .shift(0, skirtLength * 0.02)
            macro('title', {
              at: points.titleFacing,
              nr: '7a',
              title: 'Skirt Facing A (Back)',
              prefix: 'titleFacing',
              scale: 0.15,
            })
          }
        }
        //title
        points.title = points.cbWaist
          .shiftTowards(points.cbHem, (skirtLength - skirtFacingWidth) / 2)
          .shift(0, skirtLength * 0.02)
        macro('title', {
          at: points.title,
          nr: '6a',
          title: 'Skirt A (Back)',
          scale: 0.15,
          prefix: 'title',
        })
      } else {
        //title
        points.title = points.backHemMid
          .shiftTowards(points.waistBackMid, skirtFacingWidth)
          .shiftFractionTowards(points.waistBackMid, 0.5)
        macro('title', {
          at: points.title,
          nr: '6',
          title: 'Skirt (Back)',
          scale: 0.5,
          prefix: 'title',
          rotation: 90 - points.backHemMid.angle(points.waistBackMid),
        })

        if (options.skirtFacings) {
          points.titleFacing = points.backHemMid.shiftTowards(
            points.waistBackMid,
            skirtFacingWidth / 2
          )
          macro('title', {
            at: points.titleFacing,
            nr: '7',
            title: 'Skirt Facing (Back)',
            scale: 0.5,
            prefix: 'titleFacing',
            rotation: 90 - points.backHemMid.angle(points.waistBackMid),
          })
        }
      }
      //facing
      if (options.skirtFacings) {
        points.cbHemFacing = points.cbHem.shiftTowards(points.cbWaist, skirtFacingWidth)
        points.backHemFacingMid = points.backHemMid.shiftTowards(
          points.waistBackMid,
          skirtFacingWidth
        )
        points.sideBackHemFacing = points.sideBackHem.shiftTowards(
          points.sideWaistBack,
          skirtFacingWidth
        )
        points.cbHemFacingCp1 = utils.beamsIntersect(
          points.cbHemCp2,
          points.cbWaistCp1,
          points.cbHemFacing,
          points.cbWaist.rotate(-90, points.cbHemFacing)
        )
        points.backHemFacingMidCp2 = utils.beamsIntersect(
          points.backHemMidCp1,
          points.waistBackMidCp2,
          points.backHemFacingMid,
          points.waistBackMid.rotate(90, points.backHemFacingMid)
        )
        points.backHemFacingMidCp1 = points.backHemFacingMidCp2.rotate(180, points.backHemFacingMid)
        points.sideBackHemFacingCp2 = utils.beamsIntersect(
          points.sideBackHemCp1,
          points.sideWaistBackCp2,
          points.sideBackHemFacing,
          points.sideWaistBack.rotate(90, points.sideBackHemFacing)
        )

        paths.facing = new Path()
          .move(points.cbHemFacing)
          .curve(points.cbHemFacingCp1, points.backHemFacingMidCp2, points.backHemFacingMid)
          .curve(points.backHemFacingMidCp1, points.sideBackHemFacingCp2, points.sideBackHemFacing)
          .attr('class', 'interfacing')
          .attr('data-text', 'Facing Line')
          .attr('data-text-class', 'center')

        paths.cbHemFacing = new Path().move(points.cbHemFacing).line(points.cbHem).hide()

        if (points.sideBackExtension) {
          let facingBackExtension = utils.lineIntersectsCurve(
            points.sideBackHemFacing,
            points.sideBackHemFacingCp2.shiftOutwards(
              points.sideBackHemFacing,
              points.sideBackHem.dist(points.backHemExtension)
            ),
            points.sideBackExtension,
            points.sideBackExtensionCp2,
            points.sideWaistBack,
            points.sideWaistBack
          )

          if (facingBackExtension) {
            points.facingBackExtension = facingBackExtension
          } else {
            points.facingBackExtension = utils.beamsIntersect(
              points.sideBackHemFacingCp2,
              points.sideBackHemFacing,
              points.backHemExtension,
              points.sideBackExtension
            )
          }
          paths.facing = paths.facing.line(points.facingBackExtension)
        }
      }
      if (sa) {
        const closureSa = sa * options.closureSaWidth * 100

        let hemSa
        if (options.skirtFacings) hemSa = sa
        else {
          hemSa = sa * options.skirtHemWidth * 100
        }

        let cbSa
        if (options.closurePosition == 'back' && !options.waistbandElastic) {
          cbSa = closureSa
        } else {
          cbSa = sa * options.cfSaWidth * 100
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
        points.saSideBackHem = utils.beamsIntersect(
          points.sideBackHemCp1
            .shiftTowards(points.sideBackHem, hemSa)
            .rotate(-90, points.sideBackHemCp1),
          points.sideBackHem
            .shiftTowards(points.sideBackHemCp1, hemSa)
            .rotate(90, points.sideBackHem),
          paths.sideSeam.offset(sideSeamSa).start(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.001)
        )

        points.saSideWaistBack = utils.beamsIntersect(
          paths.sideSeam.offset(sideSeamSa).end(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.998),
          points.sideWaistBack
            .shiftTowards(points.sideWaistBackCp2, sa)
            .rotate(-90, points.sideWaistBack),
          points.sideWaistBackCp2
            .shiftTowards(points.sideWaistBack, sa)
            .rotate(90, points.sideWaistBackCp2)
        )

        points.saCbWaist = points.cbWaist.translate(-cbSa, -sa)
        points.saCbHem = points.cbHem.translate(-cbSa, hemSa)

        if (options.skirtFacings) {
          points.saSideBackHemFacing = utils.beamsIntersect(
            paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa).end(),
            paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa).shiftFractionAlong(0.99),
            points.sideBackHemFacing
              .shiftTowards(points.sideBackHemFacingCp2, sa)
              .rotate(-90, points.sideBackHemFacing),
            points.sideBackHemFacingCp2
              .shiftTowards(points.sideBackHemFacing, sa)
              .rotate(90, points.sideBackHemFacingCp2)
          )

          points.saCbFacing = points.cbHemFacing.translate(-cbSa, -sa)

          paths.facingSa = paths.hemBase
            .offset(hemSa)
            .line(points.saSideBackHem)
            .join(paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa))
            .line(points.saSideBackHemFacing)
            .join(paths.facing.reverse().offset(sa))
            .line(points.saCbFacing)
            .line(points.saCbHem)
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saSideBackHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistBack)
          .join(paths.waist.offset(sa))
          .line(points.saCbWaist)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
