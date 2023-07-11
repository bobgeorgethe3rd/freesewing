import { pctBasedOn } from '@freesewing/core'

export const collarBase = {
  name: 'shirtcollar.collarBase',
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
    collarBandOffset: { pct: 4.1, min: 2, max: 8, menu: 'collar' },
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
    log,
  }) => {
    //measures
    if (options.useVoidStores) {
      void store.setIfUnset('neckBack', 83)
      void store.setIfUnset('neckFront', 140)
    }
    void store.setIfUnset('collarBandWidth', absoluteOptions.collarBandWidth)
    const collarBandWidth = store.get('collarBandWidth')
    const neckBackLength = store.get('neckBack')
    const neckFrontLength = store.get('neckFront')
    const neckLength = neckBackLength + neckFrontLength
    const collarBandOffset = measurements.hpsToWaistBack * options.collarBandOffset
    //let's begin
    points.topMid = new Point(0, 0)
    points.bottomMid = points.topMid.shift(-90, collarBandWidth)
    points.bottomAnchor = points.bottomMid.shift(0, neckLength)
    points.bottom = points.bottomAnchor.shift(90, collarBandOffset)
    points.bottomCp1 = points.bottomMid.shift(0, neckBackLength)

    //tweak bottom to match length
    let tweak = 1
    let target = neckLength
    let delta
    do {
      points.bottom = points.bottomCp1.shiftFractionTowards(points.bottom, tweak)
      points.bottomCp2 = points.bottom.shiftFractionTowards(points.bottomCp1, 2 / 3)

      paths.neckBottom = new Path()
        .move(points.bottomMid)
        .curve(points.bottomCp1, points.bottomCp2, points.bottom)
        .hide()

      delta = paths.neckBottom.length() - target
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    //points cont.
    points.topCp2 = points.bottomCp1.shift(90, collarBandWidth)
    points.top = points.bottom
      .shiftTowards(points.bottomCp1, collarBandWidth)
      .rotate(-90, points.bottom)
    points.topCp1 = points.bottomCp2
      .shiftTowards(points.bottom, collarBandWidth)
      .rotate(90, points.bottomCp2)
    points.topNotch = new Path()
      .move(points.top)
      .curve(points.topCp1, points.topCp2, points.topMid)
      .shiftFractionAlong(2 / 3)

    const flip = ['bottom', 'bottomCp1', 'bottomCp2', 'topCp1', 'topCp2', 'top', 'topNotch']
    for (const p of flip) points['f' + utils.capitalize(p)] = points[p].flipX(points.bottomMid)

    //guides
    // paths.guide = new Path()
    // .move(points.topMid)
    // .line(points.bottomMid)
    // .line(points.bottomAnchor)
    // .line(points.bottomMid)
    // .curve(points.bottomCp1, points.bottomCp2, points.bottom)
    // .line(points.top)
    // .curve(points.topCp1, points.topCp2, points.topMid)
    // .curve(points.fTopCp2, points.fTopCp1, points.fTop)
    // .line(points.fBottom)
    // .curve(points.fBottomCp2, points.fBottomCp1, points.bottomMid)

    return part
  },
}
