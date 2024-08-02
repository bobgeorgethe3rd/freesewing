import { skirtBase } from '@freesewing/claude'
import { skirtFront } from './skirtFront.mjs'

export const skirtBack = {
  name: 'harvey.skirtBack',
  from: skirtBase,
  after: [skirtFront],
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
    log,
    absoluteOptions,
  }) => {
    //set Render
    if (
      !options.separateBack &&
      !options.useBackMeasures &&
      !options.independentSkirtFullness &&
      !options.independentSkirtGathering &&
      (options.fitWaistFront == options.fitWaistBack ||
        (options.fitWaistFront != options.fitWaistBack && options.waistbandElastic))
    ) {
      part.hide()
      return part
    }

    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    const skirtLength = store.get('skirtLength')
    const skirtBackRadius = store.get('backRadius') + skirtLength
    const skirtFacingWidth = store.get('skirtFacingWidth')

    //let's begin
    const hemIntersect = utils.beamsIntersect(
      points.cbHem,
      points.cbWaist.rotate(-90, points.cbHem),
      points.sideBackHem,
      points.sideWaistBack.rotate(90, points.sideBackHem)
    )
    if (!hemIntersect || skirtBackRadius < hemIntersect.dist(points.cbHem)) {
      points.handkerchiefBackHemLeft = points.cbHem.shift(0, skirtBackRadius)
      points.handkerchiefBackHemRight = points.sideBackHem.shift(
        points.sideBackHem.angle(points.sideWaistBack) + 90,
        skirtBackRadius
      )
    } else {
      points.handkerchiefBackHemLeft = hemIntersect
      points.handkerchiefBackHemRight = hemIntersect
    }
    //paths
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

    paths.hemBase = new Path()
      .move(points.cbHem)
      .line(points.handkerchiefBackHemLeft)
      .line(points.handkerchiefBackHemRight)
      .line(points.sideBackHem)
      .line(paths.sideSeam.start())
      .hide()

    paths.seam = paths.hemBase.join(paths.sideSeam).join(paths.waist).line(points.cbHem).close()

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
      points.handkerchiefBackHemMid = points.handkerchiefBackHemLeft.shiftFractionTowards(
        points.handkerchiefBackHemRight,
        0.5
      )
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
            .line(points.handkerchiefBackHemLeft)
            .line(points.handkerchiefBackHemRight)
            .line(points.sideBackHem)
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

          if (options.skirtFacings && options.skirtBandStyle == 'none') {
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
        points.title = points.handkerchiefBackHemMid
          .shiftTowards(points.waistBackMid, skirtFacingWidth)
          .shiftFractionTowards(points.waistBackMid, 0.5)
        macro('title', {
          at: points.title,
          nr: '6',
          title: 'Skirt (Back)',
          scale: 0.5,
          prefix: 'title',
          rotation: 90 - points.handkerchiefBackHemMid.angle(points.waistBackMid),
        })

        if (options.skirtFacings && options.skirtBandStyle == 'none') {
          points.titleFacing = points.handkerchiefBackHemMid.shiftTowards(
            points.waistBackMid,
            skirtFacingWidth / 2
          )
          macro('title', {
            at: points.titleFacing,
            nr: '7',
            title: 'Skirt Facing (Back)',
            scale: 0.5,
            prefix: 'titleFacing',
            rotation: 90 - points.handkerchiefBackHemMid.angle(points.waistBackMid),
          })
        }
      }
      //facing
      if (options.skirtFacings && options.skirtBandStyle == 'none') {
        points.cbHemFacing = points.cbHem.shiftTowards(points.cbWaist, skirtFacingWidth)
        points.backHemFacingMid = points.backHemMid.shiftTowards(
          points.waistBackMid,
          skirtFacingWidth
        )
        points.sideBackHemFacing = points.sideBackHem.shiftTowards(
          points.sideWaistBack,
          skirtFacingWidth
        )

        points.handkerchiefBackHemLeftFacing = utils.beamIntersectsY(
          points.handkerchiefBackHemLeft.shift(
            points.backHemMid.angle(points.waistBackMid),
            skirtFacingWidth
          ),
          points.handkerchiefBackHemLeft
            .shift(points.backHemMid.angle(points.waistBackMid), skirtFacingWidth)
            .shift(points.backHemMid.angle(points.waistBackMid) + 90, 1),
          points.cbHemFacing.y
        )
        points.handkerchiefBackHemRightFacing = utils.beamsIntersect(
          points.sideBackHemFacing,
          points.sideWaistBack.rotate(90, points.sideBackHemFacing),
          points.handkerchiefBackHemRight.shift(
            points.backHemMid.angle(points.waistBackMid),
            skirtFacingWidth
          ),
          points.handkerchiefBackHemRight
            .shift(points.backHemMid.angle(points.waistBackMid), skirtFacingWidth)
            .shift(points.backHemMid.angle(points.waistBackMid) - 90, 1)
        )
        if (points.handkerchiefBackHemLeftFacing.x > points.handkerchiefBackHemRightFacing.x) {
          points.handkerchiefBackHemLeftFacing = utils.beamIntersectsY(
            points.sideBackHemFacing,
            points.sideBackHemFacing.shift(points.sideBackHem.angle(points.sideWaistBack) + 90, 1),
            points.cbHemFacing.y
          )
          points.handkerchiefBackHemRightFacing = points.handkerchiefBackHemLeftFacing
        }

        paths.facing = new Path()
          .move(points.cbHemFacing)
          .line(points.handkerchiefBackHemLeftFacing)
          .line(points.handkerchiefBackHemRightFacing)
          .line(points.sideBackHemFacing)
          .attr('class', 'interfacing')
          .attr('data-text', 'Facing Line')
          .attr('data-text-class', 'center')

        paths.cbHemFacing = new Path().move(points.cbHemFacing).line(points.cbHem).hide()

        if (points.sideBackExtension) {
          let facingBackExtension = utils.lineIntersectsCurve(
            points.sideBackHemFacing,
            points.handkerchiefBackHemRightFacing.shiftOutwards(
              points.sideBackHemFacing,
              points.sideBackHem.dist(points.backHemExtension) * 29
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
              points.handkerchiefBackHemRightFacing,
              points.sideBackHemFacing,
              points.backHemExtension,
              points.sideBackExtension
            )
          }
          paths.facing = paths.facing.line(points.facingBackExtension)
        }
      }
      if (sa) {
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
        if (points.handkerchiefBackHemLeft.sitsRoughlyOn(points.handkerchiefBackHemRight)) {
          points.saHandkerchiefBackHemLeft = utils.beamIntersectsY(
            points.waistBackMid,
            points.backHemMid,
            points.cbHem.y + hemSa
          )
          points.saHandkerchiefBackHemRight = points.saHandkerchiefBackHemLeft
        } else {
          points.saHandkerchiefBackHemLeft = utils.beamIntersectsY(
            points.handkerchiefBackHemLeft
              .shiftTowards(points.handkerchiefBackHemRight, hemSa)
              .rotate(-90, points.handkerchiefBackHemLeft),
            points.handkerchiefBackHemRight
              .shiftTowards(points.handkerchiefBackHemLeft, hemSa)
              .rotate(90, points.handkerchiefBackHemRight),
            points.cbHem.y + hemSa
          )

          points.saHandkerchiefBackHemRight = utils.beamsIntersect(
            points.handkerchiefBackHemLeft
              .shiftTowards(points.handkerchiefBackHemRight, hemSa)
              .rotate(-90, points.handkerchiefBackHemLeft),
            points.handkerchiefBackHemRight
              .shiftTowards(points.handkerchiefBackHemLeft, hemSa)
              .rotate(90, points.handkerchiefBackHemRight),
            points.handkerchiefBackHemRight
              .shiftTowards(points.sideBackHem, hemSa)
              .rotate(-90, points.handkerchiefBackHemRight),
            points.sideBackHem
              .shiftTowards(points.handkerchiefBackHemRight, hemSa)
              .rotate(90, points.sideBackHem)
          )
        }

        points.saSideBackHem = utils.beamsIntersect(
          points.handkerchiefBackHemRight
            .shiftTowards(points.sideBackHem, hemSa)
            .rotate(-90, points.handkerchiefBackHemRight),
          points.sideBackHem
            .shiftTowards(points.handkerchiefBackHemRight, hemSa)
            .rotate(90, points.sideBackHem),
          paths.sideSeam.offset(sideSeamSa).start(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.001)
        )
        points.saSideWaistBack = utils.beamsIntersect(
          paths.sideSeam.offset(sideSeamSa).end(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.998),
          points.sideWaistBack
            .shiftTowards(points.sideWaistBackCp2, waistSa)
            .rotate(-90, points.sideWaistBack),
          points.sideWaistBackCp2
            .shiftTowards(points.sideWaistBack, waistSa)
            .rotate(90, points.sideWaistBackCp2)
        )

        points.saCfWaist = points.cbWaist.translate(-cbSa, -waistSa)
        points.saCfHem = points.cbHem.translate(-cbSa, hemSa)

        if (options.skirtFacings && options.skirtBandStyle == 'none') {
          points.saSideBackHemFacing = utils.beamsIntersect(
            paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa).end(),
            paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa).shiftFractionAlong(0.99),
            points.sideBackHemFacing
              .shiftTowards(points.handkerchiefBackHemRightFacing, sa)
              .rotate(-90, points.sideBackHemFacing),
            points.handkerchiefBackHemRightFacing
              .shiftTowards(points.sideBackHemFacing, sa)
              .rotate(90, points.handkerchiefBackHemRightFacing)
          )

          points.saCfFacing = points.cbHemFacing.translate(-cbSa, -sa)

          if (
            points.handkerchiefBackHemLeftFacing.sitsRoughlyOn(
              points.handkerchiefBackHemRightFacing
            )
          ) {
            points.saHandkerchiefBackHemLeftFacing = utils.beamIntersectsY(
              points.waistBackMid,
              points.backHemMid,
              points.saCfFacing.y
            )
            points.saHandkerchiefBackHemRightFacing = points.saHandkerchiefBackHemLeftFacing
          } else {
            points.saHandkerchiefBackHemLeftFacing = utils.beamIntersectsY(
              points.handkerchiefBackHemRightFacing
                .shiftTowards(points.handkerchiefBackHemLeftFacing, sa)
                .rotate(-90, points.handkerchiefBackHemRightFacing),
              points.handkerchiefBackHemLeftFacing
                .shiftTowards(points.handkerchiefBackHemRightFacing, sa)
                .rotate(90, points.handkerchiefBackHemLeftFacing),
              points.saCfFacing.y
            )
            points.saHandkerchiefBackHemRightFacing = utils.beamsIntersect(
              points.saSideBackHemFacing,
              points.saSideBackHemFacing.shift(
                points.sideBackHem.angle(points.sideWaistBack) + 90,
                1
              ),
              points.handkerchiefBackHemRightFacing
                .shiftTowards(points.handkerchiefBackHemLeftFacing, sa)
                .rotate(-90, points.handkerchiefBackHemRightFacing),
              points.handkerchiefBackHemLeftFacing
                .shiftTowards(points.handkerchiefBackHemRightFacing, sa)
                .rotate(90, points.handkerchiefBackHemLeftFacing)
            )
          }

          paths.facingSa = new Path()
            .move(points.saCfHem)
            .line(points.saHandkerchiefBackHemLeft)
            .line(points.saHandkerchiefBackHemRight)
            .line(points.saSideBackHem)
            .join(paths.sideSeam.split(paths.facing.end())[0].offset(sideSeamSa))
            .line(points.saSideBackHemFacing)
            .line(points.saHandkerchiefBackHemRightFacing)
            .line(points.saHandkerchiefBackHemLeftFacing)
            .line(points.saCfFacing)
            .line(points.saCfHem)
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = new Path()
          .move(points.saCfHem)
          .line(points.saHandkerchiefBackHemLeft)
          .line(points.saHandkerchiefBackHemRight)
          .line(points.saSideBackHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistBack)
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
