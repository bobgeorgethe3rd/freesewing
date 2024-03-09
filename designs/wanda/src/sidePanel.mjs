import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'

export const sidePanel = {
  name: 'wanda.sidePanel',
  from: skirtBase,
  after: pocket,
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
    //removing paths
    if (options.wandaGuides) {
      const keepThese = ['wandaGuide']
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //let's begin
    const drawHemBase = () => {
      if (options.sideDart == 'dart') {
        return new Path()
          .move(points.hemK)
          .curve(points.hemKCp2, points.hemFCp1, points.hemF)
          .curve(points.hemFCp2, points.hemECp1, points.hemE)
      } else {
        return new Path().move(points.hemF).curve(points.hemFCp2, points.hemECp1, points.hemE)
      }
    }

    let waist3Left
    let waist3LeftCp1
    if (options.skirtStyle == 'straight') {
      waist3Left = points.waist3LeftS
      waist3LeftCp1 = points.waist3LeftCp1
    } else {
      if (options.skirtStyle == 'umbrella') {
        waist3Left = points.waist6
        waist3LeftCp1 = points.waist3LeftCp1U
      } else {
        waist3Left = points.waist6B
        waist3LeftCp1 = points.waist3LeftCp1B
      }
    }
    paths.saRight = new Path()
      .move(points.hemE)
      .line(points.dartTipE)
      .curve(points.dartTipECp, points.waist2RightCp1, points.waist2Right)
      .hide()

    paths.saWaist = new Path()
      .move(points.waist2Right)
      .curve(points.waist2RightCp2, points.waistPanel2Cp1, points.waistPanel2)
      .curve(points.waistPanel2Cp2, points.waist2LeftCp1, points.waist2Left)
      .hide()

    const drawSeam = () => {
      if (options.sideDart == 'dart') {
        return new Path()
          .move(points.waist2Left)
          .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
          .curve(points.dartTipFCp, points.waist3RightCp1, points.waist3Right)
          .curve(points.waist3RightCp2, waist3LeftCp1, waist3Left)
          .line(points.hemK)
      } else {
        return new Path()
          .move(points.waist2Left)
          .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
          .line(points.hemF)
      }
    }

    //paths
    paths.seam = drawHemBase().join(paths.saRight).join(paths.saWaist).join(drawSeam()).close()

    if (complete) {
      //grainline
      if (
        options.closurePosition != 'back' &&
        options.cbSaWidth == 0 &&
        options.skirtStyle == 'straight' &&
        options.sideDart == 'dart'
      ) {
        points.cutOnFoldFrom = points.waist3LeftS
        points.cutOnFoldTo = points.hemK
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.waistE.shiftFractionTowards(points.hemE, 0.025)
        points.grainlineTo = points.hemE.shiftFractionTowards(points.waistE, 0.025)
        macro('grainline', {
          from: points.waistE.rotate(90, points.grainlineFrom),
          to: points.hemE.rotate(-90, points.grainlineTo),
        })
      }
      //notches
      if (options.pocketsBool) {
        points.pocketOpeningTop = paths.saRight.reverse().shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = paths.saRight
          .reverse()
          .shiftAlong(store.get('pocketOpeningLength'))

        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //dart
      let titleNum
      let titleName
      if (options.sideDart == 'dart') {
        titleNum = 2

        paths.dart = new Path()
          .move(points.waist2Left)
          .line(points.dartTopF)
          .line(points.waist3Right)
          .attr('class', 'fabric help')

        if (options.skirtStyle == 'straight') {
          titleName = 'Back Panel'
        } else titleName = 'Side Panel'
      } else {
        titleNum = '2a'
        if (options.skirtStyle == 'straight') {
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
        scale: 0.5,
      })
      //facings
      const drawHemFacing = () => {
        if (options.sideDart == 'dart') {
          return new Path()
            .move(points.hemFacingK)
            .curve(points.hemFacingKCp1, points.hemFacingFCp2, points.hemFacingF)
            .curve(points.hemFacingFCp1, points.hemFacingECp2, points.hemFacingE)
        } else {
          return new Path()
            .move(points.hemFacingF)
            .curve(points.hemFacingFCp1, points.hemFacingECp2, points.hemFacingE)
        }
      }
      if (options.skirtHemFacings) {
        points.hemFacingE = points.hemE.shiftTowards(
          points.waistE,
          store.get('skirtHemFacingWidth')
        )
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
        paths.hemFacing = drawHemFacing()
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }
      //pleats
      if (options.pleats && options.sideDart == 'dart') {
        const pleatKeep = store.get('pleatKeep')
        const pleatLengthStraight = store.get('pleatLengthStraight')
        const pleatLengthBell = store.get('pleatLengthBell')
        const pleatLengthUmbrella = store.get('pleatLengthUmbrella')

        paths.pleatLine = new Path()
          .move(points.waist3Right)
          .curve(points.waist3RightCp2, waist3LeftCp1, waist3Left)
          .hide()

        for (let i = 0; i < options.pleatNumber; i++) {
          if (options.skirtStyle == 'straight') {
            paths['pleatFromS' + i] = new Path()
              .move(points['pleatFromTopS' + i])
              .line(points['pleatFromBottomS' + i])
              .attr('class', 'mark lashed')
              .attr('data-text', 'Pleat - From')
              .attr('data-text-class', 'center')

            paths['pleatToS' + i] = new Path()
              .move(points['pleatToTopS' + (i + 1)])
              .line(points['pleatToBottomS' + (i + 1)])
              .attr('class', 'mark')
              .attr('data-text', 'Pleat. Fold - To')
              .attr('data-text-class', 'center')
          }
          if (options.skirtStyle == 'bell') {
            if (pleatKeep + (pleatKeep + pleatLengthBell) * i < paths.pleatLine.length()) {
              paths['pleatFromB' + i] = new Path()
                .move(points['pleatFromTopB' + i])
                .line(points['pleatFromBottomB' + i])
                .attr('class', 'mark lashed')
                .attr('data-text', 'Pleat - From')
                .attr('data-text-class', 'center')
            }
            if ((pleatKeep + pleatLengthBell) * (i + 1) < paths.pleatLine.length()) {
              paths['pleatToB' + i] = new Path()
                .move(points['pleatToTopB' + (i + 1)])
                .line(points['pleatToBottomB' + (i + 1)])
                .attr('class', 'mark')
                .attr('data-text', 'Pleat. Fold - To')
                .attr('data-text-class', 'center')
            }
          }
          if (options.skirtStyle == 'umbrella') {
            if (pleatKeep + (pleatKeep + pleatLengthUmbrella) * i < paths.pleatLine.length()) {
              paths['pleatFromU' + i] = new Path()
                .move(points['pleatFromTopU' + i])
                .line(points['pleatFromBottomU' + i])
                .attr('class', 'mark lashed')
                .attr('data-text', 'Pleat - From')
                .attr('data-text-class', 'center')
            }
            if ((pleatKeep + pleatLengthUmbrella) * (i + 1) < paths.pleatLine.length()) {
              paths['pleatToU' + i] = new Path()
                .move(points['pleatToTopU' + (i + 1)])
                .line(points['pleatToBottomU' + (i + 1)])
                .attr('class', 'mark')
                .attr('data-text', 'Pleat. Fold - To')
                .attr('data-text-class', 'center')
            }
          }
        }
      }

      if (sa) {
        const closureSa = sa * options.closureSaWidth * 100
        let cbSa
        if (options.closurePosition == 'back' && options.skirtStyle == 'straight') {
          cbSa = closureSa
        } else {
          if (options.skirtStyle == 'straight') {
            cbSa = sa * options.cbSaWidth * 100
          } else {
            cbSa = sa
          }
        }
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
          sideSeamSa = closureSa
        }

        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }
        points.saHemE = points.hemE
          .shift(points.hemECp1.angle(points.hemE), sideSeamSa)
          .shift(points.dartTipE.angle(points.hemE), hemSa)

        points.saWaist2Right = points.waist2Right
          .shift(points.waist2RightCp2.angle(points.waist2Right), sideSeamSa)
          .shift(points.waist2RightCp1.angle(points.waist2Right), sa)

        points.saDartTopF = utils.beamsIntersect(
          points.waist2LeftCp1
            .shiftTowards(points.waist2Left, sa)
            .rotate(-90, points.waist2LeftCp1),
          points.waist2Left.shiftTowards(points.waist2LeftCp1, sa).rotate(90, points.waist2Left),
          points.dartTipF,
          points.dartTopF
        )

        points.saWaist3Left = waist3Left
          .shift(points.hemK.angle(waist3Left), sa)
          .shift(waist3LeftCp1.angle(waist3Left), cbSa)

        points.saHemK = points.hemK
          .shift(points.hemKCp2.angle(points.hemK), cbSa)
          .shift(waist3Left.angle(points.hemK), hemSa)

        points.saWaist2Left = points.waist2Left
          .shift(points.waist2LeftCp1.angle(points.waist2Left), sa)
          .shift(points.waist2LeftCp2.angle(points.waist2Left), sa)

        points.saHemF = points.hemF
          .shift(points.hemFCp2.angle(points.hemF), sa)
          .shift(points.dartTipF.angle(points.hemF), hemSa)

        const drawSaBase = () => {
          if (options.sideDart == 'dart') {
            return new Path()
              .move(paths.saWaist.offset(sa).end())
              .line(points.saDartTopF)
              .join(
                new Path()
                  .move(points.dartTopF)
                  .line(points.waist3Right)
                  .curve(points.waist3RightCp2, waist3LeftCp1, waist3Left)
                  .offset(sa)
              )
              .line(points.saWaist3Left)
              .line(points.saHemK)
          } else {
            return new Path()
              .move(paths.saWaist.offset(sa).end())
              .line(points.saWaist2Left)
              .join(
                new Path()
                  .move(points.waist2Left)
                  .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
                  .offset(sa)
              )
              .line(points.saHemF)
          }
        }

        if (options.skirtHemFacings) {
          points.saHemFacingE = points.hemFacingE
            .shift(points.hemE.angle(points.hemFacingE), sa)
            .shift(points.hemFacingECp2.angle(points.hemFacingE), sideSeamSa)

          points.saHemFacingF = points.hemFacingF
            .shift(points.hemF.angle(points.hemFacingF), sa)
            .shift(points.hemFacingFCp1.angle(points.hemFacingF), sa)

          points.saHemFacingK = points.hemFacingK
            .shift(points.hemFacingKCp1.angle(points.hemFacingK), cbSa)
            .shift(points.hemK.angle(points.hemFacingK), sa)

          let saHemFacing = points.saHemFacingF
          let saHemEnd = points.saHemF
          if (options.sideDart == 'dart') {
            saHemFacing = points.saHemFacingK
            saHemEnd = points.saHemK
          }

          paths.hemFacingSa = drawHemBase()
            .offset(hemSa)
            .line(points.saHemE)
            .line(points.saHemFacingE)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(saHemFacing)
            .line(saHemEnd)
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = drawHemBase()
          .offset(hemSa)
          .line(points.saHemE)
          .join(paths.saRight.offset(sideSeamSa))
          .line(points.saWaist2Right)
          .join(paths.saWaist.offset(sa))
          .join(drawSaBase())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
