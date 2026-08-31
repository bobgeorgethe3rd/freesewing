import { pluginPatchPocket } from '@freesewing/plugin-patchpocket'
import { frontBase } from './frontBase.mjs'

export const pocket = {
  name: 'denny.pocket',
  after: frontBase,
  options: {
    //Imported
    //Pockets
    frontPocketPeakDepth: { pct: 46.3, min: 0, max: 100, menu: 'pockets.frontPockets' },
    frontPocketOpeningDepth: { pct: 20.9, min: 20, max: 30, menu: 'pockets.frontPockets' },
    //Construction
    frontPocketBagSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Denny
  },
  plugins: [pluginPatchPocket],
  draft: (sh) => {
    //draft
    const { points, Point, paths, Path, options, complete, sa, macro, store, part } = sh
    if (!options.frontPocketsBool) {
      part.hide()
      return part
    }
    //measures
    const frontPocketWidth = store.get('frontPocketWidth')

    macro('patchpocket', {
      width: frontPocketWidth,
      depth: store.get('frontPocketDepth'),
      bottomWidth: store.get('frontPocketBottomWidth') / frontPocketWidth,
      peakDepth: options.frontPocketPeakDepth,
      peakPlateau: false,
      style: 'straight',
      topFoldWidth: 0,
      topSaWidth: sa * options.frontPanelSaWidth * 100,
      saWidth: sa * options.frontPocketBagSaWidth * 100,
      prefix: 'front',
    })

    points.frontPatchPocketOpeningTopLeft = points.frontPatchPocketTopMid.shift(
      180,
      store.get('frontPocketOpeningWidth') * 0.5
    )
    points.frontPatchPocketOpeningTopRight = points.frontPatchPocketOpeningTopLeft.flipX()

    points.frontPatchPocketOpeningBottomLeft = points.frontPatchPocketOpeningTopLeft.shift(
      points.frontPatchPocketTopLeft.angle(points.frontPatchPocketBottomLeft),
      points.frontPatchPocketTopLeft.dist(points.frontPatchPocketBottomLeft) *
        options.frontPocketOpeningDepth
    )
    points.frontPatchPocketOpeningBottomRight = points.frontPatchPocketOpeningBottomLeft.flipX()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(
        points.frontPatchPocketTopMid.x,
        points.frontPatchPocketOpeningBottomLeft.y
      )
      points.grainlineTo = points.frontPatchPocketPeak
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      macro('title', {
        nr: 16,
        title: 'Pocket',
        at: points.frontPatchPocketTitle,
        cutNr: 4,
        scale: 1 / 3,
      })
      //opening line
      paths.opening = new Path()
        .move(points.frontPatchPocketOpeningTopLeft)
        .line(points.frontPatchPocketOpeningBottomLeft)
        .line(points.frontPatchPocketOpeningBottomRight)
        .line(points.frontPatchPocketOpeningTopRight)
        .attr('class', 'mark')
        .attr('data-text', 'Opening Sitching Line')
        .attr('data-text-class', 'center')
    }

    return part
  },
}
