import { pctBasedOn } from '@freesewing/core'
import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'
import { waistbandStraight } from './waistbandStraight.mjs'

export const skirtFront = {
  name: 'claude.skirtFront',
  from: skirtBase,
  after: [pocket, waistbandStraight],
  hide: {
    from: true,
  },
  options: {
    //Construction
    skirtHemWidth: { pct: 2, min: 0, max: 5, menu: 'construction' },
    skirtFacings: { bool: true, menu: 'construction' },
    skirtFacingWidth: {
      pct: 4.5,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
  },
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
    log,
    absoluteOptions,
  }) => {
    //removing paths from base
    for (let i in paths) delete paths[i]
    //measures
    let skirtFacingWidth = absoluteOptions.skirtFacingWidth
    //let's begin
    if (points.sideFrontExtension) {
      paths.sideSeam = new Path()
        .move(points.frontHemExtension)
        .line(points.sideFrontExtension)
        .curve_(points.sideSeamFrontCp, points.sideWaistFront)
        .hide()

      if (points.frontHemExSplit) {
        paths.sideSeam = paths.sideSeam.split(points.frontHemExSplit)[1].hide()
      }
    } else {
      paths.sideSeam = new Path().move(points.sideFrontHem).line(points.sideWaistFront).hide()
    }

    paths.waist = new Path()
      .move(points.sideWaistFront)
      .curve(points.waistFrontCp1, points.waistFrontCp2, points.waistFrontMid)
      .curve(points.waistFrontCp3, points.waistFrontCp4, points.cfWaist)
      .hide()

    paths.cf = new Path().move(points.cfWaist).line(points.cfHem).hide()

    paths.hemBase = new Path()
      .move(points.cfHem)
      .curve(points.frontHemCp1, points.frontHemCp2, points.frontHemMid)
      .curve(points.frontHemCp3, points.frontHemCp4, points.sideFrontHem)
      .line(paths.sideSeam.start())
      .hide()

    //paths
    paths.seam = paths.hemBase.join(paths.sideSeam).join(paths.waist).join(paths.cf).close()

    //stores
    store.set('skirtFacingWidth', skirtFacingWidth)
    if (complete) {
      //grainline
      let cfSa
      if (
        options.waistbandClosurePosition == 'front' &&
        !options.waistbandElastic &&
        (options.useBackMeasures ||
          options.independentSkirtFullness ||
          options.independentSkirtGathering)
      ) {
        cfSa = sa
        points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfHem, 0.05)
        points.grainlineTo = points.cfHem.shiftFractionTowards(points.cfWaist, 0.05)
        macro('grainline', {
          from: points.cfWaist.rotate(-90, points.grainlineFrom),
          to: points.cfHem.rotate(90, points.grainlineTo),
        })
      } else {
        cfSa = 0
        points.cutOnFoldFrom = points.cfWaist
        points.cutOnFoldTo = points.cfHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      }
      //notches
      if (store.get('pocketOpeningLength') < paths.sideSeam.length()) {
        points.pocketOpeningTop = paths.sideSeam.reverse().shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = paths.sideSeam
          .reverse()
          .shiftAlong(store.get('pocketOpeningLength'))
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }

      if (sa) {
        let hemSa
        if (options.skirtFacings) {
          hemSa = sa
        } else {
          hemSa = sa * options.skirtHemWidth * 100
        }
        paths.sa = paths.hemBase
          .offset(hemSa)
          .join(paths.sideSeam.join(paths.waist).offset(sa))
          .join(paths.cf.offset(cfSa))
          .close()
          .attr('class', 'fabric sa')

        store.set('hemSa', hemSa)
      }
    }

    return part
  },
}
