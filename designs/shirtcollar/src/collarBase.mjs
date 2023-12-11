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
    points.bottomMidCp2 = points.bottomMid.shift(0, neckBackLength)

    //tweak bottom to match length
    let tweak = 1
    let target = neckLength
    let delta
    do {
      points.bottom = points.bottomMidCp2.shiftFractionTowards(points.bottom, tweak)
      points.bottomCp1 = points.bottom.shiftFractionTowards(points.bottomMidCp2, 2 / 3)

      paths.neckBottom = new Path()
        .move(points.bottomMid)
        .curve(points.bottomMidCp2, points.bottomCp1, points.bottom)
        .hide()

      delta = paths.neckBottom.length() - target
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    //points cont.
    points.topMidCp1 = points.bottomMidCp2.shift(90, collarBandWidth)
    points.top = points.bottom
      .shiftTowards(points.bottomMidCp2, collarBandWidth)
      .rotate(-90, points.bottom)
    points.topCp2 = points.bottomCp1
      .shiftTowards(points.bottom, collarBandWidth)
      .rotate(90, points.bottomCp1)
    points.topNotch = new Path()
      .move(points.top)
      .curve(points.topCp2, points.topMidCp1, points.topMid)
      .shiftFractionAlong(2 / 3)

    const flip = ['bottom', 'bottomMidCp2', 'bottomCp1', 'topCp2', 'topMidCp1', 'top', 'topNotch']
    for (const p of flip) points['f' + utils.capitalize(p)] = points[p].flipX(points.bottomMid)

    //guides
    // paths.guide = new Path()
    // .move(points.topMid)
    // .line(points.bottomMid)
    // .line(points.bottomAnchor)
    // .line(points.bottomMid)
    // .curve(points.bottomMidCp2, points.bottomCp1, points.bottom)
    // .line(points.top)
    // .curve(points.topCp2, points.topMidCp1, points.topMid)
    // .curve(points.fTopMidCp1, points.fTopCp2, points.fTop)
    // .line(points.fBottom)
    // .curve(points.fBottomCp1, points.fBottomMidCp2, points.bottomMid)

    if (complete) {
      //notches
      points.bottomNotch = paths.neckBottom.shiftAlong(neckBackLength)
      points.fBottomNotch = points.bottomNotch.flipX(points.bottomMid)
    }

    return part
  },
}
