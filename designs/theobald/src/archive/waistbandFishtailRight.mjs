import { backBase } from './backBase.mjs'

export const waistbandFishtailRight = {
  name: 'theobald.waistbandFishtailRight',
  from: backBase,
  hide: {
    from: true,
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
    log,
    absoluteOptions,
  }) => {
    //set Render
    if (!options.waistbandFishtail) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from backBase
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //let's begin
    //paths
    paths.seam = new Path()
      .move(points.waistbandFOut)
      .curve_(points.waistbandFCp, points.waistbandFTop)
      .split(points.waistbandFSplit)[0]
      .line(points.dartOut)
      .line(points.styleWaistOut)
      .line(points.waistbandFOut)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistbandFOut.shiftFractionTowards(points.waistbandFCp, 0.5)
      points.grainlineTo = utils.beamsIntersect(
        points.grainlineFrom,
        points.grainlineFrom.shift(points.waistbandFSplit.angle(points.dartMid), 1),
        points.styleWaistIn,
        points.styleWaistOut
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      let titlePrefix
      if (options.waistbandFishtailEmbedded) {
        titlePrefix = 'Facing '
      } else {
        titlePrefix = 'Waistband '
      }

      points.title = points.dartOut
        .shiftFractionTowards(points.styleWaistOut, 0.55)
        .shift(
          points.dartMid.angle(points.waistbandFSplit),
          points.dartMid.dist(points.waistbandFSplit) / 3
        )
      macro('title', {
        nr: 13,
        title: titlePrefix + 'Fishtail Right',
        at: points.title,
        scale: 1 / 3,
        rotation: 90 - points.dartMid.angle(points.waistbandFSplit),
      })

      if (sa) {
        paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa')
      }
    }

    return part
  },
}
