import { pluginBundle } from '@freesewing/plugin-bundle'
import { pctBasedOn } from '@freesewing/core'

export const collar = {
  name: 'combinedshirtcollar.collar',
  measurements: ['hpsToWaistBack'],
  options: {
    //Constants
    useVoidStores: true,
    //Collars
    collarBandWidth: {
      pct: 6.5,
      min: 5,
      max: 10,
      snap: 5,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'collar',
    },
    collarBandTilt: { pct: 3.3, min: 1, max: 5, menu: 'collar' },
    collarPlacement: { pct: 0, min: 0, max: 50, menu: 'collar' },
    collarWidth: { pct: 50, min: 0, max: 100, menu: 'collar' },
    collarPeakWidth: { pct: (1 / 3) * 100, min: 0, max: 100, menu: 'collar' },
    collarPoint: { pct: 100, min: 0, max: 200, menu: 'collar' },
    //Plackets
    placketOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'plackets' },
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
      void store.setIfUnset('buttonholePlacketWidth', 35)
      void store.setIfUnset('buttonPlacketWidth', 35)
    }
    void store.setIfUnset('collarBandWidth', absoluteOptions.collarBandWidth)
    const neckBackLength = store.get('neckBack')
    const neckLength = neckBackLength + store.get('neckFront')
    const collarBandWidth = store.get('collarBandWidth')

    const buttonholePlacketWidth = store.get('buttonholePlacketWidth')
    const buttonPlacketWidth = store.get('buttonPlacketWidth')

    const leftEx =
      options.placketOverlapSide == 'left' ? buttonholePlacketWidth / 2 : buttonPlacketWidth / 2

    const rightEx =
      options.placketOverlapSide == 'left' ? buttonPlacketWidth / 2 : buttonholePlacketWidth / 2

    const collarPlacement =
      buttonPlacketWidth > buttonholePlacketWidth ? buttonPlacketWidth : buttonholePlacketWidth

    const collarWidth = collarBandWidth * (1 + options.collarWidth)

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
      points.bottom = points.bottomCurveStartCp2.shiftFractionTowards(
        points.bottomAnchor.shift(90, measurements.hpsToWaistBack * options.collarBandTilt),
        tweak
      )

      paths.bottomCurveRight = new Path()
        .move(points.bottomMid)
        .line(points.bottomCurveStart)
        .curve_(points.bottomCurveStartCp2, points.bottom)
        .hide()

      delta = paths.bottomCurveRight.length() - neckLength
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    //top
    points.topMid = points.bottomMid.shift(90, collarBandWidth)
    points.top = points.bottom.shift(
      points.bottom.angle(points.bottomCurveStartCp2) - 90,
      collarBandWidth
    )
    points.topCurveEndCp1 = utils.beamIntersectsY(
      points.top,
      points.bottom.rotate(-90, points.top),
      points.topMid.y
    )
    points.topCurveEnd = new Point(
      points.topCurveEndCp1.x * (points.bottomCurveStart.x / points.bottomCurveStartCp2.x),
      points.topMid.y
    )

    paths.topCurveRight = new Path()
      .move(points.top)
      ._curve(points.topCurveEndCp1, points.topCurveEnd)
      .line(points.topMid)
      .hide()

    points.collarBottom = paths.topCurveRight.shiftAlong(collarPlacement * options.collarPlacement)

    points.collarMid = points.topMid.shift(90, collarWidth)
    points.collarTopAnchor = utils.beamIntersectsY(
      points.collarBottom,
      points.collarBottom.shift(points.bottom.angle(points.top), 1),
      points.collarMid.y
    )
    points.collarTopTarget = points.collarTopAnchor.shiftFractionTowards(
      points.collarTopAnchor.flipX(points.collarBottom),
      options.collarPoint
    )
    points.collarTop = points.collarBottom.shiftTowards(
      points.collarTopTarget,
      collarWidth * (1 + options.collarPeakWidth)
    )

    if (points.collarTop.y > points.collarTopAnchor.y) points.collarTop = points.collarTopAnchor

    points.collarMidCp1 = new Point(
      points.collarTop.x *
        ((points.bottomCurveStartCp2.x - points.bottomCurveStart.x) /
          (points.bottom.x - points.bottomCurveStart.x)),
      points.collarMid.y
    )

    const flip = [
      'bottom',
      'bottomCurveStartCp2',
      'bottomCurveStart',
      'top',
      'topCurveEndCp1',
      'topCurveEnd',
      'collarTop',
      'collarMidCp1',
      'collarBottom',
    ]
    for (const p of flip) points['f' + utils.capitalize(p)] = points[p].flipX(points.bottomMid)

    points.fBottomEx = points.fBottom.shift(points.fBottom.angle(points.fTop) + 90, leftEx)
    points.bottomEx = points.bottom.shift(points.bottom.angle(points.top) - 90, rightEx)

    points.topCp1 = utils.beamsIntersect(
      points.top,
      points.bottom.rotate(90, points.top),
      points.bottomEx,
      points.bottomEx.shift(points.bottom.angle(points.top), 1)
    )
    points.fTopCp2 = utils.beamsIntersect(
      points.fTop,
      points.fBottom.rotate(-90, points.fTop),
      points.fBottomEx,
      points.fBottomEx.shift(points.fBottom.angle(points.fTop), 1)
    )

    //paths
    paths.bottomCurve = new Path()
      .move(points.fBottomEx)
      .line(points.fBottom)
      ._curve(points.fBottomCurveStartCp2, points.fBottomCurveStart)
      .line(points.bottomMid)
      .join(paths.bottomCurveRight)
      .line(points.bottomEx)
      .hide()

    paths.topCurve = paths.topCurveRight
      .line(points.fTopCurveEnd)
      .curve_(points.fTopCurveEndCp1, points.fTop)
      .hide()

    paths.saRight = new Path()
      .move(points.bottomEx)
      ._curve(points.topCp1, points.top)
      .join(
        options.collarPlacement > 0
          ? paths.topCurve.split(points.collarBottom)[0]
          : new Path().move(points.top)
      )
      .line(points.collarTop)
      .hide()

    paths.collarTop = new Path()
      .move(points.collarTop)
      ._curve(points.collarMidCp1, points.collarMid)
      .curve_(points.fCollarMidCp1, points.fCollarTop)
      .hide()

    paths.saLeft = new Path()
      .move(points.fCollarTop)
      .line(points.fCollarBottom)
      .join(
        options.collarPlacement > 0
          ? paths.topCurve.split(points.fCollarBottom)[1]
          : new Path().move(points.fTop)
      )
      .curve_(points.fTopCp2, points.fBottomEx)
      .hide()

    paths.seam = paths.bottomCurve
      .clone()
      .join(paths.saRight)
      .join(paths.collarTop)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.bottomMid.shiftFractionTowards(points.bottomCurveStart, 0.5)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.collarMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['fBottomCurveStart', 'bottomCurveStart', 'collarBottom', 'fCollarBottom'],
      })
      //title
      points.title = new Point(points.bottomCurveStart.x, points.collarMid.y * 0.5)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Collar',
        cutNr: 2,
        scale: 0.25,
      })
      //cb
      paths.cb = new Path()
        .move(points.collarMid)
        .line(points.bottomMid)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Back')
        .attr('data-text-class', 'center')
      //buttons & buttonholes
      if (options.placketOverlapSide == 'left') {
        points.buttonhole = points.fBottom.shiftFractionTowards(points.fTop, 0.5)
        points.button = points.bottom.shiftFractionTowards(points.top, 0.5)
        snippets.buttonhole = new Snippet('buttonhole-start', points.buttonhole).attr(
          'data-rotate',
          180 - points.fBottom.angle(points.fTop)
        )
        snippets.button = new Snippet('button', points.button).attr(
          'data-rotate',
          180 - points.bottom.angle(points.top)
        )
      } else {
        points.buttonhole = points.bottom.shiftFractionTowards(points.top, 0.5)
        points.button = points.fBottom.shiftFractionTowards(points.fTop, 0.5)
        snippets.buttonhole = new Snippet('buttonhole-start', points.buttonhole).attr(
          'data-rotate',
          360 - points.bottom.angle(points.top)
        )
        snippets.button = new Snippet('button', points.button).attr(
          'data-rotate',
          360 - points.fBottom.angle(points.fTop)
        )
      }
      //cf lines
      paths.cfLeft = new Path().move(points.fTop).line(points.fBottom).attr('class', 'mark help')
      paths.cfRight = new Path().move(points.top).line(points.bottom).attr('class', 'mark help')

      if (sa) {
        points.saBottomEx = points.bottomEx
          .shift(points.bottomCurveStartCp2.angle(points.bottom), sa)
          .shift(points.top.angle(points.bottom), sa)

        points.saCollarTop = utils.beamsIntersect(
          points.collarBottom.shiftTowards(points.collarTop, sa).rotate(-90, points.collarBottom),
          points.collarTop.shiftTowards(points.collarBottom, sa).rotate(90, points.collarTop),
          points.collarTop.shiftTowards(points.collarMidCp1, sa).rotate(-90, points.collarTop),
          points.collarMidCp1.shiftTowards(points.collarTop, sa).rotate(90, points.collarMidCp1)
        )

        points.saFCollarTop = points.saCollarTop.flipX()

        points.saFBottomEx = points.fBottomEx
          .shift(points.fBottomCurveStartCp2.angle(points.fBottom), sa)
          .shift(points.fTop.angle(points.fBottom), sa)

        paths.sa = paths.bottomCurve
          .offset(sa)
          .line(points.saBottomEx)
          .join(paths.saRight.offset(sa))
          .line(points.saCollarTop)
          .join(paths.collarTop.offset(sa))
          .line(points.saFCollarTop)
          .join(paths.saLeft.offset(sa))
          .line(points.saFBottomEx)
          .close()
          .trim()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
