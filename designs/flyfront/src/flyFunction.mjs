export const flyFunction = (
  part,
  waistbandWidth,
  flyFrontWidth,
  flyFrontLength,
  flyFrontShieldEx
) => {
  const {
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
    snippets,
    Snippet,
    absoluteOptions,
  } = part.shorthand()

  if (!points.flyWaist) {
    if (paths.waist) {
      points.flyWaist = paths.waist.reverse().shiftAlong(flyFrontWidth)
    } else {
      points.flyWaist = points.waistIn.shiftTowards(points.waistOut, flyFrontWidth)
    }
  }
  points.flyCrotch = paths.crotchSeam
    .reverse()
    .shiftAlong(measurements.waistToHips * options.waistHeight + flyFrontLength - waistbandWidth)
  points.flyShieldCrotch = utils.lineIntersectsCurve(
    points.flyCrotch.shift(points.waistIn.angle(points.crotchSeamCurveEnd), flyFrontShieldEx),
    points.flyCrotch
      .shift(points.waistIn.angle(points.crotchSeamCurveEnd), flyFrontShieldEx)
      .shift(
        points.waistIn.angle(points.crotchSeamCurveEnd) + 90,
        points.waistOut.dist(points.waistIn)
      ),
    points.upperLegIn,
    points.upperLegInCp2,
    points.crotchSeamCurveEndCp1,
    points.crotchSeamCurveEnd
  )
  points.flyFrontShieldExWaist = utils.beamsIntersect(
    points.crotchSeamCurveEnd
      .shiftTowards(points.waistIn, flyFrontShieldEx)
      .rotate(-90, points.crotchSeamCurveEnd),
    points.waistIn
      .shiftTowards(points.crotchSeamCurveEnd, flyFrontShieldEx)
      .rotate(+90, points.waistIn),
    points.flyWaist,
    points.waistIn
  )
  points.flyCurveEnd = utils.beamsIntersect(
    points.waistIn,
    points.crotchSeamCurveEnd,
    points.flyCrotch,
    points.flyCrotch.shift(points.crotchSeamCurveEnd.angle(points.waistIn) - 90, 1)
  )
  points.flyCpTarget = utils.beamsIntersect(
    points.flyWaist,
    points.flyWaist.shift(points.waistIn.angle(points.crotchSeamCurveEnd), 1),
    points.flyCrotch,
    points.flyCurveEnd
  )
  points.flyCurveStart = points.flyCurveEnd.rotate(90, points.flyCpTarget)
  points.flyCurveStartCp2 = points.flyCurveStart.shiftFractionTowards(
    points.flyCpTarget,
    options.cpFraction
  )
  points.flyCurveEndCp1 = points.flyCurveEnd.shiftFractionTowards(
    points.flyCpTarget,
    options.cpFraction
  )
  points.flyFrontShieldExCrotch = utils.beamsIntersect(
    paths.crotchSeam.split(points.flyShieldCrotch)[1].offset(flyFrontShieldEx).start(),
    paths.crotchSeam
      .split(points.flyShieldCrotch)[1]
      .offset(flyFrontShieldEx)
      .shiftFractionAlong(0.01),
    points.flyShieldCrotch,
    points.flyShieldCrotch.shift(points.waistIn.angle(points.crotchSeamCurveEnd) - 90, 1)
  )
  paths.placketCurve = new Path()
    .move(points.flyWaist)
    .line(points.flyCurveStart)
    .curve(points.flyCurveStartCp2, points.flyCurveEndCp1, points.flyCurveEnd)
    .hide()

  paths.flyFrontShieldEx = paths.crotchSeam
    .split(points.flyShieldCrotch)[0]
    .line(points.flyFrontShieldExCrotch)
    .join(
      paths.crotchSeam
        .split(points.flyShieldCrotch)[1]
        .split(points.crotchSeamCurveEnd)[0]
        .offset(flyFrontShieldEx)
    )
    .line(points.flyFrontShieldExWaist)
    .line(points.waistIn)
  //stores
  store.set('flyFrontWidth', flyFrontWidth)
  store.set('flyFrontShieldEx', flyFrontShieldEx)
  store.set('waistbandPlacketWidth', flyFrontWidth + flyFrontShieldEx)
  if (complete) {
    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['flyCrotch', 'flyShieldCrotch'],
    })
    //detail paths
    paths.flyFrontShieldExDetail = paths.flyFrontShieldEx
      .split(points.flyFrontShieldExWaist)[0]
      .attr('class', 'fabric hidden')
      .attr('data-text', 'Right Leg Exstention')
      .attr('data-text-class', 'right')

    paths.placketCurveDetail = paths.placketCurve
      .clone()
      .line(points.flyCrotch)
      .unhide()
      .attr('class', 'mark sa')
      .attr('data-text', 'Fly Stitching Line')
      .attr('data-text-class', 'center')
    if (sa) {
      const crotchSeamSa = sa * options.crotchSeamSaWidth * 100

      points.saFlyWaist = utils.beamsIntersect(
        points.flyWaist.shiftTowards(points.flyCurveStart, sa).rotate(-90, points.flyWaist),
        points.flyCurveStart.shiftTowards(points.flyWaist, sa).rotate(90, points.flyCurveStart),
        points.saWaistOut,
        points.saWaistIn
      )
      points.saWaistInExCorner = utils.beamsIntersect(
        points.saWaistOut,
        points.saWaistIn,
        points.crotchSeamCurveEnd
          .shiftTowards(points.waistIn, flyFrontShieldEx + crotchSeamSa)
          .rotate(-90, points.crotchSeamCurveEnd),
        points.waistIn
          .shiftTowards(points.crotchSeamCurveEnd, flyFrontShieldEx + crotchSeamSa)
          .rotate(90, points.waistIn)
      )
      points.saWaistInEx = utils.beamsIntersect(
        points.saWaistInExCorner,
        points.saWaistInExCorner.shift(points.waistIn.angle(points.crotchSeamCurveEnd), 1),
        points.waistOut,
        points.waistIn
      )

      points.saFlyShieldExCrotch = utils.beamsIntersect(
        paths.crotchSeam
          .split(points.flyShieldCrotch)[1]
          .offset(flyFrontShieldEx + crotchSeamSa)
          .start(),
        paths.crotchSeam
          .split(points.flyShieldCrotch)[1]
          .offset(flyFrontShieldEx + crotchSeamSa)
          .shiftFractionAlong(0.001),
        points.flyShieldCrotch.shift(points.waistIn.angle(points.crotchSeamCurveEnd), sa),
        points.flyShieldCrotch
          .shift(points.waistIn.angle(points.crotchSeamCurveEnd), sa)
          .shift(points.waistIn.angle(points.crotchSeamCurveEnd) + 90, 1)
      )
      points.saFlyShieldCrotchSplit = paths.crotchSeam
        .offset(crotchSeamSa)
        .intersects(
          new Path()
            .move(
              points.flyShieldCrotch.shift(
                points.waistIn.angle(points.crotchSeamCurveEnd),
                flyFrontShieldEx
              )
            )
            .line(points.saFlyShieldExCrotch)
        )[0]

      paths.saFlyShieldExDetail = paths.crotchSeam
        .clone()
        .offset(crotchSeamSa)
        .split(points.saFlyShieldCrotchSplit)[0]
        .line(points.saFlyShieldExCrotch)
        .join(
          paths.crotchSeam
            .clone()
            .split(points.crotchSeamCurveEnd)[0]
            .split(points.flyShieldCrotch)[1]
            .offset(crotchSeamSa + flyFrontShieldEx)
        )
        .line(points.saWaistInEx)
        .attr('class', 'fabric hidden')
        .attr('data-text', 'Right Leg SA Extension')
        .attr('data-text-class', 'right')
      paths.saFlyShieldEx = paths.saFlyShieldExDetail
        .clone()
        .line(points.saWaistInExCorner)
        .line(points.saWaistIn)
        .attr('class', 'fabric sa', true)
        .attr('data-text', '', true)
    }
  }
}
