export const brimCircle = ({
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
  points.bottomOuter = points.bottomInner.shift(-90, brimWidth)
  points.rightOuter = points.rightInner.shift(0, brimWidth)
  points.outerCpAnchor = new Point(points.rightOuter.x, points.bottomOuter.y)

  points.bottomOuterCp2 = points.bottomOuter.shiftFractionTowards(
    points.outerCpAnchor,
    options.cpFraction
  )
  points.rightOuterCp1 = points.rightOuter.shiftFractionTowards(
    points.outerCpAnchor,
    options.cpFraction
  )

  points.topOuter = points.bottomOuter.flipY(points.origin)
  points.rightOuterCp2 = points.rightOuterCp1.flipY()
  points.topOuterCp1 = points.bottomOuterCp2.flipY()

  points.leftOuter = points.rightOuter.flipX()
  points.topOuterCp2 = points.topOuterCp1.flipX()
  points.leftOuterCp1 = points.rightOuterCp2.flipX()

  points.leftOuterCp2 = points.leftOuterCp1.flipY()
  points.bottomOuterCp1 = points.topOuterCp2.flipY()

  //paths
  paths.seamOuter = new Path()
    .move(points.bottomOuter)
    .curve(points.bottomOuterCp2, points.rightOuterCp1, points.rightOuter)
    .curve(points.rightOuterCp2, points.topOuterCp1, points.topOuter)
    .curve(points.topOuterCp2, points.leftOuterCp1, points.leftOuter)
    .curve(points.leftOuterCp2, points.bottomOuterCp1, points.bottomOuter)
    .close()

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
      on: ['bottomOuter', 'rightOuter', 'topOuter', 'leftOuter'],
    })
    //title
    points.title = points.topInner
      .shiftFractionTowards(points.topInnerCp1, 1 / 6)
      .shift(90, points.topInner.dist(points.topOuter) * 0.45)
    macro('title', {
      at: points.title,
      nr: '2',
      title: 'Brim (Circle)',
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
      paths.saOuter = paths.seamOuter.offset(sa).close().attr('class', 'fabric sa')
    }
  }

  return part
}
