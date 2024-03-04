import { pluginMirror } from '@freesewing/plugin-mirror'
import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'

export const frontPocketBag = {
  name: 'theobald.frontPocketBag',
  from: frontBase,
  after: front,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketDepth: { pct: 45, min: 30, max: 50, menu: 'pockets.frontPockets' },
    frontPocketStyle: { dflt: 'pear', list: ['original', 'pear'], menu: 'pockets.frontPockets' },
    frontPocketWidth: { pct: 72.5, min: 50, max: 75, menu: 'pockets.frontPockets' },
    //Construction
    frontPocketBagSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
    //setRender
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }
    //remove path
    delete paths.grainline
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    //path guides
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
    //let's begin
    points.frontPocketOpeningOutAnchor = drawOutseam()
      .split(points.frontPocketOpeningOut)[0]
      .shiftFractionAlong(0.995)
    points.frontPocketWaist = paths.waist
      .reverse()
      .shiftAlong(store.get('styleWaistFront') * 0.5 * options.frontPocketWidth)
    points.frontPocketWaistAnchor = paths.waist
      .reverse()
      .shiftAlong(store.get('styleWaistFront') * 0.5 * options.frontPocketWidth * 0.99)
    points.frontPocketOpeningMid = utils.beamsIntersect(
      points.frontPocketOpeningOut,
      points.frontPocketOpeningOut.shift(
        points.frontPocketWaistAnchor.angle(points.frontPocketWaist),
        1
      ),
      points.frontPocketWaist,
      points.frontPocketWaistAnchor.rotate(90, points.frontPocketWaist)
    )
    points.frontPocketBottomMid = points.frontPocketWaist.shiftOutwards(
      points.frontPocketOpeningMid,
      (measurements.waistToKnee - measurements.waistToHips - waistbandWidth) *
        options.frontPocketOpeningDepth *
        options.frontPocketDepth
    )
    points.frontPocketBottomLeft = points.frontPocketBottomMid.shift(
      points.frontPocketBottomMid.angle(points.frontPocketWaist) + 90,
      points.frontPocketOpeningMid.dist(points.frontPocketOpeningOut) * 0.9
    )
    points.frontPocketOpeningOutCp2 = points.frontPocketOpeningOut.shift(
      points.frontPocketOpeningOutAnchor.angle(points.frontPocketOpeningOut),
      (points.frontPocketOpeningMid.dist(points.frontPocketBottomMid) * 2) / 3
    )
    points.frontPocketFacingOut = new Path()
      .move(points.frontPocketBottomLeft)
      .line(
        points.frontPocketBottomLeft.shift(
          points.frontPocketOpeningOut.angle(points.frontPocketOpeningWaist),
          points.frontPocketOpeningOut.dist(points.frontPocketOpeningWaist) * 2
        )
      )
      .intersects(paths.waist)[0]
    //og points
    points.frontPocketOut = paths.waist.reverse().shiftAlong(store.get('styleWaistFront') * 0.5)
    points.frontPocketOutAnchor = paths.waist
      .reverse()
      .shiftAlong(store.get('styleWaistFront') * 0.499)

    points.frontPocketPivot = utils.beamsIntersect(
      points.frontPocketBottomLeft,
      points.frontPocketOpeningOutCp2.rotate(-90, points.frontPocketBottomLeft),
      points.frontPocketBottomLeft.shiftFractionTowards(points.frontPocketBottomMid, 0.5),
      points.frontPocketBottomLeft
        .shiftFractionTowards(points.frontPocketBottomMid, 0.5)
        .shift(points.frontPocketBottomMid.angle(points.frontPocketWaist), 1)
    )
    const cpDistance =
      (4 / 3) *
      points.frontPocketPivot.dist(points.frontPocketBottomLeft) *
      Math.tan(
        utils.deg2rad(
          (points.frontPocketPivot.angle(points.frontPocketBottomMid) -
            points.frontPocketPivot.angle(points.frontPocketBottomLeft)) /
            4
        )
      )

    points.frontPocketBottomLeftCp2 = points.frontPocketBottomLeft
      .shiftTowards(points.frontPocketPivot, cpDistance)
      .rotate(-90, points.frontPocketBottomLeft)
    points.frontPocketBottomMidCp1 = points.frontPocketBottomMid
      .shiftTowards(points.frontPocketPivot, cpDistance)
      .rotate(90, points.frontPocketBottomMid)
    points.frontPocketBottomOut = points.frontPocketOut.shift(
      points.waistIn.angle(points.crotchSeamCurveStart),
      measurements.waistToSeat - measurements.waistToHips - waistbandWidth
    )
    points.frontPocketBottomMidCp2 = points.frontPocketBottomMidCp1.rotate(
      180,
      points.frontPocketBottomMid
    )
    points.frontPocketBottomOutCp1 = points.frontPocketBottomOut.shift(
      points.frontPocketBottomOut.angle(points.frontPocketOut) + 90,
      points.frontPocketBottomOut.dx(points.frontPocketBottomMidCp2) * -1
    )

    //guides
    // paths.guide = new Path()
    // .move(points.frontPocketOpeningWaist)
    // .line(points.frontPocketOpeningOut)
    // .curve_(points.frontPocketOpeningOutCp2, points.frontPocketBottomLeft)
    // .line(points.frontPocketBottomMid)
    // .line(points.frontPocketOpeningMid)
    // .line(points.frontPocketWaist)
    // .line(points.frontPocketOpeningWaist)
    // .move(points.frontPocketBottomLeft)
    // .curve(points.frontPocketBottomLeftCp2, points.frontPocketBottomMidCp1, points.frontPocketBottomMid)
    // .curve(points.frontPocketBottomMidCp2, points.frontPocketBottomOutCp1, points.frontPocketBottomOut)
    // .line(points.frontPocketOut)
    // .attr('class', 'interfacing')
    //paths
    paths.outSeam = drawOutseam().split(points.frontPocketOpeningOut)[0].hide()
    paths.curve = new Path()
      .move(points.frontPocketOpeningOut)
      .curve_(points.frontPocketOpeningOutCp2, points.frontPocketBottomLeft)
      .hide()
    paths.waistSplit = paths.waist.split(points.frontPocketWaist)[1].hide()

    macro('mirror', {
      mirror: [points.frontPocketWaist, points.frontPocketBottomMid],
      paths: ['outSeam', 'curve', 'waistSplit'],
      points: ['frontPocketOpeningOutTop', 'frontPocketOpeningOut', 'frontPocketBottomLeft'],
      prefix: 'm',
    })
    paths.saBase = paths.curve
      .clone()
      .curve(
        points.frontPocketBottomLeftCp2,
        points.frontPocketBottomMidCp1,
        points.frontPocketBottomMid
      )
      .curve(
        points.frontPocketBottomMidCp2,
        points.frontPocketBottomOutCp1,
        points.frontPocketBottomOut
      )
      .hide()

    const drawSeam = () => {
      if (options.frontPocketStyle == 'original') {
        return paths.outSeam
          .join(paths.saBase)
          .line(points.frontPocketOut)
          .join(paths.waist.split(points.frontPocketOut)[1])
      } else {
        if (options.frontPocketOpeningStyle == 'inseam') {
          return paths.outSeam
            .join(paths.curve)
            .line(points.mFrontPocketBottomLeft)
            .join(paths.mCurve.reverse())
            .join(paths.mOutSeam.reverse())
            .join(paths.mWaistSplit.reverse())
            .join(paths.waistSplit.split(points.frontPocketOpeningWaist)[0])
        } else {
          return paths.curve
            .clone()
            .line(points.mFrontPocketBottomLeft)
            .join(paths.mCurve.reverse())
            .join(paths.mOutSeam.reverse())
            .join(paths.mWaistSplit.reverse())
            .join(paths.waistSplit.split(points.frontPocketOpeningWaist)[0])
            .line(points.frontPocketOpeningOut)
        }
      }
    }

    paths.seam = drawSeam().close().unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = points.frontPocketOpeningWaist.shiftFractionTowards(
        points.frontPocketWaist,
        0.15
      )
      points.grainlineTo = points.grainlineFrom.shift(
        points.frontPocketWaist.angle(points.frontPocketBottomMid),
        points.frontPocketWaist.dist(points.frontPocketBottomMid)
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.frontPocketOpeningOut = new Snippet('notch', points.frontPocketOpeningOut)
      if (options.frontPocketStyle == 'pear') {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['mFrontPocketOpeningOut', 'mFrontPocketOpeningOutTop'],
        })
        //foldline
        paths.foldline = new Path()
          .move(points.frontPocketWaist)
          .line(points.frontPocketBottomMid)
          .attr('class', 'mark')
          .attr('data-text', 'Fold-Line')
          .attr('data-text-class', 'center')
      }
      if (options.frontPocketOpeningStyle == 'inseam' || options.frontPocketStyle == 'original') {
        snippets.frontPocketOpeningOutTop = new Snippet('notch', points.frontPocketOpeningOutTop)
      }
      //title
      points.title = points.frontPocketOpeningWaist
        .shiftFractionTowards(points.frontPocketWaist, 0.5)
        .shift(
          points.frontPocketWaist.angle(points.frontPocketBottomMid),
          points.frontPocketWaist.dist(points.frontPocketBottomMid) * 0.5
        )
      macro('title', {
        nr: 5,
        title: 'Front Pocket Bag',
        at: points.title,
        scale: 0.5,
        rotation: 90 - points.frontPocketBottomMid.angle(points.frontPocketWaist),
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const frontPocketBagSa = sa * options.frontPocketBagSaWidth * 100
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100

        points.saFrontBottomLeft = utils.beamsIntersect(
          points.frontPocketOpeningOutCp2
            .shiftTowards(points.frontPocketBottomLeft, frontPocketBagSa)
            .rotate(-90, points.frontPocketOpeningOutCp2),
          points.frontPocketBottomLeft
            .shiftTowards(points.frontPocketOpeningOutCp2, frontPocketBagSa)
            .rotate(90, points.frontPocketBottomLeft),
          points.frontPocketBottomLeft
            .shiftTowards(points.mFrontPocketBottomLeft, frontPocketBagSa)
            .rotate(-90, points.frontPocketBottomLeft),
          points.mFrontPocketBottomLeft
            .shiftTowards(points.frontPocketBottomLeft, frontPocketBagSa)
            .rotate(90, points.mFrontPocketBottomLeft)
        )

        points.saFrontPocketBottomOut = utils.beamsIntersect(
          paths.saBase.offset(frontPocketBagSa).end(),
          paths.saBase
            .offset(frontPocketBagSa)
            .end()
            .shift(points.frontPocketBottomOutCp1.angle(points.frontPocketBottomOut), 1),
          points.frontPocketBottomOut
            .shiftTowards(points.frontPocketOut, crotchSeamSa)
            .rotate(-90, points.frontPocketBottomOut),
          points.frontPocketOut
            .shiftTowards(points.frontPocketBottomOut, crotchSeamSa)
            .rotate(90, points.frontPocketOut)
        )
        points.saFrontPocketOut = utils.beamsIntersect(
          points.saFrontPocketBottomOut,
          points.saFrontPocketBottomOut.shift(
            points.frontPocketBottomOut.angle(points.frontPocketOut),
            1
          ),
          paths.waist.split(points.frontPocketOut)[1].offset(sa).start(),
          paths.waist.split(points.frontPocketOut)[1].offset(sa).shiftFractionAlong(0.01)
        )

        points.saFrontBottomLeftFacing = utils.beamsIntersect(
          points.frontPocketOpeningOutCp2
            .shiftTowards(points.frontPocketBottomLeft, frontPocketBagSa)
            .rotate(-90, points.frontPocketOpeningOutCp2),
          points.frontPocketBottomLeft
            .shiftTowards(points.frontPocketOpeningOutCp2, frontPocketBagSa)
            .rotate(90, points.frontPocketBottomLeft),
          points.frontPocketBottomLeft
            .shiftTowards(points.frontPocketFacingOut, sa)
            .rotate(-90, points.frontPocketBottomLeft),
          points.frontPocketFacingOut
            .shiftTowards(points.frontPocketBottomLeft, sa)
            .rotate(90, points.frontPocketFacingOut)
        )

        points.saFrontPocketFacingOut = utils.beamsIntersect(
          points.frontPocketBottomLeft
            .shiftTowards(points.frontPocketFacingOut, sa)
            .rotate(-90, points.frontPocketBottomLeft),
          points.frontPocketFacingOut
            .shiftTowards(points.frontPocketBottomLeft, sa)
            .rotate(90, points.frontPocketFacingOut),
          paths.waist.split(points.frontPocketFacingOut)[1].offset(sa).start(),
          paths.waist.split(points.frontPocketFacingOut)[1].offset(sa).shiftFractionAlong(0.05)
        )

        macro('mirror', {
          mirror: [points.frontPocketWaist, points.frontPocketBottomMid],
          points: ['saWaistOut', 'saFrontBottomLeft'],
          prefix: 'm',
        })

        const drawSa = () => {
          if (options.frontPocketStyle == 'original') {
            return paths.outSeam
              .offset(sideSeamSa)
              .join(paths.saBase.offset(frontPocketBagSa))
              .line(points.saFrontPocketBottomOut)
              .line(points.saFrontPocketOut)
              .join(paths.waist.split(points.frontPocketOut)[1].offset(sa))
              .line(points.saWaistOut)
          } else {
            if (options.frontPocketOpeningStyle == 'inseam') {
              return paths.outSeam
                .offset(sideSeamSa)
                .join(paths.curve.offset(frontPocketBagSa))
                .line(points.saFrontBottomLeft)
                .line(points.mSaFrontBottomLeft)
                .join(paths.mCurve.reverse().offset(frontPocketBagSa))
                .join(paths.mOutSeam.reverse().offset(sideSeamSa))
                .line(points.mSaWaistOut)
                .join(paths.mWaistSplit.reverse().offset(sa))
                .join(paths.waistSplit.offset(sa))
                .line(points.saWaistOut)
            } else {
              return paths.curve
                .offset(frontPocketBagSa)
                .line(points.saFrontBottomLeft)
                .line(points.mSaFrontBottomLeft)
                .join(paths.mCurve.reverse().offset(frontPocketBagSa))
                .join(paths.mOutSeam.reverse().offset(sideSeamSa))
                .line(points.mSaWaistOut)
                .join(paths.mWaistSplit.reverse().offset(sa))
                .join(paths.waistSplit.split(points.frontPocketOpeningWaist)[0].offset(sa))
                .line(points.saFrontPocketOpeningWaist)
                .line(points.saFrontPocketOpeningOut)
            }
          }
        }
        paths.sa = drawSa().close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
