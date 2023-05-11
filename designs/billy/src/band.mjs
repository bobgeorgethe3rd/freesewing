import { crownSide } from './crownSide.mjs'

export const band = {
  name: 'billy.band',
  after: crownSide,
  options: {
    //Style
    band: { bool: true, menu: 'style' },
    bandWidth: { pct: 30, min: 25, max: 45, menu: 'style' },
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
  }) => {
    //render
    if (!options.band) {
      part.render = false
      return part
    }
    //measures
    void store.setIfUnset('headCircumference', measurements.head + 635 * options.headEase)
    const headCircumference = store.get('headCircumference')
    const radius = store.get('radius')
    const angle = store.get('angle') * options.crownSideNumber
    const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)
    const width = store.get('crownLength') * options.bandWidth
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
      points.icLeft = points.ocLeft.shiftTowards(points.origin, width)
      points.icRight = points.ocRight.shiftTowards(points.origin, width)
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
      points.ocLeft = points.origin.shift(0, width)
      points.ocRight = points.ocLeft.shift(90, headCircumference)
      points.ocCp1 = points.ocLeft.shiftFractionTowards(points.ocRight, 0.25)
      points.ocCp2 = points.ocRight.shiftFractionTowards(points.ocLeft, 0.25)
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

    if (complete) {
      //grainline
      points.grainlineTo = paths.hemBase.shiftFractionAlong(0.5)
      points.grainlineFrom = points.grainlineTo.shift(angle / 2 + 180, width)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      let j
      for (let i = 0; i < 3; i++) {
        j = i + 1
        points['bnotch' + i] = paths.hemBase.shiftFractionAlong(j / 4)
        snippets['bnotch' + i] = new Snippet('bnotch', points['bnotch' + i])
      }
      //title
      points.title = paths.hemBase.shiftFractionAlong(0.25).shift(angle / 4 + 180, width * 0.8)
      macro('title', {
        at: points.title,
        nr: 4,
        title: 'Crown (Side)',
        scale: 0.25,
        rotation: 360 - angle / 4,
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
