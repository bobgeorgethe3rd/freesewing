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
    //measures
    const flyShieldEx = store.get('flyShieldEx')
    //paths
    paths.flyShieldEx = paths.crotchSeam
      .split(points.flyShieldCrotch)[0]
      .line(points.flyShieldExCrotch)
      .join(
        paths.crotchSeam
          .split(points.flyShieldCrotch)[1]
          .split(points.crotchSeamCurveEnd)[0]
          .offset(flyShieldEx)
      )
      .line(points.flyShieldExWaist)
      .line(points.waistIn)

    if (complete) {
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['flyCrotch', 'flyShieldCrotch'],
      })
      //detail paths
      paths.flyShieldExDetail = paths.flyShieldEx
        .split(points.flyShieldExWaist)[0]
        .attr('class', 'fabric hidden')
        .attr('data-text', 'Right Leg Exstention')
        .attr('data-text-class', 'right')

      paths.placketCurve
        .line(points.flyCrotch)
        .unhide()
        .attr('class', 'mark sa')
        .attr('data-text', 'Fly Stitching Line')
        .attr('data-text-class', 'center')
      if (sa) {
        const crotchSeamSa = sa * options.crotchSeamSaWidth * 100

        points.saFlyShieldCrotchSplit = paths.crotchSeam
          .offset(crotchSeamSa)
          .intersects(
            new Path()
              .move(
                points.flyShieldCrotch.shift(
                  points.waistIn.angle(points.crotchSeamCurveEnd),
                  flyShieldEx
                )
              )
              .line(points.saFlyShieldExCrotch)
          )[0]

        paths.saFlyShieldExDetail = paths.crotchSeam
          .clone()
          .offset(crotchSeamSa)
          .split(points.saFlyShieldCrotchSplit)[0]
          .line(points.saFlyShieldExCrotch)
          .join(
            paths.crotchSeam
              .clone()
              .split(points.crotchSeamCurveEnd)[0]
              .split(points.flyShieldCrotch)[1]
              .offset(crotchSeamSa + flyShieldEx)
          )
          .line(points.saWaistInEx)
          .attr('class', 'fabric hidden')
          .attr('data-text', 'Right Leg SA Extension')
          .attr('data-text-class', 'right')
        paths.saFlyShieldEx = paths.saFlyShieldExDetail
          .clone()
          .line(points.saWaistInExCorner)
          .line(points.saWaistIn)
          .attr('class', 'fabric sa', true)
          .attr('data-text', '', true)
      }
    }
    //let's begin
    if (options.frontPocketsBool) {
      if (options.daltonGuides) {
        paths.daltonGuide = paths.seam.clone().attr('class', 'various lashed')
        paths.seam.hide()
        paths.sa.hide()
      }

      const drawOutseam = () => {
        if (options.fitKnee) {
          if (points.seatOutAnchor.x < points.seatOut.x)
            return new Path()
              .move(points.waistOut)
              .curve(points.seatOut, points.kneeOutCp1, points.kneeOut)
              ._curve(points.floorOutCp1, points.floorOut)
          else
            return new Path()
              .move(points.waistOut)
              ._curve(points.seatOutCp1, points.seatOut)
              .curve(points.seatOutCp2, points.kneeOutCp1, points.kneeOut)
              ._curve(points.floorOutCp1, points.floorOut)
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
