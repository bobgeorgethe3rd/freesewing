import { pluginMirror } from '@freesewing/plugin-mirror'
import { pluginPatchPocket } from '@freesewing/plugin-patchpocket'
import { back } from './back.mjs'

export const backPocket = {
  name: 'jackson.backPocket',
  after: back,
  options: {
    //Constants
    backPocketPleatWidth: 0.143,
    backPocketPleatPlacement: 0.25,
    //Pockets
    backPocketPleat: { bool: true, menu: 'pockets.backPockets' },
    //Construction
    backPocketTopSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  plugins: [pluginMirror, pluginPatchPocket],
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
    //draft
    if (!options.backPocketsBool) {
      part.hide()
      return part
    }
    //measures
    const backPocketDepth = store.get('backPocketDepth')
    //macro
    macro('patchpocket', {
      width: store.get('backPocketWidth'),
      depth: backPocketDepth,
      bottomWidth: options.backPocketBottomWidth,
      peakDepth: options.backPocketPeakDepth,
      peakPlateau: false,
      style: 'straight',
      topSaWidth: options.backPocketTopSaWidth,
      prefix: 'backPocket',
    })

    const prefixFunction = (string) =>
      'backPocketPatchPocket' + string.charAt(0).toUpperCase() + string.slice(1)

    if (complete) {
      //title
      macro('title', {
        nr: 2,
        title: 'Back Pocket',
        at: points[prefixFunction('title')],
        scale: 0.5,
      })
    }

    if (options.backPocketPleat) {
      // keep paths
      let keepThese
      if (sa) {
        keepThese = ['grainline', prefixFunction('seamTop'), prefixFunction('foldline')]
      } else {
        keepThese = ['grainline']
      }
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
      //measures
      const backPocketPleatWidth = backPocketDepth * options.backPocketPleatWidth
      points.pleatMid = points[prefixFunction('bottomMid')].shiftFractionTowards(
        points[prefixFunction('topMid')],
        options.backPocketPleatPlacement
      )
      points.pleatLeft0 = utils.beamsIntersect(
        points[prefixFunction('topLeft')],
        points[prefixFunction('bottomLeft')],
        points.pleatMid,
        points.pleatMid.shift(180, 1)
      )
      points.pleatRight0 = points.pleatLeft0.flipX(points.pleatMid)
      points.pleatLeft2 = points.pleatLeft0.shift(-90, backPocketPleatWidth)
      points.pleatRight2 = points.pleatLeft2.flipX(points.pleatMid)

      const shift = [
        prefixFunction('peakLeftStart'),
        prefixFunction('peak'),
        prefixFunction('peakRightEnd'),
      ]
      for (const p of shift) points[p] = points[p].shift(-90, backPocketPleatWidth)

      paths.saBase = new Path()
        .move(points[prefixFunction('topLeft')])
        .line(points.pleatLeft0)
        .line(points.pleatLeft2)
        .line(points[prefixFunction('peakLeftStart')])
        .line(points[prefixFunction('peak')])
        .line(points[prefixFunction('peakRightEnd')])
        .line(points.pleatRight2)
        .line(points.pleatRight0)
        .line(points[prefixFunction('topRight')])
        .hide()

      //paths
      paths.seam = paths.saBase.clone().line(points[prefixFunction('topLeft')]).close().unhide()

      if (complete) {
        //pleat lines
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
        //fold line back to top
        paths.foldline = paths[prefixFunction('foldline')]
        delete paths[prefixFunction('foldline')]
        if (sa) {
          if (options.backPocketPeakDepth > 0) {
            let shiftSa = [prefixFunction('saPeakLeftStart'), prefixFunction('saPeakLeftEnd')]
            for (const p of shiftSa) points[p] = points[p].shift(-90, backPocketPleatWidth)
          }

          points[prefixFunction('saBottomLeft')] = points[prefixFunction('saBottomLeft')].shift(
            -90,
            backPocketPleatWidth
          )

          points.saPleatLeft0 = utils.beamIntersectsY(
            points[prefixFunction('saLeft')],
            points[prefixFunction('saLeft')].shift(
              points[prefixFunction('topLeft')].angle(points.pleatLeft0),
              1
            ),
            points.pleatLeft0.y
          )
          points.saPleatLeft2 = utils.beamIntersectsY(
            points[prefixFunction('peakLeftStart')]
              .shiftTowards(points.pleatLeft2, sa)
              .rotate(-90, points[prefixFunction('peakLeftStart')]),
            points.pleatLeft2
              .shiftTowards(points[prefixFunction('peakLeftStart')], sa)
              .rotate(-90, points.pleatLeft2),
            points.pleatLeft2.y
          )
          paths.saLeft = new Path()
            .move(points[prefixFunction('saLeft')])
            .line(points.saPleatLeft0)
            .line(points.saPleatLeft2)
            .hide()

          if (options.backPocketPeakDepth == 0) {
            paths.saLeft = paths.saLeft.line(points[prefixFunction('saBottomLeft')]).hide()
          } else {
            paths.saLeft = paths.saLeft
              .line(points[prefixFunction('saPeakLeftStart')])
              .line(points[prefixFunction('saPeakLeftEnd')])
              .hide()
          }

          paths.sa = new Path()
            .move(points[prefixFunction('saTopLeftCorner')])
            .line(points[prefixFunction('saTopLeft')])
            .line(points[prefixFunction('saLeft')])
            .join(paths.saLeft)
            .hide()

          macro('mirror', {
            mirror: [points[prefixFunction('topMid')], points[prefixFunction('peak')]],
            paths: ['sa'],
            prefix: 'm',
          })

          paths.sa = paths.sa
            .join(paths.mSa.reverse())
            .line(points[prefixFunction('saTopLeftCorner')])
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }
    return part
  },
}
