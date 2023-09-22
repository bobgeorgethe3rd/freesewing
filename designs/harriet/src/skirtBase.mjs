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
    //Construction
    skirtFacings: { bool: true, menu: 'construction' },
    skirtFacingWidth: { pct: 25, min: 10, max: 50, menu: 'construction' },
  },
  plugins: [pluginBundle],
  measurements: [...claudeSkirtBase.measurements],
  optionalMeasurements: [...claudeSkirtBase.optionalMeasurements],
  // after: skirtBase,
  draft: (sh) => {
    //set Render
    const { macro, points, Point, paths, Path, options, utils, store, complete, part } = sh
    claudeSkirtBase.draft(sh)

    //measures
    const skirtHighLength = store.get('skirtHighLength')
    const skirtLength = store.get('skirtLength')
    const skirtFraction = skirtHighLength / skirtLength
    const skirtFacingWidth = skirtHighLength * options.skirtFacingWidth
    const skirtFrontFullness = store.get('skirtFrontFullness')
    const skirtBackFullness = store.get('skirtBackFullness')

    // paths.backHemOriginal = new Path()
    // .move(points.cbHem)
    // .curve(points.cbHemCp2, points.backHemMidCp1, points.backHemMid)
    // .curve(points.backHemMidCp2, points.sideBackHemCp1, points.sideBackHem)
    // .attr('class', 'various')

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
    points.cfHemCp2 = utils.beamsIntersect(
      points.cfHem,
      points.cfWaist.rotate(-90, points.cfHem),
      points.cfHemCp2,
      points.cfWaistCp1
    )
    points.sideFrontHemCp1 = utils.beamsIntersect(
      points.sideFrontHem,
      points.sideWaistFront.rotate(90, points.sideFrontHem),
      points.sideFrontHemCp1,
      points.sideWaistFrontCp2
    )

    points.sideBackHemCp1 = utils.beamsIntersect(
      points.sideBackHem,
      points.sideWaistBack.rotate(90, points.sideBackHem),
      points.sideBackHemCp1,
      points.sideWaistBackCp2
    )

    points.frontHemMidCp1 = utils.beamsIntersect(
      points.frontHemMidAnchor,
      points.frontHemMidAnchor.shift(points.sideFrontHemCp1.angle(points.cfHemCp2), 1),
      points.frontHemMidCp1,
      points.waistFrontMidCp2
    )

    points.frontHemMidCp2 = utils.beamsIntersect(
      points.frontHemMidCp1,
      points.frontHemMidAnchor,
      points.frontHemMidCp2,
      points.waistFrontMidCp1
    )

    points.frontHemMidCp1Anchor = utils.beamsIntersect(
      points.frontHemMidMin,
      points.frontHemMidMin.shift(points.waistFrontMidCp1.angle(points.waistFrontMidCp2), 1),
      points.frontHemMidCp1,
      points.waistFrontMidCp2
    )

    points.frontHemMidCp2Anchor = utils.beamsIntersect(
      points.frontHemMid,
      points.frontHemMid.shift(points.waistFrontMidCp2.angle(points.waistFrontMidCp1), 1),
      points.frontHemMidCp2,
      points.waistFrontMidCp1
    )
    if (
      utils.pointOnLine(
        points.frontHemMidCp1Anchor,
        points.frontHemMidCp1Anchor.shiftOutwards(points.waistFrontMidCp2, skirtLength * 100),
        points.frontHemMidCp1
      )
    ) {
      points.frontHemMidCp1 = points.frontHemMidCp1Anchor.clone()
    }
    if (
      utils.pointOnLine(
        points.frontHemMidCp2Anchor,
        points.waistFrontMidCp1.shiftOutwards(points.frontHemMidCp2Anchor, skirtLength * 100),
        points.frontHemMidCp2
      )
    ) {
      points.frontHemMidCp2 = points.frontHemMidCp2Anchor.clone()
    }

    points.frontHemMid = utils.beamsIntersect(
      points.frontHemMidCp1,
      points.frontHemMidCp2,
      points.frontHemMid,
      points.waistFrontMid
    )

    points.backHemMidCp2 = utils.beamsIntersect(
      points.backHemMidAnchor,
      points.backHemMidAnchor.shift(points.cbHemCp2.angle(points.sideBackHemCp1), 1),
      points.backHemMidCp2,
      points.waistBackMidCp1
    )

    points.backHemMidCp1 = utils.beamsIntersect(
      points.backHemMidCp2,
      points.backHemMidAnchor,
      points.backHemMidCp1,
      points.waistBackMidCp2
    )

    points.backHemMidCp2Anchor = utils.beamsIntersect(
      points.backHemMidMin.shiftFractionTowards(points.backHemMid, options.sideSkirtFraction),
      points.backHemMidMin
        .shiftFractionTowards(points.backHemMid, options.sideSkirtFraction)
        .shift(points.waistBackMidCp2.angle(points.waistBackMidCp1), 1),
      points.backHemMidCp2,
      points.waistBackMidCp1
    )

    points.backHemMidCp1Anchor = utils.beamsIntersect(
      points.backHemMid,
      points.backHemMid.shift(points.waistBackMidCp1.angle(points.waistBackMidCp2), 1),
      points.backHemMidCp1,
      points.waistBackMidCp2
    )

    if (
      utils.pointOnLine(
        points.backHemMidCp2Anchor,
        points.backHemMidCp2Anchor.shiftOutwards(points.waistBackMidCp1, skirtLength * 100),
        points.backHemMidCp2
      )
    ) {
      points.backHemMidCp2 = points.backHemMidCp2Anchor.clone()
    }

    if (
      utils.pointOnLine(
        points.backHemMidCp1Anchor,
        points.waistBackMidCp2.shiftOutwards(points.backHemMidCp1Anchor, skirtLength * 100),
        points.backHemMidCp1
      )
    ) {
      points.backHemMidCp1 = points.backHemMidCp1Anchor.clone()
    }

    points.backHemMid = utils.beamsIntersect(
      points.backHemMidCp1,
      points.backHemMidCp2,
      points.backHemMid,
      points.waistFrontMid
    )
    //side split
    if (points.frontHemExtension) {
      const ex = points.sideFrontHemMax.dist(points.frontHemExtension)
      points.frontHemExtension = points.sideFrontHemCp1.shiftOutwards(points.sideFrontHem, ex)
      points.backHemExtension = points.sideBackHemCp1.shiftOutwards(points.sideBackHem, ex)

      let frontIntersect = utils.lineIntersectsCurve(
        points.sideFrontHem,
        points.frontHemExtension,
        points.sideFrontExtension,
        points.sideFrontExtensionCp2,
        points.sideWaistFront,
        points.sideWaistFront
      )
      if (frontIntersect) {
        points.frontHemExSplit = frontIntersect
      }

      let backIntersect = utils.lineIntersectsCurve(
        points.sideBackHem,
        points.backHemExtension,
        points.sideBackExtension,
        points.sideBackExtensionCp2,
        points.sideWaistBack,
        points.sideWaistBack
      )
      if (backIntersect) {
        points.backHemExSplit = backIntersect
      }
    }
    //facings
    if (complete && options.skirtFacings) {
      //frontHemFacing
      const skirtFrontFacingAngle =
        points.frontHemMid.angle(points.waistFrontMid) -
        (points.frontHemMid.angle(points.frontHemMidCp1) - 90)
      let skirtFrontFullnessMultiplier
      if (skirtFrontFullness > 1) {
        skirtFrontFullnessMultiplier = 1
      } else {
        skirtFrontFullnessMultiplier = skirtFrontFullness
      }

      points.cfHemFacing = points.cfHem.shiftTowards(points.cfWaist, skirtFacingWidth)
      points.sideFrontHemFacing = points.sideFrontHem.shiftTowards(
        points.sideWaistFront,
        skirtFacingWidth
      )
      points.frontHemFacingMid = points.frontHemMid.shiftTowards(
        points.waistFrontMid.rotate(
          -skirtFrontFacingAngle * skirtFrontFullnessMultiplier,
          points.frontHemMid
        ),
        skirtFacingWidth
      )
      points.cfFacingCp1 = utils.beamsIntersect(
        points.cfHemCp2,
        points.cfWaistCp1.rotate(
          -skirtFrontFacingAngle * skirtFrontFullnessMultiplier,
          points.cfHemCp2
        ),
        points.cfHemFacing,
        points.cfWaist.rotate(-90, points.cfHemFacing)
      )

      points.frontHemFacingMidCp2 = utils.beamsIntersect(
        points.frontHemMidCp1,
        points.waistFrontMidCp2.rotate(
          -skirtFrontFacingAngle * skirtFrontFullnessMultiplier,
          points.frontHemMidCp1
        ),
        points.frontHemFacingMid,
        points.frontHemMid.rotate(-90, points.frontHemFacingMid)
      )

      points.frontHemFacingMidCp1 = utils.beamsIntersect(
        points.frontHemMidCp2,
        points.waistFrontMidCp1.rotate(
          -skirtFrontFacingAngle * skirtFrontFullnessMultiplier,
          points.frontHemMidCp1
        ),
        points.frontHemFacingMid,
        points.frontHemMid.rotate(90, points.frontHemFacingMid)
      )

      points.sideFrontHemFacingCp2Target = utils.beamsIntersect(
        points.sideFrontHemCp1,
        points.sideWaistFrontCp2.rotate(
          -skirtFrontFacingAngle * skirtFrontFullnessMultiplier,
          points.cfHemCp2
        ),
        points.sideFrontHemFacing,
        points.sideWaistFront.rotate(90, points.sideFrontHemFacing)
      )
      points.sideFrontHemFacingCp2 = points.sideFrontHemFacing
        .shiftFractionTowards(points.sideFrontHemFacingCp2Target, 1 - skirtFraction)
        .shiftFractionTowards(points.sideFrontHemFacingCp2Target, skirtFrontFullness / 2)
        .shiftFractionTowards(points.sideFrontHemFacingCp2Target, 1 - options.sideSkirtFraction)

      if (skirtFrontFullness < 1) {
        points.frontHemFacingMidCp2 = utils.beamsIntersect(
          points.frontHemFacingMid,
          points.frontHemFacingMidCp2.rotate(
            (1 - skirtFrontFullness) * -skirtFrontFacingAngle,
            points.frontHemFacingMid
          ),
          points.frontHemFacingMidCp2,
          points.frontHemFacingMid.rotate(90, points.frontHemFacingMidCp2)
        )

        points.frontHemFacingMidCp1 = utils.beamsIntersect(
          points.frontHemFacingMidCp2,
          points.frontHemFacingMid,
          points.frontHemFacingMidCp1,
          points.frontHemFacingMid.rotate(90, points.frontHemFacingMidCp1)
        )
      }
      //back skirt facing
      const skirtBackFacingAngle =
        points.backHemMid.angle(points.waistBackMid) -
        (points.backHemMid.angle(points.backHemMidCp1) - 90)
      let skirtBackFullnessMultiplier
      if (skirtBackFullness > 1) {
        skirtBackFullnessMultiplier = 1
      } else {
        skirtBackFullnessMultiplier = skirtBackFullness
      }

      points.cbHemFacing = points.cbHem.shiftTowards(points.cbWaist, skirtFacingWidth)
      points.backHemFacingMid = points.backHemMid.shiftTowards(
        points.waistBackMid.rotate(
          -skirtBackFacingAngle * skirtBackFullnessMultiplier,
          points.backHemMid
        ),
        skirtFacingWidth
      )
      points.sideBackHemFacing = points.sideBackHem.shiftTowards(
        points.sideWaistBack,
        skirtFacingWidth
      )
      points.cbFacingCp1 = utils.beamsIntersect(
        points.cbHemCp2,
        points.cbWaistCp1.rotate(
          -skirtBackFacingAngle * skirtBackFullnessMultiplier,
          points.cbHemCp2
        ),
        points.cbHemFacing,
        points.cbWaist.rotate(-90, points.cbHemFacing)
      )
      points.sideBackHemFacingCp2 = utils.beamsIntersect(
        points.sideBackHemCp1,
        points.sideWaistBackCp2.rotate(
          -skirtBackFacingAngle * skirtBackFullnessMultiplier,
          points.cbHemCp2
        ),
        points.sideBackHemFacing,
        points.sideWaistBack.rotate(90, points.sideBackHemFacing)
      )
      points.backHemFacingMidCp2 = utils.beamsIntersect(
        points.backHemMidCp1,
        points.waistBackMidCp2.rotate(
          -skirtBackFacingAngle * skirtBackFullnessMultiplier,
          points.backHemMidCp1
        ),
        points.backHemFacingMid,
        points.backHemMid.rotate(-90, points.backHemFacingMid)
      )
      points.backHemFacingMidCp1 = utils.beamsIntersect(
        points.backHemMidCp2,
        points.waistBackMidCp1.rotate(
          -skirtBackFacingAngle * skirtBackFullnessMultiplier,
          points.backHemMidCp1
        ),
        points.backHemFacingMid,
        points.backHemMid.rotate(90, points.backHemFacingMid)
      )
      if (skirtBackFullness < 1) {
        points.backHemFacingMidCp2 = utils.beamsIntersect(
          points.backHemFacingMid,
          points.backHemFacingMidCp2.rotate(
            (1 - skirtBackFullness) * -skirtBackFacingAngle,
            points.backHemFacingMid
          ),
          points.backHemFacingMidCp2,
          points.backHemFacingMid.rotate(90, points.backHemFacingMidCp2)
        )

        points.backHemFacingMidCp1 = utils.beamsIntersect(
          points.backHemFacingMidCp2,
          points.backHemFacingMid,
          points.backHemFacingMidCp1,
          points.backHemFacingMid.rotate(90, points.backHemFacingMidCp1)
        )
      }

      //side extension
      if (points.frontHemExtension) {
        const ex = points.sideFrontHem.dist(points.frontHemExtension)
        points.frontHemFacingExtension = points.sideFrontHemFacingCp2.shiftOutwards(
          points.sideFrontHemFacing,
          ex
        )
        points.backHemFacingExtension = points.sideBackHemFacingCp2.shiftOutwards(
          points.sideBackHemFacing,
          ex
        )

        let frontFacingIntersect = utils.lineIntersectsCurve(
          points.sideFrontHemFacing,
          points.frontHemFacingExtension,
          points.sideFrontExtension,
          points.sideFrontExtensionCp2,
          points.sideWaistFront,
          points.sideWaistFront
        )
        if (frontFacingIntersect) {
          points.frontHemFacingExSplit = frontFacingIntersect
        } else {
          points.frontHemFacingExSplit = points.frontHemFacingExtension
        }

        let backFacingIntersect = utils.lineIntersectsCurve(
          points.sideBackHemFacing,
          points.backHemFacingExtension,
          points.sideBackExtension,
          points.sideBackExtensionCp2,
          points.sideWaistBack,
          points.sideWaistBack
        )
        if (backFacingIntersect) {
          points.backHemFacingExSplit = backFacingIntersect
        } else {
          points.backHemFacingExSplit = points.backHemFacingExtension
        }
      }

      //guides
      paths.frontHemFacing = new Path()
        .move(points.cfHemFacing)
        .curve(points.cfFacingCp1, points.frontHemFacingMidCp2, points.frontHemFacingMid)
        .curve(points.frontHemFacingMidCp1, points.sideFrontHemFacingCp2, points.sideFrontHemFacing)

      paths.backHemFacing = new Path()
        .move(points.cbHemFacing)
        .curve(points.cbFacingCp1, points.backHemFacingMidCp2, points.backHemFacingMid)
        .curve(points.backHemFacingMidCp1, points.sideBackHemFacingCp2, points.sideBackHemFacing)
        .attr('class', 'various')
    }
    //stores
    store.set('sideSkirtLength', points.sideWaistFront.dist(points.sideFrontHem))
    store.set('skirtFacingWidth', skirtFacingWidth)
    //guides
    // if (points.frontHemExtension) {
    // paths.sideseamFront = new Path()
    // .move(points.frontHemExtension)
    // .line(points.sideFrontExtension)
    // .curve_(points.sideFrontExtensionCp2, points.sideWaistFront)
    // }
    // if (points.backHemExtension) {
    // paths.sideseamBack = new Path()
    // .move(points.backHemExtension)
    // .line(points.sideBackExtension)
    // .curve_(points.sideBackExtensionCp2, points.sideWaistBack)
    // .attr('class', 'various')
    // }

    // paths.waistFront = new Path()
    // .move(points.sideWaistFront)
    // .curve(points.sideWaistFrontCp2, points.waistFrontMidCp1, points.waistFrontMid)
    // .curve(points.waistFrontMidCp2, points.cfWaistCp1, points.cfWaist)

    // paths.waistBack = new Path()
    // .move(points.sideWaistBack)
    // .curve(points.sideWaistBackCp2, points.waistBackMidCp1, points.waistBackMid)
    // .curve(points.waistBackMidCp2, points.cbWaistCp1, points.cbWaist)
    // .attr('class', 'various')

    // paths.frontHem = new Path()
    // .move(points.cfHem)
    // .curve(points.cfHemCp2, points.frontHemMidCp1, points.frontHemMid)
    // .curve(points.frontHemMidCp2, points.sideFrontHemCp1, points.sideFrontHem)

    // paths.backHem = new Path()
    // .move(points.cbHem)
    // .curve(points.cbHemCp2, points.backHemMidCp1, points.backHemMid)
    // .curve(points.backHemMidCp2, points.sideBackHemCp1, points.sideBackHem)
    // .attr('class', 'various')

    // paths.test0 = paths.backHemOriginal
    // .offset((skirtHighLength - skirtLength) / 4)
    // .attr('class', 'interfacing lashed')
    // paths.test1 = paths.backHemOriginal
    // .offset((skirtHighLength - skirtLength) / 2)
    // .attr('class', 'interfacing lashed')
    // paths.test2 = paths.backHemOriginal
    // .offset((skirtHighLength - skirtLength) * (3 / 4))
    // .attr('class', 'interfacing lashed')
    // paths.test3 = paths.backHemOriginal
    // .offset(skirtHighLength - skirtLength)
    // .attr('class', 'interfacing lashed')

    // paths.test4 = new Path()
    // .move(points.sideBackHemMax)
    // .line(points.sideWaistBack)
    // .attr('class', 'interfacing lashed')

    // paths.test5 = new Path()
    // .move(points.frontHemMid)
    // .line(points.backHemMid)
    // .attr('class', 'interfacing lashed')

    // paths.test6 = paths.frontHem.offset(-skirtFacingWidth).attr('class', 'interfacing lashed')
    // paths.test7 = paths.backHem.offset(-skirtFacingWidth).attr('class', 'canvas lashed')

    return part
  },
}
