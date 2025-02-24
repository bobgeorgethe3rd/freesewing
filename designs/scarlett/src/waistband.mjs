import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { skirtBase } from './skirtBase.mjs'
import { swingPanel } from './swingPanel.mjs'
import { placket } from './placket.mjs'

export const waistband = {
  name: 'scarlett.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Style
    waistbandOverlapSide: {
      dflt: 'right',
      list: ['right', 'left'],
      menu: 'style',
    }, //Altered for Scarlett
    waistbandFolded: { bool: true, menu: 'style' }, //Altered for Scarlett
  },
  after: [skirtBase, swingPanel, placket],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      utils,
      options,
      measurements,
      snippets,
      Snippet,
      store,
      complete,
      part,
    } = sh
    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips)
        waistbandStraight.draft(sh)
      else waistbandCurved.draft(sh)
    }
    //measurements
    const waistbandWidth = store.get('waistbandWidth')
    const bottomLength = paths.waistbandBottomCurve ? paths.waistbandBottomCurve.length() : 0
    const topLength = paths.waistbandTopCurve ? paths.waistbandTopCurve.length() : 0
    const width = topLength > bottomLength ? waistbandWidth * -1 : waistbandWidth
    let markingOffset = store.get('swingWaisbandLength')
    if (options.waistbandOverlapSide == 'right') markingOffset = markingOffset * -1
    //let's begin
    if (complete) {
      //title
      let titleCutNum = 2
      if (options.waistbandFolded || options.waistbandStyle == 'curved') titleCutNum = 1
      macro('title', {
        at: points.title,
        nr: 8,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        cutNr: titleCutNum,
        scale: 0.25,
      })

      if (options.closurePosition == 'front') {
        if (paths.waistbandLeftEx) paths.waistbandLeftEx.attr('data-text', 'Side Front', true)
        if (paths.waistbandRightEx) paths.waistbandRightEx.attr('data-text', 'Side Front', true)
        if (
          options.waistbandStyle == 'straight' ||
          !measurements.waistToHips ||
          !measurements.hips
        ) {
          points.waistbandBottomLeftNotch = points.waistbandBottomLeftNotch.shift(0, markingOffset)
          points.waistbandBottomMidNotch = points.waistbandBottomMidNotch.shift(0, markingOffset)
          points.waistbandBottomRightNotch = points.waistbandBottomRightNotch.shift(
            0,
            markingOffset
          )
          points.waistbandTopLeftNotch = points.waistbandTopLeftNotch.shift(0, markingOffset)
          points.waistbandTopMidNotch = points.waistbandTopMidNotch.shift(0, markingOffset)
          points.waistbandTopRightNotch = points.waistbandTopRightNotch.shift(0, markingOffset)
          points.sideFrontBottom =
            options.waistbandOverlapSide == 'right'
              ? points.waistbandBottomRight.shift(0, markingOffset * 2)
              : points.waistbandBottomLeft.shift(0, markingOffset * 2)
          points.sideFrontTop = new Point(points.sideFrontBottom.x, points.waistbandTopLeft.y)
        } else {
          points.waistbandBottomLeftNotch = paths.waistbandBottomCurve.shiftAlong(
            bottomLength * 0.25 + markingOffset
          )
          points.waistbandBottomMidNotch = paths.waistbandBottomCurve.shiftAlong(
            bottomLength * 0.5 + markingOffset
          )
          points.waistbandBottomRightNotch = paths.waistbandBottomCurve.shiftAlong(
            bottomLength * 0.75 + markingOffset
          )
          points.waistbandTopLeftNotch = points.waistbandBottomLeftNotch.shiftTowards(
            points.waistbandOrigin,
            width
          )
          points.waistbandTopMidNotch = points.waistbandBottomMidNotch.shiftTowards(
            points.waistbandOrigin,
            width
          )
          points.waistbandTopRightNotch = points.waistbandBottomRightNotch.shiftTowards(
            points.waistbandOrigin,
            width
          )
          points.sideFrontBottom =
            options.waistbandOverlapSide == 'right'
              ? paths.waistbandBottomCurve.shiftAlong(bottomLength + markingOffset * 2)
              : paths.waistbandBottomCurve.shiftAlong(markingOffset * 2)
          points.sideFrontTop = points.sideFrontBottom.shiftTowards(points.waistbandOrigin, width)
        }
        paths.waistbandLeft = new Path()
          .move(points.waistbandTopLeftNotch)
          .line(points.waistbandBottomLeftNotch)
          .attr('class', 'various')
          .attr('data-text', 'Side Seam')
          .attr('data-text-class', 'center')

        paths.waistbandMid = new Path()
          .move(points.waistbandTopMidNotch)
          .line(points.waistbandBottomMidNotch)
          .attr('class', 'various')
          .attr('data-text', 'Centre Back')
          .attr('data-text-class', 'center')

        paths.waistbandRight = new Path()
          .move(points.waistbandTopRightNotch)
          .line(points.waistbandBottomRightNotch)
          .attr('class', 'various')
          .attr('data-text', 'Side Seam')
          .attr('data-text-class', 'center')

        paths.sideFront = new Path()
          .move(points.sideFrontTop)
          .line(points.sideFrontBottom)
          .attr('class', 'various')
          .attr('data-text', 'Side Front')
          .attr('data-text-class', 'center')

        macro('sprinkle', {
          snippet: 'notch',
          on: [
            'waistbandBottomLeftNotch',
            'waistbandBottomMidNotch',
            'waistbandBottomRightNotch',
            'waistbandTopLeftNotch',
            'waistbandTopMidNotch',
            'waistbandTopRightNotch',
            'sideFrontBottom',
            'sideFrontTop',
          ],
        })
      }

      if (options.waistbandStyle == 'straight' || !measurements.waistToHips || !measurements.hips) {
        //pleat lines & buttons
        if (options.closurePosition == 'front') {
          points.pleatFrom0 = points.waistbandTopLeftNotch.shiftFractionTowards(
            points.waistbandTopMidNotch,
            0.5
          )
          points.pleatFrom1 = points.waistbandTopMidNotch.shiftFractionTowards(
            points.waistbandTopRightNotch,
            0.5
          )
        }
        if (options.closurePosition == 'back') {
          points.pleatFrom0 = points.waistbandTopLeft.shiftFractionTowards(
            points.waistbandTopLeftNotch,
            0.5
          )
          points.pleatFrom1 = points.waistbandTopRightNotch.shiftFractionTowards(
            points.waistbandTopRight,
            0.5
          )
        }
        if (options.closurePosition == 'sideRight') {
          points.pleatFrom0 = points.waistbandTopRightNotch.shiftFractionTowards(
            points.waistbandTopMidNotch,
            0.5
          )
          points.pleatFrom1 = points.waistbandTopRightNotch.shiftFractionTowards(
            points.waistbandTopRight,
            0.5
          )
        }
        if (options.closurePosition == 'sideLeft') {
          points.pleatFrom0 = points.waistbandTopLeft.shiftFractionTowards(
            points.waistbandTopLeftNotch,
            0.5
          )
          points.pleatFrom1 = points.waistbandTopLeftNotch.shiftFractionTowards(
            points.waistbandTopMidNotch,
            0.5
          )
        }
        for (let i = 0; i < 2; i++) {
          points['pleatTo' + i] = new Point(points['pleatFrom' + i].x, points.waistbandBottomLeft.y)
        }
      } else {
        //pleat lines & buttons
        if (options.closurePosition == 'front') {
          points.pleatTo0 = paths.waistbandBottomCurve.shiftAlong(
            bottomLength * (3 / 8) + markingOffset
          )
          points.pleatTo1 = paths.waistbandBottomCurve.shiftAlong(
            bottomLength * (5 / 8) + markingOffset
          )
        }
        if (options.closurePosition == 'back') {
          points.pleatTo0 = paths.waistbandBottomCurve.shiftFractionAlong(1 / 8)
          points.pleatTo1 = paths.waistbandBottomCurve.shiftFractionAlong(7 / 8)
        }
        if (options.closurePosition == 'sideRight') {
          points.pleatTo0 = paths.waistbandBottomCurve.shiftFractionAlong(5 / 8)
          points.pleatTo1 = paths.waistbandBottomCurve.shiftFractionAlong(7 / 8)
        }
        if (options.closurePosition == 'sideLeft') {
          points.pleatTo0 = paths.waistbandBottomCurve.shiftFractionAlong(1 / 8)
          points.pleatTo1 = paths.waistbandBottomCurve.shiftFractionAlong(3 / 8)
        }
        for (let i = 0; i < 2; i++) {
          if (points.waistbandOrigin < points.waistbandBottomMid) {
            points['pleatFrom' + i] = points.waistbandOrigin.shiftOutwards(
              points['pleatTo' + i],
              points.waistbandTopMid.dist(points.waistbandBottomMid)
            )
          } else {
            points['pleatFrom' + i] = points['pleatTo' + i].shiftTowards(
              points.waistbandOrigin,
              points.waistbandTopMid.dist(points.waistbandBottomMid)
            )
          }
        }
      }

      for (let i = 0; i < 2; i++) {
        paths['pleatStart' + i] = new Path()
          .move(points['pleatFrom' + i])
          .line(points['pleatTo' + i])
          .attr('class', 'mark')
          .attr('data-text', 'Pleats Start')
          .attr('data-text-class', 'center')
      }
    }
    return part
  },
}
