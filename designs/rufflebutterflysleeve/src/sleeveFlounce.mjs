import { sleeve } from './sleeve.mjs'

export const sleeveFlounce = {
  name: 'rufflebutterflysleeve.sleeveFlounce',
  after: sleeve,
  options: {
    //Sleeves
    sleeveFlounceType: {
      dflt: 'circular',
      list: ['circular', 'butterfly', 'square', 'diamond', 'star'],
      menu: 'sleeves',
    },
    sleeveFlounceButterfly: { deg: 20, min: 5, max: 45, menu: 'sleeves' },
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
    log,
  }) => {
    //measures
    const sleeveSlitWidth = store.get('sleeveSlitWidth')
    const innerRadius = sleeveSlitWidth * 2
    const slitFlounceLength = store.get('slitFlounceLength') - innerRadius * Math.PI

    //let's begin
    points.origin = new Point(0, 0)
    points.icLeft = points.origin.shift(180, innerRadius)
    points.icTop = points.icLeft.rotate(-90, points.origin)
    points.icRight = points.icLeft.rotate(180, points.origin)
    points.icCp1 = points.icLeft.shiftFractionTowards(
      points.origin.rotate(-90, points.icTop),
      options.cpFraction
    )
    points.icCp2 = points.icTop.shiftFractionTowards(
      points.origin.rotate(-90, points.icTop),
      options.cpFraction
    )
    points.icCp3 = points.icCp2.flipX(points.origin)
    points.icCp4 = points.icCp1.flipX(points.origin)

    paths.ic = new Path()
      .move(points.icLeft)
      .curve(points.icCp1, points.icCp2, points.icTop)
      .curve(points.icCp3, points.icCp4, points.icRight)
      .offset(-sleeveSlitWidth)
      .hide()

    //outercurve
    points.ocBottomLeft = points.icLeft.shift(-90, slitFlounceLength / 2)
    points.ocBottomRight = new Point(points.icRight.x, points.ocBottomLeft.y)

    const outerRadius = points.origin.dist(points.ocBottomRight)

    points.ocLeft = points.origin.shift(180, outerRadius)
    points.ocTop = points.ocLeft.rotate(-90, points.origin)
    points.ocRight = points.ocLeft.rotate(180, points.origin)

    //Uncomment for guide, please keep useful for when re-working
    // paths.guide = new Path()
    // .move(points.ocBottomRight)
    // .line(points.ocRight)
    // .line(points.ocTop)
    // .line(points.ocLeft)
    // .line(points.ocBottomLeft)
    // .line(points.icLeft)
    // .curve(points.icCp1, points.icCp2, points.icTop)
    // .curve(points.icCp3, points.icCp4, points.icRight)
    // .line(points.ocBottomRight)

    //styles

    points.ocCp3 = points.ocRight.shiftFractionTowards(
      points.origin.rotate(90, points.ocTop),
      options.cpFraction
    )
    points.ocCp4 = points.ocTop.shiftFractionTowards(
      points.origin.rotate(90, points.ocTop),
      options.cpFraction
    )
    if (options.sleeveFlounceType != 'circular') {
      if (options.sleeveFlounceType == 'butterfly') {
        points.butterfly0 = points.ocRight
          .shiftFractionTowards(points.origin, 1 / 3)
          .rotate(90, points.ocRight)
        points.butterfly1 = points.butterfly0.flipY(points.origin)
        points.butterfly2 = points.butterfly1.flipX(points.origin)
        points.butterfly3 = points.butterfly0.flipX(points.origin)
        points.butterflyCp1 = utils.beamsIntersect(
          points.butterfly0,
          points.ocRight.rotate(180 + options.sleeveFlounceButterfly, points.butterfly0),
          points.ocBottomRight,
          points.ocBottomRight.shift(0, 1)
        )
        points.butterflyCp2 = utils.beamsIntersect(
          points.butterflyCp1,
          points.butterfly0,
          points.ocRight,
          points.origin
        )
        points.butterflyCp3 = utils.beamsIntersect(
          points.butterflyCp2,
          points.butterfly1,
          points.ocTop,
          points.origin.rotate(90, points.ocTop)
        )
        points.butterflyCp4 = points.butterflyCp3.flipX(points.origin)
        points.butterflyCp5 = points.butterflyCp2.flipX(points.origin)
        points.butterflyCp6 = points.butterflyCp1.flipX(points.origin)

        paths.hemBase = new Path()
          .move(points.ocBottomRight)
          .curve_(points.butterflyCp1, points.butterfly0)
          .curve_(points.butterflyCp2, points.butterfly1)
          .curve_(points.butterflyCp3, points.ocTop)
          ._curve(points.butterflyCp4, points.butterfly2)
          ._curve(points.butterflyCp5, points.butterfly3)
          ._curve(points.butterflyCp6, points.ocBottomLeft)
          .hide()

        points.slitBottomLeft = utils.lineIntersectsCurve(
          paths.ic.start(),
          paths.ic.start().shift(-90, slitFlounceLength),
          points.butterfly3,
          points.butterfly3,
          points.butterflyCp6,
          points.ocBottomLeft
        )
      }
      if (options.sleeveFlounceType == 'square') {
        points.ocBottomRightCorner = new Point(points.ocRight.x, points.ocBottomRight.y)
        points.ocTopRightCorner = new Point(points.ocRight.x, points.ocTop.y)
        points.ocTopLeftCorner = points.ocTopRightCorner.flipX(points.origin)
        points.ocBottomLeftCorner = points.ocBottomRightCorner.flipX(points.origin)

        paths.hemBase = new Path()
          .move(points.ocBottomRight)
          .line(points.ocBottomRightCorner)
          .line(points.ocTopRightCorner)
          .line(points.ocTopLeftCorner)
          .line(points.ocBottomLeftCorner)
          .line(points.ocBottomLeft)
          .hide()

        points.slitBottomLeft = points.ocBottomLeft.shiftTowards(
          points.ocBottomLeftCorner,
          sleeveSlitWidth
        )
      }
      if (options.sleeveFlounceType == 'diamond') {
        paths.hemBase = new Path()
          .move(points.ocBottomRight)
          .line(points.ocRight)
          .line(points.ocTop)
          .line(points.ocLeft)
          .line(points.ocBottomLeft)
          .hide()

        points.slitBottomLeft = utils.beamsIntersect(
          paths.ic.start(),
          paths.ic.start().shift(-90, slitFlounceLength),
          points.ocLeft,
          points.ocBottomLeft
        )
      }
      if (options.sleeveFlounceType == 'star') {
        points.star3 = points.ocRight.shiftFractionTowards(points.ocTop, 0.5)
        points.star1 = points.star3.flipY(points.origin)
        points.star2 = points.ocRight.shift(0, points.ocRight.dist(points.star3) * 0.5)
        points.star4 = points.star2.rotate(90, points.origin)
        points.star5 = points.star3.flipX(points.origin)
        points.star6 = points.star2.flipX(points.origin)
        points.star7 = points.star1.flipX(points.origin)

        paths.hemBase = new Path()
          .move(points.ocBottomRight)
          .line(points.star1)
          .line(points.star2)
          .line(points.star3)
          .line(points.star4)
          .line(points.star5)
          .line(points.star6)
          .line(points.star7)
          .line(points.ocBottomLeft)
          .hide()

        points.slitBottomLeft = utils.beamsIntersect(
          paths.ic.start(),
          paths.ic.start().shift(-90, slitFlounceLength),
          points.star7,
          points.ocBottomLeft
        )
      }
    } else {
      points.ocCp5 = points.ocCp4.flipX(points.origin)
      points.ocCp6 = points.ocCp3.flipX(points.origin)

      const ocAngle = 360 - points.origin.angle(points.ocBottomRight)
      const ocCpDistance = (4 / 3) * outerRadius * Math.tan(utils.deg2rad(ocAngle / 4))
      points.ocCp1 = points.ocBottomRight
        .shiftTowards(points.origin, ocCpDistance)
        .rotate(-90, points.ocBottomRight)
      points.ocCp2 = points.ocRight
        .shiftTowards(points.origin, ocCpDistance)
        .rotate(90, points.ocRight)
      points.ocCp7 = points.ocCp2.flipX(points.origin)
      points.ocCp8 = points.ocCp1.flipX(points.origin)

      paths.hemBase = new Path()
        .move(points.ocBottomRight)
        .curve(points.ocCp1, points.ocCp2, points.ocRight)
        .curve(points.ocCp3, points.ocCp4, points.ocTop)
        .curve(points.ocCp5, points.ocCp6, points.ocLeft)
        .curve(points.ocCp7, points.ocCp8, points.ocBottomLeft)
        .hide()

      points.slitBottomLeft = utils.lineIntersectsCurve(
        paths.ic.start(),
        paths.ic.start().shift(-90, slitFlounceLength),
        points.ocLeft,
        points.ocCp7,
        points.ocCp8,
        points.ocBottomLeft
      )
    }

    paths.saBase = new Path()
      .move(points.ocBottomLeft)
      .line(points.icLeft)
      .curve(points.icCp1, points.icCp2, points.icTop)
      .curve(points.icCp3, points.icCp4, points.icRight)
      .line(points.ocBottomRight)
      .hide()

    paths.seam = paths.hemBase.join(paths.saBase).close()

    //slitSeam
    points.slitBottomRight = points.slitBottomLeft.flipX(points.origin)

    paths.slitSeam = new Path()
      .move(points.slitBottomLeft)
      .line(paths.ic.start())
      .join(paths.ic)
      .line(points.slitBottomRight)
      .attr('class', 'interfacing')
      .attr('data-text', 'Slit Seam - line')
      .attr('data-text-class', 'center')

    if (complete) {
      //grainline
      points.grainlineFrom = points.ocTop
      points.grainlineTo = points.icTop.shift(90, sleeveSlitWidth * 2)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['ocBottomLeft', 'ocBottomRight', 'icTop'],
      })
      //title
      points.title = points.icLeft.shiftFractionTowards(points.ocLeft, 0.65)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Ruffle Butterfly Sleeve Flounce',
        scale: 1 / 3,
      })

      if (sa) {
        const hemA = sa * options.sleeveHemWidth * 100
        points.saLeft = utils.beamsIntersect(
          paths.hemBase.offset(hemA).end(),
          points.ocBottomLeft.rotate(-90, paths.hemBase.offset(hemA).end()),
          points.icLeft,
          points.ocBottomLeft
        )
        points.saRight = points.saLeft.flipX(points.origin)

        paths.sa = paths.hemBase
          .offset(hemA)
          .line(points.saLeft)
          .line(points.ocBottomLeft)
          .join(paths.saBase)
          .line(points.saRight)
          .line(paths.hemBase.offset(hemA).start())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
