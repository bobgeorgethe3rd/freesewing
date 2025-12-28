import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const frontFacing = {
  name: 'playtest.frontFacing',
  from: frontBase,
  hide: {
    from: true,
  },
  draft: ({
    options,
    Point,
    Path,
    points,
    paths,
    Snippet,
    snippets,
    utils,
    complete,
    store,
    sa,
    measurements,
    absoluteOptions,
    paperless,
    macro,
    part,
  }) => {
    //remove paths & snippets
    const keepThese = ['cfNeck']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //paths
    paths.cfNeck = paths.cfNeck
      .split(points.buttonholePlacketNeck)[1]
      .line(points.buttonholePlacketFacingNeck)
      .hide()

    paths.seam = new Path()
      .move(points.buttonholePlacketFacingHem)
      .line(points.buttonholePlacketHem)
      .line(points.buttonholePlacketNeck)
      .join(paths.cfNeck)
      .line(points.buttonholePlacketFacingHem)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.cfHem.shiftFractionTowards(points.buttonholePlacketHem, 0.5)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.cfNeck.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.cfNeck.shiftFractionTowards(points.cfHem, 0.5)
      macro('title', {
        at: points.title,
        nr: '5',
        title: 'Front Facing',
        scale: 0.25,
        cutNr: 1,
      })
      //foldline
      paths.foldline = new Path()
        .move(points.buttonholePlacketFoldNeck)
        .line(points.buttonholePlacketFoldHem)
        .attr('class', 'mark help')
        .attr('data-text', 'Fold-line')
        .attr('data-text-class', 'center')
      //buttonholes
      for (let i = 0; i <= options.buttonNumber - 1; i++) {
        snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i])
      }
      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100
        points.saButtonholePlacketHem = points.buttonholePlacketHem.translate(
          sa,
          sa * options.hemWidth * 100
        )
        points.saButtonholePlacketNeck = new Point(
          points.saButtonholePlacketHem.x,
          paths.cfNeck.offset(neckSa).start().y
        )
        points.saButtonholePlacketFacingNeck = points.buttonholePlacketFacingNeck.translate(
          -sa,
          -neckSa
        )
        points.saButtonholePlacketFacingHem = new Point(
          points.saButtonholePlacketFacingNeck.x,
          points.saButtonholePlacketHem.y
        )

        paths.sa = new Path()
          .move(points.saButtonholePlacketFacingHem)
          .line(points.saButtonholePlacketHem)
          .line(points.saButtonholePlacketNeck)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saButtonholePlacketFacingNeck)
          .line(points.saButtonholePlacketFacingHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
