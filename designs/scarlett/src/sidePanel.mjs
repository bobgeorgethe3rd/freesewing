import { skirtBase } from './skirtBase.mjs'
import { inseamPocket } from '@freesewing/wanda'
import { boxPleatPocket } from '@freesewing/wanda'
import { pearPocket } from '@freesewing/wanda'

export const sidePanel = {
  name: 'scarlett.sidePanel',
  from: skirtBase,
  after: [inseamPocket, boxPleatPocket, pearPocket],
  hide: {
    from: true,
  },
  options: {
    //Style
    style: { dflt: 'straight', list: ['straight', 'bell', 'umbrella'], menu: 'style' },
    //Construction
    sideDart: { dflt: 'dart', list: ['dart', 'seam'], menu: 'construction' },
    crossSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
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
    //removing paths
    for (let i in paths) delete paths[i]
    //let's begin
    const drawHemBase = () => {
      if (options.sideDart == 'dart') {
        if (options.style == 'straight') {
          return new Path()
            .move(points.crossHemS)
            .line(points.hemKS)
            .curve(points.hemKCp2S, points.hemFCp1, points.hemF)
            .curve(points.hemFCp2, points.hemECp1, points.hemE)
        } else {
          return new Path()
            .move(points.hemK)
            .curve(points.hemKCp2, points.hemFCp1, points.hemF)
            .curve(points.hemFCp2, points.hemECp1, points.hemE)
        }
      } else {
        return new Path().move(points.hemF).curve(points.hemFCp2, points.hemECp1, points.hemE)
      }
    }

    paths.seamLeft = new Path()
      .move(points.hemE)
      .line(points.dartTipE)
      .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
      .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
      .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
      .curve(points.dartTipFCp1, points.dartTipFCp2, points.dartTipF)
      .hide()

    paths.cross = new Path()
      .move(points.waist3LeftS)
      .curve(points.seatK, points.crossSCp1, points.crossS)
      .hide()

    const drawSeamRight = () => {
      if (options.sideDart == 'dart') {
        if (options.style == 'straight') {
          return new Path()
            .move(points.dartTipF)
            .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
            .curve(points.waist3Cp1, points.waist3Cp2, points.waist3LeftS)
            .join(paths.cross)
            .line(points.crossHemS)
        }
        if (options.style == 'bell') {
          return new Path()
            .move(points.dartTipF)
            .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
            .curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
            .line(points.hemK)
        }
        if (options.style == 'umbrella') {
          return new Path()
            .move(points.dartTipF)
            .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
            .curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
            .line(points.hemK)
        }
      } else {
        return new Path().move(points.dartTipF).line(points.hemF)
      }
    }

    //paths
    paths.seam = drawHemBase().clone().join(paths.seamLeft).join(drawSeamRight()).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistE.shiftFractionTowards(points.hemE, 0.025)
      points.grainlineTo = points.hemE.shiftFractionTowards(points.waistE, 0.025)
      macro('grainline', {
        from: points.waistE.rotate(90, points.grainlineFrom),
        to: points.hemE.rotate(-90, points.grainlineTo),
      })
      //notches
      if (options.pocketsBool) {
        paths.sideSeam = new Path()
          .move(points.waist2Right)
          .curve(points.dartTipECp3, points.dartTipECp2, points.dartTipE)
          .line(points.hemE)
          .hide()
        points.pocketOpeningTop = paths.sideSeam.shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = paths.sideSeam.shiftAlong(store.get('pocketOpeningLength'))

        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      if (options.style == 'straight') {
        points.crossNotch = paths.cross.shiftFractionAlong(0.5)
        snippets.crossNotch = new Snippet('bnotch', points.crossNotch)
      }
      //dart
      let titleNum
      let titleName
      if (options.sideDart == 'dart') {
        titleNum = 4

        paths.dart = new Path()
          .move(points.waist2Left)
          .line(points.dartTopF)
          .line(points.waist3Right)
          .attr('class', 'fabric help')

        if (options.style == 'straight') {
          titleName = 'Back Panel'
        } else titleName = 'Side Panel'
      } else {
        titleNum = '4a'
        if (options.style == 'straight') {
          titleName = 'Back Panel A'
        } else titleName = 'Side Panel A'
      }

      //title
      points.title = points.origin.shiftOutwards(
        points.waistPanel2,
        points.waistE.dist(points.hemE) * 0.45
      )
      macro('title', {
        nr: titleNum,
        title: titleName,
        at: points.title,
        rotation: 90 - points.hemE.angle(points.origin),
      })
      //facings
      points.hemFacingE = points.hemE.shiftTowards(points.waistE, store.get('skirtHemFacingWidth'))
      points.hemFacingFCp1 = utils.beamsIntersect(
        points.hemFCp2,
        points.origin,
        points.hemFacingF,
        points.origin.rotate(-90, points.hemFacingF)
      )
      points.hemFacingECp2 = utils.beamsIntersect(
        points.hemECp1,
        points.origin,
        points.hemFacingE,
        points.origin.rotate(90, points.hemFacingE)
      )

      const drawHemFacing = () => {
        if (options.sideDart == 'dart') {
          if (options.style == 'straight') {
            return new Path()
              .move(points.crossHemFacingS)
              .line(points.hemFacingKS)
              .curve(points.hemFacingKCp1S, points.hemFacingFCp2, points.hemFacingF)
              .curve(points.hemFacingFCp1, points.hemFacingECp2, points.hemFacingE)
          } else {
            return new Path()
              .move(points.hemFacingK)
              .curve(points.hemFacingKCp1, points.hemFacingFCp2, points.hemFacingF)
              .curve(points.hemFacingFCp1, points.hemFacingECp2, points.hemFacingE)
          }
        } else {
          return new Path()
            .move(points.hemFacingF)
            .curve(points.hemFacingFCp1, points.hemFacingECp2, points.hemFacingE)
        }
      }

      paths.hemFacing = drawHemFacing()
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

      if (options.waistbandStyle == 'none') {
        points.waistFacingFCp2 = utils.beamsIntersect(
          points.hemFCp2,
          points.origin,
          points.waistFacingF,
          points.origin.rotate(-90, points.waistFacingF)
        )
        points.waistFacingECp1 = utils.beamsIntersect(
          points.hemECp1,
          points.origin,
          points.waistFacingE,
          points.origin.rotate(90, points.waistFacingE)
        )
        const drawWaistFacing = () => {
          if (options.sideDart == 'dart') {
            if (options.style == 'straight') {
              return new Path()
                .move(points.waistFacingCrossS)
                .line(points.waistFacing6S)
                .curve(points.waistFacing6SCp2, points.waistFacingFCp1, points.waistFacingF)
                .curve(points.waistFacingFCp2, points.waistFacingECp1, points.waistFacingE)
            }
            if (options.style == 'bell') {
              return new Path()
                .move(points.waistFacing6B)
                .curve(points.waistFacing6BCp2, points.waistFacingFCp1, points.waistFacingF)
                .curve(points.waistFacingFCp2, points.waistFacingECp1, points.waistFacingE)
            }
            if (options.style == 'umbrella') {
              return new Path()
                .move(points.waistFacing6U)
                .curve(points.waistFacing6UCp2, points.waistFacingFCp1, points.waistFacingF)
                .curve(points.waistFacingFCp2, points.waistFacingECp1, points.waistFacingE)
            }
          } else {
            return new Path()
              .move(points.waistFacingF)
              .curve(points.waistFacingFCp2, points.waistFacingECp1, points.waistFacingE)
          }
        }
        paths.waistFacing = drawWaistFacing()
          .attr('class', 'interfacing')
          .attr('data-text', 'Waist Facing - Line')
          .attr('data-text-class', 'center')
      }

      if (sa) {
        let hemSa = sa * options.skirtHemWidth * 100
        let crossSa = sa * options.crossSaWidth * 100
        paths.hemFacingSa = drawHemBase()
          .offset(hemSa)
          .join(
            new Path()
              .move(points.hemE)
              .line(points.hemFacingE)
              .join(drawHemFacing().reverse())
              .line(drawHemBase().start())
              .offset(sa)
          )
          .close()
          .attr('class', 'interfacing sa')

        if (options.waistbandStyle == 'none') {
          if (options.style == 'straight' && options.sideDart == 'dart') {
            let crossSplit = paths.cross.split(points.waistFacingCrossS)
            for (let i in crossSplit) {
              paths['cross' + i] = crossSplit[i].hide()
            }
          }

          const drawWaistFacingSa = () => {
            if (options.sideDart == 'dart') {
              if (options.style == 'straight') {
                return new Path()
                  .move(points.waistFacingE)
                  .line(points.dartTipE)
                  .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
                  .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
                  .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
                  .line(points.dartTopF)
                  .line(points.waist3Right)
                  .curve(points.waist3Cp1, points.waist3Cp2, points.waist3LeftS)
                  .offset(sa)
                  .join(paths.cross0.offset(crossSa))
              }
              if (options.style == 'bell') {
                return new Path()
                  .move(points.waistFacingE)
                  .line(points.dartTipE)
                  .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
                  .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
                  .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
                  .line(points.dartTopF)
                  .line(points.waist3Right)
                  .curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
                  .line(points.waistFacing6B)
                  .offset(sa)
              }
              if (options.style == 'umbrella') {
                return new Path()
                  .move(points.waistFacingE)
                  .line(points.dartTipE)
                  .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
                  .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
                  .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
                  .line(points.dartTopF)
                  .line(points.waist3Right)
                  .curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
                  .line(points.waistFacing6U)
                  .offset(sa)
              }
            } else {
              return new Path()
              move(points.waistFacingE)
                .line(points.dartTipE)
                .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
                .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
                .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
                .curve(points.dartTipF1, points.dartTipF2, points.dartTipF)
                .line(points.waistFacingF)
                .offset(sa)
            }
          }

          paths.waistFacingSa = paths.waistFacing
            .clone()
            .offset(sa * options.waistFacingHemWidth * 100)
            .join(drawWaistFacingSa())
            .close()
            .attr('class', 'interfacing sa')
        }

        const drawSaBase = () => {
          if (options.sideDart == 'dart') {
            if (options.style == 'straight') {
              return new Path()
                .move(points.hemE)
                .line(points.dartTipE)
                .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
                .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
                .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
                .line(points.dartTopF)
                .line(points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2, points.waist3LeftS)
                .offset(sa)
                .join(paths.cross.offset(crossSa))
                .join(
                  new Path()
                    .move(points.crossS)
                    .line(points.crossHemS)
                    .offset(sa * options.inseamSaWidth * 100)
                )
            }
            if (options.style == 'bell') {
              return new Path()
                .move(points.hemE)
                .line(points.dartTipE)
                .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
                .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
                .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
                .line(points.dartTopF)
                .line(points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
                .line(points.hemK)
                .offset(sa)
            }
            if (options.style == 'umbrella') {
              return new Path()
                .move(points.hemE)
                .line(points.dartTipE)
                .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
                .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
                .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
                .line(points.dartTopF)
                .line(points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
                .line(points.hemK)
                .offset(sa)
            }
          } else {
            return new Path()
              .move(points.hemE)
              .line(points.dartTipE)
              .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
              .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
              .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
              .curve(points.dartTipFCp1, points.dartTipFCp2, points.dartTipF)
              .line(points.hemF)
              .offset(sa)
          }
        }
        paths.sa = drawHemBase()
          .clone()
          .offset(hemSa)
          .join(drawSaBase())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
