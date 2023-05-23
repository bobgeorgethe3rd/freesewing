import { waistband as draftWaistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'
import { flyShield } from './flyShield.mjs'
import { waistbandCurvedLeft } from './waistbandCurvedLeft.mjs'

export const waistbandCurvedRight = {
  name: 'theobald.waistbandCurvedRight',
  from: draftWaistbandCurved,
  after: [frontBase, flyShield, waistbandCurvedLeft],
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
    if (options.waistbandStyle != 'curved') {
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
      buttonKeep = ['buttonholeOverlap0', 'buttonholePlacket']
    } else {
      buttonKeep = ['buttonOverlap0', 'buttonPlacket']
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
    const fishtailWidth = store.get('fishtailWidth')
    let angle
    if (store.get('waistbandLengthTop') > store.get('waistbandLength')) {
      angle = points.origin.angle(points.bottomRightNotch) - points.origin.angle(points.bottomRight)
    } else {
      angle = points.origin.angle(points.bottomRight) - points.origin.angle(points.bottomRightNotch)
    }

    const radius = points.origin.dist(points.bottomRightNotch)
    const fishtailCpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

    //let's begin
    if (options.waistbandFishtail) {
      points.fishtailRightEx = points.topRightNotch
        .shiftTowards(points.bottomRightNotch, store.get('waistbandFishtailOffset'))
        .rotate(-90, points.topRightNotch)
      points.fishtailRightCp1 = points.bottomRightNotch
        .shiftTowards(points.topRightNotch, fishtailCpDistance)
        .rotate(-90, points.bottomRightNotch)
      points.fishtailRightCp2 = points.bottomRight
        .shiftTowards(points.topRight, fishtailCpDistance)
        .rotate(90, points.bottomRight)
      points.fishtailRightCp3 = points.fishtailRightCp2.shiftTowards(points.origin, fishtailWidth)
      points.fishtailRightCp4 = points.fishtailRightCp1.shiftTowards(points.origin, fishtailWidth)
    }

    const drawSeam = () => {
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

    //paths
    paths.seam = drawSeam()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topRight.shiftFractionTowards(points.topCp1, 0.5)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y * 0.75)
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
      points.title = points.topCp1.shiftFractionTowards(points.bottomCp4, 0.4)
      macro('title', {
        nr: 11,
        title: 'Waistband ' + titleName + utils.capitalize(options.waistbandStyle) + ' Right',
        at: points.title,
        rotation: 90 - points.bottomCp4.angle(points.topCp1),
        scale: 1 / 3,
      })
      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
