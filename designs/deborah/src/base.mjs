import { base as waystoneBase } from '@freesewing/waystone'
import { pluginBundle } from '@freesewing/plugin-bundle'

export const base = {
  name: 'deborah.base',
  from: waystoneBase,
  hideDependencies: true,
  options: {
    //changed from Waystone
    //Constants
    waistEase: { pct: (1 / 24) * 100, min: 0, max: 20, menu: 'fit' },
    underarmGap: 1 / 24,
    //Style
    dartNumber: { count: 1, min: 1, max: 2, menu: 'style' },

    //Deborah
    //Style
    frontLength: { pct: 24.3, min: 20, max: 40, menu: 'style' },
  },
  plugins: [pluginBundle],
  draft: draftDeborahBase,
}

function draftDeborahBase({
  options,
  Point,
  Path,
  points,
  paths,
  Snippet,
  snippets,
  complete,
  sa,
  paperless,
  macro,
  part,
  measurements,
  utils,
  store,
}) {
  //Altering the darts
  let waist = store.get('waist')
  let underarmGap = measurements.waist * options.underarmGap
  let patternWaist = points.h.dist(points.c)
  let waistDiff = patternWaist - waist / 2 - underarmGap
  let dartDistance = waistDiff / 4

  points.dart4 = points.q.shiftTowards(points.h, dartDistance)
  points.dart5 = points.q.shiftTowards(points.b, dartDistance)
  points.dart6 = points.r.shiftTowards(points.h, dartDistance)
  points.dart7 = points.r.shiftTowards(points.b, dartDistance)

  //dart shapng?
  points.vDartMidCp = points.vDart.shiftFractionTowards(points.q, 0.15)
  points.vDartLeftCp = points.dart4
    .shiftFractionTowards(points.vDart, 1 / 3)
    .rotate(5, points.dart4)
  points.vDartRightCp = new Point(points.dart5.x, points.vDartLeftCp.y)

  points.wDartMidCp = points.w.shiftFractionTowards(points.r, 0.15)
  points.wDartLeftCp = points.dart6.shiftFractionTowards(points.w, 1 / 3).rotate(5, points.dart6)
  points.wDartRightCp = new Point(points.dart7.x, points.wDartLeftCp.y)

  //and remanipulate
  //dart manipulation
  let dartWaistOffset = store.get('dartWaistOffset')

  if (options.dartNumber == '1' || points.dart6.x < points.dart5.x) {
    let dartWidth = ((points.dart4.dist(points.dart5) + points.dart6.dist(points.dart7)) * 1) / 3
    points.dartTip = points.vDart.shiftFractionTowards(points.w, 0.5)
    points.dartMid = new Point(points.dartTip.x, points.b.y)
    points.dartLeft = points.dartMid.shift(180, dartWidth)
    points.dartRight = points.dartMid.shift(0, dartWidth)
    points.dartMidCp = points.dartTip.shiftFractionTowards(points.dartMid, 0.15)
    points.dartLeftCp = points.dartLeft
      .shiftFractionTowards(points.dartTip, 1 / 3)
      .rotate(5, points.dartLeft)
    points.dartRightCp = new Point(points.dartRight.x, points.dartLeftCp.y)

    //offset
    points.dartLeft = points.dartLeft.shift(180, dartWaistOffset)
    points.dartLeftCp = points.dartLeftCp.shift(180, dartWaistOffset)
    points.dartRight = points.dartRight.shift(180, dartWaistOffset)
    points.dartRightCp = points.dartRightCp.shift(180, dartWaistOffset / 2)

    paths.dart = new Path()
      .move(points.dartLeft)
      .curve(points.dartLeftCp, points.dartMidCp, points.dartTip)
      .curve(points.dartMidCp, points.dartRightCp, points.dartRight)

    points.sideFrontWaist = points.sideFrontWaist.shift(180, dartWidth / 2)
    points.sideFrontWaistCp = points.sideFrontWaistCp.shift(180, dartWidth / 2)
    points.sideBodyWaist = points.sideBodyWaist.shift(0, dartWidth / 2)
    points.sideBodyWaistCp = points.sideBodyWaistCp.shift(0, dartWidth / 2)
    if (options.dartNumber == '2' && points.dart6.x < points.dart5.x)
      log.debug('Due to the dart overlap only one dart has been drafted')
  } else {
    //offset
    points.dart4 = points.dart4.shift(180, dartWaistOffset)
    points.dart5 = points.dart5.shift(180, dartWaistOffset)
    points.dart6 = points.dart6.shift(180, dartWaistOffset)
    points.dart7 = points.dart7.shift(180, dartWaistOffset)
    points.vDartLeftCp = points.vDartLeftCp.shift(180, dartWaistOffset)
    points.vDartRightCp = points.vDartRightCp.shift(180, dartWaistOffset / 2)
    points.wDartLeftCp = points.wDartLeftCp.shift(180, dartWaistOffset)
    points.wDartRightCp = points.wDartRightCp.shift(180, dartWaistOffset / 2)

    paths.vDart = new Path()
      .move(points.dart4)
      .curve(points.vDartLeftCp, points.vDartMidCp, points.vDart)
      .curve(points.vDartMidCp, points.vDartRightCp, points.dart5)

    paths.wDart = new Path()
      .move(points.dart6)
      .curve(points.wDartLeftCp, points.wDartMidCp, points.w)
      .curve(points.wDartMidCp, points.wDartRightCp, points.dart7)
  }
  //measures
  let frontLength = measurements.hpsToWaistSideFrontOffset * (1 + options.frontLength)
  //let's begin
  points.m = points.f.shiftTowards(points.h, frontLength)
  points.t = new Point(points.sideFrontWaist.x, points.m.y)

  //guides
  paths.hmt = new Path().move(points.h).line(points.m).line(points.t).attr('class', 'fabric lashed')

  // Complete?
  if (complete) {
    if (sa) {
    }
  }

  // Paperless?
  if (paperless) {
  }

  return part
}
