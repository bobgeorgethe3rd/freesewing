import { sharedBase } from './sharedBase.mjs'

export const back = {
  name: 'jeremy.back',
  from: sharedBase,
  hide: {
    from: true,
  },
  options: {
    //Constants
    armholeSaWidth: 0.01,
    shoulderSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    neckSaWidth: 0.01,
    closureSaWidth: 0.015,
    cbSaWidth: 0,
    //Construction
    hemWidth: { pct: 3, min: 1, max: 5, menu: 'construction' },
    closurePosition: { dflt: 'back', list: ['front', 'side', 'back'], menu: 'construction' },
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

    paths.cbNeck = new Path().move(points.cbNeck).curve_(points.cbNeckCp2, points.hpsBack).hide()

    paths.armhole = new Path()
      .move(points.shoulderBack)
      ._curve(points.backArmholePitchCp1, points.backArmholePitch)
      .curve(points.backArmholePitchCp2, points.armholeCp1, points.armhole)
      .hide()

    paths.seam = new Path()
      .move(points.armholeWaist)
      .line(points.cbWaist)
      .line(points.cbNeck)
      .join(paths.cbNeck)
      .line(points.shoulderBack)
      .join(paths.armhole)
      .line(points.armholeWaist)
      .close()

    //stores
    if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbWaist
        points.cutOnFoldTo = points.cbNeck
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp2, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      snippets.backArmholePitch = new Snippet('bnotch', points.backArmholePitch)
      //title
      points.title = new Point(points.shoulderBack.x * 0.6, points.backArmholePitch.y)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Back',
        scale: 0.5,
      })
      //scalebox
      points.scalebox = new Point((points.hpsBack.x + points.shoulderBack.x) / 3, points.armhole.y)
      macro('scalebox', {
        at: points.scalebox,
      })

      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100
        const hemSa = sa * options.hemWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const closureSa = sa * options.closureSaWidth * 100

        let cbSa
        if (options.closurePosition == 'back') {
          cbSa = closureSa
        } else {
          cbSa = sa * options.cbSaWidth * 100
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

        points.saArmholeWaist = points.armholeWaist.translate(-sideSeamSa, hemSa)
        points.saCbWaist = points.cbWaist.translate(cbSa, hemSa)
        points.saCbNeck = points.cbNeck.translate(cbSa, -neckSa)

        points.saHps = utils.beamsIntersect(
          paths.cbNeck.offset(neckSa).end(),
          paths.cbNeck
            .offset(neckSa)
            .end()
            .shift(points.hpsBack.angle(points.shoulderBack) - 90, 1),
          points.hpsBack.shiftTowards(points.shoulderBack, shoulderSa).rotate(-90, points.hpsBack),
          points.shoulderBack
            .shiftTowards(points.hpsBack, shoulderSa)
            .rotate(90, points.shoulderBack)
        )

        points.saShoulderCorner = points.shoulderBack
          .shift(points.hpsBack.angle(points.shoulderBack), armholeSa)
          .shift(points.hpsBack.angle(points.shoulderBack) - 90, shoulderSa)

        points.saArmholeCorner = points.armhole.translate(-sideSeamSa, -armholeSa)

        paths.sa = new Path()
          .move(points.saArmholeWaist)
          .line(points.saCbWaist)
          .line(points.saCbNeck)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saHps)
          .line(points.saShoulderCorner)
          .join(paths.armhole.offset(armholeSa))
          .line(points.saArmholeCorner)
          .line(points.saArmholeWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
