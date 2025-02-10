import { frontBase } from './frontBase.mjs'
import { waistbandCurved } from './waistbandCurved.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'

export const waistband = {
  name: 'frankie.waistband',
  after: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Style
    waistbandFolded: { bool: true, menu: 'style' },
    waistbandCurved: { bool: false, menu: 'style' },
    waistbandOverlap: { pct: 0, min: 0, max: 20, menu: 'style' },
  },
  draft: (sh) => {
    const {
      macro,
      store,
      points,
      paths,
      Path,
      options,
      measurements,
      complete,
      snippets,
      Snippet,
      absoluteOptions,
      part,
    } = sh
    store.set('waistbandLength', (store.get('waistBack') + store.get('waistFront')) * 2)
    store.set(
      'waistbandLengthTop',
      store.get('waistbandLength') -
        (absoluteOptions.waistbandWidth *
          (measurements.seat * (1 + options.seatEase) -
            measurements.waist * (1 + options.waistEase))) /
          measurements.waistToHips
    )
    store.set('waistbandOverlap', store.get('waistbandLength') * options.waistbandOverlap)

    store.cutlist.setCut({ cut: 2, from: 'fabric', identical: 'true' })

    if (options.waistbandCurved) waistbandCurved.draft(sh)
    else waistbandStraight.draft(sh)

    //details
    //grainline
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
      grainline: true,
    })
    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: [
        'bottomLeftNotch',
        'bottomMid',
        'bottomRightNotch',
        'bottomRight',
        'topRight',
        'topRightNotch',
        'topMid',
        'topLeftNotch',
      ],
    })
    if (complete) {
      paths.sideSeamLeft = new Path()
        .move(points.bottomLeftNotch)
        .line(points.topLeftNotch)
        .setClass('fabric help')
        .setText('sideSeam', 'center')

      paths.centreBack = new Path()
        .move(points.bottomMid)
        .line(points.topMid)
        .setClass('fabric help')
        .setText('centreBack', 'center')

      paths.sideSeamRight = new Path()
        .move(points.bottomRightNotch)
        .line(points.topRightNotch)
        .setClass('fabric help')
        .setText('sideSeam', 'center')

      paths.centreFrontPlacket = new Path()
        .move(points.bottomRight)
        .line(points.topRight)
        .setClass('fabric help')
        .setText('centreFront', 'center')
      if (options.waistbandOverlap > 0) {
        macro('sprinkle', {
          snippet: 'notch',
          on: ['bottomLeft', 'topLeft'],
        })
        paths.centreFrontOverlap = new Path()
          .move(points.bottomLeft)
          .line(points.topLeft)
          .setClass('fabric help')
          .setText('centreFront', 'center')
      }
    }
    //title
    macro('title', {
      at: points.title,
      nr: 5,
      title: 'waistband',
      scale: 0.5,
    })
    //button & buttonholes
    snippets.button = new Snippet('button', points.button)
      .attr('data-rotate', points.topLeft.angle(points.bottomLeft))
      .attr('data-scale', 2)
    snippets.buttonhole = new Snippet('buttonhole', points.buttonhole)
      .attr('data-rotate', points.topRight.angle(points.bottomRight))
      .attr('data-scale', 2)

    return part
  },
}
