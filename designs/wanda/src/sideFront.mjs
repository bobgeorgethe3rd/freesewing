import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'

export const sideFront = {
  name: 'wanda.sideFront',
  from: skirtBase,
  after: pocket,
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
    if (options.wandaGuides) {
      const keepThese = ['wandaGuide']
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //paths
    paths.hemBase = new Path()
      .move(points.hemE)
      .curve(points.hemECp2, points.hemDCp1, points.hemD)
      .hide()

    paths.saRight = new Path()
      .move(points.hemD)
      .line(points.dartTipD)
      .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)
      .hide()

    paths.saWaist = new Path()
      .move(points.waist1Right)
      .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
      .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
      .hide()

    paths.saLeft = new Path()
      .move(points.waist1Left)
      .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
      .line(points.hemE)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.saRight)
      .join(paths.saWaist)
      .join(paths.saLeft)
      .close()

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
          .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
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
        scale: 0.5,
      })
      //facings
      if (options.skirtHemFacings) {
        paths.hemFacing = new Path()
          .move(points.hemFacingE)
          .curve(points.hemFacingECp1, points.hemFacingDCp2, points.hemFacingD)
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }
      if (options.waistbandStyle == 'none') {
        paths.waistFacing = new Path()
          .move(points.waistFacingE)
          .curve(points.waistFacingECp2, points.waistFacingDCp1, points.waistFacingD)
          .attr('class', 'interfacing')
          .attr('data-text', 'Waist Facing - Line')
          .attr('data-text-class', 'center')
      }

      if (sa) {
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
          sideSeamSa = sa * options.closureSaWidth * 100
        }

        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }
        points.saWaist1Left = points.waist1Left
          .shift(points.waist1LeftCp2.angle(points.waist1Left), sa)
          .shift(points.waist1LeftCp1.angle(points.waist1Left), sideSeamSa)

        points.saHemD = points.hemD
          .shift(points.hemDCp1.angle(points.hemD), sa)
          .shift(points.dartTipD.angle(points.hemD), hemSa)

        points.saWaist1Right = points.waist1Right
          .shift(points.waist1RightCp1.angle(points.waist1Right), sa)
          .shift(points.waist1RightCp2.angle(points.waist1Right), sa)

        points.saHemE = points.hemE
          .shift(points.dartTipE.angle(points.hemE), hemSa)
          .shift(points.hemECp2.angle(points.hemE), sideSeamSa)

        if (options.skirtHemFacings) {
          points.saHemFacingD = points.hemFacingD
            .shift(points.hemD.angle(points.hemFacingD), sa)
            .shift(points.hemFacingDCp2.angle(points.hemFacingD), sa)
          points.saHemFacingE = points.hemFacingE
            .shift(points.hemE.angle(points.hemFacingE), sa)
            .shift(points.hemFacingECp1.angle(points.hemFacingE), sideSeamSa)

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
        if (options.waistbandStyle == 'none') {
          paths.waistFacingSa = paths.waistFacing
            .clone()
            .offset(sa * options.waistFacingHemWidth * 100)
            .join(
              new Path()
                .move(points.waistFacingD)
                .line(points.dartTipD)
                .curve(points.dartTipDCp, points.waist1RightCp1, points.waist1Right)
                .curve(points.waist1RightCp2, points.waistPanel1Cp1, points.waistPanel1)
                .curve(points.waistPanel1Cp2, points.waist1LeftCp1, points.waist1Left)
                .curve(points.waist1LeftCp2, points.dartTipECp, points.dartTipE)
                .line(points.waistFacingE)
                .offset(sa)
            )
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saHemD)
          .join(paths.saRight.offset(sa))
          .line(points.saWaist1Right)
          .join(paths.saWaist.offset(sa))
          .line(points.saWaist1Left)
          .join(paths.saLeft.offset(sideSeamSa))
          .line(points.saHemE)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
