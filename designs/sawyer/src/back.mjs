import { back as backPaul } from '@freesewing/paul'
import { front } from './front.mjs'
import { backPocket } from './backPocket.mjs'

export const back = {
  name: 'sawyer.back',
  from: backPaul,
  after: [front, backPocket],
  hide: {
    from: true,
  },
  options: {
    //Pockets
    backPocketBalance: { pct: 55, min: 40, max: 70, menu: 'pockets.backPockets' },
    backPocketPlacement: { pct: 50, min: 20, max: 95, menu: 'pockets.backPockets' },
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
    if (options.backPocketsBool) {
      const backPocketDepth = store.get('backPocketDepth')
      const backPocketWidth = store.get('backPocketWidth')
      const backPocketBottomWidth = backPocketWidth * options.backPocketBottomWidth
      const backPocketPeakDepth = backPocketBottomWidth * options.backPocketPeakDepth * 0.5
      points.backPocketAnchor = utils.beamsIntersect(
        points.seatDart,
        points.dartMid,
        points.waistbandIn,
        points.waistbandOut
      )
      points.backPocketTopAnchor = points.backPocketAnchor.shiftFractionTowards(
        points.seatDart,
        options.backPocketPlacement
      )
      points.backPocketTopIn = points.backPocketTopAnchor.shift(
        points.waistOut.angle(points.waistIn),
        backPocketWidth * options.backPocketBalance
      )
      points.backPocketTopOut = points.backPocketTopAnchor.shift(
        points.waistIn.angle(points.waistOut),
        backPocketWidth * (1 - options.backPocketBalance)
      )
      points.backPocketTopMid = points.backPocketTopIn.shiftFractionTowards(
        points.backPocketTopOut,
        0.5
      )

      points.backPocketBottomMid = points.backPocketTopMid
        .shiftTowards(points.backPocketTopIn, backPocketDepth)
        .rotate(90, points.backPocketTopMid)
      points.backPocketBottomLeft = points.backPocketBottomMid
        .shiftTowards(points.backPocketTopMid, backPocketBottomWidth / 2)
        .rotate(90, points.backPocketBottomMid)
      points.backPocketBottomRight = points.backPocketBottomLeft.rotate(
        180,
        points.backPocketBottomMid
      )
      points.backPocketPeak = points.backPocketTopMid.shiftOutwards(
        points.backPocketBottomMid,
        backPocketPeakDepth
      )
      if (options.backPocketPeakPlateau) {
        points.backPocketPeakCornerIn = utils.beamsIntersect(
          points.backPocketTopIn,
          points.backPocketBottomLeft,
          points.backPocketPeak,
          points.backPocketPeak.shift(points.waistOut.angle(points.waistIn), 1)
        )
        points.backPocketPeakIn = points.backPocketPeakCornerIn.shift(
          points.waistIn.angle(points.waistOut),
          points.backPocketBottomLeft.dist(points.backPocketPeakCornerIn)
        )
        points.backPocketPeakOut = points.backPocketPeak.shift(
          points.waistIn.angle(points.waistOut),
          points.backPocketPeakIn.dist(points.backPocketPeak)
        )
      } else {
        points.backPocketPeakIn = points.backPocketPeak
        points.backPocketPeakOut = points.backPocketPeak
      }

      //stores
      store.set('backPocketWidth', backPocketWidth)
      store.set('backPocketDepth', backPocketDepth)
      if (complete) {
        paths.backPocket = new Path()
          .move(points.backPocketTopIn)
          .line(points.backPocketBottomLeft)
          .line(points.backPocketPeakIn)
          .line(points.backPocketPeakOut)
          .line(points.backPocketBottomRight)
          .line(points.backPocketTopOut)
          .attr('class', 'interfacing lashed')
          .attr('data-text', 'Back Pocket')
          .attr('data-text-class', 'right')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['backPocketTopIn', 'backPocketTopOut'],
        })
      }
      //stores
      store.set('legBandBack', points.floorOut.dist(points.floorIn) * (1 + options.legBandEase))
      store.set('legBandLength', store.get('legBandFront') + store.get('legBandBack'))
    }

    return part
  },
}
