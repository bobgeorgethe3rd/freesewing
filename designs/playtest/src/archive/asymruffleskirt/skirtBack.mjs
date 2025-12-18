import { skirtBackBase } from './skirtBackBase.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { pctBasedOn } from '@freesewing/core'

export const skirtBack = {
  name: 'playtest.skirtBack',
  from: skirtBackBase,
  hide: {
    from: true,
    inherited: true,
  },
  plugins: [pluginLogoRG, pluginMirror],
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
  }) => {
    //paths
    macro('mirror', {
      mirror: [points.cbWaist, points.cbKnee],
      paths: ['waist', 'sideSeam', 'dartEdges'],
      prefix: 'm',
    })

    paths.saBottom = new Path()
      .move(points.sideUpperLeg)
      .curve(points.cbUpperLeg, points.cbBottomRight, points.sideBottomRightF)
      .hide()

    paths.mSideSeam = new Path()
      .move(points.sideBottomRightF)
      .line(points.sideSeatF)
      .join(paths.mSideSeam.reverse().split(points.sideSeatF)[1])
      .hide()

    paths.mWaist = paths.mWaist.reverse().hide()

    paths.sideSeam = paths.sideSeam.split(points.sideUpperLeg)[0].hide()

    paths.seam = paths.saBottom
      .clone()
      .join(paths.mSideSeam)
      .join(paths.mWaist)
      .join(paths.waist)
      .join(paths.sideSeam)
      .close()

    if (complete) {
      points.cbBottomMid = utils.lineIntersectsCurve(
        points.cbWaist,
        points.cbBottomRight,
        points.sideUpperLeg,
        points.cbUpperLeg,
        points.cbBottomRight,
        points.sideBottomRightF
      )
    }

    return part
  },
}
