import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'boxpleatpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    pocketOpening: 0.064,
    scalePockets: true,
    //Pockets
    boxPleatPocketWidth: {
      pct: (11 / 18) * 100,
      min: 60,
      max: 80,
      menu: 'pockets.boxPleatPockets',
    },
    boxPleatPocketDepth: { pct: (3 / 10) * 100, min: 20, max: 50, menu: 'pockets.boxPleatPockets' },
    boxPleatPocketFacingDepth: {
      pct: (5 / 12) * 100,
      min: 40,
      max: 50,
      menu: 'pockets.boxPleatPockets',
    },
    //Construction
    pocketBagSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  plugins: [pluginBundle],
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
    if (options.useVoidStores) {
      void store.setIfUnset('anchorSeamLength', 304.8)
      void store.setIfUnset('insertSeamLength', 1016)
    }
    void store.setIfUnset('waistbandWidth', 0)

    let width
    let depth
    if (!options.scalePockets) {
      width = 186.27
      depth = 304.8
    } else {
      width = store.get('anchorSeamLength') * options.boxPleatPocketWidth
      depth = store.get('insertSeamLength') * options.boxPleatPocketDepth
    }
    let widthT = width * (9 / 50)
    let depthR = depth * (3 / 4)
    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = points.topLeft.shift(0, width)
    points.bottomLeft = points.topLeft.shift(-90, depth)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
    points.openingTop = points.topLeft.shiftTowards(points.topRight, widthT)
    points.openingBottom = points.bottomRight.shiftTowards(points.topRight, depthR)

    //paths
    paths.hemBase = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.openingBottom)
      .hide()

    paths.opening = new Path().move(points.openingBottom).line(points.openingTop).hide()

    paths.saTop = new Path().move(points.openingTop).line(points.topLeft).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.opening)
      .join(paths.saTop)
      .line(points.bottomLeft)
      .close()

    //stores
    store.set('pocketOpening', points.openingTop.dist(points.openingBottom))

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.topLeft
      points.cutOnFoldTo = points.bottomLeft
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['openingTop', 'openingBottom'],
      })
      //title
      points.title = new Point(points.topRight.x / 3, points.bottomLeft.y * (3 / 4))
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Box Pleat Pocket',
      })
      //facings
      points.facingLeft = points.topLeft.shiftFractionTowards(
        points.bottomLeft,
        options.boxPleatPocketFacingDepth
      )
      points.facingRight = new Point(points.topRight.x, points.facingLeft.y)
      paths.facing = new Path()
        .move(points.facingLeft)
        .line(points.facingRight)
        .attr('class', 'interfacing')
        .attr('data-text', 'Facing - line')
        .attr('data-text-class', 'center')
      if (sa) {
        void store.setIfUnset('insertSeamSa', sa)
        paths.facingSa = paths.facing
          .clone()
          .offset(sa)
          .join(
            new Path()
              .move(points.facingRight)
              .line(points.openingBottom)
              .offset(sa * options.pocketBagSaWidth * 100)
          )
          .join(paths.opening.offset(store.get('insertSeamSa')))
          .join(paths.saTop.offset(sa))
          .line(points.topLeft)
          .line(points.bottomLeft)
          .close()
          .attr('class', 'interfacing sa')

        paths.sa = paths.hemBase
          .offset(sa * options.pocketBagSaWidth * 100)
          .join(paths.opening.offset(store.get('insertSeamSa')))
          .join(paths.saTop.offset(sa))
          .line(points.topLeft)
          .line(points.bottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
