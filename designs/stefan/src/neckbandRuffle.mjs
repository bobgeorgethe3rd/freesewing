import { pctBasedOn } from '@freesewing/core'
import { draftRectangle } from './shared.mjs'
import { neckband } from './neckband.mjs'

export const neckbandRuffle = {
  name: 'stefan.neckbandRuffle',
  after: neckband,
  options: {
    //Sleeves
    neckbandRuffleFullness: { pct: 350, min: 150, max: 900, menu: 'style' },
    neckbandRuffleWidth: {
      pct: 11.1,
      min: 1,
      max: 15,
      snap: 6.35,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'style',
    },
    //Construction
    neckbandRuffleHemWidth: { pct: 1.5, min: 0, max: 2, menu: 'construction' },
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
    if (!options.neckbandRuffles) {
      part.hide()
      return part
    }
    const neckbandRuffleWidth = absoluteOptions.neckbandRuffleWidth
    const xDist = store.get('neckbandRuffleLength') * options.neckbandRuffleFullness
    const yDist = neckbandRuffleWidth

    //paths & points
    paths.seam = draftRectangle(part, xDist, yDist)

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x * 0.5, points.topLeft.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottom.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.topLeftNotch = new Point(points.topLeft.x * 0.5, points.topLeft.y)
      points.topRightNotch = points.topLeftNotch.flipX(points.origin)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['topLeftNotch', 'top', 'topRightNotch'],
      })
      //title
      points.title = points.origin
      macro('title', {
        at: points.title,
        nr: '8',
        title: 'Neckband Ruffle',
        scale: 0.25,
      })
      if (sa) {
        const neckbandRuffleHem = sa * options.neckbandRuffleHemWidth * 100
        paths.sa = draftRectangle(
          part,
          xDist + sa * 2,
          yDist + sa + neckbandRuffleHem,
          false,
          'sa',
          0,
          neckbandRuffleHem * 0.5 - sa * 0.5
        ).attr('class', 'fabric sa')
      }
      if (paperless) {
        let prefixFunction = (string) => string
        if (sa) {
          prefixFunction = (string) => 'sa' + string.charAt(0).toUpperCase() + string.slice(1)
        }
        //verticals
        macro('vd', {
          from: points[prefixFunction('bottomLeft')],
          to: points[prefixFunction('topLeft')],
          x: points[prefixFunction('topLeft')].x - 15,
        })
        //horizontals
        macro('hd', {
          from: points[prefixFunction('topLeft')],
          to: points[prefixFunction('topRight')],
          y: points[prefixFunction('topLeft')].y - 15,
        })
      }
    }

    return part
  },
}
