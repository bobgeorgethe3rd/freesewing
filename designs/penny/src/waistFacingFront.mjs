import { front } from './front.mjs'
import { waistFacingBack } from './waistFacingBack.mjs'

export const waistFacingFront = {
  name: 'penny.waistFacingFront',
  from: front,
  after: waistFacingBack,
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
    macro('cutonfold', false)
    //measures
    const waistFacingWidth = store.get('waistFacingWidth')
    //let's begin
    paths.sideSeamInitial = new Path()
      .move(points.sideSeat)
      .curve(points.sideSeatCp2, points.sideCurveEndCp1, points.sideCurveEnd)
      .line(points.sideWaistFront)
      .hide()

    points.cfWaistFacing = points.cfWaist.shift(-90, waistFacingWidth)
    points.sideWaistFacingFront = paths.sideSeamInitial.reverse().shiftAlong(waistFacingWidth)

    const waistFacingFrontCpDist =
      (4 / 3) *
      points.waistFrontOrigin.dist(points.cfWaist) *
      Math.tan(
        utils.deg2rad((points.waistFrontOrigin.angle(points.sideWaistFacingFront) - 270) / 4)
      )

    points.cfWaistFacingCp1 = points.cfWaistFacing.shift(0, waistFacingFrontCpDist)

    points.sideWaistFacingFrontCp1 = points.sideWaistFacingFront.shift(
      points.sideWaistFront.angle(points.waistFrontOrigin) + 90,
      waistFacingFrontCpDist
    )

    //paths
    paths.hemBase = new Path()
      .move(points.cfWaistFacing)
      .curve(points.cfWaistFacingCp1, points.sideWaistFacingFrontCp1, points.sideWaistFacingFront)
      .hide()

    paths.sideSeam = paths.sideSeamInitial.split(points.sideWaistFacingFront)[1].hide()

    paths.seam = paths.hemBase
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
        points.grainlineTo = paths.hemBase.shiftFractionAlong(0.05)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //title
      points.title = paths.hemBase
        .shiftFractionAlong(0.2)
        .shift(90, points.cfWaist.dist(points.cfWaistFacing) * 0.5)
      macro('title', {
        at: points.title,
        nr: '7',
        title: 'Front',
        cutNr: titleCutNum,
        scale: 1 / 3,
      })

      if (sa) {
        const waistFacingSa = sa * options.waistFacingSaWidth * 100
        let sideSeamSa = sa * options.sideSeamSaWidth * 100
        if (options.closurePosition == 'side') sideSeamSa = sa * options.closureSaWidth * 100

        points.saSideWaistFacingFront = utils.beamsIntersect(
          paths.hemBase.offset(waistFacingSa).end(),
          paths.hemBase
            .offset(waistFacingSa)
            .end()
            .shift(points.sideWaistFacingFrontCp1.angle(points.sideWaistFacingFront), 1),
          paths.sideSeam.offset(sideSeamSa).shiftFractionAlong(0.005),
          paths.sideSeam.offset(sideSeamSa).start()
        )
        if (points.saSideWaistFacingFront.y < paths.sideSeam.offset(sideSeamSa).start().y) {
          points.saSideWaistFacingFront = paths.sideSeam.offset(sideSeamSa).start()
        }

        points.saCfWaistFacing = new Point(
          points.saCfWaist.x,
          points.cfWaistFacing.y + waistFacingSa
        )

        paths.sa = paths.hemBase
          .clone()
          .offset(waistFacingSa)
          .line(points.saSideWaistFacingFront)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saSideWaistFront)
          .join(paths.saWaist)
          .line(points.saCfWaist)
          .line(points.saCfWaistFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
