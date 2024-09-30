import { skirtBase } from './skirtBase.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const centreFront = {
  name: 'scarlett.centreFront',
  from: skirtBase,
  hide: {
    from: true,
  },
  options: {
    //Construction
    buttons: { bool: true, menu: 'construction' },
    buttonNum: { count: 9, min: 2, max: 20, menu: 'construction' },
    buttonOffset: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    buttonStart: { pct: 1, min: 1, max: 5, menu: 'construction' },
    buttonEnd: { pct: 2.5, min: 1, max: 10, menu: 'construction' },
    crotchSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sideFrontSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  plugins: [pluginLogoRG],
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
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.hemD)
      .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
      .line(points.crotchHem)
      .hide()

    paths.crotch = new Path()
      .move(points.crotch)
      .curve(points.crotchCp2, points.cfWaistCp1, points.cfWaist)
      .hide()

    paths.saWaist = new Path()
      .move(points.cfWaist)
      .curve(points.cfWaistCp2, points.cfWaistCp2, points.waistPanel0)
      .curve(points.waistPanel0Cp2, points.waist0LeftCp1, points.waist0Left)
      .hide()

    paths.saLeft = new Path()
      .move(points.waist0Left)
      .curve(points.waist0LeftCp2, points.dartTipDCp, points.dartTipD)
      .line(points.hemD)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.crotch)
      .join(paths.crotch)
      .join(paths.saWaist)
      .join(paths.saLeft)

    if (complete) {
      //grainline
      points.grainlineFrom = points.cfCrotch.shiftFractionTowards(points.crotch, 0.8)
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
        points.waist0Left.x * 1.05,
        points.cfWaist.y + points.cfWaist.dy(points.cfHem) * 0.2
      )
      macro('title', {
        nr: 2,
        title: 'Centre Front',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(
        points.waist0LeftCp1.x,
        points.cfWaist.y + points.cfWaist.dy(points.cfHem) * 0.4
      )
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = new Point(
        points.waist0LeftCp1.x,
        points.cfWaist.y + points.cfWaist.dy(points.cfHem) * 0.6
      )
      macro('scalebox', {
        at: points.scalebox,
      })
      //facings
      if (options.skirtHemFacings) {
        points.hemFacingCrotch = new Point(points.crotch.x, points.cfHemFacing.y)
        paths.hemFacing = new Path()
          .move(points.hemFacingD)
          .curve(points.hemFacingDCp1, points.cfHemFacingCp2, points.cfHemFacing)
          .line(points.hemFacingCrotch)
          .attr('class', 'interfacing')
          .attr('data-text', 'Hem Facing - Line')
          .attr('data-text-class', 'center')
      }
      //buttons & buttonholes
      if (options.buttons && options.swingPanelStyle != 'none') {
        points.buttonStart = paths.saLeft.shiftAlong(
          measurements.waistToFloor * options.buttonStart
        )
        points.buttonEnd = paths.saLeft
          .reverse()
          .shiftAlong(measurements.waistToFloor * options.buttonEnd)

        paths.button = paths.saLeft
          .split(points.buttonStart)[1]
          .split(points.buttonEnd)[0]
          .offset(store.get('fullWaist') * -options.buttonOffset)
          .hide()

        let j
        for (let i = 0; i <= options.buttonNum - 1; i++) {
          j = i + 1
          points['button' + i] = paths.button.shiftFractionAlong(i / (options.buttonNum - 1))
          points['buttonAngle' + i] = paths.button.shiftFractionAlong(
            (i / (options.buttonNum - 1)) * 0.995
          )
          points.buttonAngle0 = paths.button.shiftFractionAlong(0.005)
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
        const inseamSa = sa * options.inseamSaWidth * 100
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100
        let hemSa = sa * options.skirtHemWidth * 100
        if (options.skirtHemFacings) {
          hemSa = sa
        }

        let sideFrontSa
        if (options.swingPanelStyle == 'none') {
          sideFrontSa = sa
        } else {
          sideFrontSa = sa * options.sideFrontSaWidth * 100
        }
        store.set('sideFrontSa', sideFrontSa)

        points.saCrotchHem = points.crotchHem.translate(inseamSa, hemSa)
        points.saCrotch = points.crotch.translate(inseamSa, -crotchSeamSa)
        points.saCfWaist = points.cfWaist.translate(crotchSeamSa, -sa)

        points.saWaist0Left = points.waist0Left
          .shift(points.waist0LeftCp2.angle(points.waist0Left), sa)
          .shift(points.waist0LeftCp1.angle(points.waist0Left), sideFrontSa)

        points.saHemD = points.hemD
          .shift(points.hemDCp2.angle(points.hemD), sideFrontSa)
          .shift(points.dartTipD.angle(points.hemD), hemSa)

        if (options.skirtHemFacings) {
          points.saHemFacingCrotch = points.hemFacingCrotch.translate(inseamSa, -sa)
          points.saHemFacingD = points.hemFacingD
            .shift(points.hemD.angle(points.hemFacingD), sa)
            .shift(points.hemFacingDCp1.angle(points.hemFacingD), sideFrontSa)
          paths.hemFacingSa = paths.hemBase
            .clone()
            .offset(hemSa)
            .line(points.saCrotchHem)
            .line(points.saHemFacingCrotch)
            .join(paths.hemFacing.reverse().offset(sa))
            .line(points.saHemFacingD)
            .line(points.saHemFacingD)
            .close()
            .attr('class', 'interfacing sa')
        }
        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saCrotchHem)
          .line(points.saCrotch)
          .join(paths.crotch.offset(crotchSeamSa))
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
