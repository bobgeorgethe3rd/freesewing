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
        points.bottomLeft = points[prefixFunction('patchPocketFlapBottomMid')].shift(
          180,
          flapBottomWidth / 2
        )
        points.bottomLeftAnchor = points[prefixFunction('patchPocketFlapBottomMid')].translate(
          flapBottomWidth / -2,
          0.1
        )
      } else {
        points.bottomLeft = utils.beamIntersectsY(
          points[prefixFunction('patchPocketTopLeft')],
          points[prefixFunction('patchPocketPeakLeft')],
          points[prefixFunction('patchPocketFlapBottomMid')].y
        )
        points.bottomLeftAnchor = utils.beamIntersectsY(
          points[prefixFunction('patchPocketTopLeft')],
          points[prefixFunction('patchPocketPeakLeft')],
          points[prefixFunction('patchPocketFlapBottomMid')].y + 0.1
        )
      }
      if (so.depth != 0) {
        points.bottomLeftAnchor = points.bottomLeft
      }
      points.bottomRight = points.bottomLeft.flipX(
        points[prefixFunction('patchPocketFlapBottomMid')]
      )

      const flapPeakDepth = points.bottomLeft.dist(points.bottomRight) * so.peakDepth * 0.5
      //peak
      points.peak = points[prefixFunction('patchPocketFlapBottomMid')].shift(-90, flapPeakDepth)
      points.peakLeft = utils.beamsIntersect(
        points[prefixFunction('patchPocketTopLeft')],
        points.bottomLeftAnchor,
        points.peak,
        points.peak.shift(180, 1)
      )

      if (points.peakLeft.dist(points.peak) < points.peakLeft.dist(points.bottomLeftAnchor)) {
        points.peakLeftEnd = points.peakLeft.shiftFractionTowards(points.peak, so.peakCurve)
        points.peakLeftStart = points.peakLeftEnd.rotate(
          points.peakLeft.angle(points.bottomLeftAnchor),
          points.peakLeft
        )
      } else {
        points.peakLeftStart = points.peakLeft.shiftFractionTowards(
          points.bottomLeftAnchor,
          so.peakCurve
        )
        points.peakLeftEnd = points.peakLeftStart.rotate(
          -points.peakLeft.angle(points.bottomLeftAnchor),
          points.peakLeft
        )
      }

      points.peakRightStart = points.peakLeftEnd.flipX(points.peak)
      points.peakRightEnd = points.peakLeftStart.flipX(points.peak)

      points.peakLeftAnchor = utils.beamsIntersect(
        points.peakLeftStart,
        points[prefixFunction('patchPocketTopLeft')].rotate(-90, points.peakLeftStart),
        points.peakLeftEnd,
        points.peakLeftEnd.shift(90, 1)
      )
      const radius = points.peakLeftAnchor.dist(points.peakLeftStart)
      const angle =
        points.peakLeftAnchor.angle(points.peakLeftEnd) -
        points.peakLeftAnchor.angle(points.peakLeftStart)

      const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

      points.peakLeftStartCp2 = points.peakLeftStart.shiftTowards(points.peakLeft, cpDistance)
      points.peakLeftEndCp1 = points.peakLeftEnd.shiftTowards(points.peakLeft, cpDistance)
      points.peakRightStartCp2 = points.peakLeftEndCp1.flipX(points.peak)
      points.peakRightEndCp1 = points.peakLeftStartCp2.flipX(points.peak)

      //paths
      let peakFrom
      let peakTo
      if (so.peakPlateau) {
        peakFrom = points.peakLeftEnd
        peakTo = points.peakRightStart
      } else {
        peakFrom = points.peak
        peakTo = points.peak
      }

      const drawSaBase = () => {
        if (so.style == 'straight')
          return new Path()
            .move(points[prefixFunction('patchPocketTopLeft')])
            .line(points.peakLeftStart)
            .line(peakFrom)
            .line(peakTo)
            .line(points.peakRightEnd)
            .line(points[prefixFunction('patchPocketTopRight')])
        if (so.style == 'curved')
          return new Path()
            .move(points[prefixFunction('patchPocketTopLeft')])
            .line(points.peakLeftStart)
            .curve(points.peakLeftStartCp2, points.peakLeftEndCp1, peakFrom)
            .line(peakTo)
            .curve(points.peakRightStartCp2, points.peakRightEndCp1, points.peakRightEnd)
            .line(points[prefixFunction('patchPocketTopRight')])
      }
      paths.seam = drawSaBase().line(points[prefixFunction('patchPocketTopLeft')]).close()

      if (complete) {
        //grainline
        points.grainlineFrom = points[prefixFunction('patchPocketTopMid')]
        points.grainlineTo = points.peak
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: [prefixFunction('patchPocketTopLeft'), prefixFunction('patchPocketTopRight')],
        })
        //title
        points[prefixFunction('patchPocketFlapTitle')] = new Point(
          points[prefixFunction('patchPocketTopRight')].x * (1 / 3),
          points.peak.y / 2
        )
        if (sa) {
          points.saLeft = utils.beamIntersectsY(
            points[prefixFunction('patchPocketTopLeft')]
              .shiftTowards(points.peakLeftStart, sa)
              .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
            points.peakLeftStart
              .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
              .rotate(90, points.peakLeftStart),
            points[prefixFunction('patchPocketTopLeft')].y
          )
          points[prefixFunction('patchPocketSaTopLeft')] = utils
            .beamIntersectsY(
              points[prefixFunction('patchPocketTopLeft')]
                .shiftTowards(points.peakLeftStart, sa)
                .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
              points.peakLeftStart
                .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
                .rotate(90, points.peakLeftStart),
              points[prefixFunction('patchPocketTopLeft')].y + sa
            )
            .flipY(points[prefixFunction('patchPocketTopLeft')])

          points.saPeakLeft = points.peakLeftStart
            .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
            .rotate(90, points.peakLeftStart)

          points.saBottomLeft = utils.beamIntersectsY(
            points[prefixFunction('patchPocketTopLeft')]
              .shiftTowards(points.peakLeftStart, sa)
              .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
            points.peakLeftStart
              .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
              .rotate(90, points.peakLeftStart),
            points.peak.y + sa
          )

          if (so.peakCurve > 0 && so.peakDepth > 0) {
            if (so.peakPlateau) {
              points.saPeakLeftStart = utils.beamsIntersect(
                points[prefixFunction('patchPocketTopLeft')]
                  .shiftTowards(points.peakLeftStart, sa)
                  .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
                points.peakLeftStart
                  .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
                  .rotate(90, points.peakLeftStart),
                points.peakLeftStart
                  .shiftTowards(points.peakLeftEnd, sa)
                  .rotate(-90, points.peakLeftStart),
                points.peakLeftEnd
                  .shiftTowards(points.peakLeftStart, sa)
                  .rotate(90, points.peakLeftEnd)
              )
              if (so.peakCurve == 1 && so.peakDepth == 1 && so.peakDepth < 1) {
                points.saPeakLeftEnd = utils.beamIntersectsX(
                  points.peakLeftStart
                    .shiftTowards(points.peakLeftEnd, sa)
                    .rotate(-90, points.peakLeftStart),
                  points.peakLeftEnd
                    .shiftTowards(points.peakLeftStart, sa)
                    .rotate(90, points.peakLeftEnd),
                  points.peak.x
                )
              } else {
                points.saPeakLeftEnd = utils.beamIntersectsY(
                  points.peakLeftStart
                    .shiftTowards(points.peakLeftEnd, sa)
                    .rotate(-90, points.peakLeftStart),
                  points.peakLeftEnd
                    .shiftTowards(points.peakLeftStart, sa)
                    .rotate(90, points.peakLeftEnd),
                  points.peak.y + sa
                )
              }
            } else {
              points.saPeakLeftStart = utils.beamsIntersect(
                points[prefixFunction('patchPocketTopLeft')]
                  .shiftTowards(points.peakLeftStart, sa)
                  .rotate(-90, points[prefixFunction('patchPocketTopLeft')]),
                points.peakLeftStart
                  .shiftTowards(points[prefixFunction('patchPocketTopLeft')], sa)
                  .rotate(90, points.peakLeftStart),
                points.peakLeftStart
                  .shiftTowards(points.peak, sa)
                  .rotate(-90, points.peakLeftStart),
                points.peak.shiftTowards(points.peakLeftStart, sa).rotate(90, points.peak)
              )
              points.saPeakLeftEnd = utils.beamIntersectsX(
                points.peakLeftStart
                  .shiftTowards(points.peak, sa)
                  .rotate(-90, points.peakLeftStart),
                points.peak.shiftTowards(points.peakLeftStart, sa).rotate(90, points.peak),
                points.peak.x
              )
            }
            let peak
            if (so.peakPlateau) {
              peak = points.peakLeftEnd
            } else {
              peak = points.peak
            }

            paths.saCurve = new Path()
              .move(points.peakLeftStart)
              .curve(points.peakLeftStartCp2, points.peakLeftEndCp1, peak)
              .offset(sa)
              .hide()
          }
          paths.saLeft = new Path()
            .move(points[prefixFunction('patchPocketSaTopLeft')])
            .line(points.saLeft)
            .line(points.saPeakLeft)
            .hide()

          const drawSa = () => {
            if (so.peakDepth == 0 || so.peakCurve == 0) {
              return paths.saLeft.line(points.saBottomLeft)
            } else {
              if (so.style == 'straight')
                return paths.saLeft.line(points.saPeakLeftStart).line(points.saPeakLeftEnd)
              if (so.style == 'curved') return paths.saLeft.join(paths.saCurve)
            }
          }

          paths.sa = drawSa().hide()

          macro('mirror', {
            mirror: [points[prefixFunction('patchPocketTopMid')], points.peak],
            paths: ['sa'],
            prefix: 'm',
          })

          paths.sa = paths.sa
            .join(paths.mSa.reverse())
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
