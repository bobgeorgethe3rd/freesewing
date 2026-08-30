import { pluginBundle } from '@freesewing/plugin-bundle'
import { pctBasedOn } from '@freesewing/core'

export const collar = {
  name: 'standardCollar.collar',
  measurements: ['hpsToWaistBack'],
  options: {
    //Constants
    useVoidStores: true,
    //Collars
    collarWidth: {
      pct: 16.4,
      min: 10,
      max: 30,
      snap: 1.25,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'collar',
    },
    collarTilt: { pct: 3.3, min: 1, max: 5, menu: 'collar' },
    collarPoint: { pct: 100, min: 0, max: 200, menu: 'collar' },
    //Construction
    cbCollarSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
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
    absoluteOptions,
    log,
  }) => {
    //measures
    if (options.useVoidStores) {
      void store.setIfUnset('neckBack', 83)
      void store.setIfUnset('neckFront', 140)
    }
    void store.setIfUnset('collarWidth', absoluteOptions.collarWidth)
    const neckBackLength = store.get('neckBack')
    const neckLength = neckBackLength + store.get('neckFront')
    //let's begin
    points.bottomMid = new Point(0, 0)
    points.bottomAnchor = points.bottomMid.shift(0, neckLength)
    points.bottomCurveStart = points.bottomMid.shift(0, neckBackLength)
    points.bottomCurveStartCp2 = points.bottomCurveStart.shiftFractionTowards(
      points.bottomAnchor,
      0.5
    )
    //tweak bottom to match length
    let tweak = 1
    let delta
    do {
      points.bottomRight = points.bottomCurveStartCp2.shiftFractionTowards(
        points.bottomAnchor.shift(90, measurements.hpsToWaistBack * options.collarTilt),
        tweak
      )

      paths.bottomCurve = new Path()
        .move(points.bottomMid)
        .line(points.bottomCurveStart)
        .curve_(points.bottomCurveStartCp2, points.bottomRight)
        .hide()

      delta = paths.bottomCurve.length() - neckLength
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    points.topMid = points.bottomMid.shift(90, store.get('collarWidth'))

    points.topRightAnchor = utils.beamIntersectsY(
      points.bottomRight,
      points.bottomCurveStartCp2.rotate(-90, points.bottomRight),
      points.topMid.y
    )

    points.topRight = points.topRightAnchor.shiftFractionTowards(
      points.topRightAnchor.flipX(points.bottomRight),
      options.collarPoint
    )

    //paths
    paths.seam = paths.bottomCurve
      .clone()
      .line(points.topRight)
      .line(points.topMid)
      .line(points.bottomMid)
      .close()
      .unhide()

    if (complete) {
      //grainline
      if (options.cbCollarSaWidth == 0) {
        points.cutOnFoldFrom = points.topMid.shiftFractionTowards(points.bottomMid, 0.01)
        points.cutOnFoldTo = points.bottomMid.shiftFractionTowards(points.topMid, 0.01)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.bottomMid.shiftFractionTowards(points.bottomCurveStart, 0.25)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.topMid.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bottomCurveStart', 'bottomRight'],
      })
      //title
      points.title = new Point(points.bottomCurveStart.x, points.topMid.y * 0.5)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Collar',
        cutNr: options.cbCollarSaWidth == 0 ? 2 : 4,
        scale: 1 / 3,
      })
      if (sa) {
        const cbCollarSa = sa * options.cbCollarSaWidth * 100

        points.saBottomRight = utils.beamsIntersect(
          points.bottomCurveStartCp2
            .shiftTowards(points.bottomRight, sa)
            .rotate(-90, points.bottomCurveStartCp2),
          points.bottomRight
            .shiftTowards(points.bottomCurveStartCp2, sa)
            .rotate(90, points.bottomRight),
          points.bottomRight.shiftTowards(points.topRight, sa).rotate(-90, points.bottomRight),
          points.topRight.shiftTowards(points.bottomRight, sa).rotate(90, points.topRight)
        )

        points.saTopRight = utils.beamIntersectsY(
          points.saBottomRight,
          points.saBottomRight.shift(points.bottomRight.angle(points.topRight), 1),
          points.topRight.y - sa
        )

        points.saTopMid = points.topMid.translate(-cbCollarSa, -sa)
        points.saBottomMid = new Point(points.saTopMid.x, points.bottomMid.y + sa)

        paths.sa = paths.bottomCurve
          .clone()
          .offset(sa)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopMid)
          .line(points.saBottomMid)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
