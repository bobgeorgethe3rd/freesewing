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

    //stores
    store.set('skirtFacingWidth', skirtFacingWidth)
    if (complete) {
      //facing
      if (options.skirtFacings) {
        points.cbFacing = points.cbHem.shiftTowards(points.cbWaist, skirtFacingWidth)
        points.backFacingMid = points.backHemMid.shiftTowards(points.waistBackMid, skirtFacingWidth)
        points.sideBackFacing = points.sideBackHem.shiftTowards(
          points.sideWaistBack,
          skirtFacingWidth
        )
        points.backFacingCp4 = utils.beamsIntersect(
          points.backHemCp1,
          points.waistBackCp4,
          points.cbFacing,
          points.cbWaist.rotate(-90, points.cbFacing)
        )
        points.backFacingCp3 = utils.beamsIntersect(
          points.backHemCp2,
          points.waistBackCp3,
          points.backFacingMid,
          points.waistBackMid.rotate(90, points.backFacingMid)
        )
        points.backFacingCp2 = points.backFacingCp3.rotate(180, points.backFacingMid)
        points.backFacingCp1 = utils.beamsIntersect(
          points.backHemCp4,
          points.waistBackCp1,
          points.sideBackFacing,
          points.sideWaistBack.rotate(90, points.sideBackFacing)
        )

        paths.facing = new Path()
          .move(points.cbFacing)
          .curve(points.backFacingCp4, points.backFacingCp3, points.backFacingMid)
          .curve(points.backFacingCp2, points.backFacingCp1, points.sideBackFacing)
          .attr('class', 'interfacing')
          .attr('data-text', 'Facing Line')
          .attr('data-text-class', 'center')

        paths.cbFacing = new Path().move(points.cbFacing).line(points.cbHem).hide()

        if (points.sideBackExtension) {
          let facingBackExtension = utils.lineIntersectsCurve(
            points.sideBackFacing,
            points.backFacingCp1.shiftOutwards(
              points.sideBackFacing,
              points.sideBackHem.dist(points.backHemExtension)
            ),
            points.sideBackExtension,
            points.sideSeamBackCp,
            points.sideWaistBack,
            points.sideWaistBack
          )

          if (facingBackExtension) {
            points.facingBackExtension = facingBackExtension
          } else {
            points.facingBackExtension = utils.beamsIntersect(
              points.backFacingCp1,
              points.sideBackFacing,
              points.backHemExtension,
              points.sideBackExtension
            )
          }
          paths.facing = paths.facing.line(points.facingBackExtension)
        }
        paths.sideBackFacing = paths.sideSeam
          .split(paths.hemBase.end())[1]
          .split(paths.facing.end())[0]
          .hide()
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
          points['backHemPanel' + i] = new Path()
            .move(points.cbHem)
            .curve(points.backHemCp1, points.backHemCp2, points.backHemMid)
            .curve(points.backHemCp3, points.backHemCp4, points.sideBackHem)
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
            nr: '2' + j,
            title: 'Skirt Back ' + k + ')',
            prefix: 'title' + i,
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
              nr: '7' + j,
              title: 'Skirt Facing (Back ' + k + ')',
              prefix: 'titleFacing' + i,
              scale: 0.25,
              rotation: 90 - points['backHemPanel' + i].angle(points['waistBackPanel' + i]),
            })

            points.titleFacing = points.cbHem
              .shiftTowards(points.cbWaist, skirtFacingWidth / 2)
              .shift(0, skirtLength * 0.02)
            macro('title', {
              at: points.titleFacing,
              nr: '7a',
              title: 'Skirt Facing (Front B)',
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
          nr: '2a',
          title: 'Skirt Back',
          scale: 0.15,
          prefix: 'title',
        })
      } else {
        //title
        points.title = points.cbWaist
          .shiftTowards(points.cbHem, (skirtLength - skirtFacingWidth) / 2)
          .shift(0, skirtLength * 0.13)
        macro('title', {
          at: points.title,
          nr: '2',
          title: 'Skirt Back',
          scale: 0.5,
          prefix: 'title',
        })

        if (options.skirtFacings) {
          points.titleFacing = new Point(points.title.x, points.cbHem.y - skirtFacingWidth / 2)
          macro('title', {
            at: points.titleFacing,
            nr: '7',
            title: 'Skirt Facing (Back)',
            scale: 0.5,
            prefix: 'titleFacing',
          })
        }
      }
      //grainline
      let cbSa
      if (
        options.waistbandClosurePosition == 'back' &&
        !options.waistbandElastic &&
        (options.useBackMeasures ||
          options.independentSkirtFullness ||
          options.independentSkirtGathering)
      ) {
        cbSa = sa
        points.grainlineFrom = points.cbWaist.shiftFractionTowards(points.cbHem, 0.01)
        points.grainlineTo = points.cbHem.shiftFractionTowards(points.cbWaist, 0.01)
        macro('grainline', {
          from: points.cbWaist.rotate(-90, points.grainlineFrom),
          to: points.cbHem.rotate(90, points.grainlineTo),
        })
      } else {
        cbSa = 0
        points.cutOnFoldFrom = points.cbWaist
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
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
            .join(paths.sideBackFacing.offset(sa))
            .join(paths.facing.reverse().offset(sa))
            .join(paths.cbFacing.offset(cbSa))
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .offset(hemSa)
          .join(paths.sideSeam.join(paths.waist).offset(sa))
          .join(paths.cb.offset(cbSa))
          .close()
          .attr('class', 'fabric sa')

        store.set('hemSa', hemSa)
      }
    }

    return part
  },
}
