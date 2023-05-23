import { waistband as draftWaistbandStraight } from '@freesewing/waistbandstraight'
import { frontBase } from './frontBase.mjs'
import { flyShield } from './flyShield.mjs'

export const waistbandStraightLeft = {
  name: 'theobald.waistbandStraightLeft',
  from: draftWaistbandStraight,
  after: [frontBase, flyShield],
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
    log,
    absoluteOptions,
  }) => {
    //set Render
    if (options.waistbandStyle != 'straight') {
      part.hide()
      return part
    }
    //removing paths and snippets not required from from
    let leftPathKeep
    if (options.waistbandFishtail) {
      leftPathKeep = ''
    } else {
      leftPathKeep = 'left'
    }
    const keepPaths = ['leftEx', leftPathKeep]
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }

    let buttonKeep
    if (options.waistbandOverlapSide == 'right') {
      buttonKeep = ['buttonOverlap0', 'buttonOverlapF0', 'buttonPlacket', 'buttonPlacketF']
    } else {
      buttonKeep = [
        'buttonholeOverlap0',
        'buttonholeOverlapF0',
        'buttonholePlacket',
        'buttonholePlacketF',
      ]
    }

    let leftNotchKeep
    if (options.waistbandFishtail) {
      leftNotchKeep = ''
    } else {
      leftNotchKeep = ['bottomLeftNotch-notch', 'topLeftNotch-notch']
    }

    const keepSnippets = ['bottomLeft-notch', 'topLeft-notch'] + buttonKeep + leftNotchKeep
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //remove macros
    macro('title', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')

    //let's begin
    if (options.waistbandFishtail) {
      points.fishtailLeftEx = points.bottomLeftNotch.translate(
        store.get('waistbandFishtailOffset'),
        -waistbandWidth
      )
    }

    const drawSeam = () => {
      if (options.waistbandFishtail)
        return new Path()
          .move(points.bottomLeftEx)
          .line(points.bottomLeftNotch)
          .line(points.fishtailLeftEx)
          .line(points.topLeftNotch)
          .line(points.topLeftEx)
          .line(points.bottomLeftEx)
          .close()
      else
        return new Path()
          .move(points.bottomLeftEx)
          .line(points.bottomMid)
          .line(points.topMid)
          .line(points.topLeftEx)
          .line(points.bottomLeftEx)
          .close()
    }

    //paths
    paths.seam = drawSeam()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topLeftNotch, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      let titleName
      if (options.waistbandFishtail) {
        titleName = 'Fishtail '
      } else {
        titleName = ''
      }
      points.title = points.topLeftNotch
        .shiftFractionTowards(points.topLeft, 0.25)
        .shift(-90, waistbandWidth / 2)
      macro('title', {
        nr: 10,
        title: 'Waistband ' + titleName + utils.capitalize(options.waistbandStyle) + ' Left',
        at: points.title,
        scale: 1 / 3,
      })
      //fold line
      if (options.waistbandFolded) {
        let foldlineTo
        if (options.waistbandFishtail) {
          foldlineTo = points.fishtailLeftEx
        } else {
          foldlineTo = new Point(points.topMid.x, points.topLeftEx.y / 2)
        }

        paths.foldline = new Path()
          .move(new Point(points.topLeftEx.x, points.topLeftEx.y / 2))
          .line(foldlineTo)
          .attr('class', 'interfacing')
          .attr('data-text', 'Fold - Line')
      }

      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
