import { backBase } from './backBase.mjs'

export const sideBack = {
  name: 'playtest.sideBack',
  from: backBase,
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
    //removing paths and snippets not required from Daisy
    const keepThese = ['daisyGuide']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const skirtLength = store.get('skirtLength')
    //let's begin
    points.waistAnchor = points.dartBottomRight.shiftFractionTowards(points.sideWaist, 0.5)
    points.hipsAnchor = points.waistAnchor.shift(
      points.waistAnchor.angle(points.dartBottomRight) + 90,
      measurements.waistToHips
    )
    points.hipsRight = points.hipsAnchor.shift(
      points.sideWaist.angle(points.dartBottomRight),
      store.get('hipsBack') *
        0.25 *
        (points.dartBottomRight.dist(points.sideWaist) /
          (points.dartBottomLeft.x + points.dartBottomRight.dist(points.sideWaist)))
    )
    points.sideHips = points.hipsRight.rotate(180, points.hipsAnchor)

    points.hemRight = points.dartBottomRight.shiftTowards(points.hipsRight, skirtLength)
    points.sideHem = points.sideWaist.shiftTowards(points.sideHips, skirtLength)

    points.hemOrigin = utils.beamsIntersect(
      points.hemRight,
      points.dartBottomRight,
      points.sideHem,
      points.sideWaist
    )

    const skirtRadius = points.hemOrigin.dist(points.hemRight)
    const skirtAngle =
      points.hemOrigin.angle(points.sideHem) - points.hemOrigin.angle(points.hemRight)
    const skirtHemCpDist = (4 / 3) * skirtRadius * Math.tan(utils.deg2rad(skirtAngle / 4))

    points.hemRightCp2 = points.hemRight.shift(
      points.hemRight.angle(points.hemOrigin) - 90,
      skirtHemCpDist
    )
    points.sideHemCp1 = points.sideHem.shift(
      points.sideHem.angle(points.hemOrigin) + 90,
      skirtHemCpDist
    )
    //princess seam
    points.dartTipCp2 = points.armholePitchCp3.shiftOutwards(
      points.dartTip,
      points.dartTip.dist(points.dartBottomRight) * 0.1
    )
    points.dartBottomRightCp1 = points.dartBottomRight.shiftFractionTowards(points.dartTip, 0.5)
    //paths
    paths.hemBase = new Path()
      .move(points.hemRight)
      .curve(points.hemRightCp2, points.sideHemCp1, points.sideHem)
      .line(points.sideHem)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .hide()

    paths.princessSeam = new Path()
      .move(points.armholePitch)
      .curve_(points.armholePitchCp3, points.dartTip)
      .curve(points.dartTipCp2, points.dartBottomRightCp1, points.dartBottomRight)
      .line(points.hemRight)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.sideWaist)
      .line(points.armhole)
      .join(paths.armhole)
      .join(paths.princessSeam)
      .unhide()

    return part
  },
}
