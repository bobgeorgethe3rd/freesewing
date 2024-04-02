import { name, version } from '../data.mjs'

export const plugin = {
  name,
  version,
  macros: {
    patchpocket: function (
      so,
      {
        store,
        sa,
        Point,
        points,
        Path,
        paths,
        complete,
        paperless,
        macro,
        utils,
        measurements,
        part,
        snippets,
        Snippet,
      }
    ) {
      //Example shorthand, you may wish to add other elements like utils
      const defaults = {
        bottomWidth: 1,
        peakDepth: 0.5,
        peakCurve: 1,
        peakPlateau: true,
        style: 'curved',
        folded: false,
        grainlineBias: false,
        patchPocketTopSaWidth: 0.02,
      }
      so = { ...defaults, ...so }
      const prefix = so.prefix || ''

      let prefixFunction
      if (prefix != '') {
        prefixFunction = (string) => prefix + string.charAt(0).toUpperCase() + string.slice(1)
      } else {
        prefixFunction = (string) => string
      }
      // Passing `false` will remove the patch pocket
      if (so === false) {
        for (const pointName in points) {
          if (pointName.match('patchPocket')) delete points[pointName]
          if (pointName.match('PatchPocket')) delete points[pointName]
        }

        for (const pathName in paths) {
          if (pathName.match('patchPocket')) delete paths[pathName]
          if (pathName.match('PatchPocket')) delete paths[pathName]
        }

        for (const snippetName in paths) {
          if (snippetName.match('patchPocket')) delete snippets[snippetName]
          if (snippetName.match('PatchPocket')) delete snippets[snippetName]
        }
        return true
      }

      const pocketBottomWidth = so.width * so.bottomWidth
      const pocketPeakDepth = pocketBottomWidth * so.peakDepth * 0.5
      //let's begin
      points[prefixFunction('patchPocketTopMid')] = new Point(0, 0)
      points[prefixFunction('patchPocketBottomMid')] = points[
        prefixFunction('patchPocketTopMid')
      ].shift(-90, so.depth)
      points[prefixFunction('patchPocketTopLeft')] = points[
        prefixFunction('patchPocketTopMid')
      ].shift(180, so.width / 2)
      points[prefixFunction('patchPocketTopRight')] = points[
        prefixFunction('patchPocketTopLeft')
      ].flipX(points[prefixFunction('patchPocketTopMid')])
      points[prefixFunction('patchPocketBottomLeft')] = points[
        prefixFunction('patchPocketBottomMid')
      ].shift(180, pocketBottomWidth / 2)
      points[prefixFunction('patchPocketBottomRight')] = points[
        prefixFunction('patchPocketBottomLeft')
      ].flipX(points[prefixFunction('patchPocketBottomMid')])

      //peak
      points[prefixFunction('patchPocketPeak')] = points[
        prefixFunction('patchPocketBottomMid')
      ].shift(-90, pocketPeakDepth)
      points[prefixFunction('patchPocketPeakLeft')] = utils.beamsIntersect(
        points[prefixFunction('patchPocketTopLeft')],
        points[prefixFunction('patchPocketBottomLeft')],
        points[prefixFunction('patchPocketPeak')],
        points[prefixFunction('patchPocketPeak')].shift(180, 1)
      )

      if (
        points[prefixFunction('patchPocketPeakLeft')].dist(
          points[prefixFunction('patchPocketPeak')]
        ) <
        points[prefixFunction('patchPocketPeakLeft')].dist(
          points[prefixFunction('patchPocketBottomLeft')]
        )
      ) {
        points[prefixFunction('patchPocketPeakLeftEnd')] = points[
          prefixFunction('patchPocketPeakLeft')
        ].shiftFractionTowards(points[prefixFunction('patchPocketPeak')], so.peakCurve)
        points[prefixFunction('patchPocketPeakLeftStart')] = points[
          prefixFunction('patchPocketPeakLeftEnd')
        ].rotate(
          points[prefixFunction('patchPocketPeakLeft')].angle(
            points[prefixFunction('patchPocketBottomLeft')]
          ),
          points[prefixFunction('patchPocketPeakLeft')]
        )
      } else {
        points[prefixFunction('patchPocketPeakLeftStart')] = points[
          prefixFunction('patchPocketPeakLeft')
        ].shiftFractionTowards(points[prefixFunction('patchPocketBottomLeft')], so.peakCurve)
        points[prefixFunction('patchPocketPeakLeftEnd')] = points[
          prefixFunction('patchPocketPeakLeftStart')
        ].rotate(
          -points[prefixFunction('patchPocketPeakLeft')].angle(
            points[prefixFunction('patchPocketBottomLeft')]
          ),
          points[prefixFunction('patchPocketPeakLeft')]
        )
      }

      points[prefixFunction('patchPocketPeakRightStart')] = points[
        prefixFunction('patchPocketPeakLeftEnd')
      ].flipX(points[prefixFunction('patchPocketPeak')])
      points[prefixFunction('patchPocketPeakRightEnd')] = points[
        prefixFunction('patchPocketPeakLeftStart')
      ].flipX(points[prefixFunction('patchPocketPeak')])

      points[prefixFunction('patchPocketPeakLeftAnchor')] = utils.beamsIntersect(
        points[prefixFunction('patchPocketPeakLeftStart')],
        points[prefixFunction('patchPocketTopLeft')].rotate(
          -90,
          points[prefixFunction('patchPocketPeakLeftStart')]
        ),
        points[prefixFunction('patchPocketPeakLeftEnd')],
        points[prefixFunction('patchPocketPeakLeftEnd')].shift(90, 1)
      )
      const radius = points[prefixFunction('patchPocketPeakLeftAnchor')].dist(
        points[prefixFunction('patchPocketPeakLeftStart')]
      )
      const angle =
        points[prefixFunction('patchPocketPeakLeftAnchor')].angle(
          points[prefixFunction('patchPocketPeakLeftEnd')]
        ) -
        points[prefixFunction('patchPocketPeakLeftAnchor')].angle(
          points[prefixFunction('patchPocketPeakLeftStart')]
        )

      const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

      points[prefixFunction('patchPocketPeakLeftStartCp2')] = points[
        prefixFunction('patchPocketPeakLeftStart')
      ].shiftTowards(points[prefixFunction('patchPocketPeakLeft')], cpDistance)
      points[prefixFunction('patchPocketPeakLeftEndCp1')] = points[
        prefixFunction('patchPocketPeakLeftEnd')
      ].shiftTowards(points[prefixFunction('patchPocketPeakLeft')], cpDistance)
      points[prefixFunction('patchPocketPeakRightStartCp2')] = points[
        prefixFunction('patchPocketPeakLeftEndCp1')
      ].flipX(points[prefixFunction('patchPocketPeak')])
      points[prefixFunction('patchPocketPeakRightEndCp1')] = points[
        prefixFunction('patchPocketPeakLeftStartCp2')
      ].flipX(points[prefixFunction('patchPocketPeak')])

      //paths
      let peakFrom
      let peakTo
      if (so.peakPlateau) {
        peakFrom = points[prefixFunction('patchPocketPeakLeftEnd')]
        peakTo = points[prefixFunction('patchPocketPeakRightStart')]
      } else {
        peakFrom = points[prefixFunction('patchPocketPeak')]
        peakTo = points[prefixFunction('patchPocketPeak')]
      }

      const drawSeamBase = () => {
        if (so.style == 'straight')
          return new Path()
            .move(points[prefixFunction('patchPocketTopLeft')])
            .line(points[prefixFunction('patchPocketPeakLeftStart')])
            .line(peakFrom)
            .line(peakTo)
            .line(points[prefixFunction('patchPocketPeakRightEnd')])
            .line(points[prefixFunction('patchPocketTopRight')])
        if (so.style == 'curved')
          return new Path()
            .move(points[prefixFunction('patchPocketTopLeft')])
            .line(points[prefixFunction('patchPocketPeakLeftStart')])
            .curve(
              points[prefixFunction('patchPocketPeakLeftStartCp2')],
              points[prefixFunction('patchPocketPeakLeftEndCp1')],
              peakFrom
            )
            .line(peakTo)
            .curve(
              points[prefixFunction('patchPocketPeakRightStartCp2')],
              points[prefixFunction('patchPocketPeakRightEndCp1')],
              points[prefixFunction('patchPocketPeakRightEnd')]
            )
            .line(points[prefixFunction('patchPocketTopRight')])
      }

      paths[prefixFunction('patchPocketSeamBase')] = drawSeamBase().hide()

      macro('mirror', {
        mirror: [
          points[prefixFunction('patchPocketTopLeft')],
          points[prefixFunction('patchPocketTopRight')],
        ],
        paths: [prefixFunction('patchPocketSeamBase')],
        prefix: 'm',
      })

      const drawSeamTop = () => {
        if (so.folded)
          return paths['m' + utils.capitalize(prefixFunction('patchPocketSeamBase'))].reverse()
        else
          return new Path()
            .move(points[prefixFunction('patchPocketTopRight')])
            .line(points[prefixFunction('patchPocketTopLeft')])
      }

      paths[prefixFunction('patchPocketSeam')] = drawSeamBase().join(drawSeamTop()).close()

      if (complete) {
        //grainline
        let grainlineFrom
        let grainlineTo
        if (so.grainlineBias) {
          points[prefixFunction('patchPocketGrainlineMid')] = new Point(
            points[prefixFunction('patchPocketTopMid')].x,
            points[prefixFunction('patchPocketBottomRight')].y / 2
          )
          grainlineFrom = points[prefixFunction('patchPocketGrainlineMid')].shift(
            135,
            so.width * 0.5
          )
          grainlineTo = points[prefixFunction('patchPocketGrainlineMid')].shift(
            315,
            pocketBottomWidth * 0.5
          )
        } else {
          if (so.folded) {
            grainlineFrom = points[prefixFunction('patchPocketPeak')].flipY()
          } else {
            grainlineFrom = points[prefixFunction('patchPocketTopMid')]
          }
          grainlineTo = points[prefixFunction('patchPocketPeak')]
        }
        macro('grainline', {
          from: grainlineFrom,
          to: grainlineTo,
        })
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: [prefixFunction('patchPocketTopLeft'), prefixFunction('patchPocketTopRight')],
        })
        //title
        points[prefixFunction('patchPocketTitle')] = new Point(
          points[prefixFunction('patchPocketTopRight')].x * (1 / 3),
          points[prefixFunction('patchPocketBottomRight')].y / 2
        )
        if (sa) {
          points[prefixFunction('patchPocketSaLeft')] = utils.beamIntersectsY(
            points[prefixFunction('patchPocketTopLeft')]
              .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
              .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
            points[prefixFunction('patchPocketPeakLeftStart')]
              .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
              .rotate(90, points[prefixFunction('patchPocketPeakLeftStart')]),
            points[prefixFunction('patchPocketTopLeft')].y
          )
          points[prefixFunction('patchPocketSaTopLeft')] = utils
            .beamIntersectsY(
              points[prefixFunction('patchPocketTopLeft')]
                .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
                .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
              points[prefixFunction('patchPocketPeakLeftStart')]
                .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
                .rotate(90, points[prefixFunction('patchPocketPeakLeftStart')]),
              points[prefixFunction('patchPocketTopLeft')].y + sa * so.patchPocketTopSaWidth * 100
            )
            .flipY(points[prefixFunction('patchPocketTopLeft')])

          points[prefixFunction('patchPocketSaTopLeftCorner')] = utils
            .beamIntersectsY(
              points[prefixFunction('patchPocketSaTopLeft')],
              points[prefixFunction('patchPocketSaLeft')],
              points[prefixFunction('patchPocketSaTopLeft')].y + sa
            )
            .flipY(points[prefixFunction('patchPocketSaTopLeft')])

          points[prefixFunction('patchPocketSaPeakLeft')] = points[
            prefixFunction('patchPocketPeakLeftStart')
          ]
            .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
            .rotate(90, points[prefixFunction('patchPocketPeakLeftStart')])

          points[prefixFunction('patchPocketSaBottomLeft')] = utils.beamIntersectsY(
            points[prefixFunction('patchPocketTopLeft')]
              .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
              .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
            points[prefixFunction('patchPocketPeakLeftStart')]
              .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
              .rotate(90, points[prefixFunction('patchPocketPeakLeftStart')]),
            points[prefixFunction('patchPocketPeak')].y + sa
          )

          if (so.peakCurve > 0 && so.peakDepth > 0) {
            if (so.peakPlateau) {
              points[prefixFunction('patchPocketSaPeakLeftStart')] = utils.beamsIntersect(
                points[prefixFunction('patchPocketTopLeft')]
                  .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
                points[prefixFunction('patchPocketPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
                  .rotate(90, points[prefixFunction('patchPocketPeakLeftStart')]),
                points[prefixFunction('patchPocketPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketPeakLeftEnd')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketPeakLeftStart')]),
                points[prefixFunction('patchPocketPeakLeftEnd')]
                  .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
                  .rotate(90, points[prefixFunction('patchPocketPeakLeftEnd')])
              )
              if (so.peakCurve == 1 && so.peakDepth == 1 && so.peakDepth < 1) {
                points[prefixFunction('patchPocketSaPeakLeftEnd')] = utils.beamIntersectsX(
                  points[prefixFunction('patchPocketPeakLeftStart')]
                    .shiftTowards(points[prefixFunction('patchPocketPeakLeftEnd')], sa)
                    .rotate(-90, points[prefixFunction('patchPocketPeakLeftStart')]),
                  points[prefixFunction('patchPocketPeakLeftEnd')]
                    .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
                    .rotate(90, points[prefixFunction('patchPocketPeakLeftEnd')]),
                  points[prefixFunction('patchPocketPeak')].x
                )
              } else {
                points[prefixFunction('patchPocketSaPeakLeftEnd')] = utils.beamIntersectsY(
                  points[prefixFunction('patchPocketPeakLeftStart')]
                    .shiftTowards(points[prefixFunction('patchPocketPeakLeftEnd')], sa)
                    .rotate(-90, points[prefixFunction('patchPocketPeakLeftStart')]),
                  points[prefixFunction('patchPocketPeakLeftEnd')]
                    .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
                    .rotate(90, points[prefixFunction('patchPocketPeakLeftEnd')]),
                  points[prefixFunction('patchPocketPeak')].y + sa
                )
              }
            } else {
              points[prefixFunction('patchPocketSaPeakLeftStart')] = utils.beamsIntersect(
                points[prefixFunction('patchPocketTopLeft')]
                  .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
                points[prefixFunction('patchPocketPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
                  .rotate(90, points[prefixFunction('patchPocketPeakLeftStart')]),
                points[prefixFunction('patchPocketPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketPeak')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketPeakLeftStart')]),
                points[prefixFunction('patchPocketPeak')]
                  .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
                  .rotate(90, points[prefixFunction('patchPocketPeak')])
              )
              points[prefixFunction('patchPocketSaPeakLeftEnd')] = utils.beamIntersectsX(
                points[prefixFunction('patchPocketPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketPeak')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketPeakLeftStart')]),
                points[prefixFunction('patchPocketPeak')]
                  .shiftTowards(points[prefixFunction('patchPocketPeakLeftStart')], sa)
                  .rotate(90, points[prefixFunction('patchPocketPeak')]),
                points[prefixFunction('patchPocketPeak')].x
              )
            }
            let peakLeft
            let peakRight
            if (so.peakPlateau) {
              peakLeft = points[prefixFunction('patchPocketPeakLeftEnd')]
              peakRight = points[prefixFunction('patchPocketPeakRightStart')]
            } else {
              peakLeft = points[prefixFunction('patchPocketPeak')]
              peakRight = points[prefixFunction('patchPocketPeak')]
            }

            paths[prefixFunction('patchPocketSaCurveLeft')] = new Path()
              .move(points[prefixFunction('patchPocketPeakLeftStart')])
              .curve(
                points[prefixFunction('patchPocketPeakLeftStartCp2')],
                points[prefixFunction('patchPocketPeakLeftEndCp1')],
                peakLeft
              )
              .offset(sa)
              .hide()

            paths[prefixFunction('patchPocketSaCurveRight')] = new Path()
              .move(peakRight)
              .curve(
                points[prefixFunction('patchPocketPeakRightStartCp2')],
                points[prefixFunction('patchPocketPeakRightEndCp1')],
                points[prefixFunction('patchPocketPeakRightEnd')]
              )
              .offset(sa)
              .hide()
          }

          const drawSaLeftBase = () => {
            if (so.folded) {
              return new Path().move(points[prefixFunction('patchPocketSaLeft')])
            } else {
              return new Path()
                .move(points[prefixFunction('patchPocketSaTopLeftCorner')])
                .line(points[prefixFunction('patchPocketSaTopLeft')])
                .line(points[prefixFunction('patchPocketSaLeft')])
            }
          }

          const drawSaRightBase = () => {
            if (so.folded) {
              return new Path().line(points[prefixFunction('patchPocketSaLeft')].flipX())
            } else {
              return new Path()
                .line(points[prefixFunction('patchPocketSaLeft')].flipX())
                .line(points[prefixFunction('patchPocketSaTopLeft')].flipX())
                .move(points[prefixFunction('patchPocketSaTopLeftCorner')].flipX())
            }
          }

          paths[prefixFunction('patchPocketSaLeft')] = drawSaLeftBase()
            .line(points[prefixFunction('patchPocketSaPeakLeft')])
            .hide()

          paths[prefixFunction('patchPocketSaRight')] = new Path()
            .move(points[prefixFunction('patchPocketSaPeakLeft')].flipX())
            .join(drawSaRightBase())
            .hide()

          const drawSaLeft = () => {
            if (so.peakDepth == 0 || so.peakCurve == 0) {
              return paths[prefixFunction('patchPocketSaLeft')].line(
                points[prefixFunction('patchPocketSaBottomLeft')]
              )
            } else {
              if (so.style == 'straight')
                return paths[prefixFunction('patchPocketSaLeft')]
                  .line(points[prefixFunction('patchPocketSaPeakLeftStart')])
                  .line(points[prefixFunction('patchPocketSaPeakLeftEnd')])
              if (so.style == 'curved')
                return paths[prefixFunction('patchPocketSaLeft')].join(
                  paths[prefixFunction('patchPocketSaCurveLeft')]
                )
            }
          }

          const drawSaRight = () => {
            if (so.peakDepth == 0 || so.peakCurve == 0) {
              return new Path()
                .move(points[prefixFunction('patchPocketSaBottomLeft')].flipX())
                .line(points[prefixFunction('patchPocketSaPeakLeft')].flipX())
                .join(paths[prefixFunction('patchPocketSaRight')])
            } else {
              if (so.style == 'straight')
                return new Path()
                  .move(points[prefixFunction('patchPocketSaPeakLeftEnd')].flipX())
                  .line(points[prefixFunction('patchPocketSaPeakLeftStart')].flipX())
                  .join(paths[prefixFunction('patchPocketSaRight')])
              if (so.style == 'curved')
                return paths[prefixFunction('patchPocketSaCurveRight')].join(
                  paths[prefixFunction('patchPocketSaRight')]
                )
            }
          }

          paths[prefixFunction('patchPocketSaBase')] = drawSaLeft().join(drawSaRight()).hide()

          macro('mirror', {
            mirror: [
              points[prefixFunction('patchPocketTopLeft')],
              points[prefixFunction('patchPocketTopRight')],
            ],
            paths: [prefixFunction('patchPocketSaBase')],
            prefix: 'm',
          })

          const drawSaBase = () => {
            if (so.folded) {
              return paths[prefixFunction('patchPocketSaBase')].join(
                paths['m' + utils.capitalize(prefixFunction('patchPocketSaBase'))].reverse()
              )
            } else {
              return paths[prefixFunction('patchPocketSaBase')]
            }
          }

          paths[prefixFunction('patchPocketSa')] = drawSaBase()
            .line(drawSaLeft().start())
            .close()
            .attr('class', 'fabric sa')
            .unhide()

          if (!so.folded) {
            points[prefixFunction('patchPocketTopLeftFold')] = points[
              prefixFunction('patchPocketSaTopLeft')
            ].shift(
              0,
              points[prefixFunction('patchPocketSaLeft')].dist(
                points[prefixFunction('patchPocketTopLeft')]
              )
            )
            paths[prefixFunction('patchPocketSeamTop')] = new Path()
              .move(points[prefixFunction('patchPocketTopRight')])
              .line(
                points[prefixFunction('patchPocketTopLeftFold')].flipX(
                  points[prefixFunction('patchPocketTopMid')]
                )
              )
              .line(points[prefixFunction('patchPocketTopLeftFold')])
              .line(points[prefixFunction('patchPocketTopLeft')])
          }

          paths[prefixFunction('patchPocketFoldline')] = new Path()
            .move(points[prefixFunction('patchPocketTopLeft')])
            .line(points[prefixFunction('patchPocketTopRight')])
            .attr('class', 'various')
            .attr('data-text', 'Fold-line')
            .attr('data-text-class', 'center')
        }
      }
      return true
    },
  },
}

// More specifically named exports
export const patchPocketPlugin = plugin
export const pluginPatchPocket = plugin
