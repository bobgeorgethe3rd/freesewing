import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'jackson.front',
  from: frontBase,
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
  }) => {
    //let's begin
    if (options.frontPocketsBool) {
      if (options.daltonGuides) {
        paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
        paths.seam.hide()
        paths.sa.hide()
      }

      const drawOutseam = () => {
        if (options.fitKnee) {
          if (options.fitCalf) {
            if (points.seatOutAnchor.x < points.seatOut.x)
              return new Path()
                .move(points.waistOut)
                .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
                .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
                .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
            else
              return new Path()
                .move(points.waistOut)
                ._curve(points.seatOutCp1, points.seatOut)
                .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
                .curve(points.kneeOutCp2, points.calfOutCp1, points.calfOut)
                .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          } else {
            if (points.seatOutAnchor.x < points.seatOut.x)
              return new Path()
                .move(points.waistOut)
                .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
                .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
            else
              return new Path()
                .move(points.waistOut)
                ._curve(points.seatOutCp1, points.seatOut)
                .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
                .curve(points.kneeOutCp2, points.floorOutCp1, points.floorOut)
          }
        } else {
          if (options.fitCalf) {
            if (points.seatOutAnchor.x < points.seatOut.x)
              return new Path()
                .move(points.waistOut)
                .curve(points.seatOut, points.calfOutCp1, points.calfOut)
                .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
            else
              return new Path()
                .move(points.waistOut)
                ._curve(points.seatOutCp1, points.seatOut)
                .curve(points.seatOutCp2, points.calfOutCp1, points.calfOut)
                .curve(points.calfOutCp2, points.floorOutCp1, points.floorOut)
          } else {
            if (points.seatOutAnchor.x < points.seatOut.x)
              return new Path()
                .move(points.waistOut)
                .curve(points.seatOut, points.floorOutCp1, points.floorOut)
            else
              return new Path()
                .move(points.waistOut)
                ._curve(points.seatOutCp1, points.seatOut)
                .curve(points.seatOutCp2, points.floorOutCp1, points.floorOut)
          }
        }
      }
      //paths
      paths.outSeam = drawOutseam().split(points.frontPocketOpeningOut)[1].hide()
      paths.seam = paths.seam
        .split(points.frontPocketOpeningWaist)[0]
        .join(paths.pocketCurve)
        .join(paths.outSeam)
        .close()

      if (complete) {
        //notches
        macro('sprinkle', {
          snippet: 'notch',
          on: ['frontPocketOpeningWaist', 'frontPocketOpeningOut', 'frontPocketOut'],
        })
        //title
        macro('title', {
          nr: 4,
          title: 'Front',
          at: points.title,
          cutNr: 2,
          scale: 0.5,
        })
        if (sa) {
          paths.sa = paths.sa
            .split(points.saFrontPocketOpeningWaist)[0]
            .join(paths.pocketCurve.offset(sa))
            .line(points.saFrontPocketOpeningOut)
            .join(paths.outSeam.offset(sa * options.sideSeamSaWidth * 100))
            .line(points.saFloorOut)
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }
    return part
  },
}
