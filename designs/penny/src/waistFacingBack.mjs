import { back } from './back.mjs'

export const waistFacingBack = {
  name: 'penny.waistFacingBack',
  from: back,
  options: {
    //Construction
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
    const keepPaths = ['sarahGuide', 'waist', 'saWaist']
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
    const dartLength =
      options.skirtFrontDartLength > options.skirtBackDartLength
        ? store.get('skirtFrontDartLength')
        : store.get('skirtBackDartLength')
    //let's begin
    paths.sideSeamInitial = new Path()
      .move(points.sideWaistBack)
      .line(points.sideCurveStart)
      .curve(points.sideCurveStartCp2, points.sideSeatCp1, points.sideSeat)
      .hide()

    const waistFacingWidth = dartLength + (paths.sideSeamInitial.length() - dartLength) * 0.5

    points.sideWaistFacingBack = paths.sideSeamInitial.shiftAlong(waistFacingWidth)
    points.cbWaistFacing = points.cbWaist.shift(-90, waistFacingWidth)

    const waistFacingBackCpDist =
      (4 / 3) *
      points.waistBackOrigin.dist(points.cbWaist) *
      Math.tan(utils.deg2rad((270 - points.waistBackOrigin.angle(points.sideWaistFacingBack)) / 4))

    points.sideWaistFacingBackCp2 = points.sideWaistFacingBack.shift(
      points.sideWaistBack.angle(points.waistBackOrigin) - 90,
      waistFacingBackCpDist
    )

    points.cbWaistFacingCp1 = points.cbWaistFacing.shift(180, waistFacingBackCpDist)

    //paths
    paths.hemBase = new Path()
      .move(points.sideWaistFacingBack)
      .curve(points.sideWaistFacingBackCp2, points.cbWaistFacingCp1, points.cbWaistFacing)
      .hide()

    paths.sideSeam = paths.sideSeamInitial.split(points.sideWaistFacingBack)[0]

    paths.seam = paths.hemBase
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
        points.grainlineTo = paths.hemBase.shiftFractionAlong(0.95)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //title
      points.title = paths.hemBase
        .shiftFractionAlong(0.8)
        .shift(90, points.cbWaist.dist(points.cbWaistFacing) * 0.5)
      macro('title', {
        at: points.title,
        nr: '6',
        title: 'Waist Facing (Back)',
        cutNr: titleCutNum,
        scale: 1 / 3,
      })
      if (sa) {
        const waistFacingSa = sa * options.waistFacingSaWidth * 100
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'side') sideSeamSa = sa * options.closureSaWidth * 100

        points.saCbWaistFacing = new Point(
          points.saCbWaist.x,
          points.cbWaistFacing.y + waistFacingSa
        )

        points.saSideWaistFacingBack = utils.beamsIntersect(
          paths.hemBase.offset(waistFacingSa).start(),
          paths.hemBase
            .offset(waistFacingSa)
            .start()
            .shift(points.sideWaistFacingBackCp2.angle(points.sideWaistFacingBack), 1),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.995),
          paths.sideSeam.offset(sideSeamSa).end()
        )
        if (points.saSideWaistFacingBack.y < paths.sideSeam.offset(sideSeamSa).end().y) {
          points.saSideWaistFacingBack = paths.sideSeam.offset(sideSeamSa).end()
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(waistFacingSa)
          .line(points.saCbWaistFacing)
          .line(points.saCbWaist)
          .join(paths.saWaist)
          .line(points.saSideWaistBack)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistFacingBack)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
