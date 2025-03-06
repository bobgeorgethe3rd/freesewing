import { pocket as patchPocket } from '@freesewing/patchpocket'
import { front } from './front.mjs'

export const pocket = {
  name: 'fauna.pocket',
  after: front,
  options: {
    //Imported
    ...patchPocket.options,
    //Constant
    patchPocketFolded: false, //Locked for Fauna
    patchPocketGrainlineBias: false, //Locked for Fauna
    //Pockets
    pockets: { bool: true, menu: 'pockets' },
    patchPocketDepth: { pct: 33.3, min: 20, max: 35, menu: 'pockets.patchPockets' },
    patchPocketPeakDepth: { pct: 0, min: 0, max: 100, menu: 'pockets.patchPockets' }, //Altered for Fauna
    patchPocketPeakPlateau: { bool: false, menu: 'pockets.patchPockets' }, //Altered for Fauna
    patchPocketStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPockets',
    }, //Altered for Fauna
    // indpendentPatchPocketFlap: { bool : true, menu: 'pockets'},
    patchPocketFlap: { bool: true, menu: 'pockets' },
    patchPocketFlapStyle: {
      dflt: 'straight',
      list: ['straight', 'curved'],
      menu: 'pockets.patchPocketsFlaps',
    },
    patchPocketPeakFlapCurve: { pct: 100, min: 0, max: 100, menu: 'pockets.patchPocketsFlaps' },
    patchPocketPeakFlapDepth: { pct: 50, min: 0, max: 100, menu: 'pockets.patchPocketsFlaps' },
    patchPocketPeakFlapPlateau: { bool: false, menu: 'pockets.patchPocketsFlaps' },
    //Construction
    patchPocketTopFoldWidth: { pct: 30, min: 10, max: 50, menu: 'construction' }, //Altered for Fauna
  },
  plugins: [...patchPocket.plugins],
  draft: (sh) => {
    //draft
    const {
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
      snippets,
      Snippet,
      part,
    } = sh
    if (!options.pockets) {
      part.hide()
      return part
    }
    store.set('patchPocketDepth', measurements.hpsToWaistBack * options.patchPocketDepth)
    patchPocket.draft(sh)
    //option set
    // if (!options.indpendentPatchPocketFlap) {
    // options.patchPocketFlapStyle = options.patchPocketStyle
    // options.patchPocketPeakFlapCurve = options.patchPocketPeakCurve
    // options.patchPocketPeakFlapDepth = options.patchPocketPeakDepth
    // options.patchPocketPeakFlapPlateau = options.patchPocketPeakPlateau
    // }
    //let's begin
    if (options.patchPocketFlap && options.patchPocketPeakFlapDepth > 0) {
      const prefixFunction = (string) =>
        'patchPocket' + string.charAt(0).toUpperCase() + string.slice(1)

      points[prefixFunction('topRightFold')] = points[prefixFunction('topLeftFold')].flipX()
      points[prefixFunction('topMidFold')] = new Point(0, points[prefixFunction('topLeftFold')].y)
      points[prefixFunction('peakFold')] = points[prefixFunction('topMidFold')].shift(
        90,
        points[prefixFunction('topRight')].x * options.patchPocketPeakFlapDepth
      )
      points[prefixFunction('peakLeftFold')] = utils.beamIntersectsY(
        points[prefixFunction('topLeft')],
        points[prefixFunction('topLeftFold')],
        points[prefixFunction('peakFold')].y
      )

      points[prefixFunction('peakLeftFoldEnd')] = points[
        prefixFunction('peakLeftFold')
      ].shiftFractionTowards(
        points[prefixFunction('topLeftFold')],
        options.patchPocketPeakFlapCurve
      )
      points[prefixFunction('peakLeftFoldStart')] = points[prefixFunction('peakLeftFold')].shift(
        0,
        points[prefixFunction('peakLeftFoldEnd')].dist(points[prefixFunction('peakLeftFold')])
      )

      points[prefixFunction('peakLeftFoldAnchor')] = utils.beamIntersectsX(
        points[prefixFunction('peakLeftFoldEnd')],
        points[prefixFunction('topLeft')].rotate(90, points[prefixFunction('peakLeftFoldEnd')]),
        points[prefixFunction('peakLeftFoldStart')].x
      )

      const radius = points[prefixFunction('peakLeftFoldAnchor')].dist(
        points[prefixFunction('peakLeftFoldStart')]
      )
      const angle =
        points[prefixFunction('peakLeftFoldAnchor')].angle(
          points[prefixFunction('peakLeftFoldEnd')]
        ) -
        points[prefixFunction('peakLeftFoldAnchor')].angle(
          points[prefixFunction('peakLeftFoldStart')]
        )
      const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)

      points[prefixFunction('peakLeftFoldStartCp2')] = points[
        prefixFunction('peakLeftFoldStart')
      ].shift(180, cpDistance)
      points[prefixFunction('peakLeftFoldEndCp1')] = points[
        prefixFunction('topLeft')
      ].shiftOutwards(points[prefixFunction('peakLeftFoldEnd')], cpDistance)

      points[prefixFunction('peakRightFoldEnd')] =
        points[prefixFunction('peakLeftFoldStart')].flipX()
      points[prefixFunction('peakRightFoldStart')] =
        points[prefixFunction('peakLeftFoldEnd')].flipX()
      points[prefixFunction('peakRightFoldStartCp2')] =
        points[prefixFunction('peakLeftFoldEndCp1')].flipX()
      points[prefixFunction('peakRightFoldEndCp1')] =
        points[prefixFunction('peakLeftFoldStartCp2')].flipX()

      //paths
      const drawSeamTop = () => {
        if (options.patchPocketFlapStyle == 'straight') {
          if (options.patchPocketPeakFlapPlateau) {
            return new Path()
              .move(points[prefixFunction('topRight')])
              .line(points[prefixFunction('peakRightFoldStart')])
              .line(points[prefixFunction('peakRightFoldEnd')])
              .line(points[prefixFunction('peakLeftFoldStart')])
              .line(points[prefixFunction('peakLeftFoldEnd')])
              .line(points[prefixFunction('topLeft')])
          } else {
            return new Path()
              .move(points[prefixFunction('topRight')])
              .line(points[prefixFunction('peakRightFoldStart')])
              .line(points[prefixFunction('peakFold')])
              .line(points[prefixFunction('peakLeftFoldEnd')])
              .line(points[prefixFunction('peakLeftFoldEnd')])
              .line(points[prefixFunction('topLeft')])
          }
        } else {
          if (options.patchPocketPeakFlapPlateau) {
            return new Path()
              .move(points[prefixFunction('topRight')])
              .line(points[prefixFunction('peakRightFoldStart')])
              .curve(
                points[prefixFunction('peakRightFoldStartCp2')],
                points[prefixFunction('peakRightFoldEndCp1')],
                points[prefixFunction('peakRightFoldEnd')]
              )
              .line(points[prefixFunction('peakLeftFoldStart')])
              .curve(
                points[prefixFunction('peakLeftFoldStartCp2')],
                points[prefixFunction('peakLeftFoldEndCp1')],
                points[prefixFunction('peakLeftFoldEnd')]
              )
              .line(points[prefixFunction('topLeft')])
          } else {
            return new Path()
              .move(points[prefixFunction('topRight')])
              .line(points[prefixFunction('peakRightFoldStart')])
              .curve(
                points[prefixFunction('peakRightFoldStartCp2')],
                points[prefixFunction('peakRightFoldEndCp1')],
                points[prefixFunction('peakFold')]
              )
              .curve(
                points[prefixFunction('peakLeftFoldStartCp2')],
                points[prefixFunction('peakLeftFoldEndCp1')],
                points[prefixFunction('peakLeftFoldEnd')]
              )
              .line(points[prefixFunction('topLeft')])
          }
        }
      }
      paths[prefixFunction('seamTop')] = drawSeamTop()

      if (sa) {
        if (options.patchPocketPeakFlapCurve == 0) {
          points[prefixFunction('saPeakLeftFold')] = utils.beamIntersectsY(
            points[prefixFunction('saLeft')],
            points[prefixFunction('saLeft')].shift(
              points[prefixFunction('topLeft')].angle(points[prefixFunction('topLeftFold')]),
              1
            ),
            points[prefixFunction('peakFold')].y - sa
          )

          points[prefixFunction('saPeakRightFold')] =
            points[prefixFunction('saPeakLeftFold')].flipX()
        } else {
          if (options.patchPocketPeakFlapPlateau) {
            points[prefixFunction('saPeakLeftFoldEnd')] = utils.beamsIntersect(
              points[prefixFunction('peakLeftFoldStart')]
                .shiftTowards(points[prefixFunction('peakLeftFoldEnd')], sa)
                .rotate(-90, points[prefixFunction('peakLeftFoldStart')]),
              points[prefixFunction('peakLeftFoldEnd')]
                .shiftTowards(points[prefixFunction('peakLeftFoldStart')], sa)
                .rotate(90, points[prefixFunction('peakLeftFoldEnd')]),
              points[prefixFunction('saLeft')],
              points[prefixFunction('saLeft')].shift(
                points[prefixFunction('topLeft')].angle(points[prefixFunction('topLeftFold')]),
                1
              )
            )
            points[prefixFunction('saPeakLeftFoldStart')] = utils.beamIntersectsY(
              points[prefixFunction('saPeakLeftFoldEnd')],
              points[prefixFunction('saPeakLeftFoldEnd')].shift(
                points[prefixFunction('peakLeftFoldEnd')].angle(
                  points[prefixFunction('peakLeftFoldStart')]
                ),
                1
              ),
              points[prefixFunction('peakFold')].y - sa
            )
          } else {
            points[prefixFunction('saPeakLeftFoldEnd')] = utils.beamsIntersect(
              points[prefixFunction('peakFold')]
                .shiftTowards(points[prefixFunction('peakLeftFoldEnd')], sa)
                .rotate(-90, points[prefixFunction('peakFold')]),
              points[prefixFunction('peakLeftFoldEnd')]
                .shiftTowards(points[prefixFunction('peakFold')], sa)
                .rotate(90, points[prefixFunction('peakLeftFoldEnd')]),
              points[prefixFunction('saLeft')],
              points[prefixFunction('saLeft')].shift(
                points[prefixFunction('topLeft')].angle(points[prefixFunction('topLeftFold')]),
                1
              )
            )
            points[prefixFunction('saPeakLeftFoldStart')] = utils.beamIntersectsX(
              points[prefixFunction('saPeakLeftFoldEnd')],
              points[prefixFunction('saPeakLeftFoldEnd')].shift(
                points[prefixFunction('peakLeftFoldEnd')].angle(points[prefixFunction('peakFold')]),
                1
              ),
              points[prefixFunction('peakFold')].x
            )
          }
          points[prefixFunction('saPeakRightFoldStart')] =
            points[prefixFunction('saPeakLeftFoldEnd')].flipX()
          points[prefixFunction('saPeakRightFoldEnd')] =
            points[prefixFunction('saPeakLeftFoldStart')].flipX()
        }

        const drawSaTop = () => {
          if (options.patchPocketPeakFlapCurve == 0) {
            return new Path()
              .line(points[prefixFunction('saPeakRightFold')])
              .line(points[prefixFunction('saPeakLeftFold')])
              .line(points[prefixFunction('saLeft')])
          } else {
            if (options.patchPocketFlapStyle == 'straight') {
              return new Path()
                .line(points[prefixFunction('saPeakRightFoldStart')])
                .line(points[prefixFunction('saPeakRightFoldEnd')])
                .line(points[prefixFunction('saPeakLeftFoldStart')])
                .line(points[prefixFunction('saPeakLeftFoldEnd')])
                .line(points[prefixFunction('saLeft')])
            } else {
              return drawSeamTop().offset(sa)
            }
          }
        }

        paths[prefixFunction('sa')] = paths[prefixFunction('sa')]
          .split(points[prefixFunction('saLeft')])[1]
          .split(points[prefixFunction('saLeft')].flipX())[0]
          .join(drawSaTop())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    if (complete) {
      //title
      macro('title', {
        nr: 6,
        title: 'Pocket',
        at: points.patchPocketTitle,
        cutNr: options.patchPocketFlap ? 4 : 2,
        scale: 1 / 3,
      })
    }

    return part
  },
}
