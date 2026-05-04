import { frontBase } from './frontBase.mjs'
import { centreFront } from './centreFront.mjs'

export const sideFront = {
  name: 'playtest.sideFront',
  from: frontBase,
  after: centreFront,
  hide: {
    from: true,
    inherited: true,
  },
  options: {},
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
    points.bustDartBottomCp2 = points.bustDartTopCp1.rotate(
      -store.get('bustDartAngle'),
      points.bust
    )
    points.bustCp2 = points.bustDartBottomCp2.shiftOutwards(
      points.bust,
      points.bust.dist(points.waistDartRight) * 0.1
    )
    points.waistDartRightCp1 = points.waistDartRight.shiftFractionTowards(points.bust, 0.5)

    points.waistAnchor = points.waistDartRight.shiftFractionTowards(points.sideWaist, 0.5)
    points.hipsAnchor = points.waistAnchor.shift(
      points.waistAnchor.angle(points.waistDartRight) + 90,
      measurements.waistToHips
    )
    points.hipsRight = points.hipsAnchor.shift(
      points.sideWaist.angle(points.waistDartRight),
      store.get('hipsFront') *
        0.25 *
        (points.waistDartRight.dist(points.sideWaist) /
          (points.waistDartLeft.x + points.waistDartRight.dist(points.sideWaist)))
    )
    points.sideHips = points.hipsRight.rotate(180, points.hipsAnchor)

    points.hemRight = points.waistDartRight.shiftTowards(points.hipsRight, skirtLength)
    points.sideHem = points.sideWaist.shiftTowards(points.sideHips, skirtLength)

    points.hemOrigin = utils.beamsIntersect(
      points.hemRight,
      points.waistDartRight,
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

    //paths
    paths.hemBase = new Path()
      .move(points.hemRight)
      .curve(points.hemRightCp2, points.sideHemCp1, points.sideHem)
      .line(points.sideHem)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.bustDartBottom)
      .hide()

    paths.princessSeam = new Path()
      .move(points.bustDartBottom)
      .curve_(points.bustDartBottomCp2, points.bust)
      .curve(points.bustCp2, points.waistDartRightCp1, points.waistDartRight)
      .line(points.hemRight)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.sideWaist)
      .line(points.armhole)
      .join(paths.armhole)
      .join(paths.princessSeam)
      .close()

    return part
  },
}
