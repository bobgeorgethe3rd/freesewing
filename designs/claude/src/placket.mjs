import { pocket } from './pocket.mjs'

export const placket = {
  name: 'claude.placket',
  after: pocket,
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Plackets
    placket: { bool: true, menu: 'plackets' },
    placketWidth: { pct: 5.9, min: 5, max: 8, menu: 'plackets' },
    placketLength: { pct: 18.9, min: 10, max: 25, menu: 'plackets' },
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
    log,
    absoluteOptions,
  }) => {
    //set Render
    if (!options.placket || options.waistbandElastic) {
      store.set('placketWidth', 0)
      part.hide()
      return part
    }
    //measures
    let width = measurements.waist * options.placketWidth
    let length
    if (options.pocketsBool) {
      const pocketOpeningLength = store.get('pocketOpeningLength')
      if (pocketOpeningLength > measurements.waistToFloor * options.placketLength) {
        length = pocketOpeningLength * (1 + options.placketLength)
      } else {
        length = measurements.waistToFloor * options.placketLength
      }
    } else {
      length = measurements.waistToFloor * options.placketLength
    }
    //let's begin
    points.topLeft = new Point(0, 0)
    points.bottomLeft = points.topLeft.shift(-90, length)
    points.topRight = points.topLeft.shift(0, width)
    points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
    points.bottomCurveEnd = points.bottomRight.shiftFractionTowards(points.bottomLeft, 0.25)
    points.bottomCurveStart = points.bottomCurveEnd.rotate(90, points.bottomLeft)
    points.bottomCp1 = points.bottomCurveStart.shiftFractionTowards(
      points.bottomLeft,
      options.cpFraction
    )
    points.bottomCp2 = points.bottomCurveEnd.shiftFractionTowards(
      points.bottomLeft,
      options.cpFraction
    )
    //guide
    paths.saBottom = new Path()
      .move(points.bottomCurveStart)
      .curve(points.bottomCp1, points.bottomCp2, points.bottomCurveEnd)
      .line(points.bottomRight)
      .hide()

    paths.seam = paths.saBottom
      .clone()
      .line(points.topRight)
      .line(points.topLeft)
      .line(points.bottomCurveStart)
      .close()
      .unhide()

    //stores
    store.set('placketWidth', width)

    if (complete) {
      //grainline
      points.grainlineTo = points.bottomCurveEnd
      points.grainlineFrom = new Point(points.grainlineTo.x, points.topLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
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
        nr: '5',
        title: 'Placket',
        scale: 1 / 3,
      })

      if (sa) {
        points.saBottomRight = points.bottomRight.translate(sa, sa)
        points.saTopRight = points.topRight.translate(sa, -sa)
        points.saTopLeft = points.topLeft.translate(-sa, -sa)
        points.saBottomCurveStart = points.bottomCurveStart.shift(180, sa)

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
