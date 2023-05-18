import { skirtBase } from './skirtBase'
import { inseamPocket } from '@freesewing/wanda'
import { boxPleatPocket } from '@freesewing/wanda'
import { pearPocket } from '@freesewing/wanda'

export const sideFront = {
  name: 'fallon.sideFront',
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
    //set Render
    if (options.seams == 'none' || options.seams == 'sideSeam') {
      part.hide()
      return part
    }
    //removing paths
    for (let i in paths) delete paths[i]
    //measures
    const skirtHemFacingWidth = store.get('skirtHemFacingWidth')
    //let's begin
    //paths

    paths.hemBase = new Path().move(points.hemL)._curve(points.hemLCp2, points.hemD).hide()

    if (options.seams == 'all') {
      paths.hemBase = paths.hemBase.split(points.hemZ)[1].hide()
    }

    paths.saLeft = new Path()
      .move(points.hemD)
      .line(points.dartTipD)
      .curve(points.dartTipDCp2, points.dartTipDCp3, points.waist1Right)

    paths.saWaist = new Path()
      .move(points.waist1Right)
      .curve(points.waist1Cp1, points.waist1Cp2, points.waistPanel1)
      .curve(points.waist1Cp3, points.waist1Cp4, points.waist1Left)
      .hide()

    const drawWaistSeam = () => {
      if (options.seams == 'sideFront') {
        return paths.saWaist
          .clone()
          .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
          .curve(points.dartTipECp2, points.dartTipECp3, points.waist2Right)
          .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
          .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
      } else {
        return paths.saWaist
      }
    }

    const drawSaRight = () => {
      if (options.seams == 'sideFront') {
        return new Path()
          .move(points.waist2Left)
          .curve(points.dartTipFCp1, points.dartTipFCp2, points.dartTipF)
          .line(points.curveStartL)
          .curve(points.curveLCp1, points.curveLCp2, points.hemL)
      } else {
        return new Path()
          .move(points.waist1Left)
          .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
          .line(points.hemZ)
      }
    }

    paths.seam = paths.hemBase.join(paths.saLeft).join(drawWaistSeam()).join(drawSaRight()).close()

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
        points.pocketOpeningTop = drawSaRight().shiftAlong(store.get('pocketOpening'))
        points.pocketOpeningBottom = drawSaRight().shiftAlong(store.get('pocketOpeningLength'))

        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      let titleName
      if (options.seams == 'sideFront') {
        titleName = 'Side Panel'
      } else {
        titleName = 'Side Front'
      }
      points.title = points.origin.shiftOutwards(
        points.waistPanel1,
        points.waistD.dist(points.hemD) * 0.45
      )
      macro('title', {
        nr: '2',
        title: titleName,
        at: points.title,
        rotation: 90 - points.hemD.angle(points.origin),
      })
      //facings
      let hemFacingSplit
      if (options.seams == 'sideFront') {
        hemFacingSplit = points.hemFacingSplitL
      } else {
        hemFacingSplit = points.hemFacingSplitZ
      }

      paths.hemFacing = new Path()
        .move(points.hemFacingL)
        ._curve(points.hemFacingLCp1, points.hemFacingD)
        .split(hemFacingSplit)[1]
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

      if (options.waistbandStyle == 'none') {
        const drawWaistFacing = () => {
          if (options.seams == 'sideFront') {
            return new Path()
              .move(points.waistFacingF)
              .curve(points.waistFacingFCp2, points.waistFacingECp1, points.waistFacingE)
          } else {
            return new Path().move(points.waistFacingE)
          }
        }

        paths.waistFacing = drawWaistFacing()
          .curve(points.waistFacingECp2, points.waistFacingDCp1, points.waistFacingD)
          .attr('class', 'interfacing')
          .attr('data-text', 'Waist Facing - Line')
          .attr('data-text-class', 'center')
      }
      //darts
      if (options.seams == 'sideFront') {
        paths.dart = new Path()
          .move(points.waist1Left)
          .line(points.dartTopE)
          .line(points.waist2Right)
          .attr('class', 'fabric help')
      }
      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100

        const drawWaistSa = () => {
          if (options.seams == 'sideFront') {
            return paths.saWaist
              .clone()
              .line(points.dartTopE)
              .line(points.waist2Right)
              .curve(points.waist2Cp1, points.waist2Cp2, points.waistPanel2)
              .curve(points.waist2Cp3, points.waist2Cp4, points.waist2Left)
          } else {
            return paths.saWaist
          }
        }
        paths.hemFacingSa = paths.hemBase
          .clone()
          .offset(hemSa)
          .join(paths.saLeft.split(points.hemFacingD)[0].offset(sa))
          .join(paths.hemFacing.reverse().offset(sa))
          // .join(drawSaRight().split(hemFacingSplit)[1].offset(sa))
          .close()
          .attr('class', 'interfacing sa')

        if (options.waistbandStyle == 'none') {
          paths.waistFacingSa = paths.waistFacing
            .clone()
            .offset(sa * options.waistFacingHemWidth * 100)
            .join(paths.saLeft.split(points.waistFacingD)[1].offset(sa))
            .join(drawWaistSa().offset(sa))
            // .join(drawSaRight().split(paths.waistFacing.start())[0].offset(sa))
            .close()
            .attr('class', 'interfacing sa')
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .join(paths.saLeft.offset(sa))
          .join(drawWaistSa().offset(sa))
          .join(drawSaRight().offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
