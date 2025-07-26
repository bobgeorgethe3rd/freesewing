import { front as terryFront } from '@freesewing/terry'
import { back } from './back.mjs'

export const front = {
  name: 'spencer.front',
  from: terryFront,
  after: back,
  hide: {
    from: true,
    inherited: true,
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
    if (options.armholeType == 'straight' || options.armholeType == 'curved') {
      delete paths.pocketline
      const keepSnippets = ['sideWaist']
      for (const name in snippets) {
        if (keepSnippets.indexOf(name) === -1) delete snippets[name]
      }
    }
    //measurements
    const armholeBandWidth = store.get('armholeBandWidth')
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
      paths.cfNeck = new Path()
        .move(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .hide()
    }

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(paths.cfNeck.start())
      .join(paths.cfNeck)
      .line(points.cfHem)
      .close()

    //stores
    store.set('armholeBandLength', store.get('armholeBandLengthBack') + paths.armhole.length())

    if (complete) {
      //pockets
      if (options.pocketsBool) {
        points.pocketMid = new Point(points.armholePitch.x / 2, points.pocketMid.y)
        points.pocketLeft = points.pocketMid.shift(180, store.get('patchPocketWidth') / 2)
        points.pocketRight = points.pocketLeft.flipX(points.pocketMid)
        paths.pocketline = new Path()
          .move(points.pocketLeft)
          .line(points.pocketRight)
          .attr('class', 'mark')
          .attr('data-text', 'Pocket line')
          .attr('data-text-class', 'center')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketLeft', 'pocketRight'],
        })
      }
      //binding info
      if (options.neckbandStyle == 'binding')
        points.neckBinding = new Point(points.sideHem.x * 0.7, points.sideHem.y * 0.85).attr(
          'data-text',
          'Neck Length: ' + utils.units((paths.cfNeck.length() + store.get('neckBack')) * 2)
        )
      if (options.armholeType == 'binding')
        points.armholeBinding = new Point(points.sideHem.x * 0.7, points.sideHem.y * 0.9).attr(
          'data-text',
          'Armhole Length: ' + utils.units(paths.armhole.length() + store.get('backArmholeLength'))
        )

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
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hps.angle(points.shoulder) + 90, 1),
          points.saShoulderCorner,
          points.saHps
        )
        points.saCfTop = paths.cfNeck.end().translate(-sa * options.cfSaWidth * 100, -neckSa)

        paths.sa = new Path()
          .move(points.saCfHem)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfTop)
          .line(points.saCfHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
