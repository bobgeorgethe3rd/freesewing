export default function (part) {
	let {
	  store,
	  sa,
	  Point,
	  points,
	  Path,
	  paths,
	  options,
	  absoluteOptions,
	  complete,
	  paperless,
	  macro,
	  utils,
	  measurements,
	  snippets,
	  Snippet,
	  raise,
	} = part.shorthand()
  //measurements
  // void store.setIfUnset('storedHips', measurements.hips * (1 + options.hipsEase))
  // let hips = store.get('storedHips')
  void store.setIfUnset('storedWaist', measurements.waist * (1 + options.waistEase))
  let waist = store.get('storedWaist')
  let hips = measurements.hips * (1 + options.hipsEase)
  let seat = measurements.seat * (1 + options.seatEase) //? should it be waist ease //no it should be seat
  let waistbandWidth = absoluteOptions.waistbandWidth
  let topCircumference
  if (options.useStoredWaist) topCircumference = waist * (1 / options.skirtFullness)
  else topCircumference = (((hips * (1 - options.waistHeight)) + (waist * options.waistHeight)) * (1 / options.skirtFullness))
  let bottomCircumference
  if (options.useStoredWaist && options.waistBand == 'straight'){
	  bottomCircumference = waist * (1 / options.skirtFullness)
  }
	  else {
  if (options.waistband == 'elastic') {
	  if (waist > hips && waist > seat){
		  bottomCircumference = waist * (1 / options.skirtFullness)
		  raise.debug('Waist measure has been used to calculate elastic waistband')
	  }
	  if (waist < hips && hips > seat){
		  bottomCircumference = hips * (1 / options.skirtFullness)
		  raise.debug('Hips measure has been used to calculate elastic waistband')
	  }
	  if (waist < seat && hips < seat){
		  bottomCircumference = seat * (1 / options.skirtFullness)
		  raise.debug('Seat measure has been used to calculate elastic waistband')
	  }
  }
  else bottomCircumference = topCircumference + ((((waistbandWidth * (hips - waist)) / measurements.waistToHips)) * (1 / options.skirtFullness))
	  }
  let waistCircumference
  if (options.waistband == 'none') {
	  if (options.skirtGatheringMethod == 'increase') {
	  waistCircumference = topCircumference * (1 + options.skirtGathering)
	  }
	  else waistCircumference = topCircumference
  }
	  else {
  if (options.skirtGatheringMethod == 'increase') {
	  waistCircumference = bottomCircumference * (1 + options.skirtGathering)
  }
  else waistCircumference = bottomCircumference
	  }
  
  let radius = waistCircumference / 2 / Math.PI
  let skirtGathering = options.skirtGathering * (46 / - 9) //based off of a target version that kept breaking. I can maybe fix this calculation a little better but it works for now.
  let skirtFacingWidth = absoluteOptions.skirtFacingWidth
  //setting the rise
  void store.setIfUnset('storedRise', measurements.waistToHips * (1 - options.waistHeight))
  let rise 
  if (options.waistband == 'none') rise = store.get('storedRise')
  else rise = store.get('storedRise') - waistbandWidth
  //figuring out skirtLength
  let skirtHighLengthTarget
  if (options.highLow) {
  if (options.skirtHighLength == 'waistToHips' || options.skirtHighLength == 'waistToSeat' || options.skirtHighLength == 'waistToUpperLeg' || options.skirtHighLength == 'waistToKnee' || options.skirtHighLength == 'waistToFloor') {
  skirtHighLengthTarget = measurements[options.skirtHighLength] * (1 + options.skirtHighLengthBonus) - rise
  }
  if (options.skirtHighLength == 'waistToThigh') {
  skirtHighLengthTarget = (measurements.waistToUpperLeg + measurements.waistToKnee) / 2 * (1 + options.skirtHighLengthBonus) - rise
  }
  if (options.skirtHighLength == 'waistToCalf'){
  skirtHighLengthTarget = (measurements.waistToFloor * 0.95 + measurements.waistToKnee) / 2 * (1 + options.skirtHighLengthBonus) - rise
  }
  if (options.skirtHighLength == 'waistToAnkle') {
  skirtHighLengthTarget = measurements.waistToFloor * 0.95 * (1 + options.skirtHighLengthBonus) - rise
  }
  }
  else skirtHighLengthTarget = 0
  
  let skirtLengthTarget
  if (options.skirtLength == 'waistToHips'  || options.skirtLength == 'waistToSeat'  || options.skirtLength == 'waistToUpperLeg' || options.skirtLength == 'waistToKnee' || options.skirtLength == 'waistToFloor'){
  skirtLengthTarget = measurements[options.skirtLength] * (1 + options.skirtLengthBonus) - rise
  }
  if (options.skirtLength == 'waistToThigh') {
  skirtLengthTarget = (measurements.waistToUpperLeg + measurements.waistToKnee) / 2 * (1 + options.skirtLengthBonus) - rise
  }
  if (options.skirtLength == 'waistToCalf') {
  skirtLengthTarget = (measurements.waistToFloor * 0.95 + measurements.waistToKnee)/2 * (1 + options.skirtLengthBonus) - rise
  }
  if (options.skirtLength == 'waistToAnkle') {
  skirtLengthTarget = measurements.waistToFloor * 0.95 * (1 + options.skirtLengthBonus) - rise
  }
  //highLow Check
  let skirtLength
  let skirtHighLength
  if (skirtLengthTarget - skirtHighLengthTarget <= 0 && options.highLow) {
  skirtLength = measurements.waistToFloor * 0.95 - rise
  skirtHighLength = measurements.waistToKnee - rise
  raise.warning('The choices for options.skirtHighLength,  options.skirtLength,  options.skirtHighLengthBonus and options.skirtLengthBonus are incompatible to create a High - Low so the values skirtHighLength and skirtLength have been set to defaults')
  }
  else {
  skirtLength = skirtLengthTarget
  skirtHighLength = skirtHighLengthTarget
  }
  //let's begin
  //scaffold
  points.origin = new Point (0, 0)
  points.cWaist = new Point (points.origin.x, points.origin.y + radius)
  
  points.sideWaistStatic = points.cWaist.rotate(90 * options.skirtFullness, points.origin)
  points.sideFullHemStatic = points.origin.shiftOutwards(points.sideWaistStatic, skirtLength)
  
  points.sideWaist = points.sideWaistStatic
  points.sideFullHem = points.sideFullHemStatic
  
  //gather scaffold needed for both methods to help determine cps
  let j
  for (let i = 0; i < 3; i++) {
  j = i + 1
  points['gatherSplit' + i] =  points.cWaist.rotate(90 * options.skirtFullness * (j / 4), points.origin)
  points['gatherPivot' + i] = points.origin.shiftOutwards(points['gatherSplit' + i], skirtLength)
  }
  
  //skirtGathering spread
  if (options.skirtGatheringMethod == 'spread') {
  //1st rotation
  let k
  for (let i = 0; i < 3; i++) {
  k = i + 3
  points['gatherSplit' + k] = points['gatherSplit' + i].rotate(skirtGathering, points['gatherPivot' + i])
  }
  
  //2nd rotation
  let l
  let m
  for (let i = 1; i < 2; i++) {
  l = i + 3
  m = i - 1
  points['gatherSplit' + i] = points['gatherSplit' + i].rotate(skirtGathering, points['gatherPivot' + m])
  points['gatherSplit' + l] = points['gatherSplit' + l].rotate(skirtGathering, points['gatherPivot' + m])
  points['gatherPivot' + i] = points['gatherPivot' + i].rotate(skirtGathering, points['gatherPivot' + m])
  }
  
  //3rd rotation
  let n
  let o
  let p
  for (let i = 2; i < 3; i++) {
  n = i + 3
  o = i - 2
  p = i - 1
  points['gatherSplit' + i] = points['gatherSplit' + i].rotate(skirtGathering, points['gatherPivot' + o])
  points['gatherSplit' + n] = points['gatherSplit' + n].rotate(skirtGathering, points['gatherPivot' + o])
  points['gatherPivot' + i] = points['gatherPivot' + i].rotate(skirtGathering, points['gatherPivot' + o])
  
  points['gatherSplit' + i] = points['gatherSplit' + i].rotate(skirtGathering, points['gatherPivot' + p])
  points['gatherSplit' + n] = points['gatherSplit' + n].rotate(skirtGathering, points['gatherPivot' + p])
  points['gatherPivot' + i] = points['gatherPivot' + i].rotate(skirtGathering, points['gatherPivot' + p])
  }
  //mid of gathers and side rortaions
  let q
  for (let i = 0; i < 3; i++) {
  q = i + 3
  points['gatherMid' + i] = points['gatherSplit' + i].shiftFractionTowards(points['gatherSplit' + q], 0.5)
  points.sideWaist = points.sideWaist.rotate(skirtGathering, points['gatherPivot' + i])
  points.sideFullHem = points.sideFullHem.rotate(skirtGathering, points['gatherPivot' + i])
  }
  }
  else {
  //set as is for increase method.
  for (let i = 0; i < 3; i++) {
  points['gatherMid' + i] = points['gatherSplit' + i]
  }
  }
  //waist cps
  let waistCpDistance = (4 / 3) * radius * Math.tan(utils.deg2rad(90 * options.skirtFullness / 8))
  
  points.waistMidStatic = points.cWaist.rotate(90 * options.skirtFullness / 2, points.origin)
  points.waistCpTargetStatic = utils.beamsIntersect(points.cWaist, points.cWaist.shift(0, 1), points.waistMidStatic, points.origin.rotate(-90, points.waistMidStatic))
  
  let waistCpFraction = waistCpDistance / points.waistMidStatic.dist(points.waistCpTargetStatic)
  
  points.waistCpTarget = utils.beamsIntersect(points.gatherMid1, points.gatherPivot1.rotate(-90, points.gatherMid1), points.gatherPivot0, points.gatherSplit0)
  points.waistCp4 = points.cWaist.shift(0, waistCpDistance)
  points.waistCp3 = points.gatherMid1.shiftFractionTowards(points.waistCpTarget, waistCpFraction)
  points.waistCp2 = points.waistCp3.rotate(180, points.gatherMid1)
  points.waistCp1 = points.sideWaist.shiftTowards(points.sideFullHem, waistCpDistance).rotate(-90, points.sideWaist)
  
  //waist Path
  paths.waist = new Path()
  .move(points.sideWaist)
  .curve(points.waistCp1, points.waistCp2, points.gatherMid1)
  .curve(points.waistCp3, points.waistCp4, points.cWaist)
  .setRender(false)
  
  //setting up newOrigin and for panelling
  if (options.skirtGathering == 0 || options.skirtGatheringMethod == 'increase'){
	  points.newOrigin = points.origin
  }
  else points.newOrigin = utils.beamsIntersect(points.cWaist, points.cWaist.shift(90, 1), points.sideFullHem, points.sideWaist)
  
  for (let i = 0; i < 3; i++) {
  points['waist' + i] = paths.waist.reverse().shiftFractionAlong((i + 1)/ 4)
  }
  
  //fullHem paths, skirtFacings and points
  points.cFullHem = points.origin.shiftOutwards(points.cWaist, skirtLength)
  points.fullHemMid = points.gatherMid1.shiftTowards(points.gatherPivot1, skirtLength)
  
  points.fullHemCp1 = utils.beamsIntersect(points.cFullHem, points.cWaist.rotate(-90, points.cFullHem), points.newOrigin, points.waistCp4)
  points.fullHemCp2 = utils.beamsIntersect(points.fullHemMid, points.gatherMid1.rotate(90, points.fullHemMid), points.newOrigin, points.waistCp3)
  points.fullHemCp3 = utils.beamsIntersect(points.fullHemMid, points.gatherMid1.rotate(-90, points.fullHemMid), points.newOrigin, points.waistCp2)
  points.fullHemCp4 = utils.beamsIntersect(points.sideFullHem, points.sideWaist.rotate(90, points.sideFullHem), points.newOrigin, points.waistCp1)
  
  paths.fullHem = new Path()
  .move(points.cFullHem)
  .curve(points.fullHemCp1, points.fullHemCp2, points.fullHemMid)
  .curve(points.fullHemCp3, points.fullHemCp4, points.sideFullHem)
  .setRender(false)
  
  if (options.skirtFacings){
  paths.fullHemFacing = paths.fullHem.reverse().offset(skirtFacingWidth)//.setRender(false)
  
  points.cFullHemFacing = points.cFullHem.shiftTowards(points.cWaist, skirtFacingWidth)
  points.fullHemFacingMid = points.fullHemMid.shiftTowards(points.gatherMid1, skirtFacingWidth)
  points.sideFullHemFacing = points.sideFullHem.shiftTowards(points.sideWaist, skirtFacingWidth)
  
  points.fullHemFacingCp1 = utils.beamsIntersect(points.sideFullHemFacing, points.sideWaist.rotate(90, points.sideFullHemFacing), points.fullHemCp4, points.waistCp1)
  points.fullHemFacingCp2 = utils.beamsIntersect(points.fullHemFacingMid, points.gatherMid1.rotate(-90, points.fullHemFacingMid), points.fullHemCp3, points.waistCp2)
  points.fullHemFacingCp3 = utils.beamsIntersect(points.fullHemFacingMid, points.gatherMid1.rotate(90, points.fullHemFacingMid), points.fullHemCp2, points.waistCp3)
  points.fullHemFacingCp4 = utils.beamsIntersect(points.cFullHemFacing, points.cWaist.rotate(-90, points.cFullHemFacing), points.fullHemCp1, points.waistCp4)
  
  paths.fullHemFacing = new Path()
  .move(points.sideFullHemFacing)
  .curve(points.fullHemFacingCp1, points.fullHemFacingCp2, points.fullHemFacingMid)
  .curve(points.fullHemFacingCp3, points.fullHemFacingCp4, points.cFullHemFacing)
  .setRender(false)
  }
  
  //panel points
  for (let i = 0; i < options.skirtPanels - 1; i++) {
  points['waistSplit' + i] = paths.waist.reverse().shiftFractionAlong((i + 1) / options.skirtPanels)
  points['fullHemSplit' + i] = paths.fullHem.shiftFractionAlong((i + 1) / options.skirtPanels)
  }
  //fitSeat
  let seatLength = measurements.waistToSeat - rise
  if (measurements.waistToSeat > rise && skirtLength > measurements.waistToSeat){
  points.cSeat = points.cWaist.shiftTowards(points.cFullHem, seatLength)
  points.seatMid= points.gatherMid1.shiftTowards(points.gatherPivot1, seatLength)
  points.sideSeat = points.sideWaist.shiftTowards(points.sideFullHem, seatLength)
  
  points.seatCp1 = utils.beamsIntersect(points.cSeat, points.cWaist.rotate(-90, points.cSeat), points.fullHemCp1, points.waistCp4)
  points.seatCp2 = utils.beamsIntersect(points.seatMid, points.gatherMid1.rotate(90, points.seatMid), points.fullHemCp2, points.waistCp3)
  points.seatCp3 = utils.beamsIntersect(points.seatMid, points.gatherMid1.rotate(-90, points.seatMid), points.fullHemCp3, points.waistCp2)
  points.seatCp4 = utils.beamsIntersect(points.sideSeat, points.sideWaist.rotate(90, points.sideSeat), points.fullHemCp4, points.waistCp1)
  
  paths.seat = new Path()
  .move(points.cSeat)
  .curve(points.seatCp1, points.seatCp2, points.seatMid)
  .curve(points.seatCp3, points.seatCp4, points.sideSeat)
  .setRender(false)
  
  let seatCircumference = paths.seat.length() * 4
  if (seat > seatCircumference) {
	  let seatDiff = seat - seatCircumference
	  if (options.fitSeat){
	  points.sideSeatExtension = points.sideSeat.shiftTowards(points.sideWaist, seatDiff / 4).rotate(-90, points.sideSeat)
	  points.sideSeamCpTarget = utils.beamsIntersect(points.sideSeatExtension, points.sideSeat.rotate(-90, points.sideSeatExtension), points.sideWaist, points.sideSeat.rotate(90, points.sideWaist))
	  points.sideSeamCp = points.sideSeatExtension.shiftFractionTowards(points.sideSeamCpTarget, 2 / 3)
	  if (seatLength > skirtLength) {
	  points.sideFullHemExtensionTarget = points.sideFullHem.shiftTowards(points.sideWaist, waist).rotate(-90, points.sideFullHem)
	  points.sideFullHemExtension = utils.lineIntersectsCurve(points.sideFullHem, points.sideFullHemExtensionTarget, points.sideSeatExtension, points.sideSeamCp, points.sideWaist, points.sideWaist)
  if (options.skirtFacings){
	  points.facingExtensionTarget = points.sideFullHemFacing.shiftTowards(points.sideWaist, waist).rotate(-90, points.sideFullHemFacing)
	  points.facingExtension = utils.lineIntersectsCurve(points.sideFullHemFacing, points.facingExtensionTarget, points.sideSeatExtension, points.sideSeamCp, points.sideWaist, points.sideWaist)
  }
	  paths.sideSeat = new Path()
	  .move(points.sideSeatExtension)
	  .curve_(points.sideSeamCp, points.sideWaist)
	  .setRender(false)
	  //split
	  let sideSeamSplit = paths.sideSeat.split(points.sideFullHemExtension);
  for (let i in sideSeamSplit) {
	paths['sideSeam' + i] = sideSeamSplit[i].setRender(false)
  }
	  paths.sideSeam = paths.sideSeam1.setRender(false)
	  }
	  else {
	  points.sideFullHemExtension = points.sideFullHem.shiftTowards(points.sideWaist, seatDiff / 4).rotate(-90, points.sideFullHem)
	  if (options.skirtFacings){
	  points.facingExtension = points.sideFullHemFacing.shiftTowards(points.sideWaist, seatDiff / 4).rotate(-90, points.sideFullHemFacing)
	  }
	  paths.sideSeam = new Path()
	  .move(points.sideFullHemExtension)
	  .line(points.sideSeatExtension)
	  .curve_(points.sideSeamCp, points.sideWaist)
	  .setRender(false)
	  }
	  //paths
	  //changing existing paths
	  paths.seat = paths.seat.line(points.sideSeatExtension)
	  paths.fullHem = paths.fullHem.line(points.sideFullHemExtension)
  if (options.skirtFacings) {
	  paths.fullHemFacing = new Path()
	  .move(points.facingExtension)
	  .join(paths.fullHemFacing)
	  .setRender(false)
  }
	  raise.debug('Adjusted side seam to accommodate seat. If not wanted disable options.fitSeat in Advanced.')
	  }
	  else {
	  paths.sideSeam = new Path()
	  .move(points.sideFullHem)
	  .line(points.sideWaist)
	  .setRender(false)
	  raise.warning('options.fitSeat is disabled. Seat is not accommodated with current settings.')
	  }
  }
  else {
	  paths.sideSeam = new Path()
	  .move(points.sideFullHem)
	  .line(points.sideWaist)
	  .setRender(false)
  }
  }
  else {
	  paths.sideSeam = new Path()
	  .move(points.sideFullHem)
	  .line(points.sideWaist)
	  .setRender(false)
  }
  
  //guide toggle to see
  // if (options.skirtGatheringMethod == 'spread') {
  // let z
  // for (let i = 0; i < 3; i++) {
  // z = i + 3
  // paths['gather' + i] = new Path()
  // .move(points['gatherSplit' + i])
  // .line(points['gatherPivot' + i])
  // .line(points['gatherSplit' + z])
  // }
  // }
  
  //stores
  store.set('topCircumference', topCircumference)
  store.set('bottomCircumference', bottomCircumference)
  let storedWaist
  if (options.waistband == 'none') storedWaist = store.get('topCircumference')
  else storedWaist = store.get('bottomCircumference')
  store.set('storedWaist', storedWaist)
  store.set('rise', rise)
  store.set('radius', radius)
  store.set('skirtHighLength', skirtHighLength)
  store.set('skirtLength', skirtLength)
  store.set('waistbandWidth', waistbandWidth)
  store.set('skirtFacingWidth', skirtFacingWidth)
  store.set('seat', seat)
  store.set('seatLength', seatLength)
  store.set('pocketTitleNumber', '3')
  
  if (complete) {
	  if (sa) {
	  }
	  if (paperless) {
	
	  }
	}
  
	return part
  }
  