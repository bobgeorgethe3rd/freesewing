import { dress } from './dress.mjs'

export const pocket = {
  name: 'siona.pocket',
  after: dress,
  options: {
    //Pockets
    pocketWidth: { pct: 18, min: 15, max: 20, menu: 'pockets' },
    //Construction
    pocketBagSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    paperless,
    macro,
    measurements,
    part,
    log,
  }) => {
    if (!options.pocketsBool || store.get('pocketRadius') > store.get('outerRadius')) {
      if (store.get('pocketRadius') > store.get('outerRadius')) {
        log.info('lengthToShortForPocket')
      }
      return part.hide()
    }
    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = new Point(measurements.waist * options.pocketWidth, 0)
    points.bottomLeft = new Point(
      0,
      store.get('pocketOpening') / 3 + store.get('pocketOpeningLength') + store.get('pocketDepth')
    )
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)

    //paths
    paths.saBase = new Path()
      .move(points.topRight)
      .line(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .hide()

    paths.saRight = new Path().move(points.bottomRight).line(points.topRight).hide()

    paths.seam = paths.saBase.clone().join(paths.saRight).close()

    //details
    //grainline
    points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.25)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //notches
    points.pocketOpeningTop = points.topRight.shiftTowards(
      points.bottomRight,
      store.get('pocketOpening') / 3
    )
    points.pocketOpeningBottom = points.pocketOpeningTop.shiftTowards(
      points.bottomRight,
      store.get('pocketOpeningLength')
    )
    macro('sprinkle', {
      snippet: 'notch',
      on: ['pocketOpeningTop', 'pocketOpeningBottom'],
    })
    //title
    points.title = new Point(points.topRight.x * 0.5, points.bottomRight.y * 0.5)
    macro('title', { at: points.title, nr: 3, title: 'pocket', scale: 0.5 })

    if (sa) {
      paths.sa = paths.saBase
        .offset(sa * options.pocketBagSaWidth * 100)
        .join(paths.saRight.offset(sa * options.sideSeamSaWidth * 100))
        .close()
        .attr('class', 'fabric sa')
    }

    if (paperless) {
    }
    return part
  },
}
