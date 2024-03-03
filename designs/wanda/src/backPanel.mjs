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
      if (options.style == 'bell') {
        return new Path().move(points.hemL).curve(points.hemLCp2, points.hemKCp1B, points.hemK)
      } else {
        return new Path().move(points.hemN).curve(points.hemNCp2, points.hemKCp1U, points.hemK)
      }
    }

    const drawSaWaist = () => {
      if (options.style == 'bell') {
        return new Path()
          .move(points.waist6B)
          .curve(points.waist6Cp2B, points.waistEndCp2B, points.waistEndB)
          .split(points.waistL)[0]
      } else {
        return new Path()
          .move(points.waist6)
          .curve(points.waist6Cp2, points.waistHCp1, points.waistH)
      }
    }

    points.drawHemBaseStart = drawHemBase().start()
    //paths
    paths.seam = drawHemBase()
      .line(drawSaWaist().start())
      .join(drawSaWaist())
      .line(points.drawHemBaseStart)
      .close()

    if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        if (options.style == 'bell') {
          points.cutOnFoldFrom = points.waistL
          points.cutOnFoldTo = points.hemL
        } else {
          points.cutOnFoldFrom = points.waistH
          points.cutOnFoldTo = points.hemN
        }
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.waist6.shiftFractionTowards(points.hemK, 0.025)
        points.grainlineTo = points.hemK.shiftFractionTowards(points.waist6, 0.025)
        macro('grainline', {
          from: points.waist6.rotate(90, points.grainlineFrom),
          to: points.hemK.rotate(-90, points.grainlineTo),
        })
      }
      //title
      points.title = points.waist6Cp2B.shiftFractionTowards(points.hemKCp1B, 0.5)
      macro('title', {
        nr: '3',
        title: 'Back Panel',
        at: points.title,
        rotation: 90 - points.hemK.angle(points.origin),
        scale: 0.5,
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
        if (options.skirtHemFacings) {
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
        }
      } else {
        lineFrom = points.hemN
        lineTo = points.waistH
        if (options.skirtHemFacings) {
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
      }
      if (options.skirtHemFacings) {
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
        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }
        let cbSa
        if (options.closurePosition == 'back') {
          cbSa = sa * options.closureSaWidth * 100
        } else {
          cbSa = sa * options.cbSaWidth * 100
        }

        points.saHemK = points.hemK
          .shift(points.hemKCp1B.angle(points.hemK), sa)
          .shift(points.waist6.angle(points.hemK), hemSa)

        points.drawSaWaistEnd = drawSaWaist().end()

        points.saWaist3Left = drawSaWaist()
          .start()
          .shift(points.hemK.angle(points.waist6), sa)
          .shift(points.hemK.angle(points.waist6) - 90, sa)

        points.saWaistEnd = utils.beamsIntersect(
          drawSaWaist().offset(sa).end(),
          drawSaWaist().offset(sa).shiftFractionAlong(0.995),
          points.drawSaWaistEnd
            .shiftTowards(points.drawHemBaseStart, cbSa)
            .rotate(-90, points.drawSaWaistEnd),
          points.drawHemBaseStart
            .shiftTowards(points.drawSaWaistEnd, cbSa)
            .rotate(90, points.drawHemBaseStart)
        )
        if (points.saWaistEnd.y > drawSaWaist().offset(sa).end().y) {
          points.saWaistEnd = points.drawSaWaistEnd.shift(
            points.drawHemBaseStart.angle(points.drawSaWaistEnd) + 90,
            cbSa
          )
        }

        points.saHemStart = utils.beamsIntersect(
          points.drawSaWaistEnd
            .shiftTowards(points.drawHemBaseStart, cbSa)
            .rotate(-90, points.drawSaWaistEnd),
          points.drawHemBaseStart
            .shiftTowards(points.drawSaWaistEnd, cbSa)
            .rotate(90, points.drawHemBaseStart),
          drawHemBase().offset(hemSa).start(),
          drawHemBase().offset(sa).shiftFractionAlong(0.005)
        )

        if (options.skirtHemFacings) {
          points.saHemFacingK = points.hemFacingK
            .shift(hemFacingCp1.angle(points.hemFacingK), sa)
            .shift(points.hemK.angle(points.hemFacingK), sa)

          points.saHemFacing = utils.beamsIntersect(
            paths.hemFacing.reverse().offset(sa).shiftFractionAlong(0.995),
            paths.hemFacing.reverse().offset(sa).end(),
            points.saWaistEnd,
            points.saHemStart
          )
          if (points.saHemFacing.y > paths.hemFacing.reverse().offset(sa).end().y) {
            points.saHemFacing = points.hemFacingSplit.shift(
              points.drawHemBaseStart.angle(points.drawSaWaistEnd) + 90,
              cbSa
            )
          }
          paths.hemFacingSa = drawHemBase()
            .offset(hemSa)
            .line(points.saHemK)
            .line(points.saHemFacingK)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacing)
            .line(points.saHemStart)
            .attr('class', 'interfacing sa')
        }

        paths.sa = drawHemBase()
          .offset(hemSa)
          .line(points.saHemK)
          .line(points.saWaist3Left)
          .join(drawSaWaist().offset(sa))
          .line(points.saWaistEnd)
          .line(points.saHemStart)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
