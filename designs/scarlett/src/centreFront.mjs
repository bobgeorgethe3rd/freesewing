import { skirtBase } from './skirtBase.mjs'
import { swingPanel } from './swingPanel.mjs'

export const centreFront = {
  name: 'scarlett.centreFront',
  from: skirtBase,
  after: swingPanel,
  hide: {
    from: true,
  },
  options: {
    //Construction
    inseamSaWidth: { pct: 1, min: 0, max: 3, menu: 'construction' },
    crotchSaWidth: { pct: 1, min: 0, max: 3, menu: 'construction' },
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
    //paths
    paths.hemBase = new Path()
      .move(points.hemD)
      .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
      .line(points.crotchHem)
      .hide()

    paths.inseam = new Path().move(points.crotchHem).line(points.crotch).hide()

    paths.crotch = new Path()
      .move(points.crotch)
      .curve(points.crotchCp1, points.cfSeat, points.cfWaist)
      .hide()

    paths.waist = new Path()
      .move(points.cfWaist)
      .curve(points.waist0Cp1, points.waist0Cp1, points.waistPanel0)
      .curve(points.waist0Cp3, points.waist0Cp4, points.waist0Left)
      .hide()

    paths.sideFront = new Path()
      .move(points.waist0Left)
      .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
      .line(points.hemD)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.inseam)
      .join(paths.crotch)
      .join(paths.waist)
      .join(paths.sideFront)

    if (complete) {
      //grainline
      points.grainlineFrom = points.cfUpperLeg.shiftFractionTowards(points.crotch, 0.8)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.crotchNotch = paths.crotch.shiftFractionAlong(0.5)
      snippets.crotchNotch = new Snippet('notch', points.crotchNotch)

      //title
      points.title = new Point(
        points.waist0Left.x,
        points.waist0Cp2.y + (points.cfHem.y - points.cfWaist.y) / 3
      )
      macro('title', {
        nr: 2,
        title: 'Centre Front',
        at: points.title,
      })
      //scalebox
      points.scalebox = new Point(points.waist0Cp4.x, (points.cfWaist.y + points.cfHem.y) / 2)
      macro('scalebox', {
        at: points.scalebox,
      })
      //facings
      points.hemFacingCrotch = new Point(points.crotch.x, points.cfHemFacing.y)
      paths.hemFacing = new Path()
        .move(points.hemFacingD)
        .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
        .line(points.hemFacingCrotch)
        .attr('class', 'interfacing')
        .attr('data-text', 'Hem Facing - Line')
        .attr('data-text-class', 'center')

      if (options.waistbandStyle == 'none') {
        points.waistFacingCrotch = utils.lineIntersectsCurve(
          points.cfWaistFacingCp1,
          points.cfWaistFacingCp1.shiftOutwards(
            points.cfWaistFacing,
            points.cfUpperLeg.dist(points.crotch)
          ),
          points.crotch,
          points.crotchCp1,
          points.cfSeat,
          points.cfWaist
        )
        paths.waistFacing = new Path()
          .move(points.waistFacingD)
          .curve(points.waistFacingDCp2, points.cfWaistFacingCp1, points.cfWaistFacing)
          .line(points.waistFacingCrotch)
          .attr('class', 'interfacing')
          .attr('data-text', 'Waist Facing - Line')
          .attr('data-text-class', 'center')
      }
      //buttons & buttonholes
      if (options.buttons && options.swingPanelStyle != 'none') {
        for (let i = 0; i <= options.buttonNum - 1; i++) {
          snippets['button' + i] = new Snippet('button', points['button' + i]).attr(
            'data-rotate',
            points['button' + i].angle(points['buttonAngle' + i]) * -1
          )

          if (options.swingPanelStyle == 'connected') {
            snippets['buttonhole' + i] = new Snippet('buttonhole', points['button' + i]).attr(
              'data-rotate',
              points['button' + i].angle(points['buttonAngle' + i]) * -1
            )
          }
        }
      }
      if (sa) {
        let hemSa = sa * options.skirtHemWidth * 100
        let inseamSa = sa * options.inseamSaWidth * 100
        let crotchSa = sa * options.crotchSaWidth * 100

        let sideFrontSa
        if (options.swingPanelStyle == 'none') {
          sideFrontSa = sa
        } else {
          sideFrontSa = sa * options.sideFrontSaWidth * 100
        }

        store.set('sideFrontSa', sideFrontSa)

        paths.hemFacingSa = paths.hemBase
          .offset(hemSa)
          .join(new Path().move(points.crotchHem).line(points.hemFacingCrotch).offset(inseamSa))
          .join(paths.hemFacing.reverse().offset(sa))
          .join(new Path().move(paths.hemFacing.start()).line(points.hemD).offset(sideFrontSa))
          .close()
          .attr('class', 'interfacing sa')

        if (options.waistbandStyle == 'none') {
          let crotchSplit = paths.crotch.split(points.waistFacingCrotch)
          for (let i in crotchSplit) {
            paths['crotch' + i] = crotchSplit[i].hide()
          }

          paths.waistFacingSa = paths.waistFacing
            .offset(sa * options.waistFacingHemWidth * 100)
            .join(paths.crotch1.offset(crotchSa))
            .join(paths.waist.offset(sa))
            .join(
              new Path()
                .move(points.waist0Left)
                .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
                .line(points.waistFacingD)
                .offset(sideFrontSa)
            )
            .close()
            .attr('class', 'interfacing sa')
        }
        paths.sa = paths.hemBase
          .offset(hemSa)
          .join(paths.inseam.offset(inseamSa))
          .join(paths.crotch.offset(crotchSa))
          .join(paths.waist.offset(sa))
          .join(paths.sideFront.offset(sideFrontSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
