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
    const keepThese = ['seam', 'waistbandFCurve']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daltonGuides) {
      paths.daltonGuide = paths.seam.attr('class', 'various dashed')
    }
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('scalebox', false)
    //let's begin
    //paths
    paths.seam = paths.waistbandFCurve
      .split(points.waistbandFDart)[0]
      .line(points.dartOut)
      .line(points.waistOut)
      .line(points.waistbandFOut)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.dartOut.shiftFractionTowards(points.waistOut, 0.25)
      points.grainlineFrom = utils.beamsIntersect(
        points.waistbandFOut,
        points.waistbandFOut.shift(points.waistOut.angle(points.dartOut), 1),
        points.grainlineTo,
        points.grainlineTo.shift(points.dartOut.angle(points.waistOut) + 90, 1)
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      let titleCutNum = 2
      if (options.waistbandFishtailEmbedded) titleCutNum = 1
      points.title = points.waistbandFDart
        .shiftFractionTowards(points.waistbandFOut, 0.5)
        .shift(
          points.waistbandFOut.angle(points.waistOut),
          points.waistbandFOut.dist(points.waistOut) * 0.75
        )
      macro('title', {
        nr: 14,
        title: 'Waistband Fishtail Right',
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.25,
        rotation: 180 - points.waistOut.angle(points.dartOut),
      })
      if (sa) {
        paths.saWaistbandFCurve = paths.waistbandFCurve
          .split(points.waistbandFDart)[0]
          .offset(sa)
          .hide()

        points.saWaistbandFDart = utils.beamsIntersect(
          paths.saWaistbandFCurve.end(),
          paths.saWaistbandFCurve.shiftFractionAlong(0.995),
          points.waistbandFDart.shiftTowards(points.dartOut, sa).rotate(-90, points.waistbandFDart),
          points.dartOut.shiftTowards(points.waistbandFDart, sa).rotate(90, points.dartOut)
        )
        points.saDartOut = utils.beamsIntersect(
          points.waistbandFDart.shiftTowards(points.dartOut, sa).rotate(-90, points.waistbandFDart),
          points.dartOut.shiftTowards(points.waistbandFDart, sa).rotate(90, points.dartOut),
          points.dartOut.shiftTowards(points.waistOut, sa).rotate(-90, points.dartOut),
          points.waistOut.shiftTowards(points.dartOut, sa).rotate(90, points.waistOut)
        )
        points.saWaistOut = utils.beamsIntersect(
          points.saDartOut,
          points.saDartOut.shift(points.dartOut.angle(points.waistOut), 1),
          points.waistOut.shiftTowards(points.waistbandFOut, sa).rotate(-90, points.waistOut),
          points.waistbandFOut.shiftTowards(points.waistOut, sa).rotate(90, points.waistbandFOut)
        )
        points.saWaistbandFOut = utils.beamsIntersect(
          points.saWaistOut,
          points.saWaistOut.shift(points.waistOut.angle(points.waistbandFOut), 1),
          points.waistbandFOut
            .shiftTowards(points.waistbandFOutCp2, sa)
            .rotate(-90, points.waistbandFOut),
          points.waistbandFOutCp2
            .shiftTowards(points.waistbandFOut, sa)
            .rotate(90, points.waistbandFOutCp2)
        )

        paths.sa = paths.saWaistbandFCurve
          .line(points.saWaistbandFDart)
          .line(points.saDartOut)
          .line(points.saWaistOut)
          .line(points.saWaistbandFOut)
          .close()
          .attr('class', 'fabric sa')
          .unhide()
      }
    }

    return part
  },
}
