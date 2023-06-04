import { skirtBase as claudeSkirtBase } from '@freesewing/claude'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const skirtBase = {
  name: 'harriet.skirtBase',
  options: {
    //Imported
    ...claudeSkirtBase.options,
    //Constants
    highLow: true,
    //Style
    skirtHighLength: {
      dflt: 'toKnee',
      list: ['toHips', 'toSeat', 'toUpperLeg', 'toThigh', 'toKnee', 'toCalf'],
      menu: 'style',
    },
    skirtHighLengthBonus: { pct: 0, min: -20, max: 30, menu: 'style' },
    skirtLength: {
      dflt: 'toFloor',
      list: ['toHips', 'toSeat', 'toUpperLeg', 'toThigh', 'toKnee', 'toCalf', 'toFloor'],
      menu: 'style',
    },
    sideSkirtFraction: { pct: 100, min: 0, max: 100, menu: 'style' },
  },
  plugins: [pluginBundle],
  measurements: [...claudeSkirtBase.measurements],
  optionalMeasurements: [...claudeSkirtBase.optionalMeasurements],
  // after: skirtBase,
  draft: (sh) => {
    //set Render
    const { macro, points, paths, Path, options, utils, store, complete, part } = sh
    claudeSkirtBase.draft(sh)

    //measures
    const skirtHighLength = store.get('skirtHighLength')
    const skirtLength = store.get('skirtLength')

    paths.backHemTest = new Path()
      .move(points.cbHem)
      .curve(points.backHemCp1, points.backHemCp2, points.backHemMid)
      .curve(points.backHemCp3, points.backHemCp4, points.sideBackHem)
      .attr('class', 'various')

    //Let's create some anchors
    points.sideFrontHemMax = points.sideFrontHem
    points.sideBackHemMax = points.sideBackHem
    points.frontHemMidMin = points.waistFrontMid.shiftTowards(points.frontHemMid, skirtHighLength)
    points.sideFrontHemMin = points.sideWaistFront.shiftTowards(
      points.sideFrontHem,
      skirtHighLength
    )
    points.sideBackHemMin = points.sideWaistBack.shiftTowards(points.sideBackHem, skirtHighLength)
    points.backHemMidMin = points.waistBackMid.shiftTowards(points.backHemMid, skirtHighLength)

    //let's begin
    points.cfHem = points.cfWaist.shiftTowards(points.cfHem, skirtHighLength)
    points.frontHemMid = points.frontHemMidMin.shiftFractionTowards(
      points.frontHemMid,
      options.sideSkirtFraction * 0.35
    )
    points.sideFrontHem = points.sideFrontHemMin.shiftFractionTowards(
      points.sideFrontHemMax,
      options.sideSkirtFraction
    )
    points.sideBackHem = points.sideBackHemMin.shiftFractionTowards(
      points.sideBackHemMax,
      options.sideSkirtFraction
    )
    points.backHemMid = points.backHemMid.shiftFractionTowards(
      points.backHemMidMin,
      (1 - options.sideSkirtFraction) * (1 - 0.35)
    )
    //front control points
    points.frontHemCp1 = utils.beamsIntersect(
      points.cfHem,
      points.cfWaist.rotate(-90, points.cfHem),
      points.frontHemCp1,
      points.waistFrontCp4
    )
    points.frontHemCp4 = utils.beamsIntersect(
      points.sideFrontHem,
      points.sideWaistFront.rotate(90, points.sideFrontHem),
      points.frontHemCp4,
      points.waistFrontCp1
    )

    points.backHemCp4 = utils.beamsIntersect(
      points.sideBackHem,
      points.sideWaistBack.rotate(90, points.sideBackHem),
      points.backHemCp4,
      points.waistBackCp1
    )

    points.frontHemCp2 = utils.beamsIntersect(
      points.frontHemMid,
      points.frontHemMid.shift(points.frontHemCp4.angle(points.frontHemCp1), 1),
      points.frontHemCp2,
      points.waistFrontCp3
    )
    points.frontHemCp3 = utils.beamsIntersect(
      points.frontHemCp2,
      points.frontHemMid,
      points.frontHemCp3,
      points.waistFrontCp2
    )

    points.backHemCp3 = utils.beamsIntersect(
      points.backHemMid,
      points.backHemMid.shift(points.backHemCp1.angle(points.backHemCp4), 1),
      points.backHemCp3,
      points.waistBackCp2
    )

    points.backHemCp2 = utils.beamsIntersect(
      points.backHemCp3,
      points.backHemMid,
      points.backHemCp2,
      points.waistFrontCp3
    )

    // points.frontHemCp2Min = utils.beamsIntersect(
    // points.frontHemMidMin,
    // points.waistFrontMid.rotate(90, points.frontHemMidMin),
    // points.frontHemCp2,
    // points.waistFrontCp3
    // )

    // points.frontHemCp2 = points.frontHemCp2Min.shiftFractionTowards(points.frontHemCp2, options.sideSkirtFraction / 8)

    // points.frontHemCp3Min = utils.beamsIntersect(
    // points.frontHemMidMin,
    // points.waistFrontMid.rotate(-90, points.frontHemMidMin),
    // points.frontHemCp3,
    // points.waistFrontCp2
    // )

    // points.frontHemCp3 = points.frontHemCp3Min.shiftFractionTowards(points.frontHemCp3, options.sideSkirtFraction * (7 / 8))

    // points.frontHemMid = utils.beamsIntersect(
    // points.frontHemCp2,
    // points.frontHemCp3,
    // points.waistFrontMid,
    // points.frontHemMid
    // )

    // points.backHemCp2Max = utils.beamsIntersect(
    // points.backHemMidMin,
    // points.waistBackMid.rotate(90, points.backHemMidMin),
    // points.backHemCp2,
    // points.waistFrontCp3
    // )

    // points.backHemCp2 = points.backHemCp2.shiftFractionTowards(points.backHemCp2Max, (1 - options.sideSkirtFraction) / 4)

    //guides
    if (points.frontHemExtension) {
      paths.sideseamFront = new Path()
        .move(points.frontHemExtension)
        .line(points.sideFrontExtension)
        .curve_(points.sideSeamFrontCp, points.sideWaistFront)
    }
    if (points.backHemExtension) {
      paths.sideseamBack = new Path()
        .move(points.backHemExtension)
        .line(points.sideBackExtension)
        .curve_(points.sideSeamBackCp, points.sideWaistBack)
        .attr('class', 'various')
    }

    paths.waistFront = new Path()
      .move(points.sideWaistFront)
      .curve(points.waistFrontCp1, points.waistFrontCp2, points.waistFrontMid)
      .curve(points.waistFrontCp3, points.waistFrontCp4, points.cfWaist)

    paths.waistBack = new Path()
      .move(points.sideWaistBack)
      .curve(points.waistBackCp1, points.waistBackCp2, points.waistBackMid)
      .curve(points.waistBackCp3, points.waistBackCp4, points.cbWaist)
      .attr('class', 'various')

    paths.frontHem = new Path()
      .move(points.cfHem)
      .curve(points.frontHemCp1, points.frontHemCp2, points.frontHemMid)
      .curve(points.frontHemCp3, points.frontHemCp4, points.sideBackHem)

    paths.backHem = new Path()
      .move(points.cbHem)
      .curve(points.backHemCp1, points.backHemCp2, points.backHemMid)
      .curve(points.backHemCp3, points.backHemCp4, points.sideBackHem)
      .attr('class', 'various')

    paths.test0 = paths.backHemTest
      .offset((skirtHighLength - skirtLength) / 4)
      .attr('class', 'canvas')
    paths.test1 = paths.backHemTest
      .offset((skirtHighLength - skirtLength) / 2)
      .attr('class', 'canvas')
    paths.test2 = paths.backHemTest
      .offset((skirtHighLength - skirtLength) * (3 / 4))
      .attr('class', 'canvas')
    paths.test3 = paths.backHemTest.offset(skirtHighLength - skirtLength).attr('class', 'canvas')

    return part
  },
}
