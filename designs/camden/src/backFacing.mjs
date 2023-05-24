import { back } from './back.mjs'
import { frontFacing } from './frontFacing.mjs'

export const backFacing = {
  name: 'camden.backFacing',
  from: back,
  after: frontFacing,
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
    log,
  }) => {
    if (!options.facings) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Daisy
    const keepThese = 'saBase'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]

    if (!options.includeStraps) {
      delete points.strapLength
      delete points.strapWidth
    }
    //removing macros not required from Daisy
    macro('title', false)
    //measures
    const facingWidth = store.get('facingWidth')
    //let's begin

    points.sideFacing = new Path()
      .move(points.armholeDrop)
      .curve(points.sideWaistCp1, points.sideHemCp2, points.sideHem)
      .shiftAlong(facingWidth)

    points.cbFacing = points.cbNeckNew.shiftTowards(points.cbHem, facingWidth)
    points.cbFacingCp2 = new Point(points.strapRight.x, points.cbFacing.y)
    points.sideFacingCp1 = utils.beamsIntersect(
      points.sideFacing,
      points.sideFacing.shift(points.armholeDrop.angle(points.armholeCp2New), 1),
      points.strapRight,
      points.strapRight.shift(-90, 1)
    )
    //paths
    paths.saBase = new Path()
      .move(points.cbFacing)
      .curve(points.cbFacingCp2, points.sideFacingCp1, points.sideFacing)
      .join(paths.saBase.split(points.sideFacing)[1])
      .hide()

    paths.seam = paths.saBase.clone().line(points.cbFacing).close().unhide()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cbNeckNew
      points.cutOnFoldTo = points.cbFacing
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
      })
      //title
      points.title = new Point(points.dartTip.x, points.armholePitchCp1New.y) //points.strapMid.y + ((points.armholePitchCp1New.y - points.strapMid.y) * 0.75))
      macro('title', {
        at: points.title,
        nr: 5,
        title: 'Back Facing',
        scale: 0.75,
      })

      if (sa) {
        paths.sa = paths.saBase
          .offset(sa)
          .line(points.cbNeckNew)
          .line(points.cbFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
