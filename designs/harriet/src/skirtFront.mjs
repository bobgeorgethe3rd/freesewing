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

    const includeBack =
      !options.useBackMeasures &&
      !options.independentSkirtFullness &&
      !options.independentSkirtGathering &&
      !options.separateBack

    if (includeBack) {
      paths.cb = new Path().move(points.cfHem).line(points.cbHem).hide()

      paths.hemBaseBack = new Path()
        .move(points.cbHem)
        .curve(points.backHemCp1, points.backHemCp2, points.backHemMid)
        .curve(points.backHemCp3, points.backHemCp4, points.sideBackHem)
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
      //facing
      if (options.skirtFacings) {
        if (includeBack) {
          paths.backFacing = new Path()
            .move(points.cbHemFacing)
            .curve(points.backHemFacingCp4, points.backHemFacingCp3, points.backHemFacingMid)
            .curve(points.backHemFacingCp2, points.backHemFacingCp1, points.sideBackHemFacing)
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
          .curve(points.frontHemFacingCp4, points.frontHemFacingCp3, points.frontHemFacingMid)
          .curve(points.frontHemFacingCp2, points.frontHemFacingCp1, points.sideFrontHemFacing)
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
      //back titles
      let titleBack
      let titleBackNum
      if (includeBack) {
        if (options.skirtPanels > 1) {
          titleBack = ' & Back A'
          titleBackNum = ' & 2a'
        } else {
          titleBack = ' & Back'
          titleBackNum = ' & 2'
        }
      } else {
        titleBack = ''
        titleBackNum = ''
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

          points['frontPanelTarget' + i] = frontOrigin.shiftTowards(
            points['waistFrontPanel' + i],
            skirtLength * 100
          )

          const frontPanelIntersect0 = utils.lineIntersectsCurve(
            frontOrigin,
            points['frontPanelTarget' + i],
            points.cfHem,
            points.frontHemCp1,
            points.frontHemCp2,
            points.frontHemMid
          )

          const frontPanelIntersect1 = utils.lineIntersectsCurve(
            frontOrigin,
            points['frontPanelTarget' + i],
            points.frontHemMid,
            points.frontHemCp3,
            points.frontHemCp4,
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
              points.frontHemFacingCp3,
              points.frontHemFacingCp4,
              points.cfHemFacing
            )

            const frontPanelFacingIntersect1 = utils.lineIntersectsCurve(
              frontOrigin,
              points['frontPanelTarget' + i],
              points.sideFrontHemFacing,
              points.frontHemFacingCp1,
              points.frontHemFacingCp2,
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
              nr: '6' + j,
              title: 'Skirt Facing (Front ' + k + ')',
              prefix: 'titleFacing' + i,
              scale: 0.15,
              rotation: 90 - points['frontHemPanel' + i].angle(points['waistFrontPanel' + i]),
            })

            points.titleFacing = points.cfHem
              .shiftFractionTowards(points.cfHemFacing, 1 / 3)
              .shift(points.cfHem.angle(points.cfHemFacing) - 90, skirtFacingWidth * 0.15)
            macro('title', {
              at: points.titleFacing,
              nr: '6a',
              title: 'Skirt Facing (Front A)',
              prefix: 'titleFacing',
              scale: 0.15,
            })
          }

          if (includeBack) {
            const backPanelIntersect0 = utils.lineIntersectsCurve(
              frontOrigin,
              points['frontPanelTarget' + i],
              points.cbHem,
              points.backHemCp1,
              points.backHemCp2,
              points.backHemMid
            )

            const backPanelIntersect1 = utils.lineIntersectsCurve(
              frontOrigin,
              points['frontPanelTarget' + i],
              points.backHemMid,
              points.backHemCp3,
              points.backHemCp4,
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
                points.backHemFacingCp3,
                points.backHemFacingCp4,
                points.cbHemFacing
              )

              const backPanelFacingIntersect1 = utils.lineIntersectsCurve(
                frontOrigin,
                points['frontPanelTarget' + i],
                points.sideBackHemFacing,
                points.backHemFacingCp1,
                points.backHemFacingCp2,
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
                title: 'Skirt Facing (Back ' + k + ')',
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
                title: 'Skirt Facing (Back A)',
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

          let titleBackI
          let titleBackNumI
          if (includeBack) {
            titleBackI = ' & Back ' + k
            titleBackNumI = ' & 2' + j
          } else {
            titleBackI = ''
            titleBackNumI = ''
          }

          macro('title', {
            at: points['title' + i],
            nr: '1' + j + titleBackNumI,
            title: 'Skirt Front ' + k + titleBackI,
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
            nr: '1a' + titleBackNum,
            title: 'Skirt Front' + titleBack,
            scale: 0.15,
            prefix: 'title',
          })
        }
      } else {
        points.title = points.frontHemMidMin.shiftFractionTowards(points.waistFrontMid, 0.5)
        macro('title', {
          at: points.title,
          nr: '1' + titleBackNum,
          title: 'Skirt (Front' + titleBack + ')',
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
            nr: '6',
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
      //grainline
      let cfSa
      if (options.closurePosition == 'front' && !options.waistbandElastic) {
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
      if (includeBack) {
        if (options.closurePosition == 'back' && !options.waistbandElastic) {
          points.grainlineBackFrom = points.cfHem.shiftFractionTowards(points.cbHem, 0.02)
          points.grainlineBackTo = points.cbHem.shiftFractionTowards(points.cfHem, 0.02)
          macro('grainline', {
            from: points.cfHem.rotate(-90, points.grainlineBackFrom),
            to: points.cbHem.rotate(90, points.grainlineBackTo),
          })
        } else {
          points.cutOnFoldBackFrom = points.cfHem
          points.cutOnFoldBackTo = points.cbHem
          macro('cutonfold', {
            from: points.cutOnFoldBackFrom,
            to: points.cutOnFoldBackTo,
            grainline: true,
            prefix: 'back',
          })
        }
      }
      //notches
      if (store.get('pocketLength') < store.get('sideSkirtLength')) {
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
      //add seam allowance
      if (includeBack && !options.waistbandElastic) {
        if (options.closurePosition == 'back') {
          paths.cf
            .attr('class', 'fabric hidden')
            .attr('data-text', 'ADD SEAM ALLOWANCE FOR BACK')
            .attr('data-text-class', 'center')
            .unhide()
        }
        if (options.closurePosition == 'front') {
          paths.cf
            .attr('class', 'fabric hidden')
            .attr('data-text', 'REMOVE SEAM ALLOWANCE FOR BACK')
            .attr('data-text-class', 'center')
            .unhide()
        }
      }
      if (sa) {
        let hemSa
        if (options.skirtFacings) {
          hemSa = sa
        } else {
          hemSa = sa * options.skirtHemWidth * 100
        }

        let cbSa
        if (options.closurePosition == 'back' && !options.waistbandElastic) {
          cbSa = sa
        } else {
          cbSa = 0
        }

        store.set('hemSa', hemSa)
        store.set('cbSa', cbSa)

        if (options.skirtFacings) {
          if (includeBack) {
            paths.backFacingSa = paths.hemBaseBack
              .offset(hemSa)
              .join(paths.sideSeam.split(paths.backFacing.end())[0].offset(sa))
              .join(paths.backFacing.offset(-sa).reverse()) //yea weird but due to a bug has to be this way
              .join(paths.cbHemFacing.offset(cbSa))
              .close()
              .attr('class', 'interfacing sa')
          }
          paths.facingSa = paths.hemBase
            .offset(hemSa)
            .join(paths.sideSeam.split(paths.facing.end())[0].offset(sa))
            .join(paths.facing.offset(-sa).reverse()) //yea weird but due to a bug has to be this way
            .join(paths.cfHemFacing.offset(cfSa))
            .close()
            .attr('class', 'interfacing sa')
        }

        if (includeBack) {
          paths.saBack = paths.hemBaseBack
            .offset(hemSa)
            .join(paths.sideSeam.offset(sa))
            .join(paths.waist.offset(sa))
            .join(paths.cf.offset(cfSa))
            .join(paths.cb.offset(cbSa))
            .close()
            .attr('class', 'fabric sa')
        }
        paths.sa = paths.hemBase
          .offset(hemSa)
          .join(paths.sideSeam.offset(sa))
          .join(paths.waist.offset(sa))
          .join(paths.cf.offset(cfSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
