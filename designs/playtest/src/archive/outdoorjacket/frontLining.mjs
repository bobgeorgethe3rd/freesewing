import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const frontLining = {
  name: 'playtest.frontLining',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {},
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
    //paths
    paths.cfNeck = paths.cfNeck.line(points.buttonholePlacketLiningNeck).hide()

    paths.seam = new Path()
      .move(points.buttonholePlacketLiningHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.hps)
      .join(paths.cfNeck)
      .line(points.buttonholePlacketLiningHem)
      .close()
      .attr('class', 'lining')

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(
        points.buttonholePlacketHem.shiftFractionTowards(points.cfNeckCorner, 0.25).x,
        points.armhole.y
      )
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['sideWaist', 'armholePitch'],
      })
      //title
      points.title = points.cfNeckCorner
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Front Lining',
        scale: 0.5,
        cutNr: 2,
      })
      //buttons & buttonholes
      for (let i = 0; i <= options.buttonNumber - 1; i++) {
        snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i])
        snippets['button' + i] = new Snippet('button', points['button' + i])
      }
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saSideHem = points.sideHem.translate(sideSeamSa, sa * options.hemWidth * 100)
        points.saButtonholePlacketLiningNeck = points.buttonholePlacketLiningNeck.translate(
          -sa,
          -neckSa
        )
        points.saButtonholePlacketLiningHem = new Point(
          points.saButtonholePlacketLiningNeck.x,
          points.saSideHem.y
        )

        paths.sa = new Path()
          .move(points.saButtonholePlacketLiningHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saHps)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saButtonholePlacketLiningNeck)
          .line(points.saButtonholePlacketLiningHem)
          .close()
          .attr('class', 'lining sa')
      }
    }

    return part
  },
}
