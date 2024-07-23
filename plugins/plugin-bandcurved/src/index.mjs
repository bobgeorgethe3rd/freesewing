import { name, version } from '../data.mjs'

export const plugin = {
  name,
  version,
  macros: {
    bandcurved: function (
      so,
      {
        points,
        Point,
        macro,
        snippets,
        Snippet,
        store,
        paths,
        Path,
        options,
        sa,
        complete,
        part,
        log,
        utils,
      }
    ) {
      //Example shorthand, you may wish to add other elements like utils
      const defaults = {
        //note these are common examples and can be removed
        at: new Point(0, 0),
        placketWidth: 0,
        lengthBack: length * 0.5,
        lengthTop: length * 0.98,
        overlap: 0,
        overlapSide: 'left',
        closurePosition: 'back',
        sideSa: sa,
      }
      so = { ...defaults, ...so }
      //write plugin here
      //clashing protection
      if (so.length == so.lengthTop) {
        part.hide()
        log.info('Curved Band unavailable due to bandLength & bandLengthTop being the same')
        return part
      }

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
          if (pointName.match('bandCurved')) delete points[pointName]
          if (pointName.match('BandCurved')) delete points[pointName]
        }

        for (const pathName in paths) {
          if (pathName.match('bandCurved')) delete paths[pathName]
          if (pathName.match('BandCurved')) delete paths[pathName]

          for (const snippetName in paths) {
            if (snippetName.match('bandStraight')) delete paths[snippetName]
            if (snippetName.match('BandStraight')) delete paths[snippetName]
          }
        }
        return true
      }

      //measures
      const widthStatic = so.width
      let width
      if (so.lengthTop > so.length) {
        width = widthStatic * -1
      } else width = widthStatic

      const widthHalf = widthStatic / 2

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

      const angleRads = (so.length - so.lengthTop) / widthStatic
      const radius = so.length / angleRads
      const angleDegs = utils.rad2deg(angleRads)

      const bottomCpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angleDegs / 8))
      const topCpDistance =
        (4 / 3) * (radius - widthStatic) * Math.tan(utils.deg2rad(angleDegs / 8))

      //let's begin
      points[prefixFunction('bottomMid')] = new Point(0, 0)
      points[prefixFunction('origin')] = points[prefixFunction('bottomMid')].shift(90, radius)
      points[prefixFunction('bottomLeft')] = points[prefixFunction('bottomMid')].rotate(
        angleDegs / -2,
        points[prefixFunction('origin')]
      )
      points[prefixFunction('bottomRight')] = points[prefixFunction('bottomLeft')].flipX(
        points[prefixFunction('bottomMid')]
      )
      points[prefixFunction('topLeft')] = points[prefixFunction('bottomLeft')].shiftTowards(
        points[prefixFunction('origin')],
        width
      )
      points[prefixFunction('topRight')] = points[prefixFunction('bottomRight')].shiftTowards(
        points[prefixFunction('origin')],
        width
      )
      points[prefixFunction('topMid')] = points[prefixFunction('bottomMid')].shiftTowards(
        points[prefixFunction('origin')],
        width
      )

      //control points
      points[prefixFunction('bottomLeftCp2')] = points[prefixFunction('bottomLeft')]
        .shiftTowards(points[prefixFunction('topLeft')], bottomCpDistance)
        .rotate(-90, points[prefixFunction('bottomLeft')])
      points[prefixFunction('bottomMidCp1')] = points[prefixFunction('bottomMid')]
        .shiftTowards(points[prefixFunction('topMid')], bottomCpDistance)
        .rotate(90, points[prefixFunction('bottomMid')])
      points[prefixFunction('bottomMidCp2')] = points[prefixFunction('bottomMidCp1')].flipX(
        points[prefixFunction('bottomMid')]
      )
      points[prefixFunction('bottomRightCp1')] = points[prefixFunction('bottomLeftCp2')].flipX(
        points[prefixFunction('bottomMid')]
      )
      points[prefixFunction('topRightCp2')] = points[prefixFunction('topRight')]
        .shiftTowards(points[prefixFunction('bottomRight')], topCpDistance)
        .rotate(-90, points[prefixFunction('topRight')])
      points[prefixFunction('topMidCp1')] = points[prefixFunction('topMid')]
        .shiftTowards(points[prefixFunction('bottomMid')], topCpDistance)
        .rotate(90, points[prefixFunction('topMid')])
      points[prefixFunction('topMidCp2')] = points[prefixFunction('topMidCp1')].flipX(
        points[prefixFunction('bottomMid')]
      )
      points[prefixFunction('topLeftCp1')] = points[prefixFunction('topRightCp2')].flipX(
        points[prefixFunction('bottomMid')]
      )

      //extensions
      points[prefixFunction('bottomLeftEx')] = points[prefixFunction('bottomLeft')]
        .shiftTowards(points[prefixFunction('topLeft')], leftExtension)
        .rotate(90, points[prefixFunction('bottomLeft')])
      points[prefixFunction('topLeftEx')] = points[prefixFunction('topLeft')]
        .shiftTowards(points[prefixFunction('bottomLeft')], leftExtension)
        .rotate(-90, points[prefixFunction('topLeft')])

      points[prefixFunction('bottomRightEx')] = points[prefixFunction('bottomRight')]
        .shiftTowards(points[prefixFunction('topRight')], rightExtension)
        .rotate(-90, points[prefixFunction('bottomRight')])
      points[prefixFunction('topRightEx')] = points[prefixFunction('topRight')]
        .shiftTowards(points[prefixFunction('bottomRight')], rightExtension)
        .rotate(90, points[prefixFunction('topRight')])

      //paths
      paths[prefixFunction('bottomCurve')] = new Path()
        .move(points[prefixFunction('bottomLeft')])
        .curve(
          points[prefixFunction('bottomLeftCp2')],
          points[prefixFunction('bottomMidCp1')],
          points[prefixFunction('bottomMid')]
        )
        .curve(
          points[prefixFunction('bottomMidCp2')],
          points[prefixFunction('bottomRightCp1')],
          points[prefixFunction('bottomRight')]
        )
        .hide()

      paths[prefixFunction('topCurve')] = new Path()
        .move(points[prefixFunction('topRight')])
        .curve(
          points[prefixFunction('topRightCp2')],
          points[prefixFunction('topMidCp1')],
          points[prefixFunction('topMid')]
        )
        .curve(
          points[prefixFunction('topMidCp2')],
          points[prefixFunction('topLeftCp1')],
          points[prefixFunction('topLeft')]
        )
        .hide()

      paths[prefixFunction('seam')] = paths[prefixFunction('bottomCurve')]
        .clone()
        .line(points[prefixFunction('bottomRightEx')])
        .line(points[prefixFunction('topRightEx')])
        .line(points[prefixFunction('topRight')])
        .join(paths[prefixFunction('topCurve')])
        .line(points[prefixFunction('topLeftEx')])
        .line(points[prefixFunction('bottomLeftEx')])
        .line(points[prefixFunction('bottomLeft')])
        .close()
        .unhide()

      //notches
      let centreName
      let leftName
      let rightName
      let exName
      if (so.closurePosition == 'sideLeft' || so.closurePosition == 'sideRight') {
        if (so.closurePosition == 'sideRight') {
          points[prefixFunction('bottomMidNotch')] = paths[prefixFunction('bottomCurve')]
            .reverse()
            .shiftAlong(so.lengthBack)
          points[prefixFunction('bottomLeftNotch')] = paths[
            prefixFunction('bottomCurve')
          ].shiftAlong((so.length - so.lengthBack) / 2)
          points[prefixFunction('bottomRightNotch')] = paths[prefixFunction('bottomCurve')]
            .reverse()
            .shiftAlong(so.lengthBack / 2)
          leftName = 'Centre Front'
          rightName = 'Centre Back'
        } else {
          points[prefixFunction('bottomMidNotch')] = paths[
            prefixFunction('bottomCurve')
          ].shiftAlong(so.lengthBack)
          points[prefixFunction('bottomLeftNotch')] = paths[
            prefixFunction('bottomCurve')
          ].shiftAlong(so.lengthBack / 2)
          points[prefixFunction('bottomRightNotch')] = paths[prefixFunction('bottomCurve')]
            .reverse()
            .shiftAlong((so.length - so.lengthBack) / 2)
          leftName = 'Centre Back'
          rightName = 'Centre Front'
        }
        centreName = 'Side Seam'
        exName = centreName
      } else {
        if (so.closurePosition == 'back') {
          points[prefixFunction('bottomLeftNotch')] = paths[
            prefixFunction('bottomCurve')
          ].shiftAlong(so.lengthBack / 2)
          centreName = 'Centre Front'
          exName = 'Centre Back'
        }
        if (so.closurePosition == 'front') {
          points[prefixFunction('bottomLeftNotch')] = paths[
            prefixFunction('bottomCurve')
          ].shiftAlong((so.length - so.lengthBack) / 2)
          centreName = 'Centre Back'
          exName = 'Centre Front'
        }
        points[prefixFunction('bottomRightNotch')] = points[
          prefixFunction('bottomLeftNotch')
        ].flipX(points[prefixFunction('bottomMid')])
        points[prefixFunction('bottomMidNotch')] = points[prefixFunction('bottomMid')]
        leftName = 'Side Seam'
        rightName = 'Side Seam'
      }
      points[prefixFunction('topLeftNotch')] = points[
        prefixFunction('bottomLeftNotch')
      ].shiftTowards(points[prefixFunction('origin')], width)
      points[prefixFunction('topRightNotch')] = points[
        prefixFunction('bottomRightNotch')
      ].shiftTowards(points[prefixFunction('origin')], width)
      points[prefixFunction('topMidNotch')] = points[prefixFunction('bottomMidNotch')].shiftTowards(
        points[prefixFunction('origin')],
        width
      )

      if (complete) {
        //grainline
        points[prefixFunction('grainlineFrom')] = new Point(
          points[prefixFunction('topMidCp2')].x / 4,
          points[prefixFunction('topMid')].y
        )
        points[prefixFunction('grainlineTo')] = new Point(
          points[prefixFunction('grainlineFrom')].x,
          points[prefixFunction('bottomMid')].x
        )
        macro('grainline', {
          from: points[prefixFunction('grainlineFrom')],
          to: points[prefixFunction('grainlineTo')],
        })
        //title
        points.title = points[prefixFunction('grainlineFrom')]
          .shiftFractionTowards(points[prefixFunction('topMid')], 0.25)
          .shift(-90, widthHalf)
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
        if (so.overlapSide == 'right') {
          if (leftExtension > 0) {
            points[prefixFunction('buttonPlacket')] = points[
              prefixFunction('bottomLeft')
            ].shiftFractionTowards(points[prefixFunction('topLeftEx')], 0.5)
            points[prefixFunction('buttonholePlacket')] = paths[prefixFunction('bottomCurve')]
              .reverse()
              .shiftAlong(widthStatic / 2)
              .shiftTowards(points[prefixFunction('origin')], width / 2)
          }
          if (rightExtension > widthStatic) {
            for (let i = 0; i < so.maxButtons; i++) {
              if (rightExtension > widthStatic * (i + 1)) {
                points[prefixFunction('buttonholeOverlap') + i] = points[
                  prefixFunction('bottomRightEx')
                ]
                  .shiftTowards(points[prefixFunction('bottomRight')], widthHalf + widthStatic * i)
                  .shift(
                    points[prefixFunction('bottomRight')].angle(points[prefixFunction('topRight')]),
                    widthHalf
                  )
                points[prefixFunction('buttonOverlap') + i] = paths[prefixFunction('bottomCurve')]
                  .shiftAlong(so.overlap - (widthHalf + widthStatic * i))
                  .shiftTowards(points[prefixFunction('origin')], width / 2)
                snippets[prefixFunction('buttonholeOverlap') + i] = new Snippet(
                  'buttonhole',
                  points[prefixFunction('buttonholeOverlap') + i]
                ).attr(
                  'data-rotate',
                  points[prefixFunction('bottomRight')].angle(points[prefixFunction('topRight')]) *
                    -1
                )
                snippets[prefixFunction('buttonOverlap') + i] = new Snippet(
                  'button',
                  points[prefixFunction('buttonOverlap') + i]
                ).attr(
                  'data-rotate',
                  points[prefixFunction('buttonOverlap') + i].angle(
                    points[prefixFunction('origin')]
                  ) * -1
                )
              }
            }
          }
        } else {
          if (rightExtension > 0) {
            points[prefixFunction('buttonPlacket')] = points[
              prefixFunction('bottomRight')
            ].shiftFractionTowards(points[prefixFunction('topRightEx')], 0.5)
            points[prefixFunction('buttonholePlacket')] = paths[prefixFunction('bottomCurve')]
              .shiftAlong(widthStatic / 2)
              .shiftTowards(points[prefixFunction('origin')], width / 2)
          }
          if (leftExtension > widthStatic) {
            for (let i = 0; i < so.maxButtons; i++) {
              if (leftExtension > widthStatic * (i + 1)) {
                points[prefixFunction('buttonholeOverlap') + i] = points[
                  prefixFunction('bottomLeftEx')
                ]
                  .shiftTowards(points[prefixFunction('bottomLeft')], widthHalf + widthStatic * i)
                  .shift(
                    points[prefixFunction('bottomLeft')].angle(points[prefixFunction('topLeft')]),
                    widthHalf
                  )
                points[prefixFunction('buttonOverlap') + i] = paths[prefixFunction('bottomCurve')]
                  .reverse()
                  .shiftAlong(so.overlap - (widthHalf + widthStatic * i))
                  .shiftTowards(points[prefixFunction('origin')], width / 2)
                snippets[prefixFunction('buttonholeOverlap') + i] = new Snippet(
                  'buttonhole',
                  points[prefixFunction('buttonholeOverlap') + i]
                ).attr(
                  'data-rotate',
                  points[prefixFunction('bottomLeft')].angle(points[prefixFunction('topLeft')]) * -1
                )
                snippets[prefixFunction('buttonOverlap') + i] = new Snippet(
                  'button',
                  points[prefixFunction('buttonOverlap') + i]
                ).attr(
                  'data-rotate',
                  points[prefixFunction('buttonOverlap') + i].angle(
                    points[prefixFunction('origin')]
                  ) * -1
                )
              }
            }
          }
        }
        if (points[prefixFunction('buttonholePlacket')]) {
          snippets[prefixFunction('buttonholePlacket')] = new Snippet(
            'buttonhole',
            points[prefixFunction('buttonholePlacket')]
          ).attr(
            'data-rotate',
            points[prefixFunction('buttonholePlacket')].angle(points[prefixFunction('origin')]) * -1
          )
          snippets[prefixFunction('buttonPlacket')] = new Snippet(
            'button',
            points[prefixFunction('buttonPlacket')]
          ).attr(
            'data-rotate',
            points[prefixFunction('buttonPlacket')].angle(points[prefixFunction('origin')]) * -1
          )
        }
        if (sa) {
          void store.setIfUnset('waistbandSideSa', sa)
          let sideSa
          if (leftExtension > 0 || rightExtension > 0) {
            sideSa = sa
          } else {
            sideSa = so.sideSa
          }
          points[prefixFunction('saBottomLeft')] = points[prefixFunction('bottomLeftEx')]
            .shift(
              points[prefixFunction('bottomLeftCp2')].angle(points[prefixFunction('bottomLeft')]),
              sideSa
            )
            .shift(
              points[prefixFunction('topLeft')].angle(points[prefixFunction('bottomLeft')]),
              sa
            )

          points[prefixFunction('saBottomRight')] = points[prefixFunction('bottomRightEx')]
            .shift(
              points[prefixFunction('bottomRightCp1')].angle(points[prefixFunction('bottomRight')]),
              sideSa
            )
            .shift(
              points[prefixFunction('topRight')].angle(points[prefixFunction('bottomRight')]),
              sa
            )

          points[prefixFunction('saTopRight')] = points[prefixFunction('topRightEx')]
            .shift(
              points[prefixFunction('topRightCp2')].angle(points[prefixFunction('topRight')]),
              sideSa
            )
            .shift(
              points[prefixFunction('bottomRight')].angle(points[prefixFunction('topRight')]),
              sa
            )

          points[prefixFunction('saTopLeft')] = points[prefixFunction('topLeftEx')]
            .shift(
              points[prefixFunction('topLeftCp1')].angle(points[prefixFunction('topLeft')]),
              sideSa
            )
            .shift(
              points[prefixFunction('bottomLeft')].angle(points[prefixFunction('topLeft')]),
              sa
            )

          paths[prefixFunction('sa')] = new Path()
            .move(points[prefixFunction('saBottomLeft')])
            .line(paths[prefixFunction('bottomCurve')].offset(sa).start())
            .join(paths[prefixFunction('bottomCurve')].offset(sa))
            .line(points[prefixFunction('saBottomRight')])
            .line(points[prefixFunction('saTopRight')])
            .line(paths[prefixFunction('topCurve')].offset(sa).start())
            .join(paths[prefixFunction('topCurve')].offset(sa))
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
export const bandCurvedPlugin = plugin
export const pluginBandCurved = plugin
