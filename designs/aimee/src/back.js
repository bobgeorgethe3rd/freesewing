export default (part) => {
  const {
    Point, points,
    Path, paths,
    Snippet, snippets,
    complete,
    options,
    sa,
    paperless,
    macro,
	store,
	utils,
	measurements,
  } = part.shorthand()
//remove paths & snippets
for (let i in paths) delete paths[i]
for (let i in snippets) delete snippets[i]
//removing macros not required from Bella
macro('title', false)
delete points.__exportDate
//measures
let shoulderRise = measurements.hpsToWaistBack * options.shoulderRise
let shoulderToWrist = measurements.shoulderToWrist * (1 + options.sleeveLengthBonus)
let wrist = measurements.wrist * (1 + options.wristEase)
let armholeDrop = measurements.hpsToWaistBack * options.armholeDrop
let underArmCurve = measurements.shoulderToWrist * options.underArmCurve
//let's begin
//shoudler top
points.shoulderRise = points.armholePitchCp2.shiftOutwards(points.shoulder, shoulderRise)
points.wristTop = points.hps.shiftOutwards(points.shoulderRise, shoulderToWrist)

points.armholeDrop = points.armhole.shiftTowards(points.waistSide, armholeDrop)
if (options.fitSleeves){
	points.wristBottom = points.wristTop.shiftTowards(points.hps, wrist / 2).rotate(90, points.wristTop)
}
else {
	points.wristBottom = utils.beamsIntersect(points.armholeDrop, points.armholeDrop.shift(points.hps.angle(points.wristTop), 1), points.wristTop, points.hps.rotate(90, points.wristTop))
}

//let's try and make a curve
points.bodiceSleeveTop = points.hps.rotate(180, points.shoulderRise)
points.bodiceSleeveBottom = utils.beamsIntersect(points.armholeDrop, points.wristBottom, points.bodiceSleeveTop, points.hps.rotate(90, points.bodiceSleeveTop))
points.armholeBottom = points.armholeDrop.shiftTowards(points.waistSide, underArmCurve)
points.armholeCp = utils.beamsIntersect(points.armhole, points.waistSide, points.bodiceSleeveBottom, points.bodiceSleeveTop.rotate(90, points.bodiceSleeveBottom))
//guides
  // paths.bellaGuide = new Path()
    // .move(points.cbNeck)
    // .curve_(points.cbNeckCp2, points.waistCenter)
    // .line(points.dartBottomLeft)
    // .curve_(points.dartLeftCp, points.dartTip)
    // ._curve(points.dartRightCp, points.dartBottomRight)
    // .line(points.waistSide)
    // .curve_(points.waistSideCp2, points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .line(points.hps)
    // ._curve(points.cbNeckCp1, points.cbNeck)
    // .close()
    // .attr('class', 'various lashed')

//seam paths

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
.move(points.dartBottomRight)
.line(points.waistSide)
.line(points.armholeBottom)
.join(drawArm())
._curve(points.cbNeckCp1, points.cbNeck)
.curve_(points.cbNeckCp2, points.waistCenter)
.line(points.dartBottomLeft)
.setRender(false)

paths.seam = paths.saBase.clone()
.curve_(points.dartLeftCp, points.dartTip)
._curve(points.dartRightCp, points.dartBottomRight)
.close()
.setRender(true)
//stores
store.set('shoulderTop', points.hps.dist(points.wristTop))
store.set('shoulderRise', shoulderRise)
store.set('armholeDrop', armholeDrop)
store.set('wrist', wrist)
store.set('shoulderWidth', points.hps.dist(points.bodiceSleeveTop))
store.set('underArmLength', new Path().move(points.armholeBottom).curve_(points.armholeDrop, points.bodiceSleeveBottom).line(points.wristBottom).length())
store.set('underArmCurveLength', new Path().move(points.armholeBottom).curve_(points.armholeCp, points.bodiceSleeveBottom).length())
store.set('sideLength', points.armholeBottom.dist(points.waistSide))
store.set('sleeveLength', points.bodiceSleeveTop.dist(points.wristTop))
store.set('sleeveWidthFront', points.bodiceSleeveTop.dist(points.bodiceSleeveBottom))
  // Complete?
  if (complete) {
//grainline
points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.5)
points.grainlineTo = new Point(points.grainlineFrom.x, points.dartBottomLeft.y)
macro("grainline", {
  from: points.grainlineFrom,
  to: points.grainlineTo,
});
//notches
snippets.notch = new Snippet('notch', points.armholeBottom)
//title
points.title = new Point(points.cbNeckCp1.x, points.dartTip.y * (3 / 4))
macro("title", {
  at: points.title,
  nr: '1',
  title: 'back',
});
    if (sa) {
paths.sa = paths.saBase.clone()
.line(points.dartBottomRight)
.offset(sa)
.close()
.attr('class', 'fabric sa')
    }
  }

  if (paperless) {

  }

  return part
}
