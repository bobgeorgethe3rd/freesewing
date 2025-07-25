import { pctBasedOn } from '@freesewing/core'
import { back as terryBack } from '@freesewing/terry'

export const back = {
  name: 'spencer.back',
  from: terryBack,
  hide: {
    after: true,
    from: true,
    inherited: true,
  },
  options: {
    //Style
    neckbandStyle: {
      dflt: 'straight',
      list: ['straight', 'curved', 'hood', 'binding', 'hem'],
      menu: 'style',
    }, //Altered for Spencer
    //Armhole
    armholeType: {
      dflt: 'straight',
      list: ['straight', 'curved', 'binding', 'hem'],
      menu: 'armhole',
    },
    armholeBandWidth: {
      pct: 3.3,
      min: 1,
      max: 6.6,
      snap: 2.5,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'armhole',
    },
    //Construction
    armholeSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' }, //Altered for Spencer
    neckSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' }, //Altered for Spencer
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
    //delete certain paths
    delete paths.seam
    delete paths.sa
    delete snippets.armholePitch
    //measurements
    const armholeBandWidth =
      options.armholeType == 'straight' || options.armholeType == 'curved'
        ? absoluteOptions.armholeBandWidth
        : 0
    //options
    if (options.armholeType == 'straight' || options.armholeType == 'curved')
      options.armholeSaWidth = 0.01
    if (
      options.neckbandStyle == 'straight' ||
      options.neckbandStyle == 'curved' ||
      options.neckbandStyle == 'hood'
    )
      options.neckSaWidth = 0.01
    //let's begin
    points.shoulder = points.shoulder.shiftTowards(points.hps, armholeBandWidth)
    points.armholePitch = points.armholePitch.shift(180, armholeBandWidth)
    points.armhole =
      options.armholeType == 'straight' || options.armholeType == 'curved'
        ? utils.curveIntersectsY(
            points.sideWaist,
            points.sideWaistCp2,
            points.armhole,
            points.armhole,
            points.armhole.y + armholeBandWidth
          )
        : points.armhole
    points.armholePitchCp2 = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitch.shift(90, 1),
      points.shoulder,
      points.hps.rotate(90, points.shoulder)
    )
    points.armholePitchCp1 = points.armholePitch.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )
    points.armholeCp2 = points.armhole.shiftFractionTowards(
      new Point(points.armholePitch.x, points.armhole.y),
      options.backArmholeDepth
    )

    //paths
    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    if (options.armholeType == 'straight' || options.armholeType == 'curved') {
      paths.sideSeam = paths.sideSeam.split(points.armhole)[0].hide()
    }
    if (options.neckbandStyle == 'binding' || options.neckbandStyle == 'hem') {
      paths.cbNeck = new Path().move(points.hps)._curve(points.cbNeckCp1, points.cbNeck).hide()
    }

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(paths.cbNeck.start())
      .join(paths.cbNeck)
      .line(points.cbHem)
      .close()

    //stores
    store.set('armholeBandWidth', armholeBandWidth)
    store.set('armholeBandLengthBack', paths.armhole.length())

    if (complete) {
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = options.armholeType == 'binding' ? 0 : sa * options.armholeSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = options.neckbandStyle == 'binding' ? 0 : sa * options.neckSaWidth * 100

        points.saArmholeCorner = utils.beamsIntersect(
          points.armholeCp2.shift(90, armholeSa),
          points.armhole.shift(90, armholeSa),
          paths.sideSeam.offset(sideSeamSa).end(),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.995)
        )
        points.saShoulderCorner = points.shoulder
          .shift(points.hps.angle(points.shoulder), armholeSa)
          .shift(points.hps.angle(points.shoulder) + 90, shoulderSa)

        points.saShoulderTop = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saShoulderCorner,
          points.saHps
        )

        points.saCbTop = paths.cbNeck.end().translate(-sa * options.cbSaWidth * 100, -neckSa)

        paths.sa = new Path()
          .move(points.saCbHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbTop)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
