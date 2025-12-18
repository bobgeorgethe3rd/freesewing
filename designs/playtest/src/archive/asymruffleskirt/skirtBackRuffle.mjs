import { skirtBackBase } from './skirtBackBase.mjs'

export const skirtBackRuffle = {
  name: 'playtest.skirtBackRuffle',
  from: skirtBackBase,
  options: {
    ruffleFullness: { pct: 100, min: 0, max: 150, menu: 'style' },
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
  }) => {
    //remove paths & snippets
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //measures
    const flounceLength =
      (store.get('toKnee') - measurements.waistToUpperLeg) * options.flounceLength
    //let's begin
    points.cbBottomLeft = points.cbUpperLeg.shift(-90, flounceLength)
    points.cbFlounce = points.cbBottomRight.shift(-90, flounceLength)
    points.sideBottomLeft = new Point(points.sideSeat.x, points.cbBottomLeft.y)
    points.sideFlounce = new Point(points.sideSeatF.x, points.cbFlounce.y)

    paths.saTopInitial = new Path()
      .move(points.sideBottomRightF)
      .curve(points.cbBottomRight, points.cbUpperLeg, points.sideUpperLeg)
      .hide()

    if (options.sarahGuides) {
      paths.sarahGuide = new Path()
        .move(points.sideBottomLeft)
        .curve(points.cbBottomLeft, points.cbFlounce, points.sideFlounce)
        .line(points.sideBottomRightF)
        .join(paths.saTopInitial)
        .line(points.sideBottomLeft)
        .close()
        .attr('class', 'various lashed')
    }

    const segmentNum = 18

    for (let i = 0; i < segmentNum; i++) {
      points['rufflePivot' + i] = paths.saTopInitial.shiftFractionAlong((i + 1) / (segmentNum + 1))
      points['ruffleBottom' + i] = utils.lineIntersectsCurve(
        points['rufflePivot' + i],
        new Point(points['rufflePivot' + i].x, points.sideFlounce.y),
        points.sideBottomLeft,
        points.cbBottomLeft,
        points.cbFlounce,
        points.sideFlounce
      )
    }

    const rotAngle = (180 / segmentNum) * options.ruffleFullness

    let j
    for (let i = 0; i <= segmentNum - 1; i++) {
      j = i * -1 + (segmentNum - 1)

      points.sideBottomRightF = points.sideBottomRightF.rotate(rotAngle, points['rufflePivot' + j])
      points.sideFlounce = points.sideFlounce.rotate(rotAngle, points['rufflePivot' + j])

      for (let k = 0; k <= j; k++) {
        points['rufflePivot' + k] = points['rufflePivot' + k].rotate(
          rotAngle,
          points['rufflePivot' + j]
        )
        points['ruffleBottom' + k] = points['ruffleBottom' + k].rotate(
          rotAngle,
          points['rufflePivot' + j]
        )
        points['ruffleBottom' + k + 'R'] = points['ruffleBottom' + k].rotate(
          -rotAngle,
          points['rufflePivot' + j]
        )
      }
    }
    for (let i = 0; i <= segmentNum - 1; i++) {
      // paths['rufflePath' + i] = new Path()
      // .move(points['ruffleBottom' + i + 'R'])
      // .line(points['rufflePivot' + i])
      // .line(points['ruffleBottom' + i])

      if (i > 0) {
        paths['segmentTop' + i] = new Path()
          .move(points['rufflePivot' + (i - 1)])
          .line(points['rufflePivot' + i])

        paths['segmentBottom' + i] = new Path()
          .move(points['ruffleBottom' + (i - 1) + 'R'])
          .line(points['ruffleBottom' + i + 'R'])
      }
    }
    paths.sideSeam = new Path()
      .move(points.sideFlounce)
      .line(points.sideBottomRightF)
      .move(points.sideUpperLeg)
      .line(points.sideBottomLeft)

    // let tweak = 1
    // let target = paths.saTopInitial.length() / (segmentNum + 1)
    // let delta
    // do {
    // points.sideBottomRightFCp2 = points.sideBottomRightF.shift(points.sideBottomRightF.angle(points.sideFlounce) - 90, target * tweak)

    // paths.saTop = new Path()
    // .move(points.sideBottomRightF)
    // .curve_(points.sideBottomRightFCp2, points.rufflePivot0)

    // delta = paths.saTop.length() - target
    // if (delta > 0) tweak = tweak * 0.99
    // else tweak = tweak * 1.01
    // } while (Math.abs(delta) > 0.01)

    return part
  },
}
