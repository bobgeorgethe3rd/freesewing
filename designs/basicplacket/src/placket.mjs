import { pluginBundle } from '@freesewing/plugin-bundle'

export const placket = {
  name: 'basicplacket.placket',
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Plackets
    placketWidth: { pct: 5.1, min: 5, max: 8, menu: 'plackets' },
    placketLength: { pct: 15.9, min: 10, max: 25, menu: 'plackets' },
    placketCurve: { pct: 100, min: 0, max: 100, menu: 'plackets' },
    //Construction
    placketOnFold: { bool: false, menu: 'construction' },
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
    void store.setIfUnset('placketWidth', 795 * options.placketWidth)
    void store.setIfUnset('placketLength', 1070 * options.placketLength)
    void store.setIfUnset('placketSideSeamSa', sa)
    const placketWidth = store.get('placketWidth')
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, store.get('placketLength'))
    points.topRight = points.topLeft.shift(0, placketWidth)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
    points.bottomCurveEnd = points.bottomLeft.shiftFractionTowards(
      points.bottomRight,
      0.75 * options.placketCurve
    )
    points.bottomCurveStart = points.bottomCurveEnd.rotate(90, points.bottomLeft)
    points.bottomCurveStartCp2 = points.bottomCurveStart.shiftFractionTowards(
      points.bottomLeft,
      options.cpFraction
    )
    points.bottomCurveEndCp1 = points.bottomCurveEnd.shiftFractionTowards(
      points.bottomLeft,
      options.cpFraction
    )
    //paths
    paths.saBottom = new Path()
      .move(points.bottomCurveStart)
      .curve(points.bottomCurveStartCp2, points.bottomCurveEndCp1, points.bottomCurveEnd)
      .line(points.bottomRight)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .line(points.topRight)
      .line(points.topLeft)
      .line(points.bottomCurveStart)
      .close()
      .unhide()

    if (complete) {
      //grainline
      if (options.placketOnFold) {
        points.cutOnFoldFrom = points.topLeft
        points.cutOnFoldTo = points.bottomCurveStart
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.bottomCurveEnd
        points.grainlineFrom = new Point(points.grainlineTo.x, points.topLeft.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      if (options.closurePosition == 'side') {
        points.pocketOpeningNotch0 = points.topRight.shift(-90, pocketOpening)
        points.pocketOpeningNotch1 = points.topRight.shift(-90, pocketOpeningLength)
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningNotch0', 'pocketOpeningNotch1'],
        })
      }
      //titles
      points.title = new Point(points.topRight.x / 8, points.bottomLeft.y / 2)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Placket',
        cutNr: 2,
        scale: 1 / 3,
      })

      if (sa) {
        const placketSideSeamSa = store.get('placketSideSeamSa')
        const placketSa = options.placketOnFold ? 0 : sa

        points.saBottomRight = points.bottomRight.translate(placketSideSeamSa, sa)
        points.saTopRight = points.topRight.translate(placketSideSeamSa, -sa)
        points.saTopLeft = points.topLeft.translate(-placketSa, -sa)
        points.saBottomCurveStart =
          options.placketCurve == 0 && !options.placketOnFold
            ? points.bottomCurveEnd.translate(-placketSa, sa)
            : points.bottomCurveStart.shift(180, placketSa)

        paths.sa = paths.saBottom
          .offset(sa)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .line(points.saBottomCurveStart)
          .close()
          .attr('class', 'fabric sa')
      }
    }
    return part
  },
}
