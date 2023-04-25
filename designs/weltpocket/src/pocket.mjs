import { pluginBundle } from '@freesewing/plugin-bundle'

export const pocket = {
  name: 'weltpocket.pocket',
  options: {
    //Constants
    useVoidStores: true,
    //Pockets
    weltPocketWidth: { pct: 28.6, min: 20, max: 40, menu: 'pockets.weltPockets' },
    weltPocketOpeningWidth: { pct: 62.2, min: 50, max: 80, menu: 'pockets.weltPockets' },
    //Construction
    pocketBagSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
    //Advanced
    weltToAnchorLength: { pct: 0, min: -25, max: 50, menu: 'advanced.pockets' },
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
      void store.setIfUnset('weltPocketOpeningWidth', 214 * options.weltPocketOpeningWidth)
      void store.setIfUnset('insertSeamLength', 1184)
      void store.setIfUnset('toAnchor', 26.2 * (1 + options.weltToAnchorLength))
    }

    let openingWidth = store.get('weltPocketOpeningWidth')
    let width = openingWidth * (1 + options.weltPocketWidth)
    let toAnchor = store.get('toAnchor') * (1 + options.weltToAnchorLength)

    //let's begin
    points.openingMid = new Point(0, 0)
    points.openingLeft = points.openingMid.shift(180, openingWidth / 2)
    points.openingRight = points.openingLeft.rotate(180, points.openingMid)

    points.left = points.openingMid.shift(180, width / 2)
    points.right = points.left.rotate(180, points.openingMid)
    points.topLeft = points.left.shift(90, toAnchor)
    points.topRight = new Point(points.right.x, points.topLeft.y)

    paths.opening = new Path().move(points.openingLeft).line(points.openingRight)

    paths.seam = new Path()
      .move(points.right)
      .line(points.topRight)
      .line(points.topLeft)
      .line(points.left)

    if (complete) {
      //grainline

      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['openingLeft', 'openingRight'],
      })
      //paths
      paths.opening.attr('data-text', 'Pocket Opening')

      if (sa) {
      }
    }

    return part
  },
}
