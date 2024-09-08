import { pctBasedOn } from '@freesewing/core'
import { draftRectangle } from './shared.mjs'
import { body } from './body.mjs'

export const sleeve = {
  name: 'stefan.sleeve',
  after: body,
  options: {
    //Sleeves
    sleeveLengthBonus: { pct: 0, min: -20, max: 50, menu: 'sleeves' },
    sleeveBands: { bool: true, menu: 'sleeves' },
    sleeveBandWidth: {
      pct: 8.9,
      min: 1,
      max: 10,
      snap: 6.35,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    },
    //Construction
    sleeveHemWidth: { pct: 2, min: 0, max: 5, menu: 'construction' },
  },
  measurements: ['shoulderToWrist'],
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
    let sleeveBandWidth = absoluteOptions.sleeveBandWidth
    if (!options.sleeveBands) sleeveBandWidth = 0

    const xDist = store.get('sleeveWidth') * (1 + options.sleeveFullness)
    const yDist =
      (measurements.shoulderToWrist - store.get('shoulderDrop') - sleeveBandWidth) *
      (1 + options.sleeveLengthBonus)

    //paths & points
    paths.seam = draftRectangle(part, xDist, yDist)

    //details that are always needed
    if (options.taperedSleeves && options.sleeveFullness <= 0) {
      points.wristLeft = points.bottom.shift(180, store.get('wrist') * 0.5)
      points.wristRight = points.wristLeft.flipX(points.origin)

      paths.cutLineLeft = new Path()
        .move(points.left)
        .line(points.wristLeft)
        .attr('class', 'fabric help')
        .attr('data-text', 'Cut to create gore')
        .attr('data-text-class', 'center')

      paths.cutLineRight = new Path()
        .move(points.wristRight)
        .line(points.right)
        .attr('class', 'fabric help')
        .attr('data-text', 'Cut to create gore')
        .attr('data-text-class', 'center')

      if (complete) {
        points.topLeftMid = new Point(points.topLeft.x, points.topLeft.y * 0.5)
        points.bottomLeftMid = new Point(points.topLeft.x, points.bottomLeft.y * 0.5)
        points.topRightMid = points.topLeftMid.flipX(points.origin)
        points.bottomRightMid = points.bottomLeftMid.flipX(points.origin)
        macro('sprinkle', {
          snippet: 'bnotch',
          on: ['topLeftMid', 'bottomLeftMid', 'topRightMid', 'bottomRightMid'],
        })
      }
    } else {
      points.topLeftNotch = points.topLeft.shift(-90, store.get('sleeveGussetWidth'))
      points.topRightNotch = points.topLeftNotch.flipX(points.origin)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['topLeftNotch', 'topRightNotch'],
      })
    }

    //stores
    store.set('sleeveBandWidth', sleeveBandWidth)

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topLeft.x * 0.5, points.topLeft.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottom.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['top', 'bottom'],
      })
      //title
      points.title = points.origin
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Sleeve',
        scale: 0.5,
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        let sleeveHemWidth = sa * options.sleeveHemWidth * 100
        if (options.sleeveBands) sleeveHemWidth = sa
        if (options.taperedSleeves && options.sleeveFullness <= 0) sleeveHemWidth = sideSeamSa

        paths.sa = draftRectangle(
          part,
          xDist + sideSeamSa * 2,
          yDist + sleeveHemWidth + sideSeamSa,
          false,
          'sa',
          0,
          sleeveHemWidth * 0.5 - sideSeamSa * 0.5
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
          x: points[prefixFunction('topLeft')].x - 45,
        })
        //horizontals
        macro('hd', {
          from: points[prefixFunction('topLeft')],
          to: points[prefixFunction('topRight')],
          y: points[prefixFunction('topLeft')].y - 15,
        })
        //taperedSleeves
        if (options.taperedSleeves && options.sleeveFullness <= 0) {
          macro('vd', {
            from: points.left,
            to: points[prefixFunction('topLeft')],
            x: points[prefixFunction('topLeft')].x - 30,
          })
          macro('vd', {
            from: points[prefixFunction('bottomLeft')],
            to: points.left,
            x: points[prefixFunction('topLeft')].x - 30,
          })
          macro('vd', {
            from: points.topLeftMid,
            to: points[prefixFunction('topLeft')],
            x: points[prefixFunction('topLeft')].x - 15,
          })
          macro('vd', {
            from: points[prefixFunction('bottomLeft')],
            to: points.bottomLeftMid,
            x: points[prefixFunction('topLeft')].x - 15,
          })
          macro('hd', {
            from: points[prefixFunction('bottomLeft')],
            to: points.wristLeft,
            y: points[prefixFunction('bottomLeft')].y + 15,
          })
          macro('hd', {
            from: points.wristLeft,
            to: points.wristRight,
            y: points[prefixFunction('bottomLeft')].y + 15,
          })
          macro('hd', {
            from: points.wristRight,
            to: points[prefixFunction('bottomRight')],
            y: points[prefixFunction('bottomLeft')].y + 15,
          })
        }
      }
    }
    return part
  },
}
