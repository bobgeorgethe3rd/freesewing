import { sideFront as wandaSideFront } from '@freesewing/wanda'
import { centreFront } from './centreFront.mjs'
import { pocket } from '@freesewing/wanda'

export const sideFront = {
  name: 'scarlett.sideFront',
  from: wandaSideFront,
  after: [centreFront, pocket],
  hide: {
    from: true,
  },
  options: {
    //Constants
    frontDart: 'seam', //locked for Scarlett
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
    Snippet,
    absoluteOptions,
    log,
  }) => {
    delete paths.sa
    delete paths.hemFacingSa
    if (options.waistbandStyle == 'none') {
      delete paths.waistFacingSa
    }

    if (complete) {
      //title
      macro('title', {
        nr: '3',
        title: 'Side Front',
        at: points.title,
        rotation: 90 - points.hemD.angle(points.origin),
      })

      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100
        const sideFrontSa = store.get('sideFrontSa')

        paths.hemFacingSa = paths.hemBase
          .clone()
          .offset(hemSa)
          .join(new Path().move(points.hemD).line(points.hemFacingD).offset(sideFrontSa))
          .join(paths.hemFacing.reverse().offset(sa))
          .join(new Path().move(paths.hemFacing.start()).line(points.hemE).offset(sa))
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
                .offset(sideFrontSa)
            )
            .join(
              new Path()
                .move(points.waist1Right)
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
          .join(
            new Path()
              .move(points.hemD)
              .line(points.dartTipD)
              .curve(points.dartTipDCp2, points.dartTipDCp3, points.waist1Right)
              .offset(sideFrontSa)
          )
          .join(
            new Path()
              .move(points.waist1Right)
              .curve(points.waist1Cp1, points.waist1Cp2, points.waistPanel1)
              .curve(points.waist1Cp3, points.waist1Cp4, points.waist1Left)
              .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
              .line(points.hemE)
              .offset(sa)
          )
          .close()
          .attr('class', 'fabrc sa')
      }
    }

    return part
  },
}
