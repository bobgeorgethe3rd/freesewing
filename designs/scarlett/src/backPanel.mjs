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
    if (options.wandaGuides) {
      const keepThese = ['wandaGuide']
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //let's begin
    if (options.style == 'bell') {
      paths.bellWaist = new Path()
        .move(points.waist6B)
        .curve(points.waist6Cp2B, points.waistEndCp2B, points.waistEndB)
        .split(points.waistL)[0]
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
        return new Path().move(points.hemK).line(points.waist6B).join(paths.bellWaist)
      } else {
        return new Path()
          .move(points.hemK)
          .line(points.waist6)
          .curve(points.waist6Cp2, points.waistHCp1, points.waistH)
      }
    }

    const drawCross = () => {
      if (options.style == 'bell') {
        return new Path()
          .move(points.waistL)
          .curve(points.waistLCp2, points.crossBCp1, points.crossB)
      } else {
        return new Path()
          .move(points.waistH)
          .curve(points.waistMCp2, points.crossUCp1, points.crossU)
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
      points.title = points.waist6Cp2B.shiftFractionTowards(points.hemKCp1B, 0.5)
      macro('title', {
        nr: 11,
        title: 'Back Panel',
        at: points.title,
        rotation: 90 - points.hemK.angle(points.origin),
        scale: 0.5,
      })
      //facings
      const skirtHemFacingWidth = store.get('skirtHemFacingWidth')
      const drawHemFacing = () => {
        if (options.style == 'bell') {
          return new Path()
            .move(points.crossFacingB)
            .line(points.hemFacingL)
            .curve(points.hemFacingLCp1, points.hemFacingKCp2B, points.hemFacingK)
        } else {
          return new Path()
            .move(points.crossFacingU)
            .line(points.hemFacingM)
            .curve(points.hemFacingMCp1, points.hemFacingKCp2U, points.hemFacingK)
        }
      }
      if (options.skirtHemFacings) {
        points.crossFacingB = points.crossHemB.shiftTowards(points.crossB, skirtHemFacingWidth)
        points.hemFacingL = points.hemLB.shiftTowards(points.waistL, skirtHemFacingWidth)
        points.hemFacingLCp1 = utils.beamsIntersect(
          points.crossFacingB,
          points.hemFacingL,
          points.hemLCp2B,
          points.origin
        )
        points.hemFacingKCp2B = utils.beamsIntersect(
          points.hemFacingKCp1,
          points.hemFacingK,
          points.hemKCp1B,
          points.origin
        )

        points.crossFacingU = points.crossHemU.shiftTowards(points.crossU, skirtHemFacingWidth)
        points.hemFacingM = points.hemMU.shiftTowards(points.waistH, skirtHemFacingWidth)
        points.hemFacingMCp1 = utils.beamsIntersect(
          points.crossFacingU,
          points.hemFacingM,
          points.hemMCp2U,
          points.origin
        )
        points.hemFacingKCp2U = utils.beamsIntersect(
          points.hemFacingKCp1,
          points.hemFacingK,
          points.hemKCp1U,
          points.origin
        )
        paths.hemFacing = drawHemFacing()
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }
      //pleats
      if (options.pleats) {
        const pleatKeep = store.get('pleatKeep')
        const pleatLengthBell = store.get('pleatLengthBell')
        const pleatLengthUmbrella = store.get('pleatLengthUmbrella')

        for (let i = 0; i < options.pleatNumber; i++) {
          if (options.style == 'bell') {
            if (
              pleatKeep + (pleatKeep + pleatLengthBell) * i >
              new Path()
                .move(points.waist3Right)
                .curve(points.waist3RightCp2, points.waist3LeftCp1B, points.waist6B)
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
                .curve(points.waist3RightCp2, points.waist3LeftCp1B, points.waist6B)
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
                .curve(points.waist3RightCp2, points.waist3LeftCp1U, points.waist6)
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
                .curve(points.waist3RightCp2, points.waist3LeftCp1U, points.waist6)
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
        const crossSeamSa = sa * options.crossSeamSaWidth * 100
        const inseamSa = sa * options.inseamSaWidth * 100
        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }
        if (options.skirtHemFacings) {
          paths.hemFacingSa = drawHemBase()
            .offset(hemSa)
            .join(
              new Path()
                .move(drawHemBase().end())
                .line(paths.hemFacing.end())
                .join(paths.hemFacing.reverse())
                .offset(sa)
            )
            .join(
              new Path().move(paths.hemFacing.start()).line(drawHemBase().start()).offset(inseamSa)
            )
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = drawHemBase()
          .offset(hemSa)
          .join(drawSaBase().offset(sa))
          .join(drawCross().offset(crossSeamSa))
          .join(drawInseam().offset(inseamSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
