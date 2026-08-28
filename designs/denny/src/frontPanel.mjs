import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { frontBase } from './frontBase.mjs'

export const frontPanel = {
  name: 'denny.frontPanel',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
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
    snippets,
    Snippet,
    log,
    utils,
  }) => {
    //removing paths and snippets not required from Byron
    const keepPaths = ['byronGuide']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    paths.hemBase = new Path()
      .move(points.frontHemLeft)
      .curve_(points.frontHemLeftCp2, points.frontHemRight)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.frontTopRight)
      .line(points.frontTopLeft)
      .line(points.frontHemLeft)
      .close()
      .unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = points.frontTopLeft.shiftFractionTowards(points.frontTopRight, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.frontHemLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.frontTopLeft.shiftFractionTowards(points.frontTopRight, 0.4).x,
        (points.frontTopRight.y + points.frontHemRight.y) * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Front Panel',
        cutNr: 2,
        scale: 1 / 3,
      })
    }

    return part
  },
}
