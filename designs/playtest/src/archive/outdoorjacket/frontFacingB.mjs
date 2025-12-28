import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const frontFacingB = {
  name: 'playtest.frontFacingB',
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
      .line(points.buttonholePlacketLiningNeck)
      .hide()

    paths.seam = new Path()
      .move(points.buttonholePlacketLiningHem)
      .line(points.buttonholePlacketHem)
      .line(points.buttonholePlacketNeck)
      .join(paths.cfNeck)
      .line(points.buttonholePlacketLiningHem)
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
        nr: '6',
        title: 'Front Lining B',
        scale: 0.25,
        cutNr: 2,
      })
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
        points.saButtonholePlacketLiningNeck = points.buttonholePlacketLiningNeck.translate(
          -sa,
          -neckSa
        )
        points.saButtonholePlacketLiningHem = new Point(
          points.saButtonholePlacketLiningNeck.x,
          points.saButtonholePlacketHem.y
        )

        paths.sa = new Path()
          .move(points.saButtonholePlacketLiningHem)
          .line(points.saButtonholePlacketHem)
          .line(points.saButtonholePlacketNeck)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saButtonholePlacketLiningNeck)
          .line(points.saButtonholePlacketLiningHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
