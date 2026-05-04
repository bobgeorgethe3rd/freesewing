import { frontBase } from './frontBase.mjs'

export const centreFront = {
  name: 'playtest.centreFront',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Fit
    hipsEase: { pct: 1, min: 0, max: 20, menu: 'fit' },
    //Style
    skirtLengthBonus: { pct: -10, min: -50, max: 100 },
    necklineWidth: { pct: 25, min: 5, max: 50, menu: 'style' },
    necklineDepth: { pct: 30, min: 10, max: 70, menu: 'style' },
    necklineBend: { pct: 30, min: 0, max: 150, menu: 'style' },
    //Construction
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Playtest
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Playtest
    closurePosition: { dflt: 'back', list: ['front', 'back'], menu: 'construction' }, //Altered for Playtest
  },
  measurements: ['hips', 'waistToHips', 'waistToKnee'],
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
    //removing paths and snippets not required from Daisy
    const keepThese = ['daisyGuide']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const skirtLength = measurements.waistToKnee * (1 + options.skirtLengthBonus)
    const hips = measurements.hips * (1 + options.hipsEase)
    const hipsFront = hips * (1 - measurements.waistBack / measurements.waist)

    points.cfHips = points.cfWaist.shift(-90, measurements.waistToHips)
    points.cfHem = points.cfWaist.shift(-90, skirtLength)
    points.hemAnchor = points.cfHips.shift(
      0,
      hipsFront *
        0.5 *
        (points.waistDartLeft.x /
          (points.waistDartLeft.x + points.waistDartRight.dist(points.sideWaist)))
    )
    points.hemOrigin = utils.beamIntersectsX(points.hemAnchor, points.waistDartLeft, points.cfHem.x)

    const skirtRadius = points.hemOrigin.dist(points.cfHem)
    const skirtAngle = points.hemOrigin.angle(points.waistDartLeft) - 270
    const skirtHemCpDist = (4 / 3) * skirtRadius * Math.tan(utils.deg2rad(skirtAngle / 4))

    points.hemLeft = points.hemOrigin.shiftTowards(points.waistDartLeft, skirtRadius)
    points.cfHemCp2 = points.cfHem.shift(0, skirtHemCpDist)
    points.hemLeftCp1 = points.hemLeft.shift(
      points.hemLeft.angle(points.waistDartLeft) + 90,
      skirtHemCpDist
    )
    //neck
    points.shoulderTop = points.hps.shiftFractionTowards(points.shoulder, options.necklineWidth)
    points.cfTop = points.cfNeck.shiftFractionTowards(points.cfChest, options.necklineDepth)

    points.neckCorner = new Point(points.shoulderTop.x, points.cfTop.y)
    points.cfTopCp1 = points.cfTop.shiftFractionTowards(points.neckCorner, options.necklineBend)
    points.shoulderTopCp2 = points.shoulderTop.shiftFractionTowards(
      points.neckCorner,
      0.2 + Math.min(options.necklineBend, 0.9)
    )

    //paths
    paths.hemBase = new Path()
      .move(points.cfHem)
      .curve(points.cfHemCp2, points.hemLeftCp1, points.hemLeft)
      .hide()

    paths.princessSeam = new Path()
      .move(points.hemLeft)
      .line(points.waistDartLeft)
      .line(points.bust)
      ._curve(points.bustDartTopCp1, points.armholePitch)
      .hide()

    paths.armhole = new Path()
      .move(points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.neckline = new Path()
      .move(points.shoulderTop)
      .curve(points.shoulderTopCp2, points.cfTopCp1, points.cfTop)

    paths.seam = paths.hemBase
      .clone()
      .join(paths.princessSeam)
      .join(paths.armhole)
      .line(points.shoulderTop)
      .join(paths.neckline)
      .line(points.cfHem)
      .close()

    //stores
    store.set('skirtLength', points.waistDartLeft.dist(points.hemLeft))
    store.set('hipsFront', hipsFront)
    store.set('hipsBack', hips - hipsFront)
    store.set('neckShoulder', points.hps.dist(points.shoulderTop))

    return part
  },
}
