import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'boxpleatpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    scalePockets: true,
    pocketOpening: 0.064,
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
    //Advanced
    boxPleatPocketDepthRight: { pct: 75, min: 65, max: 80, menu: 'advanced.pockets' },
    boxPleatPocketTopWidth: { pct: (9 / 50) * 100, min: 15, max: 30, menu: 'advanced.pockets' },
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
    //let's begin
    points.topLeft = new Point(0, 0)
    points.topRight = points.topLeft.shift(0, width)
    points.bottomLeft = points.topLeft.shift(-90, depth)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
    points.openingTop = points.topLeft.shiftTowards(
      points.topRight,
      width * options.boxPleatPocketTopWidth
    )
    points.openingBottom = points.bottomRight.shiftTowards(
      points.topRight,
      depth * options.boxPleatPocketDepthRight
    )

    //paths
    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.openingBottom)
      .line(points.openingTop)
      .line(points.topLeft)
      .line(points.bottomLeft)
      .close()

    //stores
    store.set('pocketOpening', store.get('insertSeamLength') * options.pocketOpening)
    store.set(
      'pocketOpeningLength',
      store.get('pocketOpening') + points.openingTop.dist(points.openingBottom)
    )
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

        const insertSeamSa = store.get('insertSeamSa')
        const pocketBagSa = sa * options.pocketBagSaWidth * 100

        points.saBottomLeft = points.bottomLeft.shift(-90, pocketBagSa)
        points.saBottomRight = points.bottomRight.translate(pocketBagSa, pocketBagSa)
        points.saOpeningBottom = utils.beamIntersectsX(
          points.openingBottom
            .shiftTowards(points.openingTop, insertSeamSa)
            .rotate(-90, points.openingBottom),
          points.openingTop
            .shiftTowards(points.openingBottom, insertSeamSa)
            .rotate(90, points.openingTop),
          points.saBottomRight.x
        )
        points.saOpeningTop = utils.beamIntersectsX(
          points.openingBottom
            .shiftTowards(points.openingTop, insertSeamSa)
            .rotate(-90, points.openingBottom),
          points.openingTop
            .shiftTowards(points.openingBottom, insertSeamSa)
            .rotate(90, points.openingTop),
          points.openingTop.x
        )
        points.saTopLeft = points.topLeft.shift(90, sa)
        points.saFacingLeft = points.facingLeft.shift(-90, pocketBagSa)
        points.saFacingRight = points.facingRight.translate(pocketBagSa, pocketBagSa)

        paths.facingSa = new Path()
          .move(points.saFacingLeft)
          .line(points.saFacingRight)
          .line(points.saOpeningBottom)
          .line(points.saOpeningTop)
          .line(points.saTopLeft)
          .line(points.saFacingLeft)
          .close()
          .attr('class', 'interfacing sa')

        paths.sa = new Path()
          .move(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saOpeningBottom)
          .line(points.saOpeningTop)
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
