import { skirtBase } from './skirtBase.mjs'
import { skirtFront } from './skirtFront.mjs'
import { pocket } from '@freesewing/claude'
import { waistband } from '@freesewing/claude'

export const skirtBack = {
  name: 'harriet.skirtBack',
  from: skirtBase,
  after: [skirtFront, pocket, waistband],
  hide: {
    from: true,
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
    //set Render
    if (store.get('includeBack')) {
      part.hide()
      return part
    }
    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    const skirtLength = store.get('skirtLength')
    const skirtHighLength = store.get('skirtHighLength')
    const skirtFacingWidth = store.get('skirtFacingWidth')
    const backOrigin = store.get('backOrigin')

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

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbWaist
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cbWaist.shiftFractionTowards(points.cbWaistCp1, 1 / 3)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
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
      //panels
      if (options.skirtPanels > 1) {
        let j
        let k
        for (let i = 0; i < options.skirtPanels - 1; i++) {
          j = String.fromCharCode(i + 98)
          k = String.fromCharCode(i + 66)

          points['waistBackPanel' + i] = paths.waist
            .reverse()
            .shiftFractionAlong((i + 1) / options.skirtPanels)

          points['backPanelTarget' + i] = backOrigin.shiftTowards(
            points['waistBackPanel' + i],
            skirtLength * 100
          )

          const backPanelIntersect0 = utils.lineIntersectsCurve(
            backOrigin,
            points['backPanelTarget' + i],
            points.cbHem,
            points.cbHemCp2,
            points.backHemMidCp1,
            points.backHemMid
          )

          const backPanelIntersect1 = utils.lineIntersectsCurve(
            backOrigin,
            points['backPanelTarget' + i],
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
              backOrigin,
              points['backPanelTarget' + i],
              points.backHemFacingMid,
              points.backHemFacingMidCp2,
              points.cbFacingCp1,
              points.cbHemFacing
            )

            const backPanelFacingIntersect1 = utils.lineIntersectsCurve(
              backOrigin,
              points['backPanelTarget' + i],
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

            points['titleFacing' + i] = points['backHemPanel' + i]
              .shiftFractionTowards(points['backHemFacingPanel' + i], 1 / 3)
              .shift(
                points['backHemPanel' + i].angle(points['backHemFacingPanel' + i]) - 90,
                points['backHemPanel' + i].dist(points['backHemFacingPanel' + i]) * 0.15
              )
            macro('title', {
              at: points['titleFacing' + i],
              nr: '7' + j,
              title: 'Skirt Facing ' + k + '(Back)',
              prefix: 'titleFacing ' + i,
              cutNr: 2,
              onFold: false,
              scale: 0.15,
              rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
            })

            points.titleFacing = points.cbHem
              .shiftFractionTowards(points.cbHemFacing, 1 / 3)
              .shift(points.cbHem.angle(points.cbHemFacing) - 90, skirtFacingWidth * 0.15)
            macro('title', {
              at: points.titleFacing,
              nr: '7a',
              title: 'Skirt Facing A (Back)',
              prefix: 'titleFacing',
              cutNr: titleCutNum,
              scale: 0.15,
            })
          }

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
            .shiftTowards(points['backHemPanel' + i], (skirtHighLength - skirtFacingWidth) / 2)
            .shift(
              points['backHemPanel' + i].angle(points['waistBackPanel' + i]) - 90,
              points['waistBackPanel' + i].dist(points['grainlineFrom' + i])
            )

          macro('title', {
            at: points['title' + i],
            nr: '6' + j,
            title: 'Skirt ' + k + ' (Back)',
            prefix: 'title ' + i,
            cutNr: 2,
            onFold: false,
            scale: 0.15,
            rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
          })
          //title
          points.title = points.cbWaist
            .shiftTowards(points.cbHem, (skirtHighLength - skirtFacingWidth) / 2)
            .shift(0, skirtHighLength * 0.02)
          macro('title', {
            at: points.title,
            nr: '6a',
            title: 'Skirt Back A',
            cutNr: titleCutNum,
            scale: 0.15,
            prefix: 'title',
          })
        }
      } else {
        points.title = points.backHemMidMin.shiftFractionTowards(points.waistBackMid, 0.5)
        macro('title', {
          at: points.title,
          nr: '6',
          title: 'Skirt (Back)',
          prefix: 'title',
          cutNr: titleCutNum,
          scale: 0.5,
          rotation: 90 - points.backHemMid.angle(points.waistBackMid),
        })
        if (options.skirtFacings) {
          points.titleFacing = points.backHemMid.shiftFractionTowards(points.backHemFacingMid, 0.5)
          macro('title', {
            at: points.titleFacing,
            nr: '7',
            title: 'Skirt Facing (Back)',
            prefix: 'titleFacing',
            cutNr: titleCutNum,
            scale: 0.5,
            rotation: 90 - points.backHemMid.angle(points.backHemFacingMid),
          })
        }
      }
      //facing
      if (options.skirtFacings) {
        paths.facing = new Path()
          .move(points.cbHemFacing)
          .curve(points.cbFacingCp1, points.backHemFacingMidCp2, points.backHemFacingMid)
          .curve(points.backHemFacingMidCp1, points.sideBackHemFacingCp2, points.sideBackHemFacing)
          .attr('class', 'interfacing')
          .attr('data-text', 'Facing Line')
          .attr('data-text-class', 'center')

        paths.cbHemFacing = new Path().move(points.cbHemFacing).line(points.cbHem).hide()

        if (points.sideBackExtension) {
          if (points.backHemFacingExSplit) {
            paths.facing = paths.facing.line(points.backHemFacingExSplit)
          }
        }
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

      let cbSa
      if (options.closurePosition == 'back' && !options.waistbandElastic) {
        cbSa = closureSa
      } else {
        cbSa = sa * options.cbSaWidth * 100
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
        paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.999),
        points.sideWaistBack
          .shiftTowards(points.sideWaistBackCp2, waistSa)
          .rotate(-90, points.sideWaistBack),
        points.sideWaistBackCp2
          .shiftTowards(points.sideWaistBack, waistSa)
          .rotate(90, points.sideWaistBackCp2)
      )

      points.saCbWaist = points.cbWaist.translate(-cbSa, -waistSa)
      points.saCbHem = points.cbHem.translate(-cbSa, hemSa)

      if (options.skirtFacings) {
        points.saSideBackHemFacing = utils.beamsIntersect(
          paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa).end(),
          paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa).shiftFractionAlong(0.999),
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
        .join(paths.waist.offset(waistSa))
        .line(points.saCbWaist)
        .line(points.saCbHem)
        .close()
        .attr('class', 'fabric sa')
    }
    return part
  },
}
