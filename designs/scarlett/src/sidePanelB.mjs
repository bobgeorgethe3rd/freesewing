import { skirtBase } from './skirtBase.mjs'
export const sidePanelB = {
  name: 'scarlett.sidePanelB',
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
    //render
    if (options.sideDart == 'dart') {
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

    const drawHemBase = () => {
      if (options.style == 'straight') {
        return new Path()
          .move(points.crossHemS)
          .line(points.hemKS)
          .curve(points.hemKCp2S, points.hemFCp1, points.hemF)
      } else {
        return new Path().move(points.hemK).curve(points.hemKCp2, points.hemFCp1, points.hemF)
      }
    }
    paths.saBaseLeft = new Path()
      .move(points.hemF)
      .line(points.dartTipF)
      .curve(points.dartTipFCp, points.waist3RightCp1, points.waist3Right)
      .hide()

    paths.cross = new Path()
      .move(points.waist3LeftS)
      .curve(points.waist3LeftCp2, points.crossSCp1, points.crossS)
      .hide()

    const drawSeamRight = () => {
      if (options.style == 'straight') {
        return new Path()
          .move(points.waist3Right)
          .curve(points.waist3RightCp2, points.waist3LeftCp1, points.waist3LeftS)
          .join(paths.cross)
          .line(points.crossHemS)
      } else {
        return new Path()
          .move(points.waist3Right)
          .curve(points.waist3RightCp2, waist3LeftCp1, waist3Left)
          .line(points.hemK)
      }
    }

    //paths
    paths.seam = drawHemBase().clone().join(paths.saBaseLeft).join(drawSeamRight()).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistF.shiftFractionTowards(points.hemF, 0.025)
      points.grainlineTo = points.hemF.shiftFractionTowards(points.waistF, 0.025)
      macro('grainline', {
        from: points.waistF.rotate(90, points.grainlineFrom),
        to: points.hemF.rotate(-90, points.grainlineTo),
      })
      //notches
      if (options.style == 'straight') {
        points.crossNotch = paths.cross.shiftFractionAlong(0.4)
        snippets.crossNotch = new Snippet('bnotch', points.crossNotch)
      }
      //title
      let titleName
      if (options.style == 'straight') {
        titleName = 'Back Panel B'
      } else {
        titleName = 'Side Panel B'
      }
      points.title = points.origin.shiftOutwards(
        points.waist3RightCp2,
        points.waistF.dist(points.hemF) * 0.45
      )
      macro('title', {
        nr: '4b',
        title: titleName,
        at: points.title,
        rotation: 90 - points.hemF.angle(points.origin),
        scale: 0.5,
      })
      //facings
      const drawHemFacing = () => {
        if (options.style == 'straight') {
          return new Path()
            .move(points.crossHemFacingS)
            .line(points.hemFacingKS)
            .curve(points.hemFacingKCp1S, points.hemFacingFCp2, points.hemFacingF)
        } else {
          return new Path()
            .move(points.hemFacingK)
            .curve(points.hemFacingKCp1, points.hemFacingFCp2, points.hemFacingF)
        }
      }
      if (options.skirtHemFacings) {
        paths.hemFacing = drawHemFacing()
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
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
        const crossSeamSa = sa * options.crossSeamSaWidth * 100
        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }
        if (options.skirtHemFacings) {
          paths.hemFacingSa = drawHemBase()
            .offset(hemSa)
            .join(
              new Path()
                .move(points.hemF)
                .line(points.hemFacingF)
                .join(drawHemFacing().reverse())
                .line(drawHemBase().start())
                .offset(sa)
            )
            .close()
            .attr('class', 'interfacing sa')
        }

        const drawSaBase = () => {
          if (options.style == 'straight') {
            return new Path()
              .move(points.hemF)
              .line(points.dartTipF)
              .curve(points.dartTipFCp, points.waist3RightCp1, points.waist3Right)
              .curve(points.waist3RightCp2, points.waist3LeftCp1, points.waist3LeftS)
              .offset(sa)
              .join(paths.cross.offset(crossSeamSa))
              .join(
                new Path()
                  .move(points.crossS)
                  .line(points.crossHemS)
                  .offset(sa * options.inseamSaWidth * 100)
              )
          } else {
            return new Path()
              .move(points.hemF)
              .line(points.dartTipF)
              .curve(points.dartTipFCp, points.waist3RightCp1, points.waist3Right)
              .curve(points.waist3RightCp2, waist3LeftCp1, waist3Left)
              .line(points.hemK)
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
