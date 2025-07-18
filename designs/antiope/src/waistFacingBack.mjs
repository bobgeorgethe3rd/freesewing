import { back } from './back.mjs'

export const waistFacingBack = {
  name: 'anitope.waistFacingBack',
  from: back,
  options: {
    //Construction
    waistFacingWidth: { pct: 25, min: 10, max: 50, menu: 'construction' },
    waistFacingSaWidth: { pct: 1.5, min: 0, max: 3, menu: 'construction' },
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
    log,
    absoluteOptions,
  }) => {
    //set render
    if (options.waistbandStyle != 'none') {
      part.hide()
      return part
    }
    //removing paths from base
    const keepPaths = ['sarahGuide', 'waist', 'sideSeam']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    macro('logorg', false)
    macro('scalebox', false)
    macro('cutonfold', false)
    //measures
    const waistFacingWidth = paths.sideSeam.length() * options.waistFacingWidth
    //let's begin
    points.sideWaistFacing = paths.sideSeam.shiftAlong(waistFacingWidth)

    points.waistFacingOrigin = utils.beamIntersectsX(
      points.sideWaistFacing,
      paths.sideSeam.shiftAlong(waistFacingWidth * 0.995),
      points.cbWaist.x
    )

    points.cbWaistFacing = points.waistFacingOrigin.shift(
      -90,
      points.waistFacingOrigin.dist(points.sideWaistFacing)
    )

    points.waistFacingCurveStart = points.sideWaistFacing.shift(
      points.sideWaistFacing.angle(paths.sideSeam.shiftAlong(waistFacingWidth * 0.995)) - 90,
      paths.waist.length() * 0.25
    )

    points.waistFacingCurveEnd = points.cbWaistFacing.shift(180, paths.waist.length() * 0.25)

    points.waistFacingCurveOrigin = utils.beamIntersectsX(
      points.waistFacingCurveStart,
      points.sideWaistFacing.rotate(-90, points.waistFacingCurveStart),
      points.waistFacingCurveEnd.x
    )

    const waistFacingCpDist =
      (4 / 3) *
      points.waistFacingCurveOrigin.dist(points.waistFacingCurveStart) *
      Math.tan(
        utils.deg2rad((270 - points.waistFacingCurveOrigin.angle(points.waistFacingCurveStart)) / 4)
      )

    points.waistFacingCurveStartCp2 = points.waistFacingCurveStart.shift(
      points.sideWaistFacing.angle(points.waistFacingCurveStart),
      waistFacingCpDist
    )
    points.waistFacingCurveEndCp1 = points.waistFacingCurveEnd.shift(180, waistFacingCpDist)

    //paths
    paths.waistFacing = new Path()
      .move(points.sideWaistFacing)
      .line(points.waistFacingCurveStart)
      .curve(
        points.waistFacingCurveStartCp2,
        points.waistFacingCurveEndCp1,
        points.waistFacingCurveEnd
      )
      .line(points.cbWaistFacing)
      .hide()

    paths.sideSeam = paths.sideSeam.split(points.sideWaistFacing)[0].hide()

    paths.seam = paths.waistFacing
      .clone()
      .line(points.cbWaist)
      .join(paths.waist)
      .join(paths.sideSeam)
      .close()

    //stores
    store.set('waistFacingWidth', waistFacingWidth)

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbWaistFacing
        points.cutOnFoldTo = points.cbWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = paths.waistFacing.shiftFractionAlong(0.95)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //title
      points.title = paths.waist
        .shiftFractionAlong(0.5)
        .shiftFractionTowards(paths.waistFacing.shiftFractionAlong(0.5), 0.5)
      macro('title', {
        at: points.title,
        nr: '8',
        title: 'Waist Facing Back',
        cutNr: titleCutNum,
        scale: 1 / 3,
      })

      if (sa) {
        const waistFacingSa = sa * options.waistFacingSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saCbWaistFacing = new Point(
          points.saCbWaist.x,
          points.cbWaistFacing.y + waistFacingSa
        )

        points.saSideWaistFacing = points.sideWaistFacing
          .shift(points.waistFacingCurveStart.angle(points.sideWaistFacing), sideSeamSa)
          .shift(points.waistFacingCurveStart.angle(points.sideWaistFacing) + 90, waistFacingSa)

        paths.sa = paths.waistFacing
          .clone()
          .offset(waistFacingSa)
          .line(points.saCbWaistFacing)
          .line(points.saCbWaist)
          .join(paths.waist.offset(sa))
          .line(points.saSideWaistBack)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
