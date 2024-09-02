import { name, version } from '../data.mjs'

export const plugin = {
  name,
  version,
  macros: {
    bandstraight: function (
      so,
      { points, Point, macro, snippets, Snippet, store, paths, Path, options, sa, complete }
    ) {
      //Example shorthand, you may wish to add other elements like utils
      const defaults = {
        at: new Point(0, 0),
        placketWidth: 0,
        lengthBack: length * 0.5,
        overlap: 0,
        overlapSide: 'left',
        folded: false,
        closurePosition: 'back',
        sideSa: sa,
        north: 'North',
        east: 'East',
        south: 'South',
        west: 'West',
      }
      so = { ...defaults, ...so }
      const prefix = so.prefix || ''

      let prefixFunction
      if (prefix != '') {
        prefixFunction = (string) => prefix + string.charAt(0).toUpperCase() + string.slice(1)
      } else {
        prefixFunction = (string) => string
      }
      // Passing `false` will remove the scalebox
      if (so === false) {
        for (const pointName in points) {
          if (pointName.match('bandStraight')) delete points[pointName]
          if (pointName.match('BandStraight')) delete points[pointName]
        }

        for (const pathName in paths) {
          if (pathName.match('bandStraight')) delete paths[pathName]
          if (pathName.match('BandStraight')) delete paths[pathName]
        }

        for (const snippetName in paths) {
          if (snippetName.match('bandStraight')) delete paths[snippetName]
          if (snippetName.match('BandStraight')) delete paths[snippetName]
        }
        return true
      }
      //measures
      let widthMultiplier
      if (so.folded) {
        widthMultiplier = 2
      } else widthMultiplier = 1

      const width = so.width * widthMultiplier
      const widthHalf = width / widthMultiplier / 2

      let leftExtension
      let rightExtension
      if (so.overlapSide == 'right') {
        leftExtension = so.placketWidth
        rightExtension = so.overlap
        if (!so.maxButtons) {
          so.maxButtons = rightExtension
        }
      } else {
        leftExtension = so.overlap
        rightExtension = so.placketWidth
        if (!so.maxButtons) {
          so.maxButtons = leftExtension
        }
      }
      //let's begin
      points[prefixFunction('bottomMid')] = so.at
      points[prefixFunction('topMid')] = points[prefixFunction('bottomMid')].shift(90, width)
      points[prefixFunction('bottomLeft')] = points[prefixFunction('bottomMid')].shift(
        180,
        so.length / 2
      )
      points[prefixFunction('bottomRight')] = points[prefixFunction('bottomLeft')].flipX(
        points[prefixFunction('bottomMid')]
      )
      points[prefixFunction('topLeft')] = new Point(
        points[prefixFunction('bottomLeft')].x,
        points[prefixFunction('topMid')].y
      )
      points[prefixFunction('topRight')] = points[prefixFunction('topLeft')].flipX(
        points[prefixFunction('topMid')]
      )

      //extensions
      points[prefixFunction('bottomLeftEx')] = points[prefixFunction('bottomLeft')].shift(
        180,
        leftExtension
      )
      points[prefixFunction('bottomRightEx')] = points[prefixFunction('bottomRight')].shift(
        0,
        rightExtension
      )
      points[prefixFunction('topLeftEx')] = new Point(
        points[prefixFunction('bottomLeftEx')].x,
        points[prefixFunction('topMid')].y
      )
      points[prefixFunction('topRightEx')] = new Point(
        points[prefixFunction('bottomRightEx')].x,
        points[prefixFunction('topMid')].y
      )

      //paths
      paths[prefixFunction('seam')] = new Path()
        .move(points[prefixFunction('bottomLeftEx')])
        .line(points[prefixFunction('bottomRightEx')])
        .line(points[prefixFunction('topRightEx')])
        .line(points[prefixFunction('topLeftEx')])
        .line(points[prefixFunction('bottomLeftEx')])
        .close()

      //notches
      let centreName
      let leftName
      let rightName
      let exName
      if (so.closurePosition == 'sideLeft' || so.closurePosition == 'sideRight') {
        if (so.closurePosition == 'sideRight') {
          points[prefixFunction('bottomMidNotch')] = points[prefixFunction('bottomRight')].shift(
            180,
            so.lengthBack
          )
          leftName = so.north
          rightName = so.south
          centreName = so.west
          exName = so.east
        } else {
          points[prefixFunction('bottomMidNotch')] = points[prefixFunction('bottomLeft')].shift(
            0,
            so.lengthBack
          )
          leftName = so.south
          rightName = so.north
          centreName = so.east
          exName = so.west
        }
        points[prefixFunction('bottomLeftNotch')] = points[
          prefixFunction('bottomLeft')
        ].shiftFractionTowards(points[prefixFunction('bottomMidNotch')], 0.5)
        points[prefixFunction('bottomRightNotch')] = points[
          prefixFunction('bottomMidNotch')
        ].shiftFractionTowards(points[prefixFunction('bottomRight')], 0.5)
      } else {
        if (so.closurePosition == 'back') {
          points[prefixFunction('bottomLeftNotch')] = points[prefixFunction('bottomLeft')].shift(
            0,
            so.lengthBack / 2
          )
          centreName = so.north
          exName = so.south
          leftName = so.east
          rightName = so.west
        }
        if (so.closurePosition == 'front') {
          points[prefixFunction('bottomLeftNotch')] = points[prefixFunction('bottomMid')].shift(
            180,
            so.lengthBack / 2
          )
          centreName = so.south
          exName = so.north
          leftName = so.west
          rightName = so.east
        }
        points[prefixFunction('bottomRightNotch')] = points[
          prefixFunction('bottomLeftNotch')
        ].flipX(points[prefixFunction('bottomMid')])
        points[prefixFunction('bottomMidNotch')] = points[prefixFunction('bottomMid')]
      }

      points[prefixFunction('topLeftNotch')] = new Point(
        points[prefixFunction('bottomLeftNotch')].x,
        points[prefixFunction('topMid')].y
      )
      points[prefixFunction('topRightNotch')] = new Point(
        points[prefixFunction('bottomRightNotch')].x,
        points[prefixFunction('topMid')].y
      )
      points[prefixFunction('topMidNotch')] = new Point(
        points[prefixFunction('bottomMidNotch')].x,
        points[prefixFunction('topMid')].y
      )

      if (complete) {
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: [
            prefixFunction('bottomLeftNotch'),
            prefixFunction('bottomRightNotch'),
            prefixFunction('bottomMidNotch'),
            prefixFunction('topLeftNotch'),
            prefixFunction('topRightNotch'),
            prefixFunction('topMidNotch'),
          ],
        })
        //grainline
        points[prefixFunction('grainlineFrom')] = points[
          prefixFunction('topLeftNotch')
        ].shiftFractionTowards(points[prefixFunction('topMidNotch')], 0.25)
        points[prefixFunction('grainlineTo')] = new Point(
          points[prefixFunction('grainlineFrom')].x,
          points[prefixFunction('bottomMid')].y
        )
        macro('grainline', {
          from: points[prefixFunction('grainlineFrom')],
          to: points[prefixFunction('grainlineTo')],
        })
        //title
        points.title = points[prefixFunction('topLeftNotch')]
          .shiftFractionTowards(points[prefixFunction('topMidNotch')], 0.55)
          .shift(-90, widthHalf)
        //paths
        if (leftExtension > 0) {
          paths[prefixFunction('leftEx')] = new Path()
            .move(points[prefixFunction('topLeft')])
            .line(points[prefixFunction('bottomLeft')])
            .attr('class', 'various')
            .attr('data-text', exName)
            .attr('data-text-class', 'center')
          macro('sprinkle', {
            snippet: 'notch',
            on: [prefixFunction('topLeft'), prefixFunction('bottomLeft')],
          })
        }
        if (rightExtension > 0) {
          paths[prefixFunction('rightEx')] = new Path()
            .move(points[prefixFunction('topRight')])
            .line(points[prefixFunction('bottomRight')])
            .attr('class', 'various')
            .attr('data-text', exName)
            .attr('data-text-class', 'center')
          macro('sprinkle', {
            snippet: 'notch',
            on: [prefixFunction('topRight'), prefixFunction('bottomRight')],
          })
        }

        if (so.folded) {
          paths[prefixFunction('foldline')] = new Path()
            .move(
              new Point(
                points[prefixFunction('topLeftEx')].x,
                points[prefixFunction('topLeftEx')].y / 2
              )
            )
            .line(
              new Point(
                points[prefixFunction('topRightEx')].x,
                points[prefixFunction('topRightEx')].y / 2
              )
            )
            .attr('class', 'interfacing')
            .attr('data-text', 'Fold - Line')
        }

        paths[prefixFunction('mid')] = new Path()
          .move(points[prefixFunction('topMidNotch')])
          .line(points[prefixFunction('bottomMidNotch')])
          .attr('class', 'various')
          .attr('data-text', centreName)
          .attr('data-text-class', 'center')

        paths[prefixFunction('left')] = new Path()
          .move(points[prefixFunction('topLeftNotch')])
          .line(points[prefixFunction('bottomLeftNotch')])
          .attr('class', 'various')
          .attr('data-text', leftName)
          .attr('data-text-class', 'center')

        paths[prefixFunction('right')] = new Path()
          .move(points[prefixFunction('topRightNotch')])
          .line(points[prefixFunction('bottomRightNotch')])
          .attr('class', 'various')
          .attr('data-text', rightName)
          .attr('data-text-class', 'center')

        //buttons & buttonholes
        points[prefixFunction('flipAnchor')] = points[
          prefixFunction('bottomMid')
        ].shiftFractionTowards(points[prefixFunction('topMid')], 0.5)
        if (so.overlapSide == 'right') {
          if (leftExtension > 0) {
            points[prefixFunction('buttonPlacket')] = points[prefixFunction('bottomLeftEx')]
              .shiftFractionTowards(points[prefixFunction('bottomLeft')], 0.5)
              .shift(90, widthHalf)
            points[prefixFunction('buttonholePlacket')] = points[
              prefixFunction('bottomRight')
            ].translate(so.placketWidth / -2, -widthHalf)

            if (so.folded) {
              points[prefixFunction('buttonPlacketF')] = points[
                prefixFunction('buttonPlacket')
              ].flipY(points[prefixFunction('flipAnchor')])
              points[prefixFunction('buttonholePlacketF')] = points[
                prefixFunction('buttonholePlacket')
              ].flipY(points[prefixFunction('flipAnchor')])
            }
          }
          if (rightExtension > width / widthMultiplier) {
            for (let i = 0; i < so.maxButtons; i++) {
              if (rightExtension > (width / widthMultiplier) * (i + 1)) {
                points[prefixFunction('buttonholeOverlap') + i] = points[
                  prefixFunction('bottomRightEx')
                ].translate(-(widthHalf + (width / widthMultiplier) * i), -widthHalf)
                points[prefixFunction('buttonOverlap') + i] = points[
                  prefixFunction('bottomLeft')
                ].translate(so.overlap - (widthHalf + (width / widthMultiplier) * i), -widthHalf)
                snippets[prefixFunction('buttonholeOverlap') + i] = new Snippet(
                  'buttonhole',
                  points[prefixFunction('buttonholeOverlap') + i]
                ).attr('data-rotate', 90)
                snippets[prefixFunction('buttonOverlap') + i] = new Snippet(
                  'button',
                  points[prefixFunction('buttonOverlap') + i]
                )

                if (so.folded) {
                  points[prefixFunction('buttonholeOverlapF') + i] = points[
                    prefixFunction('buttonholeOverlap') + i
                  ].flipY(points[prefixFunction('flipAnchor')])
                  points[prefixFunction('buttonOverlapF') + i] = points[
                    prefixFunction('buttonOverlap') + i
                  ].flipY(points[prefixFunction('flipAnchor')])
                  snippets[prefixFunction('buttonholeOverlapF') + i] = new Snippet(
                    'buttonhole',
                    points[prefixFunction('buttonholeOverlapF') + i]
                  ).attr('data-rotate', 90)
                  snippets[prefixFunction('buttonOverlapF') + i] = new Snippet(
                    'button',
                    points[prefixFunction('buttonOverlapF') + i]
                  )
                }
              }
            }
          }
        } else {
          if (rightExtension > 0) {
            points[prefixFunction('buttonPlacket')] = points[prefixFunction('bottomRight')]
              .shiftFractionTowards(points[prefixFunction('bottomRightEx')], 0.5)
              .shift(90, widthHalf)
            points[prefixFunction('buttonholePlacket')] = points[
              prefixFunction('bottomLeft')
            ].translate(so.placketWidth / 2, -widthHalf)

            if (so.folded) {
              points[prefixFunction('buttonPlacketF')] = points[
                prefixFunction('buttonPlacket')
              ].flipY(points[prefixFunction('flipAnchor')])
              points[prefixFunction('buttonholePlacketF')] = points[
                prefixFunction('buttonholePlacket')
              ].flipY(points[prefixFunction('flipAnchor')])
            }
          }
          if (leftExtension > width / widthMultiplier) {
            for (let i = 0; i < so.maxButtons; i++) {
              if (leftExtension > (width / widthMultiplier) * (i + 1)) {
                points[prefixFunction('buttonholeOverlap') + i] = points[
                  prefixFunction('bottomLeftEx')
                ].translate(widthHalf + (width / widthMultiplier) * i, -widthHalf)
                points[prefixFunction('buttonOverlap') + i] = points[
                  prefixFunction('bottomRight')
                ].translate(widthHalf + (width / widthMultiplier) * i - so.overlap, -widthHalf)
                snippets[prefixFunction('buttonholeOverlap') + i] = new Snippet(
                  'buttonhole',
                  points[prefixFunction('buttonholeOverlap') + i]
                ).attr('data-rotate', 90)
                snippets[prefixFunction('buttonOverlap') + i] = new Snippet(
                  'button',
                  points[prefixFunction('buttonOverlap') + i]
                )

                if (so.folded) {
                  points[prefixFunction('buttonholeOverlapF') + i] = points[
                    prefixFunction('buttonholeOverlap') + i
                  ].flipY(points[prefixFunction('flipAnchor')])
                  points[prefixFunction('buttonOverlapF') + i] = points[
                    prefixFunction('buttonOverlap') + i
                  ].flipY(points[prefixFunction('flipAnchor')])
                  snippets[prefixFunction('buttonholeOverlapF') + i] = new Snippet(
                    'buttonhole',
                    points[prefixFunction('buttonholeOverlapF') + i]
                  ).attr('data-rotate', 90)
                  snippets[prefixFunction('buttonOverlapF') + i] = new Snippet(
                    'button',
                    points[prefixFunction('buttonOverlapF') + i]
                  )
                }
              }
            }
          }
        }
        if (points[prefixFunction('buttonholePlacket')]) {
          snippets[prefixFunction('buttonholePlacket')] = new Snippet(
            'buttonhole',
            points[prefixFunction('buttonholePlacket')]
          ).attr('data-rotate', 90)
          snippets[prefixFunction('buttonPlacket')] = new Snippet(
            'button',
            points[prefixFunction('buttonPlacket')]
          )
          if (so.folded) {
            snippets[prefixFunction('buttonholePlacketF')] = new Snippet(
              'buttonhole',
              points[prefixFunction('buttonholePlacketF')]
            ).attr('data-rotate', 90)
            snippets[prefixFunction('buttonPlacketF')] = new Snippet(
              'button',
              points[prefixFunction('buttonPlacketF')]
            )
          }
        }

        if (sa) {
          let sideSa
          if (leftExtension > 0 || rightExtension > 0) {
            sideSa = sa
          } else {
            sideSa = so.sideSa
          }
          points[prefixFunction('saTopLeft')] = points[prefixFunction('topLeftEx')].translate(
            -sideSa,
            -sa
          )
          points[prefixFunction('saTopRight')] = points[prefixFunction('topRightEx')].translate(
            sideSa,
            -sa
          )
          points[prefixFunction('saBottomLeft')] = points[prefixFunction('bottomLeftEx')].translate(
            -sideSa,
            sa
          )
          points[prefixFunction('saBottomRight')] = points[
            prefixFunction('bottomRightEx')
          ].translate(sideSa, sa)
          paths[prefixFunction('sa')] = new Path()
            .move(points[prefixFunction('saBottomLeft')])
            .line(points[prefixFunction('saBottomRight')])
            .line(points[prefixFunction('saTopRight')])
            .line(points[prefixFunction('saTopLeft')])
            .line(points[prefixFunction('saBottomLeft')])
            .close()
            .attr('class', 'fabric sa')
        }
      }
    },
  },
}

// More specifically named exports
export const bandStraightPlugin = plugin
export const pluginBandStraight = plugin
