import { skirtBase } from './skirtBase.mjs'
import { pocket } from '@freesewing/claude'
import { waistband } from '@freesewing/claude'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const skirtFront = {
  name: 'harriet.skirtFront',
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
    Snippet,
    absoluteOptions,
    log,
  }) => {
    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    const skirtLength = store.get('skirtLength')
    const skirtHighLength = store.get('skirtHighLength')
    const skirtFacingWidth = store.get('skirtFacingWidth')
    const frontOrigin = store.get('frontOrigin')

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

    const includeBack =
      !options.separateBack &&
      !options.useBackMeasures &&
      !options.independentSkirtFullness &&
      !options.independentSkirtGathering

    if (includeBack) {
      paths.cb = new Path().move(points.cfHem).line(points.cbHem).hide()

      paths.hemBaseBack = new Path()
        .move(points.cbHem)
        .curve(points.cbHemCp2, points.backHemMidCp1, points.backHemMid)
        .curve(points.backHemMidCp2, points.sideBackHemCp1, points.sideBackHem)
        .line(paths.sideSeam.start())
        .hide()

      paths.seamBack = paths.hemBaseBack
        .join(paths.sideSeam)
        .join(paths.waist)
        .join(paths.cf)
        .join(paths.cb)
        .close()
    }

    //paths
    paths.seam = paths.hemBase.join(paths.sideSeam).join(paths.waist).join(paths.cf).close()

    //stores
    store.set('includeBack', includeBack)

    if (complete) {
      //grainline
      if (
        (options.closurePosition != 'front' || options.waistbandElastic) &&
        options.cfSaWidth == 0
      ) {
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

      if (includeBack) {
        if (
          (options.closurePosition != 'back' || options.waistbandElastic) &&
          options.cbSaWidth == 0
        ) {
          points.cutOnFoldBackFrom = points.cfHem
          points.cutOnFoldBackTo = points.cbHem
          if (
            (options.closurePosition != 'front' || options.waistbandElastic) &&
            options.cfSaWidth == 0
          ) {
            macro('cutonfold', {
              from: points.cutOnFoldFrom,
              to: points.cutOnFoldBackTo,
              grainline: true,
              id: 'back',
            })
          } else {
            macro('cutonfold', {
              from: points.cutOnFoldBackFrom,
              to: points.cutOnFoldBackTo,
              grainline: true,
              id: 'back',
            })
          }
        } else {
          points.grainlineBackFrom = points.cfHem.shiftFractionTowards(points.cfHemCp2, 0.1)
          points.grainlineBackTo = new Point(points.grainlineBackFrom.x, points.cbHem.y)
          paths.grainlineBack = new Path()
            .move(points.grainlineBackFrom.shiftFractionTowards(points.grainlineBackTo, 0.1))
            .line(points.grainlineBackTo.shiftFractionTowards(points.grainlineBackFrom, 0.1))
            .attr('class', 'note')
            .attr('data-text', 'Grainline')
            .attr('data-text-class', 'fill-note center')
            .attr('marker-start', 'url(#grainlineFrom)')
            .attr('marker-end', 'url(#grainlineTo)')
        }
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
      let titleFront
      if (includeBack) {
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

          points['frontPanelTarget' + i] = frontOrigin.shiftTowards(
            points['waistFrontPanel' + i],
            skirtLength * 100
          )

          const frontPanelIntersect0 = utils.lineIntersectsCurve(
            frontOrigin,
            points['frontPanelTarget' + i],
            points.cfHem,
            points.cfHemCp2,
            points.frontHemMidCp1,
            points.frontHemMid
          )

          const frontPanelIntersect1 = utils.lineIntersectsCurve(
            frontOrigin,
            points['frontPanelTarget' + i],
            points.frontHemMid,
            points.frontHemMidCp2,
            points.sideFrontHemCp1,
            points.sideFrontHem
          )

          if (frontPanelIntersect0) {
            points['frontHemPanel' + i] = frontPanelIntersect0
          }
          if (frontPanelIntersect1) {
            points['frontHemPanel' + i] = frontPanelIntersect1
          }
          if (!frontPanelIntersect0 && !frontPanelIntersect1) {
            points['frontHemPanel' + i] = points.frontHemMid
          }

          if (options.skirtFacings) {
            const frontPanelFacingIntersect0 = utils.lineIntersectsCurve(
              frontOrigin,
              points['frontPanelTarget' + i],
              points.frontHemFacingMid,
              points.frontHemFacingMidCp2,
              points.cfFacingCp1,
              points.cfHemFacing
            )

            const frontPanelFacingIntersect1 = utils.lineIntersectsCurve(
              frontOrigin,
              points['frontPanelTarget' + i],
              points.sideFrontHemFacing,
              points.sideFrontHemFacingCp2,
              points.frontHemFacingMidCp1,
              points.frontHemFacingMid
            )

            if (frontPanelFacingIntersect0) {
              points['frontHemFacingPanel' + i] = frontPanelFacingIntersect0
            }
            if (frontPanelFacingIntersect1) {
              points['frontHemFacingPanel' + i] = frontPanelFacingIntersect1
            }
            if (!frontPanelFacingIntersect0 && !frontPanelFacingIntersect1) {
              points['frontHemFacingPanel' + i] = points.frontHemFacingMid
            }

            points['titleFacing' + i] = points['frontHemPanel' + i]
              .shiftFractionTowards(points['frontHemFacingPanel' + i], 1 / 3)
              .shift(
                points['frontHemPanel' + i].angle(points['frontHemFacingPanel' + i]) - 90,
                points['frontHemPanel' + i].dist(points['frontHemFacingPanel' + i]) * 0.15
              )
            macro('title', {
              at: points['titleFacing' + i],
              nr: '5' + j,
              title: 'Skirt Facing ' + k + ' (Front)',
              prefix: 'titleFacing' + i,
              scale: 0.15,
              rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
            })

            points.titleFacing = points.cfHem
              .shiftFractionTowards(points.cfHemFacing, 1 / 3)
              .shift(points.cfHem.angle(points.cfHemFacing) - 90, skirtFacingWidth * 0.15)
            macro('title', {
              at: points.titleFacing,
              nr: '5a',
              title: 'Skirt Facing A (Front)',
              prefix: 'titleFacing',
              scale: 0.15,
            })
          }

          if (includeBack) {
            const backPanelIntersect0 = utils.lineIntersectsCurve(
              frontOrigin,
              points['frontPanelTarget' + i],
              points.cbHem,
              points.cbHemCp2,
              points.backHemMidCp1,
              points.backHemMid
            )

            const backPanelIntersect1 = utils.lineIntersectsCurve(
              frontOrigin,
              points['frontPanelTarget' + i],
              points.backHemMid,
              points.backHemMidCp2,
              points.sideBackHemCp1,
              points.sideBackHem
            )

            if (backPanelIntersect0) {
              points['backHemPanel' + i] = backPanelIntersect0
            }
            if (backPanelIntersect1) {
              points['backHemPanel' + i] = backPanelIntersect1
            }
            if (!backPanelIntersect0 && !backPanelIntersect1) {
              points['backHemPanel' + i] = points.backHemMid
            }

            if (options.skirtFacings) {
              const backPanelFacingIntersect0 = utils.lineIntersectsCurve(
                frontOrigin,
                points['frontPanelTarget' + i],
                points.backHemFacingMid,
                points.backHemFacingMidCp2,
                points.cbFacingCp1,
                points.cbHemFacing
              )

              const backPanelFacingIntersect1 = utils.lineIntersectsCurve(
                frontOrigin,
                points['frontPanelTarget' + i],
                points.sideBackHemFacing,
                points.sideBackHemFacingCp2,
                points.backHemFacingMidCp1,
                points.backHemFacingMid
              )

              if (backPanelFacingIntersect0) {
                points['backHemFacingPanel' + i] = backPanelFacingIntersect0
              }
              if (backPanelFacingIntersect1) {
                points['backHemFacingPanel' + i] = backPanelFacingIntersect1
              }
              if (!backPanelFacingIntersect0 && !backPanelFacingIntersect1) {
                points['backHemFacingPanel' + i] = points.backHemFacingMid
              }

              points['titleBackFacing' + i] = points['backHemPanel' + i]
                .shiftFractionTowards(points['backHemFacingPanel' + i], 0.25)
                .shift(
                  points['backHemPanel' + i].angle(points['backHemFacingPanel' + i]) - 90,
                  points['backHemPanel' + i].dist(points['backHemFacingPanel' + i]) * 0.15
                )
              macro('title', {
                at: points['titleBackFacing' + i],
                nr: '7' + j,
                title: 'Skirt Facing ' + k + ' (Back)',
                prefix: 'titleBackFacing' + i,
                scale: 0.15,
                rotation: 90 - points['backHemPanel' + i].angle(points['waistFrontPanel' + i]),
              })

              points.titleBackFacing = points.cbHem
                .shiftFractionTowards(points.cbHemFacing, 0.25)
                .shift(points.cbHem.angle(points.cbHemFacing) - 90, skirtFacingWidth * 0.15)
              macro('title', {
                at: points.titleBackFacing,
                nr: '7a',
                title: 'Skirt Facing A (Back)',
                prefix: 'titleBackFacing',
                scale: 0.15,
              })
            }
            points['panelTo' + i] = points['backHemPanel' + i]
          } else {
            points['panelTo' + i] = points['frontHemPanel' + i]
          }

          points['grainlineFrom' + i] = points['waistFrontPanel' + i].shiftFractionTowards(
            points['panelTo' + i],
            0.01
          )
          points['grainlineTo' + i] = points['panelTo' + i].shiftFractionTowards(
            points['waistFrontPanel' + i],
            0.01
          )

          paths['grainline' + i] = new Path()
            .move(points['waistFrontPanel' + i].rotate(-90, points['grainlineFrom' + i]))
            .line(points['panelTo' + i].rotate(90, points['grainlineTo' + i]))
            .attr('class', 'note')
            .attr('data-text', 'Grainline')
            .attr('data-text-class', 'fill-note center')
            .attr('marker-start', 'url(#grainlineFrom)')
            .attr('marker-end', 'url(#grainlineTo)')

          paths['panel' + i] = new Path()
            .move(points['waistFrontPanel' + i])
            .line(points['panelTo' + i])
            .attr('class', 'fabric help')
            .attr('data-text', 'Cut and add seam allowance')
            .attr('data-text-class', 'center')

          points['title' + i] = points['waistFrontPanel' + i]
            .shiftTowards(points['frontHemPanel' + i], (skirtHighLength - skirtFacingWidth) / 2)
            .shift(
              points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]) - 90,
              points['waistFrontPanel' + i].dist(points['grainlineFrom' + i])
            )

          macro('title', {
            at: points['title' + i],
            nr: '1' + j,
            title: 'Skirt ' + k + titleFront,
            prefix: 'title' + i,
            scale: 0.15,
            rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
          })
          //title
          points.title = points.cfWaist
            .shiftTowards(points.cfHem, (skirtHighLength - skirtFacingWidth) / 2)
            .shift(0, skirtHighLength * 0.02)
          macro('title', {
            at: points.title,
            nr: '1a',
            title: 'Skirt A' + titleFront,
            scale: 0.15,
            prefix: 'title',
          })
        }
      } else {
        points.title = points.frontHemMidMin.shiftFractionTowards(points.waistFrontMid, 0.5)
        macro('title', {
          at: points.title,
          nr: '1',
          title: 'Skirt' + titleFront,
          prefix: 'title',
          scale: 0.5,
          rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
        })
        if (options.skirtFacings) {
          points.titleFacing = points.frontHemMid.shiftFractionTowards(
            points.frontHemFacingMid,
            0.5
          )
          macro('title', {
            at: points.titleFacing,
            nr: '5',
            title: 'Skirt Facing (Front)',
            prefix: 'titleFacing',
            scale: 0.5,
            rotation: 90 - points.frontHemMid.angle(points.frontHemFacingMid),
          })
          if (includeBack) {
            points.titleBackFacing = points.backHemMid.shiftFractionTowards(
              points.backHemFacingMid,
              0.5
            )
            macro('title', {
              at: points.titleBackFacing,
              nr: '7',
              title: 'Skirt Facing (Back)',
              prefix: 'titleBackFacing',
              scale: 0.5,
              rotation: 90 - points.backHemMid.angle(points.backHemFacingMid),
            })
          }
        }
      }
      //logo
      points.logo = points.frontHemMidMin.shiftFractionTowards(points.waistFrontMid, 2 / 3)
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
        rotation: 90 - points.frontHemMid.angle(points.waistFrontMid),
      })
      //scalebox
      points.scalebox = points.frontHemMidMin.shiftFractionTowards(points.waistFrontMid, 1 / 3)
      macro('scalebox', {
        at: points.scalebox,
        scale: 0.25,
      })
      //facings
      if (options.skirtFacings) {
        if (includeBack) {
          paths.backFacing = new Path()
            .move(points.cbHemFacing)
            .curve(points.cbFacingCp1, points.backHemFacingMidCp2, points.backHemFacingMid)
            .curve(
              points.backHemFacingMidCp1,
              points.sideBackHemFacingCp2,
              points.sideBackHemFacing
            )
            .attr('class', 'interfacing')
            .attr('data-text', 'Facing Line')
            .attr('data-text-class', 'center')

          paths.cbHemFacing = new Path().move(points.cbHemFacing).line(points.cbHem).hide()

          if (points.sideBackExtension) {
            if (points.backHemFacingExSplit) {
              paths.backFacing = paths.backFacing.line(points.backHemFacingExSplit)
            }
          }
        }

        paths.facing = new Path()
          .move(points.cfHemFacing)
          .curve(points.cfFacingCp1, points.frontHemFacingMidCp2, points.frontHemFacingMid)
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
          if (points.frontHemFacingExSplit) {
            paths.facing = paths.facing.line(points.frontHemFacingExSplit)
          }
        }
        paths.sideFrontFacing = paths.sideSeam.split(paths.facing.end())[0].hide()
      }
      //sort seam allowance
      if (
        includeBack &&
        (options.closurePosition == 'front' ||
          options.closurePosition == 'back' ||
          options.cbSaWidth > 0)
      ) {
        if (
          !options.waistbandElastic ||
          (options.waistbandElastic && options.cfSaWidth != options.cbSaWidth)
        ) {
          paths.cf
            .attr('class', 'fabric hidden')
            .attr('data-text', 'Need to Back Seam Allowance')
            .attr('data-text-class', 'center')
            .unhide()
        }
      }
      if (sa) {
        let waistSa = sa
        if (options.waistbandStyle == 'none') waistSa = store.get('waistSa')
        const closureSa = sa * options.closureSaWidth * 100

        let hemSa
        if (options.skirtFacings) {
          hemSa = sa
        } else {
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
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.999),
          points.sideWaistFront
            .shiftTowards(points.sideWaistFrontCp2, waistSa)
            .rotate(-90, points.sideWaistFront),
          points.sideWaistFrontCp2
            .shiftTowards(points.sideWaistFront, waistSa)
            .rotate(90, points.sideWaistFrontCp2)
        )

        points.saCfWaist = points.cfWaist.translate(-cfSa, -waistSa)
        points.saCfHem = points.cfHem.translate(-cfSa, hemSa)

        if (options.skirtFacings) {
          points.saSideFrontHemFacing = utils.beamsIntersect(
            paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa).end(),
            paths.sideSeam
              .split(paths.facing.end())[0]
              .offset(sideSeamSa)
              .shiftFractionAlong(0.999),
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

        if (includeBack) {
          let cbSa
          if (options.closurePosition == 'back' && !options.waistbandElastic) {
            cbSa = closureSa
          } else {
            cbSa = sa * options.cbSaWidth * 100
          }

          points.saCbCfHem = points.cfHem.translate(-cbSa, hemSa)
          points.saCbHem = points.cbHem.translate(-cbSa, hemSa)

          if (options.skirtFacings) {
            points.saSideBackHemFacing = utils.beamsIntersect(
              paths.sideSeam.split(paths.backFacing.end())[0].offset(sideSeamSa).end(),
              paths.sideSeam
                .split(paths.backFacing.end())[0]
                .offset(sideSeamSa)
                .shiftFractionAlong(0.999),
              points.sideBackHemFacing
                .shiftTowards(points.sideBackHemFacingCp2, sa)
                .rotate(-90, points.sideBackHemFacing),
              points.sideBackHemFacingCp2
                .shiftTowards(points.sideBackHemFacing, sa)
                .rotate(90, points.sideBackHemFacingCp2)
            )
            points.saCbFacing = points.cbHemFacing.translate(-cbSa, -sa)
            paths.backFacingSa = paths.hemBaseBack
              .offset(hemSa)
              .line(points.saSideBackHemFacing)
              .join(paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa))
              .line(points.saSideBackHemFacing)
              .join(paths.backFacing.reverse().offset(sa))
              .line(points.saCbFacing)
              .line(points.saCbHem)
              .close()
              .attr('class', 'interfacing sa')
          }

          paths.saBack = paths.hemBaseBack
            .offset(hemSa)
            .line(points.saSideFrontHem)
            .join(paths.sideSeam.offset(sideSeamSa))
            .line(points.saSideWaistFront)
            .join(paths.waist.offset(waistSa))
            .line(points.saCfWaist)
            .line(points.saCfHem)
            .line(points.saCbCfHem)
            .line(points.saCbHem)
            .close()
            .attr('class', 'fabric sa')
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
