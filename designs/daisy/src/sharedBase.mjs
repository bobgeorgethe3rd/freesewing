export const sharedBase = {
  name: 'daisy.sharedBase',
  options: {
    //Constants
    cbNeck: 0.044,
    neckEase: 0, //.064,
    //Fit
    chestEase: { pct: 4.8, min: 0, max: 20, menu: 'fit' },
    shoulderToShoulderEase: { pct: 0, min: -10, max: 10, menu: 'fit' },
    waistEase: { pct: 5, min: 0, max: 20, menu: 'fit' },
    //Armhole
    scyeDepth: { pct: 18.2, min: 15, max: 30, menu: 'armhole' },
  },
  measurements: ['neck', 'hpsToShoulder', 'shoulderSlope', 'waistToArmpit'],
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
  }) => {
    //measures
    const neck = measurements.neck * (1 + options.neckEase)
    const waistToArmhole = measurements.waistToArmpit * (1 - options.scyeDepth)
    //let's begin
    points.origin = new Point(0, 0)

    points.cbNeck = points.origin.shift(-90, measurements.hpsToWaistBack * options.cbNeck)

    points.hps = points.origin.shift(0, neck / 5)

    points.shoulder = points.hps.shift(
      measurements.shoulderSlope * -1,
      measurements.hpsToShoulder * (1 + options.shoulderToShoulderEase)
    )

    points.cArmhole = points.origin.shift(-90, measurements.hpsToWaistBack - waistToArmhole)

    //guides
    paths.guide = new Path().move(points.shoulder).line(points.hps).line(points.cbNeck)

    //stores
    store.set('neck', neck)
    store.set('waistToArmhole', waistToArmhole)

    return part
  },
}
