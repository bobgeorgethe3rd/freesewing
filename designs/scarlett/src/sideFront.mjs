import { sideFront as wandaSideFront } from '@freesewing/wanda'
import { skirtBase } from './skirtBase.mjs'
import { centreFront } from './centreFront.mjs'
import { pocket } from './pocket.mjs'

export const sideFront = {
  name: 'scarlett.sideFront',
  from: skirtBase,
  after: [centreFront, pocket],
  hide: {
    from: true,
  },
  draft: (sh) => {
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      utils,
      options,
      measurements,
      snippets,
      Snippet,
      store,
      complete,
      part,
      sa,
    } = sh
    //set draft
    wandaSideFront.draft(sh)
    //delete paths
    delete paths.sa
    delete paths.hemFacingSa

    if (complete) {
      //title
      macro('title', {
        nr: '3',
        title: 'Side Front',
        at: points.title,
        cutNr: 2,
        rotation: 90 - points.hemD.angle(points.origin),
        scale: 0.5,
      })

      if (sa) {
        const sideFrontSa = store.get('sideFrontSa')
        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
          sideSeamSa = sa * options.closureSaWidth * 100
        }
        points.saHemD = points.hemD
          .shift(points.hemDCp1.angle(points.hemD), sideFrontSa)
          .shift(points.dartTipD.angle(points.hemD), hemSa)

        points.saWaist1Right = points.waist1Right
          .shift(points.waist1RightCp1.angle(points.waist1Right), sa)
          .shift(points.waist1RightCp2.angle(points.waist1Right), sideFrontSa)

        if (options.skirtHemFacings) {
          points.saHemFacingD = points.hemFacingD
            .shift(points.hemD.angle(points.hemFacingD), sa)
            .shift(points.hemFacingDCp2.angle(points.hemFacingD), sideFrontSa)

          paths.hemFacingSa = paths.hemBase
            .clone()
            .offset(hemSa)
            .line(points.saHemD)
            .line(points.saHemFacingD)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacingE)
            .line(points.saHemE)
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saHemD)
          .join(paths.saRight.offset(sideFrontSa))
          .line(points.saWaist1Right)
          .join(paths.saWaist.offset(sa))
          .line(points.saWaist1Left)
          .join(paths.saLeft.offset(sideSeamSa))
          .line(points.saHemE)
          .close()
          .attr('class', 'fabrc sa')
      }
    }

    return part
  },
}
