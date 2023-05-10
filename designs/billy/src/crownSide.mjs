import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const crownSide = {
  name: 'billy.crownSide',
  options: {
    //Fit
    headEase: { pct: 3.1, min: 0, max: 9, snap: 6.35, ...pctBasedOn('head'), menu: 'fit' },
    headReduction: { pct: 15.8, min: 0, max: 20, menu: 'fit' },
    crownLengthBonus: { pct: 0, min: -30, max: 30, menu: 'fit' },
    //Style
    crownSideNumber: { count: 2, min: 1, max: 8, menu: 'style' },

    //Construction
    brimSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  measurements: ['head'],
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
    absoluteOptions,
  }) => {
    //measures
    void store.setIfUnset('headCircumference', measurements.head + absoluteOptions.headEase)
    const headCircumference = store.get('headCircumference')
    const headRadius = headCircumference / 2 / Math.PI
    const crownTopCircumference = headCircumference * (1 - options.headReduction)
    const crownTopRadius = crownTopCircumference / 2 / Math.PI
    const crownLength = Math.sqrt(
      Math.pow(headRadius * (1 + options.crownLengthBonus), 2) +
        Math.pow(headRadius - crownTopRadius, 2)
    )
    const angleRads = (headCircumference - crownTopCircumference) / crownLength
    const radius = headCircumference / angleRads
    const angle = utils.rad2deg(angleRads) / options.crownSideNumber
    const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)
    //let's begin
    points.origin = new Point(0, 0)

    if (options.headReduction > 0) {
      points.ocLeft = points.origin.shift(0, radius)
      points.ocRight = points.ocLeft.rotate(angle, points.origin)
      points.ocCp1 = points.ocLeft
        .shiftTowards(points.origin, cpDistance)
        .rotate(-90, points.ocLeft)
      points.ocCp2 = points.ocRight
        .shiftTowards(points.origin, cpDistance)
        .rotate(90, points.ocRight)
      points.icLeft = points.ocLeft.shiftTowards(points.origin, crownLength)
      points.icRight = points.ocRight.shiftTowards(points.origin, crownLength)
      points.icCp1 = utils.beamsIntersect(
        points.icRight,
        points.origin.rotate(90, points.icRight),
        points.ocCp2,
        points.origin
      )
      points.icCp2 = utils.beamsIntersect(
        points.icLeft,
        points.origin.rotate(-90, points.icLeft),
        points.ocCp1,
        points.origin
      )
    } else {
      points.ocLeft = points.origin.shift(0, crownLength)
      points.ocRight = points.ocLeft.shift(90, headCircumference / options.crownSideNumber)
      points.ocCp1 = points.ocLeft.shiftTowards(points.ocRight, 0.25)
      points.ocCp2 = points.ocRight.shiftTowards(points.ocLeft, 0.25)
      points.icLeft = points.origin
      points.icRight = new Point(points.icLeft.x, points.ocRight.y)
      points.icCp1 = new Point(points.icRight.x, points.ocCp2.y)
      points.icCp2 = new Point(points.icRight.x, points.ocCp1.y)
    }

    //paths
    paths.hemBase = new Path()
      .move(points.ocLeft)
      .curve(points.ocCp1, points.ocCp2, points.ocRight)
      .hide()

    paths.saBase = new Path()
      .move(points.ocRight)
      .line(points.icRight)
      .curve(points.icCp1, points.icCp2, points.icLeft)
      .line(points.ocLeft)
      .hide()

    paths.seam = paths.hemBase.join(paths.saBase).close()

    //stores
    store.set('headCircumference', headCircumference)
    store.set('crownTopRadius', crownTopRadius)

    if (complete) {
      //grainline
      points.grainlineTo = paths.hemBase.shiftFractionAlong(0.5)
      points.grainlineFrom = points.grainlineTo.shiftTowards(points.origin, crownLength)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches

      //title
      points.title = points.icLeft
        .shiftFractionTowards(points.ocLeft, 0.15)
        .shift(90, points.icLeft.dist(points.icCp2) / 2)
      macro('title', {
        at: points.title,
        nr: 2,
        title: 'Crown (Side)',
        scale: 1 / 3,
      })

      if (sa) {
        paths.sa = paths.hemBase
          .offset(sa * options.brimSaWidth * 100)
          .join(paths.saBase.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
