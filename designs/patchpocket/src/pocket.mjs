import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginMirror } from '@freesewing/plugin-mirror'

export const pocket = {
  name: 'patchpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    //Pocket
    patchPocketStyle: {
      dflt: 'curved',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPockets',
    },
    patchPocketDepth: { pct: 0, min: -50, max: 200, menu: 'pockets.patchPockets' },
    patchPocketWidth: { pct: 0, min: -50, max: 200, menu: 'pockets.patchPockets' },
    patchPocketBottomWidth: { pct: 100, min: 50, max: 200, menu: 'pockets.patchPockets' },
    patchPocketPeakDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.patchPockets' },
    patchPocketPeakCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.patchPockets' },
    patchPocketPeakPlateau: { bool: true, menu: 'pockets.patchPockets' },
    //Construction
    patchPocketFolded: { bool: false, menu: 'construction' },
    patchPocketTopSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
    patchPocketGrainlineBias: { bool: false, menu: 'construction' },
  },
  plugins: [pluginBundle, pluginMirror],
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
  }) => {
    //measures
    if (options.useVoidStores) {
      void store.setIfUnset('patchPocketDepth', 150 * (1 + options.patchPocketDepth))
      void store.setIfUnset('patchPocketWidth', 150 * (1 + options.patchPocketWidth))
    }

    const pocketDepth = store.get('patchPocketDepth')
    const pocketWidth = store.get('patchPocketWidth')
    const pocketBottomWidth = pocketWidth * options.patchPocketBottomWidth
    const pocketPeakDepth = pocketBottomWidth * options.patchPocketPeakDepth * 0.5

    //let's begin
    points.topMid = new Point(0, 0)
    points.bottomMid = points.topMid.shift(-90, pocketDepth)
    points.topLeft = points.topMid.shift(180, pocketWidth / 2)
    points.topRight = points.topLeft.flipX(points.topMid)
    points.bottomLeft = points.bottomMid.shift(180, pocketBottomWidth / 2)
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)

    //peak
    points.peak = points.bottomMid.shift(-90, pocketPeakDepth)
    points.peakLeft = utils.beamsIntersect(
      points.topLeft,
      points.bottomLeft,
      points.peak,
      points.peak.shift(180, 1)
    )

    if (points.peakLeft.dist(points.peak) < points.peakLeft.dist(points.bottomLeft)) {
      points.peakLeftEnd = points.peakLeft.shiftFractionTowards(
        points.peak,
        options.patchPocketPeakCurve
      )
      points.peakLeftStart = points.peakLeftEnd.rotate(
        points.peakLeft.angle(points.bottomLeft),
        points.peakLeft
      )
    } else {
      points.peakLeftStart = points.peakLeft.shiftFractionTowards(
        points.bottomLeft,
        options.patchPocketPeakCurve
      )
      points.peakLeftEnd = points.peakLeftStart.rotate(
        -points.peakLeft.angle(points.bottomLeft),
        points.peakLeft
      )
    }

    points.peakRightStart = points.peakLeftEnd.flipX(points.peak)
    points.peakRightEnd = points.peakLeftStart.flipX(points.peak)

    points.peakLeftAnchor = utils.beamsIntersect(
      points.peakLeftStart,
      points.topLeft.rotate(-90, points.peakLeftStart),
      points.peakLeftEnd,
      points.peakLeftEnd.shift(90, 1)
    )
    const radius = points.peakLeftAnchor.dist(points.peakLeftStart)
    const angle =
      points.peakLeftAnchor.angle(points.peakLeftEnd) -
      points.peakLeftAnchor.angle(points.peakLeftStart)

    const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

    points.peakLeftStartCp2 = points.peakLeftStart.shiftTowards(points.peakLeft, cpDistance)
    points.peakLeftEndCp1 = points.peakLeftEnd.shiftTowards(points.peakLeft, cpDistance)
    points.peakRightStartCp2 = points.peakLeftEndCp1.flipX(points.peak)
    points.peakRightEndCp1 = points.peakLeftStartCp2.flipX(points.peak)

    //paths
    let peakFrom
    let peakTo
    if (options.patchPocketPeakPlateau) {
      peakFrom = points.peakLeftEnd
      peakTo = points.peakRightStart
    } else {
      peakFrom = points.peak
      peakTo = points.peak
    }

    const drawSeamBase = () => {
      if (options.patchPocketStyle == 'straight')
        return new Path()
          .move(points.topLeft)
          .line(points.peakLeftStart)
          .line(peakFrom)
          .line(peakTo)
          .line(points.peakRightEnd)
          .line(points.topRight)
      if (options.patchPocketStyle == 'curved')
        return new Path()
          .move(points.topLeft)
          .line(points.peakLeftStart)
          .curve(points.peakLeftStartCp2, points.peakLeftEndCp1, peakFrom)
          .line(peakTo)
          .curve(points.peakRightStartCp2, points.peakRightEndCp1, points.peakRightEnd)
          .line(points.topRight)
    }

    paths.seamBase = drawSeamBase().hide()

    macro('mirror', {
      mirror: [points.topLeft, points.topRight],
      paths: ['seamBase'],
      prefix: 'm',
    })

    const drawSeamTop = () => {
      if (options.patchPocketFolded) return paths.mSeamBase.reverse()
      else return new Path().move(points.topRight).line(points.topLeft)
    }

    paths.seam = drawSeamBase().join(drawSeamTop()).close()

    //stores
    store.set('patchPocketSideAngle', points.topLeft.angle(points.bottomLeft))

    if (complete) {
      //grainline
      let grainlineFrom
      let grainlineTo
      if (options.patchPocketGrainlineBias) {
        points.grainlineMid = new Point(points.topMid.x, points.bottomRight.y / 2)
        grainlineFrom = points.grainlineMid.shift(135, pocketWidth * 0.5)
        grainlineTo = points.grainlineMid.shift(315, pocketBottomWidth * 0.5)
      } else {
        if (options.patchPocketFolded) {
          grainlineFrom = points.peak.flipY()
        } else {
          grainlineFrom = points.topMid
        }
        grainlineTo = points.peak
      }
      macro('grainline', {
        from: grainlineFrom,
        to: grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['topLeft', 'topRight'],
      })
      //title
      points.title = new Point(points.topRight.x * (1 / 3), points.bottomRight.y / 2)
      macro('title', {
        nr: 1,
        title: 'Patch Pocket',
        at: points.title,
        scale: 0.5,
      })
      if (sa) {
        points.saLeft = utils.beamIntersectsY(
          points.topLeft.shiftTowards(points.peakLeftStart, sa).rotate(-90, points.topLeft),
          points.peakLeftStart.shiftTowards(points.topLeft, sa).rotate(90, points.peakLeftStart),
          points.topLeft.y
        )
        points.saTopLeft = utils
          .beamIntersectsY(
            points.topLeft.shiftTowards(points.peakLeftStart, sa).rotate(-90, points.topLeft),
            points.peakLeftStart.shiftTowards(points.topLeft, sa).rotate(90, points.peakLeftStart),
            points.topLeft.y + sa * options.patchPocketTopSaWidth * 100
          )
          .flipY(points.topLeft)

        points.saTopLeftCorner = utils
          .beamIntersectsY(points.saTopLeft, points.saLeft, points.saTopLeft.y + sa)
          .flipY(points.saTopLeft)

        points.saPeakLeft = points.peakLeftStart
          .shiftTowards(points.topLeft, sa)
          .rotate(90, points.peakLeftStart)

        points.saBottomLeft = utils.beamIntersectsY(
          points.topLeft.shiftTowards(points.peakLeftStart, sa).rotate(-90, points.topLeft),
          points.peakLeftStart.shiftTowards(points.topLeft, sa).rotate(90, points.peakLeftStart),
          points.peak.y + sa
        )

        if (options.patchPocketPeakCurve > 0 && options.patchPocketPeakDepth > 0) {
          if (options.patchPocketPeakPlateau) {
            points.saPeakLeftStart = utils.beamsIntersect(
              points.topLeft.shiftTowards(points.peakLeftStart, sa).rotate(-90, points.topLeft),
              points.peakLeftStart
                .shiftTowards(points.topLeft, sa)
                .rotate(90, points.peakLeftStart),
              points.peakLeftStart
                .shiftTowards(points.peakLeftEnd, sa)
                .rotate(-90, points.peakLeftStart),
              points.peakLeftEnd
                .shiftTowards(points.peakLeftStart, sa)
                .rotate(90, points.peakLeftEnd)
            )
            if (options.patchPocketPeakCurve == 1 && options.patchPocketPeakDepth == 1) {
              points.saPeakLeftEnd = utils.beamIntersectsX(
                points.peakLeftStart
                  .shiftTowards(points.peakLeftEnd, sa)
                  .rotate(-90, points.peakLeftStart),
                points.peakLeftEnd
                  .shiftTowards(points.peakLeftStart, sa)
                  .rotate(90, points.peakLeftEnd),
                points.peak.x
              )
            } else {
              points.saPeakLeftEnd = utils.beamIntersectsY(
                points.peakLeftStart
                  .shiftTowards(points.peakLeftEnd, sa)
                  .rotate(-90, points.peakLeftStart),
                points.peakLeftEnd
                  .shiftTowards(points.peakLeftStart, sa)
                  .rotate(90, points.peakLeftEnd),
                points.peak.y + sa
              )
            }
          } else {
            points.saPeakLeftStart = utils.beamsIntersect(
              points.topLeft.shiftTowards(points.peakLeftStart, sa).rotate(-90, points.topLeft),
              points.peakLeftStart
                .shiftTowards(points.topLeft, sa)
                .rotate(90, points.peakLeftStart),
              points.peakLeftStart.shiftTowards(points.peak, sa).rotate(-90, points.peakLeftStart),
              points.peak.shiftTowards(points.peakLeftStart, sa).rotate(90, points.peak)
            )
            points.saPeakLeftEnd = utils.beamIntersectsX(
              points.peakLeftStart.shiftTowards(points.peak, sa).rotate(-90, points.peakLeftStart),
              points.peak.shiftTowards(points.peakLeftStart, sa).rotate(90, points.peak),
              points.peak.x
            )
          }
          let peakLeft
          let peakRight
          if (options.patchPocketPeakPlateau) {
            peakLeft = points.peakLeftEnd
            peakRight = points.peakRightStart
          } else {
            peakLeft = points.peak
            peakRight = points.peak
          }

          paths.saCurveLeft = new Path()
            .move(points.peakLeftStart)
            .curve(points.peakLeftStartCp2, points.peakLeftEndCp1, peakLeft)
            .offset(sa)
            .hide()

          paths.saCurveRight = new Path()
            .move(peakRight)
            .curve(points.peakRightStartCp2, points.peakRightEndCp1, points.peakRightEnd)
            .offset(sa)
            .hide()
        }

        const drawSaLeftBase = () => {
          if (options.patchPocketFolded) {
            return new Path().move(points.saLeft)
          } else {
            return new Path()
              .move(points.saTopLeftCorner)
              .line(points.saTopLeft)
              .line(points.saLeft)
          }
        }

        const drawSaRightBase = () => {
          if (options.patchPocketFolded) {
            return new Path().line(points.saLeft.flipX())
          } else {
            return new Path()
              .line(points.saLeft.flipX())
              .line(points.saTopLeft.flipX())
              .move(points.saTopLeftCorner.flipX())
          }
        }

        paths.saLeft = drawSaLeftBase().line(points.saPeakLeft).hide()

        paths.saRight = new Path().move(points.saPeakLeft.flipX()).join(drawSaRightBase()).hide()

        const drawSaLeft = () => {
          if (options.patchPocketPeakDepth == 0 || options.patchPocketPeakCurve == 0) {
            return paths.saLeft.line(points.saBottomLeft)
          } else {
            if (options.patchPocketStyle == 'straight')
              return paths.saLeft.line(points.saPeakLeftStart).line(points.saPeakLeftEnd)
            if (options.patchPocketStyle == 'curved') return paths.saLeft.join(paths.saCurveLeft)
          }
        }

        const drawSaRight = () => {
          if (options.patchPocketPeakDepth == 0 || options.patchPocketPeakCurve == 0) {
            return new Path()
              .move(points.saBottomLeft.flipX())
              .line(points.saPeakLeft.flipX())
              .join(paths.saRight)
          } else {
            if (options.patchPocketStyle == 'straight')
              return new Path()
                .move(points.saPeakLeftEnd.flipX())
                .line(points.saPeakLeftStart.flipX())
                .join(paths.saRight)
            if (options.patchPocketStyle == 'curved') return paths.saCurveRight.join(paths.saRight)
          }
        }

        paths.saBase = drawSaLeft().join(drawSaRight()).hide()

        macro('mirror', {
          mirror: [points.topLeft, points.topRight],
          paths: ['saBase'],
          prefix: 'm',
        })

        const drawSaBase = () => {
          if (options.patchPocketFolded) {
            return paths.saBase.join(paths.mSaBase.reverse())
          } else {
            return paths.saBase
          }
        }

        paths.sa = drawSaBase()
          .line(drawSaLeft().start())
          .close()
          .attr('class', 'fabric sa')
          .unhide()

        if (!options.patchPocketFolded) {
          points.topLeftFold = points.saTopLeft.shift(0, points.saLeft.dist(points.topLeft))
          paths.seamTop = new Path()
            .move(points.topRight)
            .line(points.topLeftFold.flipX(points.topMid))
            .line(points.topLeftFold)
            .line(points.topLeft)
        }

        paths.foldline = new Path()
          .move(points.topLeft)
          .line(points.topRight)
          .attr('class', 'various')
          .attr('data-text', 'Fold-line')
          .attr('data-text-class', 'center')
      }
    }

    return part
  },
}
