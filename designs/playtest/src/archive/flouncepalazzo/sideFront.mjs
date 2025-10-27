import { front } from './front.mjs'

export const sideFront = {
  name: 'playtest.sideFront',
  from: front,
  draft: ({
    options,
    Point,
    Path,
    points,
    paths,
    Snippet,
    snippets,
    utils,
    complete,
    store,
    sa,
    paperless,
    macro,
    part,
  }) => {
    //removing paths and snippets not required from Dalton
    const keepPaths = ['daltonGuide', 'outSeam']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //paths
    paths.seam = new Path()
      .move(points.floorOut)
      .line(points.floorSplit)
      .line(points.waistSplit)
      .line(points.waistOut)
      .join(paths.outSeam)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.waistOut.shiftFractionTowards(points.waistSplit, 0.2)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.floor.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.waistOut.shiftFractionTowards(points.waistSplit, 0.4).x,
        points.title.y
      )
      macro('title', {
        nr: 3,
        title: 'Side Front',
        at: points.title,
        cutNr: 1,
        scale: 0.5,
      })
      if (sa) {
        const flounceSa = sa * options.flounceSaWidth * 100
        points.saFloorSplit = utils.beamIntersectsY(
          points.floorSplit
            .shiftTowards(points.waistSplit, flounceSa)
            .rotate(-90, points.floorSplit),
          points.waistSplit
            .shiftTowards(points.floorSplit, flounceSa)
            .rotate(90, points.waistSplit),
          points.saFloorOut.y
        )

        points.saWaistSplit = utils.beamsIntersect(
          points.saFloorSplit,
          points.saFloorSplit.shift(points.floorSplit.angle(points.waistSplit), 1),
          points.saWaistOut,
          points.saWaistOut.shift(points.waistOut.angle(points.waistSplit), 1)
        )

        paths.sa = new Path()
          .move(points.saFloorOut)
          .line(points.saFloorSplit)
          .line(points.saWaistSplit)
          .line(points.saWaistOut)
          .join(paths.outSeam.offset(sa * options.sideSeamSaWidth * 100))
          .line(points.saFloorOut)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
