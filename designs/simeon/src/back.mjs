import { back as backDalton } from '@freesewing/dalton'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { front } from './front.mjs'

export const back = {
  name: 'simeon.back',
  from: backDalton,
  after: front,
  hide: {
    from: true,
  },
  options: {
    //Constants
    backDartWidth: 0, //Locked for Simeon
    backDartDepth: 0, //Locked for Simeon
    backDartMultiplier: 0.95, //Locked for Simeon
    backDartPlacement: 0.625, //Locked for Simeon
    //Construction
    crossSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' }, //Altered for Simeon
  },
  plugins: [pluginLogoRG],
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
    //let's begin
    if (options.frontPocketsBool) {
      const frontPocketOpeningTopDepth = store.get('frontPocketOpeningTopDepth')
      const drawOutseam = () => {
        if (options.fitKnee) {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.floorOut)
              .curve_(points.floorOutCp2, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOut, points.waistOut)
          else
            return new Path()
              .move(points.floorOut)
              .curve_(points.floorOutCp2, points.kneeOut)
              .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
              .curve_(points.seatOutCp2, points.waistOut)
        } else {
          if (points.seatOutAnchor.x > points.seatOut.x)
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.seatOut, points.waistOut)
          else
            return new Path()
              .move(points.floorOut)
              .curve(points.floorOutCp2, points.seatOutCp1, points.seatOut)
              .curve_(points.seatOutCp2, points.waistOut)
        }
      }
      points.frontPocketOpeningTopOut = drawOutseam()
        .reverse()
        .shiftAlong(frontPocketOpeningTopDepth)
      points.frontPocketOpeningBottomOut = drawOutseam()
        .reverse()
        .shiftAlong(frontPocketOpeningTopDepth + store.get('frontPocketOpeningDepth'))
      if (complete) {
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: ['frontPocketOpeningTopOut', 'frontPocketOpeningBottomOut'],
        })
      }
    }

    if (complete) {
      //logo
      points.logo = points.knee
      macro('logorg', { at: points.logo, scale: 0.5 })
    }

    return part
  },
}
