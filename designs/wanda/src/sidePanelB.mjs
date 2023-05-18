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
    for (let i in paths) delete paths[i]
    //let's begin
    let waist3Left
    let waist3Cp2
    if (options.style == 'straight') {
      waist3Left = points.waist3LeftS
      waist3Cp2 = points.waist3Cp2
    } else {
      if (options.style == 'umbrella') {
        waist3Left = points.waist6
        waist3Cp2 = points.waist3Cp2U
      } else {
        waist3Left = points.waist6B
        waist3Cp2 = points.waist3Cp2B
      }
    }

    //paths
    paths.saBase = new Path()
      .move(points.hemF)
      .line(points.dartTipF)
      .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
      .curve(points.waist3Cp1, waist3Cp2, waist3Left)
      .line(points.hemK)
      .hide()

    paths.hemBase = new Path()
      .move(points.hemK)
      .curve(points.hemKCp2, points.hemFCp1, points.hemF)
      .hide()

    paths.seam = paths.hemBase.join(paths.saBase).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistF.shiftFractionTowards(points.hemF, 0.025)
      points.grainlineTo = points.hemF.shiftFractionTowards(points.waistF, 0.025)
      macro('grainline', {
        from: points.waistF.rotate(90, points.grainlineFrom),
        to: points.hemF.rotate(-90, points.grainlineTo),
      })
      //title
      let titleName
      if (options.style == 'straight') {
        titleName = 'Back Panel B'
      } else titleName = 'Side Panel B'
      points.title = points.waist3Right.shiftFractionTowards(points.hemFacingKCp1, 0.5)
      macro('title', {
        nr: '2b',
        title: titleName,
        at: points.title,
        rotation: 90 - points.hemF.angle(points.origin),
      })
      //facings
      paths.hemFacing = new Path()
        .move(points.hemFacingK)
        .curve(points.hemFacingKCp1, points.hemFacingFCp2, points.hemFacingF)
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

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
          .curve(points.waist3Cp1, waist3Cp2, waist3Left)
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
        const hemSa = sa * options.skirtHemWidth * 100

        paths.hemFacingSa = paths.hemBase
          .clone()
          .offset(hemSa)
          .join(
            new Path()
              .move(points.hemF)
              .line(points.hemFacingF)
              .join(paths.hemFacing.reverse())
              .line(points.hemK)
              .offset(sa)
          )
          .attr('class', 'interfacing sa')

        if (options.waistbandStyle == 'none') {
          paths.waistFacingSa = paths.waistFacing
            .clone()
            .offset(sa * options.waistFacingHemWidth * 100)
            .join(
              new Path()
                .move(points.waistFacingF)
                .line(points.dartTipF)
                .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
                .curve(points.waist3Cp1, waist3Cp2, waist3Left)
                .line(paths.waistFacing.start())
                .offset(sa)
            )
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .join(paths.saBase.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
