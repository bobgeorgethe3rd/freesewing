import { skirtBase } from './skirtBase.mjs'
import { pocket } from '@freesewing/claude'
import { waistband } from '@freesewing/claude'

export const skirtFront = {
  name: 'harriet.skirtFront',
  from: skirtBase,
  after: [pocket, waistband],
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
    Snippet,
    absoluteOptions,
    log,
  }) => {
    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    const skirtLength = store.get('skirtLength')
    const skirtFacingWidth = skirtLength * options.skirtFacingWidth
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
      !options.independentSkirtGathering

    if (includeBack) {
      if (points.sideBackExtension) {
        paths.sideSeamBack = new Path()
          .move(points.backHemExtension)
          .line(points.sideBackExtension)
          .curve_(points.sideSeamBackCp, points.sideWaistBack)
          .hide()

        if (points.backHemExSplit) {
          paths.sideSeamBack = paths.sideSeamBack.split(points.backHemExSplit)[1].hide()
        }
      } else {
        paths.sideSeamBack = new Path().move(points.sideBackHem).line(points.sideWaistBack).hide()
      }
      paths.waistBack = new Path()
        .move(points.sideWaistBack)
        .curve(points.waistBackCp1, points.waistBackCp2, points.waistBackMid)
        .curve(points.waistBackCp3, points.waistBackCp4, points.cbWaist)
        .hide()

      paths.cb = new Path().move(points.cfHem).line(points.cbHem).hide()

      paths.hemBaseBack = new Path()
        .move(points.cbHem)
        .curve(points.backHemCp1, points.backHemCp2, points.backHemMid)
        .curve(points.backHemCp3, points.backHemCp4, points.sideBackHem)
        .line(paths.sideSeam.start())
        .hide()

      paths.seamBack = paths.hemBaseBack
        .join(paths.sideSeamBack)
        .join(paths.waistBack)
        .join(paths.cf)
        .join(paths.cb)
        .close()
    }

    //paths
    paths.seam = paths.hemBase.join(paths.sideSeam).join(paths.waist).join(paths.cf).close()

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
          paths.sideBackFacing = paths.sideSeam.split(paths.backFacing.end())[0].hide()
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
        }
      }
    }

    return part
  },
}
