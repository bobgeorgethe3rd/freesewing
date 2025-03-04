import { sleeve as gatherHeadSleeve } from '@freesewing/gatherheadsleeve'
import { backBase } from './backBase.mjs'
import { frontBase } from './frontBase.mjs'

export const sleeve = {
  name: 'fauna.sleeve',
  after: [backBase, frontBase],
  options: {
    //Imported
    ...gatherHeadSleeve.options,
    //Constants
    useVoidStores: false, //Altered for Fauna
    sleeveFlounces: 'none', //Locked for Fauna
    sleeveBandWidth: 0, //Locked for Fauna
    sleeveBands: false, //Locked for Fauna
    //Fit
    bicepsEase: { pct: 17.3, min: 0, max: 25, menu: 'fit' }, //Altered for Fauna
    elbowEase: { pct: 18.9, min: 0, max: 25, menu: 'fit' }, //Altered for Fauna
    wristEase: { pct: 28.3, min: 0, max: 30, menu: 'fit' }, //Altered for Fauna
    //Sleeve
    sleeveLength: { pct: 25, min: 0, max: 100, menu: 'sleeve' }, //Altered for Fauna
  },
  measurements: gatherHeadSleeve.measurements,
  draft: (sh) => {
    //draft
    const {
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
    } = sh
    //draft
    gatherHeadSleeve.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 4,
        title: 'Sleeve',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      //gather lines
      paths.gatherLine = paths.sleevecap
        .split(points.frontNotch)[1]
        .split(points.backNotch)[0]
        .attr('class', 'various hidden')

      macro('banner', {
        path: paths.gatherLine,
        text: 'Gather',
        spaces: 8,
      })
    }

    return part
  },
}
