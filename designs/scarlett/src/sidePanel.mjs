import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'

export const sidePanel = {
  name: 'scarlett.sidePanel',
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

    const drawHemBase = () => {
      if (options.sideDart == 'dart') {
        if (options.skirtStyle == 'straight') {
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

    paths.saRight = new Path()
      .move(points.hemE)
      .line(points.dartTipE)
      .curve(points.dartTipECp, points.waist2RightCp1, points.waist2Right)
      .hide()

    paths.saWaistRight = new Path()
      .move(points.waist2Right)
      .curve(points.waist2RightCp2, points.waistPanel2Cp1, points.waistPanel2)
      .curve(points.waistPanel2Cp2, points.waist2LeftCp1, points.waist2Left)
      .hide()

    paths.dartRight = new Path()
      .move(points.waist2Left)
      .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
      .hide()

    paths.dartLeft = new Path()
      .move(points.dartTipF)
      .curve(points.dartTipFCp, points.waist3RightCp1, points.waist3Right)
      .hide()

    paths.saWaistLeft = new Path()
      .move(points.waist3Right)
      .curve(points.waist3RightCp2, waist3LeftCp1, waist3Left)
      .hide()

    paths.cross = new Path()
      .move(points.waist3LeftS)
      .curve(points.waist3LeftCp2, points.crossSCp1, points.crossS)
      .hide()

    const drawSeamLeft = () => {
      if (options.sideDart == 'dart') {
        if (options.skirtStyle == 'straight') {
          return paths.dartLeft.join(paths.saWaistLeft).join(paths.cross).line(points.crossHemS)
        } else {
          return paths.dartLeft.join(paths.saWaistLeft).line(points.hemK)
        }
      } else {
        return new Path().move(points.dartTipF).line(points.hemF)
      }
    }

    //paths
    paths.seam = drawHemBase()
      .clone()
      .join(paths.saRight)
      .join(paths.saWaistRight)
      .join(paths.dartRight)
      .join(drawSeamLeft())
      .close()

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
        points.pocketOpeningTop = paths.saRight.reverse().shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = paths.saRight
          .reverse()
          .shiftAlong(store.get('pocketOpeningLength'))

        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      if (options.skirtStyle == 'straight') {
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

        if (options.skirtStyle == 'straight') {
          titleName = 'Back Panel'
        } else titleName = 'Side Panel'
      } else {
        titleNum = '4a'
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
          if (options.skirtStyle == 'straight') {
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
        let crossSeamSa = sa
        let inseamSa = sa
        if (options.skirtStyle == 'straight') {
          crossSeamSa = sa * options.crossSeamSaWidth * 100
          inseamSa = sa * options.inseamSaWidth * 100
        }
        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
          sideSeamSa = sa * options.closureSaWidth * 100
        }
        points.saHemE = points.hemE
          .shift(points.hemECp1.angle(points.hemE), sideSeamSa)
          .shift(points.dartTipE.angle(points.hemE), hemSa)

        points.saWaistRight2Right = points.waist2Right
          .shift(points.waist2RightCp1.angle(points.waist2Right), sa)
          .shift(points.waist2RightCp2.angle(points.waist2Right), sideSeamSa)

        points.saWaistRight2Left = points.waist2Left
          .shift(points.waist2LeftCp1.angle(points.waist2Left), sa)
          .shift(points.waist2LeftCp2.angle(points.waist2Left), sa)

        points.saHemF = points.hemF
          .shift(points.dartTipF.angle(points.hemF), sa)
          .shift(points.hemFCp2.angle(points.hemF), hemSa)

        points.saDartTopF = utils.beamsIntersect(
          points.saWaistRight2Left,
          points.saWaistRight2Left.shift(points.waist2LeftCp1.angle(points.waist2Left), 1),
          points.dartTipF,
          points.dartTopF
        )

        points.saWaist3Left = waist3Left
          .shift(points.hemK.angle(waist3Left), sa)
          .shift(waist3LeftCp1.angle(waist3Left), crossSeamSa)

        points.saCrossS = points.crossS
          .shift(points.crossSCp1.angle(points.crossS), crossSeamSa)
          .shift(points.crossHemS.angle(points.crossS), inseamSa)

        points.saCrossHemS = points.crossHemS
          .shift(points.hemKS.angle(points.crossHemS), inseamSa)
          .shift(points.crossS.angle(points.crossHemS), hemSa)

        points.saHemK = points.hemK
          .shift(points.hemKCp2.angle(points.hemK), sa)
          .shift(waist3Left.angle(points.hemK), hemSa)

        if (options.skirtHemFacings) {
          points.saHemFacingE = points.hemFacingE
            .shift(points.hemFacingECp2.angle(points.hemFacingE), sideSeamSa)
            .shift(points.hemE.angle(points.hemFacingE), sa)

          points.hemFacingStart = paths.hemFacing.start()
          points.hemStart = drawHemBase().start()

          points.saHemFacing = points.hemFacingStart
            .shift(points.hemStart.angle(points.hemFacingStart), sa)
            .shift(points.hemStart.angle(points.hemFacingStart) + 90, inseamSa)

          points.saHemStart = points.hemStart
            .shift(points.hemFacingStart.angle(points.hemStart) - 90, inseamSa)
            .shift(points.hemFacingStart.angle(points.hemStart), hemSa)

          paths.hemFacingSa = drawHemBase()
            .offset(hemSa)
            .line(points.saHemE)
            .line(points.saHemFacingE)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacing)
            .line(points.saHemStart)
            .close()
            .attr('class', 'interfacing sa')
        }

        const drawSaBase = () => {
          if (options.sideDart == 'dart') {
            if (options.skirtStyle == 'straight') {
              return new Path()
                .move(paths.saWaistRight.offset(sa).end())
                .line(points.saDartTopF)
                .join(paths.saWaistLeft.offset(sa))
                .line(points.saWaist3Left)
                .join(paths.cross.offset(crossSeamSa))
                .line(points.saCrossS)
                .line(points.saCrossHemS)
            } else {
              return new Path()
                .move(paths.saWaistRight.offset(sa).end())
                .line(points.saDartTopF)
                .join(paths.saWaistLeft.offset(sa))
                .line(points.saWaist3Left)
                .line(points.saHemK)
            }
          } else {
            return new Path()
              .move(points.saWaistRight2Left)
              .join(paths.dartRight.line(points.hemF).offset(sa))
              .line(points.saHemF)
          }
        }
        paths.sa = drawHemBase()
          .clone()
          .offset(hemSa)
          .line(points.saHemE)
          .join(paths.saRight.offset(sideSeamSa))
          .line(points.saWaistRight2Right)
          .join(paths.saWaistRight.offset(sa))
          .join(drawSaBase())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
