import { pluginMirror } from '@freesewing/plugin-mirror'
import { pluginPatchPocket } from '@freesewing/plugin-patchpocket'
import { back } from './back.mjs'

export const sidePocket = {
  name: 'caleb.sidePocket',
  after: back,
  options: {
    //Pockets
    sidePocketDepth: { pct: 17.3, min: 10, max: 20, menu: 'pockets.sidePockets' },
    sidePocketPeakPlateau: { bool: false, menu: 'pockets.sidePockets' },
    sidePocketPleat: { bool: true, menu: 'pockets.sidePockets' },
    sidePocketPleatWidth: { pct: 27.1, min: 20, max: 30, menu: 'pockets.sidePockets' },
    //Construction
    sidePocketTopSaWidth: { pct: 4, min: 1, max: 5, menu: 'construction' },
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
    if (!store.get('sidePocketsBool')) {
      part.hide()
      return part
    }

    //measures
    const sidePocketWidth = store.get('sidePocketWidth')
    const sidePocketDepth = measurements.waistToFloor * options.sidePocketDepth
    //let's begin
    macro('patchpocket', {
      width: store.get('sidePocketWidth'),
      depth: sidePocketDepth,
      peakDepth: 0,
      style: 'straight',
      topSaWidth: options.sidePocketTopSaWidth,
      prefix: 'sidePocket',
    })

    if (options.sidePocketPleat) {
      //delete paths & snippets
      for (let i in paths) delete paths[i]
      for (let i in snippets) delete snippets[i]
      //measurements
      const sidePocketPleatWidth = sidePocketDepth * options.sidePocketPleatWidth
      const prefixFunction = (string) =>
        'sidePocketPatchPocket' + string.charAt(0).toUpperCase() + string.slice(1)

      const shiftRight = [prefixFunction('topRight'), prefixFunction('bottomRight')]
      for (const p of shiftRight) points[p] = points[p].shift(0, sidePocketPleatWidth)

      const shiftLeft = [prefixFunction('topLeft'), prefixFunction('bottomLeft')]
      for (const p of shiftLeft) points[p] = points[p].shift(180, sidePocketPleatWidth)

      points.pleatLeft = points[prefixFunction('topMid')].shift(180, sidePocketPleatWidth)
      points.pleatTopLeft = points.pleatLeft.shift(90, sa * options.sidePocketTopSaWidth * 100)
      points.pleatBottomLeft = new Point(points.pleatLeft.x, points[prefixFunction('bottomLeft')].y)
      const flipX = ['pleatLeft', 'pleatTopLeft', 'pleatBottomLeft']
      for (const p of flipX) points[p + 'F'] = points[p].flipX()
      //paths
      paths.seam = new Path()
        .move(points[prefixFunction('topLeft')])
        .line(points[prefixFunction('bottomLeft')])
        .line(points[prefixFunction('bottomRight')])
        .line(points[prefixFunction('topRight')])
        .line(points[prefixFunction('topLeft')])
        .close()

      if (complete) {
        //grainline
        points.grainlineFrom = points[prefixFunction('topLeft')].shiftFractionTowards(
          points.pleatLeft,
          0.5
        )
        points.grainlineTo = new Point(
          points.grainlineFrom.x,
          points[prefixFunction('bottomLeft')].y
        )
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: [
            prefixFunction('topLeft'),
            prefixFunction('topRight'),
            'pleatLeft',
            'pleatBottomLeft',
            'pleatLeftF',
            'pleatBottomLeftF',
          ],
        })
        //title
        points[prefixFunction('title')] = points[prefixFunction('title')].shift(
          0,
          sidePocketPleatWidth
        )
        //pleat lines
        paths.pleatLine = new Path()
          .move(points.pleatTopLeft)
          .line(points.pleatBottomLeft)
          .attr('class', 'mark')
          .attr('data-text', 'Pleat - Line')
          .attr('data-text-class', 'center')
        paths.pleatLineF = new Path()
          .move(points.pleatTopLeftF)
          .line(points.pleatBottomLeftF)
          .attr('class', 'mark')
          .attr('data-text', 'Pleat - Line')
          .attr('data-text-class', 'center')
        if (sa) {
          const shiftSaLeft = [
            prefixFunction('topLeftFold'),
            prefixFunction('saTopLeftCorner'),
            prefixFunction('saTopLeft'),
            prefixFunction('saBottomLeft'),
          ]
          for (const p of shiftSaLeft) points[p] = points[p].shift(180, sidePocketPleatWidth)

          paths.foldline = new Path()
            .move(points[prefixFunction('topLeft')])
            .line(points[prefixFunction('topRight')])
            .attr('class', 'various')
            .attr('data-text', 'Fold-line')
            .attr('data-text-class', 'center')

          paths.seamTop = new Path()
            .move(points[prefixFunction('topRight')])
            .line(points[prefixFunction('topLeftFold')].flipX())
            .line(points[prefixFunction('topLeftFold')])
            .line(points[prefixFunction('topLeft')])

          paths.sa = new Path()
            .move(points[prefixFunction('saTopLeftCorner')])
            .line(points[prefixFunction('saBottomLeft')])
            .line(points[prefixFunction('saBottomLeft')].flipX())
            .line(points[prefixFunction('saTopLeftCorner')].flipX())
            .line(points[prefixFunction('saTopLeftCorner')])
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    //stores
    store.set('sidePocketDepth', sidePocketDepth)
    if (complete) {
      //title
      macro('title', {
        nr: 9,
        title: 'Side Pocket',
        at: points.sidePocketPatchPocketTitle,
        cutNr: 2,
        scale: 0.5,
      })
    }

    return part
  },
}
