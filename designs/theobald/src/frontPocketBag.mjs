import { frontBase } from './frontBase.mjs'

export const frontPocketBag = {
  name: 'theobald.frontPocketBag',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketDepth: { pct: 36.8, min: 30, max: 50, menu: 'pockets.frontPockets' },
    frontPocketWidth: { pct: (2 / 3) * 100, min: 50, max: 75, menu: 'pockets.frontPockets' },
    frontPocketOgDepth: { pct: 16.8, min: 15, max: 20, menu: 'pockets.frontPockets' },
    frontPocketStyle: { dflt: 'pear', list: ['pear', 'original'], menu: 'pockets.frontPockets' },
    //Construction
    frontPocketBagSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
    //set Render
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Dalton
    for (let i in paths) delete paths[i]
    //measurements
    const frontPocketDepth = store.get('frontPocketOpeningDepth') * (1 + options.frontPocketDepth)
    let frontPocketOgDepth
    if (
      points.styleWaistIn.dist(points.crotchSeamCurveStart) <
      measurements.crossSeamFront * options.frontPocketOgDepth
    ) {
      frontPocketOgDepth = points.styleWaistIn.dist(points.crotchSeamCurveStart)
    } else {
      frontPocketOgDepth = measurements.crossSeamFront * options.frontPocketOgDepth
    }
    //let's begin
    points.frontPocketWaist = points.styleWaistOut.shiftFractionTowards(
      points.styleWaistIn,
      options.frontPocketWidth
    )
    points.frontPocketWaistR = points.styleWaistOutR.shiftTowards(
      points.styleWaistInR,
      points.styleWaistOut.dist(points.frontPocketWaist) + (store.get('frontPleatWidth') * 5) / 6
    )
    points.frontPocketOgWaist = points.styleWaistIn
    points.frontPocketOgWaistR = points.styleWaistOutR.shiftTowards(
      points.styleWaistInR,
      points.styleWaistOut.dist(points.frontPocketOgWaist)
    )

    const suffix = ['', 'R']
    for (const p of suffix) {
      const drawOutseam = () => {
        let waistOut = points['styleWaistOut' + p] || points['waistOut' + p]
        if (options.fitKnee || options.fitFloor) {
          if (options.frontPleats || options.fitFloor) {
            if (points.waistOut.x < points.seatOut.x)
              return new Path()
                .move(waistOut)
                .curve(points['seatOut' + p], points['kneeOutCp1' + p], points['kneeOut' + p])
            // ._curve(points['floorOutCp1' + p], points.floorOut)
            else
              return new Path()
                .move(waistOut)
                ._curve(points['seatOutCp1' + p], points['seatOut' + p])
                .curve(points['seatOutCp2' + p], points['kneeOutCp1' + p], points['kneeOut' + p])
            // ._curve(points['floorOutCp1' + p], points.floorOut)
          } else {
            if (points.waistOut.x < points.seatOut.x)
              return new Path()
                .move(waistOut)
                .curve(points['seatOut' + p], points['kneeOutCp1' + p], points['kneeOut' + p])
            // .line(points.floorOut)
            else
              return new Path()
                .move(waistOut)
                ._curve(points['seatOutCp1' + p], points['seatOut' + p])
                .curve(points['seatOutCp2' + p], points['kneeOutCp1' + p], points['kneeOut' + p])
            // .line(points.floorOut)
          }
        } else {
          if (points.waistOut.x < points.seatOut.x)
            return new Path()
              .move(waistOut)
              .curve(points['seatOut' + p], points.kneeOutCp1, points.floorOut)
          else
            return new Path()
              .move(waistOut)
              ._curve(points['seatOutCp1' + p], points['seatOut' + p])
              .curve(points['seatOutCp2' + p], points.kneeOutCp1, points.floorOut)
        }
      }

      //all
      points['frontPocketBottomLeftTarget' + p] = drawOutseam()
        .shiftAlong(frontPocketDepth)
        .rotate(5, points['frontPocketOpeningOut' + p])
      points['frontPocketCp1' + p] = points['frontPocketOpeningOut' + p].shiftFractionTowards(
        points['frontPocketBottomLeftTarget' + p],
        2 / 3
      )
      points['frontPocketBottom' + p] = utils.beamsIntersect(
        points['frontPocketBottomLeftTarget' + p],
        points['frontPocketBottomLeftTarget' + p].shift(
          points['styleWaistOut' + p].angle(points['styleWaistIn' + p]),
          1
        ),
        points['frontPocketWaist' + p],
        points['styleWaistOut' + p].rotate(90, points['frontPocketWaist' + p])
      )
      points['frontPocketBottomLeft' + p] = points['frontPocketBottom' + p].shiftFractionTowards(
        points['frontPocketBottomLeftTarget' + p],
        0.9
      )

      paths['outSeam' + p] = drawOutseam()
        .split(points['frontPocketOpeningOut' + p])[0]
        .hide()

      macro('mirror', {
        mirror: [points['frontPocketWaist' + p], points['frontPocketBottom' + p]],
        paths: ['outSeam' + p],
        points: [
          'frontPocketOpening' + p,
          'frontPocketOpeningOut' + p,
          'frontPocketCp1' + p,
          'frontPocketBottomLeft' + p,
        ],
        prefix: 'm',
      })

      //og
      points['frontPocketCp2' + p] = points['frontPocketCp1' + p].shiftFractionTowards(
        points['frontPocketBottomLeft' + p],
        3
      )
      points['frontPocketBottomRight' + p] = points['frontPocketOgWaist' + p].shift(
        points['styleWaistIn' + p].angle(points['crotchSeamCurveStart' + p]),
        frontPocketOgDepth
      )

      const cpAngle =
        points['frontPocketBottom' + p].angle(points['frontPocketBottomLeft' + p]) +
        (points['frontPocketBottom' + p].angle(points['frontPocketBottomLeft' + p]) +
          180 -
          points['frontPocketBottomLeft' + p].angle(points['frontPocketCp2' + p]))

      points['frontPocketCp3' + p] = points['frontPocketBottom' + p].shift(
        cpAngle,
        points['frontPocketBottomLeft' + p].dist(points['frontPocketCp2' + p])
      )
      points['frontPocketCp4' + p] = points['frontPocketCp3' + p].rotate(
        180,
        points['frontPocketBottom' + p]
      )
      points['frontPocketCp5' + p] = points['frontPocketBottomRight' + p]
        .shiftTowards(
          points['frontPocketOgWaist' + p],
          points['frontPocketCp1' + p].dist(points['frontPocketBottomLeft' + p])
        )
        .rotate(90, points['frontPocketBottomRight' + p])

      //facing
      points['frontPocketFacingWaist' + p] = utils.beamsIntersect(
        points['frontPocketBottomLeft' + p],
        points['frontPocketBottomLeft' + p].shift(
          points['frontPocketOpeningOut' + p].angle(points['frontPocketOpeningWaist' + p]),
          1
        ),
        points['styleWaistOut' + p],
        points['styleWaistIn' + p]
      )

      //guides
      // paths['frontPocket' + p] = new Path()
      // .move(points['frontPocketOpeningOut' + p])
      // .curve_(points['frontPocketCp1' + p], points['frontPocketBottomLeft' + p])
      // .line(points['mFrontPocketBottomLeft' + p])
      // ._curve(points['mFrontPocketCp1' + p], paths['mOutSeam' + p].end())
      // .join(paths['mOutSeam' + p].reverse())
      // .line(points['frontPocketOpeningWaist' + p])
      // .line(points['frontPocketOpeningOut' + p])

      // paths['og' + p] = new Path()
      // .move(points['frontPocketBottomLeft' + p])
      // .curve(points['frontPocketCp2' + p], points['frontPocketCp3' + p], points['frontPocketBottom' + p])
      // .curve(points['frontPocketCp4' + p], points['frontPocketCp5' + p], points['frontPocketBottomRight' + p])
      // .line(points['frontPocketOgWaist' + p])
      // .line(points['styleWaistOut' + p])

      // if (p == 'R'){
      // paths['frontPocket' + p].attr('class', 'canvas')
      // paths['og' + p].attr('class', 'canvas')
      // }
    }

    //paths
    const suf = store.get('frontPleatSuffix')

    const drawSaLeft = () => {
      if (options.frontPocketOpeningStyle == 'slanted' && options.frontPocketStyle == 'pear') {
        return new Path()
          .move(points['frontPocketOpeningWaist' + suf])
          .line(points['frontPocketOpeningOut' + suf])
      } else {
        return paths['outSeam' + suf]
      }
    }

    const drawSeamBottom = () => {
      if (options.frontPocketStyle == 'pear') {
        return new Path()
          .move(points['frontPocketOpeningOut' + suf])
          .curve_(points['frontPocketCp1' + suf], points['frontPocketBottomLeft' + suf])
          .line(points['mFrontPocketBottomLeft' + suf])
          ._curve(points['mFrontPocketCp1' + suf], points['mFrontPocketOpeningOut' + suf])
      } else {
        return new Path()
          .move(points['frontPocketOpeningOut' + suf])
          .curve_(points['frontPocketCp1' + suf], points['frontPocketBottomLeft' + suf])
          .curve(
            points['frontPocketCp2' + suf],
            points['frontPocketCp3' + suf],
            points['frontPocketBottom' + suf]
          )
          .curve(
            points['frontPocketCp4' + suf],
            points['frontPocketCp5' + suf],
            points['frontPocketBottomRight' + suf]
          )
      }
    }

    const drawSaRight = () => {
      if (options.frontPocketStyle == 'pear') {
        return paths['mOutSeam' + suf].reverse()
      } else {
        return new Path()
          .move(points['frontPocketBottomRight' + suf])
          .line(points['frontPocketOgWaist' + suf])
      }
    }

    const drawSaWaist = () => {
      if (options.frontPocketStyle == 'pear' && options.frontPocketOpeningStyle == 'slanted') {
        return new Path().move(drawSaRight().end()).line(points['frontPocketOpeningWaist' + suf])
      } else {
        return new Path().move(drawSaRight().end()).line(points['styleWaistOut' + suf])
      }
    }

    paths.seam = drawSaLeft().join(drawSeamBottom()).join(drawSaRight()).join(drawSaWaist())

    if (complete) {
      //grainline
      points.grainlineFrom = points['frontPocketOpeningWaist' + suf].shiftFractionTowards(
        points['frontPocketWaist' + suf],
        0.5
      )
      points.grainlineTo = utils.beamsIntersect(
        points.grainlineFrom,
        points['frontPocketOpeningWaist' + suf].rotate(90, points.grainlineFrom),
        points['frontPocketBottomLeft' + suf],
        points['frontPocketBottom' + suf]
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['frontPocketOpeningOut' + suf, 'mFrontPocketOpeningOut' + suf],
      })
      if (options.frontPocketOpeningStyle == 'inseam') {
        snippets.frontPocketOpening = new Snippet('notch', points['frontPocketOpening' + suf])
        if (options.frontPocketStyle == 'pear') {
          snippets.mFrontPocketOpening = new Snippet('notch', points['mFrontPocketOpening' + suf])
        }
      }
      //title
      let titleSuffix
      if (options.frontPocketStyle == 'original' && options.frontPocketOpeningStyle == 'slanted') {
        titleSuffix = 'a'
      } else {
        titleSuffix = ''
      }
      points.title = points['frontPocketOpeningWaist' + suf].shift(
        points['styleWaistIn' + suf].angle(points['frontPocketOpeningWaist' + suf]) + 90,
        points['frontPocketWaist' + suf].dist(points['frontPocketBottom' + suf]) * 0.5
      )
      macro('title', {
        nr: 7 + titleSuffix,
        title: 'Front Pocket Bag ' + utils.capitalize(titleSuffix),
        at: points.title,
        scale: 0.5,
        rotation: 90 - points['frontPocketBottom' + suf].angle(points['frontPocketWaist' + suf]),
      })
      //foldline
      if (options.frontPocketStyle == 'pear') {
        paths.foldline = new Path()
          .move(points['frontPocketWaist' + suf])
          .line(points['frontPocketBottom' + suf])
          .attr('class', 'mark')
          .attr('data-text', 'Fold - line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        let outSeamSa = sa * options.outSeamSaWidth * 100
        let bagSa = sa * options.frontPocketBagSaWidth * 100
        let leftSa
        if (options.frontPocketStyle == 'pear' && options.frontPocketOpeningStyle == 'slanted') {
          leftSa = sa
        } else {
          leftSa = outSeamSa
        }
        let rightSa
        if (options.frontPocketStyle == 'pear') {
          rightSa = outSeamSa
        } else {
          rightSa = sa * options.crotchSeamSaWidth * 100
        }
        points['frontPocketCp4Sa' + suf] = points['frontPocketBottom' + suf]
          .shiftOutwards(points['frontPocketCp4' + suf], bagSa)
          .shift(
            points['frontPocketBottom' + suf].angle(points['frontPocketCp4' + suf]) - 90,
            bagSa
          )

        let saAngle = points['frontPocketCp5' + suf].angle(points['frontPocketBottomRight' + suf])

        points['frontPocketCp5Sa' + suf] = points['frontPocketCp5' + suf]
          .shiftTowards(points['frontPocketBottomRight' + suf], bagSa)
          .shift(saAngle - 90, bagSa)

        points['frontPocketBottomRightSa' + suf] = points['frontPocketBottomRight' + suf]
          .shift(saAngle, bagSa)
          .shift(saAngle - 90, bagSa)

        const drawSaBottom = () => {
          if (options.frontPocketStyle == 'pear') {
            return drawSeamBottom().offset(bagSa)
          } else {
            return new Path()
              .move(points['frontPocketOpeningOut' + suf])
              .curve_(points['frontPocketCp1' + suf], points['frontPocketBottomLeft' + suf])
              .curve(
                points['frontPocketCp2' + suf],
                points['frontPocketCp3' + suf],
                points['frontPocketBottom' + suf]
              )
              .offset(bagSa)
              .curve(
                points['frontPocketCp4Sa' + suf],
                points['frontPocketCp5Sa' + suf],
                points['frontPocketBottomRightSa' + suf]
              )
          }
        }

        paths.sa = drawSaLeft()
          .offset(leftSa)
          .join(drawSaBottom())
          .join(drawSaRight().offset(rightSa))
          .join(drawSaWaist().offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
