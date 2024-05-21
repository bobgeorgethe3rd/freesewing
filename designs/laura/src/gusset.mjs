import { leg8 } from './leg8.mjs'

export const gusset = {
  name: 'laura.gusset',
  options: {
    //Style
    gussetLengthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
    gussetWidthBonus: { pct: 0, min: -20, max: 50, menu: 'style' },
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
    if (!options.gusset) {
      part.hide()
      return part
    }
    //let's begin
    points.origin = new Point(0, 0)
    points.top = points.origin.shift(
      90,
      store.get('gussetFrontLength') * (1 + options.gussetLengthBonus)
    )
    points.bottom = points.origin.shift(
      -90,
      store.get('gussetBackLength') * (1 + options.gussetLengthBonus)
    )
    points.left = points.origin.shift(
      180,
      ((store.get('gussetFrontWidth') + store.get('gussetBackWidth')) *
        (1 + options.gussetWidthBonus)) /
        2
    )
    points.right = points.left.flipX()

    points.rightCp1 = new Point(points.right.x, points.bottom.y / 2)
    points.bottomCp2 = points.bottom.shiftFractionTowards(points.rightCp1, 0.25)
    points.rightCp2 = new Point(points.right.x, points.top.y / 2)
    points.topCp1 = points.top.shiftFractionTowards(points.rightCp2, 0.25)

    points.topCp2 = points.topCp1.flipX()
    points.leftCp1 = points.rightCp2.flipX()
    points.leftCp2 = points.rightCp1.flipX()
    points.bottomCp1 = points.bottomCp2.flipX()

    //paths
    paths.saRight = new Path()
      .move(points.bottom)
      .curve(points.bottomCp2, points.rightCp1, points.right)
      .curve(points.rightCp2, points.topCp1, points.top)
      .hide()

    paths.saLeft = new Path()
      .move(points.top)
      .curve(points.topCp2, points.leftCp1, points.left)
      .curve(points.leftCp2, points.bottomCp1, points.bottom)
      .hide()

    paths.seam = paths.saRight.clone().join(paths.saLeft).close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.top
      points.grainlineTo = points.bottom
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //stretch
      points.stretchFrom = new Point(points.left.x * 0.9, points.origin.y)
      points.stretchTo = new Point(points.right.x * 0.9, points.origin.y)
      paths.stretch = new Path()
        .move(points.stretchFrom)
        .line(points.stretchTo)
        .attr('class', 'note')
        .attr('data-text', 'Stretch')
        .attr('data-text-class', 'fill-note center')
        .attr('marker-start', 'url(#grainlineFrom)')
        .attr('marker-end', 'url(#grainlineTo)')
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['left', 'right'],
      })
      //title
      points.title = new Point(points.left.x * (2 / 3), points.bottom.y / 3)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Gusset',
        scale: 1 / 3,
      })
      if (sa) {
        points.saTop = utils.beamIntersectsX(
          points.topCp1.shiftTowards(points.top, sa).rotate(-90, points.topCp1),
          points.top.shiftTowards(points.topCp1, sa).rotate(90, points.top),
          points.origin.x
        )
        points.saBottom = utils.beamIntersectsX(
          points.bottomCp1.shiftTowards(points.bottom, sa).rotate(-90, points.bottomCp1),
          points.bottom.shiftTowards(points.bottomCp1, sa).rotate(90, points.bottom),
          points.origin.x
        )

        paths.sa = paths.saRight
          .offset(sa)
          .line(points.saTop)
          .line(paths.saLeft.offset(sa).start())
          .join(paths.saLeft.offset(sa))
          .line(points.saBottom)
          .line(paths.saRight.offset(sa).start())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
