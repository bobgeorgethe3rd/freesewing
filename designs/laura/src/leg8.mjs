import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const leg8 = {
  name: 'laura.leg8',
  options: {},
  measurements: [
    'ankle',
    'crossSeam',
    'crossSeamFront',
    'knee',
    'seat',
    'upperLeg',
    'waist',
    'waistToHips',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToFloor',
  ],
  optionalMeasurements: ['hips'],
  plugins: [pluginBundle, pluginLogoRG],
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

    return part
  },
}
