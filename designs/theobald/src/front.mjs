import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'theobald.front',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Style
    frontPleatDistance: { pct: 5.1, min: 3, max: 6, menu: 'style' },
    //Pockets
    frontPocketOpeningStyle: {
      dflt: 'slanted',
      list: ['inseam', 'slanted'],
      menu: 'pockets.frontPockets',
    },
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
  }) => {
    //measures
    const flyShieldEx = store.get('flyShieldEx')
    //guides
    const drawInseam = () =>
      options.fitKnee
        ? new Path()
            .move(points.floorIn)
            .curve_(points.floorInCp2, points.kneeIn)
            .curve(points.kneeInCp2, points.upperLegInCp1, points.upperLegIn)
        : new Path()
            .move(points.floorIn)
            .curve(points.floorInCp2, points.upperLegInCp1, points.upperLegIn)

    const drawOutseam = () => {
      if (options.fitKnee) {
        if (points.seatOutAnchor.x < points.seatOut.x)
          return new Path()
            .move(points.waistOut)
            .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(points.waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
            ._curve(points.floorOutCp1, points.floorOut)
      } else {
        if (points.seatOutAnchor.x < points.seatOut.x)
          return new Path()
            .move(points.waistOut)
            .curve(points.seatOut, points.floorOutCp1, points.floorOut)
        else
          return new Path()
            .move(points.waistOut)
            ._curve(points.seatOutCp1, points.seatOut)
            .curve(points.seatOutCp2, points.floorOutCp1, points.floorOut)
      }
    }
    //paths
    paths.flyShieldEx = paths.crotchSeam
      .split(points.flyShieldCrotch)[0]
      .line(points.flyShieldExCrotch)
      .join(
        paths.crotchSeam
          .split(points.flyShieldCrotch)[1]
          .split(points.crotchSeamCurveStart)[0]
          .offset(flyShieldEx)
      )
      .line(points.flyShieldExWaist)
      .line(points.waistIn)

    paths.outseam = drawOutseam().hide()
    paths.saWaist = paths.waist.clone().hide()
    if (options.frontPocketsBool && options.frontPocketOpeningStyle == 'slanted') {
      paths.waist = paths.waist
        .split(points.frontPocketOpeningWaist)[0]
        .line(points.frontPocketOpeningOut)
        .hide()
      paths.outseam = paths.outseam.split(points.frontPocketOpeningOut)[1].hide()
    }

    paths.seam = paths.hemBase
      .clone()
      .join(drawInseam())
      .join(paths.crotchSeam)
      .join(paths.waist)
      .join(paths.outseam)
      .close()
    //pleats
    const frontPleatWidth = store.get('frontPleatWidth')
    if (options.frontPleats) {
      points.frontPleatFromMid0 = utils.curveIntersectsX(
        points.flyWaist,
        points.waistOutEndCp,
        points.waistOutEndCp,
        points.waistOutEnd,
        points.upperLeg.x
      )
      points.frontPleatFromIn0 = paths.waist
        .split(points.frontPleatFromMid0)[0]
        .reverse()
        .shiftAlong(frontPleatWidth * 0.5)
      points.frontPleatFromOut0 = paths.waist
        .split(points.frontPleatFromMid0)[1]
        .shiftAlong(frontPleatWidth * 0.5)
      points.frontPleatFromMid1 = paths.waist
        .split(points.frontPleatFromMid0)[1]
        .shiftAlong(measurements.waist * options.frontPleatDistance + frontPleatWidth)
      points.frontPleatFromIn1 = paths.waist
        .split(points.frontPleatFromMid1)[0]
        .reverse()
        .shiftAlong(frontPleatWidth * 0.5)
      points.frontPleatFromOut1 = paths.waist
        .split(points.frontPleatFromMid1)[1]
        .shiftAlong(frontPleatWidth * 0.5)

      const j = ['Out', 'Mid', 'In']
      for (const p of j) {
        for (let i = 0; i < 2; i++) {
          points['frontPleatTo' + p + i] = points['frontPleatFrom' + p + i].shift(
            points['frontPleatFromIn' + i].angle(points['frontPleatFromOut' + i]) + 90,
            frontPleatWidth * 2
          )
          paths['frontPleat' + p + i] = new Path()
            .move(points['frontPleatFrom' + p + i])
            .line(points['frontPleatTo' + p + i])

          if (complete) {
            if (p == 'Mid') {
              paths['frontPleat' + p + i].attr('class', 'fabric help')
            } else {
              paths['frontPleat' + p + i]
                .attr('data-text', 'Pleat Line')
                .attr('data-text-class', 'center')
            }
          }
        }
      }
    }
    if (complete) {
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['flyCrotch', 'flyShieldCrotch'],
      })
      if (options.frontPocketsBool) {
        snippets.frontPocketOpeningOut = new Snippet('notch', points.frontPocketOpeningOut)
        if (options.frontPocketOpeningStyle == 'slanted') {
          snippets.frontPocketOpeningWaist = new Snippet('notch', points.frontPocketOpeningWaist)
        } else {
          snippets.frontPocketOpeningOutTop = new Snippet('notch', points.frontPocketOpeningOutTop)
        }
      }
      //title
      macro('title', {
        nr: 7,
        title: 'Front',
        at: points.title,
        scale: 0.5,
      })
      //detail paths
      paths.flyShieldExDetail = paths.flyShieldEx
        .split(points.flyShieldExWaist)[0]
        .attr('class', 'fabric hidden')
        .attr('data-text', 'Right Leg Exstention')
        .attr('data-text-class', 'right')

      paths.placketCurve
        .line(points.flyCrotch)
        .unhide()
        .attr('class', 'mark sa')
        .attr('data-text', 'Fly Stitching Line')
        .attr('data-text-class', 'center')
      if (sa) {
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100

        points.saFlyShieldCrotchSplit = paths.crotchSeam
          .offset(crotchSeamSa)
          .intersects(
            new Path()
              .move(
                points.flyShieldCrotch.shift(
                  points.waistIn.angle(points.crotchSeamCurveStart),
                  flyShieldEx
                )
              )
              .line(points.saFlyShieldExCrotch)
          )[0]

        paths.saFlyShieldExDetail = paths.crotchSeam
          .clone()
          .offset(crotchSeamSa)
          .split(points.saFlyShieldCrotchSplit)[0]
          .line(points.saFlyShieldExCrotch)
          .join(
            paths.crotchSeam
              .clone()
              .split(points.crotchSeamCurveStart)[0]
              .split(points.flyShieldCrotch)[1]
              .offset(crotchSeamSa + flyShieldEx)
          )
          .line(points.saWaistInEx)
          .attr('class', 'fabric hidden')
          .attr('data-text', 'Right Leg SA Extension')
          .attr('data-text-class', 'right')
        paths.saFlyShieldEx = paths.saFlyShieldExDetail
          .clone()
          .line(points.saWaistInExCorner)
          .line(points.saWaistIn)
          .attr('class', 'fabric sa', true)
          .attr('data-text', '', true)

        const drawSaWaist = () => {
          if (options.frontPocketsBool && options.frontPocketOpeningStyle == 'slanted') {
            return paths.saWaist
              .split(points.frontPocketOpeningWaist)[0]
              .offset(sa)
              .line(points.saFrontPocketOpeningWaist)
              .line(points.saFrontPocketOpeningOut)
          } else {
            return paths.saWaist.offset(sa).line(points.saWaistOut)
          }
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(sa * options.hemWidth * 100)
          .line(points.saFloorIn)
          .join(drawInseam().offset(sa * options.inseamSaWidth * 100))
          .line(points.saUpperLegIn)
          .join(paths.crotchSeam.offset(crotchSeamSa))
          .line(points.saWaistIn)
          .join(drawSaWaist())
          .join(paths.outseam.offset(sa * options.sideSeamSaWidth * 100))
          .line(points.saFloorOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
