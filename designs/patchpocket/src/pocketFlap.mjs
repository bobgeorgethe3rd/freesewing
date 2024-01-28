import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { pocket } from './pocket.mjs'

export const pocketFlap = {
  name: 'patchpocket.pocketFlap',
  from: pocket,
  options: {
    //Pockets
    patchPocketFlapStyle: {
      dflt: 'curved',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPocketsFlaps',
    },
    patchPocketFlapDepth: { pct: 20, min: 0, max: 50, menu: 'pockets.patchPocketsFlaps' },
    patchPocketFlapPeakDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.patchPocketsFlaps' },
    patchPocketFlapBottomWidth: { pct: 100, min: 50, max: 200, menu: 'pockets.patchPocketsFlaps' },
    patchPocketFlapPeakCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.patchPocketsFlaps' },
    patchPocketFlapPeakPlateau: { bool: true, menu: 'pockets.patchPocketsFlaps' },
    independentPatchPocketFlap: { bool: false, menu: 'pockets.patchPocketsFlaps' },
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
    //delete paths
    for (let i in paths) delete paths[i]
    //options
    let patchPocketFlapPeakDepth
    let patchPocketFlapPeakCurve
    if (!options.independentPatchPocketFlap) {
      options.patchPocketFlapStyle = options.patchPocketStyle
      options.patchPocketFlapPeakPlateau = options.patchPocketPeakPlateau

      if (options.patchPocketPeakDepth != 0) {
        patchPocketFlapPeakDepth = options.patchPocketPeakDepth
      } else {
        patchPocketFlapPeakDepth = 0
      }

      if (options.patchPocketPeakCurve != 0) {
        patchPocketFlapPeakCurve = options.patchPocketPeakCurve
      } else {
        patchPocketFlapPeakCurve = 0
      }
    } else {
      patchPocketFlapPeakDepth = options.patchPocketFlapPeakDepth
      patchPocketFlapPeakCurve = options.patchPocketFlapPeakCurve
    }
    //measures
    const flapDepth = store.get('patchPocketDepth') * options.patchPocketFlapDepth
    const flapWidth = store.get('patchPocketWidth')
    const flapBottomWidth = flapWidth * options.patchPocketFlapBottomWidth

    //let's begin
    points.bottomMid = points.topMid.shift(-90, flapDepth)
    if (options.independentPatchPocketFlap) {
      points.bottomLeft = points.bottomMid.shift(180, flapBottomWidth / 2)
      points.bottomLeftAnchor = points.bottomMid.translate(flapBottomWidth / -2, 0.1)
    } else {
      points.bottomLeft = utils.beamIntersectsY(points.topLeft, points.peakLeft, points.bottomMid.y)
      points.bottomLeftAnchor = utils.beamIntersectsY(
        points.topLeft,
        points.peakLeft,
        points.bottomMid.y + 0.1
      )
    }
    if (options.patchPocketFlapDepth != 0) {
      points.bottomLeftAnchor = points.bottomLeft
    }
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)

    const flapPeakDepth =
      points.bottomLeft.dist(points.bottomRight) * patchPocketFlapPeakDepth * 0.5
    //peak
    points.peak = points.bottomMid.shift(-90, flapPeakDepth)
    points.peakLeft = utils.beamsIntersect(
      points.topLeft,
      points.bottomLeftAnchor,
      points.peak,
      points.peak.shift(180, 1)
    )

    if (points.peakLeft.dist(points.peak) < points.peakLeft.dist(points.bottomLeftAnchor)) {
      points.peakLeftEnd = points.peakLeft.shiftFractionTowards(
        points.peak,
        patchPocketFlapPeakCurve
      )
      points.peakLeftStart = points.peakLeftEnd.rotate(
        points.peakLeft.angle(points.bottomLeftAnchor),
        points.peakLeft
      )
    } else {
      points.peakLeftStart = points.peakLeft.shiftFractionTowards(
        points.bottomLeftAnchor,
        patchPocketFlapPeakCurve
      )
      points.peakLeftEnd = points.peakLeftStart.rotate(
        -points.peakLeft.angle(points.bottomLeftAnchor),
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
    if (options.patchPocketFlapPeakPlateau) {
      peakFrom = points.peakLeftEnd
      peakTo = points.peakRightStart
    } else {
      peakFrom = points.peak
      peakTo = points.peak
    }

    const drawSaBase = () => {
      if (options.patchPocketFlapStyle == 'straight')
        return new Path()
          .move(points.topLeft)
          .line(points.peakLeftStart)
          .line(peakFrom)
          .line(peakTo)
          .line(points.peakRightEnd)
          .line(points.topRight)
      if (options.patchPocketFlapStyle == 'curved')
        return new Path()
          .move(points.topLeft)
          .line(points.peakLeftStart)
          .curve(points.peakLeftStartCp2, points.peakLeftEndCp1, peakFrom)
          .line(peakTo)
          .curve(points.peakRightStartCp2, points.peakRightEndCp1, points.peakRightEnd)
          .line(points.topRight)
    }

    paths.top = new Path().move(points.topRight).line(points.topLeft).hide()

    paths.seam = drawSaBase().join(paths.top).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topMid
      points.grainlineTo = points.peak
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['topLeft', 'topRight'],
      })
      //title
      points.title = new Point(points.topRight.x * (1 / 3), points.peak.y / 2)
      macro('title', {
        nr: 2,
        title: 'Patch Pocket Flap',
        at: points.title,
        scale: 1 / 3,
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
            points.topLeft.y + sa
          )
          .flipY(points.topLeft)

        points.saPeakLeft = points.peakLeftStart
          .shiftTowards(points.topLeft, sa)
          .rotate(90, points.peakLeftStart)

        points.saBottomLeft = utils.beamIntersectsY(
          points.topLeft.shiftTowards(points.peakLeftStart, sa).rotate(-90, points.topLeft),
          points.peakLeftStart.shiftTowards(points.topLeft, sa).rotate(90, points.peakLeftStart),
          points.peak.y + sa
        )

        if (patchPocketFlapPeakCurve > 0 && patchPocketFlapPeakDepth > 0) {
          if (options.patchPocketFlapPeakPlateau) {
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
            if (patchPocketFlapPeakCurve == 1 && patchPocketFlapPeakDepth == 1) {
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
          let peak
          if (options.patchPocketFlapPeakPlateau) {
            peak = points.peakLeftEnd
          } else {
            peak = points.peak
          }

          paths.saCurve = new Path()
            .move(points.peakLeftStart)
            .curve(points.peakLeftStartCp2, points.peakLeftEndCp1, peak)
            .offset(sa)
            .hide()
        }
        paths.saLeft = new Path()
          .move(points.saTopLeft)
          .line(points.saLeft)
          .line(points.saPeakLeft)
          .hide()

        const drawSa = () => {
          if (patchPocketFlapPeakDepth == 0 || patchPocketFlapPeakCurve == 0) {
            return paths.saLeft.line(points.saBottomLeft)
          } else {
            if (options.patchPocketFlapStyle == 'straight')
              return paths.saLeft.line(points.saPeakLeftStart).line(points.saPeakLeftEnd)
            if (options.patchPocketFlapStyle == 'curved') return paths.saLeft.join(paths.saCurve)
          }
        }

        paths.sa = drawSa().hide()

        macro('mirror', {
          mirror: [points.topMid, points.peak],
          paths: ['sa'],
          prefix: 'm',
        })

        paths.sa = paths.sa
          .join(paths.mSa.reverse())
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
