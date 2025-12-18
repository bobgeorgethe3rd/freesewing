import { back as backSarah } from '@freesewing/sarah'
import { pctBasedOn } from '@freesewing/core'

export const skirtBackBase = {
  name: 'playtest.skirtBackBase',
  from: backSarah,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Fit
    fitGuides: { bool: false, menu: 'fit' }, //Altered for Playtest
    sarahGuides: { bool: false, menu: 'fit' },
    //Style
    waistbandStyle: { dflt: 'straight', list: ['straight', 'curved', 'none'], menu: 'style' }, //Altered for Playtest
    waistbandWidth: {
      pct: 2.4,
      min: 1,
      max: 6,
      snap: 2.5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Playtest
    //Style
    flounceStart: { pct: 0, min: -50, max: 50, menu: 'style' },
    flounceSideLength: { pct: 0, min: -50, max: 50, menu: 'style' },
    flounceLength: { pct: 100, min: 50, max: 150, menu: 'style' },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Playtest
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Playtest
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Playtest
  },
  measurements: ['waistToUpperLeg'],
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
    //remove paths & snippets
    const keepPaths = [
      'hipsGuide',
      'seatGuide',
      'waist',
      'dartEdges',
      'dartEdge',
      'sideSeam',
      'seam',
      'saWaist',
    ]
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.sarahGuides) {
      paths.sarahGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    const keepSnippets = [
      'hipsGuideLeft-notch',
      'hipsGuideRight-notch',
      'seatGuideLeft-notch',
      'seatGuideRight-notch',
    ]
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //removing macros not required from Sarah
    macro('title', false)
    macro('scalebox', false)
    //measures
    const toKnee = measurements.waistToKnee * (1 + options.kneeLengthBonus)
    const toUpperLeg =
      (measurements.waistToUpperLeg - measurements.waistToSeat) * (1 + options.flounceStart)
    const flounceSideLength =
      (toKnee - measurements.waistToUpperLeg) * (1 + options.flounceSideLength)
    //let's begin
    points.cbUpperLeg = points.cbSeat.shift(-90, toUpperLeg)
    points.cbBottomRight = points.cbUpperLeg.shift(-90, flounceSideLength)
    points.sideUpperLeg = new Point(points.sideSeat.x, points.cbUpperLeg.y)
    points.sideBottomRight = new Point(points.sideSeat.x, points.cbBottomRight.y)

    for (const p in points) {
      points[p + 'F'] = points[p].flipX(points.cbWaist)
    }
    //stores
    store.set('toKnee', toKnee)
    store.set('toUpperLeg', toUpperLeg)
    store.set('flounceSideLength', flounceSideLength)

    return part
  },
}
