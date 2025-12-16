import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const frontLeft = {
  name: 'playtest.frontLeft',
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
    paths.cfNeck = paths.cfNeck.split(points.buttonholePlacketNeck)[0].hide()

    paths.seam = new Path()
      .move(points.buttonholePlacketHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.hps)
      .join(paths.cfNeck)
      .line(points.buttonholePlacketHem)
      .close()

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
        nr: '2',
        title: 'Front Left',
        scale: 0.5,
        cutNr: 1,
      })
      //patch pocket
      if (options.liningPocketsBool) {
        paths.liningPocket = new Path()
          .move(points.liningPocketLeft)
          .line(points.liningPocketRight)
          .attr('class', 'mark')
          .attr('data-text', 'Lining Pocket Line')
          .attr('data-text-class', 'center')

        macro('sprinkle', {
          snippet: 'notch',
          on: ['liningPocketLeft', 'liningPocketRight'],
        })
      }

      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saSideHem = points.sideHem.translate(sideSeamSa, sa * options.hemWidth * 100)

        points.saCfNeckEnd = paths.cfNeck.offset(neckSa).end()

        const saButtonholePlacketNeckIntersect = utils.beamIntersectsY(
          points.buttonholePlacketNeck.shift(180, sa),
          points.buttonholePlacketHem.shift(180, sa),
          points.saCfNeckEnd.y
        )

        if (saButtonholePlacketNeckIntersect.x < points.saCfNeckEnd.x) {
          points.saButtonholePlacketNeck = saButtonholePlacketNeckIntersect
        } else {
          points.saButtonholePlacketNeck = points.buttonholePlacketNeck.shift(180, sa)
        }
        points.saButtonholePlacketHem = new Point(
          points.saButtonholePlacketNeck.x,
          points.saSideHem.y
        )

        paths.sa = new Path()
          .move(points.saButtonholePlacketHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saHps)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saButtonholePlacketNeck)
          .line(points.saButtonholePlacketHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
