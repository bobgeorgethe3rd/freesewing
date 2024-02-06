import { pluginBundle } from '@freesewing/plugin-bundle'

export const crown = {
  name: 'mildred.crown',
  plugins: [pluginBundle],
  options: {
    //Fit
    headEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    //Style
    crownLength: { pct: 45, min: 30, max: 200, menu: 'style' },
    crownNumber: { count: 1, min: 1, max: 20, menu: 'style' },
    //Construction
    crownHemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  measurements: ['head'],
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
    log,
  }) => {
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    const headCircumference = store.get('headCircumference')
    const headRadius = headCircumference / 2 / Math.PI
    const crownLength = Math.sqrt(
      Math.pow(headCircumference * options.crownLength, 2) + Math.pow(headRadius, 2)
    )
    const arcAngle = utils.rad2deg(headCircumference / crownLength) / options.crownNumber
    const crownCpDistance = (4 / 3) * crownLength * Math.tan(utils.deg2rad(arcAngle / 8))
    //let's begin
    points.origin = new Point(0, 0)

    points.bottomLeft = points.origin.shift(-90, crownLength)
    points.bottomMid = points.bottomLeft.rotate(arcAngle / 2, points.origin)
    points.bottomRight = points.bottomLeft.rotate(arcAngle, points.origin)

    //control points
    points.bottomLeftCp2 = points.bottomLeft
      .shiftTowards(points.origin, crownCpDistance)
      .rotate(-90, points.bottomLeft)
    points.bottomMidCp1 = points.bottomMid
      .shiftTowards(points.origin, crownCpDistance)
      .rotate(90, points.bottomMid)
    points.bottomMidCp2 = points.bottomMid
      .shiftTowards(points.origin, crownCpDistance)
      .rotate(-90, points.bottomMid)
    points.bottomRightCp1 = points.bottomRight
      .shiftTowards(points.origin, crownCpDistance)
      .rotate(90, points.bottomRight)

    //paths
    paths.hemBase = new Path()
      .move(points.bottomLeft)
      .curve(points.bottomLeftCp2, points.bottomMidCp1, points.bottomMid)
      .curve(points.bottomMidCp2, points.bottomRightCp1, points.bottomRight)
      .hide()

    paths.saBase = new Path()
      .move(points.bottomRight)
      .line(points.origin)
      .line(points.bottomLeft)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).close()

    //stores
    store.set('headCircumference', headCircumference)
    store.set('headRadius', headRadius)

    if (complete) {
      //grainline
      points.grainlineTo = points.bottomLeft.shiftFractionTowards(
        points.bottomLeftCp2,
        0.1 + options.crownNumber / 100
      )
      points.grainlineFrom = new Point(
        points.grainlineTo.x,
        points.bottomLeft.y * (0.1 + options.crownNumber / 100)
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //guide lines & notches
      for (let i = 1; i <= 3; i++) {
        points['bottomQ' + i] = points.bottomLeft.rotate(arcAngle * (i / 4), points.origin)

        paths['quarterGuide' + i / 4] = new Path()
          .move(points.origin)
          .line(points['bottomQ' + i])
          .attr('class', 'mark')
          .attr('data-text', i / 4 + ' Guide Line')
          .attr('data-text-class', 'right')

        snippets['quarterGuide' + i / 4] = new Snippet('bnotch', points['bottomQ' + i])
      }
      //title
      points.title = new Point(points.bottomMid.x / 4, points.bottomLeft.y * (2 / 3))
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Crown',
        scale: 0.25,
      })
    }
    if (sa) {
      const hemSa = sa * options.crownHemWidth * 100

      points.saBottomRight = points.bottomRight
        .shift(points.bottomRightCp1.angle(points.bottomRight), sa)
        .shift(points.origin.angle(points.bottomRight), hemSa)

      points.saTop = utils.beamsIntersect(
        points.bottomRight.shiftTowards(points.origin, sa).rotate(-90, points.bottomRight),
        points.origin.shiftTowards(points.bottomRight, sa).rotate(90, points.origin),
        points.origin.shiftTowards(points.bottomLeft, sa).rotate(-90, points.origin),
        points.bottomLeft.shiftTowards(points.origin, sa).rotate(90, points.bottomLeft)
      )

      points.saBottomLeft = points.bottomLeft.translate(-sa, hemSa)

      paths.sa = paths.hemBase
        .offset(hemSa)
        .line(points.saBottomRight)
        .line(points.saTop)
        .line(points.saBottomLeft)
        .line(paths.hemBase.offset(hemSa).start())
        .close()
        .attr('class', 'fabric sa')
    }

    return part
  },
}
