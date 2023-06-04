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
    const skirtFraction = skirtHighLength / skirtLength

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
    points.frontHemMidAnchor = points.frontHemMidMin.shiftFractionTowards(
      points.frontHemMid,
      options.sideSkirtFraction * skirtFraction
    )
    points.sideFrontHem = points.sideFrontHemMin.shiftFractionTowards(
      points.sideFrontHemMax,
      options.sideSkirtFraction
    )
    points.sideBackHem = points.sideBackHemMin.shiftFractionTowards(
      points.sideBackHemMax,
      options.sideSkirtFraction
    )
    points.backHemMidAnchor = points.backHemMid.shiftFractionTowards(
      points.backHemMidMin,
      (1 - options.sideSkirtFraction) * skirtFraction
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
      points.frontHemMidAnchor,
      points.frontHemMidAnchor.shift(points.frontHemCp4.angle(points.frontHemCp1), 1),
      points.frontHemCp2,
      points.waistFrontCp3
    )

    points.frontHemCp3 = utils.beamsIntersect(
      points.frontHemCp2,
      points.frontHemMidAnchor,
      points.frontHemCp3,
      points.waistFrontCp2
    )

    points.frontHemCp2Anchor = utils.beamsIntersect(
      points.frontHemMidMin,
      points.frontHemMidMin.shift(points.waistFrontCp2.angle(points.waistFrontCp3), 1),
      points.frontHemCp2,
      points.waistFrontCp3
    )

    points.frontHemCp3Anchor = utils.beamsIntersect(
      points.frontHemMid,
      points.frontHemMid.shift(points.waistFrontCp3.angle(points.waistFrontCp2), 1),
      points.frontHemCp3,
      points.waistFrontCp2
    )
    if (points.frontHemCp2.y < points.frontHemCp2Anchor.y) {
      points.frontHemCp2 = points.frontHemCp2Anchor.clone()
    }
    if (points.frontHemCp3.y > points.frontHemCp3Anchor.y) {
      points.frontHemCp3 = points.frontHemCp3Anchor.clone()
    }

    points.frontHemMid = utils.beamsIntersect(
      points.frontHemCp2,
      points.frontHemCp3,
      points.frontHemMid,
      points.waistFrontMid
    )

    points.backHemCp3 = utils.beamsIntersect(
      points.backHemMidAnchor,
      points.backHemMidAnchor.shift(points.backHemCp1.angle(points.backHemCp4), 1),
      points.backHemCp3,
      points.waistBackCp2
    )

    points.backHemCp2 = utils.beamsIntersect(
      points.backHemCp3,
      points.backHemMidAnchor,
      points.backHemCp2,
      points.waistBackCp3
    )

    points.backHemCp3Anchor = utils.beamsIntersect(
      points.backHemMidMin.shiftFractionTowards(points.backHemMid, options.sideSkirtFraction),
      points.backHemMidMin
        .shiftFractionTowards(points.backHemMid, options.sideSkirtFraction)
        .shift(points.waistBackCp3.angle(points.waistBackCp2), 1),
      points.backHemCp3,
      points.waistBackCp2
    )

    points.backHemCp2Anchor = utils.beamsIntersect(
      points.backHemMid,
      points.backHemMid.shift(points.waistBackCp2.angle(points.waistBackCp3), 1),
      points.backHemCp2,
      points.waistBackCp3
    )

    if (points.backHemCp3.y < points.backHemCp3Anchor.y) {
      points.backHemCp3 = points.backHemCp3Anchor.clone()
    }

    if (points.backHemCp2.y > points.backHemCp2Anchor.y) {
      points.backHemCp2 = points.backHemCp2Anchor.clone()
    }

    points.backHemMid = utils.beamsIntersect(
      points.backHemCp2,
      points.backHemCp3,
      points.backHemMid,
      points.waistFrontMid
    )

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
      .attr('class', 'interfacing lashed')
    paths.test1 = paths.backHemTest
      .offset((skirtHighLength - skirtLength) / 2)
      .attr('class', 'interfacing lashed')
    paths.test2 = paths.backHemTest
      .offset((skirtHighLength - skirtLength) * (3 / 4))
      .attr('class', 'interfacing lashed')
    paths.test3 = paths.backHemTest
      .offset(skirtHighLength - skirtLength)
      .attr('class', 'interfacing lashed')

    paths.test4 = new Path()
      .move(points.sideBackHemMax)
      .line(points.sideWaistBack)
      .attr('class', 'interfacing lashed')

    paths.test5 = new Path()
      .move(points.frontHemMid)
      .line(points.backHemMid)
      .attr('class', 'interfacing lashed')

    return part
  },
}
