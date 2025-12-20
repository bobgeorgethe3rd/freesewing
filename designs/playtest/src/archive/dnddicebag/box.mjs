import { pluginBundle } from '@freesewing/plugin-bundle'

export const box = {
  name: 'playtest.box',
  options: {
    //Constants
    cpFraction: 0.55191502449,
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
    absoluteOptions,
    complete,
    paperless,
    macro,
    measurements,
    part,
    snippets,
    Snippet,
  }) => {
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.translate(-21.5 * 12.7, -17.75 * 12.7)
    points.bottomLeft = points.topLeft.flipY(points.origin)
    points.bottomRight = points.bottomLeft.flipX(points.origin)
    points.topRight = points.bottomRight.flipY(points.origin)

    points.topLeftCorner = points.topLeft.translate(6.35, 6.35)
    points.bottomRightCorner = points.bottomRight.translate(-6.35, -6.35)
    points.topRightCorner = points.topRight.translate(-6.35, 6.35)
    points.bottomLeftCorner = points.bottomLeft.translate(6.35, -6.35)

    const innerDiameter = (points.topLeftCorner.dist(points.bottomRightCorner) - 76.2) / 2
    const outerDiameter = innerDiameter + 76.2

    points.outerRight = points.origin.shift(0, outerDiameter * 0.5)
    points.outerTop = points.outerRight.rotate(90, points.origin)
    points.outerLeft = points.outerTop.rotate(90, points.origin)
    points.outerBottom = points.outerLeft.rotate(90, points.origin)

    points.outerRightCp2 = points.outerRight.shift(90, points.outerRight.x * options.cpFraction)
    points.outerTopCp1 = points.outerTop.shift(0, points.outerRight.x * options.cpFraction)
    points.outerTopCp2 = points.outerTopCp1.flipX(points.origin)
    points.outerLeftCp1 = points.outerRightCp2.flipX(points.origin)
    points.outerLeftCp2 = points.outerLeftCp1.flipY(points.origin)
    points.outerBottomCp1 = points.outerTopCp2.flipY(points.origin)
    points.outerBottomCp2 = points.outerTopCp1.flipY(points.origin)
    points.outerRightCp1 = points.outerRightCp2.flipY(points.origin)

    points.innerTopLeftBottom = points.topLeftCorner.shift(-90, innerDiameter * 0.5)
    points.innerTopLeftRight = points.topLeftCorner.shift(0, 6 * 25.4)
    points.innerTopLeftBottomCp2 = points.innerTopLeftBottom.shift(
      0,
      points.topLeftCorner.dist(points.innerTopLeftRight) * options.cpFraction
    )
    points.innerTopLeftRightCp1 = points.innerTopLeftRight.shift(
      -90,
      points.topLeftCorner.dist(points.innerTopLeftBottom) * options.cpFraction
    )
    points.saInnerTopLeftBottom = new Point(points.topLeft.x, points.innerTopLeftBottom.y)
    points.saInnerTopLeftRight = new Point(points.innerTopLeftRight.x, points.topLeft.y)

    points.innerBottomLeftTop = points.innerTopLeftBottom.flipY(points.origin)
    points.innerBottomLeftRight = points.innerTopLeftRight.flipY(points.origin)
    points.innerBottomLeftTopCp1 = points.innerTopLeftBottomCp2.flipY(points.origin)
    points.innerBottomLeftRightCp2 = points.innerTopLeftRightCp1.flipY(points.origin)
    points.saInnerBottomLeftTop = new Point(points.topLeft.x, points.innerBottomLeftTop.y)
    points.saInnerBottomLeftRight = new Point(points.innerTopLeftRight.x, points.bottomLeft.y)

    points.innerBottomRightLeft = points.innerBottomLeftRight.flipX(points.origin)
    points.innerBottomRightTop = points.innerBottomLeftTop.flipX(points.origin)
    points.innerBottomRightLeftCp2 = points.innerBottomLeftRightCp2.flipX(points.origin)
    points.innerBottomRightTopCp1 = points.innerBottomLeftTopCp1.flipX(points.origin)
    points.saInnerBottomRightLeft = new Point(points.innerBottomRightLeft.x, points.bottomRight.y)
    points.saInnerBottomRightTop = new Point(points.bottomRight.x, points.innerBottomRightTop.y)

    points.innerTopRightBottom = points.innerBottomRightTop.flipY(points.origin)
    points.innerTopRightLeft = points.innerBottomRightLeft.flipY(points.origin)
    points.innerTopRightBottomCp2 = points.innerBottomRightTopCp1.flipY(points.origin)
    points.innerTopRightLeftCp1 = points.innerBottomRightLeftCp2.flipY(points.origin)
    points.saInnerTopRightBottom = new Point(points.topRight.x, points.innerTopRightBottom.y)
    points.saInnerTopRightLeft = new Point(points.innerTopRightLeft.x, points.topRight.y)

    paths.outline = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    paths.outerCircle = new Path()
      .move(points.outerRight)
      .curve(points.outerRightCp2, points.outerTopCp1, points.outerTop)
      .curve(points.outerTopCp2, points.outerLeftCp1, points.outerLeft)
      .curve(points.outerLeftCp2, points.outerBottomCp1, points.outerBottom)
      .curve(points.outerBottomCp2, points.outerRightCp1, points.outerRight)
      .close()

    paths.innerTopLeft = new Path()
      .move(points.saInnerTopLeftBottom)
      .line(points.innerTopLeftBottom)
      .curve(points.innerTopLeftBottomCp2, points.innerTopLeftRightCp1, points.innerTopLeftRight)
      .line(points.saInnerTopLeftRight)

    paths.innerBottomLeft = new Path()
      .move(points.saInnerBottomLeftRight)
      .line(points.innerBottomLeftRight)
      .curve(
        points.innerBottomLeftRightCp2,
        points.innerBottomLeftTopCp1,
        points.innerBottomLeftTop
      )
      .line(points.saInnerBottomLeftTop)

    paths.innerBottomRight = new Path()
      .move(points.saInnerBottomRightLeft)
      .line(points.innerBottomRightLeft)
      .curve(
        points.innerBottomRightLeftCp2,
        points.innerBottomRightTopCp1,
        points.innerBottomRightTop
      )
      .line(points.saInnerBottomRightTop)

    paths.topRight = new Path()
      .move(points.saInnerTopRightBottom)
      .line(points.innerTopRightBottom)
      .curve(points.innerTopRightBottomCp2, points.innerTopRightLeftCp1, points.innerTopRightLeft)
      .line(points.saInnerTopRightLeft)

    store.set('innerDiameter', innerDiameter)

    if (complete) {
      //grainline
      points.grainlineFrom = points.outerTop
      points.grainlineTo = points.outerBottom
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['outerRight', 'outerTop', 'outerLeft', 'outerBottom'],
      })
      //title
      points.titleOuter = new Point(points.outerRight.x * 0.25, points.origin.y)
      macro('title', {
        at: points.titleOuter,
        nr: 'Outer',
        title: 'Outer',
        scale: 0.5,
        cutNr: 2,
        prefix: 'outer',
      })
      points.titleTopLeft = points.topLeftCorner.shift(-45, innerDiameter * 0.25)
      macro('title', {
        at: points.titleTopLeft,
        nr: 'Inner',
        title: 'Inner',
        scale: 0.25,
        cutNr: 2,
        prefix: 'topLeft',
      })
      points.titleBottomLeft = points.titleTopLeft.flipY(points.origin)
      macro('title', {
        at: points.titleBottomLeft,
        nr: 'Inner',
        title: 'Inner',
        scale: 0.25,
        cutNr: 2,
        prefix: 'bottomLeft',
      })
      points.titleBottomRight = points.titleBottomLeft.flipX(points.origin)
      macro('title', {
        at: points.titleBottomRight,
        nr: 'Inner',
        title: 'Inner',
        scale: 0.25,
        cutNr: 2,
        prefix: 'bottomRight',
      })
      points.titleTopRight = points.titleBottomRight.flipY(points.origin)
      macro('title', {
        at: points.titleTopRight,
        nr: 'Inner',
        title: 'Inner',
        scale: 0.25,
        cutNr: 2,
        prefix: 'topRight',
      })
    }
    return part
  },
}
