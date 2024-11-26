import { front as frontPaul } from '@freesewing/paul'
import { pctBasedOn } from '@freesewing/core'

export const front = {
  name: 'sawyer.front',
  from: frontPaul,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    legBandsBool: true, //Alterd for Sawyer
    hemWidth: 0.01, //Locked for Sawyer
    //Fit
    legBandEase: { pct: -20, min: -20, max: 0, menu: 'fit' },
    //Style
    fitKnee: { bool: false, menu: 'style' }, //Unlocked for Sawyer
    fitCalf: { bool: false, menu: 'style' }, //Unlocked for Sawyer
    fitFloor: { bool: true, menu: 'style' }, //Altered for Sawyer
    legBandWidth: {
      pct: 5.6,
      min: 1,
      max: 7,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    }, //Altered for Sawyer
    //Advanced
    calculateLegBandDiff: { bool: true, menu: 'advanced' }, //Locked for Sawyer
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
  }) => {
    //stores
    store.set('legBandFront', points.floorOut.dist(points.floorIn) * (1 + options.legBandEase))
    store.set('legBandWidth', absoluteOptions.legBandWidth)
    return part
  },
}
