import { crown } from './crown.mjs'

export const brim = {
  name: 'playtest.brim',
  after: crown,
  options: {
    //Style
    brimAngle: { deg: 225, min: 180, max: 360, menu: 'style' },
    brimWidth: { pct: 100, min: 50, max: 200, menu: 'style' },
    brimWidthOffset: { pct: (2 / 3) * 100, min: 0, max: 200, menu: 'style' },
  },
  draft: ({
    store,
    sa,
    Point,
    points,
    Path,
    paths,
    options,
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    utils,
    snippets,
    Snippet,
  }) => {
    //measures
    const brimAngle = options.brimAngle
    const radius = (store.get('headCircumference') * (360 / brimAngle)) / 2 / Math.PI
    const segmentNum = 4
    const innerCpDist = (4 / 3) * radius * Math.tan(utils.deg2rad(brimAngle / (segmentNum * 4)))
    const brimWidth = store.get('headRadius') * options.brimWidth
    const brimWidthOffset = brimWidth * (1 + options.brimWidthOffset) - brimWidth
    //let's begin
    points.origin = new Point(0, 0)

    for (let i = 0; i <= segmentNum; i++) {
      points['inner' + i] = points.origin.shift(
        (270 - brimAngle * 0.5 + brimAngle * (i / segmentNum)) * -1,
        radius
      )
      // points['outerMin' + i] = points.origin.shift((450  - brimAngle * 0.5) + (brimAngle * (i / segmentNum)), radius + brimWidth)
      // points['outerMax' + i] = points.origin.shift((450  - brimAngle * 0.5) + (brimAngle * (i / segmentNum)), radius + brimWidth + brimWidthOffset)

      if (i <= segmentNum / 2) {
        points['outer' + i] = points.origin.shift(
          450 - brimAngle * 0.5 + brimAngle * (i / segmentNum),
          radius + brimWidth + brimWidthOffset * (1 - (i * 2) / segmentNum)
        )
        // points['outer' + i] = points['outerMax' + i].shiftFractionTowards(points['outerMin' + i], (i * 2) / segmentNum)
      } else {
        points['outer' + i] = points.origin.shift(
          450 - brimAngle * 0.5 + brimAngle * (i / segmentNum),
          radius + brimWidth + ((brimWidthOffset * (i - segmentNum / 2)) / segmentNum) * 2
        )
        // points['outer' + i] = points['outerMin' + i].shiftFractionTowards(points['outerMax' + i], (i - segmentNum / 2) / segmentNum * 2)
      }

      if (i >= 0 && i < segmentNum) {
        points['inner' + i + 'Cp2'] = points['inner' + i]
          .shiftTowards(points.origin, innerCpDist)
          .rotate(90, points['inner' + i])
      }
      if (i > 0 && i <= segmentNum) {
        points['inner' + i + 'Cp1'] = points['inner' + i]
          .shiftTowards(points.origin, innerCpDist)
          .rotate(-90, points['inner' + i])
      }
    }

    let k
    for (let i = 0; i <= segmentNum; i++) {
      k = segmentNum - i
      if (i >= 0 && i < segmentNum) {
        points['outer' + i + 'Cp2'] = utils.beamsIntersect(
          points.origin,
          points['inner' + k + 'Cp1'],
          points['outer' + i],
          points.origin.rotate(-90, points['outer' + i])
        )
      }
      if (i > 0 && i <= segmentNum) {
        points['outer' + i + 'Cp1'] = utils.beamsIntersect(
          points.origin,
          points['inner' + k + 'Cp2'],
          points['outer' + i],
          points.origin.rotate(90, points['outer' + i])
        )
      }
    }

    let j
    for (let i = 0; i < segmentNum; i++) {
      j = i + 1

      paths['outer' + i] = new Path()
        .move(points['outer' + i])
        .curve(points['outer' + i + 'Cp2'], points['outer' + j + 'Cp1'], points['outer' + j])
      // .hide()

      paths['inner' + i] = new Path()
        .move(points['inner' + i])
        .curve(points['inner' + i + 'Cp2'], points['inner' + j + 'Cp1'], points['inner' + j])
        .hide()
      if (i > 0) {
        paths['inner' + i] = paths['inner' + (i - 1)].join(paths['inner' + i]).hide()
      }
    }

    //paths
    paths.hemBase = paths['inner' + (segmentNum - 1)]

    paths.seam = paths.hemBase.clone().unhide()

    return part
  },
}
