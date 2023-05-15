import { pluginBundle } from '@freesewing/plugin-bundle'
import { skirtBase as wandaSkirtBase } from '@freesewing/wanda'

export const skirtBase = {
  name: 'fallon.skirtBase',
  from: wandaSkirtBase,
  hide: {
    from: true,
  },
  options: {
    //Constants
    fullDress: true, //altered frot Fallon
    umbrellaFullness: 0,
    umbrellaExtenstion: 0,
    //Style
    sidePanelFullness: { pct: 50, min: 50, max: 75, menu: 'style' },
    trainLength: { pct: 50, min: 50, max: (5 / 6) * 100, menu: 'style' },
    trainBackLength: { pct: 50, min: 50, max: 100, menu: 'style' },
  },
  plugins: [pluginBundle],
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
    //remove paths
    delete paths.dartF
    //measures
    const trainLength = measurements.waist * options.trainLength
    const angleL = utils.rad2deg(trainLength / points.origin.dist(points.hemF))
    //let's begin

    //side gore
    points.curveStartL = points.waistF.shiftFractionTowards(points.hemF, 1 / 3)
    points.hemL = points.origin.shiftOutwards(
      points.hemF.rotate(-angleL, points.origin),
      trainLength / 2
    )
    points.curveLCp1 = points.curveStartL.shiftFractionTowards(points.hemF, 1 / 3)
    points.curveLCp2 = points.hemL.shiftFractionTowards(points.curveLCp1, 1 / 3)

    // const sideBackCpDistance = (4 / 3) * points.origin.dist(points.hemL) * Math.tan(utils.deg2rad((points.origin.angle(points.hemE) - points.origin.angle(points.hemL)) / 4))

    // points.hemZ = utils.beamsIntersect(
    // points.origin,
    // points.hemE,
    // points.hemD,
    // points.hemDCp1
    // )

    // points.hemLCp2 = points.hemL.shiftTowards(points.origin, sideBackCpDistance).rotate(-90, points.hemL)
    // points.hemZCp1 = points.hemD.shiftOutwards(points.hemZ, sideBackCpDistance)
    points.hemLCp2 = utils.beamsIntersect(
      points.hemD,
      points.hemDCp1,
      points.hemL,
      points.origin.rotate(-90, points.hemL)
    )

    points.hemZ = utils.lineIntersectsCurve(
      points.origin,
      points.origin.rotate(180, points.hemE),
      points.hemL,
      points.hemL,
      points.hemLCp2,
      points.hemD
    )

    //back panels shaping
    paths.sideBack = new Path()
      .move(points.waist2Left)
      .curve(points.dartTipFCp1, points.dartTipFCp2, points.dartTipF)
      .line(points.curveStartL)
      .curve(points.curveLCp1, points.curveLCp2, points.hemL)

    points.waistFCp2 = points.waistF
      .shiftTowards(
        points.origin,
        points.waistF.dist(points.waist3Cp1) * (1 + options.sidePanelFullness)
      )
      .rotate(90, points.waistF)
    points.waist6BCp1 = points.waist6B.shiftFractionTowards(
      points.waist3Cp2B,
      1 - options.sidePanelFullness
    )

    points.hemY = points.origin.shiftOutwards(points.waistF, paths.sideBack.length())
    // points.hemJ = points.waist6B.shiftTowards(points.hemK, points.waistF.dist(points.hemY))
    points.hemJ = points.waist6B.shiftOutwards(
      points.hemK,
      points.waist6.dist(points.waist6B) +
        points.hemF.dist(points.hemY) * (1 + options.trainBackLength)
    )

    const backCpDistance =
      (4 / 3) *
      points.origin.dist(points.hemY) *
      Math.tan(
        utils.deg2rad((points.origin.angle(points.hemY) - points.origin.angle(points.hemJ)) / 4)
      )
    const hemLAngle = 90 - (points.hemL.angle(points.curveLCp2) - points.hemL.angle(points.hemLCp2))

    points.hemJCp2 = points.hemJ
      .shiftTowards(points.origin, backCpDistance)
      .rotate(-90, points.hemJ)
    points.hemYCp1 = points.hemY
      .shiftTowards(points.origin, backCpDistance)
      .rotate(90 + hemLAngle, points.hemY)

    //waist facings
    if (options.waistbandStyle == 'none') {
      points.cfWaistFacingCp1 = utils.beamsIntersect(
        points.cfHemCp1,
        points.origin,
        points.cfWaistFacing,
        points.origin.rotate(90, points.cfWaistFacing)
      )
      points.waistFacingDCp2 = utils.beamsIntersect(
        points.hemDCp2,
        points.origin,
        points.waistFacingD,
        points.origin.rotate(-90, points.waistFacingD)
      )
      points.waistFacingFCp2 = utils.beamsIntersect(
        points.hemFCp2,
        points.origin,
        points.waistFacingF,
        points.origin.rotate(-90, points.waistFacingF)
      )
      points.waistFacingECp1 = utils.beamsIntersect(
        points.hemECp1,
        points.origin,
        points.waistFacingE,
        points.origin.rotate(90, points.waistFacingE)
      )
    }

    //pleats
    /*  paths.waistBack = new Path()
      .move(points.waistF)
      .curve(points.waistFCp2, points.waist6BCp1, points.waist6B)
    //.hide()
    if (options.pleats) {
      const pleatTo = store.get('fullWaist') * (1 / 12)
      const pleatFrom = paths.waistBack.length()

      const pleatKeep = pleatTo / (options.pleatNumber + 1)
      const pleatLength = (pleatFrom - pleatTo) / options.pleatNumber
      const pleatLineLength = store.get('frontLength') / 15

      for (let i = 0; i < options.pleatNumber + 1; i++) {
        points['pleatFromTop' + i] = paths.waistBack.shiftAlong(
          pleatKeep + (pleatKeep + pleatLength) * i
        )
        points['pleatToTop' + i] = paths.waistBack.shiftAlong((pleatKeep + pleatLength) * i)
        points['pleatFromBottom' + i] = points['pleatFromTop' + i]
          .shiftTowards(points['pleatToTop' + i], pleatLineLength)
          .rotate(-90, points['pleatFromTop' + i])
        points['pleatToBottom' + i] = points['pleatToTop' + i]
          .shiftTowards(points['pleatFromTop' + i], pleatLineLength)
          .rotate(90, points['pleatToTop' + i])
      }
      for (let i = 0; i < options.pleatNumber; i++) {
        paths['pleatFrom' + i] = new Path()
          .move(points['pleatFromTop' + i])
          .line(points['pleatFromBottom' + i])
          .attr('class', 'fabric lashed')

        paths['pleatTo' + i] = new Path()
          .move(points['pleatToTop' + (i + 1)])
          .line(points['pleatToBottom' + (i + 1)])
      }
    } */ //Add to back only points are required on this one.

    //guides

    paths.sideBackHem = new Path().move(points.hemL)._curve(points.hemLCp2, points.hemD)

    paths.lineKJ = new Path().move(points.hemK).line(points.hemJ).attr('class', 'various')

    paths.lineFY = new Path().move(points.hemF).line(points.hemY).attr('class', 'various')

    paths.frontHem = new Path()
      .move(points.hemD)
      .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)

    paths.backhem = new Path().move(points.hemJ).curve(points.hemJCp2, points.hemYCp1, points.hemY)

    return part
  },
}
