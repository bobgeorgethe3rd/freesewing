import { front } from './front.mjs'

export const frontPocketBag = {
  name: 'paul.frontPocketBag',
  from: front,
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Fit
    daltonGuides: { bool: false, menu: 'fit' },
    //Pockets
    frontPocketWidth: { pct: 75, min: 30, max: 80, menu: 'pockets.frontPockets' },
    frontPocketDepth: { pct: 52.5, min: 10, max: 100, menu: 'pockets.frontPockets' },
    frontPocketCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.frontPockets' },
    frontPocketFacingWidth: { pct: 75, min: 50, max: 100, menu: 'pockets.frontPockets' },
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
    //setRender
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }
    //delete paths & snippets
    const keepThese = ['seam']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    delete points.eyelet
    //remove macros
    macro('title', false)
    //measures
    const frontPocketOpeningTopDepth = store.get('frontPocketOpeningTopDepth')
    const frontPocketOpeningDepth = store.get('frontPocketOpeningDepth')
    //let's begin
    const drawOutseam = () => {
      if (options.fitKnee) {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
        } else {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
        }
      } else {
        if (options.fitCalf) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.calfOutCp1, points.calfOut)
              .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
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
    }

    points.frontPocketWaist = points.waistbandOut.shiftFractionTowards(
      points.waistbandIn,
      options.frontPocketWidth
    )
    points.frontPocketOut = drawOutseam().shiftAlong(
      frontPocketOpeningTopDepth +
        frontPocketOpeningDepth +
        (store.get('pocketMaxDepth') - frontPocketOpeningTopDepth - frontPocketOpeningDepth) *
          options.frontPocketDepth
    )
    points.frontPocketBottomRight = utils.beamsIntersect(
      points.frontPocketWaist,
      points.waistbandOut.rotate(90, points.frontPocketWaist),
      points.frontPocketOut,
      points.frontPocketOut.shift(points.waistbandOut.angle(points.waistbandIn), 1)
    )

    points.frontPocketCurveStart = points.frontPocketBottomRight.shiftFractionTowards(
      points.frontPocketOut,
      0.5 * options.frontPocketCurve
    )
    points.frontPocketCurveEnd = points.frontPocketCurveStart.rotate(
      -90,
      points.frontPocketBottomRight
    )
    points.frontPocketCurveStartCp2 = points.frontPocketCurveStart.shiftFractionTowards(
      points.frontPocketBottomRight,
      options.cpFraction
    )
    points.frontPocketCurveEndCp1 = points.frontPocketCurveStartCp2.rotate(
      -90,
      points.frontPocketBottomRight
    )
    //facing
    points.frontPocketFacingBottom = points.frontPocketOut.shiftFractionTowards(
      points.frontPocketBottomRight,
      0.5 * options.frontPocketFacingWidth
    )
    points.frontPocketFacingWaist = utils.beamsIntersect(
      points.frontPocketFacingBottom,
      points.frontPocketOut.rotate(-90, points.frontPocketFacingBottom),
      points.waistbandOut,
      points.waistbandIn
    )
    //paths
    paths.bottom = new Path()
      .move(points.frontPocketOut)
      .line(points.frontPocketCurveStart)
      .curve(
        points.frontPocketCurveStartCp2,
        points.frontPocketCurveEndCp1,
        points.frontPocketCurveEnd
      )
      .line(points.frontPocketWaist)
      .hide()

    paths.outseam = drawOutseam()
      .split(points.frontPocketOut)[0]
      .split(points.waistbandOut)[1]
      .hide()

    paths.seam = paths.bottom.clone().line(points.waistbandOut).join(paths.outseam).close()

    if (complete) {
      //grainline
      points.grainlineTo = points.frontPocketOut.shiftFractionTowards(
        points.frontPocketBottomRight,
        0.1
      )
      points.grainlineFrom = utils.beamsIntersect(
        points.grainlineTo,
        points.frontPocketOut.rotate(-90, points.grainlineTo),
        points.waistbandOut,
        points.waistbandIn
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontPocketOpeningTopOut', 'frontPocketOpeningBottomOut'],
      })
      //title
      points.title = points.frontPocketFacingWaist
        .shift(
          points.waistbandOut.angle(points.waistbandIn),
          points.frontPocketFacingWaist.dist(points.waistbandIn) * 0.25
        )
        .shift(
          points.frontPocketWaist.angle(points.frontPocketBottomRight),
          points.frontPocketWaist.dist(points.frontPocketBottomRight) * 0.5
        )
      macro('title', {
        nr: 3,
        title: 'Front Pocket Bag',
        at: points.title,
        scale: 0.5,
        rotation: 90 - points.frontPocketBottomRight.angle(points.frontPocketWaist),
      })
      //facing
      paths.facingLine = new Path()
        .move(points.frontPocketFacingWaist)
        .line(points.frontPocketFacingBottom)
        .attr('class', 'mark')
        .attr('data-text', 'Facing - Line')
        .attr('data-text-class', 'center')
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saFrontPocketOut = utils.beamsIntersect(
          paths.outseam.offset(sideSeamSa).shiftFractionAlong(0.995),
          paths.outseam.offset(sideSeamSa).end(),
          points.frontPocketOut
            .shiftTowards(points.frontPocketBottomRight, sideSeamSa)
            .rotate(-90, points.frontPocketOut),
          points.frontPocketBottomRight
            .shiftTowards(points.frontPocketOut, sideSeamSa)
            .rotate(90, points.frontPocketBottomRight)
        )

        points.saFrontPocketBottomRight = points.frontPocketBottomRight
          .shift(points.frontPocketOut.angle(points.frontPocketBottomRight), sideSeamSa)
          .shift(points.frontPocketWaist.angle(points.frontPocketBottomRight), sideSeamSa)

        points.saFrontPocketWaist = points.frontPocketWaist
          .shift(points.waistbandOut.angle(points.waistbandIn), sideSeamSa)
          .shift(points.frontPocketBottomRight.angle(points.frontPocketWaist), sa)

        points.saWaistbandOut = utils.beamsIntersect(
          points.saFrontPocketWaist,
          points.saFrontPocketWaist.shift(points.frontPocketWaist.angle(points.waistbandOut), 1),
          paths.outseam.offset(sideSeamSa).start(),
          paths.outseam.offset(sideSeamSa).shiftFractionAlong(0.005)
        )

        const drawSaBottom = () => {
          if (options.frontPocketCurve == 0) {
            return new Path().move(points.saFrontPocketOut).line(points.saFrontPocketBottomRight)
          } else {
            return paths.bottom.offset(sideSeamSa)
          }
        }

        paths.sa = drawSaBottom()
          .line(points.saFrontPocketWaist)
          .line(points.saWaistbandOut)
          .join(paths.outseam.offset(sideSeamSa))
          .line(points.saFrontPocketOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
