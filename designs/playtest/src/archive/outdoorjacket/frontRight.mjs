import { pluginFlip } from '@freesewing/plugin-flip'
import { pctBasedOn } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const frontRight = {
  name: 'playtest.frontRight',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    liningPocketRight: { bool: false, menu: 'pockets' },
  },
  plugins: [pluginFlip],
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
    paths.cfNeck = paths.cfNeck.line(points.buttonholePlacketFacingNeck).hide()

    paths.seam = new Path()
      .move(points.buttonholePlacketFacingHem)
      .line(points.sideHem)
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.hps)
      .join(paths.cfNeck)
      .line(points.buttonholePlacketFacingHem)
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
      if (
        options.sidePocketsBool &&
        store.get('sidePocketOpeningDepth') + store.get('sidePocketOpeningWidth') <
          paths.sideSeam.length()
      ) {
        macro('sprinkle', {
          snippet: 'bnotch',
          on: ['sidePocketOpeningTop', 'sidePocketOpeningBottom'],
        })
      }
      //foldline
      paths.foldline = new Path()
        .move(points.buttonholePlacketFoldNeck)
        .line(points.buttonholePlacketFoldHem)
        .attr('class', 'mark help')
        .attr('data-text', 'Fold-line')
        .attr('data-text-class', 'center')
      //buttons
      for (let i = 0; i <= options.buttonNumber - 1; i++) {
        snippets['button' + i] = new Snippet('button', points['button' + i])
      }
      //lining pocket
      if (options.liningPocketsBool && options.liningPocketRight) {
        paths.liningPocket = new Path()
          .move(points.liningPocketRight)
          .line(points.liningPocketLeft)
          .attr('class', 'mark')
          .attr('data-text', 'Lining  Pocket Line')
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
        points.saButtonholePlacketFacingNeck = points.buttonholePlacketFacingNeck.translate(
          -sa,
          -neckSa
        )
        points.saButtonholePlacketFacingHem = new Point(
          points.saButtonholePlacketFacingNeck.x,
          points.saSideHem.y
        )

        if (points.sidePocketOpeningTop && options.sidePocketsBool) {
          points.saSidePocketOpeningTop = new Point(
            points.saArmholeCorner.x,
            points.sidePocketOpeningTop.y
          )
          points.saSidePocketOpeningBottom = new Point(
            points.saArmholeCorner.x,
            points.sidePocketOpeningBottom.y
          )

          paths.sidePocketSa = new Path()
            .move(points.saSidePocketOpeningBottom)
            .line(points.sidePocketOpeningBottom)
            .line(points.sidePocketOpeningTop)
            .line(points.saSidePocketOpeningTop)
            .attr('class', 'mark lashed')
            .attr('data-text', 'Side Pocket Stitching Line')
            .attr('data-text-class', 'center')
        }

        paths.sa = new Path()
          .move(points.saButtonholePlacketFacingHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saHps)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saButtonholePlacketFacingNeck)
          .line(points.saButtonholePlacketFacingHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    macro('flip')

    if (complete) {
      //title
      points.title = points.cfNeckCorner
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Front Right',
        scale: 0.5,
        cutNr: 1,
      })
    }

    return part
  },
}
