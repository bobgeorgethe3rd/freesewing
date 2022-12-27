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
  let bustDartAngleSide = store.get('bustDartAngleSide')
  let shoulderRise = measurements.hpsToWaistBack * options.shoulderRise
  let shoulderToWrist = measurements.shoulderToWrist * (1 + options.sleeveLengthBonus)
  let wrist = measurements.wrist * (1 + options.wristEase)
  let armholeDrop = measurements.hpsToWaistBack * options.armholeDrop
  let underArmSleeveLength = measurements.shoulderToWrist * options.underArmSleeveLength

  // let waistFront = points.cfHem.dist(points.waistDartLeft) + points.waistDartRight.dist(points.sideHem)
  //rotate to close bust dart
  points.bustDartClosed = points.bustDartTop
  
  let rot = ['waistDartRightCp', 'waistDartRight', 'sideHemInitial']
  for (const p of rot) points[p] = points[p].rotate(bustDartAngleSide, points.bust)
  
  points.waistDartMiddle = points.waistDartLeft.shiftFractionTowards(points.waistDartRight, 0.5)
  points.waistDartEdge = utils.beamsIntersect(
      points.bust,
      points.waistDartMiddle,
      points.cfHem,
      points.waistDartLeft
    )
  points.sideHem = utils.beamsIntersect(points.waistDartRight,points.sideHemInitial,points.armhole,points.bustDartClosed)
  //rename some points
  points.cfWaist = points.cfHem
  
  //creating shoulder Top
  points.shoulderRise = points.armholePitchCp2.shiftOutwards(points.shoulder, shoulderRise)
  points.wristTop = points.hps.shiftTowards(points.shoulderRise, shoulderToWrist)
  
  //undearm
  points.armholeDrop = points.armhole.shiftTowards(points.sideHem, armholeDrop)
  if (options.fitSleeves){
      points.wristBottom = points.wristTop.shiftTowards(points.hps, wrist / 2).rotate(90, points.wristTop)
  }
  else {
      points.wristBottom = utils.beamsIntersect(points.armholeDrop, points.armholeDrop.shift(points.hps.angle(points.wristTop), 1), points.wristTop, points.hps.rotate(90, points.wristTop))
  }
  
  points.bodiceSleeveBottom = points.armholeDrop.shiftTowards(points.wristBottom, underArmSleeveLength)
  points.bodiceSleeveTop = utils.beamsIntersect(points.hps, points.wristTop, points.bodiceSleeveBottom, points.bodiceSleeveBottom.shift(points.wristBottom.angle(points.wristTop), 1))
  points.armholeCp = utils.beamsIntersect(points.armhole, points.sideHem, points.bodiceSleeveBottom, points.bodiceSleeveTop.rotate(90, points.bodiceSleeveBottom))
  
  //guides
   paths.bellaGuide = new Path()
       .move(points.cfWaist)
       .line(points.waistDartLeft)
       .curve_(points.waistDartLeftCp, points.waistDartTip)
       ._curve(points.waistDartRightCp, points.waistDartRight)
       .line(points.sideHem)
       .line(points.armhole)
       .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
       .curve_(points.armholePitchCp2, points.shoulder)
       .line(points.hps)
       .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
       .line(points.cfWaist)
       .close()
       .attr('class', 'various lashed')
  
       paths.armscaffold = new Path()
       .move(points.armholeDrop)
       .line(points.wristBottom)
       .line(points.wristTop)
       .line(points.hps)
       
       //Stores
      store.set('shoulderTop', points.hps.dist(points.wristTop))
      store.set('shoulderRise', shoulderRise)
      store.set('armholeDrop', armholeDrop)
      store.set('wrist', wrist)
      store.set('shoulderWidth', points.hps.dist(points.bodiceSleeveTop))
      store.set('underArmSleeveLength', underArmSleeveLength)
    if (complete) {
 
      if (sa) {

      }
      if (paperless) {
    
      }
    }
  
    return part
  }
  