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
      points.title = points.waist6Cp2B.shiftFractionTowards(points.hemKCp1B, 0.5)
      macro('title', {
        nr: '5',
        title: 'Back Panel',
        at: points.title,
        rotation: 90 - points.hemK.angle(points.origin),
      })
      //facings
      const skirtHemFacingWidth = store.get('skirtHemFacingWidth')
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

      paths.hemFacing = drawHemFacing()
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')
      if (options.waistbandStyle == 'none') {
      }

      if (options.waistbandStyle == 'none') {
        let crossStart
        let crossSeat
        let crossCp1
        let crossEnd
        let waistFacingStart
        let waistFacingCp1
        let waistFacingCp2
        let waistFacingEnd
        if (options.style == 'bell') {
          crossStart = points.waistL
          crossSeat = points.seatL
          crossCp1 = points.crossBCp1
          crossEnd = points.crossB
          waistFacingStart = points.origin.shiftOutwards(
            points.waistEndB,
            points.waist6B.dist(points.waistFacing6B)
          )
          waistFacingEnd = points.waistFacing6B
          waistFacingCp1 = utils.beamsIntersect(
            points.origin,
            points.hemLCp2,
            waistFacingStart,
            points.origin.rotate(-90, waistFacingStart)
          )
          waistFacingCp2 = utils.beamsIntersect(
            points.origin,
            points.hemKCp1B,
            waistFacingEnd,
            points.origin.rotate(90, waistFacingEnd)
          )
        } else {
          crossStart = points.waistH
          crossSeat = points.seatM
          crossCp1 = points.crossUCp1
          crossEnd = points.crossU
          waistFacingEnd = points.cfWaistFacing
          waistFacingStart = points.origin.shiftOutwards(
            points.waistEnd,
            points.cfWaist.dist(points.cfWaistFacing)
          )
          waistFacingCp1 = utils.beamsIntersect(
            points.origin,
            points.waistCp2,
            waistFacingStart,
            points.origin.rotate(-90, waistFacingStart)
          )
          waistFacingCp2 = utils.beamsIntersect(
            points.origin,
            points.waistCp1,
            waistFacingEnd,
            points.origin.rotate(90, waistFacingEnd)
          )
        }

        points.waistFacingSplit = utils.curvesIntersect(
          crossStart,
          crossSeat,
          crossCp1,
          crossEnd,
          waistFacingStart,
          waistFacingCp1,
          waistFacingCp2,
          waistFacingEnd
        )

        if (options.style == 'bell') {
          paths.waistFacing = new Path()
            .move(waistFacingStart)
            .curve(waistFacingCp1, waistFacingCp2, waistFacingEnd)
            .split(points.waistFacingSplit)[1]
            .attr('class', 'interfacing')
            .attr('data-text', 'Waist Facing - Line')
            .attr('data-text-class', 'center')
            .unhide()
        } else {
          const waistFacingCpDistance =
            (4 / 3) *
            points.origin.dist(points.waistFacing6B) *
            Math.tan(
              utils.deg2rad(
                (points.origin.angle(points.waistFacing6U) -
                  points.origin.angle(points.waistFacingSplit)) /
                  4
              )
            )
          points.waistFacingCp1 = points.waistFacingSplit
            .shiftTowards(points.origin, waistFacingCpDistance)
            .rotate(-90, points.waistFacingSplit)
          points.waistFacingCp2 = points.waistFacing6U
            .shiftTowards(points.origin, waistFacingCpDistance)
            .rotate(90, points.waistFacing6U)

          paths.waistFacing = new Path()
            .move(points.waistFacingSplit)
            .curve(points.waistFacingCp1, points.waistFacingCp2, points.waistFacing6U)
            .attr('class', 'interfacing')
            .attr('data-text', 'Waist Facing - Line')
            .attr('data-text-class', 'center')
        }
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
        const hemSa = sa * options.skirtHemWidth * 100
        const crossSa = sa * options.crossSaWidth * 100
        const inseamSa = sa * options.inseamSaWidth * 100

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

        if (options.waistbandStyle == 'none') {
          const drawFacingSaBase = () => {
            if (options.style == 'bell') {
              return new Path()
                .move(points.waistFacing6B)
                .line(points.waist6B)
                .join(paths.bellWaist)
            } else {
              return new Path()
                .move(points.waistFacing6U)
                .line(points.waist6)
                .curve(points.waist6Cp2, points.waistHCp1, points.waistH)
            }
          }

          paths.crossFacing = drawCross().split(points.waistFacingSplit)[1]

          paths.waistFacingSa = paths.waistFacing
            .clone()
            .offset(hemSa)
            .join(drawSaBase().offset(sa))
            .join(paths.crossFacing.offset(crossSa))
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = drawHemBase()
          .offset(hemSa)
          .join(drawSaBase().offset(sa))
          .join(drawCross().offset(crossSa))
          .join(drawInseam().offset(inseamSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
