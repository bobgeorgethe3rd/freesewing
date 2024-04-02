import { name, version } from '../data.mjs'

export const plugin = {
  name,
  version,
  macros: {
    patchpocketflap: function (so, { points, Point, paths, Path, utils, complete, sa, macro }) {
      //Example shorthand, you may wish to add other elements like utils
      const defaults = {
        //note these are common examples and can be removed
        bottomWidth: 1,
        peakDepth: 0.5,
        peakCurve: 1,
        peakPlateau: true,
        style: 'curved',
        independent: false,
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
          if (pointName.match('patchPocketFlap')) delete points[pointName]
          if (pointName.match('PatchPocketFlap')) delete points[pointName]
        }

        for (const pathName in paths) {
          if (pathName.match('patchPocketFlap')) delete paths[pathName]
          if (pathName.match('PatchPocketFlap')) delete paths[pathName]
        }

        for (const snippetName in paths) {
          if (snippetName.match('patchPocketFlap')) delete snippets[snippetName]
          if (snippetName.match('PatchPocketFlap')) delete snippets[snippetName]
        }
        return true
      }
      //remove paths
      for (let i in paths) delete paths[i]
      //remove macros
      macro('title', false)
      //let's begin
      const flapBottomWidth =
        points[prefixFunction('patchPocketTopLeft')].dist(
          points[prefixFunction('patchPocketTopRight')]
        ) * so.bottomWidth

      points[prefixFunction('patchPocketFlapBottomMid')] = points[
        prefixFunction('patchPocketTopMid')
      ].shiftFractionTowards(points[prefixFunction('patchPocketBottomMid')], so.depth)
      if (so.independent) {
        points[prefixFunction('patchPocketFlapBottomLeft')] = points[
          prefixFunction('patchPocketFlapBottomMid')
        ].shift(180, flapBottomWidth / 2)
        points[prefixFunction('patchPocketFlapBottomLeftAnchor')] = points[
          prefixFunction('patchPocketFlapBottomMid')
        ].translate(flapBottomWidth / -2, 0.1)
      } else {
        points[prefixFunction('patchPocketFlapBottomLeft')] = utils.beamIntersectsY(
          points[prefixFunction('patchPocketTopLeft')],
          points[prefixFunction('patchPocketPeakLeft')],
          points[prefixFunction('patchPocketFlapBottomMid')].y
        )
        points[prefixFunction('patchPocketFlapBottomLeftAnchor')] = utils.beamIntersectsY(
          points[prefixFunction('patchPocketTopLeft')],
          points[prefixFunction('patchPocketPeakLeft')],
          points[prefixFunction('patchPocketFlapBottomMid')].y + 0.1
        )
      }
      if (so.depth != 0) {
        points[prefixFunction('patchPocketFlapBottomLeftAnchor')] =
          points[prefixFunction('patchPocketFlapBottomLeft')]
      }
      points[prefixFunction('patchPocketFlapBottomRight')] = points[
        prefixFunction('patchPocketFlapBottomLeft')
      ].flipX(points[prefixFunction('patchPocketFlapBottomMid')])

      const flapPeakDepth =
        points[prefixFunction('patchPocketFlapBottomLeft')].dist(
          points[prefixFunction('patchPocketFlapBottomRight')]
        ) *
        so.peakDepth *
        0.5
      //peak
      points[prefixFunction('patchPocketFlapPeak')] = points[
        prefixFunction('patchPocketFlapBottomMid')
      ].shift(-90, flapPeakDepth)
      points[prefixFunction('patchPocketFlapPeakLeft')] = utils.beamsIntersect(
        points[prefixFunction('patchPocketTopLeft')],
        points[prefixFunction('patchPocketFlapBottomLeftAnchor')],
        points[prefixFunction('patchPocketFlapPeak')],
        points[prefixFunction('patchPocketFlapPeak')].shift(180, 1)
      )

      if (
        points[prefixFunction('patchPocketFlapPeakLeft')].dist(
          points[prefixFunction('patchPocketFlapPeak')]
        ) <
        points[prefixFunction('patchPocketFlapPeakLeft')].dist(
          points[prefixFunction('patchPocketFlapBottomLeftAnchor')]
        )
      ) {
        points[prefixFunction('patchPocketFlapPeakLeftEnd')] = points[
          prefixFunction('patchPocketFlapPeakLeft')
        ].shiftFractionTowards(points[prefixFunction('patchPocketFlapPeak')], so.peakCurve)
        points[prefixFunction('patchPocketFlapPeakLeftStart')] = points[
          prefixFunction('patchPocketFlapPeakLeftEnd')
        ].rotate(
          points[prefixFunction('patchPocketFlapPeakLeft')].angle(
            points[prefixFunction('patchPocketFlapBottomLeftAnchor')]
          ),
          points[prefixFunction('patchPocketFlapPeakLeft')]
        )
      } else {
        points[prefixFunction('patchPocketFlapPeakLeftStart')] = points[
          prefixFunction('patchPocketFlapPeakLeft')
        ].shiftFractionTowards(
          points[prefixFunction('patchPocketFlapBottomLeftAnchor')],
          so.peakCurve
        )
        points[prefixFunction('patchPocketFlapPeakLeftEnd')] = points[
          prefixFunction('patchPocketFlapPeakLeftStart')
        ].rotate(
          -points[prefixFunction('patchPocketFlapPeakLeft')].angle(
            points[prefixFunction('patchPocketFlapBottomLeftAnchor')]
          ),
          points[prefixFunction('patchPocketFlapPeakLeft')]
        )
      }

      points[prefixFunction('patchPocketFlapPeakRightStart')] = points[
        prefixFunction('patchPocketFlapPeakLeftEnd')
      ].flipX(points[prefixFunction('patchPocketFlapPeak')])
      points[prefixFunction('patchPocketFlapPeakRightEnd')] = points[
        prefixFunction('patchPocketFlapPeakLeftStart')
      ].flipX(points[prefixFunction('patchPocketFlapPeak')])

      points[prefixFunction('patchPocketFlapPeakLeftAnchor')] = utils.beamsIntersect(
        points[prefixFunction('patchPocketFlapPeakLeftStart')],
        points[prefixFunction('patchPocketTopLeft')].rotate(
          -90,
          points[prefixFunction('patchPocketFlapPeakLeftStart')]
        ),
        points[prefixFunction('patchPocketFlapPeakLeftEnd')],
        points[prefixFunction('patchPocketFlapPeakLeftEnd')].shift(90, 1)
      )
      const radius = points[prefixFunction('patchPocketFlapPeakLeftAnchor')].dist(
        points[prefixFunction('patchPocketFlapPeakLeftStart')]
      )
      const angle =
        points[prefixFunction('patchPocketFlapPeakLeftAnchor')].angle(
          points[prefixFunction('patchPocketFlapPeakLeftEnd')]
        ) -
        points[prefixFunction('patchPocketFlapPeakLeftAnchor')].angle(
          points[prefixFunction('patchPocketFlapPeakLeftStart')]
        )

      const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

      points[prefixFunction('patchPocketFlapPeakLeftStartCp2')] = points[
        prefixFunction('patchPocketFlapPeakLeftStart')
      ].shiftTowards(points[prefixFunction('patchPocketFlapPeakLeft')], cpDistance)
      points[prefixFunction('patchPocketFlapPeakLeftEndCp1')] = points[
        prefixFunction('patchPocketFlapPeakLeftEnd')
      ].shiftTowards(points[prefixFunction('patchPocketFlapPeakLeft')], cpDistance)
      points[prefixFunction('patchPocketFlapPeakRightStartCp2')] = points[
        prefixFunction('patchPocketFlapPeakLeftEndCp1')
      ].flipX(points[prefixFunction('patchPocketFlapPeak')])
      points[prefixFunction('patchPocketFlapPeakRightEndCp1')] = points[
        prefixFunction('patchPocketFlapPeakLeftStartCp2')
      ].flipX(points[prefixFunction('patchPocketFlapPeak')])

      //paths
      let peakFrom
      let peakTo
      if (so.peakPlateau) {
        peakFrom = points[prefixFunction('patchPocketFlapPeakLeftEnd')]
        peakTo = points[prefixFunction('patchPocketFlapPeakRightStart')]
      } else {
        peakFrom = points[prefixFunction('patchPocketFlapPeak')]
        peakTo = points[prefixFunction('patchPocketFlapPeak')]
      }

      const drawSaBase = () => {
        if (so.style == 'straight')
          return new Path()
            .move(points[prefixFunction('patchPocketTopLeft')])
            .line(points[prefixFunction('patchPocketFlapPeakLeftStart')])
            .line(peakFrom)
            .line(peakTo)
            .line(points[prefixFunction('patchPocketFlapPeakRightEnd')])
            .line(points[prefixFunction('patchPocketTopRight')])
        if (so.style == 'curved')
          return new Path()
            .move(points[prefixFunction('patchPocketTopLeft')])
            .line(points[prefixFunction('patchPocketFlapPeakLeftStart')])
            .curve(
              points[prefixFunction('patchPocketFlapPeakLeftStartCp2')],
              points[prefixFunction('patchPocketFlapPeakLeftEndCp1')],
              peakFrom
            )
            .line(peakTo)
            .curve(
              points[prefixFunction('patchPocketFlapPeakRightStartCp2')],
              points[prefixFunction('patchPocketFlapPeakRightEndCp1')],
              points[prefixFunction('patchPocketFlapPeakRightEnd')]
            )
            .line(points[prefixFunction('patchPocketTopRight')])
      }
      paths[prefixFunction('patchPocketFlapSeam')] = drawSaBase()
        .line(points[prefixFunction('patchPocketTopLeft')])
        .close()

      if (complete) {
        //grainline
        points[prefixFunction('patchPocketFlapGrainlineFrom')] =
          points[prefixFunction('patchPocketTopMid')]
        points[prefixFunction('patchPocketFlapGrainlineTo')] =
          points[prefixFunction('patchPocketFlapPeak')]
        macro('grainline', {
          from: points[prefixFunction('patchPocketFlapGrainlineFrom')],
          to: points[prefixFunction('patchPocketFlapGrainlineTo')],
        })
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: [prefixFunction('patchPocketTopLeft'), prefixFunction('patchPocketTopRight')],
        })
        //title
        points[prefixFunction('patchPocketFlapTitle')] = new Point(
          points[prefixFunction('patchPocketTopRight')].x * (1 / 3),
          points[prefixFunction('patchPocketFlapPeak')].y / 2
        )
        if (sa) {
          points[prefixFunction('patchPocketFlapSaLeft')] = utils.beamIntersectsY(
            points[prefixFunction('patchPocketTopLeft')]
              .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
              .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
            points[prefixFunction('patchPocketFlapPeakLeftStart')]
              .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
              .rotate(90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
            points[prefixFunction('patchPocketTopLeft')].y
          )
          points[prefixFunction('patchPocketSaTopLeft')] = utils
            .beamIntersectsY(
              points[prefixFunction('patchPocketTopLeft')]
                .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
                .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
              points[prefixFunction('patchPocketFlapPeakLeftStart')]
                .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
                .rotate(90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
              points[prefixFunction('patchPocketTopLeft')].y + sa
            )
            .flipY(points[prefixFunction('patchPocketTopLeft')])

          points[prefixFunction('patchPocketFlapSaPeakLeft')] = points[
            prefixFunction('patchPocketFlapPeakLeftStart')
          ]
            .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
            .rotate(90, points[prefixFunction('patchPocketFlapPeakLeftStart')])

          points[prefixFunction('patchPocketFlapSaBottomLeft')] = utils.beamIntersectsY(
            points[prefixFunction('patchPocketTopLeft')]
              .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
              .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
            points[prefixFunction('patchPocketFlapPeakLeftStart')]
              .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
              .rotate(90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
            points[prefixFunction('patchPocketFlapPeak')].y + sa
          )

          if (so.peakCurve > 0 && so.peakDepth > 0) {
            if (so.peakPlateau) {
              points[prefixFunction('patchPocketFlapSaPeakLeftStart')] = utils.beamsIntersect(
                points[prefixFunction('patchPocketTopLeft')]
                  .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
                points[prefixFunction('patchPocketFlapPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
                  .rotate(90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
                points[prefixFunction('patchPocketFlapPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftEnd')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
                points[prefixFunction('patchPocketFlapPeakLeftEnd')]
                  .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
                  .rotate(90, points[prefixFunction('patchPocketFlapPeakLeftEnd')])
              )
              if (so.peakCurve == 1 && so.peakDepth == 1 && so.peakDepth < 1) {
                points[prefixFunction('patchPocketFlapSaPeakLeftEnd')] = utils.beamIntersectsX(
                  points[prefixFunction('patchPocketFlapPeakLeftStart')]
                    .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftEnd')], sa)
                    .rotate(-90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
                  points[prefixFunction('patchPocketFlapPeakLeftEnd')]
                    .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
                    .rotate(90, points[prefixFunction('patchPocketFlapPeakLeftEnd')]),
                  points[prefixFunction('patchPocketFlapPeak')].x
                )
              } else {
                points[prefixFunction('patchPocketFlapSaPeakLeftEnd')] = utils.beamIntersectsY(
                  points[prefixFunction('patchPocketFlapPeakLeftStart')]
                    .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftEnd')], sa)
                    .rotate(-90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
                  points[prefixFunction('patchPocketFlapPeakLeftEnd')]
                    .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
                    .rotate(90, points[prefixFunction('patchPocketFlapPeakLeftEnd')]),
                  points[prefixFunction('patchPocketFlapPeak')].y + sa
                )
              }
            } else {
              points[prefixFunction('patchPocketFlapSaPeakLeftStart')] = utils.beamsIntersect(
                points[prefixFunction('patchPocketTopLeft')]
                  .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
                points[prefixFunction('patchPocketFlapPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
                  .rotate(90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
                points[prefixFunction('patchPocketFlapPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketFlapPeak')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
                points[prefixFunction('patchPocketFlapPeak')]
                  .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
                  .rotate(90, points[prefixFunction('patchPocketFlapPeak')])
              )
              points[prefixFunction('patchPocketFlapSaPeakLeftEnd')] = utils.beamIntersectsX(
                points[prefixFunction('patchPocketFlapPeakLeftStart')]
                  .shiftTowards(points[prefixFunction('patchPocketFlapPeak')], sa)
                  .rotate(-90, points[prefixFunction('patchPocketFlapPeakLeftStart')]),
                points[prefixFunction('patchPocketFlapPeak')]
                  .shiftTowards(points[prefixFunction('patchPocketFlapPeakLeftStart')], sa)
                  .rotate(90, points[prefixFunction('patchPocketFlapPeak')]),
                points[prefixFunction('patchPocketFlapPeak')].x
              )
            }
            let peak
            if (so.peakPlateau) {
              peak = points[prefixFunction('patchPocketFlapPeakLeftEnd')]
            } else {
              peak = points[prefixFunction('patchPocketFlapPeak')]
            }

            paths[prefixFunction('patchPocketFlapSaCurve')] = new Path()
              .move(points[prefixFunction('patchPocketFlapPeakLeftStart')])
              .curve(
                points[prefixFunction('patchPocketFlapPeakLeftStartCp2')],
                points[prefixFunction('patchPocketFlapPeakLeftEndCp1')],
                peak
              )
              .offset(sa)
              .hide()
          }
          paths[prefixFunction('patchPocketFlapSaLeft')] = new Path()
            .move(points[prefixFunction('patchPocketSaTopLeft')])
            .line(points[prefixFunction('patchPocketFlapSaLeft')])
            .line(points[prefixFunction('patchPocketFlapSaPeakLeft')])
            .hide()

          const drawSa = () => {
            if (so.peakDepth == 0 || so.peakCurve == 0) {
              return paths[prefixFunction('patchPocketFlapSaLeft')].line(
                points[prefixFunction('patchPocketFlapSaBottomLeft')]
              )
            } else {
              if (so.style == 'straight')
                return paths[prefixFunction('patchPocketFlapSaLeft')]
                  .line(points[prefixFunction('patchPocketFlapSaPeakLeftStart')])
                  .line(points[prefixFunction('patchPocketFlapSaPeakLeftEnd')])
              if (so.style == 'curved')
                return paths[prefixFunction('patchPocketFlapSaLeft')].join(
                  paths[prefixFunction('patchPocketFlapSaCurve')]
                )
            }
          }

          paths[prefixFunction('patchPocketFlapSa')] = drawSa().hide()

          macro('mirror', {
            mirror: [
              points[prefixFunction('patchPocketTopMid')],
              points[prefixFunction('patchPocketFlapPeak')],
            ],
            paths: [prefixFunction('patchPocketFlapSa')],
            prefix: 'm',
          })

          paths[prefixFunction('patchPocketFlapSa')] = paths[prefixFunction('patchPocketFlapSa')]
            .join(paths['m' + utils.capitalize(prefixFunction('patchPocketFlapSa'))].reverse())
            .line(points[prefixFunction('patchPocketSaTopLeft')])
            .close()
            .attr('class', 'fabric sa')
        }
      }

      return true
    },
  },
}

// More specifically named exports
export const patchPocketFlapPlugin = plugin
export const pluginPatchPocketFlap = plugin
