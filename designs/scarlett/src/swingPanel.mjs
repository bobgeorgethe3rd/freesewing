import { centreFront } from './centreFront.mjs'

export const swingPanel = {
  name: 'scarlett.swingPanel',
  from: centreFront,
  options: {
    //Construction
    skirtHemWidth: { pct: 1, min: 0, max: 10, menu: 'construction' },
    waistFacingHemWidth: { pct: 2, min: 1, max: 10, menu: 'construction' },
    sideFrontSaWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
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
    //render
    if (options.swingPanelStyle == 'none') {
      part.hide()
      return part
    }
    //removing paths and in heritance
    delete points.scalebox
    const keepThese = ['waist', 'sideFront']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
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

    paths.centreFront = new Path().move(points.cfHem).line(points.cfWaist).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.centreFront)
      .join(paths.waist)
      .join(paths.sideFront)

    //stores
    store.set('swingWaisbandLength', paths.waist.length())

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfHem
      points.cutOnFoldTo = points.cfWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //title
      points.title = new Point(
        points.waist0Left.x,
        points.waistPanel0Cp1.y + (points.cfHem.y - points.cfWaist.y) / 3
      )
      macro('title', {
        nr: 1,
        title: 'Swing Panel',
        at: points.title,
        scale: 0.5,
      })
      //facings
      paths.hemFacing = new Path()
        .move(points.hemFacingD)
        .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

      if (options.waistbandStyle == 'none' && options.swingPanelStyle != 'separate') {
        paths.waistFacing = new Path()
          .move(points.waistFacingD)
          .curve(points.waistFacingDCp2, points.cfWaistFacingCp1, points.cfWaistFacing)
          .attr('class', 'interfacing')
          .attr('data-text', 'Waist Facing - Line')
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
        const hemSa = sa * options.skirtHemWidth * 100
        const sideFrontSa = sa * options.sideFrontSaWidth * 100

        paths.hemFacingSa = paths.hemBase
          .offset(hemSa)
          .line(points.cfHem)
          .line(points.cfHemFacing)
          .join(paths.hemFacing.reverse().offset(sa))
          .join(new Path().move(paths.hemFacing.start()).line(points.hemD).offset(sideFrontSa))
          .close()
          .attr('class', 'interfacing sa')

        if (options.waistbandStyle == 'none' && options.swingPanelStyle != 'separate') {
          paths.waistFacingSa = paths.waistFacing
            .offset(sa * options.waistFacingHemWidth * 100)
            .line(points.cfWaistFacing)
            .line(points.cfWaist)
            .join(paths.waist.offset(sa))
            .join(
              new Path()
                .move(points.waist0Left)
                .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
                .line(points.waistFacingD)
                .offset(sideFrontSa)
            )
            .close()
            .attr('class', 'interfacing sa')
        }
        paths.sa = paths.hemBase
          .offset(hemSa)
          .join(paths.centreFront)
          .join(paths.waist.offset(sa))
          .join(paths.sideFront.offset(sideFrontSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
