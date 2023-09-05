import { pluginBundle } from '@freesewing/plugin-bundle'

export const crown = {
  name: 'perry.crown',
  plugins: [pluginBundle],
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Fit
    headEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    //Style
    crownWidth: { pct: 43, min: 40, max: 100, menu: 'style' },
    //Construction
    hemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
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
    log,
  }) => {
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    const headCircumference = store.get('headCircumference')
    const headRadius = headCircumference / 2 / Math.PI
    const crownRadius = headRadius * (1 + options.crownWidth)

    points.origin = new Point(0, 0)

    return part
  },
}
