import { waistband as draftWaistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'
import { flyShield } from './flyShield.mjs'

export const waistbandCurvedLeft = {
  name: 'theobald.waistbandCurvedLeft',
  from: draftWaistbandCurved,
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
    if (options.waistbandStyle != 'curved') {
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
      buttonKeep = ['buttonOverlap0', 'buttonPlacket']
    } else {
      buttonKeep = ['buttonholeOverlap0', 'buttonholePlacket']
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
    let angle
    let fishtailWidth
    if (store.get('waistbandLengthTop') > store.get('waistbandLength')) {
      angle = points.origin.angle(points.bottomLeft) - points.origin.angle(points.bottomLeftNotch)
      fishtailWidth = store.get('waistbandWidth') * -1
    } else {
      angle = points.origin.angle(points.bottomLeftNotch) - points.origin.angle(points.bottomLeft)
      fishtailWidth = store.get('waistbandWidth')
    }

    const radius = points.origin.dist(points.bottomLeftNotch)
    const fishtailCpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

    //let's begin
    if (options.waistbandFishtail) {
      points.fishtailLeftEx = points.topLeftNotch
        .shiftTowards(points.bottomLeftNotch, store.get('waistbandFishtailOffset'))
        .rotate(90, points.topLeftNotch)
      points.fishtailLeftCp1 = points.bottomLeft
        .shiftTowards(points.topLeft, fishtailCpDistance)
        .rotate(-90, points.bottomLeft)
      points.fishtailLeftCp2 = points.bottomLeftNotch
        .shiftTowards(points.topLeftNotch, fishtailCpDistance)
        .rotate(90, points.bottomLeftNotch)
      points.fishtailLeftCp3 = points.fishtailLeftCp2.shiftTowards(points.origin, fishtailWidth)
      points.fishtailLeftCp4 = points.fishtailLeftCp1.shiftTowards(points.origin, fishtailWidth)
    }

    const drawSeam = () => {
      if (options.waistbandFishtail)
        return new Path()
          .move(points.bottomLeftEx)
          .line(points.bottomLeft)
          .curve(points.fishtailLeftCp1, points.fishtailLeftCp2, points.bottomLeftNotch)
          .line(points.fishtailLeftEx)
          .line(points.topLeftNotch)
          .curve(points.fishtailLeftCp3, points.fishtailLeftCp4, points.topLeft)
          .line(points.topLeftEx)
          .line(points.bottomLeftEx)
          .close()
      else
        return new Path()
          .move(points.bottomLeftEx)
          .line(points.bottomLeft)
          .curve(points.bottomCp1, points.bottomCp2, points.bottomMid)
          .line(points.topMid)
          .curve(points.topCp3, points.topCp4, points.topLeft)
          .line(points.topLeftEx)
          .line(points.bottomLeftEx)
          .close()
    }

    //paths
    paths.seam = drawSeam()

    //stores
    store.set('fishtailWidth', fishtailWidth)

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topCp4, 0.5)
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
      points.title = points.topCp4.shiftFractionTowards(points.bottomCp1, 0.4)
      macro('title', {
        nr: 10,
        title: 'Waistband ' + titleName + utils.capitalize(options.waistbandStyle) + ' Left',
        at: points.title,
        rotation: 90 - points.bottomCp1.angle(points.topCp4),
        scale: 1 / 3,
      })
      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
