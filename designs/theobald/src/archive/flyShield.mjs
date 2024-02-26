import { fly } from './fly.mjs'

export const flyShield = {
  name: 'theobald.flyShield',
  from: fly,
  options: {
    flyShieldCurve: { bool: true, menu: 'plackets' },
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
  }) => {
    //removing paths and snippets not required from from
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Dalton
    macro('title', false)
    //measures
    const suffix = store.get('frontPleatSuffix')
    const flyShieldDepthExt = store.get('flyShieldDepthExt')
    //begin
    points['flyShieldOut' + suffix] = points['flyOut' + suffix].shiftTowards(
      points['styleWaistOut' + suffix],
      flyShieldDepthExt
    )
    points['flyShieldCurveCp1' + suffix] = utils.beamsIntersect(
      points['flyShieldOut' + suffix],
      points['styleWaistIn' + suffix].rotate(-90, points['flyShieldOut' + suffix]),
      points['flyShieldCurveEnd' + suffix],
      points['styleWaistIn' + suffix].rotate(90, points['flyShieldCurveEnd' + suffix])
    )
    points['flyShieldCurveStart' + suffix] = points['flyShieldCurveCp1' + suffix].shiftTowards(
      points['flyShieldOut' + suffix],
      points['flyShieldCurveCp1' + suffix].dist(points['flyShieldCurveEnd' + suffix])
    )

    points['flyShieldBottomLeft' + suffix] = utils.beamsIntersect(
      points['flyShieldOut' + suffix],
      points['styleWaistIn' + suffix].rotate(-90, points['flyShieldOut' + suffix]),
      points['flyShieldCrotch' + suffix],
      points['flyShieldCurveEnd' + suffix]
    )

    //paths
    const drawSaBase = () => {
      if (options.flyShieldCurve)
        return new Path()
          .move(points['flyShieldCurveStart' + suffix])
          .curve_(points['flyShieldCurveCp1' + suffix], points['flyShieldCurveEnd' + suffix])
          .line(points['flyShieldCrotch' + suffix])
      else
        return new Path()
          .move(points['flyShieldBottomLeft' + suffix])
          .line(points['flyShieldCrotch' + suffix])
    }

    paths['crotchSeam' + suffix] = new Path()
      .move(points['fork' + suffix])
      .curve(
        points['crotchSeamCurveCp1' + suffix],
        points['crotchSeamCurveCp2' + suffix],
        points['crotchSeamCurveStart' + suffix]
      )
      .line(points['styleWaistIn' + suffix])
      .split(points['flyShieldCrotch' + suffix])[1]
      .hide()

    paths.waist = new Path()
      .move(points['styleWaistIn' + suffix])
      .line(points['flyShieldOut' + suffix])
      .hide()

    paths.seam = drawSaBase()
      .join(paths['crotchSeam' + suffix])
      .join(paths.waist)
      .line(drawSaBase().start())
      .close()

    //stores
    store.set(
      'waistbandPlacketWidth',
      points['styleWaistIn' + suffix].dist(points['flyShieldOut' + suffix])
    )

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points['flyShieldOut' + suffix]
      points.cutOnFoldTo = points['flyShieldCurveStart' + suffix]
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //title
      points.title = points['flyShieldCurveStart' + suffix].shiftFractionTowards(
        points['flyShieldCurveEnd' + suffix],
        1 / 3
      )
      macro('title', {
        nr: 9,
        title: 'Fly Shield',
        at: points.title,
        scale: 1 / 3,
        rotation: 180 - points['flyOut' + suffix].angle(points['styleWaistOut' + suffix]),
      })

      if (sa) {
        paths.sa = drawSaBase()
          .offset(sa)
          .join(paths['crotchSeam' + suffix].offset(sa * options.crotchSeamSaWidth * 100))
          .join(paths.waist.offset(sa))
          .line(points['flyShieldOut' + suffix])
          .line(drawSaBase().start())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
