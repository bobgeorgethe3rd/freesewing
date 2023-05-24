import { pocket } from '@freesewing/patchpocket'
import { back } from './back.mjs'

export const backPocket = {
  name: 'jackson.backPocket',
  after: back,
  options: {
    //Imported
    ...pocket.options,
    //Constants
    patchPocketPeakPlateau: false, //locked for Jackson
    patchPocketPeakCurve: 1, //locked for Jackson
    patchPocketStyle: 'straight', //locked for Jackson
    patchPocketGrainlineBias: false, //locked for Jackson
    backPocketPleatWidth: 0.143,
    backPocketPleatPlacement: 0.25,
    //Pockets
    backPocketPleat: { bool: true, menu: 'pockets.backPockets' },
  },
  draft: (sh) => {
    //draft
    const { store, sa, Point, points, Path, paths, options, complete, macro, utils, part } = sh

    pocket.draft(sh)

    // keep paths
    const keepThese = ['top', 'grainline']

    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measures
    const backPocketPleatWidth = store.get('patchPocketDepth') * options.backPocketPleatWidth

    if (options.backPocketPleat) {
      points.pleatMid = points.bottomMid.shiftFractionTowards(
        points.topMid,
        options.backPocketPleatPlacement
      )
      points.pleatLeft0 = utils.beamsIntersect(
        points.topLeft,
        points.bottomLeft,
        points.pleatMid,
        points.pleatMid.shift(180, 1)
      )
      points.pleatRight0 = points.pleatLeft0.flipX(points.pleatMid)
      points.pleatLeft2 = points.pleatLeft0.shift(-90, backPocketPleatWidth)
      points.pleatRight2 = points.pleatLeft2.flipX(points.pleatMid)

      const shift = ['peakLeftStart', 'peak', 'peakRightEnd']
      for (const p of shift) points[p] = points[p].shift(-90, backPocketPleatWidth)

      paths.saBase = new Path()
        .move(points.topLeft)
        .line(points.pleatLeft0)
        .line(points.pleatLeft2)
        .line(points.peakLeftStart)
        .line(points.peak)
        .line(points.peakRightEnd)
        .line(points.pleatRight2)
        .line(points.pleatRight0)
        .line(points.topRight)
        .hide()
    } else {
      paths.saBase = new Path()
        .move(points.topLeft)
        .line(points.peakLeftStart)
        .line(points.peak)
        .line(points.peakRightEnd)
        .line(points.topRight)
        .hide()
    }

    //paths
    paths.seam = paths.saBase.clone().join(paths.top).close()

    if (complete) {
      //title
      macro('title', {
        nr: 3,
        title: 'Back Pocket',
        at: points.title,
        scale: 0.5,
      })
      //pleat lines
      if (options.backPocketPleat) {
        points.pleatLeft1 = points.pleatLeft0.shiftFractionTowards(points.pleatLeft2, 0.5)
        points.pleatRight1 = points.pleatLeft1.flipX(points.pleatMid)

        for (let i = 0; i < 3; i++) {
          paths['pleat' + i] = new Path()
            .move(points['pleatLeft' + i])
            .line(points['pleatRight' + i])
            .attr('class', 'interfacing help')
            .attr('data-text', 'Stitch Line')
        }
        paths.pleat1.attr('class', 'interfacing', true).attr('data-text', 'Fold-line', true)
      }

      if (sa) {
        paths.sa = paths.saBase
          .clone()
          .offset(sa)
          .join(paths.top.offset(sa * options.patchPocketSaTopWidth * 100))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
