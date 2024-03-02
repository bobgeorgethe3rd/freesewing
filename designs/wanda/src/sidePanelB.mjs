import { skirtBase } from './skirtBase.mjs'

export const sidePanelB = {
  name: 'wanda.sidePanelB',
  from: skirtBase,
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
    if (options.sideDart != 'seam') {
      part.hide()
      return part
    }
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
    if (options.style == 'straight') {
      waist3Left = points.waist3LeftS
      waist3LeftCp1 = points.waist3LeftCp1
    } else {
      if (options.style == 'umbrella') {
        waist3Left = points.waist6
        waist3LeftCp1 = points.waist3LeftCp1U
      } else {
        waist3Left = points.waist6B
        waist3LeftCp1 = points.waist3LeftCp1B
      }
    }

    //paths
    paths.saRight = new Path()
      .move(points.hemF)
      .line(points.dartTipF)
      .curve(points.dartTipFCp, points.waist3RightCp1, points.waist3Right)
      .hide()

    paths.saWaist = new Path()
      .move(points.waist3Right)
      .curve(points.waist3RightCp2, waist3LeftCp1, waist3Left)
      .hide()

    paths.hemBase = new Path()
      .move(points.hemK)
      .curve(points.hemKCp2, points.hemFCp1, points.hemF)
      .hide()

    paths.seam = paths.hemBase.join(paths.saRight).join(paths.saWaist).line(points.hemK).close()

    if (complete) {
      //grainline
      if (
        options.closurePosition != 'back' &&
        options.cbSaWidth == 0 &&
        options.style == 'straight'
      ) {
        points.cutOnFoldFrom = points.waist3LeftS
        points.cutOnFoldTo = points.hemK
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.waistF.shiftFractionTowards(points.hemF, 0.025)
        points.grainlineTo = points.hemF.shiftFractionTowards(points.waistF, 0.025)
        macro('grainline', {
          from: points.waistF.rotate(90, points.grainlineFrom),
          to: points.hemF.rotate(-90, points.grainlineTo),
        })
      }
      //title
      let titleName
      if (options.style == 'straight') {
        titleName = 'Back Panel B'
      } else titleName = 'Side Panel B'
      points.title = points.waist3Right.shiftFractionTowards(points.hemFCp1, 0.5)
      macro('title', {
        nr: '2b',
        title: titleName,
        at: points.title,
        rotation: 90 - points.hemF.angle(points.origin),
        scale: 0.5,
      })
      //facings
      if (options.skirtHemFacings) {
        paths.hemFacing = new Path()
          .move(points.hemFacingK)
          .curve(points.hemFacingKCp1, points.hemFacingFCp2, points.hemFacingF)
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }

      if (options.waistbandStyle == 'none') {
        let waistFacing6
        let waistFacing6Cp2
        if (options.style == 'straight') {
          waistFacing6 = points.waistFacing6S
          waistFacing6Cp2 = points.waistFacing6SCp2
        } else {
          if (options.style == 'umbrella') {
            waistFacing6 = points.waistFacing6U
            waistFacing6Cp2 = points.waistFacing6UCp2
          } else {
            waistFacing6 = points.waistFacing6B
            waistFacing6Cp2 = points.waistFacing6BCp2
          }
        }

        paths.waistFacing = new Path()
          .move(waistFacing6)
          .curve(waistFacing6Cp2, points.waistFacingFCp1, points.waistFacingF)
          .attr('class', 'interfacing')
          .attr('data-text', 'Waist Facing - Line')
          .attr('data-text-class', 'center')
      }
      //pleats
      if (options.pleats) {
        const pleatKeep = store.get('pleatKeep')
        const pleatLengthStraight = store.get('pleatLengthStraight')
        const pleatLengthBell = store.get('pleatLengthBell')
        const pleatLengthUmbrella = store.get('pleatLengthUmbrella')

        paths.pleatLine = new Path()
          .move(points.waist3Right)
          .curve(points.waist3RightCp2, waist3LeftCp1, waist3Left)
          .hide()

        for (let i = 0; i < options.pleatNumber; i++) {
          if (options.style == 'straight') {
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
          if (options.style == 'bell') {
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
          if (options.style == 'umbrella') {
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
        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }
        let cbSa
        if (options.closurePosition == 'back' && options.style == 'straight') {
          cbSa = sa * options.closureSaWidth * 100
        } else {
          if (options.style == 'straight') {
            cbSa = sa * options.cbSaWidth * 100
          } else {
            cbSa = sa
          }
        }
        points.saHemF = points.hemF
          .shift(points.hemFCp1.angle(points.hemF), sa)
          .shift(points.dartTipF.angle(points.hemF), hemSa)

        points.saWaist3Right = points.waist3Right
          .shift(points.waist3RightCp1.angle(points.waist3Right), sa)
          .shift(points.waist3RightCp2.angle(points.waist3Right), sa)

        points.saWaist3Left = waist3Left
          .shift(points.hemK.angle(waist3Left), sa)
          .shift(waist3LeftCp1.angle(waist3Left), cbSa)

        points.saHemK = points.hemK
          .shift(points.hemKCp2.angle(points.hemK), cbSa)
          .shift(waist3Left.angle(points.hemK), hemSa)

        if (options.skirtHemFacings) {
          points.saHemFacingF = points.hemFacingF
            .shift(points.hemF.angle(points.hemFacingF), sa)
            .shift(points.hemFacingFCp2.angle(points.hemFacingF), sa)

          points.saHemFacingK = points.hemFacingK
            .shift(points.hemFacingKCp1.angle(points.hemFacingK), cbSa)
            .shift(points.hemK.angle(points.hemFacingK), sa)

          paths.hemFacingSa = paths.hemBase
            .clone()
            .offset(hemSa)
            .line(points.saHemF)
            .line(points.saHemFacingF)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacingK)
            .line(points.saHemK)
            .attr('class', 'interfacing sa')
        }
        if (options.waistbandStyle == 'none') {
          paths.waistFacingSa = paths.waistFacing
            .clone()
            .offset(sa * options.waistFacingHemWidth * 100)
            .join(
              new Path()
                .move(points.waistFacingF)
                .line(points.dartTipF)
                .curve(points.dartTipFCp, points.waist3RightCp1, points.waist3Right)
                .curve(points.waist3RightCp2, waist3LeftCp1, waist3Left)
                .line(paths.waistFacing.start())
                .offset(sa)
            )
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saHemF)
          .join(paths.saRight.offset(sa))
          .line(points.saWaist3Right)
          .join(paths.saWaist.offset(sa))
          .line(points.saWaist3Left)
          .line(points.saHemK)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
