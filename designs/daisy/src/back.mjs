import { back as backBella } from '@freesewing/bella'
import { frontShared } from './frontShared.mjs'

export const back = {
  name: 'daisy.back',
  from: backBella,
  after: frontShared,
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
  }) => {
    //matching neck to front

    store.set('neckAngle', points.hps.angle(points.cbNeck))
    points.hps = points.shoulder.shiftTowards(points.hps, store.get('shoulderWidthDaisy'))
    points.cbNeck = utils.beamsIntersect(
      points.hps,
      points.hps.shift(store.get('neckAngle'), 1),
      points.cbNeck,
      points.cbWaist
    )
    // points.cbNeckCp1 = new Point(points.hps.x * 0.8, points.cbNeck.y)
    points.cbNeckCp1 = utils.beamsIntersect(
      points.hps,
      points.shoulder.rotate((180 - (store.get('shoulderFrontAngleDaisy') - 270)) * -1, points.hps),
      points.cbNeck,
      points.cbNeck.shift(0, 1)
    )
    //seam paths
    paths.seam = new Path()
      .move(points.cbNeck)
      .curve_(points.cbNeckCp2, points.waistCenter)
      .line(points.dartBottomLeft)
      .curve_(points.dartLeftCp, points.dartTip)
      ._curve(points.dartRightCp, points.dartBottomRight)
      .line(points.waistSide)
      .curve_(points.waistSideCp2, points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.hps)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .close()
      .attr('class', 'fabric')

    if (complete) {
      if (sa) {
        paths.sa = new Path()
          .move(points.cbNeck)
          .curve_(points.cbNeckCp2, points.waistCenter)
          .line(points.dartBottomLeft)
          .line(points.dartBottomRight)
          .line(points.waistSide)
          .curve_(points.waistSideCp2, points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
          .line(points.hps)
          ._curve(points.cbNeckCp1, points.cbNeck)
          .offset(sa)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
