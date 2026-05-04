import { backBase } from './backBase.mjs'

export const centreBack = {
  name: 'playtest.centreBack',
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

    //let's begin
    points.shoulderTop = points.hps.shiftTowards(points.shoulder, store.get('neckShoulder'))
    points.cbTop = utils.beamIntersectsX(
      points.shoulderTop,
      points.shoulderTop.shift(points.hps.angle(points.cbNeck), 1),
      points.cbNeck.x
    )
    points.cbTopCp1 = utils.beamIntersectsY(
      points.shoulderTop,
      points.shoulder.rotate(
        (180 - (points.hps.angle(points.shoulder) - 270)) * -1,
        points.shoulderTop
      ),
      points.cbTop.y
    )
    //hem
    points.cbHips = points.cbWaist.shift(-90, measurements.waistToHips)
    points.hipsLeft = points.cbHips.shift(
      0,
      store.get('hipsBack') *
        0.5 *
        (points.dartBottomLeft.x /
          (points.dartBottomLeft.x + points.dartBottomRight.dist(points.sideWaist)))
    )
    points.hemLeft = points.dartBottomLeft.shiftTowards(points.hipsLeft, store.get('skirtLength'))
    points.hemOrigin = utils.beamIntersectsX(
      points.hemLeft,
      points.dartBottomLeft,
      points.cbWaist.x
    )
    const skirtRadius = points.hemOrigin.dist(points.hemLeft)
    const skirtAngle = points.hemOrigin.angle(points.hemLeft) - 270
    const skirtHemCpDist = (4 / 3) * skirtRadius * Math.tan(utils.deg2rad(skirtAngle / 4))

    points.cbHem = points.hemOrigin.shift(-90, skirtRadius)
    points.cbHemCp2 = points.cbHem.shift(0, skirtHemCpDist)
    points.hemLeftCp1 = points.hemLeft.shift(
      points.hemLeft.angle(points.hemOrigin) + 90,
      skirtHemCpDist
    )

    //paths
    paths.hemBase = new Path()
      .move(points.cbHem)
      .curve(points.cbHemCp2, points.hemLeftCp1, points.hemLeft)
      .hide()

    paths.princessSeam = new Path()
      .move(points.hemLeft)
      .line(points.dartBottomLeft)
      .line(points.dartTip)
      ._curve(points.armholePitchCp3, points.armholePitch)
      .hide()

    paths.armhole = new Path()
      .move(points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.neckline = new Path()
      .move(points.shoulderTop)
      ._curve(points.cbTopCp1, points.cbTop)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.princessSeam)
      .join(paths.armhole)
      .line(points.shoulderTop)
      .join(paths.neckline)
      .line(points.cbHem)
      .close()

    return part
  },
}
