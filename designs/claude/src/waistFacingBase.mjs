import { skirtBase } from './skirtBase.mjs'

export const waistFacingBase = {
  name: 'claude.waistFacingBase',
  after: skirtBase,
  hide: {
    after: true,
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
    log,
    absoluteOptions,
  }) => {
    //measures
    const frontRadius = store.get('frontRadius')
    const backRadius = store.get('backRadius')
    const frontAngle = store.get('frontAngle')
    const backAngle = store.get('backAngle')
    const waistFrontCpDistance = store.get('waistFrontCpDistance')
    const waistBackCpDistance = store.get('waistBackCpDistance')
    const seat = store.get('storedSeat')
    const hips = store.get('storedHips')
    const toHips = store.get('toHips')
    const toSeat = store.get('toSeat')

    let skirtLengthCheck
    if (options.highLow) {
      skirtLengthCheck = store.get('skirtHighLength')
    } else {
      skirtLengthCheck = store.get('skirtLength')
    }

    let waistFacingWidth
    if (absoluteOptions.waistbandWidth > skirtLengthCheck) {
      waistFacingWidth = skirtLengthCheck / 4
    } else {
      waistFacingWidth = absoluteOptions.waistbandWidth
    }
    //let's begin
    points.origin = new Point(0, 0)

    //waist front
    points.cfWaist = points.origin.shift(-90, frontRadius)
    points.waistFrontMid = points.cfWaist.rotate(frontAngle / 2, points.origin)
    points.sideWaistFront = points.cfWaist.rotate(frontAngle, points.origin)
    points.sideWaistFrontCp2 = points.sideWaistFront
      .shiftTowards(points.origin, waistFrontCpDistance)
      .rotate(90, points.sideWaistFront)
    points.waistFrontMidCp1 = points.waistFrontMid
      .shiftTowards(points.origin, waistFrontCpDistance)
      .rotate(-90, points.waistFrontMid)
    points.waistFrontMidCp2 = points.waistFrontMidCp1.rotate(180, points.waistFrontMid)
    points.cfWaistCp1 = points.cfWaist
      .shiftTowards(points.origin, waistFrontCpDistance)
      .rotate(-90, points.cfWaist)

    //waist back
    points.cbWaist = points.origin.shift(-90, backRadius)
    points.waistBackMid = points.cbWaist.rotate(backAngle / 2, points.origin)
    points.sideWaistBack = points.cbWaist.rotate(backAngle, points.origin)
    points.sideWaistBackCp2 = points.sideWaistBack
      .shiftTowards(points.origin, waistBackCpDistance)
      .rotate(90, points.sideWaistBack)
    points.waistBackMidCp1 = points.waistBackMid
      .shiftTowards(points.origin, waistBackCpDistance)
      .rotate(-90, points.waistBackMid)
    points.waistBackMidCp2 = points.waistBackMidCp1.rotate(180, points.waistBackMid)
    points.cbWaistCp1 = points.cbWaist
      .shiftTowards(points.origin, waistBackCpDistance)
      .rotate(-90, points.cbWaist)

    //facing front
    points.cfWaistFacing = points.origin.shiftOutwards(points.cfWaist, waistFacingWidth)
    points.waistFrontFacingMid = points.origin.shiftOutwards(points.waistFrontMid, waistFacingWidth)
    points.sideWaistFrontFacing = points.origin.shiftOutwards(
      points.sideWaistFront,
      waistFacingWidth
    )

    points.cfWaistFacingCp2 = utils.beamsIntersect(
      points.cfWaistFacing,
      points.cfWaist.rotate(-90, points.cfWaistFacing),
      points.origin,
      points.cfWaistCp1
    )
    points.waistFrontFacingMidCp1 = utils.beamsIntersect(
      points.waistFrontFacingMid,
      points.waistFrontMid.rotate(90, points.waistFrontFacingMid),
      points.origin,
      points.waistFrontMidCp2
    )
    points.waistFrontFacingMidCp2 = points.waistFrontFacingMidCp1.rotate(
      180,
      points.waistFrontFacingMid
    )
    points.sideWaistFrontFacingCp1 = utils.beamsIntersect(
      points.sideWaistFrontFacing,
      points.sideWaistFront.rotate(90, points.sideWaistFrontFacing),
      points.origin,
      points.sideWaistFrontCp2
    )

    //facing back
    points.cbWaistFacing = points.origin.shiftOutwards(points.cbWaist, waistFacingWidth)
    points.waistBackFacingMid = points.origin.shiftOutwards(points.waistBackMid, waistFacingWidth)
    points.sideWaistBackFacing = points.origin.shiftOutwards(points.sideWaistBack, waistFacingWidth)

    points.cbWaistFacingCp2 = utils.beamsIntersect(
      points.cbWaistFacing,
      points.cbWaist.rotate(-90, points.cbWaistFacing),
      points.origin,
      points.cbWaistCp1
    )
    points.waistBackFacingMidCp1 = utils.beamsIntersect(
      points.waistBackFacingMid,
      points.waistBackMid.rotate(90, points.waistBackFacingMid),
      points.origin,
      points.waistBackMidCp2
    )
    points.waistBackFacingMidCp2 = points.waistBackFacingMidCp1.rotate(
      180,
      points.waistBackFacingMid
    )
    points.sideWaistBackFacingCp1 = utils.beamsIntersect(
      points.sideWaistBackFacing,
      points.sideWaistBack.rotate(90, points.sideWaistBackFacing),
      points.origin,
      points.sideWaistBackCp2
    )

    //side seams
    if (options.fitSeat || options.fitHips) {
      if (
        options.fitHips &&
        !options.calculateWaistbandDiff &&
        options.waistbandStyle == 'straight'
      ) {
        log.debug('options.fitHips is unavailable when options.calculateWaistbandDiff is false.')
      }

      if (options.fitSeat && toSeat > 0) {
        points.cfSeat = points.cfWaist.shiftTowards(points.cfWaistFacing, toSeat)
        points.seatFrontMid = points.waistFrontMid.shiftTowards(points.waistFrontFacingMid, toSeat)
        points.sideSeatFront = points.sideWaistFront.shiftTowards(
          points.sideWaistFrontFacing,
          toSeat
        )

        points.cfSeatCp2 = utils.beamsIntersect(
          points.origin,
          points.cfWaistCp1,
          points.cfSeat,
          points.cfWaist.rotate(-90, points.cfSeat)
        )
        points.seatFrontMidCp1 = utils.beamsIntersect(
          points.origin,
          points.waistFrontMidCp2,
          points.seatFrontMid,
          points.waistFrontMid.rotate(90, points.seatFrontMid)
        )
        points.seatFrontMidCp2 = points.seatFrontMidCp1.rotate(180, points.seatFrontMid)
        points.sideSeatFrontCp1 = utils.beamsIntersect(
          points.origin,
          points.sideWaistFrontCp2,
          points.sideSeatFront,
          points.sideWaistFront.rotate(90, points.sideSeatFront)
        )

        points.cbSeat = points.cbWaist.shiftTowards(points.cbWaistFacing, toSeat)
        points.seatBackMid = points.waistBackMid.shiftTowards(points.waistBackFacingMid, toSeat)
        points.sideSeatBack = points.sideWaistBack.shiftTowards(points.sideWaistBackFacing, toSeat)

        points.cbSeatCp2 = utils.beamsIntersect(
          points.origin,
          points.cbWaistCp1,
          points.cbSeat,
          points.cbWaist.rotate(-90, points.cbSeat)
        )
        points.seatBackMidCp1 = utils.beamsIntersect(
          points.origin,
          points.waistBackMidCp2,
          points.seatBackMid,
          points.waistBackMid.rotate(90, points.seatBackMid)
        )
        points.seatBackMidCp2 = points.seatBackMidCp1.rotate(180, points.seatBackMid)
        points.sideSeatBackCp1 = utils.beamsIntersect(
          points.origin,
          points.sideWaistBackCp2,
          points.sideSeatBack,
          points.sideWaistBack.rotate(90, points.sideSeatBack)
        )

        let seatDiff =
          (seat / 2 -
            new Path()
              .move(points.cfSeat)
              .curve(points.cfSeatCp2, points.seatFrontMidCp1, points.seatFrontMid)
              .curve(points.seatFrontMidCp2, points.sideSeatFrontCp1, points.sideSeatFront)
              .length() -
            new Path()
              .move(points.cbSeat)
              .curve(points.cbSeatCp2, points.seatBackMidCp1, points.seatBackMid)
              .curve(points.seatBackMidCp2, points.sideSeatBackCp1, points.sideSeatBack)
              .length()) /
          2

        store.set('seatDiff', seatDiff)

        if (seatDiff > 0) {
          points.sideFrontExtension = points.sideSeatFrontCp1.shiftOutwards(
            points.sideSeatFront,
            seatDiff
          )
          points.frontHemExtension = points.sideWaistFrontFacingCp1.shiftOutwards(
            points.sideWaistFrontFacing,
            seatDiff
          )
          points.sideFrontExtensionCp2Target = points.sideWaistFrontCp2.shiftOutwards(
            points.sideWaistFront,
            seatDiff
          )
          points.sideFrontExtensionCp2 = points.sideFrontExtension.shiftFractionTowards(
            points.sideFrontExtensionCp2Target,
            2 / 3
          )

          points.sideBackExtension = points.sideSeatBackCp1.shiftOutwards(
            points.sideSeatBack,
            seatDiff
          )
          points.backHemExtension = points.sideWaistBackFacingCp1.shiftOutwards(
            points.sideWaistBackFacing,
            seatDiff
          )
          points.sideBackExtensionCp2Target = points.sideWaistBackCp2.shiftOutwards(
            points.sideWaistBack,
            seatDiff
          )
          points.sideBackExtensionCp2 = points.sideBackExtension.shiftFractionTowards(
            points.sideBackExtensionCp2Target,
            2 / 3
          )
          log.debug(
            'Adjusted side seam to accommodate seat. If not wanted disable options.fitSeat in Advanced.'
          )
        }
      }
      if (
        options.fitHips &&
        toHips > 0 &&
        (options.calculateWaistbandDiff || options.waistbandStyle != 'straight')
      ) {
        points.cfHips = points.cfWaist.shiftTowards(points.cfWaistFacing, toHips)
        points.hipsFrontMid = points.waistFrontMid.shiftTowards(points.waistFrontFacingMid, toHips)
        points.sideHipsFront = points.sideWaistFront.shiftTowards(
          points.sideWaistFrontFacing,
          toHips
        )

        points.cfHipsCp2 = utils.beamsIntersect(
          points.origin,
          points.cfWaistCp1,
          points.cfHips,
          points.cfWaist.rotate(-90, points.cfHips)
        )
        points.hipsFrontMidCp1 = utils.beamsIntersect(
          points.origin,
          points.waistFrontMidCp2,
          points.hipsFrontMid,
          points.waistFrontMid.rotate(90, points.hipsFrontMid)
        )
        points.hipsFrontMidCp2 = points.hipsFrontMidCp1.rotate(180, points.hipsFrontMid)
        points.sideHipsFrontCp1 = utils.beamsIntersect(
          points.origin,
          points.sideWaistFrontCp2,
          points.sideHipsFront,
          points.sideWaistFront.rotate(90, points.sideHipsFront)
        )

        points.cbHips = points.cbWaist.shiftTowards(points.cbWaistFacing, toHips)
        points.hipsBackMid = points.waistBackMid.shiftTowards(points.waistBackFacingMid, toHips)
        points.sideHipsBack = points.sideWaistBack.shiftTowards(points.sideWaistBackFacing, toHips)

        points.cbHipsCp2 = utils.beamsIntersect(
          points.origin,
          points.cbWaistCp1,
          points.cbHips,
          points.cbWaist.rotate(-90, points.cbHips)
        )
        points.hipsBackMidCp1 = utils.beamsIntersect(
          points.origin,
          points.waistBackMidCp2,
          points.hipsBackMid,
          points.waistBackMid.rotate(90, points.hipsBackMid)
        )
        points.hipsBackMidCp2 = points.hipsBackMidCp1.rotate(180, points.hipsBackMid)
        points.sideHipsBackCp1 = utils.beamsIntersect(
          points.origin,
          points.sideWaistBackCp2,
          points.sideHipsBack,
          points.sideWaistBack.rotate(90, points.sideHipsBack)
        )

        let hipsDiff =
          (hips / 2 -
            new Path()
              .move(points.cfHips)
              .curve(points.cfHipsCp2, points.hipsFrontMidCp1, points.hipsFrontMid)
              .curve(points.hipsFrontMidCp2, points.sideHipsFrontCp1, points.sideHipsFront)
              .length() -
            new Path()
              .move(points.cbHips)
              .curve(points.cbHipsCp2, points.hipsBackMidCp1, points.hipsBackMid)
              .curve(points.hipsBackMidCp2, points.sideHipsBackCp1, points.sideHipsBack)
              .length()) /
          2

        if (hipsDiff > 0) {
          points.sideFrontHipsEx = points.sideHipsFrontCp1.shiftOutwards(
            points.sideHipsFront,
            hipsDiff
          )
          points.sideBackHipsEx = points.sideHipsBackCp1.shiftOutwards(
            points.sideHipsBack,
            hipsDiff
          )

          let ex
          if (options.fitSeat && store.get('seatDiff') > hipsDiff) {
            ex = store.get('seatDiff')
          } else {
            ex = hipsDiff
          }

          let frontIntersect
          if (points.sideFrontExtension) {
            frontIntersect = utils.lineIntersectsCurve(
              points.sideHipsFront,
              points.sideFrontHipsEx,
              points.sideFrontExtension,
              points.sideFrontExtensionCp2,
              points.sideWaistFront,
              points.sideWaistFront
            )
          }
          if (!points.sideFrontExtension || frontIntersect) {
            points.sideFrontExtension = points.sideHipsFrontCp1.shiftOutwards(
              points.sideHipsFront,
              ex
            )
            points.frontHemExtension = points.sideWaistFrontFacingCp1.shiftOutwards(
              points.sideWaistFrontFacing,
              ex
            )
            points.sideFrontExtensionCp2Target = points.sideWaistFrontCp2.shiftOutwards(
              points.sideWaistFront,
              ex
            )
            points.sideFrontExtensionCp2 = points.sideFrontExtension.shiftFractionTowards(
              points.sideFrontExtensionCp2Target,
              2 / 3
            )
            log.debug(
              'Adjusted side seam to accommodate hips. If not wanted disable options.fitHips in Advanced.'
            )
          }

          let backIntersect
          if (points.sideBackExtension) {
            backIntersect = utils.lineIntersectsCurve(
              points.sideHipsBack,
              points.sideBackHipsEx,
              points.sideBackExtension,
              points.sideBackExtensionCp2,
              points.sideWaistBack,
              points.sideWaistBack
            )
          }

          if (!points.sideBackExtension || backIntersect) {
            points.sideBackExtension = points.sideHipsBackCp1.shiftOutwards(points.sideHipsBack, ex)
            points.backHemExtension = points.sideWaistBackFacingCp1.shiftOutwards(
              points.sideWaistBackFacing,
              ex
            )
            points.sideBackExtensionCp2Target = points.sideWaistBackCp2.shiftOutwards(
              points.sideWaistBack,
              ex
            )
            points.sideBackExtensionCp2 = points.sideBackExtension.shiftFractionTowards(
              points.sideBackExtensionCp2Target,
              2 / 3
            )
          }
        }
      }
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
    }
    if (points.frontHemExtension && points.frontHemExtension.y < points.sideFrontExtension.y) {
      points.frontFacingExSplit = utils.lineIntersectsCurve(
        points.sideWaistFrontFacing,
        points.frontHemExtension,
        points.sideFrontExtension,
        points.sideFrontExtensionCp2,
        points.sideWaistFront,
        points.sideWaistFront
      )
    }
    if (points.backHemExtension && points.backHemExtension.y < points.sideBackExtension.y) {
      points.backFacingExSplit = utils.lineIntersectsCurve(
        points.sideWaistBackFacing,
        points.backHemExtension,
        points.sideBackExtension,
        points.sideBackExtensionCp2,
        points.sideWaistBack,
        points.sideWaistBack
      )
    }

    //guides
    // paths.cfWaistFacing = new Path()
    // .move(points.cfWaistFacing)
    // .curve(points.cfWaistFacingCp2, points.waistFrontFacingMidCp1, points.waistFrontFacingMid)
    // .curve(points.waistFrontFacingMidCp2, points.sideWaistFrontFacingCp1, points.sideWaistFrontFacing)

    // paths.cbWaistFacing = new Path()
    // .move(points.cbWaistFacing)
    // .curve(points.cbWaistFacingCp2, points.waistBackFacingMidCp1, points.waistBackFacingMid)
    // .curve(points.waistBackFacingMidCp2, points.sideWaistBackFacingCp1, points.sideWaistBackFacing)

    return part
  },
}
