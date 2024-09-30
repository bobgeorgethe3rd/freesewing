import { backBase } from './backBase.mjs'

export const waistbandFishtailLeft = {
  name: 'theobald.waistbandFishtailLeft',
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
      .split(points.waistbandFDart)[1]
      .line(points.waistbandFIn)
      .line(points.waistIn)
      .line(points.dartIn)
      .line(points.waistbandFDart)
      .close()
    if (complete) {
      //grainline
      points.grainlineFrom = points.waistbandF
      points.grainlineTo = utils.beamsIntersect(
        points.grainlineFrom,
        points.grainlineFrom.shift(points.waistIn.angle(points.waistOut) - 90, 1),
        points.waistIn,
        points.dartIn
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      let titleCutNum = 2
      if (options.waistbandFishtailEmbedded) titleCutNum = 1
      points.title = points.waistbandF
        .shiftFractionTowards(points.waistbandFDart, 0.5)
        .shift(
          points.waistbandFDart.angle(points.dartIn),
          points.waistbandFDart.dist(points.dartIn) * 0.75
        )
      macro('title', {
        nr: 13,
        title: 'Waistband Fishtail Left',
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.25,
        rotation: 360 - points.waistIn.angle(points.dartIn),
      })
      if (sa) {
        paths.saWaistbandFCurve = paths.waistbandFCurve
          .split(points.waistbandFDart)[1]
          .offset(sa)
          .hide()
        points.saWaistbandFIn = utils.beamsIntersect(
          points.saWaistbandF,
          points.saWaistbandF.shift(points.waistbandF.angle(points.waistbandFIn), 1),
          points.waistbandFIn.shiftTowards(points.waistIn, sa).rotate(-90, points.waistbandFIn),
          points.waistIn.shiftTowards(points.waistbandFIn, sa).rotate(90, points.waistIn)
        )
        points.saWaistIn = utils.beamsIntersect(
          points.saWaistbandFIn,
          points.saWaistbandFIn.shift(points.waistbandFIn.angle(points.waistIn), 1),
          points.waistIn.shiftTowards(points.dartIn, sa).rotate(-90, points.waistIn),
          points.dartIn.shiftTowards(points.waistIn, sa).rotate(90, points.dartIn)
        )
        points.saDartIn = utils.beamsIntersect(
          points.saWaistIn,
          points.saWaistIn.shift(points.waistIn.angle(points.dartIn), 1),
          points.dartIn.shiftTowards(points.waistbandFDart, sa).rotate(-90, points.dartIn),
          points.waistbandFDart.shiftTowards(points.dartIn, sa).rotate(90, points.waistbandFDart)
        )
        points.saWaistbandFDart = utils.beamsIntersect(
          points.saDartIn,
          points.saDartIn.shift(points.dartIn.angle(points.waistbandFDart), 1),
          paths.saWaistbandFCurve.start(),
          paths.saWaistbandFCurve.shiftFractionAlong(0.005)
        )

        paths.sa = paths.saWaistbandFCurve
          .clone()
          .line(points.saWaistbandF)
          .line(points.saWaistbandFIn)
          .line(points.saWaistIn)
          .line(points.saDartIn)
          .line(points.saWaistbandFDart)
          .close()
          .attr('class', 'fabric sa')
          .unhide()
      }
    }

    return part
  },
}
