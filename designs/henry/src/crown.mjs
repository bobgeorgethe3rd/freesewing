import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginGore } from '@freesewing/plugin-gore'

export const crown = {
  name: 'henry.crown',
  plugins: [pluginBundle, pluginGore],
  options: {
    //Fit
    headEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    //Style
    crownLength: { pct: 55, min: 40, max: 60, menu: 'style' },
    crownNumber: { count: 6, min: 4, max: 20, menu: 'style' },
  },
  measurements: ['head'],
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
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    const headCircumference = store.get('headCircumference')

    return part
  },
}
