import { front } from './front.mjs'

export const waistFacingFront = {
  name: 'antiope.waistFacingFront',
  from: front,
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
    //measures
    const waistFacingWidth = store.get('waistFacingWidth')
    //let's begin
    points.sideWaistFacing = paths.sideSeam.reverse().shiftAlong(waistFacingWidth)

    points.waistFacingOrigin = utils.beamIntersectsX(
      points.sideWaistFacing,
      paths.sideSeam.reverse().shiftAlong(waistFacingWidth * 0.995),
      points.cfWaist.x
    )

    points.cfWaistFacing = points.waistFacingOrigin.shift(
      -90,
      points.waistFacingOrigin.dist(points.sideWaistFacing)
    )

    points.waistFacingCurveStart = points.cfWaistFacing.shift(0, paths.waist.length() * 0.25)

    points.waistFacingCurveEnd = points.sideWaistFacing.shift(
      points.sideWaistFacing.angle(paths.sideSeam.reverse().shiftAlong(waistFacingWidth * 0.995)) +
        90,
      paths.waist.length() * 0.25
    )

    points.waistFacingCurveOrigin = utils.beamIntersectsX(
      points.waistFacingCurveEnd,
      points.sideWaistFacing.rotate(90, points.waistFacingCurveEnd),
      points.waistFacingCurveStart.x
    )

    const waistFacingCpDist =
      (4 / 3) *
      points.waistFacingCurveOrigin.dist(points.waistFacingCurveEnd) *
      Math.tan(
        utils.deg2rad((points.waistFacingCurveOrigin.angle(points.waistFacingCurveEnd) - 270) / 4)
      )

    points.waistFacingCurveStartCp2 = points.waistFacingCurveStart.shift(0, waistFacingCpDist)
    points.waistFacingCurveEndCp1 = points.waistFacingCurveEnd.shift(
      points.sideWaistFacing.angle(points.waistFacingCurveEnd),
      waistFacingCpDist
    )

    //paths
    paths.waistFacing = new Path()
      .move(points.cfWaistFacing)
      .line(points.waistFacingCurveStart)
      .curve(
        points.waistFacingCurveStartCp2,
        points.waistFacingCurveEndCp1,
        points.waistFacingCurveEnd
      )
      .line(points.sideWaistFacing)
      .hide()

    paths.sideSeam = paths.sideSeam.split(points.sideWaistFacing)[1].hide()

    paths.seam = paths.waistFacing
      .clone()
      .join(paths.sideSeam)
      .join(paths.waist)
      .line(points.cfWaistFacing)
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfWaist
        points.cutOnFoldTo = points.cfWaistFacing
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = paths.waistFacing.shiftFractionAlong(0.05)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfWaist.y)
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
        nr: '9',
        title: 'Waist Facing Front',
        cutNr: titleCutNum,
        scale: 1 / 3,
      })
      if (sa) {
        const waistFacingSa = sa * options.waistFacingSaWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saSideWaistFacing = points.sideWaistFacing
          .shift(points.waistFacingCurveEnd.angle(points.sideWaistFacing), sideSeamSa)
          .shift(points.waistFacingCurveEnd.angle(points.sideWaistFacing) - 90, waistFacingSa)

        points.saCfWaistFacing = new Point(
          points.saCfWaist.x,
          points.cfWaistFacing.y + waistFacingSa
        )

        paths.sa = paths.waistFacing
          .clone()
          .offset(waistFacingSa)
          .line(points.saSideWaistFacing)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistFront)
          .join(paths.waist.offset(sa))
          .line(points.saCfWaist)
          .line(points.saCfWaistFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
