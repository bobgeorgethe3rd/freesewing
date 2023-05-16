import { skirtBase } from './skirtBase'
import { inseamPocket } from '@freesewing/wanda'
import { boxPleatPocket } from '@freesewing/wanda'
import { pearPocket } from '@freesewing/wanda'

export const backPanel = {
  name: 'fallon.backPanel',
  from: skirtBase,
  after: [inseamPocket, boxPleatPocket, pearPocket],
  // hide: {
  // from: true,
  // },
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
    for (let i in paths) delete paths[i]
    //measures
    const skirtHemFacingWidth = store.get('skirtHemFacingWidth')
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.hemJ)
      .curve(points.hemJCp2, points.hemYCp1, points.hemY)
      .hide()

    paths.waist = new Path()
      .move(points.waistF)
      .curve(points.waistFCp2, points.waist6BCp1, points.waist6B)
      .hide()

    paths.saBase = new Path()
      .move(points.hemY)
      .line(points.waistF)
      .join(paths.waist)
      .line(points.hemJ)
      .hide()

    paths.seam = paths.hemBase.join(paths.saBase).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistF.shiftFractionTowards(points.hemY, 0.025)
      points.grainlineTo = points.hemY.shiftFractionTowards(points.waistF, 0.025)
      macro('grainline', {
        from: points.waistF.rotate(90, points.grainlineFrom),
        to: points.hemY.rotate(-90, points.grainlineTo),
      })
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
        nr: '3',
        title: 'Back Panel',
        at: points.title,
        rotation: 90 - points.hemY.angle(points.origin),
      })
      //facings
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

      if (options.waistbandStyle == 'none') {
        paths.waistFacing = new Path()
          .move(points.waistFacing6B)
          .curve(points.waistFacing6BCp2, points.waistFacingFCp1, points.waistFacingF)
          .attr('class', 'interfacing')
          .attr('data-text', 'Waist Facing - Line')
          .attr('data-text-class', 'center')
      }
      //pleats
      if (options.pleats) {
        const pleatTo = store.get('fullWaist') * (1 / 12)
        const pleatFrom = paths.waist.length()

        const pleatKeep = pleatTo / (options.pleatNumber + 1)
        const pleatLength = (pleatFrom - pleatTo) / options.pleatNumber
        const pleatLineLength = store.get('frontLength') / 15

        for (let i = 0; i < options.pleatNumber + 1; i++) {
          points['pleatFromTop' + i] = paths.waist.shiftAlong(
            pleatKeep + (pleatKeep + pleatLength) * i
          )
          points['pleatToTop' + i] = paths.waist.shiftAlong((pleatKeep + pleatLength) * i)
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
      }

      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100
        paths.hemFacingSa = paths.hemBase
          .offset(hemSa)
          .join(
            new Path()
              .move(points.hemY)
              .line(points.hemFacingY)
              .join(paths.hemFacing.reverse())
              .line(points.hemJ)
              .offset(sa)
          )
          .close()
          .attr('class', 'interfacing sa')
        if (options.waistbandStyle == 'none') {
          paths.waistFacingSa = paths.waistFacing
            .offset(sa * options.waistFacingHemWidth * 100)
            .join(new Path().move(points.waistFacingF).line(points.waistF).offset(sa))
            .join(paths.waist.offset(sa))
            .join(new Path().move(points.waist6B).line(points.waistFacing6B).offset(sa))
            .close()
            .attr('class', 'interfacing sa')
        }
        paths.sa = paths.hemBase
          .offset(hemSa)
          .join(paths.saBase.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
