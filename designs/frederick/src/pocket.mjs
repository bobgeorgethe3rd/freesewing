import { pocket as patchPocket } from '@freesewing/patchpocket'
import { body } from './body.mjs'

export const pocket = {
  name: 'frederick.pocket',
  after: body,
  options: {
    //Imported
    ...patchPocket.options,
    //Constant
    patchPocketBottomWidth: 1, //Locked for Frederick
    patchPocketPeakCurve: 1, //Locked for Frederick
    patchPocketPeakDepth: 0, //Locked for Frederick
    patchPocketPeakPlateau: false, //Locked for Frederick
    patchPocketStyle: 'straight', //Locked for Frederick
    //Pockets

    //Construction
    patchPocketTopFoldWidth: { pct: 24.9, min: 10, max: 50, menu: 'construction' }, //Altered for Frederick
  },
  plugins: [...patchPocket.plugins],
  draft: (sh) => {
    //draft
    const { points, paths, Path, options, sa, complete, macro, part } = sh
    if (!options.patchPocketsBool) {
      part.hide()
      return part
    }

    patchPocket.draft(sh)

    if (complete) {
      //title
      macro('title', {
        nr: 2,
        title: 'Pocket',
        at: points.patchPocketTitle,
        cutNr: 1,
        scale: 1 / 3,
      })
      if (sa) {
        delete paths.patchPocketSa
        const hemSa = sa * options.hemWidth * 100

        points.saBottomLeft = paths.patchPocketSeam.edge('bottomLeft').translate(-sa, hemSa)
        points.saBottomRight = paths.patchPocketSeam.edge('bottomRight').translate(sa, hemSa)
        points.saTopRight = options.patchPocketFolded
          ? paths.patchPocketSeam.edge('topRight').translate(sa, -hemSa)
          : paths.patchPocketSeamTop.edge('topRight').translate(sa, -sa)

        points.saTopLeft = options.patchPocketFolded
          ? paths.patchPocketSeam.edge('topLeft').translate(-sa, -hemSa)
          : paths.patchPocketSeamTop.edge('topLeft').translate(-sa, -sa)

        paths.sa = new Path()
          .move(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
