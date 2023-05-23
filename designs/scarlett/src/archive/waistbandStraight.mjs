import { swingPanel } from './swingPanel.mjs'
import { placket } from './placket.mjs'
import { waistband as draftWaistbandStraight } from '@freesewing/waistbandstraight'

export const waistbandStraight = {
  name: 'scarlett.waistbandStraight',
  after: [swingPanel, placket],
  from: draftWaistbandStraight,
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
    Snippet,
    absoluteOptions,
    log,
  }) => {
    //Set Render
    if (
      (options.waistbandStyle != 'straight' && measurements.waistToHips && measurements.hips) ||
      options.waistbandStyle == 'none'
    ) {
      part.hide()
      return part
    }

    if (complete) {
      //title
      macro('title', {
        at: points.title,
        nr: 9,
        title: 'Waistband ' + utils.capitalize(options.waistbandStyle),
        scale: 1 / 3,
      })
      //pleat lines & buttons
      const buttonWidth = store.get('waistbandWidth') / 2
      const buttonLength = store.get('swingWaisbandLength') - buttonWidth
      if (options.waistbandClosurePosition == 'front') {
        points.pleatFrom0 = points.topLeftNotch.shiftFractionTowards(points.topMidNotch, 0.5)
        points.pleatFrom1 = points.topMidNotch.shiftFractionTowards(points.topRightNotch, 0.5)
        if (options.swingPanelStyle != 'none') {
          points.swingButton0 = points.bottomLeft.translate(buttonLength, -buttonWidth)
          points.swingButton1 = points.bottomRight.translate(-buttonLength, -buttonWidth)
        }
      }
      if (options.waistbandClosurePosition == 'back') {
        points.pleatFrom0 = points.topLeft.shiftFractionTowards(points.topLeftNotch, 0.5)
        points.pleatFrom1 = points.topRightNotch.shiftFractionTowards(points.topRight, 0.5)
        if (options.swingPanelStyle == 'separate') {
          points.swingButton0 = points.bottomMidNotch.translate(-buttonLength, -buttonWidth)
          points.swingButton1 = points.bottomMidNotch.translate(buttonLength, -buttonWidth)
        }
      }
      if (options.waistbandClosurePosition == 'sideRight') {
        points.pleatFrom0 = points.topRightNotch.shiftFractionTowards(points.topMidNotch, 0.5)
        points.pleatFrom1 = points.topRightNotch.shiftFractionTowards(points.topRight, 0.5)
        if (options.swingPanelStyle == 'separate') {
          points.swingButton0 = points.bottomLeftNotch.translate(-buttonLength, -buttonWidth)
          points.swingButton1 = points.bottomLeftNotch.translate(buttonLength, -buttonWidth)
        }
      }
      if (options.waistbandClosurePosition == 'sideLeft') {
        points.pleatFrom0 = points.topLeft.shiftFractionTowards(points.topLeftNotch, 0.5)
        points.pleatFrom1 = points.topLeftNotch.shiftFractionTowards(points.topMidNotch, 0.5)
        if (options.swingPanelStyle == 'separate') {
          points.swingButton0 = points.bottomRightNotch.translate(-buttonLength, -buttonWidth)
          points.swingButton1 = points.bottomRightNotch.translate(buttonLength, -buttonWidth)
        }
      }
      points.pleatTo0 = new Point(points.pleatFrom0.x, points.bottomLeft.y)
      points.pleatTo1 = new Point(points.pleatFrom1.x, points.bottomLeft.y)

      for (let i = 0; i < 2; i++) {
        paths['pleatStart' + i] = new Path()
          .move(points['pleatFrom' + i])
          .line(points['pleatTo' + i])
          .attr('class', 'mark')
          .attr('data-text', 'Pleats Start')
          .attr('data-text-class', 'center')
      }

      if (points.swingButton0) {
        macro('sprinkle', {
          snippet: 'button',
          on: ['swingButton0', 'swingButton1'],
        })
        if (options.waistbandFolded) {
          points.swingButton0F = points.swingButton0.flipY(points.flipAnchor)
          points.swingButton1F = points.swingButton1.flipY(points.flipAnchor)
          macro('sprinkle', {
            snippet: 'button',
            on: ['swingButton0F', 'swingButton1F'],
          })
        }
      }
    }

    return part
  },
}
