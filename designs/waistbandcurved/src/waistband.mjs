import { pluginBundle } from '@freesewing/plugin-bundle'

export const waistband = {
  name: 'waistbandscurved.waistband',
  options: {
    //Constants
    useVoidStores: true,
    //Style
    waistbandOverlapSide: { dflt: 'left', list: ['left', 'right'], menu: 'style' },
    waistbandOverlap: { pct: 0, min: 0, max: 15, menu: 'style' },
    //Construction
    closurePosition: {
      dflt: 'back',
      list: ['back', 'sideLeft', 'sideRight', 'front'],
      menu: 'construction',
    },
  },
  plugins: [pluginBundle],
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
    log,
  }) => {
    //void 	measures
    if (options.useVoidStores) {
      void store.setIfUnset('waistbandLength', 900)
      void store.setIfUnset('waistbandLengthTop', store.get('waistbandLength') * 0.98)
      void store.setIfUnset('waistbandWidth', 50)
      void store.setIfUnset('placketWidth', 40)
    } else {
      void store.setIfUnset('placketWidth', 0)
    }
    void store.setIfUnset('waistbandBack', store.get('waistbandLength') * 0.5)
    void store.setIfUnset(
      'waistbandOverlap',
      store.get('waistbandLength') * options.waistbandOverlap
    )

    //clashing protection
    if (store.get('waistbandLength') == store.get('waistbandLengthTop')) {
      part.hide()
      log.info(
        'Curved Waistband unavailable due to waistbandLength & waistbandLengthTop being the same'
      )
      return part
    }

    const length = store.get('waistbandLength')
    const lengthTop = store.get('waistbandLengthTop')
    const widthStatic = store.get('waistbandWidth')
    let width
    if (lengthTop > length) {
      width = widthStatic * -1
    } else width = widthStatic

    const widthHalf = widthStatic / 2
    //^ Adds support for it lengthTop is greater

    const lengthBack = store.get('waistbandBack')
    const waistbandOverlap = store.get('waistbandOverlap')
    const placketWidth = store.get('placketWidth')

    let leftExtension
    let rightExtension
    if (options.waistbandOverlapSide == 'right') {
      leftExtension = placketWidth
      rightExtension = waistbandOverlap
      void store.setIfUnset('maxButtons', rightExtension)
    } else {
      leftExtension = waistbandOverlap
      rightExtension = placketWidth
      void store.setIfUnset('maxButtons', leftExtension)
    }
    const maxButtons = store.get('maxButtons')

    const angleRads = (length - lengthTop) / widthStatic
    const radius = length / angleRads
    const angleDegs = utils.rad2deg(angleRads)

    const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angleDegs / 8))

    //begins
    points.bottomMid = new Point(0, 0)
    points.origin = points.bottomMid.shift(90, radius)
    points.bottomLeft = points.bottomMid.rotate(angleDegs / -2, points.origin)
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)
    points.topLeft = points.bottomLeft.shiftTowards(points.origin, width)
    points.topRight = points.bottomRight.shiftTowards(points.origin, width)
    points.topMid = points.bottomMid.shiftTowards(points.origin, width)

    //control points
    points.bottomLeftCp2 = points.bottomLeft
      .shiftTowards(points.topLeft, cpDistance)
      .rotate(-90, points.bottomLeft)
    points.bottomMidCp1 = points.bottomMid
      .shiftTowards(points.topMid, cpDistance)
      .rotate(90, points.bottomMid)
    points.bottomMidCp2 = points.bottomMidCp1.flipX(points.bottomMid)
    points.bottomRightCp1 = points.bottomLeftCp2.flipX(points.bottomMid)
    points.topRightCp2 = points.bottomRightCp1.shiftTowards(points.origin, width)
    points.topMidCp1 = points.bottomMidCp2.shiftTowards(points.origin, width)
    points.topMidCp2 = points.topMidCp1.flipX(points.bottomMid)
    points.topLeftCp1 = points.topRightCp2.flipX(points.bottomMid)

    //extensions
    points.bottomLeftEx = points.bottomLeft
      .shiftTowards(points.topLeft, leftExtension)
      .rotate(90, points.bottomLeft)
    points.topLeftEx = points.topLeft
      .shiftTowards(points.bottomLeft, leftExtension)
      .rotate(-90, points.topLeft)

    points.bottomRightEx = points.bottomRight
      .shiftTowards(points.topRight, rightExtension)
      .rotate(-90, points.bottomRight)
    points.topRightEx = points.topRight
      .shiftTowards(points.bottomRight, rightExtension)
      .rotate(90, points.topRight)

    //paths
    paths.bottomCurve = new Path()
      .move(points.bottomLeft)
      .curve(points.bottomLeftCp2, points.bottomMidCp1, points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomRightCp1, points.bottomRight)
      .hide()

    paths.topCurve = new Path()
      .move(points.topRight)
      .curve(points.topRightCp2, points.topMidCp1, points.topMid)
      .curve(points.topMidCp2, points.topLeftCp1, points.topLeft)
      .hide()

    paths.seam = paths.bottomCurve
      .clone()
      .line(points.bottomRightEx)
      .line(points.topRightEx)
      .line(points.topRight)
      .join(paths.topCurve)
      .line(points.topLeftEx)
      .line(points.bottomLeftEx)
      .line(points.bottomLeft)
      .close()
      .unhide()

    //notches
    let centreName
    let leftName
    let rightName
    let exName
    if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
      if (options.closurePosition == 'sideRight') {
        points.bottomMidNotch = paths.bottomCurve.reverse().shiftAlong(lengthBack)
        points.bottomLeftNotch = paths.bottomCurve.shiftAlong((length - lengthBack) / 2)
        points.bottomRightNotch = paths.bottomCurve.reverse().shiftAlong(lengthBack / 2)
        leftName = 'Centre Front'
        rightName = 'Centre Back'
      } else {
        points.bottomMidNotch = paths.bottomCurve.shiftAlong(lengthBack)
        points.bottomLeftNotch = paths.bottomCurve.shiftAlong(lengthBack / 2)
        points.bottomRightNotch = paths.bottomCurve.reverse().shiftAlong((length - lengthBack) / 2)
        leftName = 'Centre Back'
        rightName = 'Centre Front'
      }
      centreName = 'Side Seam'
      exName = centreName
    } else {
      if (options.closurePosition == 'back') {
        points.bottomLeftNotch = paths.bottomCurve.shiftAlong(lengthBack / 2)
        centreName = 'Centre Front'
        exName = 'Centre Back'
      }
      if (options.closurePosition == 'front') {
        points.bottomLeftNotch = paths.bottomCurve.shiftAlong((length - lengthBack) / 2)
        centreName = 'Centre Back'
        exName = 'Centre Front'
      }
      points.bottomRightNotch = points.bottomLeftNotch.flipX(points.bottomMid)
      points.bottomMidNotch = points.bottomMid
      leftName = 'Side Seam'
      rightName = 'Side Seam'
    }
    points.topLeftNotch = points.bottomLeftNotch.shiftTowards(points.origin, width)
    points.topRightNotch = points.bottomRightNotch.shiftTowards(points.origin, width)
    points.topMidNotch = points.bottomMidNotch.shiftTowards(points.origin, width)

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.topMidCp2.x / 4, points.topMid.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.x)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.grainlineFrom
        .shiftFractionTowards(points.topMid, 0.25)
        .shift(-90, widthHalf)
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Waistband',
        scale: 1 / 3,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: [
          'bottomLeftNotch',
          'bottomRightNotch',
          'bottomMidNotch',
          'topLeftNotch',
          'topRightNotch',
          'topMidNotch',
        ],
      })
      //paths
      if (leftExtension > 0) {
        paths.leftEx = new Path()
          .move(points.topLeft)
          .line(points.bottomLeft)
          .attr('class', 'various')
          .attr('data-text', exName)
          .attr('data-text-class', 'center')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['topLeft', 'bottomLeft'],
        })
      }
      if (rightExtension > 0) {
        paths.rightEx = new Path()
          .move(points.topRight)
          .line(points.bottomRight)
          .attr('class', 'various')
          .attr('data-text', exName)
          .attr('data-text-class', 'center')
        macro('sprinkle', {
          snippet: 'notch',
          on: ['topRight', 'bottomRight'],
        })
      }

      paths.mid = new Path()
        .move(points.topMidNotch)
        .line(points.bottomMidNotch)
        .attr('class', 'various')
        .attr('data-text', centreName)
        .attr('data-text-class', 'center')

      paths.left = new Path()
        .move(points.topLeftNotch)
        .line(points.bottomLeftNotch)
        .attr('class', 'various')
        .attr('data-text', leftName)
        .attr('data-text-class', 'center')

      paths.right = new Path()
        .move(points.topRightNotch)
        .line(points.bottomRightNotch)
        .attr('class', 'various')
        .attr('data-text', rightName)
        .attr('data-text-class', 'center')
      //buttons & buttonholes
      if (options.waistbandOverlapSide == 'right') {
        if (leftExtension > 0) {
          points.buttonPlacket = points.bottomLeft.shiftFractionTowards(points.topLeftEx, 0.5)
          points.buttonholePlacket = paths.bottomCurve
            .reverse()
            .shiftAlong(widthStatic / 2)
            .shiftTowards(points.origin, width / 2)
        }
        if (rightExtension > widthStatic) {
          for (let i = 0; i < maxButtons; i++) {
            if (rightExtension > widthStatic * (i + 1)) {
              points['buttonholeOverlap' + i] = points.bottomRightEx
                .shiftTowards(points.bottomRight, widthHalf + widthStatic * i)
                .shift(points.bottomRight.angle(points.topRight), widthHalf)
              points['buttonOverlap' + i] = paths.bottomCurve
                .shiftAlong(waistbandOverlap - (widthHalf + widthStatic * i))
                .shiftTowards(points.origin, width / 2)
              snippets['buttonholeOverlap' + i] = new Snippet(
                'buttonhole',
                points['buttonholeOverlap' + i]
              ).attr('data-rotate', points.bottomRight.angle(points.topRight) * -1)
              snippets['buttonOverlap' + i] = new Snippet(
                'button',
                points['buttonOverlap' + i]
              ).attr('data-rotate', points['buttonOverlap' + i].angle(points.origin) * -1)
            }
          }
        }
      } else {
        if (rightExtension > 0) {
          points.buttonPlacket = points.bottomRight.shiftFractionTowards(points.topRightEx, 0.5)
          points.buttonholePlacket = paths.bottomCurve
            .shiftAlong(widthStatic / 2)
            .shiftTowards(points.origin, width / 2)
          if (leftExtension > widthStatic) {
            for (let i = 0; i < maxButtons; i++) {
              if (leftExtension > widthStatic * (i + 1)) {
                points['buttonholeOverlap' + i] = points.bottomLeftEx
                  .shiftTowards(points.bottomLeft, widthHalf + widthStatic * i)
                  .shift(points.bottomRight.angle(points.topRight), widthHalf)
                points['buttonOverlap' + i] = paths.bottomCurve
                  .reverse()
                  .shiftAlong(waistbandOverlap - (widthHalf + widthStatic * i))
                  .shiftTowards(points.origin, width / 2)
                snippets['buttonholeOverlap' + i] = new Snippet(
                  'buttonhole',
                  points['buttonholeOverlap' + i]
                ).attr('data-rotate', points.bottomLeft.angle(points.topLeft) * -1)
                snippets['buttonOverlap' + i] = new Snippet(
                  'button',
                  points['buttonOverlap' + i]
                ).attr('data-rotate', points['buttonOverlap' + i].angle(points.origin) * -1)
              }
            }
          }
        }
      }
      if (points.buttonholePlacket) {
        snippets.buttonholePlacket = new Snippet('buttonhole', points.buttonholePlacket).attr(
          'data-rotate',
          points.buttonholePlacket.angle(points.origin) * -1
        )
        snippets.buttonPlacket = new Snippet('button', points.buttonPlacket).attr(
          'data-rotate',
          points.buttonPlacket.angle(points.origin) * -1
        )
      }
      if (sa) {
        points.saBottomLeft = points.bottomLeftEx
          .shift(points.bottomLeftCp2.angle(points.bottomLeft), sa)
          .shift(points.topLeft.angle(points.bottomLeft), sa)

        points.saBottomRight = points.bottomRightEx
          .shift(points.bottomRightCp1.angle(points.bottomRight), sa)
          .shift(points.topRight.angle(points.bottomRight), sa)

        points.saTopRight = points.topRightEx
          .shift(points.topRightCp2.angle(points.topRight), sa)
          .shift(points.bottomRight.angle(points.topRight), sa)

        points.saTopLeft = points.topLeftEx
          .shift(points.topLeftCp1.angle(points.topLeft), sa)
          .shift(points.bottomLeft.angle(points.topLeft), sa)

        paths.sa = new Path()
          .move(points.saBottomLeft)
          .line(paths.bottomCurve.offset(sa).start())
          .join(paths.bottomCurve.offset(sa))
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(paths.topCurve.offset(sa).start())
          .join(paths.topCurve.offset(sa))
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
