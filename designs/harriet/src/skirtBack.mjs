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
        .curve_(points.sideSeamBackCp, points.sideWaistBack)
        .hide()

      if (points.backHemExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.backHemExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideBackHem).line(points.sideWaistBack).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistBack)
      .curve(points.waistBackCp1, points.waistBackCp2, points.waistBackMid)
      .curve(points.waistBackCp3, points.waistBackCp4, points.cbWaist)
      .hide()

    paths.cb = new Path().move(points.cbWaist).line(points.cbHem).hide()

    paths.hemBase = new Path()
      .move(points.cbHem)
      .curve(points.backHemCp1, points.backHemCp2, points.backHemMid)
      .curve(points.backHemCp3, points.backHemCp4, points.sideBackHem)
      .line(paths.sideSeam.start())
      .hide()
    //paths
    paths.seam = paths.hemBase.join(paths.sideSeam).join(paths.waist).join(paths.cb).close()

    if (complete) {
      //facing
      if (options.skirtFacings) {
        paths.facing = new Path()
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
            points.backHemCp1,
            points.backHemCp2,
            points.backHemMid
          )

          const backPanelIntersect1 = utils.lineIntersectsCurve(
            backOrigin,
            points['backPanelTarget' + i],
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
              backOrigin,
              points['backPanelTarget' + i],
              points.backHemFacingMid,
              points.backHemFacingCp3,
              points.backHemFacingCp4,
              points.cbHemFacing
            )

            const backPanelFacingIntersect1 = utils.lineIntersectsCurve(
              backOrigin,
              points['backPanelTarget' + i],
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

            points['titleFacing' + i] = points['backHemPanel' + i]
              .shiftFractionTowards(points['backHemFacingPanel' + i], 1 / 3)
              .shift(
                points['backHemPanel' + i].angle(points['backHemFacingPanel' + i]) - 90,
                points['backHemPanel' + i].dist(points['backHemFacingPanel' + i]) * 0.15
              )
            macro('title', {
              at: points['titleFacing' + i],
              nr: '7' + j,
              title: 'Skirt Facing (Back ' + k + ')',
              prefix: 'titleFacing' + i,
              scale: 0.15,
              rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
            })

            points.titleFacing = points.cbHem
              .shiftFractionTowards(points.cbHemFacing, 1 / 3)
              .shift(points.cbHem.angle(points.cbHemFacing) - 90, skirtFacingWidth * 0.15)
            macro('title', {
              at: points.titleFacing,
              nr: '7a',
              title: 'Skirt Facing (Back A)',
              prefix: 'titleFacing',
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
            nr: '2' + j,
            title: 'Skirt Back ' + k,
            prefix: 'title' + i,
            scale: 0.15,
            rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
          })
          //title
          points.title = points.cbWaist
            .shiftTowards(points.cbHem, (skirtHighLength - skirtFacingWidth) / 2)
            .shift(0, skirtHighLength * 0.02)
          macro('title', {
            at: points.title,
            nr: '2a',
            title: 'Skirt Back',
            scale: 0.15,
            prefix: 'title',
          })
        }
      } else {
        points.title = points.backHemMidMin.shiftFractionTowards(points.waistBackMid, 0.5)
        macro('title', {
          at: points.title,
          nr: '2',
          title: 'Skirt (Back)',
          prefix: 'title',
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
            scale: 0.5,
            rotation: 90 - points.backHemMid.angle(points.backHemFacingMid),
          })
        }
      }
      //grainline
      if (options.waistbandClosurePosition == 'back' && !options.waistbandElastic) {
        points.grainlineBackFrom = points.cbWaist.shiftFractionTowards(points.cbHem, 0.02)
        points.grainlineBackTo = points.cbHem.shiftFractionTowards(points.cbWaist, 0.02)
        macro('grainline', {
          from: points.cbWaist.rotate(-90, points.grainlineBackFrom),
          to: points.cbHem.rotate(90, points.grainlineBackTo),
        })
      } else {
        points.cutOnFoldBackFrom = points.cbWaist
        points.cutOnFoldBackTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldBackFrom,
          to: points.cutOnFoldBackTo,
          grainline: true,
        })
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

      if (sa) {
        const hemSa = store.get('hemSa')
        const cbSa = store.get('cbSa')
        if (options.skirtFacings) {
          paths.facingSa = paths.hemBase
            .offset(hemSa)
            .join(paths.sideSeam.split(paths.facing.end())[0].offset(sa))
            .join(paths.facing.offset(-sa).reverse()) //yea weird but due to a bug has to be this way
            .join(paths.cbHemFacing.offset(cbSa))
            .close()
            .attr('class', 'interfacing sa')
        }
        paths.sa = paths.hemBase
          .offset(hemSa)
          .join(paths.sideSeam.offset(sa))
          .join(paths.waist.offset(sa))
          .join(paths.cb.offset(cbSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
