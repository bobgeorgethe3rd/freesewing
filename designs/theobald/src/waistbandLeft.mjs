import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'
import { flyShield } from './flyShield.mjs'

export const waistbandLeft = {
  name: 'theobald.waistbandLeft',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Constants
    waistbandClosurePosition: 'front', //locked for Theobald
  },
  after: [frontBase, flyShield],
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
      points.pivot = points.bottomLeftNotch.shiftTowards(points.topLeftNotch, waistbandWidth)
      points.fishtailLeftEx = points.pivot
        .shiftTowards(points.bottomLeftNotch, store.get('waistbandFishtailOffset'))
        .rotate(90, points.pivot)
      if (options.waistbandStyle == 'curved') {
        let angle
        let fishtailWidth
        if (store.get('waistbandLengthTop') > store.get('waistbandLength')) {
          angle =
            points.origin.angle(points.bottomLeft) - points.origin.angle(points.bottomLeftNotch)
          fishtailWidth = store.get('waistbandWidth') * -1
        } else {
          angle =
            points.origin.angle(points.bottomLeftNotch) - points.origin.angle(points.bottomLeft)
          fishtailWidth = store.get('waistbandWidth')
        }
        const radius = points.origin.dist(points.bottomLeftNotch)
        const fishtailCpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

        points.fishtailLeftCp1 = points.bottomLeft
          .shiftTowards(points.topLeft, fishtailCpDistance)
          .rotate(-90, points.bottomLeft)
        points.fishtailLeftCp2 = points.bottomLeftNotch
          .shiftTowards(points.topLeftNotch, fishtailCpDistance)
          .rotate(90, points.bottomLeftNotch)
        points.fishtailLeftCp3 = points.fishtailLeftCp2.shiftTowards(points.origin, fishtailWidth)
        points.fishtailLeftCp4 = points.fishtailLeftCp1.shiftTowards(points.origin, fishtailWidth)
        //stores
        store.set('fishtailWidth', fishtailWidth)
      }
    }

    const drawSeam = () => {
      if (options.waistbandStyle == 'straight') {
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
      } else {
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
    }

    //paths
    paths.seam = drawSeam()

    if (complete) {
      let titleRot
      if (options.waistbandStyle == 'straight') {
        titleRot = 0
        points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topLeftNotch, 0.5)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
        points.title = points.topLeftNotch
          .shiftFractionTowards(points.topLeft, 0.25)
          .shift(-90, waistbandWidth / 2)
      } else {
        titleRot = 90 - points.bottomCp1.angle(points.topCp4)
        points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topCp4, 0.5)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y * 0.75)
        points.title = points.topCp4.shiftFractionTowards(points.bottomCp1, 0.4)
      }

      //grainline
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      macro('title', {
        nr: 10,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle) + ' Left',
        at: points.title,
        scale: 1 / 3,
        rotation: titleRot,
      })
      //fold line
      if (options.waistbandFolded && options.waistbandStyle == 'straight') {
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
