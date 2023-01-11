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
    } = part.shorthand()
  //delete paths
  for (let i in paths) delete paths[i]
  //measures
  let widthMultiplier
  if (options.waistbandFold == 'folded') widthMultiplier = 2
  else widthMultiplier = 1
  let width = absoluteOptions.waistbandWidth * widthMultiplier
  let length = store.get('frontWaistPanel') * 2
  //let's begin
  points.topLeft = new Point(0, 0)
  points.topRight = points.topLeft.shift(0, length)
  points.bottomLeft = points.topLeft.shift(-90, width)
  points.bottomRight = new Point(points.topRight.x, points.bottomLeft.y)
  
  paths.seam = new Path()
  .move(points.topLeft)
  .line(points.bottomLeft)
  .line(points.bottomRight)
  .line(points.topRight)
  .line(points.topLeft)
  .close()
  
  if (complete) {
  //foldline
  if (options.waistbandFold == 'folded'){
      points.foldlineFrom = points.topLeft.shiftFractionTowards(points.bottomLeft, 0.5)
      points.foldlineTo = new Point(points.topRight.x, points.foldlineFrom.y)
      paths.foldline = new Path()
  .move(points.foldlineFrom)
  .line(points.foldlineTo)
  .attr('class','various')
  .attr('data-text','Fold-line')
  }
  //grainline
  points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.75)
  points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
  macro("grainline", {
    from: points.grainlineFrom,
    to: points.grainlineTo,
  });
  //notches & centre line
  points.topMid = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
  points.bottomMid = new Point(points.topMid.x, points.bottomLeft.y)
  paths.centreFront = new Path()
  .move(points.topMid)
  .line(points.bottomMid)
  .attr('class','various')
  .attr('data-text','Centre Front')
  .attr('data-text-class','center')
  macro('sprinkle', {
    snippet: 'notch',
    on: ['topMid', 'bottomMid',]
  })
  //title
  let titleFraction
  if (options.waistbandFold == 'folded') titleFraction = 0.75
  else titleFraction = 0.5
  points.title = points.topLeft.shiftFractionTowards(points.topRight, 0.25).shift(-90, width * titleFraction)
  macro("title", {
    at: points.title,
    nr: 'X',
    title: 'Swing Waistband',
    scale: 0.1,
  });
      if (sa) {
  paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
      if (paperless) {
    
      }
    }
  
    return part
  }
  