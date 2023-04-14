import { skirtBase } from './skirtBase.mjs'
export const backPanel = {
  name: 'scarlett.backPanel',
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
    if (options.style == 'straight') {
      part.hide()
      return part
    }
    //removing paths
    for (let i in paths) delete paths[i]
    //let's begin
    if (options.style == 'bell') {
      let bellSplit = new Path()
        .move(points.waist6B)
        .curve(points.waist6Cp1B, points.waist6Cp2B, points.waistEndB)
        .split(points.waistL)
      for (let i in bellSplit) {
        paths['bellWaist' + i] = bellSplit[i].hide()
      }
    }

    const drawHemBase = () => {
      if (options.style == 'bell') {
        return new Path()
          .move(points.crossHemB)
          .line(points.hemLB)
          .curve(points.hemLCp2B, points.hemKCp1B, points.hemK)
      } else {
        return new Path()
          .move(points.crossHemU)
          .line(points.hemMU)
          .curve(points.hemMCp2U, points.hemKCp1U, points.hemK)
      }
    }

    const drawSaBase = () => {
      if (options.style == 'bell') {
        return new Path().move(points.hemK).line(points.waist6B).join(paths.bellWaist0)
      } else {
        return new Path()
          .move(points.hemK)
          .line(points.waist6B)
          .curve(points.waist6Cp1, points.waistHCp2, points.waistH)
      }
    }

    const drawCross = () => {
      if (options.style == 'bell') {
        return new Path().move(points.waistL).curve(points.seatL, points.crossBCp1, points.crossB)
      } else {
        return new Path().move(points.waistH).curve(points.seatM, points.crossUCp1, points.crossU)
      }
    }

    const drawInseam = () => {
      if (options.style == 'bell') {
        return new Path().move(points.crossB).line(points.crossHemB)
      } else {
        return new Path().move(points.crossU).line(points.crossHemU)
      }
    }

    //paths
    paths.seam = drawHemBase()
      .clone()
      .join(drawSaBase())
      .join(drawCross())
      .join(drawInseam())
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waist6.shiftFractionTowards(points.hemK, 0.025)
      points.grainlineTo = points.hemK.shiftFractionTowards(points.waist6B, 0.025)
      macro('grainline', {
        from: points.waist6.rotate(90, points.grainlineFrom),
        to: points.hemK.rotate(-90, points.grainlineTo),
      })
      //notches
      points.crossNotch = drawCross().shiftFractionAlong(0.45)
      snippets.crossNotch = new Snippet('bnotch', points.crossNotch)
      //title
      points.title = points.waist6Cp1B.shiftFractionTowards(points.hemKCp1B, 0.5)
      macro('title', {
        nr: '5',
        title: 'Back Panel',
        at: points.title,
        rotation: 90 - points.hemK.angle(points.origin),
      })
      //facings
      let skirtHemFacingWidth = store.get('skirtHemFacingWidth')
      points.crossFacingB = points.crossHemB.shiftTowards(points.crossB, skirtHemFacingWidth)
      points.hemFacingL = points.hemLB.shiftTowards(points.waistL, skirtHemFacingWidth)
      points.hemFacingLCp1

      points.crossFacingU = points.crossHemU.shiftTowards(points.crossU, skirtHemFacingWidth)
      points.hemFacingM = points.hemMU.shiftTowards(points.waistH, skirtHemFacingWidth)

      // paths.hemFacing = drawHemFacing()
      // .attr('class', 'interfacing')
      // .attr('data-text', 'Hem Facing - Line')
      // .attr('data-text-class', 'center')
      if (options.waistbandStyle == 'none') {
      }

      //pleats
      if (options.pleats) {
        let pleatKeep = store.get('pleatKeep')
        let pleatLengthBell = store.get('pleatLengthBell')
        let pleatLengthUmbrella = store.get('pleatLengthUmbrella')

        for (let i = 0; i < options.pleatNumber; i++) {
          if (options.style == 'bell') {
            if (
              pleatKeep + (pleatKeep + pleatLengthBell) * i >
              new Path()
                .move(points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
                .length()
            ) {
              paths['pleatFromB' + i] = new Path()
                .move(points['pleatFromTopB' + i])
                .line(points['pleatFromBottomB' + i])
                .attr('class', 'mark lashed')
                .attr('data-text', 'Pleat. Fold - From')
                .attr('data-text-class', 'center')
            }
            if (
              (pleatKeep + pleatLengthBell) * (i + 1) >
              new Path()
                .move(points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2B, points.waist6B)
                .length()
            ) {
              paths['pleatToB' + i] = new Path()
                .move(points['pleatToTopB' + (i + 1)])
                .line(points['pleatToBottomB' + (i + 1)])
                .attr('class', 'mark')
                .attr('data-text', 'Pleat. Fold - To')
                .attr('data-text-class', 'center')
            }
          }
          if (options.style == 'umbrella') {
            if (
              pleatKeep + (pleatKeep + pleatLengthUmbrella) * i >
              new Path()
                .move(points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
                .length()
            ) {
              paths['pleatFromU' + i] = new Path()
                .move(points['pleatFromTopU' + i])
                .line(points['pleatFromBottomU' + i])
                .attr('class', 'mark lashed')
                .attr('data-text', 'Pleat. Fold - From')
                .attr('data-text-class', 'center')
            }
            if (
              (pleatKeep + pleatLengthUmbrella) * (i + 1) >
              new Path()
                .move(points.waist3Right)
                .curve(points.waist3Cp1, points.waist3Cp2U, points.waist6)
                .length()
            ) {
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
        let crossSa = sa * options.crossSaWidth * 100

        if (options.waistbandStyle == 'none') {
        }
      }
    }

    return part
  },
}
