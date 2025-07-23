import { pluginMirror } from '@freesewing/plugin-mirror'
import { frontBase } from './frontBase.mjs'

export const frontPocketBag = {
  name: 'caleb.frontPocketBag',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Pockets
    frontPocketCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.frontPockets' },
    frontPocketWidth: { pct: 85, min: 25, max: 90, menu: 'pockets.frontPockets' },
    frontPocketFolded: { bool: true, menu: 'pockets.frontPockets' },
    frontPocketBagSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'pockets.frontPockets' },
  },
  plugins: [pluginMirror],
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
    //render
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }
    //remove paths
    const keepPaths = ['daltonGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //draw paths
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

    //let's begin
    points.frontPocketWaist = points.frontPocketOpeningWaist.shiftFractionTowards(
      points.flyWaist,
      options.frontPocketWidth
    )
    points.frontPocketBottomMid = utils.beamsIntersect(
      points.frontPocketWaist,
      points.waistOut.rotate(90, points.frontPocketWaist),
      points.frontPocketOut,
      points.frontPocketOut.shift(points.waistOut.angle(points.waistIn), 1)
    )

    points.frontPocketBottomCurveStart = points.frontPocketBottomMid.shiftFractionTowards(
      points.frontPocketOut,
      options.frontPocketCurve * 0.5
    )
    points.frontPocketBottomCurveStartCp2 = points.frontPocketBottomCurveStart.shiftFractionTowards(
      points.frontPocketBottomMid,
      options.cpFraction
    )
    points.frontPocketBottomCurveEndCp1 = points.frontPocketBottomCurveStartCp2.rotate(
      -90,
      points.frontPocketBottomMid
    )
    points.frontPocketBottomCurveEnd = points.frontPocketBottomCurveStart.rotate(
      -90,
      points.frontPocketBottomMid
    )

    paths.outSeam = drawOutseam().split(points.frontPocketOut)[0].hide()
    paths.saBottom = new Path()
      .move(points.frontPocketOut)
      .line(points.frontPocketBottomCurveStart)
      .curve(
        points.frontPocketBottomCurveStartCp2,
        points.frontPocketBottomCurveEndCp1,
        points.frontPocketBottomCurveEnd
      )
      .hide()

    if (
      paths.outSeam.split(points.frontPocketOpeningOut)[1].length() <
      points.frontPocketOpeningWaist.dist(points.frontPocketWaist)
    ) {
      points.frontPocketFacingOut = paths.outSeam
        .split(points.frontPocketOpeningOut)[1]
        .shiftFractionAlong(0.5)
    } else {
      points.frontPocketFacingOut = paths.outSeam
        .split(points.frontPocketOpeningOut)[1]
        .shiftAlong((points.frontPocketOpeningOut.dist(points.frontPocketWaist) * 1) / 3)
    }

    points.frontPocketFacingBottom = points.frontPocketOut.shiftFractionTowards(
      points.frontPocketBottomMid,
      1 / 3
    )

    if (options.frontPocketOpeningStyle == 'slanted') {
      points.frontPocketFacingWaist = utils.beamsIntersect(
        points.waistOut,
        points.frontPocketWaist,
        points.frontPocketFacingOut,
        points.frontPocketFacingOut.shift(
          points.frontPocketOpeningOut.angle(points.frontPocketOpeningWaist),
          1
        )
      )
    } else {
      points.frontPocketFacingWaist = utils.beamsIntersect(
        points.waistOut,
        points.frontPocketWaist,
        points.frontPocketFacingBottom,
        points.frontPocketFacingBottom.shift(
          points.frontPocketBottomMid.angle(points.frontPocketWaist),
          1
        )
      )
    }

    macro('mirror', {
      mirror: [points.frontPocketBottomMid, points.frontPocketWaist],
      points: [
        'frontPocketOpeningOut',
        'frontPocketOpeningTopOut',
        'frontPocketOpeningBottomOut',
        'frontPocketOut',
        'frontPocketFacingOut',
        'frontPocketFacingWaist',
        'frontPocketFacingBottom',
      ],
      paths: ['saBottom', 'outSeam'],
      prefix: 'm',
    })

    //paths
    const drawSeamBottom = () => {
      if (options.frontPocketFolded) {
        return paths.saBottom.join(paths.mSaBottom.reverse()).hide()
      } else {
        return paths.saBottom.line(points.frontPocketWaist).hide()
      }
    }

    const drawSeamRight = () => {
      if (options.frontPocketFolded) {
        return paths.mOutSeam.reverse()
      } else {
        return new Path().move(points.frontPocketWaist).line(points.frontPocketWaist).hide()
      }
    }

    const drawSeamLeft = () => {
      if (options.frontPocketOpeningStyle == 'slanted') {
        return new Path()
          .move(points.frontPocketOpeningWaist)
          .line(points.frontPocketOpeningOut)
          .join(paths.outSeam.split(points.frontPocketOpeningOut)[1])
      } else {
        return paths.outSeam
      }
    }

    paths.seam = drawSeamBottom()
      .join(drawSeamRight())
      .line(
        options.frontPocketOpeningStyle == 'slanted'
          ? points.frontPocketOpeningWaist
          : points.waistOut
      )
      .join(drawSeamLeft())

    if (complete) {
      //grainline
      points.grainlineFrom = points.frontPocketOpeningOut.shiftFractionTowards(
        points.frontPocketOpeningWaist,
        0.5
      )
      points.grainlineTo = utils.beamsIntersect(
        points.grainlineFrom,
        points.grainlineFrom.shift(points.waistOut.angle(points.waistIn) + 90, 1),
        points.frontPocketOut,
        points.frontPocketBottomMid
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.frontPocketOut = new Snippet('notch', points.frontPocketOut)
      if (options.frontPocketOpeningStyle == 'slanted') {
        snippets.frontPocketOpeningOut = new Snippet('notch', points.frontPocketOpeningOut)
      } else {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['frontPocketOpeningTopOut', 'frontPocketOpeningBottomOut'],
        })
      }
      if (options.frontPocketFolded) {
        snippets.mFrontPocketOut = new Snippet('notch', points.mFrontPocketOut)
        if (options.frontPocketCurve > 0)
          snippets.frontPocketBottomCurveEnd = new Snippet(
            'notch',
            points.frontPocketBottomCurveEnd
          )
        if (options.frontPocketOpeningStyle == 'slanted') {
          snippets.mFrontPocketOpeningOut = new Snippet('notch', points.mFrontPocketOpeningOut)
        } else {
          macro('sprinkle', {
            snippet: 'notch',
            on: ['mFrontPocketOpeningTopOut', 'mFrontPocketOpeningBottomOut'],
          })
        }
      }
      //title
      points.title = points.frontPocketOut
        .shiftFractionTowards(points.frontPocketBottomMid, 0.5)
        .shiftFractionTowards(points.frontPocketOpeningWaist, 0.5)
      macro('title', {
        at: points.title,
        nr: 4,
        title: 'Front Pocket Bag',
        cutNr: options.frontPocketOpeningStyle == 'inseam' && !options.frontPocketFolded ? 4 : 2,
        scale: 0.5,
        rotation: 90 - points.frontPocketBottomMid.angle(points.frontPocketWaist),
      })
      //foldine
      if (options.frontPocketFolded) {
        paths.foldline = new Path()
          .move(points.frontPocketWaist)
          .line(points.frontPocketBottomCurveEnd)
          .attr('class', 'mark')
          .attr('data-text', 'Fold - Line')
          .attr('data-text-class', 'center')
      }
      //facing line
      paths.facingLine = new Path()
        .move(
          options.frontPocketOpeningStyle == 'slanted'
            ? points.frontPocketFacingOut
            : points.frontPocketFacingBottom
        )
        .line(points.frontPocketFacingWaist)
        .attr('class', 'mark')
        .attr('data-text', 'Facing - Line')
        .attr('data-text-class', 'center')
      if (options.frontPocketFolded) {
        paths.mFacingLine = new Path()
          .move(points.mFrontPocketFacingWaist)
          .line(
            options.frontPocketOpeningStyle == 'slanted'
              ? points.mFrontPocketFacingOut
              : points.mFrontPocketFacingBottom
          )
          .attr('class', 'mark')
          .attr('data-text', 'Facing - Line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        const frontPocketBagSa = sa * options.frontPocketBagSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        if (options.frontPocketCurve > 0 && options.frontPocketFolded)
          points.frontPocketBottomSplit = paths.saBottom
            .offset(frontPocketBagSa)
            .intersects(paths.mSaBottom.reverse().offset(frontPocketBagSa))[0]

        points.saFrontPocketWaist = points.frontPocketWaist
          .shift(points.waistOut.angle(points.waistIn), frontPocketBagSa)
          .shift(points.frontPocketBottomMid.angle(points.frontPocketWaist), sa)

        points.saFrontPocketOut = utils.beamsIntersect(
          paths.outSeam.offset(sideSeamSa).shiftFractionAlong(0.995),
          paths.outSeam.offset(sideSeamSa).end(),
          points.frontPocketOut
            .shiftTowards(points.frontPocketBottomMid, frontPocketBagSa)
            .rotate(-90, points.frontPocketOut),
          points.frontPocketBottomMid
            .shiftTowards(points.frontPocketOut, frontPocketBagSa)
            .rotate(90, points.frontPocketBottomMid)
        )

        points.saFrontPocketBottomCurveEnd = points.frontPocketBottomCurveEnd
          .shift(points.frontPocketOut.angle(points.frontPocketBottomMid), frontPocketBagSa)
          .shift(points.frontPocketWaist.angle(points.frontPocketBottomMid), frontPocketBagSa)

        macro('mirror', {
          mirror: [points.frontPocketBottomMid, points.frontPocketWaist],
          points: ['saWaistOut', 'saFrontPocketOut'],
          prefix: 'm',
        })

        const drawSaBottom = () => {
          if (options.frontPocketFolded) {
            if (options.frontPocketCurve > 0)
              return paths.saBottom
                .offset(frontPocketBagSa)
                .split(points.frontPocketBottomSplit)[0]
                .join(
                  paths.mSaBottom
                    .reverse()
                    .offset(frontPocketBagSa)
                    .split(points.frontPocketBottomSplit)[1]
                )
                .line(points.mSaFrontPocketOut)
            else return new Path().move(points.saFrontPocketOut).line(points.mSaFrontPocketOut)
          } else {
            if (options.frontPocketCurve > 0)
              return paths.saBottom.offset(frontPocketBagSa).line(points.saFrontPocketWaist)
            else
              return new Path()
                .move(points.saFrontPocketOut)
                .line(points.saFrontPocketBottomCurveEnd)
                .line(points.saFrontPocketWaist)
          }
        }

        const drawSaRight = () => {
          if (options.frontPocketFolded) {
            return paths.mOutSeam.reverse().offset(sideSeamSa).line(points.mSaWaistOut)
          } else {
            return new Path().move(points.saFrontPocketWaist)
          }
        }

        const drawSaWaist = () =>
          options.frontPocketOpeningStyle == 'slanted' && options.frontPocketsBool
            ? new Path()
                .move(drawSaRight().end())
                .line(points.saFrontPocketOpeningWaist)
                .line(points.saFrontPocketOpeningOut)
            : new Path().move(drawSaRight().end()).line(points.saWaistOut)

        const drawSaLeft = () =>
          options.frontPocketOpeningStyle == 'slanted'
            ? new Path()
                .move(drawSaWaist().end())
                .line(points.saFrontPocketOpeningOut)
                .join(paths.outSeam.split(points.frontPocketOpeningOut)[1].offset(sideSeamSa))
            : paths.outSeam.offset(sideSeamSa)

        paths.sa = drawSaBottom()
          .join(drawSaRight())
          .join(drawSaWaist())
          .join(drawSaLeft())
          .line(points.saFrontPocketOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
