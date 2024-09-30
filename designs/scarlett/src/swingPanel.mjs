import { centreFront } from './centreFront.mjs'

export const swingPanel = {
  name: 'scarlett.swingPanel',
  from: centreFront,
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
    //render
    if (options.swingPanelStyle == 'none') {
      part.hide()
      return part
    }
    //removing paths and in heritance
    delete points.scalebox
    if (options.wandaGuides) {
      const keepThese = ['wandaGuide', 'saWaist', 'saLeft']
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      const keepThese = ['saWaist', 'saLeft']
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    }
    macro('scalebox', false)
    macro('logorg', false)
    delete points.logo
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.hemD)
      .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.cfWaist)
      .join(paths.saWaist)
      .join(paths.saLeft)
      .close()

    //stores
    store.set('swingWaisbandLength', paths.saWaist.length())

    if (complete) {
      //grainline
      let titleCutNum
      if (options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfHem
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineFrom = points.cfWaist.shiftFractionTowards(points.cfWaistCp2, 0.9)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //title
      points.title = new Point(
        points.waist0Left.x,
        points.waistPanel0Cp1.y + (points.cfHem.y - points.cfWaist.y) / 3
      )
      macro('title', {
        nr: 1,
        title: 'Swing Panel',
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.5,
      })
      //facings
      if (options.skirtHemFacings) {
        paths.hemFacing = new Path()
          .move(points.hemFacingD)
          .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }
      //buttons & buttonholes
      if (options.buttons) {
        for (let i = 0; i <= options.buttonNum - 1; i++) {
          snippets['buttonhole' + i] = new Snippet('buttonhole', points['button' + i]).attr(
            'data-rotate',
            points['button' + i].angle(points['buttonAngle' + i]) * -1
          )
        }
      }
      if (sa) {
        const cfSa = sa * options.cfSaWidth * 100
        const sideFrontSa = store.get('sideFrontSa')
        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }

        points.saCfHem = points.cfHem.translate(cfSa, hemSa)
        points.saCfWaist = points.cfWaist.translate(cfSa, -sa)

        if (options.skirtHemFacings) {
          points.saCfHemFacing = points.cfHemFacing.translate(cfSa, -sa)
          paths.hemFacingSa = paths.hemBase
            .clone()
            .offset(hemSa)
            .line(points.saCfHem)
            .line(points.saCfHemFacing)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacingD)
            .line(points.saHemD)
            .close()
            .attr('class', 'interfacing sa')
        }
        paths.sa = paths.hemBase
          .offset(hemSa)
          .clone()
          .line(points.saCfHem)
          .line(points.saCfWaist)
          .join(paths.saWaist.offset(sa))
          .line(points.saWaist0Left)
          .join(paths.saLeft.offset(sideFrontSa))
          .line(points.saHemD)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
