import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'

export const waistbandRight = {
  name: 'theobald.waistbandRight',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
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
    let rightPathKeep
    if (options.waistbandFishtail) {
      rightPathKeep = ''
    } else {
      rightPathKeep = 'waistbandRight'
    }
    const keepPaths = ['waistbandRightEx', rightPathKeep]
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }

    let buttonKeep
    if (options.waistbandOverlapSide == 'right') {
      buttonKeep = [
        'waistbandButtonholeOverlap0',
        'waistbandButtonholeOverlapF0',
        'waistbandButtonholePlacket',
        'waistbandButtonholePlacketF',
      ]
    } else {
      buttonKeep = [
        'waistbandButtonOverlap0',
        'waistbandButtonOverlapF0',
        'waistbandButtonPlacket',
        'waistbandButtonPlacketF',
      ]
    }

    let rightNotchKeep
    if (options.waistbandFishtail) {
      rightNotchKeep = ''
    } else {
      rightNotchKeep = ['waistbandBottomRightNotch-notch', 'waistbandTopRightNotch-notch']
    }

    const keepSnippets =
      ['waistbandBottomRight-notch', 'waistbandTopRight-notch'] + buttonKeep + rightNotchKeep
    for (const name in snippets) {
      if (keepSnippets.indexOf(name) === -1) delete snippets[name]
    }
    //remove macros
    macro('title', false)
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    //let's begin
    if (options.waistbandFishtail) {
      points.pivot = points.waistbandBottomRightNotch.shiftTowards(
        points.waistbandTopRightNotch,
        waistbandWidth
      )
      points.fishtailRightEx = points.pivot
        .shiftTowards(points.waistbandBottomRightNotch, store.get('waistbandFishtailOffset'))
        .rotate(-90, points.pivot)

      if (options.waistbandStyle == 'curved') {
        const fishtailWidth = store.get('fishtailWidth')
        let angle
        if (store.get('waistbandLengthTop') > store.get('waistbandLength')) {
          angle =
            points.waistbandOrigin.angle(points.waistbandBottomRightNotch) -
            points.waistbandOrigin.angle(points.waistbandBottomRight)
        } else {
          angle =
            points.waistbandOrigin.angle(points.waistbandBottomRight) -
            points.waistbandOrigin.angle(points.waistbandBottomRightNotch)
        }

        const radius = points.waistbandOrigin.dist(points.waistbandBottomRightNotch)
        const fishtailCpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

        points.fishtailRightCp1 = points.waistbandBottomRightNotch
          .shiftTowards(points.waistbandTopRightNotch, fishtailCpDistance)
          .rotate(-90, points.waistbandBottomRightNotch)
        points.fishtailRightCp2 = points.waistbandBottomRight
          .shiftTowards(points.waistbandTopRight, fishtailCpDistance)
          .rotate(90, points.waistbandBottomRight)
        points.fishtailRightCp3 = points.fishtailRightCp2.shiftTowards(
          points.waistbandOrigin,
          fishtailWidth
        )
        points.fishtailRightCp4 = points.fishtailRightCp1.shiftTowards(
          points.waistbandOrigin,
          fishtailWidth
        )
      }
    }

    const drawSeam = () => {
      if (options.waistbandStyle == 'straight') {
        if (options.waistbandFishtail)
          return new Path()
            .move(points.waistbandBottomRightNotch)
            .line(points.waistbandBottomRightEx)
            .line(points.waistbandTopRightEx)
            .line(points.waistbandTopRightNotch)
            .line(points.fishtailRightEx)
            .line(points.waistbandBottomRightNotch)
            .close()
        else
          return new Path()
            .move(points.waistbandBottomMid)
            .line(points.waistbandBottomRightEx)
            .line(points.waistbandTopRightEx)
            .line(points.waistbandTopMid)
            .line(points.waistbandBottomMid)
            .close()
      } else {
        if (options.waistbandFishtail)
          return new Path()
            .move(points.waistbandBottomRightNotch)
            .curve(points.fishtailRightCp1, points.fishtailRightCp2, points.waistbandBottomRight)
            .line(points.waistbandBottomRightEx)
            .line(points.waistbandTopRightEx)
            .line(points.waistbandTopRight)
            .curve(points.fishtailRightCp3, points.fishtailRightCp4, points.waistbandTopRightNotch)
            .line(points.fishtailRightEx)
            .line(points.waistbandBottomRightNotch)
            .close()
        else
          return new Path()
            .move(points.waistbandBottomMid)
            .curve(
              points.waistbandBottomMidCp2,
              points.waistbandBottomRightCp1,
              points.waistbandBottomRight
            )
            .line(points.waistbandBottomRightEx)
            .line(points.waistbandTopRightEx)
            .line(points.waistbandTopRight)
            .curve(points.waistbandTopRightCp2, points.waistbandTopMidCp1, points.waistbandTopMid)
            .line(points.waistbandBottomMid)
            .close()
      }
    }

    //paths
    paths.seam = drawSeam()

    if (complete) {
      let titleRot
      if (options.waistbandStyle == 'straight') {
        titleRot = 0
        points.grainlineFrom = points.waistbandTopRightNotch.shiftFractionTowards(
          points.waistbandTopRight,
          0.5
        )
        points.grainlineTo = new Point(points.grainlineFrom.x, points.waistbandBottomLeft.y)
        points.title = points.waistbandTopRightNotch
          .shiftFractionTowards(points.waistbandTopRight, 0.25)
          .shift(-90, waistbandWidth / 2)
      } else {
        titleRot = 90 - points.waistbandBottomRightCp1.angle(points.waistbandTopRightCp2)
        points.grainlineFrom = points.waistbandTopRight.shiftFractionTowards(
          points.waistbandTopRightCp2,
          0.5
        )
        points.grainlineTo = new Point(points.grainlineFrom.x, points.waistbandBottomLeft.y * 0.75)
        points.title = points.waistbandTopRightCp2.shiftFractionTowards(
          points.waistbandBottomRightCp1,
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
          foldlineFrom = new Point(points.waistbandTopMid.x, points.waistbandTopRightEx.y / 2)
        }

        paths.foldline = new Path()
          .move(foldlineFrom)
          .line(new Point(points.waistbandTopRightEx.x, points.waistbandTopRightEx.y / 2))
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
