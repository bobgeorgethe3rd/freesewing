import { pctBasedOn } from '@freesewing/core'
import { beltLoops as draftBeltLoops } from '@freesewing/beltloops'
import { leg } from './leg.mjs'

export const beltLoops = {
  name: 'heleanor.beltLoops',
  after: leg,
  options: {
    //Imported
    ...draftBeltLoops.options,
    //Style
    beltLoopType: { dflt: 'default', list: ['trouser', 'default', 'none'], menu: 'style' },
    beltLoopNumber: { count: 5, min: 3, max: 10, menu: 'style' }, //Altered for Heleanor
    beltLoopWidth: {
      pct: 1.9,
      min: 1,
      max: 2.5,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'style',
    },
  },
  draft: (sh) => {
    //draft
    const {
      macro,
      points,
      Point,
      paths,
      Path,
      options,
      absoluteOptions,
      sa,
      store,
      complete,
      part,
    } = sh

    if (options.beltLoopType == 'none') {
      part.hide()
      return part
    }

    let titleCutNum
    if (options.beltLoopType == 'trouser') {
      let beltLoopSa = sa
      if (sa == 0) {
        beltLoopSa = 10
      }
      titleCutNum = 1
      store.set('beltLoopLength', absoluteOptions.waistbandWidth * 2 + beltLoopSa)
      store.set('beltLoopWidth', absoluteOptions.beltLoopWidth)

      draftBeltLoops.draft(sh)
    } else {
      //measurements
      const beltLoopWidth = absoluteOptions.waistbandWidth
      const beltLoopLength =
        (store.get('waistbandLength') - store.get('seatGussetTopWidth') * 4) * 0.25
      titleCutNum = 4
      //let's begin
      points.origin = new Point(0, 0)
      points.bottomRight = new Point(beltLoopLength / 2, beltLoopWidth / 2)
      points.topRight = points.bottomRight.flipY()
      points.topLeft = points.topRight.flipX()
      points.bottomLeft = points.bottomRight.flipX()

      paths.seam = new Path()
        .move(points.topLeft)
        .line(points.bottomLeft)
        .line(points.bottomRight)
        .line(points.topRight)
        .line(points.topLeft)
        .close()

      if (complete) {
        //grainline
        points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        //title
        points.title = new Point(points.topRight.x / 2, points.origin.y)
        if (sa) {
          points.saBottomRight = points.bottomRight.translate(sa, sa)
          points.saTopRight = points.saBottomRight.flipY()
          points.saTopLeft = points.saTopRight.flipX()
          points.saBottomLeft = points.saTopLeft.flipY()

          paths.sa = new Path()
            .move(points.saTopLeft)
            .line(points.saBottomLeft)
            .line(points.saBottomRight)
            .line(points.saTopRight)
            .line(points.saTopLeft)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    if (complete) {
      macro('title', {
        nr: 6,
        title: 'Belt Loops',
        at: points.title,
        cutNr: titleCutNum,
        scale: 0.1,
      })
    }

    return part
  },
}
