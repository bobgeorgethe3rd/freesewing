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
      absoluteOptions,
    } = part.shorthand()
  //setRender
  if (options.fullSleeves) {
      part.render = false
      return part
    }
  //measures
  let sleeveLength = store.get('sleeveLength')
  let sleeveWidthFront = store.get('sleeveWidthFront')
  let sleeveWidthBack = store.get('sleeveWidthBack')
  let wrist = store.get('wrist')
  //let's begin
  points.origin = new Point(0, 0)
  points.sleeveTopLeft = points.origin.shift(180, sleeveWidthFront)
  points.sleeveTopRight = points.origin.shift(0, sleeveWidthBack)
  points.sleeveTopMid = points.sleeveTopLeft.shiftFractionTowards(points.sleeveTopRight, 0.5)
  points.wristMid = points.sleeveTopMid.shift(-90, sleeveLength)
  
  if (options.fitSleeves){
      points.wristLeft = points.wristMid.shift(180, wrist / 2)
      points.wristRight = points.wristLeft.rotate(180, points.wristMid)
  }
  else {
      points.wristLeft = new Point(points.sleeveTopLeft.x, points.wristMid.y)
      points.wristRight = new Point(points.sleeveTopRight.x, points.wristMid.y)
  }
  
  //paths
  paths.seam = new Path()
  .move(points.wristRight)
  .line(points.sleeveTopRight)
  .line(points.sleeveTopLeft)
  .line(points.wristLeft)
  .line(points.wristRight)
  
    // Complete?
    if (complete) {
  //grainline
  points.grainlineFrom = points.sleeveTopMid
  points.grainlineTo = points.wristMid
  macro("grainline", {
    from: points.grainlineFrom,
    to: points.grainlineTo,
  });
  //notches
  snippets.notch = new Snippet('notch', points.origin)
  //title
  points.title = new Point(points.origin.x, points.wristMid.y / 2)
  macro("title", {
    at: points.title,
    nr: '3',
    title: 'sleeve',
  });
      if (sa) {
  paths.sa = paths.seam.offset(sa).attr('class', 'fabric sa').close()
      }
    }
  
    if (paperless) {
  
    }
  
    return part
  }
  