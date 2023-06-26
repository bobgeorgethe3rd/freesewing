import { pluginBundle } from '@freesewing/plugin-bundle'

export const waistband = {
  name: 'waistbandstraight.waistband',
  options: {
    //Constants
    useVoidStores: true,
    //Style
    waistbandFolded: { bool: false, menu: 'style' },
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
  }) => {
    //measures
    if (options.useVoidStores) {
      void store.setIfUnset('waistbandLength', 900)
      void store.setIfUnset('waistbandWidth', 50)
      void store.setIfUnset('placketWidth', 40)
    } else {
      void store.setIfUnset('placketWidth', 0)
    }
    void store.setIfUnset('waistbandBack', store.get('waistbandLength') * 0.5)
    void store.setIfUnset('overlap', store.get('waistbandLength') * options.waistbandOverlap)

    const length = store.get('waistbandLength')

    let widthMultiplier
    if (options.waistbandFolded) {
      widthMultiplier = 2
    } else widthMultiplier = 1

    const width = store.get('waistbandWidth') * widthMultiplier
    const widthHalf = width / widthMultiplier / 2
    const lengthBack = store.get('waistbandBack')

    const overlap = store.get('overlap')
    const placketWidth = store.get('placketWidth')

    let leftExtension
    let rightExtension
    if (options.waistbandOverlapSide == 'right') {
      leftExtension = placketWidth
      rightExtension = overlap
      void store.setIfUnset('maxButtons', rightExtension)
    } else {
      leftExtension = overlap
      rightExtension = placketWidth
      void store.setIfUnset('maxButtons', leftExtension)
    }
    const maxButtons = store.get('maxButtons')
    //begin
    points.bottomMid = new Point(0, 0)
    points.topMid = points.bottomMid.shift(90, width)
    points.bottomLeft = points.bottomMid.shift(180, length / 2)
    points.bottomRight = points.bottomLeft.flipX(points.bottomMid)
    points.topLeft = new Point(points.bottomLeft.x, points.topMid.y)
    points.topRight = points.topLeft.flipX(points.topMid)

    //extensions
    points.bottomLeftEx = points.bottomLeft.shift(180, leftExtension)
    points.bottomRightEx = points.bottomRight.shift(0, rightExtension)
    points.topLeftEx = new Point(points.bottomLeftEx.x, points.topMid.y)
    points.topRightEx = new Point(points.bottomRightEx.x, points.topMid.y)

    //paths
    paths.seam = new Path()
      .move(points.bottomLeftEx)
      .line(points.bottomRightEx)
      .line(points.topRightEx)
      .line(points.topLeftEx)
      .line(points.bottomLeftEx)
      .close()

    //notches
    let centreName
    let leftName
    let rightName
    let exName
    if (options.closurePosition == 'sideLeft' || options.closurePosition == 'sideRight') {
      if (options.closurePosition == 'sideRight') {
        points.bottomMidNotch = points.bottomRight.shift(180, lengthBack)
        leftName = 'Centre Front'
        rightName = 'Centre Back'
      } else {
        points.bottomMidNotch = points.bottomLeft.shift(0, lengthBack)
        leftName = 'Centre Back'
        rightName = 'Centre Front'
      }
      points.bottomLeftNotch = points.bottomLeft.shiftFractionTowards(points.bottomMidNotch, 0.5)
      points.bottomRightNotch = points.bottomMidNotch.shiftFractionTowards(points.bottomRight, 0.5)
      centreName = 'Side Seam'
      exName = centreName
    } else {
      if (options.closurePosition == 'back') {
        points.bottomLeftNotch = points.bottomLeft.shift(0, lengthBack / 2)
        centreName = 'Centre Front'
        exName = 'Centre Back'
      }
      if (options.closurePosition == 'front') {
        points.bottomLeftNotch = points.bottomMid.shift(180, lengthBack / 2)
        centreName = 'Centre Back'
        exName = 'Centre Front'
      }
      points.bottomRightNotch = points.bottomLeftNotch.flipX(points.bottomMid)
      points.bottomMidNotch = points.bottomMid
      leftName = 'Side Seam'
      rightName = 'Side Seam'
    }

    points.topLeftNotch = new Point(points.bottomLeftNotch.x, points.topMid.y)
    points.topRightNotch = new Point(points.bottomRightNotch.x, points.topMid.y)
    points.topMidNotch = new Point(points.bottomMidNotch.x, points.topMid.y)

    if (complete) {
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
      //grainline
      points.grainlineFrom = points.topLeftNotch.shiftFractionTowards(points.topMidNotch, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomMid.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = points.topLeftNotch
        .shiftFractionTowards(points.topMidNotch, 0.55)
        .shift(-90, widthHalf)
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Waistband',
        scale: 1 / 3,
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

      if (options.waistbandFolded) {
        paths.foldline = new Path()
          .move(new Point(points.topLeftEx.x, points.topLeftEx.y / 2))
          .line(new Point(points.topRightEx.x, points.topRightEx.y / 2))
          .attr('class', 'interfacing')
          .attr('data-text', 'Fold - Line')
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
      points.flipAnchor = points.bottomMid.shiftFractionTowards(points.topMid, 0.5)
      if (options.waistbandOverlapSide == 'right') {
        if (leftExtension > 0) {
          points.buttonPlacket = points.bottomLeftEx
            .shiftFractionTowards(points.bottomLeft, 0.5)
            .shift(90, widthHalf)
          points.buttonholePlacket = points.bottomRight.translate(placketWidth / -2, -widthHalf)

          if (options.waistbandFolded) {
            points.buttonPlacketF = points.buttonPlacket.flipY(points.flipAnchor)
            points.buttonholePlacketF = points.buttonholePlacket.flipY(points.flipAnchor)
          }
        }
        if (rightExtension > width / widthMultiplier) {
          for (let i = 0; i < maxButtons; i++) {
            if (rightExtension > (width / widthMultiplier) * (i + 1)) {
              points['buttonholeOverlap' + i] = points.bottomRightEx.translate(
                -(widthHalf + (width / widthMultiplier) * i),
                -widthHalf
              )
              points['buttonOverlap' + i] = points.bottomLeft.translate(
                overlap - (widthHalf + (width / widthMultiplier) * i),
                -widthHalf
              )
              snippets['buttonholeOverlap' + i] = new Snippet(
                'buttonhole',
                points['buttonholeOverlap' + i]
              ).attr('data-rotate', 90)
              snippets['buttonOverlap' + i] = new Snippet('button', points['buttonOverlap' + i])

              if (options.waistbandFolded) {
                points['buttonholeOverlapF' + i] = points['buttonholeOverlap' + i].flipY(
                  points.flipAnchor
                )
                points['buttonOverlapF' + i] = points['buttonOverlap' + i].flipY(points.flipAnchor)
                snippets['buttonholeOverlapF' + i] = new Snippet(
                  'buttonhole',
                  points['buttonholeOverlapF' + i]
                ).attr('data-rotate', 90)
                snippets['buttonOverlapF' + i] = new Snippet('button', points['buttonOverlapF' + i])
              }
            }
          }
        }
      } else {
        if (rightExtension > 0) {
          points.buttonPlacket = points.bottomRight
            .shiftFractionTowards(points.bottomRightEx, 0.5)
            .shift(90, widthHalf)
          points.buttonholePlacket = points.bottomLeft.translate(placketWidth / 2, -widthHalf)

          if (options.waistbandFolded) {
            points.buttonPlacketF = points.buttonPlacket.flipY(points.flipAnchor)
            points.buttonholePlacketF = points.buttonholePlacket.flipY(points.flipAnchor)
          }
          if (leftExtension > width / widthMultiplier) {
            for (let i = 0; i < maxButtons; i++) {
              if (leftExtension > (width / widthMultiplier) * (i + 1)) {
                points['buttonholeOverlap' + i] = points.bottomLeftEx.translate(
                  widthHalf + (width / widthMultiplier) * i,
                  -widthHalf
                )
                points['buttonOverlap' + i] = points.bottomRight.translate(
                  widthHalf + (width / widthMultiplier) * i - overlap,
                  -widthHalf
                )
                snippets['buttonholeOverlap' + i] = new Snippet(
                  'buttonhole',
                  points['buttonholeOverlap' + i]
                ).attr('data-rotate', 90)
                snippets['buttonOverlap' + i] = new Snippet('button', points['buttonOverlap' + i])

                if (options.waistbandFolded) {
                  points['buttonholeOverlapF' + i] = points['buttonholeOverlap' + i].flipY(
                    points.flipAnchor
                  )
                  points['buttonOverlapF' + i] = points['buttonOverlap' + i].flipY(
                    points.flipAnchor
                  )
                  snippets['buttonholeOverlapF' + i] = new Snippet(
                    'buttonhole',
                    points['buttonholeOverlapF' + i]
                  ).attr('data-rotate', 90)
                  snippets['buttonOverlapF' + i] = new Snippet(
                    'button',
                    points['buttonOverlapF' + i]
                  )
                }
              }
            }
          }
        }
      }
      if (points.buttonholePlacket) {
        snippets.buttonholePlacket = new Snippet('buttonhole', points.buttonholePlacket).attr(
          'data-rotate',
          90
        )
        snippets.buttonPlacket = new Snippet('button', points.buttonPlacket)
        if (options.waistbandFolded) {
          snippets.buttonholePlacketF = new Snippet('buttonhole', points.buttonholePlacketF).attr(
            'data-rotate',
            90
          )
          snippets.buttonPlacketF = new Snippet('button', points.buttonPlacketF)
        }
      }

      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
