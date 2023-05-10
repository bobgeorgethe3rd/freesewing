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

    let waistFacingWidth
    if (store.get('waistbandWidth') > store.get('skirtLength')) {
      waistFacingWidth = store.get('skirtLength') / 4
    } else {
      waistFacingWidth = store.get('waistbandWidth')
    }
    //let's begin
    points.origin = new Point(0, 0)

    //waist front
    points.cfWaist = points.origin.shift(-90, frontRadius)
    points.waistFrontMid = points.cfWaist.rotate(frontAngle / 2, points.origin)
    points.sideWaistFront = points.cfWaist.rotate(frontAngle, points.origin)
    points.waistFrontCp1 = points.sideWaistFront
      .shiftTowards(points.origin, waistFrontCpDistance)
      .rotate(90, points.sideWaistFront)
    points.waistFrontCp2 = points.waistFrontMid
      .shiftTowards(points.origin, waistFrontCpDistance)
      .rotate(-90, points.waistFrontMid)
    points.waistFrontCp3 = points.waistFrontCp2.rotate(180, points.waistFrontMid)
    points.waistFrontCp4 = points.cfWaist
      .shiftTowards(points.origin, waistFrontCpDistance)
      .rotate(-90, points.cfWaist)

    //waist back
    points.cbWaist = points.origin.shift(-90, backRadius)
    points.waistBackMid = points.cbWaist.rotate(backAngle / 2, points.origin)
    points.sideWaistBack = points.cbWaist.rotate(backAngle, points.origin)
    points.waistBackCp1 = points.sideWaistBack
      .shiftTowards(points.origin, waistBackCpDistance)
      .rotate(90, points.sideWaistBack)
    points.waistBackCp2 = points.waistBackMid
      .shiftTowards(points.origin, waistBackCpDistance)
      .rotate(-90, points.waistBackMid)
    points.waistBackCp3 = points.waistBackCp2.rotate(180, points.waistBackMid)
    points.waistBackCp4 = points.cbWaist
      .shiftTowards(points.origin, waistBackCpDistance)
      .rotate(-90, points.cbWaist)

    //facing front
    points.cfWaistFacing = points.origin.shiftOutwards(points.cfWaist, waistFacingWidth)
    points.waistFrontFacingMid = points.origin.shiftOutwards(points.waistFrontMid, waistFacingWidth)
    points.sideWaistFrontFacing = points.origin.shiftOutwards(
      points.sideWaistFront,
      waistFacingWidth
    )

    points.waistFrontFacingCp1 = utils.beamsIntersect(
      points.cfWaistFacing,
      points.cfWaist.rotate(-90, points.cfWaistFacing),
      points.origin,
      points.waistFrontCp4
    )
    points.waistFrontFacingCp2 = utils.beamsIntersect(
      points.waistFrontFacingMid,
      points.waistFrontMid.rotate(90, points.waistFrontFacingMid),
      points.origin,
      points.waistFrontCp3
    )
    points.waistFrontFacingCp3 = points.waistFrontFacingCp2.rotate(180, points.waistFrontFacingMid)
    points.waistFrontFacingCp4 = utils.beamsIntersect(
      points.sideWaistFrontFacing,
      points.sideWaistFront.rotate(90, points.sideWaistFrontFacing),
      points.origin,
      points.waistFrontCp1
    )

    //facing back
    points.cbWaistFacing = points.origin.shiftOutwards(points.cbWaist, waistFacingWidth)
    points.waistBackFacingMid = points.origin.shiftOutwards(points.waistBackMid, waistFacingWidth)
    points.sideWaistBackFacing = points.origin.shiftOutwards(points.sideWaistBack, waistFacingWidth)

    points.waistBackFacingCp1 = utils.beamsIntersect(
      points.cbWaistFacing,
      points.cbWaist.rotate(-90, points.cbWaistFacing),
      points.origin,
      points.waistBackCp4
    )
    points.waistBackFacingCp2 = utils.beamsIntersect(
      points.waistBackFacingMid,
      points.waistBackMid.rotate(90, points.waistBackFacingMid),
      points.origin,
      points.waistBackCp3
    )
    points.waistBackFacingCp3 = points.waistBackFacingCp2.rotate(180, points.waistBackFacingMid)
    points.waistBackFacingCp4 = utils.beamsIntersect(
      points.sideWaistBackFacing,
      points.sideWaistBack.rotate(90, points.sideWaistBackFacing),
      points.origin,
      points.waistBackCp1
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

        points.seatFrontCp1 = utils.beamsIntersect(
          points.origin,
          points.waistFrontCp4,
          points.cfSeat,
          points.cfWaist.rotate(-90, points.cfSeat)
        )
        points.seatFrontCp2 = utils.beamsIntersect(
          points.origin,
          points.waistFrontCp3,
          points.seatFrontMid,
          points.waistFrontMid.rotate(90, points.seatFrontMid)
        )
        points.seatFrontCp3 = points.seatFrontCp2.rotate(180, points.seatFrontMid)
        points.seatFrontCp4 = utils.beamsIntersect(
          points.origin,
          points.waistFrontCp1,
          points.sideSeatFront,
          points.sideWaistFront.rotate(90, points.sideSeatFront)
        )

        points.cbSeat = points.cbWaist.shiftTowards(points.cbWaistFacing, toSeat)
        points.seatBackMid = points.waistBackMid.shiftTowards(points.waistBackFacingMid, toSeat)
        points.sideSeatBack = points.sideWaistBack.shiftTowards(points.sideWaistBackFacing, toSeat)

        points.seatBackCp1 = utils.beamsIntersect(
          points.origin,
          points.waistBackCp4,
          points.cbSeat,
          points.cbWaist.rotate(-90, points.cbSeat)
        )
        points.seatBackCp2 = utils.beamsIntersect(
          points.origin,
          points.waistBackCp3,
          points.seatBackMid,
          points.waistBackMid.rotate(90, points.seatBackMid)
        )
        points.seatBackCp3 = points.seatBackCp2.rotate(180, points.seatBackMid)
        points.seatBackCp4 = utils.beamsIntersect(
          points.origin,
          points.waistBackCp1,
          points.sideSeatBack,
          points.sideWaistBack.rotate(90, points.sideSeatBack)
        )

        let seatDiff =
          (seat / 2 -
            new Path()
              .move(points.cfSeat)
              .curve(points.seatFrontCp1, points.seatFrontCp2, points.seatFrontMid)
              .curve(points.seatFrontCp3, points.seatFrontCp4, points.sideSeatFront)
              .length() -
            new Path()
              .move(points.cbSeat)
              .curve(points.seatBackCp1, points.seatBackCp2, points.seatBackMid)
              .curve(points.seatBackCp3, points.seatBackCp4, points.sideSeatBack)
              .length()) /
          2

        store.set('seatDiff', seatDiff)

        if (seatDiff > 0) {
          points.sideFrontExtension = points.seatFrontCp4.shiftOutwards(
            points.sideSeatFront,
            seatDiff
          )
          points.frontHemExtension = points.waistFrontFacingCp4.shiftOutwards(
            points.sideWaistFrontFacing,
            seatDiff
          )
          points.sideSeamFrontCpTarget = points.waistFrontCp1.shiftOutwards(
            points.sideWaistFront,
            seatDiff
          )
          points.sideSeamFrontCp = points.sideFrontExtension.shiftFractionTowards(
            points.sideSeamFrontCpTarget,
            2 / 3
          )

          points.sideBackExtension = points.seatBackCp4.shiftOutwards(points.sideSeatBack, seatDiff)
          points.backHemExtension = points.waistBackFacingCp4.shiftOutwards(
            points.sideWaistBackFacing,
            seatDiff
          )
          points.sideSeamBackCpTarget = points.waistBackCp1.shiftOutwards(
            points.sideWaistBack,
            seatDiff
          )
          points.sideSeamBackCp = points.sideBackExtension.shiftFractionTowards(
            points.sideSeamBackCpTarget,
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

        points.hipsFrontCp1 = utils.beamsIntersect(
          points.origin,
          points.waistFrontCp4,
          points.cfHips,
          points.cfWaist.rotate(-90, points.cfHips)
        )
        points.hipsFrontCp2 = utils.beamsIntersect(
          points.origin,
          points.waistFrontCp3,
          points.hipsFrontMid,
          points.waistFrontMid.rotate(90, points.hipsFrontMid)
        )
        points.hipsFrontCp3 = points.hipsFrontCp2.rotate(180, points.hipsFrontMid)
        points.hipsFrontCp4 = utils.beamsIntersect(
          points.origin,
          points.waistFrontCp1,
          points.sideHipsFront,
          points.sideWaistFront.rotate(90, points.sideHipsFront)
        )

        points.cbHips = points.cbWaist.shiftTowards(points.cbWaistFacing, toHips)
        points.hipsBackMid = points.waistBackMid.shiftTowards(points.waistBackFacingMid, toHips)
        points.sideHipsBack = points.sideWaistBack.shiftTowards(points.sideWaistBackFacing, toHips)

        points.hipsBackCp1 = utils.beamsIntersect(
          points.origin,
          points.waistBackCp4,
          points.cbHips,
          points.cbWaist.rotate(-90, points.cbHips)
        )
        points.hipsBackCp2 = utils.beamsIntersect(
          points.origin,
          points.waistBackCp3,
          points.hipsBackMid,
          points.waistBackMid.rotate(90, points.hipsBackMid)
        )
        points.hipsBackCp3 = points.hipsBackCp2.rotate(180, points.hipsBackMid)
        points.hipsBackCp4 = utils.beamsIntersect(
          points.origin,
          points.waistBackCp1,
          points.sideHipsBack,
          points.sideWaistBack.rotate(90, points.sideHipsBack)
        )

        let hipsDiff =
          (hips / 2 -
            new Path()
              .move(points.cfHips)
              .curve(points.hipsFrontCp1, points.hipsFrontCp2, points.hipsFrontMid)
              .curve(points.hipsFrontCp3, points.hipsFrontCp4, points.sideHipsFront)
              .length() -
            new Path()
              .move(points.cbHips)
              .curve(points.hipsBackCp1, points.hipsBackCp2, points.hipsBackMid)
              .curve(points.hipsBackCp3, points.hipsBackCp4, points.sideHipsBack)
              .length()) /
          2

        if (hipsDiff > 0) {
          points.sideFrontHipsEx = points.hipsFrontCp4.shiftOutwards(points.sideHipsFront, hipsDiff)
          points.sideBackHipsEx = points.hipsBackCp4.shiftOutwards(points.sideHipsBack, hipsDiff)

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
              points.sideSeamFrontCp,
              points.sideWaistFront,
              points.sideWaistFront
            )
          }
          if (!points.sideFrontExtension || frontIntersect) {
            points.sideFrontExtension = points.hipsFrontCp4.shiftOutwards(points.sideHipsFront, ex)
            points.frontHemExtension = points.waistFrontFacingCp4.shiftOutwards(
              points.sideWaistFrontFacing,
              ex
            )
            points.sideSeamFrontCpTarget = points.waistFrontCp1.shiftOutwards(
              points.sideWaistFront,
              ex
            )
            points.sideSeamFrontCp = points.sideFrontExtension.shiftFractionTowards(
              points.sideSeamFrontCpTarget,
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
              points.sideSeamBackCp,
              points.sideWaistBack,
              points.sideWaistBack
            )
          }

          if (!points.sideBackExtension || backIntersect) {
            points.sideBackExtension = points.hipsBackCp4.shiftOutwards(points.sideHipsBack, ex)
            points.backHemExtension = points.waistBackFacingCp4.shiftOutwards(
              points.sideWaistBackFacing,
              ex
            )
            points.sideSeamBackCpTarget = points.waistBackCp1.shiftOutwards(
              points.sideWaistBack,
              ex
            )
            points.sideSeamBackCp = points.sideBackExtension.shiftFractionTowards(
              points.sideSeamBackCpTarget,
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
      // .curve_(points.sideSeamFrontCp, points.sideWaistFront)
      // }
      // if (points.backHemExtension) {
      // paths.sideseamBack = new Path()
      // .move(points.backHemExtension)
      // .line(points.sideBackExtension)
      // .curve_(points.sideSeamBackCp, points.sideWaistBack)
      // .attr('class', 'various')
      // }
    }
    if (points.frontHemExtension && points.frontHemExtension.y < points.sideFrontExtension.y) {
      points.frontFacingExSplit = utils.lineIntersectsCurve(
        points.sideWaistFrontFacing,
        points.frontHemExtension,
        points.sideFrontExtension,
        points.sideSeamFrontCp,
        points.sideWaistFront,
        points.sideWaistFront
      )
    }
    if (points.backHemExtension && points.backHemExtension.y < points.sideBackExtension.y) {
      points.backFacingExSplit = utils.lineIntersectsCurve(
        points.sideWaistBackFacing,
        points.backHemExtension,
        points.sideBackExtension,
        points.sideSeamBackCp,
        points.sideWaistBack,
        points.sideWaistBack
      )
    }

    //guides
    // paths.cfWaistFacing = new Path()
    // .move(points.cfWaistFacing)
    // .curve(points.waistFrontFacingCp1, points.waistFrontFacingCp2, points.waistFrontFacingMid)
    // .curve(points.waistFrontFacingCp3, points.waistFrontFacingCp4, points.sideWaistFrontFacing)

    // paths.cbWaistFacing = new Path()
    // .move(points.cbWaistFacing)
    // .curve(points.waistBackFacingCp1, points.waistBackFacingCp2, points.waistBackFacingMid)
    // .curve(points.waistBackFacingCp3, points.waistBackFacingCp4, points.sideWaistBackFacing)

    return part
  },
}
