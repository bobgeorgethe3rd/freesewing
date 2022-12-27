export default function (part) {
    let {
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
      raise,
      absoluteOptions,
    } = part.shorthand()
  //removing paths and snippets not required from Bella
  for (let i in paths) delete paths[i]
  for (let i in snippets) delete snippets[i]
  //removing macros not required from Bella
  macro('title', false)
  macro('scalebox', false)
  delete points.__exportDate
  //inherit from bella
  let underArmLength = store.get('underArmLength')
  let underArmCurveLength = store.get('underArmCurveLength')
  let sideLength = store.get('sideLength')
  // let waistFront = points.cfHem.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideHem)
 
  //undearm
  let tweak = 1
  let target 
  if (options.fullSleeves) target = underArmLength
  else target = underArmCurveLength
  let delta
  do {
      points.armholeBottom = points.armholeDrop.shiftTowards(points.sideHem, points.armholeDrop.dist(points.bodiceSleeveBottom) * tweak)
      
      const drawUnderArm = () => {
      if (options.fullSleeves)
          return new Path()
      .move(points.armholeBottom)
      .curve_(points.armholeDrop, points.bodiceSleeveBottom)
      .line(points.wristBottom)
      else
          return new Path()
      .move(points.armholeBottom)
      .curve_(points.armholeCp, points.bodiceSleeveBottom)
    }
  
      delta = drawUnderArm().length() - target
    if (delta > 0) tweak = tweak * 0.99
    else tweak = tweak * 1.01
  } while (Math.abs(delta) > 1)	
  
  points.sideWaist = points.armholeBottom.shiftTowards(points.sideHem, sideLength)
  
  //guides
  // paths.bellaGuide = new Path()
      // .move(points.cfWaist)
      // .line(points.waistDartLeft)
      // .curve_(points.waistDartLeftCp, points.waistDartTip)
      // ._curve(points.waistDartRightCp, points.waistDartRight)
      // .line(points.sideHem)
      // .line(points.armhole)
      // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      // .curve_(points.armholePitchCp2, points.shoulder)
      // .line(points.hps)
      // .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      // .line(points.cfWaist)
      // .close()
      // .attr('class', 'various lashed')
  
  //seam Paths
  const drawArm = () => {
      if (options.fullSleeves)
          return new Path()
      .move(points.armholeBottom)
      .curve_(points.armholeDrop, points.bodiceSleeveBottom)
      .line(points.wristBottom)
      .line(points.wristTop)
      .line(points.hps)
      else
          return new Path()
      .move(points.armholeBottom)
      .curve_(points.armholeCp, points.bodiceSleeveBottom)
      .line(points.bodiceSleeveTop)
      .line(points.hps)
    }
  
  paths.saBase = new Path()
  .move(points.cfWaist)
  .line(points.waistDartLeft)
  .line(points.waistDartEdge)
  .line(points.waistDartRight)
  .line(points.sideWaist)
  .line(points.armholeBottom)
  .join(drawArm())
  .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
  .setRender(false)
  
  paths.seam = new Path()
  .move(points.cfWaist)
  .line(points.waistDartLeft)
  .curve_(points.waistDartLeftCp, points.waistDartTip)
  ._curve(points.waistDartRightCp, points.waistDartRight)
  .line(points.sideWaist)
  .line(points.armholeBottom)
  .join(drawArm())
  .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
  .line(points.cfWaist)
  .close()
  .setRender(true)
  
  
  //dress
  // let fullSkirtLength = measurements.waistToFloor * (1 + options.skirtLengthBonus)
  // let centreSkirtAngle = 90 * options.skirtFlare * (points.cfWaist.dist(points.waistDartLeft) / waistFront)
  // points.cfHem = points.cfWaist.shift(270 - centreSkirtAngle, fullSkirtLength)
  
  // let skirtPivotAngle = 90 - (90 * (points.cfWaist.dist(points.waistDartLeft) / waistFront)) - points.cfWaist.angle(points.sideWaist)
  // points.skirtPivot = points.cfWaist.shift(points.cfWaist.angle(points.sideWaist) + skirtPivotAngle, Math.cos(utils.deg2rad(skirtPivotAngle)) * points.cfWaist.dist(points.sideWaist))
  // let sideSkirtAngle = (points.skirtPivot.angle(points.sideWaist) - points.armhole.angle(points.sideWaist)) * options.skirtFlare
  
  // points.sideHem = points.sideWaist.shift(points.armhole.angle(points.sideWaist) + sideSkirtAngle, fullSkirtLength)
  // points.hemCpTarget = utils.beamsIntersect(points.cfHem, points.cfWaist.rotate(-90, points.cfHem), points.sideHem, points.sideWaist.rotate(90, points.sideHem))
  // points.hemCp1 = points.cfHem.shiftFractionTowards(points.hemCpTarget, 2 / 3)
  // points.hemCp2 = points.sideHem.shiftFractionTowards(points.hemCpTarget, 2 / 3)
  
  // points.sideWaistCp = points.armholeBottom.shiftFractionTowards(points.sideWaist, 1 / 3)
  
  // paths.fullSkirt = new Path()
  // .move(points.cfBust)
  // .curve(points.cfWaist, points.cfWaist, points.cfHem)
  // .curve(points.hemCp1, points.hemCp2, points.sideHem)
  // .curve(points.sideWaist, points.sideWaistCp, points.armholeBottom)
  
  // paths.triangle = new Path()
  // .move(points.cfWaist)
  // .line(points.skirtPivot)
  // .line(points.sideWaist)
  
  //stores
  store.set('sleeveWidthBack', points.bodiceSleeveTop.dist(points.bodiceSleeveBottom))
    if (complete) {
  //grainline
  points.cutOnFoldFrom = points.cfNeck
  points.cutOnFoldTo = points.cfWaist
  macro('cutonfold', {
    from: points.cutOnFoldFrom,
    to: points.cutOnFoldTo,
    grainline: true
  })
  //notches
  snippets.notch = new Snippet('notch', points.armholeBottom)
  //title
  points.title = new Point(points.waistDartLeftCp.x, points.waistDartLeftCp.y / 2)
  macro("title", {
    at: points.title,
    nr: '2',
    title: 'front',
  });
  //scalebox
  points.scalebox = new Point(points.title.x, points.waistDartLeftCp.y * (17 / 24)).shift(0, 15)
   macro('miniscale', { at: points.scalebox})
      if (sa) {
  paths.sa = paths.saBase.clone()
  .offset(sa)
  .line(points.cfWaist)
  .close()
  .attr('class', 'fabric sa')
      }
      if (paperless) {
    
      }
    }
  
    return part
  }
  