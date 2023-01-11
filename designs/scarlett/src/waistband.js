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
  let length = store.get('fullWaist') - (store.get('frontWaistPanel') * 2) + (store.get('placketWidth') * 2)
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
  //notches and lines
  // points.placketFrom = points.topLeft.shiftTowards(overlapTo, store.get('placketWidth'))
  // points.placketTo = new Point(points.placketFrom.x, points.bottomLeft.y)
  // paths.placketLine = new Path()
  // .move(points.placketFrom)
  // .line(points.placketTo)
  // .attr('class','various')
  // .attr('data-text','Placket Line')
  // .attr('data-text-class','centre')
  
  points.centreFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.5)
  points.centreTo = new Point(points.centreFrom.x, points.bottomLeft.y)
  paths.centreLine = new Path()
  .move(points.centreFrom)
  .line(points.centreTo)
  .attr('class','various')
  .attr('data-text','Centre Back')
  .attr('data-text-class','center')
  
  points.placketFromLeft = points.topLeft.shiftTowards(points.topRight, store.get('placketWidth'))
  points.placketFromRight = points.placketFromLeft.flipX(points.centreFrom)
  points.placketToLeft = new Point(points.placketFromLeft.x, points.bottomLeft.y)
  points.placketToRight = new Point(points.placketFromRight.x, points.bottomLeft.y)
  
  paths.placketLineLeft = new Path()
  .move(points.placketFromLeft)
  .line(points.placketToLeft)
  .attr('class','various')
  .attr('data-text','Placket Line')
  .attr('data-text-class','center')
  
  paths.placketLineRight = new Path()
  .move(points.placketFromRight)
  .line(points.placketToRight)
  .attr('class','various')
  .attr('data-text','Placket Line')
  .attr('data-text-class','center')
  
  points.pleatTopLeft = points.centreFrom.shiftFractionTowards(points.placketFromLeft, 1 / 3)
  points.pleatTopRight = points.pleatTopLeft.flipX(points.centreFrom)
  points.pleatBottomLeft = new Point(points.pleatTopLeft.x, points.bottomLeft.y)
  points.pleatBottomRight = new Point(points.pleatTopRight.x, points.bottomLeft.y)
  
  macro('sprinkle', {
    snippet: 'notch',
    on: [
    'centreFrom',
    'centreTo',
    'placketFromLeft',
    'placketToLeft',
    'placketFromRight',
    'placketToRight',
    'pleatTopLeft',
    'pleatTopRight',
    'pleatBottomLeft',
    'pleatBottomRight',
    ]
  })
  
  //title
  let titleFraction
  if (options.waistbandFold == 'folded') titleFraction = 0.75
  else titleFraction = 0.5
  points.title = points.topLeft.shiftFractionTowards(points.topRight, 0.25).shift(-90, width * titleFraction)
  macro("title", {
    at: points.title,
    nr: 'X',
    title: 'Waistband',
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
  