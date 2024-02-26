import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'

export const waistbandLeft = {
  name: 'theobald.waistbandLeft',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Constants
    closurePosition: 'front', //locked for Theobald
  },
  after: [frontBase],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
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
      leftPathKeep = 'waistbandLeft'
    }
    const keepPaths = ['waistbandLeftEx', leftPathKeep]
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }

    let buttonKeep
    if (options.waistbandOverlapSide == 'right') {
      buttonKeep = [
        'waistbandButtonOverlap0',
        'waistbandButtonOverlapF0',
        'waistbandButtonPlacket',
        'waistbandButtonPlacketF',
      ]
    } else {
      buttonKeep = [
        'waistbandButtonholeOverlap0',
        'waistbandButtonholeOverlapF0',
        'waistbandButtonholePlacket',
        'waistbandButtonholePlacketF',
      ]
    }

    let leftNotchKeep
    if (options.waistbandFishtail) {
      leftNotchKeep = ''
    } else {
      leftNotchKeep = ['waistbandBottomLeftNotch-notch', 'waistbandTopLeftNotch-notch']
    }

    const keepSnippets =
      ['waistbandBottomLeft-notch', 'waistbandTopLeft-notch'] + buttonKeep + leftNotchKeep
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //remove macros
    macro('title', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    //let's begin
    if (options.waistbandFishtail) {
      points.pivot = points.waistbandBottomLeftNotch.shiftTowards(
        points.waistbandTopLeftNotch,
        waistbandWidth
      )
      points.fishtailLeftEx = points.pivot
        .shiftTowards(points.waistbandBottomLeftNotch, store.get('waistbandFishtailOffset'))
        .rotate(90, points.pivot)
      if (options.waistbandStyle == 'curved') {
        let angle
        let fishtailWidth
        if (store.get('waistbandLengthTop') > store.get('waistbandLength')) {
          angle =
            points.waistbandOrigin.angle(points.waistbandBottomLeft) -
            points.waistbandOrigin.angle(points.waistbandBottomLeftNotch)
          fishtailWidth = store.get('waistbandWidth') * -1
        } else {
          angle =
            points.waistbandOrigin.angle(points.waistbandBottomLeftNotch) -
            points.waistbandOrigin.angle(points.waistbandBottomLeft)
          fishtailWidth = store.get('waistbandWidth')
        }
        const radius = points.waistbandOrigin.dist(points.waistbandBottomLeftNotch)
        const fishtailCpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

        points.fishtailLeftCp1 = points.waistbandBottomLeft
          .shiftTowards(points.waistbandTopLeft, fishtailCpDistance)
          .rotate(-90, points.waistbandBottomLeft)
        points.fishtailLeftCp2 = points.waistbandBottomLeftNotch
          .shiftTowards(points.waistbandTopLeftNotch, fishtailCpDistance)
          .rotate(90, points.waistbandBottomLeftNotch)
        points.fishtailLeftCp3 = points.fishtailLeftCp2.shiftTowards(
          points.waistbandOrigin,
          fishtailWidth
        )
        points.fishtailLeftCp4 = points.fishtailLeftCp1.shiftTowards(
          points.waistbandOrigin,
          fishtailWidth
        )
        //stores
        store.set('fishtailWidth', fishtailWidth)
      }
    }

    const drawSeam = () => {
      if (options.waistbandStyle == 'straight') {
        if (options.waistbandFishtail)
          return new Path()
            .move(points.waistbandBottomLeftEx)
            .line(points.waistbandBottomLeftNotch)
            .line(points.fishtailLeftEx)
            .line(points.waistbandTopLeftNotch)
            .line(points.waistbandTopLeftEx)
            .line(points.waistbandBottomLeftEx)
            .close()
        else
          return new Path()
            .move(points.waistbandBottomLeftEx)
            .line(points.waistbandBottomMid)
            .line(points.waistbandTopMid)
            .line(points.waistbandTopLeftEx)
            .line(points.waistbandBottomLeftEx)
            .close()
      } else {
        if (options.waistbandFishtail)
          return new Path()
            .move(points.waistbandBottomLeftEx)
            .line(points.waistbandBottomLeft)
            .curve(points.fishtailLeftCp1, points.fishtailLeftCp2, points.waistbandBottomLeftNotch)
            .line(points.fishtailLeftEx)
            .line(points.waistbandTopLeftNotch)
            .curve(points.fishtailLeftCp3, points.fishtailLeftCp4, points.waistbandTopLeft)
            .line(points.waistbandTopLeftEx)
            .line(points.waistbandBottomLeftEx)
            .close()
        else
          return new Path()
            .move(points.waistbandBottomLeftEx)
            .line(points.waistbandBottomLeft)
            .curve(
              points.waistbandBottomLeftCp2,
              points.waistbandBottomMidCp1,
              points.waistbandBottomMid
            )
            .line(points.waistbandTopMid)
            .curve(points.waistbandTopMidCp2, points.waistbandTopLeftCp1, points.waistbandTopLeft)
            .line(points.waistbandTopLeftEx)
            .line(points.waistbandBottomLeftEx)
            .close()
      }
    }

    //paths
    paths.seam = drawSeam()

    if (complete) {
      let titleRot
      if (options.waistbandStyle == 'straight') {
        titleRot = 0
        points.grainlineFrom = points.waistbandTopLeft.shiftFractionTowards(
          points.waistbandTopLeftNotch,
          0.5
        )
        points.grainlineTo = new Point(points.grainlineFrom.x, points.waistbandBottomLeft.y)
        points.title = points.waistbandTopLeftNotch
          .shiftFractionTowards(points.waistbandTopLeft, 0.25)
          .shift(-90, waistbandWidth / 2)
      } else {
        titleRot = 90 - points.waistbandBottomLeftCp2.angle(points.waistbandTopLeftCp1)
        points.grainlineFrom = points.waistbandTopLeft.shiftFractionTowards(
          points.waistbandTopLeftCp1,
          0.5
        )
        points.grainlineTo = new Point(points.grainlineFrom.x, points.waistbandBottomLeft.y * 0.75)
        points.title = points.waistbandTopLeftCp1.shiftFractionTowards(
          points.waistbandBottomLeftCp2,
          0.4
        )
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
          foldlineTo = new Point(points.waistbandTopMid.x, points.waistbandTopLeftEx.y / 2)
        }

        paths.foldline = new Path()
          .move(new Point(points.waistbandTopLeftEx.x, points.waistbandTopLeftEx.y / 2))
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
