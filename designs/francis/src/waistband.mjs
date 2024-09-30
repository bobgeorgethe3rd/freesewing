import { waistband as waistbandStraight } from '@freesewing/waistbandstraight'
import { waistband as waistbandCurved } from '@freesewing/waistbandcurved'
import { leg } from './leg.mjs'

export const waistband = {
  name: 'francis.waistband',
  options: {
    //Imported
    ...waistbandStraight.options,
    ...waistbandCurved.options,
    //Constants
    useVoidStores: false, //Locked for Francis
    waistbandOverlap: 0, //Locked for Francis
    waistbandOverlapSide: 'left', //Locked for Francis
    closurePosition: 'back', //Locked for Francis
    //Style
    waistbandFolded: { bool: true, menu: 'style' }, //Altered for Francis
  },
  after: [leg],
  plugins: [...waistbandStraight.plugins, ...waistbandCurved.plugins],
  draft: (sh) => {
    const {
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
      Snippet,
      absoluteOptions,
    } = sh

    store.set('waistbandMaxButtons', 0)

    if (options.waistbandStyle == 'none') {
      part.hide()
      return part
    } else {
      const panelWidth = store.get('panelWidth')
      const waistbandWidth = store.get('waistbandWidth')
      if (options.waistbandStyle == 'straight') {
        waistbandStraight.draft(sh)
        if (complete) {
          if (options.beltLoopType == 'none') {
            points.eyelet1 = points.waistbandBottomMid
              .translate(panelWidth / 3, -waistbandWidth / 2)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
          }
          if (options.hoseEyelets) {
            points.hoseEylet2 = points.waistbandBottomMid
              .shiftTowards(points.waistbandBottomRightNotch, panelWidth / 2)
              .shiftFractionTowards(points.waistbandBottomRightNotch, 0.5)
              .translate(measurements.waist / -79.5, -waistbandWidth / 4)
              .attr('data-circle', 2.5)
              .attr('data-circle-class', 'mark dotted stroke-lg')
            points.hoseEylet3 = points.waistbandBottomMid
              .shiftTowards(points.waistbandBottomRightNotch, panelWidth / 2)
              .shiftFractionTowards(points.waistbandBottomRightNotch, 0.5)
              .translate(measurements.waist / 79.5, -waistbandWidth / 4)
              .attr('data-circle', 2.5)
              .attr('data-circle-class', 'mark dotted stroke-lg')
          }
        }
      } else {
        waistbandCurved.draft(sh)
        if (complete) {
          if (options.beltLoopType == 'none') {
            points.eyelet1 = paths.waistbandBottomCurve
              .split(points.waistbandBottomMid)[1]
              .shiftAlong(panelWidth / 3)
              .shiftTowards(points.waistbandOrigin, waistbandWidth / 2)
              .attr('data-circle', 3.4)
              .attr('data-circle-class', 'mark dotted stroke-lg')
          }
          if (options.hoseEyelets) {
            points.waistbandBottomSplit = paths.waistbandBottomCurve
              .split(
                paths.waistbandBottomCurve
                  .split(points.waistbandBottomMid)[1]
                  .shiftAlong(panelWidth / 2)
              )[1]
              .split(points.waistbandBottomRightNotch)[0]
              .shiftFractionAlong(0.5)
            points.hoseEylet2 = paths.waistbandBottomCurve
              .split(points.waistbandBottomSplit)[0]
              .reverse()
              .shiftAlong(measurements.waist / 79.5)
              .shiftTowards(points.waistbandOrigin, waistbandWidth / 4)
              .attr('data-circle', 2.5)
              .attr('data-circle-class', 'mark dotted stroke-lg')
            points.hoseEylet3 = paths.waistbandBottomCurve
              .split(points.waistbandBottomSplit)[1]
              .shiftAlong(measurements.waist / 79.5)
              .shiftTowards(points.waistbandOrigin, waistbandWidth / 4)
              .attr('data-circle', 2.5)
              .attr('data-circle-class', 'mark dotted stroke-lg')
          }
        }
      }
    }

    if (complete) {
      //title
      let titleCutNum = 2
      if (options.waistbandFolded || options.waistbandStyle == 'curved') titleCutNum = 1
      macro('title', {
        nr: 4,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        at: points.title,
        cutNr: titleCutNum,
        scale: 1 / 3,
      })
      //eyelets
      if (options.beltLoopType == 'none') {
        points.eyelet0 = points.eyelet1
          .flipX()
          .attr('data-circle', 3.4)
          .attr('data-circle-class', 'mark dotted stroke-lg')
      }
      if (options.hoseEyelets) {
        points.hoseEylet0 = points.hoseEylet2
          .flipX()
          .attr('data-circle', 2.5)
          .attr('data-circle-class', 'mark dotted stroke-lg')
        points.hoseEylet1 = points.hoseEylet3
          .flipX()
          .attr('data-circle', 2.5)
          .attr('data-circle-class', 'mark dotted stroke-lg')
      }
      //paths
      paths.waistbandLeft.attr('data-text', 'side', true)
      paths.waistbandRight.attr('data-text', 'side', true)
    }
    return part
  },
}
