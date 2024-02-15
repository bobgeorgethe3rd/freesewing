import { fly } from './fly.mjs'

export const flyShield = {
  name: 'jackson.flyShield',
  from: fly,
  options: {
    flyShieldCurve: { bool: false, menu: 'plackets' },
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
    const flyShieldDepthExt = store.get('flyShieldDepthExt')
    //begin
    points.flyShieldOut = points.flyOut.shiftTowards(points.styleWaistOut, flyShieldDepthExt)
    points.flyShieldCurveCp1 = utils.beamsIntersect(
      points.flyShieldOut,
      points.styleWaistIn.rotate(-90, points.flyShieldOut),
      points.flyShieldCurveEnd,
      points.styleWaistIn.rotate(90, points.flyShieldCurveEnd)
    )
    points.flyShieldCurveStart = points.flyShieldCurveCp1.shiftTowards(
      points.flyShieldOut,
      points.flyShieldCurveCp1.dist(points.flyShieldCurveEnd)
    )

    points.flyShieldBottomLeft = utils.beamsIntersect(
      points.flyShieldOut,
      points.styleWaistIn.rotate(-90, points.flyShieldOut),
      points.flyShieldCrotch,
      points.flyShieldCurveEnd
    )

    //paths
    const drawSaBase = () => {
      if (options.flyShieldCurve)
        return new Path()
          .move(points.flyShieldCurveStart)
          .curve_(points.flyShieldCurveCp1, points.flyShieldCurveEnd)
          .line(points.flyShieldCrotch)
      else return new Path().move(points.flyShieldBottomLeft).line(points.flyShieldCrotch)
    }

    paths.crotchSeam = new Path()
      .move(points.fork)
      .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
      .line(points.styleWaistIn)
      .split(points.flyShieldCrotch)[1]
      .hide()

    paths.waist = new Path().move(points.styleWaistIn).line(points.flyShieldOut).hide()

    paths.seam = drawSaBase()
      .join(paths.crotchSeam)
      .join(paths.waist)
      .line(drawSaBase().start())
      .close()

    //stores
    store.set('waistbandPlacketWidth', points.styleWaistIn.dist(points.flyShieldOut))

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.flyShieldOut
      points.cutOnFoldTo = points.flyShieldCurveStart
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //title
      points.title = points.flyShieldCurveStart.shiftFractionTowards(
        points.flyShieldCurveEnd,
        1 / 3
      )
      macro('title', {
        nr: 10,
        title: 'Fly Shield',
        at: points.title,
        scale: 1 / 3,
        rotation: 180 - points.flyOut.angle(points.styleWaistOut),
      })

      if (sa) {
        paths.sa = drawSaBase()
          .offset(sa)
          .join(paths.crotchSeam.offset(sa * options.crotchSeamSaWidth * 100))
          .join(paths.waist.offset(sa))
          .line(points.flyShieldOut)
          .line(drawSaBase().start())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
