import { pctBasedOn } from '@freesewing/core'
import { draftRectangle } from './shared.mjs'
import { sleeveBand } from './sleeveBand.mjs'

export const sleeveBandRuffle = {
  name: 'stefan.sleeveBandRuffle',
  after: sleeveBand,
  options: {
    //Sleeves
    sleeveBandRuffleFullness: { pct: 350, min: 150, max: 900, menu: 'sleeves' },
    sleeveBandRuffleWidth: {
      pct: 8.9,
      min: 1,
      max: 10,
      snap: 6.35,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    },
    //Construction
    sleeveBandRuffleHemWidth: { pct: 1.5, min: 0, max: 2, menu: 'construction' },
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
    if (!options.sleeveBands || !options.sleeveBandRuffles) {
      part.hide()
      return part
    }
    const sleeveBandRuffleWidth = absoluteOptions.sleeveBandRuffleWidth
    const xDist = store.get('sleeveBandRuffleLength') * options.sleeveBandRuffleFullness
    const yDist = sleeveBandRuffleWidth

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
        nr: '6',
        title: 'Sleeve Band Ruffle',
        cutNr: 1,
        scale: 0.25,
      })
      if (sa) {
        const sleeveBandRuffleHem = sa * options.sleeveBandRuffleHemWidth * 100
        paths.sa = draftRectangle(
          part,
          xDist + sleeveBandRuffleHem * 2,
          yDist + sa + sleeveBandRuffleHem,
          false,
          'sa',
          0,
          sleeveBandRuffleHem * 0.5 - sa * 0.5
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
