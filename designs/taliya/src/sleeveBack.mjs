import { pluginMirror } from '@freesewing/plugin-mirror'
import { backBase } from './backBase.mjs'

export const sleeveBack = {
  name: 'taliya.sleeveBack',
  from: backBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    sleeveVents: { bool: false, menu: 'sleeves' },
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
    if (!options.raglanSleeves) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Bella
    const keepThese = ['cbNeck', 'daisyGuide']
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

    points.raglanCp = points.shoulderTop.shiftFractionTowards(points.shoulder, 2)

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

    points.shoulderSplit = paths.shoulder
      .reverse()
      .shiftAlong(points.shoulderTop.dist(points.shoulder))
    //paths
    paths.hemBase = new Path().move(points.mArmhole).line(points.mArmhole).hide()

    paths.cbNeck = paths.cbNeck.split(points.raglanNeckSplit)[0]

    paths.raglan = new Path()
      .move(points.raglanNeckSplit)
      .line(points.raglanCurveEnd)
      ._curve(points.armholeRaglanCp2, points.mArmhole)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.raglanBottom)
      .join(paths.shoulder)
      .join(paths.cbNeck)
      .join(paths.raglan)
      .close()

    //stores
    store.set('shoulderRaglanLength', paths.shoulder.length())

    if (complete) {
      //grainline
      points.grainlineFrom = paths.cbNeck.shiftFractionAlong(0.5)
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
        on: ['mArmhole', 'shoulderSplit'],
      })
      snippets.raglanCurveEnd = new Snippet('bnotch', points.raglanCurveEnd)
      //title
      points.title = points.raglanNeckSplit.shift(
        points.raglanBottom.angle(points.mArmhole) + 90,
        points.shoulderTop.dist(points.raglanBottom) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Sleeve Back',
        scale: 1 / 3,
        rotation: 360 - points.mArmhole.angle(points.raglanBottom),
      })
      if (sa) {
        const sleeveHemWidth = sa * options.sleeveHemWidth * 100
        let bandSa = sa
        if (sa > neckbandWidth / 2) {
          bandSa = neckbandWidth / 4
          paths.cbNeck
            .attr('class', 'fabric hidden')
            .attr('data-text', utils.units(bandSa) + ' S. All.')
            .attr('data-text-class', 'center')
            .unhide()
        }

        const drawSaShoulder = () =>
          options.sleeveVents
            ? paths.shoulder
                .split(points.shoulderSplit)[0]
                .offset(sleeveHemWidth)
                .join(paths.shoulder.split(points.shoulderSplit)[1].offset(sa))
            : paths.shoulder.offset(sa)

        points.saMArmhole = points.mArmhole
          .shift(points.raglanBottom.angle(points.mArmhole), sa)
          .shift(points.raglanBottom.angle(points.mArmhole) + 90, sleeveHemWidth)

        points.saRaglanBottom = drawSaShoulder()
          .start()
          .shift(points.raglanBottom.angle(points.mArmhole) + 90, sleeveHemWidth)

        points.saShoulderTop = drawSaShoulder()
          .end()
          .shift(points.shoulderTopCp2.angle(points.shoulderTop) + 90, bandSa)

        points.saRaglanNeckSplit = utils.beamsIntersect(
          paths.cbNeck.offset(bandSa).shiftFractionAlong(0.995),
          paths.cbNeck.offset(bandSa).end(),
          points.raglanNeckSplit
            .shiftTowards(points.raglanCurveEnd, sa)
            .rotate(-90, points.raglanNeckSplit),
          points.raglanCurveEnd
            .shiftTowards(points.raglanNeckSplit, sa)
            .rotate(90, points.raglanCurveEnd)
        )

        points.saMArmholeTop = points.mArmhole
          .shift(points.raglanBottom.angle(points.mArmhole), sa)
          .shift(points.raglanBottom.angle(points.mArmhole) - 90, sa)

        paths.sa = new Path()
          .move(points.saMArmhole)
          .line(points.saRaglanBottom)
          .join(drawSaShoulder())
          .line(points.saShoulderTop)
          .join(paths.cbNeck.offset(bandSa))
          .line(points.saRaglanNeckSplit)
          .join(paths.raglan.offset(sa))
          .line(points.saMArmholeTop)
          .line(points.saMArmhole)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
