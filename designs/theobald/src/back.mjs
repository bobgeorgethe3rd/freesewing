import { backBase } from './backBase.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const back = {
  name: 'theobald.back',
  from: backBase,
  hide: {
    from: true,
  },
  options: {
    //Fit
    daltonGuides: { bool: false, menu: 'fit' },
    //Style
    backHemDrop: { pct: 1, min: 0, max: 1.5, menu: 'style' },
    //Pockets
    backPocketsBool: { bool: true, menu: 'pockets' },
    backPocketPlacement: { pct: 50, min: 40, max: 100, menu: 'pockets' },
    weltPocketOpeningWidth: { pct: 73.7, min: 50, max: 75, menu: 'pockets.weltPockets' },
  },
  plugins: [pluginLogoRG],
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
    log,
    absoluteOptions,
  }) => {
    //measurements
    const waistbandFishtail = options.waistbandFishtail && options.waistbandFishtailEmbedded
    const weltPocketOpeningWidth = measurements.waistBack * 0.5 * options.weltPocketOpeningWidth
    //delete paths
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    delete paths.sa
    //let's begin
    points.floor = points.floor.shift(-90, measurements.waistToFloor * options.backHemDrop)
    points.floorCp2 = points.floor.shift(0, points.floorIn.dist(points.floorOut) * 0.25)
    points.floorCp1 = points.floorCp2.rotate(180, points.floor)
    //paths
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOut, points.waistOut)
          else
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
              .curve_(points.seatOutCp2, points.waistOut)
        } else {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOut, points.waistOut)
          else
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
              .curve_(points.seatOutCp2, points.waistOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.seatOut, points.waistOut)
          else
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.seatOutCp1, points.seatOut)
              .curve_(points.seatOutCp2, points.waistOut)
        } else {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.seatOut, points.waistOut)
          else
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.seatOutCp1, points.seatOut)
              .curve_(points.seatOutCp2, points.waistOut)
        }
      }
    }

    const drawWaist = () =>
      waistbandFishtail
        ? new Path()
            .move(points.waistOut)
            .line(points.waistbandFOut)
            .join(paths.waistbandFCurve)
            .line(points.waistbandFIn)
            .line(points.waistIn)
        : new Path()
            .move(points.waistOut)
            .line(points.dartOut)
            .line(points.dartTip)
            .line(points.dartIn)
            .line(points.waistIn)

    const drawInseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          return new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.floorInCp1, points.floorIn)
        } else {
          return new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.kneeInCp1, points.kneeIn)
            .curve(points.kneeInCp2, points.floorInCp1, points.floorIn)
        }
      } else {
        if (options.fitCalf) {
          return new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.calfInCp1, points.calfIn)
            .curve(points.calfInCp2, points.floorInCp1, points.floorIn)
        } else {
          return new Path()
            .move(points.upperLegIn)
            .curve(points.upperLegInCp2, points.floorInCp1, points.floorIn)
        }
      }
    }

    paths.hemBase = new Path()
      .move(points.floorIn)
      ._curve(points.floorCp1, points.floor)
      .curve_(points.floorCp2, points.floorOut)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(drawOutseam())
      .join(drawWaist())
      .join(paths.crossSeam)
      .join(drawInseam())
      .close()

    if (options.backPocketsBool) {
      points.pocketMid = points.dartMid.shiftFractionTowards(
        points.dartTip,
        options.backPocketPlacement
      )
      points.pocketDartIn = utils.beamsIntersect(
        points.dartIn,
        points.dartTip,
        points.pocketMid,
        points.pocketMid.shift(points.waistOut.angle(points.waistIn), 1)
      )
      points.pocketIn = points.pocketDartIn.shift(
        points.waistOut.angle(points.waistIn),
        weltPocketOpeningWidth * 0.5
      )
      points.pocketDartOut = points.pocketDartIn.rotate(180, points.pocketMid)
      points.pocketOut = points.pocketIn.rotate(180, points.pocketMid)

      //stores
      store.set('weltPocketOpeningWidth', weltPocketOpeningWidth)
      store.set('weltToAnchor', points.dartMid.dist(points.pocketMid))
      store.set('insertSeamLength', measurements.waistToFloor)
    }
    if (complete) {
      //logo
      points.logo = points.knee
      macro('logorg', { at: points.logo, scale: 0.5 })
      //fishtail
      if (waistbandFishtail) {
        paths.dart = new Path()
          .move(points.dartTip)
          .line(points.dartOut)
          .line(points.waistbandFDart)
          .line(points.dartIn)
          .line(points.dartTip)
          .close()
        macro('sprinkle', {
          snippet: 'notch',
          on: ['waistIn', 'waistOut'],
        })
      }
      //pocket line
      if (options.backPocketsBool) {
        paths.pocketLine = new Path()
          .move(points.pocketIn)
          .line(points.pocketDartIn)
          .move(points.pocketDartOut)
          .line(points.pocketOut)
          .attr('class', 'fabric help')
          .attr('data-text', 'Welt Pocket Opening')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketIn', 'pocketOut'],
        })
      }
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const crossSeamSa = sa * options.crossSeamSaWidth * 100
        const inseamSa = sa * options.inseamSaWidth * 100

        points.saFloorOut = utils.beamIntersectsX(
          points.floorCp2.shiftTowards(points.floorOut, hemSa).rotate(-90, points.floorCp2),
          points.floorOut.shiftTowards(points.floorCp1, hemSa).rotate(90, points.floorOut),
          points.floorOut.shift(0, sideSeamSa).x
        )
        points.saFloorIn = utils.beamIntersectsX(
          points.floorIn.shiftTowards(points.floorCp1, hemSa).rotate(-90, points.floorIn),
          points.floorCp1.shiftTowards(points.floorIn, hemSa).rotate(90, points.floorCp1),
          points.floorIn.shift(180, inseamSa).x
        )

        if (waistbandFishtail) {
          points.saWaistbandFOut = utils.beamsIntersect(
            points.waistOut
              .shiftTowards(points.waistbandFOut, sideSeamSa)
              .rotate(-90, points.waistOut),
            points.waistbandFOut
              .shiftTowards(points.waistOut, sideSeamSa)
              .rotate(90, points.waistbandFOut),
            points.waistbandFOut
              .shiftTowards(points.waistbandFOutCp2, sa)
              .rotate(-90, points.waistbandFOut),
            points.waistbandFOutCp2
              .shiftTowards(points.waistbandFOut, sa)
              .rotate(90, points.waistbandFOutCp2)
          )
          points.saWaistOut = utils.beamsIntersect(
            drawOutseam().offset(sideSeamSa).end(),
            drawOutseam().offset(sideSeamSa).shiftFractionAlong(0.99),
            points.saWaistbandFOut,
            points.saWaistbandFOut.shift(points.waistbandFOut.angle(points.waistOut), 1)
          )
          points.saWaistbandFIn = utils.beamsIntersect(
            points.saWaistbandF,
            points.saWaistbandF.shift(points.waistbandF.angle(points.waistbandFIn), 1),
            points.waistbandFIn
              .shiftTowards(points.waistIn, crossSeamSa)
              .rotate(-90, points.waistbandFIn),
            points.waistIn.shiftTowards(points.waistbandFIn, crossSeamSa).rotate(90, points.waistIn)
          )
          points.saWaistIn = utils.beamsIntersect(
            points.saWaistbandFIn,
            points.saWaistbandFIn.shift(points.waistbandFIn.angle(points.waistIn), 1),
            points.waistOut,
            points.waistIn
          )
        }

        const drawSaWaist = () =>
          waistbandFishtail
            ? new Path()
                .move(points.saWaistOut)
                .line(points.saWaistbandFOut)
                .join(paths.waistbandFCurve.offset(sa))
                .line(points.saWaistbandF)
                .line(points.saWaistbandFIn)
            : new Path().move(points.saWaistOut)

        paths.saCrossSeam = paths.crossSeam
          .split(points.crossSeamCurveStart)[1]
          .offset(crossSeamSa)
          .hide()

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saFloorOut)
          .join(drawOutseam().offset(sideSeamSa))
          .line(points.saWaistOut)
          .join(drawSaWaist())
          .line(points.saWaistIn)
          .line(paths.saCrossSeam.start())
          .join(paths.saCrossSeam)
          .line(points.saUpperLegIn)
          .join(drawInseam().offset(inseamSa))
          .line(points.saFloorIn)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
