export const brimEye = ({
  store,
  sa,
  points,
  Point,
  Path,
  paths,
  complete,
  paperless,
  macro,
  part,
  options,
  snippets,
  Snippet,
  utils,
  absoluteOptions,
}) => {
  const brimWidth = absoluteOptions.brimWidth
  points.bottomOuter = points.bottomInner.shift(-90, brimWidth * (options.brimSideOffset * 100))
  points.rightOuter = points.rightInner.shift(0, brimWidth)
  points.outerCpAnchor = new Point(points.rightOuter.x, points.bottomOuter.y)

  points.rightOuterCp1 = points.rightOuter.shiftFractionTowards(
    points.outerCpAnchor,
    options.cpFraction
  )
  points.topOuter = points.bottomOuter.flipY(points.origin)
  points.rightOuterCp2 = points.rightOuterCp1.flipY()

  points.leftOuter = points.rightOuter.flipX()
  points.leftOuterCp1 = points.rightOuterCp2.flipX()

  points.leftOuterCp2 = points.leftOuterCp1.flipY()

  //paths
  paths.saRight = new Path()
    .move(points.bottomOuter)
    ._curve(points.rightOuterCp1, points.rightOuter)
    .curve_(points.rightOuterCp2, points.topOuter)
    .hide()

  paths.saLeft = new Path()
    .move(points.topOuter)
    ._curve(points.leftOuterCp1, points.leftOuter)
    .curve_(points.leftOuterCp2, points.bottomOuter)
    .hide()

  paths.seamOuter = paths.saRight.clone().join(paths.saLeft).close()

  if (complete) {
    //grainline
    points.grainlineFrom = points.origin
    points.grainlineTo = points.rightOuter
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['rightOuter', 'leftOuter'],
    })
    //title
    points.title = points.topInner
      .shiftFractionTowards(points.topInnerCp1, 1 / 6)
      .shift(90, points.topInner.dist(points.topOuter) * 0.45)
    macro('title', {
      at: points.title,
      nr: '2',
      title: 'Brim (Eye)',
      cutNr: 2,
      scale: 0.25,
    })
    //scalebox
    points.scalebox = points.bottomInner.shiftFractionTowards(points.bottomOuter, 0.5)
    macro('miniscale', {
      at: points.scalebox,
    })
    //logo
    points.logo = points.leftInner.shiftFractionTowards(points.leftOuter, 0.5)
    macro('logorg', {
      at: points.logo,
      scale: 0.25,
    })
    if (sa) {
      points.saTopOuter = utils.beamsIntersect(
        points.origin,
        points.topOuter,
        points.rightOuterCp2.shiftTowards(points.topOuter, sa).rotate(-90, points.rightOuterCp2),
        points.topOuter.shiftTowards(points.rightOuterCp2, sa).rotate(90, points.topOuter)
      )

      points.saBottomOuter = points.saTopOuter.flipY()

      paths.saOuter = paths.saRight
        .offset(sa)
        .line(points.saTopOuter)
        .line(paths.saLeft.offset(sa).start())
        .join(paths.saLeft.offset(sa))
        .line(points.saBottomOuter)
        .line(paths.saRight.offset(sa).start())
        .close()
        .attr('class', 'fabric sa')
    }
  }
  return part
}
