import { skirtBase } from './skirtBase.mjs'
import { inseamPocket } from './inseamPocket.mjs'
import { boxPleatPocket } from './boxPleatPocket.mjs'
import { pearPocket } from './pearPocket.mjs'

export const sideFront = {
  name: 'wanda.sideFront',
  from: skirtBase,
  after: [inseamPocket, boxPleatPocket, pearPocket],
  hide: {
    from: true,
  },
  options: {},
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
    absoluteOptions,
    log,
  }) => {
    //set Render
    if (options.frontDart != 'seam') {
      part.hide()
      return part
    }
    //removing paths
    for (let i in paths) delete paths[i]

    //paths
    paths.hemBase = new Path()
      .move(points.hemE)
      .curve(points.hemECp2, points.hemDCp1, points.hemD)
      .hide()

    paths.saBase = new Path()
      .move(points.hemD)
      .line(points.dartTipD)
      .curve(points.dartTipDCp2, points.dartTipDCp3, points.waist1Right)
      .curve(points.waist1Cp1, points.waist1Cp2, points.waistPanel1)
      .curve(points.waist1Cp3, points.waist1Cp4, points.waist1Left)
      .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
      .line(points.hemE)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistD.shiftFractionTowards(points.hemD, 0.025)
      points.grainlineTo = points.hemD.shiftFractionTowards(points.waistD, 0.025)
      macro('grainline', {
        from: points.waistD.rotate(90, points.grainlineFrom),
        to: points.hemD.rotate(-90, points.grainlineTo),
      })
      //notches
      if (options.pocketsBool) {
        paths.sideSeam = new Path()
          .move(points.waist1Left)
          .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
          .line(points.hemE)
          .hide()
        points.pocketOpeningTop = paths.sideSeam.shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = paths.sideSeam.shiftAlong(store.get('pocketOpeningLength'))

        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      points.title = points.origin.shiftOutwards(
        points.waistPanel1,
        points.waistD.dist(points.hemD) * 0.45
      )
      macro('title', {
        nr: '1b',
        title: 'Side Front',
        at: points.title,
        rotation: 90 - points.hemD.angle(points.origin),
      })
      //facings
      paths.hemFacing = new Path()
        .move(points.hemFacingE)
        .curve(points.hemFacingECp1, points.hemFacingDCp2, points.hemFacingD)
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

      if (options.waistbandStyle == 'none') {
        paths.waistFacing = new Path()
          .move(points.waistFacingE)
          .curve(points.waistFacingECp2, points.waistFacingDCp1, points.waistFacingD)
          .attr('class', 'interfacing')
          .attr('data-text', 'Waist Facing - Line')
          .attr('data-text-class', 'center')
      }

      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100
        paths.hemFacingSa = paths.hemBase
          .clone()
          .offset(hemSa)
          .join(
            new Path()
              .move(points.hemD)
              .line(points.hemFacingD)
              .join(paths.hemFacing.reverse())
              .line(points.hemE)
              .offset(sa)
          )
          .close()
          .attr('class', 'interfacing sa')

        if (options.waistbandStyle == 'none') {
          paths.waistFacingSa = paths.waistFacing
            .clone()
            .offset(sa * options.waistFacingHemWidth * 100)
            .join(
              new Path()
                .move(points.waistFacingD)
                .line(points.dartTipD)
                .curve(points.dartTipDCp2, points.dartTipDCp3, points.waist1Right)
                .curve(points.waist1Cp1, points.waist1Cp2, points.waistPanel1)
                .curve(points.waist1Cp3, points.waist1Cp4, points.waist1Left)
                .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
                .line(points.waistFacingE)
                .offset(sa)
            )
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .join(paths.saBase.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
