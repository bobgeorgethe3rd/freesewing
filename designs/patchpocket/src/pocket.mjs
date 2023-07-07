import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'patchpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    cpFraction: 0.55191502449,
    //Pocket
    patchPocketStyle: { dflt: 'curved', list: ['straight', 'curved'], menu: 'pockets' },
    patchPocketDepth: { pct: 0, min: -50, max: 200, menu: 'pockets' },
    patchPocketWidth: { pct: 0, min: -50, max: 200, menu: 'pockets' },
    patchPocketBottomWidth: { pct: 100, min: 50, max: 200, menu: 'pockets' },
    patchPocketPeak: { pct: 50, min: 0, max: 100, menu: 'pockets' },
    patchPocketPeakCurve: { pct: 100, min: 0, max: 100, menu: 'pockets' },
    patchPocketPeakPlateau: { bool: true, menu: 'pockets' },
    //Construction
    patchPocketSaTopWidth: { pct: 3, min: 1, max: 10, menu: 'construction' },
    patchPocketGrainlineBias: { bool: false, menu: 'construction' },
  },
  plugins: [pluginBundle],
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

    const patchPocketDepth = store.get('patchPocketDepth')
    const patchPocketWidth = store.get('patchPocketWidth')
    const patchPocketBottomWidth = patchPocketWidth * options.patchPocketBottomWidth
    const patchPocketPeak = patchPocketBottomWidth * options.patchPocketPeak * 0.5

    //let's begin
    points.topMid = new Point(0, 0)
    points.bottomMid = points.topMid.shift(-90, patchPocketDepth)
    points.topLeft = points.topMid.shift(180, patchPocketWidth / 2)
    points.topRight = points.topLeft.flipX(points.topMid)
    points.bottomLeft = points.bottomMid.shift(180, patchPocketBottomWidth / 2)
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)

    //peak
    points.peak = points.topMid.shiftOutwards(points.bottomMid, patchPocketPeak)
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

    if (options.patchPocketStyle == 'curved') {
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

      points.peakCp1 = points.peakLeftStart.shiftTowards(points.peakLeft, cpDistance)
      points.peakCp2 = points.peakLeftEnd.shiftTowards(points.peakLeft, cpDistance)
      points.peakCp3 = points.peakCp2.flipX(points.peak)
      points.peakCp4 = points.peakCp1.flipX(points.peak)
    }

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

    const drawSaBase = () => {
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
          .curve(points.peakCp1, points.peakCp2, peakFrom)
          .line(peakTo)
          .curve(points.peakCp3, points.peakCp4, points.peakRightEnd)
          .line(points.topRight)
    }

    paths.top = new Path().move(points.topRight).line(points.topLeft).hide()

    paths.seam = drawSaBase().join(paths.top).close()

    if (complete) {
      //grainline
      let grainlineFrom
      let grainlineTo
      if (options.patchPocketGrainlineBias) {
        grainlineFrom = points.topLeft
        grainlineTo = points.bottomRight
      } else {
        grainlineFrom = points.topMid
        grainlineTo = points.bottomMid
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
        paths.sa = drawSaBase()
          .offset(sa)
          .join(paths.top.offset(sa * options.patchPocketSaTopWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
