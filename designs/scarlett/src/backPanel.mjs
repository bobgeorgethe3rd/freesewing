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
    if (options.skirtStyle == 'straight') {
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
      if (options.skirtStyle == 'bell') {
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

    const drawSaWaist = () => {
      if (options.skirtStyle == 'bell') {
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

    const drawCross = () => {
      if (options.skirtStyle == 'bell') {
        return new Path()
          .move(points.waistL)
          .curve(points.waistLCp2, points.crossBCp1, points.crossB)
      } else {
        return new Path()
          .move(points.waistH)
          .curve(points.waistMCp2, points.crossUCp1, points.crossU)
      }
    }

    points.drawHemBaseStart = drawHemBase().start()
    //paths
    paths.seam = drawHemBase()
      .clone()
      .join(drawSaWaist())
      .join(drawCross())
      .line(points.drawHemBaseStart)
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
        cutNr: 2,
        rotation: 90 - points.hemK.angle(points.origin),
        scale: 0.5,
      })
      //facings
      const skirtHemFacingWidth = store.get('skirtHemFacingWidth')
      const drawHemFacing = () => {
        if (options.skirtStyle == 'bell') {
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
          if (options.skirtStyle == 'bell') {
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
          if (options.skirtStyle == 'umbrella') {
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

        points.saHemK = points.hemK
          .shift(points.hemKCp1B.angle(points.hemK), sa)
          .shift(points.waist6.angle(points.hemK), hemSa)

        points.drawSaWaistEnd = drawSaWaist().end()

        points.saWaist3Left = drawSaWaist()
          .start()
          .shift(points.hemK.angle(points.waist6), sa)
          .shift(points.hemK.angle(points.waist6) - 90, sa)

        points.saCrossStart = drawCross().offset(crossSeamSa).start()

        points.saWaistEnd = utils.beamsIntersect(
          drawSaWaist().offset(sa).end(),
          drawSaWaist().offset(sa).shiftFractionAlong(0.995),
          drawCross().offset(crossSeamSa).shiftFractionAlong(0.005),
          points.saCrossStart
        )

        if (points.saWaistEnd.x < points.saCrossStart.x) {
          points.saWaistEnd = points.saCrossStart
        }
        points.crossEnd = drawCross().end()
        points.saCrossEnd = points.crossEnd
          .shift(points.drawHemBaseStart.angle(points.crossEnd), crossSeamSa)
          .shift(points.drawHemBaseStart.angle(points.crossEnd) + 90, inseamSa)
        points.saHemStart = points.drawHemBaseStart
          .shift(points.crossEnd.angle(points.drawHemBaseStart) - 90, inseamSa)
          .shift(points.crossEnd.angle(points.drawHemBaseStart), hemSa)

        if (options.skirtHemFacings) {
          points.saHemFacingK = points.hemFacingK
            .shift(points.hemFacingKCp2B.angle(points.hemFacingK), sa)
            .shift(points.hemK.angle(points.hemFacingK), sa)

          points.saCrossFacing = paths.hemFacing
            .start()
            .shift(points.drawHemBaseStart.angle(points.crossEnd), sa)
            .shift(points.drawHemBaseStart.angle(points.crossEnd) + 90, inseamSa)

          paths.hemFacingSa = drawHemBase()
            .offset(hemSa)
            .line(points.saHemK)
            .line(points.saHemFacingK)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saCrossFacing)
            .line(points.saHemStart)
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = drawHemBase()
          .clone()
          .offset(hemSa)
          .line(points.saHemK)
          .line(points.saWaist3Left)
          .join(drawSaWaist().offset(sa))
          .line(points.saWaistEnd)
          .join(drawCross().offset(crossSeamSa))
          .line(points.saCrossEnd)
          .line(points.saHemStart)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
