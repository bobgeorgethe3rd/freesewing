import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'

export const backPanel = {
  name: 'fallon.backPanel',
  from: skirtBase,
  after: pocket,
  hide: {
    from: true,
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
    //removing paths
    if (options.wandaGuides) {
      const keepThese = ['wandaGuide']
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //measures
    const skirtHemFacingWidth = store.get('skirtHemFacingWidth')
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.hemJ)
      .curve(points.hemJCp2, points.hemYCp1, points.hemY)
      .hide()

    paths.saWaist = new Path()
      .move(points.waistF)
      .curve(points.waistFCp2, points.waist6BCp1, points.waist6B)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.waistF)
      .join(paths.saWaist)
      .line(points.hemJ)
      .close()

    if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.waist6B
        points.cutOnFoldTo = points.hemJ
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.waistF.shiftFractionTowards(points.hemY, 0.025)
        points.grainlineTo = points.hemY.shiftFractionTowards(points.waistF, 0.025)
        macro('grainline', {
          from: points.waistF.rotate(90, points.grainlineFrom),
          to: points.hemY.rotate(-90, points.grainlineTo),
        })
      }
      //notches
      if (options.pocketsBool && (options.seams == 'none' || options.seams == 'sideFront')) {
        points.pocketOpeningTop = points.waistF.shiftTowards(
          points.hemF,
          store.get('pocketOpening')
        )
        points.pocketOpeningBottom = points.waistF.shiftTowards(
          points.hemF,
          store.get('pocketOpeningLength')
        )
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      points.title = points.waistF.shiftFractionTowards(points.hemYCp1, 0.5)
      macro('title', {
        nr: '4',
        title: 'Back Panel',
        at: points.title,
        rotation: 90 - points.hemY.angle(points.origin),
        scale: 0.5,
      })
      //facings
      if (options.skirtHemFacings) {
        points.hemFacingY = points.hemY.shiftTowards(points.waistF, skirtHemFacingWidth)
        points.hemFacingJ = points.hemJ.shiftTowards(points.waist6B, skirtHemFacingWidth)
        points.hemFacingYCp2 = utils.beamsIntersect(
          points.hemFacingY,
          points.hemFacingY.shift(points.hemY.angle(points.hemYCp1, 1), 1),
          points.hemYCp1,
          points.origin
        )
        points.hemFacingJCp1 = utils.beamsIntersect(
          points.hemFacingJ,
          points.origin.rotate(-90, points.hemFacingJ),
          points.hemJCp2,
          points.origin
        )
        paths.hemFacing = new Path()
          .move(points.hemFacingJ)
          .curve(points.hemFacingJCp1, points.hemFacingYCp2, points.hemFacingY)
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }
      //pleats
      if (options.pleats) {
        const pleatTo = store.get('fullWaist') / 12
        const pleatFrom = paths.saWaist.length()

        const pleatKeep = pleatTo / (options.pleatNumber + 1)
        const pleatLength = (pleatFrom - pleatTo) / options.pleatNumber
        const pleatLineLength = store.get('frontLength') / 15

        for (let i = 0; i < options.pleatNumber + 1; i++) {
          points['pleatFromTop' + i] = paths.saWaist.shiftAlong(
            pleatKeep + (pleatKeep + pleatLength) * i
          )
          points['pleatToTop' + i] = paths.saWaist.shiftAlong((pleatKeep + pleatLength) * i)
          points['pleatFromBottom' + i] = points['pleatFromTop' + i]
            .shiftTowards(points['pleatToTop' + i], pleatLineLength)
            .rotate(-90, points['pleatFromTop' + i])
          points['pleatToBottom' + i] = points['pleatToTop' + i]
            .shiftTowards(points['pleatFromTop' + i], pleatLineLength)
            .rotate(90, points['pleatToTop' + i])
        }
        for (let i = 0; i < options.pleatNumber; i++) {
          paths['pleatFrom' + i] = new Path()
            .move(points['pleatFromTop' + i])
            .line(points['pleatFromBottom' + i])
            .attr('class', 'mark lashed')
            .attr('data-text', 'Pleat - From')
            .attr('data-text-class', 'center')

          paths['pleatTo' + i] = new Path()
            .move(points['pleatToTop' + (i + 1)])
            .line(points['pleatToBottom' + (i + 1)])
            .attr('class', 'mark')
            .attr('data-text', 'Pleat. Fold - To')
            .attr('data-text-class', 'center')
        }
        store.set('pleatTo', pleatTo)
      }

      if (sa) {
        const closureSa = sa * options.closureSaWidth * 100
        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }
        let sideSeamSa = sa
        if (options.seams == 'sideFront' || options.seams == 'none') {
          if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
            sideSeamSa = closureSa
          } else {
            sideSeamSa = sa * options.sideSeamSaWidth * 100
          }
        }
        let cbSa = sa * options.cbSaWidth * 100
        if (options.closurePosition == 'back') {
          cbSa = closureSa
        }

        points.saHemY = utils.beamsIntersect(
          points.hemYCp1.shiftTowards(points.hemY, hemSa).rotate(-90, points.hemYCp1),
          points.hemY.shiftTowards(points.hemYCp1, hemSa).rotate(90, points.hemY),
          points.hemY.shiftTowards(points.waistF, sideSeamSa).rotate(-90, points.hemY),
          points.waistF.shiftTowards(points.hemY, sideSeamSa).rotate(90, points.waistF)
        )

        points.hemY
          .shift(points.hemYCp1.angle(points.hemY), sideSeamSa)
          .shift(points.waistF.angle(points.hemY), hemSa)

        points.saWaistF = points.waistF
          .shift(points.hemY.angle(points.waistF), sa)
          .shift(points.waistFCp2.angle(points.waistF), sideSeamSa)

        points.saWaist6B = points.waist6B
          .shift(points.hemJ.angle(points.waist6B), sa)
          .shift(points.waist6BCp1.angle(points.waist6B), cbSa)

        points.saHemJ = points.hemJ
          .shift(points.hemJCp2.angle(points.hemJ), cbSa)
          .shift(points.waist6B.angle(points.hemJ), hemSa)

        if (options.skirtHemFacings) {
          points.saHemFacingY = utils.beamsIntersect(
            paths.hemFacing.reverse().offset(sa).shiftFractionAlong(0.005),
            paths.hemFacing.reverse().offset(sa).start(),
            points.hemY.shiftTowards(points.waistF, sideSeamSa).rotate(-90, points.hemY),
            points.waistF.shiftTowards(points.hemY, sideSeamSa).rotate(90, points.waistF)
          )
          points.saHemFacingJ = points.hemFacingJ
            .shift(points.hemJ.angle(points.hemFacingJ), sa)
            .shift(points.hemFacingJCp1.angle(points.hemFacingJ), cbSa)

          paths.hemFacingSa = paths.hemBase
            .offset(hemSa)
            .line(points.saHemY)
            .line(points.saHemFacingY)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacingJ)
            .line(points.saHemJ)
            .close()
            .attr('class', 'interfacing sa')
        }
        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saHemY)
          .line(points.saWaistF)
          .join(paths.saWaist.offset(sa))
          .line(points.saWaist6B)
          .line(points.saHemJ)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
