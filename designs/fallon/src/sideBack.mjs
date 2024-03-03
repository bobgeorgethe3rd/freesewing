import { skirtBase } from './skirtBase.mjs'
import { pocket } from './pocket.mjs'

export const sideBack = {
  name: 'fallon.sideBack',
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
    //set Render
    if (options.seams == 'none' || options.seams == 'sideFront') {
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
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.hemL)
      ._curve(points.hemLCp2, points.hemD)
      .split(points.hemZ)[0]
      .hide()

    paths.saBase = new Path()
      .move(points.hemZ)
      .line(points.dartTipE)
      .curve(points.dartTipECp, points.waist2RightCp1, points.waist2Right)
      .curve(points.waist2RightCp2, points.waistPanel2Cp1, points.waistPanel2)
      .curve(points.waistPanel2Cp2, points.waist2LeftCp1, points.waist2Left)
      .curve(points.waist2LeftCp2, points.dartTipFCp, points.dartTipF)
      .line(points.curveStartL)
      .curve(points.curveStartLCp2, points.hemLCp1, points.hemL)
      .hide()

    paths.seam = paths.hemBase.join(paths.saBase)

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistE.shiftFractionTowards(points.hemE, 0.025)
      points.grainlineTo = points.hemE.shiftFractionTowards(points.waistE, 0.025)
      macro('grainline', {
        from: points.waistE.rotate(90, points.grainlineFrom),
        to: points.hemE.rotate(-90, points.grainlineTo),
      })
      //notches
      if (options.pocketsBool) {
        paths.sideSeam = new Path()
          .move(points.waist2Right)
          .curve(points.waist2RightCp1, points.dartTipECp, points.dartTipE)
          .line(points.hemZ)
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
        points.waistPanel2,
        points.waistE.dist(points.hemE) * 0.45
      )
      macro('title', {
        nr: '3',
        title: 'Side Back',
        at: points.title,
        rotation: 90 - points.hemE.angle(points.origin),
        scale: 0.5,
      })
      //facings
      if (options.skirtHemFacings) {
        paths.hemFacing = new Path()
          .move(points.hemFacingL)
          .curve(points.hemFacingLCp1, points.hemFacingDCp2, points.hemFacingD)
          .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
          .split(points.hemFacingSplitZ)[0]
          .split(points.hemFacingSplitL)[1]
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          paths.hemFacingSa = paths.hemBase
            .clone()
            .offset(hemSa)
            .join(paths.saBase.split(points.hemFacingSplitZ)[0].offset(sa))
            .join(paths.hemFacing.reverse().offset(sa))
            .join(paths.saBase.split(points.hemFacingSplitL)[1].offset(sa))
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
