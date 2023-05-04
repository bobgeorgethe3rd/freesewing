import { waistband as draftWaistbandStraight } from '@freesewing/waistbandstraight'
import { frontBase } from './frontBase.mjs'
import { flyShield } from './flyShield.mjs'

export const waistbandStraightRight = {
  name: 'theobald.waistbandStraightRight',
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
    let rightPathKeep
    if (options.waistbandFishtail) {
      rightPathKeep = ''
    } else {
      rightPathKeep = 'right'
    }
    const keepPaths = ['rightEx', rightPathKeep]
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }

    let buttonKeep
    if (options.waistbandOverlapSide == 'right') {
      buttonKeep = [
        'buttonholeOverlap0',
        'buttonholeOverlapF0',
        'buttonholePlacket',
        'buttonholePlacketF',
      ]
    } else {
      buttonKeep = ['buttonOverlap0', 'buttonOverlapF0', 'buttonPlacket', 'buttonPlacketF']
    }

    let rightNotchKeep
    if (options.waistbandFishtail) {
      rightNotchKeep = ''
    } else {
      rightNotchKeep = ['bottomRightNotch-notch', 'topRightNotch-notch']
    }

    const keepSnippets = ['bottomRight-notch', 'topRight-notch'] + buttonKeep + rightNotchKeep
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //remove macros
    macro('title', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')

    //let's begin

    if (options.waistbandFishtail) {
      points.fishtailRightEx = points.bottomRightNotch.translate(
        -store.get('waistbandFishtailOffset'),
        -waistbandWidth
      )
    }

    const drawSeam = () => {
      if (options.waistbandFishtail)
        return new Path()
          .move(points.bottomRightNotch)
          .line(points.bottomRightEx)
          .line(points.topRightEx)
          .line(points.topRightNotch)
          .line(points.fishtailRightEx)
          .line(points.bottomRightNotch)
          .close()
      else
        return new Path()
          .move(points.bottomMid)
          .line(points.bottomRightEx)
          .line(points.topRightEx)
          .line(points.topMid)
          .line(points.bottomMid)
          .close()
    }

    //paths
    paths.seam = drawSeam()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topRightNotch.shiftFractionTowards(points.topRight, 0.5)
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
      points.title = points.topRightNotch
        .shiftFractionTowards(points.topRight, 0.25)
        .shift(-90, waistbandWidth / 2)
      macro('title', {
        nr: 11,
        title: 'Waistband ' + titleName + utils.capitalize(options.waistbandStyle) + ' Right',
        at: points.title,
        scale: 1 / 3,
      })
      //fold line
      if (options.waistbandFolded) {
        let foldlineFrom
        if (options.waistbandFishtail) {
          foldlineFrom = points.fishtailRightEx
        } else {
          foldlineFrom = new Point(points.topMid.x, points.topRightEx.y / 2)
        }

        paths.foldline = new Path()
          .move(foldlineFrom)
          .line(new Point(points.topRightEx.x, points.topRightEx.y / 2))
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
