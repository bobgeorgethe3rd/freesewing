import { waistband as draftWaistbandStraight } from '@freesewing/waistbandstraight'
import { frontBase } from './frontBase.mjs'
import { flyShield } from './flyShield.mjs'

export const waistbandStraightLeft = {
  name: 'theobald.waistbandStraightLeft',
  from: draftWaistbandStraight,
  after: [frontBase, flyShield],
  hide: {
    from: true,
  },
  options: {
    //Constants
    waistbandClosurePosition: 'front', //locked for Theobald
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
    if (options.waistbandStyle != 'straight') {
      part.hide()
      return part
    }
    //removing paths and snippets not required from from
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //remove macros
    macro('title', false)
    //measurements
    let waistbandWidth = absoluteOptions.waistbandWidth

    //let's begin

    if (options.waistbandFishtail) {
      points.fishtailEx = points.bottomLeftNotch.translate(
        store.get('waistbandFishtailOffset'),
        -waistbandWidth
      )
    }

    const drawSeam = () => {
      if (options.waistbandFishtail)
        return new Path()
          .move(points.bottomLeftEx)
          .line(points.bottomLeftNotch)
          .line(points.fishtailEx)
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
    }

    //paths
    paths.seam = drawSeam()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topLeftNotch, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
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
      points.title = points.topLeftNotch
        .shiftFractionTowards(points.topLeft, 0.25)
        .shift(-90, waistbandWidth / 2)
      macro('title', {
        nr: 10,
        title: 'Waistband ' + titleName + utils.capitalize(options.waistbandStyle) + ' Left',
        at: points.title,
        scale: 1 / 3,
      })
      //buttons and buttonholes

      //paths
      if (points.bottomLeft.dist(points.bottomLeftEx) > 0) {
        paths.leftEx = new Path()
          .move(points.topLeft)
          .line(points.bottomLeft)
          .attr('class', 'various')
          .attr('data-text', 'Centre Front')
          .attr('data-text-class', 'center')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['topLeft', 'bottomLeft'],
        })
      }

      if (!options.waistbandFishtail) {
        paths.left = new Path()
          .move(points.topLeftNotch)
          .line(points.bottomLeftNotch)
          .attr('class', 'various')
          .attr('data-text', 'Side Seam')
          .attr('data-text-class', 'center')
      }

      if (options.waistbandFolded) {
        let foldlineTo
        if (options.waistbandFishtail) {
          foldlineTo = points.fishtailEx
        } else {
          foldlineTo = new Point(points.topMid.x, points.topRightEx.y / 2)
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
