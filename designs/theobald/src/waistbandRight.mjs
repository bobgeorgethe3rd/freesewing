import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { frontBase } from './frontBase.mjs'
import { waistbandLeft } from './waistbandLeft.mjs'

export const waistbandRight = {
  name: 'theobald.waistbandRight',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
  },
  after: [frontBase, waistbandLeft],
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
    const keepPaths = ['waistbandSeam', 'waistbandRightEx', rightPathKeep]
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
    paths.waistbandSeam.hide()
    //remove macros
    macro('title', false)
    //measurements
    const waistbandFolded = options.waistbandFolded && options.waistbandStyle == 'straight'
    const waistbandWidth = store.get('waistbandWidth')
    //let's begin
    if (options.waistbandFishtail) {
      if (waistbandFolded) {
        points.waistbandFishtailRight = points.waistbandTopRightNotch
          .shiftTowards(points.waistbandBottomRightNotch, waistbandWidth)
          .shift(
            points.waistbandTopRightNotch.angle(points.waistbandBottomRightNotch) - 90,
            store.get('waistbandFishtailOffset')
          )
      } else {
        points.waistbandFishtailRight = points.waistbandTopRightNotch
          .shiftTowards(points.waistbandBottomRightNotch, store.get('waistbandFishtailOffset'))
          .rotate(-90, points.waistbandTopRightNotch)
      }
      paths.seam = paths.waistbandSeam
        .split(points.waistbandBottomRightNotch)[1]
        .split(points.waistbandBottomRight)[0]
        .line(points.waistbandBottomRightEx)
        .line(points.waistbandTopRightEx)
        .line(points.waistbandTopRight)
        .join(
          paths.waistbandSeam
            .split(points.waistbandTopRight)[1]
            .split(points.waistbandTopRightNotch)[0]
            .line(points.waistbandFishtailRight)
            .line(points.waistbandBottomRightNotch)
        )
        .close()
    } else {
      paths.seam = paths.waistbandSeam
        .split(points.waistbandBottomMid)[1]
        .split(points.waistbandBottomRight)[0]
        .line(points.waistbandBottomRightEx)
        .line(points.waistbandTopRightEx)
        .line(points.waistbandTopRight)
        .join(
          paths.waistbandSeam.split(points.waistbandTopRight)[1].split(points.waistbandTopMid)[0]
        )
        .line(points.waistbandBottomMid)
        .close()
    }
    if (complete) {
      //grainline
      points.grainlineTo = paths.waistbandSeam
        .split(points.waistbandBottomMid)[1]
        .split(points.waistbandBottomRight)[0]
        .shiftFractionAlong(0.875)
      points.grainlineFrom = points.grainlineTo.shift(90, waistbandWidth)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      let titleCutNum = 2
      if (options.neckbandFolded || options.neckbandStyle == 'curved') titleCutNum = 1
      points.title = paths.waistbandSeam
        .split(points.waistbandBottomMid)[1]
        .split(points.waistbandBottomRight)[0]
        .shiftFractionAlong(0.75)
        .shift(90, waistbandWidth * 0.5)
      macro('title', {
        nr: 12,
        title: 'Waistband Right ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.25,
      })
      //foldline
      if (waistbandFolded) {
        let foldlineFrom
        if (options.waistbandFishtail) {
          foldlineFrom = points.waistbandFishtailRight
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
        if (options.waistbandFishtail) {
          points.saWaistbandBottomMidNotch = utils.beamsIntersect(
            paths.waistbandSeam.split(points.waistbandBottomRightNotch)[1].offset(sa).start(),
            paths.waistbandSeam
              .split(points.waistbandBottomRightNotch)[1]
              .offset(sa)
              .shiftFractionAlong(0.005),
            points.waistbandFishtailRight
              .shiftTowards(points.waistbandBottomRightNotch, sa)
              .rotate(-90, points.waistbandFishtailRight),
            points.waistbandBottomRightNotch
              .shiftTowards(points.waistbandFishtailRight, sa)
              .rotate(90, points.waistbandBottomRightNotch)
          )
          if (waistbandFolded) {
            points.saWaistbandTopRightNotch = utils.beamsIntersect(
              paths.waistbandSeam.split(points.waistbandTopRightNotch)[0].offset(sa).end(),
              paths.waistbandSeam
                .split(points.waistbandTopRightNotch)[0]
                .offset(sa)
                .shiftFractionAlong(0.995),
              points.waistbandTopRightNotch
                .shiftTowards(points.waistbandFishtailRight, sa)
                .rotate(-90, points.waistbandTopRightNotch),
              points.waistbandFishtailRight
                .shiftTowards(points.waistbandTopRightNotch, sa)
                .rotate(90, points.waistbandFishtailRight)
            )
            points.saWaistbandFishtailRight = utils.beamIntersectsY(
              points.waistbandFishtailRight
                .shiftTowards(points.waistbandBottomRightNotch, sa)
                .rotate(-90, points.waistbandFishtailRight),
              points.waistbandBottomRightNotch
                .shiftTowards(points.waistbandFishtailRight, sa)
                .rotate(90, points.waistbandBottomRightNotch),
              points.waistbandFishtailRight.y
            )
          } else {
            points.saWaistbandTopRightNotch = points.waistbandBottomRightNotch.shiftOutwards(
              points.waistbandTopRightNotch,
              sa
            )
            points.saWaistbandFishtailRight = utils.beamsIntersect(
              points.waistbandFishtailRight
                .shiftTowards(points.waistbandBottomRightNotch, sa)
                .rotate(-90, points.waistbandFishtailRight),
              points.waistbandBottomRightNotch
                .shiftTowards(points.waistbandFishtailRight, sa)
                .rotate(90, points.waistbandBottomRightNotch),
              points.waistbandBottomRightNotch.shiftOutwards(points.waistbandTopRightNotch, sa),
              points.waistbandBottomRightNotch
                .shiftOutwards(points.waistbandTopRightNotch, sa)
                .shift(
                  points.waistbandBottomRightNotch.angle(points.waistbandTopRightNotch) + 90,
                  1
                )
            )
          }
          paths.sa = paths.waistbandSeam
            .split(points.waistbandBottomRightNotch)[1]
            .split(points.waistbandBottomRight)[0]
            .offset(sa)
            .line(points.waistbandSaBottomRight)
            .line(points.waistbandSaTopRight)
            .join(
              paths.waistbandSeam
                .split(points.waistbandTopRight)[1]
                .split(points.waistbandTopRightNotch)[0]
                .offset(sa)
            )
            .line(points.saWaistbandTopRightNotch)
            .line(points.saWaistbandFishtailRight)
            .line(points.saWaistbandBottomMidNotch)
            .close()
            .attr('class', 'fabric sa')
        } else {
          points.saWaistbandBottomMid = points.waistbandBottomMid.translate(-sa, sa)
          points.saWaistbandTopMid = points.waistbandTopMid.translate(-sa, -sa)

          paths.sa = paths.waistbandSeam
            .split(points.waistbandBottomMid)[1]
            .split(points.waistbandBottomRight)[0]
            .line(points.waistbandBottomRightEx)
            .offset(sa)
            .line(points.waistbandSaBottomRight)
            .line(points.waistbandSaTopRight)
            .join(
              paths.waistbandSeam
                .split(points.waistbandTopRight)[1]
                .split(points.waistbandTopMid)[0]
                .offset(sa)
            )
            .line(points.saWaistbandTopMid)
            .line(points.saWaistbandBottomMid)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
