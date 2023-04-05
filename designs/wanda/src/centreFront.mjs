import { skirtBase } from './skirtBase.mjs'

export const centreFront = {
  name: 'wanda.centreFront',
  from: skirtBase,
  hide: {
    // from: true
  },
  options: {
    //Construction
    frontDart: { dflt: 'dart', list: ['seam', 'dart'], menu: 'construction' },
    skirtHemWidth: { pct: 1, min: 1, max: 10, menu: 'construction' },
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
    for (let i in paths) delete paths[i]
    //let's begin
    const drawHemBase = () => {
      if (options.frontDart == 'dart') {
        return new Path()
          .move(points.hemE)
          .curve(points.hemECp2, points.hemDCp1, points.hemD)
          .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
      } else {
        return new Path().move(points.hemD).curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
      }
    }

    const drawSeam = () => {
      if (options.frontDart == 'dart') {
        return new Path()
          .move(points.cfHem)
          .line(points.cfWaist)
          .curve(points.waist0Cp1, points.waist0Cp2, points.waistPanel0)
          .curve(points.waist0Cp3, points.waist0Cp4, points.waist0Left)
          .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
          .curve(points.dartTipDCp2, points.dartTipDCp3, points.waist1Right)
          .curve(points.waist1Cp1, points.waist1Cp2, points.waistPanel1)
          .curve(points.waist1Cp3, points.waist1Cp4, points.waist1Left)
          .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
          .line(points.hemE)
      } else {
        return new Path()
          .move(points.cfHem)
          .line(points.cfWaist)
          .curve(points.waist0Cp1, points.waist0Cp2, points.waistPanel0)
          .curve(points.waist0Cp3, points.waist0Cp4, points.waist0Left)
          .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
          .line(points.hemD)
      }
    }

    //paths
    paths.seam = drawHemBase().join(drawSeam()).close()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfHem
      points.cutOnFoldTo = points.cfWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //dart
      let titleNum
      if (options.frontDart == 'dart') {
        paths.dart = new Path()
          .move(points.waist0Left)
          .line(points.dartTopD)
          .line(points.waist1Right)
          .attr('class', 'fabric help')
        titleNum = 1
      } else titleNum = '1a'
      //title
      points.title = new Point(
        points.waist0Left.x,
        points.waist0Cp2.y + (points.cfHem.y - points.cfWaist.y) / 3
      )
      macro('title', {
        nr: titleNum,
        title: 'Centre Front',
        at: points.title,
      })
      //scalebox
      points.scalebox = new Point(points.waist0Cp4.x, (points.cfWaist.y + points.cfHem.y) / 2)
      macro('scalebox', {
        at: points.scalebox,
      })
      //facings
      points.cfHemFacing = points.cfHem.shiftTowards(
        points.cfWaist,
        store.get('skirtHemFacingWidth')
      )
      points.hemFacingDCp1 = utils.beamsIntersect(
        points.hemDCp2,
        points.origin,
        points.hemFacingD,
        points.origin.rotate(-90, points.hemFacingD)
      )
      points.cfHemFacingCp2 = utils.beamsIntersect(
        points.cfHemCp1,
        points.origin,
        points.cfHemFacing,
        points.origin.rotate(90, points.cfHemFacing)
      )

      const drawFacing = () => {
        if (options.frontDart == 'dart') {
          return new Path()
            .move(points.hemFacingE)
            .curve(points.hemFacingECp1, points.hemFacingDCp2, points.hemFacingD)
            .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
        } else {
          return new Path()
            .move(points.hemFacingD)
            .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
        }
      }

      paths.hemFacing = drawFacing()
        .attr('class', 'interfacing')
        .attr('data-text', 'Facing - Line')
        .attr('data-text-class', 'center')

      if (sa) {
        const drawSaBase = () => {
          if (options.frontDart == 'dart') {
            return new Path()
              .move(points.cfWaist)
              .curve(points.waist0Cp1, points.waist0Cp2, points.waistPanel0)
              .curve(points.waist0Cp3, points.waist0Cp4, points.waist0Left)
              .line(points.dartTopD)
              .line(points.waist1Right)
              .curve(points.waist1Cp1, points.waist1Cp2, points.waistPanel1)
              .curve(points.waist1Cp3, points.waist1Cp4, points.waist1Left)
              .curve(points.dartTipECp1, points.dartTipECp2, points.dartTipE)
              .line(points.hemE)
          } else {
            return new Path()
              .move(points.cfWaist)
              .curve(points.waist0Cp1, points.waist0Cp2, points.waistPanel0)
              .curve(points.waist0Cp3, points.waist0Cp4, points.waist0Left)
              .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
              .line(points.hemD)
          }
        }

        paths.facingSa = drawHemBase()
          .offset(sa * options.skirtHemWidth * 100)
          .line(points.cfHem)
          .line(points.cfWaist)
          .join(drawFacing().reverse().line(drawHemBase().start()).offset(sa))
          .attr('class', 'interfacing sa')

        paths.sa = drawHemBase()
          .offset(sa * options.skirtHemWidth * 100)
          .line(points.cfHem)
          .line(points.cfWaist)
          .join(drawSaBase().offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
