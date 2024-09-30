import { pocket } from './pocket.mjs'

export const pocketInner = {
  name: 'bernice.pocketInner',
  from: pocket,
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
    //set Render stroke Draft
    if (!options.pocketsBool) {
      part.hide()
      return part
    }
    //keep certain paths
    const keepThese = 'saBase'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    macro('title', false)
    //paths
    paths.seam = paths.saBase.clone().line(points.topMid).close().unhide()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.left.x * 0.75, points.slitBottom.y * 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.curveLeftStartCp2.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.left.x * 0.5, points.bottomMid.y * 0.5)
      macro('title', {
        nr: '3',
        title: 'Pocket Inner',
        at: points.title,
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const pocketBagSa = sa * options.pocketBagSaWidth * 100

        points.saTopMid = points.topMid.translate(sideSeamSa, -pocketBagSa)
        points.saBottomMid = points.bottomMid.translate(sideSeamSa, pocketBagSa)

        paths.sa = paths.saBase
          .offset(pocketBagSa)
          .line(points.saBottomMid)
          .line(points.saTopMid)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
