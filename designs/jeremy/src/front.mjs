import { sharedBase } from './sharedBase.mjs'
import { back } from './back.mjs'

export const front = {
  name: 'jeremy.front',
  from: sharedBase,
  after: back,
  options: {
    //Constants
    cfNeck: 0.55191502449,
    cfSaWidth: 0,
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
    //remove paths & snippets
    for (let i in paths) delete paths[i]

    //seam paths
    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.frontArmholePitchCp1, points.frontArmholePitch)
      .curve_(points.frontArmholePitchCp2, points.shoulderFront)
      .hide()

    paths.cfNeck = new Path()
      .move(points.hpsFront)
      .curve(points.hpsFrontCp2, points.cfNeckCp1, points.cfNeck)
      .hide()

    paths.seam = new Path()
      .move(points.cfWaist)
      .line(points.armholeWaist)
      .line(points.armhole)
      .join(paths.armhole)
      .line(points.hpsFront)
      .join(paths.cfNeck)
      .line(points.cfWaist)
      .close()

    if (complete) {
      //grainline
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfNeck
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cfNeck.shiftFractionTowards(points.cfNeckCp1, 1 / 3)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cfWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      snippets.frontArmholePitch = new Snippet('notch', points.frontArmholePitch)
      //title
      points.title = new Point(points.hpsFront.x, points.frontArmholePitch.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Front',
        scale: 0.5,
      })
      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100
        const hemSa = sa * options.hemWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const closureSa = sa * options.closureSaWidth * 100

        let cfSa
        if (options.closurePosition == 'front') {
          cfSa = closureSa
        } else {
          cfSa = sa * options.cbSaWidth * 100
        }
        let sideSeamSa
        if (
          options.closurePosition == 'side' ||
          options.closurePosition == 'sideLeft' ||
          options.closurePosition == 'sideRight'
        ) {
          sideSeamSa = closureSa
        } else {
          sideSeamSa = sa * options.sideSeamSaWidth * 100
        }

        points.saArmholeWaist = points.armholeWaist.translate(sideSeamSa, hemSa)

        points.saArmholeCorner = points.armhole.translate(sideSeamSa, -armholeSa)
        points.saShoulderFrontCorner = points.shoulderFront
          .shift(points.hpsFront.angle(points.shoulderFront), armholeSa)
          .shift(points.hpsFront.angle(points.shoulderFront) + 90, shoulderSa)
        points.saHpsFront = utils.beamsIntersect(
          paths.cfNeck.offset(neckSa).start(),
          paths.cfNeck
            .offset(neckSa)
            .start()
            .shift(points.hpsFront.angle(points.shoulderFront) + 90, 1),
          points.shoulderFront
            .shiftTowards(points.hpsFront, shoulderSa)
            .rotate(-90, points.shoulderFront),
          points.hpsFront.shiftTowards(points.shoulderFront, shoulderSa).rotate(90, points.hpsFront)
        )
        points.saCfNeck = points.cfNeck.translate(-cfSa, -neckSa)
        points.saCfWaist = points.cfWaist.translate(-cfSa, hemSa)

        paths.sa = new Path()
          .move(points.saCfWaist)
          .line(points.saArmholeWaist)
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saShoulderFrontCorner)
          .line(points.saHpsFront)
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfNeck)
          .line(points.saCfWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
