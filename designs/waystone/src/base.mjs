import { pluginBundle } from '@freesewing/plugin-bundle'

export const base = {
  name: 'waystone.base',
  measurements: [
    'hpsToWaistBack',
    'hpsToWaistSideFrontOffset',
    'blade',
    'waistToArmhole',
    'chest',
    'waist',
  ],
  options: {
    //Constants
    cpFraction: 0.55191502449,
    backNeckDrop: 1 / 21,
    cbWaist: 3 / 48,
    jAnchor: 1 / 24,
    chestExtension: 1 / 72,
    dartBustOffset: 1 / 72,
    dartHeight: 1 / 20,
    underarmGap: 1 / 48,

    //Fit
    //bladeEase: {pct: 0, min: 0, max: 20, menu: 'fit' },
    chestEase: { pct: 0, min: 0, max: 20, menu: 'fit' },
    waistEase: { pct: 0, min: 0, max: 20, menu: 'fit' },
    //ease: {pct: 0, min: 0, max: 20, menu: 'fit' },
    useProportions: { bool: true, menu: 'fit' },
    sideBackGap: { pct: (1 / 24) * 100, min: 4.1, max: (11 / 192) * 100, menu: 'fit' },
    sideBodyNumber: { count: 1, min: 1, max: 2, menu: 'fit' },

    //Style
    type: { dflt: 'waist', list: ['waist', 'hip'], menu: 'style' },
    frontShoulderCurve: { deg: 5, min: 0, max: 10, menu: 'style' },
    dartNumber: { count: 2, min: 1, max: 2, menu: 'style' },
    dartWaistOffset: { pct: 0, min: 0, max: (1 / 24) * 100, menu: 'style' }, //need increase on the dress bodice it would be used on to allow for smaller waists. set at the current max at default.
    sideBodyAngle: { deg: 3, min: -1, max: 5, menu: 'style' },
    underarmCurve: { pct: 100, min: 0, max: 100, menu: 'style' },

    //Armhole
    sideBackArmhole: {
      pct: (1 / 144) * 100,
      min: (1 / 144) * 100,
      max: (1 / 72) * 100,
      menu: 'armhole',
    },
    sideBodySnip: {
      pct: (3 / 576) * 100,
      min: (1 / 576) * 100,
      max: (1 / 144) * 100,
      menu: 'armhole',
    },
  },
  plugins: [pluginBundle],
  draft: draftBase,
}

function draftBase({
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
  log,
  utils,
}) {
  //measures
  let bladeMeasure = measurements.blade * (1 + options.chestEase)
  let chestMeasure = measurements.chest * (1 + options.chestEase)
  let waist = measurements.waist * (1 + options.waistEase)

  let chestProportion = measurements.waist + measurements.chest / 3
  let bladeProption = chestProportion * (10 / 36)

  let blade
  if (bladeProption < bladeMeasure || !options.useProportions) {
    blade = bladeMeasure
  } else {
    blade = bladeProption
    log.debug('Proportions have been used for blade: ' + utils.units(bladeProption))
  }

  let chest
  if (chestProportion < chestMeasure || !options.useProportions) {
    chest = chestMeasure
  } else {
    chest = chestProportion
    log.debug('Proportions have been used for chest: ' + utils.units(chestProportion))
  }
  //let's begin
  points.origin = new Point(0, 0)

  points.b = points.origin.shift(-90, measurements.hpsToWaistBack)
  points.cbNeck = points.origin.shiftFractionTowards(points.b, options.backNeckDrop) // points 1
  points.a = points.b.shiftTowards(points.cbNeck, measurements.waistToArmhole)

  points.c = points.b.shift(180, chest / 24)
  points.a1 = utils.beamsIntersect(points.c, points.cbNeck, points.a, points.a.shift(180, 1))
  points.g = points.a1.shift(180, chest / 2)

  points.k = points.a1.shiftTowards(points.g, blade)
  points.i = new Point(points.k.x, points.origin.y)
  points.j = new Point(points.k.x, points.b.y)

  points.l = points.k.shiftTowards(points.a1, (blade * 1.5) / 4)
  points.vShoulder = new Point(points.l.x, points.origin.y)
  points.z = points.l.shiftFractionTowards(points.vShoulder, 0.5)
  points.tShoulder = points.z.shiftFractionTowards(points.vShoulder, 0.5)
  points.shoulderMax = points.z.shiftFractionTowards(points.tShoulder, 0.5) //points 3

  points.hpsBack = points.origin.shiftTowards(points.vShoulder, (blade * 1.5) / 8) //points 2
  //neck control points
  points.cbNeckCp1 = utils.beamsIntersect(
    points.cbNeck,
    points.cbNeck.shift(180, 1),
    points.hpsBack,
    points.shoulderMax.rotate(90, points.hpsBack)
  )

  //back to draft
  points.shoulderOrigin = points.origin.shiftTowards(points.vShoulder, chest / 6) //points 9
  points.backArmholePitch = new Point(points.shoulderOrigin.x, points.z.y) //points 8
  points.d = points.c.shiftTowards(points.j, measurements.waist * options.cbWaist)
  points.x = utils.beamsIntersect(
    points.shoulderOrigin,
    points.backArmholePitch,
    points.hpsBack,
    points.shoulderMax
  )

  points.backPitch = utils.beamsIntersect(points.x, points.c, points.a, points.g) //becomes points 11 later

  //centre back panel //form the back

  // points.armholeCp1Target = utils.beamsIntersect(points.x, points.c, points.backArmholePitch, points.shoulderMax.rotate(-90, points.backArmholePitch))
  // points.armholeCp1 = points.x.shiftFractionTowards(points.armholeCp1Target, 2 / 3)

  points.armholeCp1 = utils.beamsIntersect(
    points.x,
    points.c,
    points.x.shiftFractionTowards(points.backArmholePitch, 0.5),
    points.x.shiftFractionTowards(points.backArmholePitch, 0.5).shift(0, 1)
  )
  points.backCp1 = points.backPitch.shiftFractionTowards(points.x, options.cpFraction)
  points.backCp2 = utils.beamsIntersect(
    points.backPitch,
    points.c,
    points.d,
    points.d.shift(points.c.angle(points.cbNeck), 1)
  ) //points.backPitch.shiftFractionTowards(points.c, options.cpFraction)//utils.beamsIntersect(points.x, points.c, points.d, points.d.shift(90, 1))

  //back to draft
  points.p = points.k.shiftFractionTowards(points.g, 0.5)
  points.e = new Point(points.p.x, points.origin.y)

  points.jAnchor = points.j.shift(180, measurements.waist * options.jAnchor)
  points.hpsFront = points.jAnchor.shiftTowards(points.e, measurements.hpsToWaistSideFrontOffset) //originally points e but instead points e is now just a target
  points.f = points.hpsFront.shift(180, chest / 12)

  points.n = points.f.shiftTowards(points.g, chest / 12)
  points.h = utils.beamsIntersect(points.f, points.g, points.b, points.c)

  //centre front neck shaping
  points.frontNeckCpTarget = new Point(points.hpsFront.x, points.n.y)
  points.frontNeckCp1 = points.hpsFront.shiftFractionTowards(
    points.frontNeckCpTarget,
    options.cpFraction
  )
  points.frontNeckCp2 = points.n.shiftFractionTowards(points.frontNeckCpTarget, options.cpFraction)

  //front shoulder curve
  points.frontShoulder = points.hpsFront.shiftTowards(
    points.tShoulder,
    points.hpsBack.dist(points.x)
  )
  points.frontShoulderCp1 = points.frontShoulder
    .shiftFractionTowards(points.hpsFront, 1 / 3)
    .rotate(-options.frontShoulderCurve, points.frontShoulder)
  points.frontShoulderCp2 = points.hpsFront.shiftFractionTowards(points.frontShoulder, 1 / 3)

  //paths oo
  points.ooStart = points.k.shiftTowards(points.g, points.x.dist(points.shoulderMax))
  points.ooEnd = points.l.rotate(90, points.ooStart)

  paths.oo = new Path().move(points.ooStart).line(points.ooEnd).attr('class', 'fabric lashed')

  //front armhole
  points.armholeMid = points.k.shiftFractionTowards(points.l, 1 / 4) //new Point(points.waist15.x, points.a.y)
  points.frontArmholePitch = points.ooStart.shiftFractionTowards(points.ooEnd, 0.5)
  points.armholeCp4 = points.armholeMid.shiftFractionTowards(points.ooStart, 2 / 3)
  points.armholeCp5 = points.frontArmholePitch.shiftFractionTowards(
    points.ooStart,
    options.cpFraction
  )

  points.armholeCpTarget = points.frontArmholePitch.shift(
    90,
    points.frontArmholePitch.dist(points.frontShoulder) /
      2 /
      Math.cos(utils.deg2rad(90 - points.frontArmholePitch.angle(points.frontShoulder)))
  )
  points.armholeCp6 = points.frontArmholePitch.shiftFractionTowards(
    points.armholeCpTarget,
    options.cpFraction
  )
  points.armholeCp7 = points.frontShoulder.shiftFractionTowards(
    points.armholeCpTarget,
    options.cpFraction
  )

  //side armhole
  points.sideBackArmhole = points.backArmholePitch.shift(
    180,
    measurements.chest * options.sideBackArmhole
  )
  points.sideBackArmholeCpTarget = new Point(points.sideBackArmhole.x, points.a.y)
  points.armholeCp2 = points.sideBackArmhole.shiftFractionTowards(
    points.sideBackArmholeCpTarget,
    options.cpFraction
  )
  points.armholeCp3 = points.armholeMid.shiftFractionTowards(
    points.sideBackArmholeCpTarget,
    options.cpFraction
  )

  //back to draft
  points.waist16 = points.d.shift(180, measurements.waist * options.sideBackGap) //points 16

  //sideBack curve
  points.sideBackCp1 = points.waist16.shiftFractionTowards(
    new Point(points.waist16.x, points.backCp2.y),
    options.cpFraction
  )
  points.sideBackCp2 = points.backPitch.shiftFractionTowards(points.backCp2, 2 / 3)

  //back to draft
  points.gStar = points.g.shift(180, measurements.chest * options.chestExtension)

  //shaping the front
  points.cfCp1 = points.n.shiftFractionTowards(points.g, 0.1)
  points.cfCp4 = points.h.shiftFractionTowards(points.g, 1 / 3)
  points.cfCp2 = points.gStar.shiftFractionTowards(
    points.cfCp1.shift(180, measurements.chest * options.chestExtension),
    2 / 3
  )
  points.cfCp3 = points.gStar.shiftFractionTowards(
    points.cfCp4.shift(180, measurements.chest * options.chestExtension),
    2 / 3
  )

  //back to the draft
  points.s = points.g.shiftFractionTowards(points.k, 1 / 3)
  points.tDart = points.g.shiftFractionTowards(points.k, 2 / 3)
  points.u = points.s.shift(0, measurements.chest * options.dartBustOffset)

  points.q = points.h.shiftFractionTowards(points.j, 1 / 3)
  points.r = points.h.shiftFractionTowards(points.j, 2 / 3)

  points.vDart = points.u.shiftFractionTowards(points.q, 1 / 3)
  points.w = utils.beamsIntersect(
    points.vDart.shift(90, measurements.waistToArmhole * options.dartHeight),
    points.vDart.translate(1, -measurements.waistToArmhole * options.dartHeight),
    points.r,
    points.tDart
  )

  //time for some dart maths
  let underarmGap = measurements.waist * options.underarmGap
  let patternWaist = points.c.dist(points.d) + points.waist16.dist(points.h)
  let waistDiff = patternWaist - waist / 2 - underarmGap
  let dartDistance = waistDiff / 4

  points.dart4 = points.q.shiftTowards(points.h, dartDistance)
  points.dart5 = points.q.shiftTowards(points.b, dartDistance)
  points.dart6 = points.r.shiftTowards(points.h, dartDistance)
  points.dart7 = points.r.shiftTowards(points.b, dartDistance)

  //dart shapig?
  points.vDartMidCp = points.vDart.shiftFractionTowards(points.q, 0.15)
  points.vDartLeftCp = points.dart4
    .shiftFractionTowards(points.vDart, 1 / 3)
    .rotate(5, points.dart4)
  points.vDartRightCp = new Point(points.dart5.x, points.vDartLeftCp.y)

  points.wDartMidCp = points.w.shiftFractionTowards(points.r, 0.15)
  points.wDartLeftCp = points.dart6.shiftFractionTowards(points.w, 1 / 3).rotate(5, points.dart6)
  points.wDartRightCp = new Point(points.dart7.x, points.wDartLeftCp.y)

  //back to draft
  points.waist15 = new Point(points.armholeMid.x, points.b.y) //points.dart7.shiftFractionTowards(points.waist16, 1 / 3)
  points.waist17 = points.waist15.shiftFractionTowards(points.waist16, 0.5) //points.dart7.shiftFractionTowards(points.waist16, 2 / 3)

  //back to draft
  points.armhole12 = utils.lineIntersectsCurve(
    points.waist17,
    points.waist17.shift(90 + options.sideBodyAngle, measurements.hpsToWaistBack),
    points.armholeMid,
    points.armholeCp3,
    points.armholeCp2,
    points.sideBackArmhole
  )

  points.sideBodyArmhole = points.armhole12.shift(180, measurements.chest * options.sideBodySnip)

  //re-shaping armhole
  points.sideBodyArmholeCpTarget = points.armholeMid.shift(
    0,
    points.armholeMid.dist(points.sideBodyArmhole) /
      2 /
      Math.cos(utils.deg2rad(points.armholeMid.angle(points.sideBodyArmhole)))
  )
  points.sideBodyArmholeCp1 = points.sideBodyArmhole.shiftFractionTowards(
    points.sideBodyArmholeCpTarget,
    2 / 3
  )
  points.sideBodyArmholeCp2 = points.armholeMid.shiftFractionTowards(
    points.sideBodyArmholeCpTarget,
    2 / 3
  )

  let sideBackArmholeSplit = new Path()
    .move(points.sideBackArmhole)
    .curve(points.armholeCp2, points.armholeCp3, points.armholeMid)
    .split(points.armhole12)
  for (let i in sideBackArmholeSplit) {
    paths['sideBackArmholeSplit' + i] = sideBackArmholeSplit[i].hide()
  }
  points.sideBackArmholeMid = paths.sideBackArmholeSplit0.shiftFractionAlong(0.5)
  points.sideBackArmholeChordMid = points.armhole12.shiftFractionTowards(
    points.sideBackArmhole,
    0.5
  )

  let sideBackArmholeRadius =
    Math.pow(points.armhole12.dist(points.sideBackArmhole), 2) /
      (8 * points.sideBackArmholeMid.dist(points.sideBackArmholeChordMid)) +
    points.sideBackArmholeMid.dist(points.sideBackArmholeChordMid) / 2
  points.sideBackArmholePivot = points.sideBackArmholeMid.shiftTowards(
    points.sideBackArmholeChordMid,
    sideBackArmholeRadius
  )

  let sideBackArmholeAngle = utils.rad2deg(
    paths.sideBackArmholeSplit0.length() / sideBackArmholeRadius
  )
  let sideBackArmholeCpDistance =
    (4 / 3) * sideBackArmholeRadius * Math.tan(utils.deg2rad(sideBackArmholeAngle / 4))
  points.sideBackArmholeCp1 = points.sideBackArmhole
    .shiftTowards(points.sideBackArmholePivot, sideBackArmholeCpDistance)
    .rotate(90, points.sideBackArmhole)
  points.sideBackArmholeCp2 = points.armhole12
    .shiftTowards(points.sideBackArmholePivot, sideBackArmholeCpDistance)
    .rotate(-90, points.armhole12)

  //side seam
  points.sideFrontWaist = points.waist15.shiftTowards(points.h, underarmGap / 2)
  points.sideBodyWaist = points.waist15.shiftTowards(points.b, underarmGap / 2)
  // if (points.waist15.x > points.armholeMid.x){
  // points.armhole15 = utils.lineIntersectsCurve(points.waist15, points.waist15.shift(90, measurements.waist), points.sideBodyArmhole, points.sideBodyArmholeCp1, points.sideBodyArmholeCp2, points.armholeMid)
  // }
  // else {
  // points.armhole15 = utils.lineIntersectsCurve(points.waist15, points.waist15.shift(90, measurements.waist), points.armholeMid, points.armholeCp4, points.armholeCp5, points.frontArmholePitch)
  // }
  points.armhole15 = points.armholeMid

  let underarmAngle = (90 - points.sideFrontWaist.angle(points.armhole15)) * options.underarmCurve
  points.sideFrontWaistCp = points.sideFrontWaist
    .shiftFractionTowards(points.armhole15, 2 / 3)
    .rotate(underarmAngle, points.sideFrontWaist)
  points.sideBodyWaistCp = points.sideBodyWaist
    .shiftFractionTowards(points.armhole15, 2 / 3)
    .rotate(-underarmAngle, points.sideBodyWaist)

  //sidebody and sideback curve

  points.lAnchor = points.waist17.shiftFractionTowards(points.armhole12, 1 / 3)
  points.sideBodyMid = points.lAnchor.shift(180, (measurements.waist * 1) / 288)
  points.sideBackMid = points.lAnchor.shift(0, (measurements.waist * 3) / 288)

  points.sideBackCpTarget = utils.beamsIntersect(
    points.lAnchor.shiftFractionTowards(points.armhole12, 0.5),
    points.waist17.rotate(90, points.lAnchor.shiftFractionTowards(points.armhole12, 0.5)),
    points.sideBackMid,
    points.sideBackMid.shift(90, 1)
  )

  points.sideBackCp3 = points.armhole12.shiftFractionTowards(points.sideBackCpTarget, 1 / 3)
  points.sideBackCp4 = points.sideBackMid.shiftFractionTowards(points.sideBackCpTarget, 2 / 3)

  points.sideBodyCp2 = new Point(points.sideBodyMid.x, points.sideBackCpTarget.y)
  points.sideBodyCp3 = points.sideBackCpTarget

  points.sideBackCp5 = points.sideBackMid
    .shiftFractionTowards(points.sideBackCp4, 2 / 3)
    .rotate(180, points.sideBackMid)
  points.sideBodyCp1 = points.sideBodyMid
    .shiftFractionTowards(points.sideBodyCp2, 1 / 3)
    .rotate(180, points.sideBodyMid)

  //dart manipulation
  let dartWaistOffset = measurements.waist * options.dartWaistOffset

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
    //if (options.dartNumber == '2' && points.dart6.x < points.dart5.x) log.debug('Due to the dart overlap only one dart has been drafted')
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

  if (options.type == 'hips') {
  } else {
  }

  //guides
  paths.originb = new Path().move(points.origin).line(points.b).attr('class', 'fabric lashed')

  paths.ccbNeck = new Path().move(points.c).line(points.cbNeck)

  paths.a1g = new Path().move(points.a1).line(points.g).attr('class', 'fabric lashed')

  paths.hpsBackshoulderMax = new Path()
    .move(points.hpsBack)
    .line(points.shoulderMax)
    .attr('class', 'fabric lashed')

  paths.cbNeck = new Path().move(points.cbNeck).curve_(points.cbNeckCp1, points.hpsBack)

  paths.xc = new Path().move(points.x).line(points.c).attr('class', 'fabric lashed')

  paths.formBack = new Path()
    .move(points.hpsBack)
    .line(points.x)
    .curve_(points.armholeCp1, points.backArmholePitch)
    ._curve(points.backCp1, points.backPitch)
    .curve_(points.backCp2, points.d)

  paths.hpsFrontt = new Path()
    .move(points.hpsFront)
    .line(points.tShoulder)
    .attr('class', 'fabric lashed')

  paths.fh = new Path().move(points.f).line(points.h).attr('class', 'fabric lashed')

  paths.cfNeck = new Path()
    .move(points.hpsFront)
    .curve(points.frontNeckCp1, points.frontNeckCp2, points.n)

  paths.frontShoulder = new Path()
    .move(points.frontShoulder)
    .curve(points.frontShoulderCp1, points.frontShoulderCp2, points.hpsFront)

  paths.frontArmholeCurve = new Path()
    .move(points.armholeMid)
    .curve(points.armholeCp4, points.armholeCp5, points.frontArmholePitch)
    .curve(points.armholeCp6, points.armholeCp7, points.frontShoulder)

  paths.backPitchSideArmhole = new Path()
    .move(points.backPitch)
    .curve_(points.backCp1, points.sideBackArmhole)

  paths.sideBackArmholeCurve = new Path()
    .move(points.sideBackArmhole)
    .curve(points.armholeCp2, points.armholeCp3, points.armholeMid)
    .hide()

  paths.lv = new Path().move(points.l).line(points.vShoulder).attr('class', 'fabric lashed')

  paths.ik = new Path().move(points.i).line(points.k).attr('class', 'fabric lashed')

  paths.sideBackCurveRight = new Path()
    .move(points.waist16)
    .curve(points.sideBackCp1, points.sideBackCp2, points.backPitch)

  paths.centreFront = new Path()
    .move(points.n)
    .curve(points.cfCp1, points.cfCp2, points.gStar)
    .curve(points.cfCp3, points.cfCp4, points.h)

  paths.uq = new Path().move(points.u).line(points.q).attr('class', 'fabric lashed')

  paths.tDartr = new Path().move(points.tDart).line(points.r).attr('class', 'fabric lashed')

  paths.waist15armhole15 = new Path()
    .move(points.waist15)
    .line(points.armhole15)
    .attr('class', 'fabric lashed')

  paths.waist17armohle12 = new Path()
    .move(points.waist17)
    .line(points.armhole12)
    .attr('class', 'fabric lashed')
    .hide()

  paths.sideBodyArmhole = new Path()
    .move(points.sideBodyArmhole)
    .curve(points.sideBodyArmholeCp1, points.sideBodyArmholeCp2, points.armholeMid)

  paths.sideBackArmhole = new Path()
    .move(points.sideBackArmhole)
    .curve(points.sideBackArmholeCp1, points.sideBackArmholeCp2, points.armhole12)

  paths.sideFrontWaist = new Path()
    .move(points.sideFrontWaist)
    .curve_(points.sideFrontWaistCp, points.armhole15)

  paths.sideBodyWaist = new Path()
    .move(points.armhole15)
    ._curve(points.sideBodyWaistCp, points.sideBodyWaist)

  paths.sideBodyCurveRight = new Path()
    .move(points.waist17)
    ._curve(points.sideBodyCp1, points.sideBodyMid)
    .curve(points.sideBodyCp2, points.sideBodyCp3, points.sideBodyArmhole)

  paths.sideBackCurveLeft = new Path()
    .move(points.armhole12)
    .curve(points.sideBackCp3, points.sideBackCp4, points.sideBackMid)
    .curve_(points.sideBackCp5, points.waist17)
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
