import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'
import { flyShield } from './flyShield.mjs'
import { waistbandLeft } from './waistbandLeft.mjs'

export const waistbandRight = {
  name: 'theobald.waistbandRight',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
  },
  after: [frontBase, flyShield, waistbandLeft],
  draft: (sh) => {
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      snippets,
      Snippet,
      utils,
      options,
      measurements,
      store,
      complete,
      sa,
      part,
    } = sh

    if (options.waistbandStyle == 'straight') waistbandStraight.draft(sh)
    else waistbandCurved.draft(sh)

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
      points.pivot = points.bottomRightNotch.shiftTowards(points.topRightNotch, waistbandWidth)
      points.fishtailRightEx = points.pivot
        .shiftTowards(points.bottomRightNotch, store.get('waistbandFishtailOffset'))
        .rotate(-90, points.pivot)

      if (options.waistbandStyle == 'curved') {
        const fishtailWidth = store.get('fishtailWidth')
        let angle
        if (store.get('waistbandLengthTop') > store.get('waistbandLength')) {
          angle =
            points.origin.angle(points.bottomRightNotch) - points.origin.angle(points.bottomRight)
        } else {
          angle =
            points.origin.angle(points.bottomRight) - points.origin.angle(points.bottomRightNotch)
        }

        const radius = points.origin.dist(points.bottomRightNotch)
        const fishtailCpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

        points.fishtailRightCp1 = points.bottomRightNotch
          .shiftTowards(points.topRightNotch, fishtailCpDistance)
          .rotate(-90, points.bottomRightNotch)
        points.fishtailRightCp2 = points.bottomRight
          .shiftTowards(points.topRight, fishtailCpDistance)
          .rotate(90, points.bottomRight)
        points.fishtailRightCp3 = points.fishtailRightCp2.shiftTowards(points.origin, fishtailWidth)
        points.fishtailRightCp4 = points.fishtailRightCp1.shiftTowards(points.origin, fishtailWidth)
      }
    }

    const drawSeam = () => {
      if (options.waistbandStyle == 'straight') {
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
      } else {
        if (options.waistbandFishtail)
          return new Path()
            .move(points.bottomRightNotch)
            .curve(points.fishtailRightCp1, points.fishtailRightCp2, points.bottomRight)
            .line(points.bottomRightEx)
            .line(points.topRightEx)
            .line(points.topRight)
            .curve(points.fishtailRightCp3, points.fishtailRightCp4, points.topRightNotch)
            .line(points.fishtailRightEx)
            .line(points.bottomRightNotch)
            .close()
        else
          return new Path()
            .move(points.bottomMid)
            .curve(points.bottomCp3, points.bottomCp4, points.bottomRight)
            .line(points.bottomRightEx)
            .line(points.topRightEx)
            .line(points.topRight)
            .curve(points.topCp1, points.topCp2, points.topMid)
            .line(points.bottomMid)
            .close()
      }
    }

    //paths
    paths.seam = drawSeam()

    if (complete) {
      let titleRot
      if (options.waistbandStyle == 'straight') {
        titleRot = 0
        points.grainlineFrom = points.topRightNotch.shiftFractionTowards(points.topRight, 0.5)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
        points.title = points.topRightNotch
          .shiftFractionTowards(points.topRight, 0.25)
          .shift(-90, waistbandWidth / 2)
      } else {
        titleRot = 90 - points.bottomCp4.angle(points.topCp1)
        points.grainlineFrom = points.topRight.shiftFractionTowards(points.topCp1, 0.5)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y * 0.75)
        points.title = points.topCp1.shiftFractionTowards(points.bottomCp4, 0.4)
      }

      //grainline
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      macro('title', {
        nr: 11,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle) + ' Right',
        at: points.title,
        scale: 1 / 3,
        rotation: titleRot,
      })
      //fold line
      if (options.waistbandFolded && options.waistbandStyle == 'straight') {
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
