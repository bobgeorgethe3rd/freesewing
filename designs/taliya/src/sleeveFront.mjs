import { pluginMirror } from '@freesewing/plugin-mirror'
import { frontBase } from './frontBase.mjs'
import { sleeveBack } from './sleeveBack.mjs'

export const sleeveFront = {
  name: 'taliya.sleeveFront',
  from: frontBase,
  after: sleeveBack,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Construction
    sleeveHemWidth: { pct: 1.5, min: 0, max: 3, menu: 'construction' },
  },
  plugins: [pluginMirror],
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
    //set render
    if (options.sleeveStyle != 'raglan') {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Bella
    const keepThese = ['cfNeck', 'daisyGuide']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const neckbandWidth = store.get('neckbandWidth')
    //let's begin
    macro('mirror', {
      mirror: [points.raglanCurveEnd, points.raglanNeckSplit],
      points: ['armhole'],
      prefix: 'm',
    })

    let tweak = 0.5
    let delta
    do {
      points.raglanCp = points.shoulderTop.shiftFractionTowards(points.shoulder, 1 + tweak)

      points.raglanBottom = utils.beamsIntersect(
        points.mArmhole,
        points.armholeRaglanCp2,
        points.raglanCp,
        points.raglanCp.shift(points.armholeRaglanCp2.angle(points.mArmhole) + 90, 1)
      )

      paths.shoulder = new Path()
        .move(points.raglanBottom)
        .curve(points.raglanCp, points.raglanCp, points.shoulderTop)
        .hide()

      delta = paths.shoulder.length() - store.get('shoulderRaglanLength')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    points.shoulderSplit = paths.shoulder
      .reverse()
      .shiftAlong(points.shoulderTop.dist(points.shoulder))
    //paths
    paths.hemBase = new Path().move(points.mArmhole).line(points.mArmhole).hide()

    paths.cfNeck = paths.cfNeck.split(points.raglanNeckSplit)[0]

    paths.raglan = new Path()
      .move(points.raglanNeckSplit)
      .line(points.raglanCurveEnd)
      ._curve(points.armholeRaglanCp2, points.mArmhole)
      .hide()

    paths.seam = new Path()
      .move(points.mArmhole)
      .line(points.raglanBottom)
      .join(paths.shoulder)
      .join(paths.cfNeck)
      .join(paths.raglan)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = paths.cfNeck.shiftFractionAlong(0.5)
      points.grainlineTo = utils.beamsIntersect(
        points.grainlineFrom,
        points.grainlineFrom.shift(points.raglanBottom.angle(points.mArmhole) + 90, 1),
        points.mArmhole,
        points.raglanBottom
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
        grainline: true,
      })
      //notches
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['mArmhole', 'raglanCurveEnd', 'shoulderSplit'],
      })
      //title
      points.title = points.raglanNeckSplit.shift(
        points.raglanBottom.angle(points.mArmhole) + 90,
        points.shoulderTop.dist(points.raglanBottom) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '4',
        title: 'Sleeve Front',
        scale: 1 / 3,
        rotation: 360 - points.mArmhole.angle(points.raglanBottom),
      })
      if (sa) {
        const hemSa = sa * options.sleeveHemWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100
        const shoulderSa = sa * options.shoulderSaWidth * 100
        let bandSa = sa
        if (sa > neckbandWidth / 2) {
          bandSa = neckbandWidth / 4
          paths.cfNeck
            .attr('class', 'fabric hidden')
            .attr('data-text', utils.units(bandSa) + ' S. All.')
            .attr('data-text-class', 'center')
            .unhide()
        }
        const drawSaShoulder = () =>
          options.sleeveVents
            ? paths.shoulder
                .split(points.shoulderSplit)[0]
                .offset(hemSa)
                .join(paths.shoulder.split(points.shoulderSplit)[1].offset(shoulderSa))
            : paths.shoulder.offset(shoulderSa)

        points.saMArmhole = points.mArmhole
          .shift(points.raglanBottom.angle(points.mArmhole), sa)
          .shift(points.raglanBottom.angle(points.mArmhole) + 90, hemSa)

        points.saRaglanBottom = drawSaShoulder()
          .start()
          .shift(points.raglanBottom.angle(points.mArmhole) + 90, hemSa)

        points.saShoulderTop = drawSaShoulder()
          .end()
          .shift(points.shoulderTopCp2.angle(points.shoulderTop) + 90, bandSa)

        points.saRaglanNeckSplit = utils.beamsIntersect(
          paths.cfNeck.offset(bandSa).shiftFractionAlong(0.995),
          paths.cfNeck.offset(bandSa).end(),
          points.raglanNeckSplit
            .shiftTowards(points.raglanCurveEnd, armholeSa)
            .rotate(-90, points.raglanNeckSplit),
          points.raglanCurveEnd
            .shiftTowards(points.raglanNeckSplit, armholeSa)
            .rotate(90, points.raglanCurveEnd)
        )

        points.saMArmholeTop = points.mArmhole
          .shift(points.raglanBottom.angle(points.mArmhole), sa)
          .shift(points.raglanBottom.angle(points.mArmhole) - 90, armholeSa)

        paths.sa = new Path()
          .move(points.saMArmhole)
          .line(points.saRaglanBottom)
          .join(drawSaShoulder())
          .line(points.saShoulderTop)
          .join(paths.cfNeck.offset(bandSa))
          .line(points.saRaglanNeckSplit)
          .join(paths.raglan.offset(armholeSa))
          .line(points.saMArmholeTop)
          .line(points.saMArmhole)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
