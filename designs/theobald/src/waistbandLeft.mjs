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
    const keepPaths = ['waistbandSeam', 'waistbandLeftEx', leftPathKeep]
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
    paths.waistbandSeam.hide()
    //remove macros
    macro('title', false)
    //measurements
    const waistbandFolded = options.waistbandFolded && options.waistbandStyle == 'straight'
    const waistbandWidth = store.get('waistbandWidth')
    //let's begin
    if (options.waistbandFishtail) {
      if (waistbandFolded) {
        points.waistbandFishtailLeft = points.waistbandTopLeftNotch
          .shiftTowards(points.waistbandBottomLeftNotch, waistbandWidth)
          .shift(
            points.waistbandTopLeftNotch.angle(points.waistbandBottomLeftNotch) + 90,
            store.get('waistbandFishtailOffset')
          )
      } else {
        points.waistbandFishtailLeft = points.waistbandTopLeftNotch
          .shiftTowards(points.waistbandBottomLeftNotch, store.get('waistbandFishtailOffset'))
          .rotate(90, points.waistbandTopLeftNotch)
      }
      paths.seam = paths.waistbandSeam
        .split(points.waistbandBottomLeftNotch)[0]
        .line(points.waistbandFishtailLeft)
        .line(points.waistbandTopLeftNotch)
        .join(paths.waistbandSeam.split(points.waistbandTopLeftNotch)[1])
        .close()
    } else {
      paths.seam = new Path()
        .move(points.waistbandBottomLeftEx)
        .line(points.waistbandBottomLeft)
        .join(paths.waistbandSeam.split(points.waistbandBottomMid)[0])
        .line(points.waistbandTopMid)
        .join(paths.waistbandSeam.split(points.waistbandTopMid)[1])
        .line(points.waistbandTopLeftEx)
        .close()
    }

    if (complete) {
      //grainline
      points.grainlineTo = paths.waistbandSeam
        .split(points.waistbandBottomMid)[0]
        .shiftFractionAlong(0.125)
      points.grainlineFrom = points.grainlineTo.shift(90, waistbandWidth)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = paths.waistbandSeam
        .split(points.waistbandBottomMid)[0]
        .shiftFractionAlong(0.25)
        .shift(90, waistbandWidth * 0.5)
      macro('title', {
        nr: 11,
        title: 'Waistband Left ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        scale: 1 / 3,
      })
      //foldline
      if (waistbandFolded) {
        let foldlineTo
        if (options.waistbandFishtail) {
          foldlineTo = points.waistbandFishtailLeft
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
        if (options.waistbandFishtail) {
          points.saWaistbandBottomLeftNotch = utils.beamsIntersect(
            paths.waistbandSeam.split(points.waistbandBottomLeftNotch)[0].offset(sa).end(),
            paths.waistbandSeam
              .split(points.waistbandBottomLeftNotch)[0]
              .offset(sa)
              .shiftFractionAlong(0.995),
            points.waistbandBottomLeftNotch
              .shiftTowards(points.waistbandFishtailLeft, sa)
              .rotate(-90, points.waistbandBottomLeftNotch),
            points.waistbandFishtailLeft
              .shiftTowards(points.waistbandBottomLeftNotch, sa)
              .rotate(90, points.waistbandFishtailLeft)
          )
          if (waistbandFolded) {
            points.saWaistbandTopLeftNotch = utils.beamsIntersect(
              paths.waistbandSeam.split(points.waistbandTopLeftNotch)[1].offset(sa).start(),
              paths.waistbandSeam
                .split(points.waistbandTopLeftNotch)[1]
                .offset(sa)
                .shiftFractionAlong(0.005),
              points.waistbandFishtailLeft
                .shiftTowards(points.waistbandTopLeftNotch, sa)
                .rotate(-90, points.waistbandFishtailLeft),
              points.waistbandTopLeftNotch
                .shiftTowards(points.waistbandFishtailLeft, sa)
                .rotate(90, points.waistbandTopLeftNotch)
            )
            points.saWaistbandFishtailLeft = utils.beamIntersectsY(
              points.waistbandBottomLeftNotch
                .shiftTowards(points.waistbandFishtailLeft, sa)
                .rotate(-90, points.waistbandBottomLeftNotch),
              points.waistbandFishtailLeft
                .shiftTowards(points.waistbandBottomLeftNotch, sa)
                .rotate(90, points.waistbandFishtailLeft),
              points.waistbandFishtailLeft.y
            )
          } else {
            points.saWaistbandTopLeftNotch = points.waistbandBottomLeftNotch.shiftOutwards(
              points.waistbandTopLeftNotch,
              sa
            )
            points.saWaistbandFishtailLeft = utils.beamsIntersect(
              points.waistbandBottomLeftNotch
                .shiftTowards(points.waistbandFishtailLeft, sa)
                .rotate(-90, points.waistbandBottomLeftNotch),
              points.waistbandFishtailLeft
                .shiftTowards(points.waistbandBottomLeftNotch, sa)
                .rotate(90, points.waistbandFishtailLeft),
              points.waistbandBottomLeftNotch.shiftOutwards(points.waistbandTopLeftNotch, sa),
              points.waistbandBottomLeftNotch
                .shiftOutwards(points.waistbandTopLeftNotch, sa)
                .shift(points.waistbandBottomLeftNotch.angle(points.waistbandTopLeftNotch) + 90, 1)
            )
          }
          paths.sa = paths.waistbandSeam
            .split(points.waistbandBottomLeftNotch)[0]
            .offset(sa)
            .line(points.saWaistbandBottomLeftNotch)
            .line(points.saWaistbandFishtailLeft)
            .line(points.saWaistbandTopLeftNotch)
            .join(
              paths.waistbandSeam
                .split(points.waistbandTopLeftNotch)[1]
                .split(points.waistbandTopLeft)[0]
                .line(points.waistbandTopLeftEx)
                .offset(sa)
            )
            .line(points.waistbandSaTopLeft)
            .line(points.waistbandSaBottomLeft)
            .close()
            .attr('class', 'fabric sa')
        } else {
          points.saWaistbandBottomMid = points.waistbandBottomMid.translate(sa, sa)
          points.saWaistbandTopMid = points.waistbandTopMid.translate(sa, -sa)
          paths.sa = paths.seam
            .split(points.waistbandBottomMid)[0]
            .offset(sa)
            .line(points.saWaistbandBottomMid)
            .line(points.saWaistbandTopMid)
            .join(
              paths.waistbandSeam
                .split(points.waistbandTopMid)[1]
                .split(points.waistbandTopLeft)[0]
                .line(points.waistbandTopLeftEx)
                .offset(sa)
            )
            .line(points.waistbandSaTopLeft)
            .line(points.waistbandSaBottomLeft)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }
    return part
  },
}
