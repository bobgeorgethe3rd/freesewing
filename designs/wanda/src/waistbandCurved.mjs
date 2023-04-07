import { waistband as waistbandC } from '@freesewing/waistbandcurved'
import { placket } from './placket.mjs'

export const waistbandCurved = {
  name: 'wanda.waistbandCurved',
  after: placket,
  from: waistbandC,
  hide: {
    from: true,
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
    log,
    absoluteOptions,
  }) => {
    //set Render
    if (
      options.waistbandStyle != 'curved' ||
      !options.calculateWaistbandDiff ||
      !options.waistband
    ) {
      part.hide()
      return part
    }

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topCp3.x / 4, points.topMid.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.x)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.topCp3.x / 6, points.topMid.y / 2)
      macro('title', {
        nr: 6,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 0.1,
      })
    }

    return part
  },
}
