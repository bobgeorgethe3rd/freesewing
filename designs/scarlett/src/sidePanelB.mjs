import { skirtBase } from './skirtBase.mjs'
export const sidePanelB = {
  name: 'scarlett.sidePanelB',
  from: skirtBase,
  hide: {
    from: true,
  },
  options: {},
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
    for (let i in paths) delete paths[i]
    //let's begin
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
      .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
      .hide()

    paths.cross = new Path()
      .move(points.waist3LeftS)
      .curve(points.seatK, points.crossSCp1, points.crossS)
      .hide()

    const drawSeamRight = () => {
      if (options.style == 'straight') {
        return new Path()
          .move(points.waist3Right)
          .curve(points.waist3Cp1, points.waist3Cp2, points.waist3LeftS)
          .join(paths.cross)
          .line(points.crossHemS)
      }
      if (options.style == 'bell') {
        return new Path()
          .move(points.waist3Right)
          .curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
          .line(points.hemK)
      }
      if (options.style == 'umbrella') {
        return new Path()
          .move(points.waist3Right)
          .curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
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
        points.waist3Cp1,
        points.waistF.dist(points.hemF) * 0.45
      )
      macro('title', {
        nr: '4b',
        title: titleName,
        at: points.title,
        rotation: 90 - points.hemF.angle(points.origin),
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

      paths.hemFacing = drawHemFacing()
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

      if (options.waistbandStyle == 'none') {
        const drawWaistFacing = () => {
          if (options.style == 'straight') {
            return new Path()
              .move(points.waistFacingCrossS)
              .line(points.waistFacing6S)
              .curve(points.waistFacing6SCp2, points.waistFacingFCp1, points.waistFacingF)
          }
          if (options.style == 'bell') {
            return new Path()
              .move(points.waistFacing6B)
              .curve(points.waistFacing6BCp2, points.waistFacingFCp1, points.waistFacingF)
          }
          if (options.style == 'umbrella') {
            return new Path()
              .move(points.waistFacing6U)
              .curve(points.waistFacing6UCp2, points.waistFacingFCp1, points.waistFacingF)
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
              .move(points.hemF)
              .line(points.hemFacingF)
              .join(drawHemFacing().reverse())
              .line(drawHemBase().start())
              .offset(sa)
          )
          .close()
          .attr('class', 'interfacing sa')

        if (options.waistbandStyle == 'none') {
          if (options.style == 'straight') {
            let crossSplit = paths.cross.split(points.waistFacingCrossS)
            for (let i in crossSplit) {
              paths['cross' + i] = crossSplit[i].hide()
            }
          }

          const drawWaistFacingSa = () => {
            if (options.style == 'straight') {
              return new Path()
                .move(points.waistFacingF)
                .line(points.dartTipF)
                .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2, points.waist3LeftS)
                .offset(sa)
                .join(paths.cross0.offset(crossSa))
            }
            if (options.style == 'bell') {
              return new Path()
                .move(points.waistFacingF)
                .line(points.dartTipF)
                .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
                .line(points.waistFacing6B)
                .offset(sa)
            }
            if (options.style == 'umbrella') {
              return new Path()
                .move(points.waistFacingF)
                .line(points.dartTipF)
                .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
                .line(points.waistFacing6U)
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
          if (options.style == 'straight') {
            return new Path()
              .move(points.hemF)
              .line(points.dartTipF)
              .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
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
              .move(points.hemF)
              .line(points.dartTipF)
              .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
              .curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
              .line(points.hemK)
              .offset(sa)
          }
          if (options.style == 'umbrella') {
            return new Path()
              .move(points.hemF)
              .line(points.dartTipF)
              .curve(points.dartTipFCp2, points.dartTipFCp3, points.waist3Right)
              .curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
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
