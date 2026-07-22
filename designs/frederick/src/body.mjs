import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const body = {
  name: 'frederick.body',
  measurements: ['head', 'shoulderSlope', 'hpsToWaistBack', 'waistToArmpit', 'waistToSeat'],
  options: {
    //Constants
    cNeck: 0.044,
    //Fit
    headEase: { pct: 8.7, min: 0, max: 20, menu: 'fit' },
    //Style
    waistLengthBonus: { pct: 0, min: -20, max: 20, menu: 'style' },
    bodyLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    bodyWidth: { pct: 0, min: -10, max: 10, menu: 'style' },
    gussetWidth: { pct: 55.6, min: 25, max: 75, menu: 'style' },
    //Armhole
    scyeDepth: { pct: 18.2, min: 15, max: 30, menu: 'armhole' },
    //Pockets
    patchPocketsBool: { bool: true, menu: 'pockets' },
    patchPocketWidth: { pct: 64.8, min: 50, max: 75, menu: 'pockets.patchPockets' },
    patchPocketDepth: { pct: 91, min: 50, max: 150, menu: 'pockets.patchPockets' },
    patchPocketPlacement: { pct: -50, min: 0, max: 50, menu: 'pockets.patchPockets' },
    //Construction
    cSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
    neckSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    shoulderSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    hemWidth: { pct: 5, min: 0, max: 3, menu: 'construction' },
  },
  plugins: [pluginBundle, pluginLogoRG],
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
    //measurements
    const head = measurements.head * 0.25 * (1 + options.headEase)
    const bodyLength =
      measurements.hpsToWaistBack * (1 + options.waistLengthBonus) +
      measurements.waistToSeat * (1 + options.bodyLengthBonus)
    const bodyWidth =
      (measurements.hpsToWaistBack + measurements.waistToSeat) * (1 + options.bodyWidth)
    const scyeDepth = measurements.waistToArmpit * (1 - options.scyeDepth)
    const gussetWidth = scyeDepth * options.gussetWidth
    const patchPocketWidth = bodyWidth * 0.5 * options.patchPocketWidth
    const patchPocketDepth = patchPocketWidth * options.patchPocketDepth
    //let's begin
    points.origin = new Point(0, 0)
    points.cNeck = points.origin.shift(-90, measurements.hpsToWaistBack * options.cNeck)
    points.shoulderTop = points.origin.shift(0, head)
    points.cNeckCp1 = utils.beamIntersectsY(
      points.shoulderTop,
      points.shoulderTop.shift(measurements.shoulderSlope * -1 - 90, 1),
      points.cNeck.y
    )

    points.sideHemAnchor = points.origin.shift(0, bodyWidth * 0.5)
    points.shoulder = utils.beamIntersectsX(
      points.shoulderTop,
      points.shoulderTop.shift(measurements.shoulderSlope * -1, 1),
      points.sideHemAnchor.x
    )

    points.sideHem = points.sideHemAnchor.shift(-90, bodyLength)
    points.cHem = new Point(points.cNeck.x, points.sideHem.y)

    //paths
    paths.cNeck = new Path().move(points.shoulderTop)._curve(points.cNeckCp1, points.cNeck)

    paths.seam = new Path()
      .move(points.cHem)
      .line(points.sideHem)
      .line(points.shoulder)
      .line(points.shoulderTop)
      .join(paths.cNeck)
      .line(points.cHem)
      .close()

    //stores
    points.armhole = points.sideHemAnchor.shift(-90, measurements.hpsToWaistBack - scyeDepth)
    store.set('head', head)
    store.set('neckbandLength', paths.cNeck.length() * 4)
    store.set('sleeveWidth', points.armhole.dist(points.shoulder) * 2)
    store.set('gussetWidth', gussetWidth)
    store.set('bodyShoulderLength', points.shoulderTop.dist(points.shoulder))
    store.set('patchPocketWidth', patchPocketWidth)
    store.set('patchPocketDepth', patchPocketDepth)

    if (complete) {
      //grainline
      if (options.cSaWidth == 0) {
        points.cutOnFoldFrom = points.cNeck
        points.cutOnFoldTo = points.cHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cNeck.shiftFractionTowards(points.cNeckCp1, 0.1)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cHem.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      points.gussetAnchor = points.armhole.shift(-90, gussetWidth)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['armhole', 'gussetAnchor'],
      })
      //pocket
      if (options.patchPocketsBool) {
        const patchPocketPlacement =
          (bodyWidth * 0.5 - patchPocketWidth) * 0.5 * (1 + options.patchPocketPlacement)
        points.pocketBottomRight = points.sideHem.shiftTowards(points.cHem, patchPocketPlacement)
        points.pocketBottomLeft = points.pocketBottomRight.shift(180, patchPocketWidth)
        points.pocketTopLeft = points.pocketBottomLeft.shift(90, patchPocketDepth)
        points.pocketTopRight = new Point(points.pocketBottomRight.x, points.pocketTopLeft.y)
        paths.pocketSideLine = new Path()
          .move(points.pocketTopRight)
          .line(points.pocketBottomRight)
          .line(points.pocketBottomLeft)
          .line(points.pocketTopLeft)
          .attr('class', 'mark help')
        paths.pocketTopLine = new Path()
          .move(points.pocketTopLeft)
          .line(points.pocketTopRight)
          .attr('class', 'mark help')
          .attr('data-text', 'Pocket Guide')
          .attr('data-text-class', 'center')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketTopLeft', 'pocketTopRight'],
        })
      }
      //title
      points.title = new Point(points.sideHem.x * 0.45, points.cHem.y * 0.125)
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Front & Back',
        cutNr: options.cSaWidth == 0 ? 2 : 4,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(points.sideHem.x * 0.5, points.cHem.y * 0.25)
      macro('logorg', { at: points.logo, scale: 0.5 })
      //scalebox
      points.scalebox = new Point(points.sideHem.x * 0.5, points.cHem.y * 0.375)
      macro('scalebox', { at: points.scalebox })
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cSa = sa * options.cSaWidth * 100

        points.saCHem = points.cHem.translate(-cSa, hemSa)
        points.saSideHem = points.sideHem.translate(sa * options.sideSeamSaWidth * 100, hemSa)
        points.saShoulder = utils.beamIntersectsX(
          points.shoulder.shiftTowards(points.shoulderTop, shoulderSa).rotate(-90, points.shoulder),
          points.shoulderTop
            .shiftTowards(points.shoulder, shoulderSa)
            .rotate(90, points.shoulderTop),
          points.saSideHem.x
        )
        points.saShoulderTop = utils.beamsIntersect(
          paths.cNeck.offset(neckSa).start(),
          paths.cNeck.offset(neckSa).start().shift(points.cNeckCp1.angle(points.shoulderTop), 1),
          points.saShoulder,
          points.saShoulder.shift(points.shoulder.angle(points.shoulderTop), 1)
        )

        points.saCNeck = new Point(points.saCHem.x, points.cNeck.y - neckSa)

        paths.sa = new Path()
          .move(points.saCHem)
          .line(points.saSideHem)
          .line(points.saShoulder)
          .line(points.saShoulderTop)
          .join(paths.cNeck.offset(neckSa))
          .line(points.saCNeck)
          .line(points.saCHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
