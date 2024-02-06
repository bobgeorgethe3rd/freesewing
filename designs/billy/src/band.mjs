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
    log,
  }) => {
    //render
    if (!options.band) {
      part.render = false
      return part
    }
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      'Head Ease has been set at ' + utils.units(635 * options.headEase)
    )
    const headCircumference = store.get('headCircumference')
    const radius = store.get('radius')
    const angle = store.get('angle') * options.crownSideNumber
    const cpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(angle) / 4)
    const width = store.get('crownLength') * options.bandWidth
    //let's begin
    points.origin = new Point(0, 0)

    if (options.headReduction > 0) {
      points.outerLeft = points.origin.shift(0, radius)
      points.outerRight = points.outerLeft.rotate(angle, points.origin)
      points.outerLeftCp2 = points.outerLeft
        .shiftTowards(points.origin, cpDistance)
        .rotate(-90, points.outerLeft)
      points.outerRightCp1 = points.outerRight
        .shiftTowards(points.origin, cpDistance)
        .rotate(90, points.outerRight)
      points.innerLeft = points.outerLeft.shiftTowards(points.origin, width)
      points.innerRight = points.outerRight.shiftTowards(points.origin, width)
      points.innerLeftCp2 = utils.beamsIntersect(
        points.innerRight,
        points.origin.rotate(90, points.innerRight),
        points.outerRightCp1,
        points.origin
      )
      points.innerRightCp1 = utils.beamsIntersect(
        points.innerLeft,
        points.origin.rotate(-90, points.innerLeft),
        points.outerLeftCp2,
        points.origin
      )
    } else {
      points.outerLeft = points.origin.shift(0, width)
      points.outerRight = points.outerLeft.shift(90, headCircumference)
      points.outerLeftCp2 = points.outerLeft.shiftFractionTowards(points.outerRight, 0.25)
      points.outerRightCp1 = points.outerRight.shiftFractionTowards(points.outerLeft, 0.25)
      points.innerLeft = points.origin
      points.innerRight = new Point(points.innerLeft.x, points.outerRight.y)
      points.innerLeftCp2 = new Point(points.innerRight.x, points.outerRightCp1.y)
      points.innerRightCp1 = new Point(points.innerRight.x, points.outerLeftCp2.y)
    }

    //paths
    paths.hemBase = new Path()
      .move(points.outerLeft)
      .curve(points.outerLeftCp2, points.outerRightCp1, points.outerRight)
      .hide()

    paths.saBase = new Path()
      .move(points.innerRight)
      .curve(points.innerLeftCp2, points.innerRightCp1, points.innerLeft)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .line(points.innerRight)
      .join(paths.saBase)
      .line(points.outerLeft)
      .close()

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
        title: 'Band',
        scale: 0.25,
        rotation: 360 - angle / 4,
      })
      if (sa) {
        const hemSa = sa * options.crownSaWidth * 100

        points.saOuterRight = points.outerRight
          .shift(points.outerRightCp1.angle(points.outerRight), sa)
          .shift(points.innerRight.angle(points.outerRight), hemSa)
        points.saInnerRight = points.innerRight
          .shift(points.innerLeftCp2.angle(points.innerRight), sa)
          .shift(points.outerRight.angle(points.innerRight), sa)

        points.saInnerLeft = points.innerLeft.translate(-sa, sa)
        points.saOuterLeft = points.outerLeft.translate(hemSa, sa)

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saOuterRight)
          .line(points.saInnerRight)
          .line(paths.saBase.offset(sa).start())
          .join(paths.saBase.offset(sa))
          .line(points.saInnerLeft)
          .line(points.saOuterLeft)
          .line(paths.hemBase.offset(hemSa).start())
          .close()
          .attr('class', 'fabrinner sa')
      }
    }

    return part
  },
}
