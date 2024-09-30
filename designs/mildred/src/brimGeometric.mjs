export const brimGeometric = ({
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
  //measures
  const brimWidth = absoluteOptions.brimWidth
  //let's begin
  points.seamOuterMid0 = points.leftInner.shift(180, brimWidth)
  points.seamOuterMid1 = points.seamOuterMid0.rotate(360 * (1 / options.brimSideNum), points.origin)
  points.seamOuter0 = utils.beamsIntersect(
    points.seamOuterMid0,
    points.origin.rotate(-90, points.seamOuterMid0),
    points.seamOuterMid1,
    points.origin.rotate(90, points.seamOuterMid1)
  )
  let j
  for (let i = 1; i <= options.brimSideNum; i++) {
    j = i - 1
    points['seamOuter' + i] = points['seamOuter' + j].rotate(
      360 * (1 / options.brimSideNum),
      points.origin
    )

    paths['seamOuter' + i] = new Path()
      .move(points['seamOuter' + j])
      .line(points['seamOuter' + i])
      .hide()
  }

  let k
  for (let i = 1; i < options.brimSideNum; i++) {
    k = i + 1
    paths['seamOuter' + k] = paths['seamOuter' + i].join(paths['seamOuter' + k]).hide()
  }

  //paths
  paths.seamOuter = paths['seamOuter' + options.brimSideNum].close().unhide()

  if (complete) {
    //grainline
    points.grainlineFrom = points.origin
    if (options.brimSideNum % 2 == 0) {
      points.grainlineTo = points.rightInner.shift(0, brimWidth)
    } else {
      points.grainlineTo = points['seamOuter' + (options.brimSideNum / 2 - 0.5)]
    }
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
    })
    //title
    points.title = points.topInner
      .shiftFractionTowards(points.topInnerCp1, 1 / 6)
      .shift(90, brimWidth * 0.45)
    macro('title', {
      at: points.title,
      nr: '2',
      title: 'Brim (Eye)',
      cutNr: 2,
      scale: 0.25,
    })
    //scalebox
    points.scalebox = points.bottomInner.shift(-90, brimWidth / 2)
    macro('miniscale', {
      at: points.scalebox,
    })
    //logo
    points.logo = points.leftInner.shift(180, brimWidth / 2)
    macro('logorg', {
      at: points.logo,
      scale: 0.25,
    })
    if (sa) {
      points.saOuter0 = utils.beamsIntersect(
        points.origin,
        points.seamOuter0,
        points.seamOuter0.shiftTowards(points.seamOuter1, sa).rotate(-90, points.seamOuter0),
        points.seamOuter1.shiftTowards(points.seamOuter0, sa).rotate(90, points.seamOuter1)
      )
      let j
      for (let i = 1; i <= options.brimSideNum; i++) {
        j = i - 1
        points['saOuter' + i] = points['saOuter' + j].rotate(
          360 * (1 / options.brimSideNum),
          points.origin
        )

        paths['saOuter' + i] = new Path()
          .move(points['saOuter' + j])
          .line(points['saOuter' + i])
          .hide()
      }

      let k
      for (let i = 1; i < options.brimSideNum; i++) {
        k = i + 1
        paths['saOuter' + k] = paths['saOuter' + i].join(paths['saOuter' + k]).hide()
      }
      paths.saOuter = paths['saOuter' + options.brimSideNum]
        .close()
        .attr('class', 'fabric sa')
        .unhide()
    }
  }

  return part
}
