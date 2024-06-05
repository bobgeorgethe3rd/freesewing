import { back as backDalton } from '@freesewing/dalton'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { front } from './front.mjs'

export const back = {
  name: 'paul.back',
  from: backDalton,
  after: front,
  hide: {
    from: true,
  },
  options: {
    //Constants
    backDartWidth: 0, //Locked for Paul
    backDartDepth: 0, //Locked for Paul
    backDartMultiplier: 0.95, //Locked for Paul
    backDartPlacement: 0.625, //Locked for Paul
    //Construction
    crossSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Paul
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
    log,
    absoluteOptions,
  }) => {
    //delete paths
    delete paths.sa
    //measurements
    const waistbandWidth = absoluteOptions.waistbandWidth
    //draw guides
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
    //let's begin
    points.waistbandAnchor = points.waistOut
      .shiftFractionTowards(points.waistIn, 0.5)
      .shift(points.waistOut.angle(points.waistIn) + 90, waistbandWidth)
    points.waistbandIn = utils.beamsIntersect(
      points.waistbandAnchor,
      points.waistbandAnchor.shift(points.waistOut.angle(points.waistIn), 1),
      points.waistIn,
      points.crossSeamCurveStart
    )
    if (points.waistbandIn.y > points.crossSeamCurveStart.y) {
      points.waistbandIn = utils.lineIntersectsCurve(
        points.waistbandAnchor,
        points.waistbandAnchor.shift(
          points.waistOut.angle(points.waistIn),
          points.waistOut.dist(points.waistIn) * 2
        ),
        points.crossSeamCurveStart,
        points.crossSeamCurveStartCp1,
        points.upperLegInCp1,
        points.upperLegIn
      )
    }
    points.waistbandOut = drawOutseam().intersects(
      new Path()
        .move(points.waistbandAnchor)
        .line(
          points.waistbandAnchor.shift(
            points.waistIn.angle(points.waistOut),
            points.waistIn.dist(points.waistOut) * 2
          )
        )
    )[0]
    paths.waistbandOutSeam = drawOutseam().split(points.waistbandOut)[1].reverse().hide()
    macro('mirror', {
      mirror: [points.waistOut, points.waistIn],
      paths: ['waistbandOutSeam'],
      points: ['waistbandIn', 'waistbandOut'],
      prefix: 'm',
    })
    //paths
    paths.waistband = paths.mWaistbandOutSeam
      .clone()
      .line(points.mWaistbandIn)
      .line(points.waistIn)
      .unhide()
    //pockets
    if (options.frontPocketsBool) {
      const frontPocketOpeningTopDepth = store.get('frontPocketOpeningTopDepth')
      points.frontPocketOpeningTopOut = drawOutseam()
        .reverse()
        .shiftAlong(frontPocketOpeningTopDepth)
      points.frontPocketOpeningBottomOut = drawOutseam()
        .reverse()
        .shiftAlong(frontPocketOpeningTopDepth + store.get('frontPocketOpeningDepth'))
      if (complete) {
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: ['frontPocketOpeningTopOut', 'frontPocketOpeningBottomOut'],
        })
      }
    }

    if (complete) {
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['waistIn', 'waistOut'],
      })
      //logo
      points.logo = points.knee
      macro('logorg', { at: points.logo, scale: 0.5 })
      //lines
      paths.foldline = new Path()
        .move(points.waistIn)
        .line(points.waistOut)
        .attr('class', 'mark')
        .attr('data-text', 'Fold - Line')
        .attr('data-text-class', 'center')

      paths.waistbandStitchline = new Path()
        .move(points.waistbandIn)
        .line(points.waistbandOut)
        .attr('class', 'mark lashed')
        .attr('data-text', 'Stitching - Line')
        .attr('data-text-class', 'center')
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const crossSeamSa = sa * options.crossSeamSaWidth * 100

        points.saWaistOut = utils.beamsIntersect(
          drawOutseam().offset(sideSeamSa).shiftFractionAlong(0.995),
          drawOutseam().offset(sideSeamSa).end(),
          paths.mWaistbandOutSeam.offset(sideSeamSa).start(),
          paths.mWaistbandOutSeam.offset(sideSeamSa).shiftFractionAlong(0.005)
        )
        points.saMWaistbandOut = utils.beamsIntersect(
          paths.mWaistbandOutSeam.offset(sideSeamSa).shiftFractionAlong(0.995),
          paths.mWaistbandOutSeam.offset(sideSeamSa).end(),
          points.mWaistbandOut
            .shiftTowards(points.mWaistbandIn, sa)
            .rotate(-90, points.mWaistbandOut),
          points.mWaistbandIn.shiftTowards(points.mWaistbandOut, sa).rotate(90, points.mWaistbandIn)
        )
        points.saMWaistbandIn = utils.beamsIntersect(
          points.saMWaistbandOut,
          points.saMWaistbandOut.shift(points.mWaistbandOut.angle(points.mWaistbandIn), 1),
          points.mWaistbandIn
            .shiftTowards(points.waistIn, crossSeamSa)
            .rotate(-90, points.mWaistbandIn),
          points.waistIn.shiftTowards(points.mWaistbandIn, crossSeamSa).rotate(90, points.waistIn)
        )

        points.saWaistIn = utils.beamsIntersect(
          points.saMWaistbandIn,
          points.saMWaistbandIn.shift(points.mWaistbandIn.angle(points.waistIn), 1),
          points.waistIn
            .shiftTowards(points.crossSeamCurveStart, crossSeamSa)
            .rotate(-90, points.waistIn),
          points.crossSeamCurveStart
            .shiftTowards(points.waistIn, crossSeamSa)
            .rotate(90, points.crossSeamCurveStart)
        )

        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .line(points.saFloorOut)
          .join(drawOutseam().offset(sideSeamSa))
          .line(points.saWaistOut)
          .join(paths.mWaistbandOutSeam.offset(sideSeamSa))
          .line(points.saMWaistbandOut)
          .line(points.saMWaistbandIn)
          .line(points.saWaistIn)
          .join(paths.crossSeam.offset(crossSeamSa).split(points.saWaistIn)[1])
          .line(points.saUpperLegIn)
          .join(drawInseam().offset(sa * options.inseamSaWidth * 100))
          .line(points.saFloorIn)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
