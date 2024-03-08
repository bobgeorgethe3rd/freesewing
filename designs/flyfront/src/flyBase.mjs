import { flyFunction } from './flyFunction.mjs'
import { front as daltonFront } from '@freesewing/dalton'

export const flyBase = {
  name: 'flyFront.flyBase',
  from: daltonFront,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Plackets
    flyFrontLength: { pct: 70.2, min: 70, max: 80, menu: 'plackets' },
    flyFrontWidth: { pct: 5.1, min: 5, max: 6, menu: 'plackets' },
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
    //deleting snippets
    delete snippets.crotchSeamCurveEnd
    //removing macros not required from Dalton
    macro('title', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    const flyFrontWidth = measurements.waist * options.flyFrontWidth
    const flyFrontLength =
      (measurements.crossSeamFront - measurements.waistToHips) * options.flyFrontLength
    const flyFrontShieldEx = 10 //(1 - options.flyFrontWidth) * 10.537407797681770284510010537408
    //let's begin
    flyFunction(part, waistbandWidth, flyFrontWidth, flyFrontLength, flyFrontShieldEx)
    return part
  },
}
