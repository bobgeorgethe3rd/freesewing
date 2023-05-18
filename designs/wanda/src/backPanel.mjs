import { skirtBase } from './skirtBase.mjs'

export const backPanel = {
  name: 'wanda.backPanel',
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
        .curve(points.waist6Cp1B, points.waistEndCp2B, points.waistEndB)
        .split(points.waistL)[0]
        .hide()
    }

    const drawHemBase = () => {
      if (options.style == 'bell') {
        return new Path().move(points.hemL).curve(points.hemLCp2, points.hemKCp1B, points.hemK)
      } else {
        return new Path().move(points.hemN).curve(points.hemNCp2, points.hemKCp1U, points.hemK)
      }
    }

    const drawSaBase = () => {
      if (options.style == 'bell') {
        return new Path()
          .move(points.hemK)
          .line(points.waist6B)
          .join(paths.bellWaist)
          .line(points.hemL)
      } else {
        return new Path()
          .move(points.hemK)
          .line(points.waist6)
          .curve(points.waist6Cp1, points.waistHCp2, points.waistH)
          .line(points.hemN)
      }
    }

    //paths
    paths.seam = drawHemBase().join(drawSaBase()).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waist6.shiftFractionTowards(points.hemK, 0.025)
      points.grainlineTo = points.hemK.shiftFractionTowards(points.waist6, 0.025)
      macro('grainline', {
        from: points.waist6.rotate(90, points.grainlineFrom),
        to: points.hemK.rotate(-90, points.grainlineTo),
      })
      //title
      points.title = points.waist6Cp1B.shiftFractionTowards(points.hemKCp1B, 0.5)
      macro('title', {
        nr: '3',
        title: 'Back Panel',
        at: points.title,
        rotation: 90 - points.hemK.angle(points.origin),
      })
      //facings
      const skirtHemFacingWidth = store.get('skirtHemFacingWidth')

      let lineFrom
      let lineTo
      let hemFacingEnd
      let hemFacingCp2
      let hemFacingCp1
      if (options.style == 'bell') {
        lineFrom = points.hemL
        lineTo = points.waistL
        hemFacingEnd = points.hemL.shiftTowards(points.origin, skirtHemFacingWidth)
        hemFacingCp2 = utils.beamsIntersect(
          points.hemLCp2,
          points.origin,
          hemFacingEnd,
          points.origin.rotate(-90, hemFacingEnd)
        )
        hemFacingCp1 = utils.beamsIntersect(
          points.hemKCp1B,
          points.origin,
          points.hemFacingK,
          points.origin.rotate(90, points.hemFacingK)
        )
      } else {
        lineFrom = points.hemN
        lineTo = points.waistH
        hemFacingEnd = points.hemN.shiftTowards(points.origin, skirtHemFacingWidth)
        hemFacingCp2 = utils.beamsIntersect(
          points.hemNCp2,
          points.origin,
          hemFacingEnd,
          points.origin.rotate(-90, hemFacingEnd)
        )
        hemFacingCp1 = utils.beamsIntersect(
          points.hemKCp1U,
          points.origin,
          points.hemFacingK,
          points.origin.rotate(90, points.hemFacingK)
        )
      }

      points.hemFacingSplit = utils.lineIntersectsCurve(
        lineFrom,
        lineTo,
        points.hemFacingK,
        hemFacingCp1,
        hemFacingCp2,
        hemFacingEnd
      )

      paths.hemFacing = new Path()
        .move(points.hemFacingK)
        .curve(hemFacingCp1, hemFacingCp2, hemFacingEnd)
        .split(points.hemFacingSplit)[0]
        .reverse()
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

      if (options.waistbandStyle == 'none') {
        let waistFacingStart
        let waistFacingCp1
        let waistFacingCp2
        let waistFacingEnd
        if (options.style == 'bell') {
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

        points.waistFacingSplit = utils.lineIntersectsCurve(
          lineFrom,
          lineTo,
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
        const hemSa = sa * options.skirtHemWidth * 100

        paths.hemFacingSa = drawHemBase()
          .offset(hemSa)
          .join(
            new Path()
              .move(points.hemFacingK)
              .join(paths.hemFacing.reverse())
              .line(drawHemBase().start())
              .offset(sa)
          )
          .attr('class', 'interfacing sa')

        if (options.waistbandStyle == 'none') {
          const drawWaistFacingSaBase = () => {
            if (options.style == 'bell') {
              return new Path()
                .move(points.waistFacing6B)
                .line(points.waist6B)
                .join(paths.bellWaist)
                .line(points.waistFacingSplit)
            } else {
              return new Path()
                .move(points.waistFacing6U)
                .line(points.waist6)
                .curve(points.waist6Cp1, points.waistHCp2, points.waistH)
                .line(points.waistFacingSplit)
            }
          }
          paths.waistFacingSa = paths.waistFacing
            .clone()
            .offset(sa * options.waistFacingHemWidth * 100)
            .join(drawWaistFacingSaBase().offset(sa))
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = drawHemBase()
          .offset(hemSa)
          .join(drawSaBase().offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
