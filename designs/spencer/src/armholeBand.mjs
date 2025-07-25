import { front } from './front.mjs'
import { pluginBandStraight } from '@freesewing/plugin-bandstraight'
import { pluginBandCurved } from '@freesewing/plugin-bandcurved'

export const armholeBand = {
  name: 'spencer.armholeBand',
  after: front,
  options: {
    //Armhole
    armholeBandFolded: { bool: true, menu: 'armhole' },
  },
  plugins: [pluginBandStraight, pluginBandCurved],
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
    if (options.armholeType != 'straight' && options.armholeType != 'curved') {
      part.hide()
      return part
    }

    if (options.armholeType == 'straight') {
      macro('bandstraight', {
        length: store.get('backArmholeLength') + store.get('frontArmholeLength'),
        width: store.get('armholeBandWidth'),
        folded: options.armholeBandFolded,
        north: 'Shoulder',
        east: 'Armhole Half',
        south: 'Armhole',
        west: 'Armhole Half',
        prefix: 'armhole',
      })
    } else {
      macro('bandcurved', {
        length: store.get('armholeBandLength'),
        lengthTop: store.get('backArmholeLength') + store.get('frontArmholeLength'),
        width: store.get('armholeBandWidth'),
        folded: options.armholeBandFolded,
        north: 'Shoulder',
        east: 'Armhole Half',
        south: 'Armhole',
        west: 'Armhole Half',
        prefix: 'armhole',
      })
    }

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Armhole (' + utils.capitalize(options.armholeType) + ')',
        at: points.title,
        cutNr: options.neckbandFolded || options.neckbandStyle == 'curved' ? 1 : 2,
        scale: 0.1,
      })
    }

    return part
  },
}
