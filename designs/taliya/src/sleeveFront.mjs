import { pluginMirror } from '@freesewing/plugin-mirror'
import { frontBase } from './frontBase.mjs'

export const sleeveFront = {
  name: 'taliya.sleeveFront',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
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
    //removing paths and snippets not required from Bella
    const keepThese = ['cfNeck', 'daisyGuide']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    macro('mirror', {
      mirror: [points.raglanCurveEnd, points.raglanNeckSplit],
      points: ['armhole'],
      prefix: 'm',
    })

    points.raglanBottom = utils.beamsIntersect(
      points.mArmhole,
      points.armholeRaglanCp2,
      points.shoulder,
      points.shoulder.shift(points.armholeRaglanCp2.angle(points.mArmhole) + 90, 1)
    )

    //paths
    paths.hemBase = new Path().move(points.mArmhole).line(points.mArmhole).hide()

    paths.shoulder = new Path()
      .move(points.raglanBottom)
      .curve(points.shoulder, points.shoulder, points.shoulderTop)
      .hide()

    paths.raglan = new Path()
      .move(points.raglanNeckSplit)
      .line(points.raglanCurveEnd)
      ._curve(points.armholeRaglanCp2, points.mArmhole)
      .hide()

    paths.seam = new Path()
      .move(points.mArmhole)
      .line(points.raglanBottom)
      .join(paths.shoulder)
      .join(paths.cfNeck.split(points.raglanNeckSplit)[0])
      .join(paths.raglan)

    return part
  },
}
