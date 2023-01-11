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
  let facingWidth = store.get('facingWidth')
  //let's begin
  //paths
  paths.hemBase = new Path()
  .move(points.hemF)
  .curve(points.hemFCp2, points.hemECp1, points.hemE)
  .setRender(false)
  
      paths.saBase = new Path()
      .move(points.hemE)
      .line(points.dartTipE)
      .curve(points.dartTipECp2, points.dartTipECp3, points.waist0)
      .line(points.waist2Right)
      ._curve(points.waist2Cp1, points.waistPanel2)
      .curve_(points.waist2Cp2, points.waist2Left)
      .line(points.waist4)
      .curve(points.dartTipFCp1, points.dartTipFCp2, points.dartTipF)
      .line(points.hemF)
      .setRender(false)
      
      paths.seam = paths.hemBase.clone().join(paths.saBase).close()
  if (complete) {
  //facings
      if (options.facings){
          paths.facing = paths.hemBase.offset(-facingWidth).attr('class', 'interfacing').attr('data-text', 'Facing - Line').attr('data-text-class','center')
      }
  //grainline
  points.grainlineFrom = points.dartTipE.shiftFractionTowards(points.hemE, 0.05)
  points.grainlineTo = points.hemE.shiftFractionTowards(points.dartTipE, 0.05)
  macro("grainline", {
    from: points.dartTipE.rotate(90, points.grainlineFrom),
    to: points.hemE.rotate(-90, points.grainlineTo),
  });
  //notches
  macro('sprinkle', {
    snippet: 'notch',
    on: ['pocketOpeningTopLeft', 'pocketOpeningBottom',]
  })
  //title
  let titleName
  if (options.style == 'straight') titleName = 'Back Panel A'
  else titleName = 'Side Panel A'
  points.title = points.dartTipE.shiftFractionTowards(points.hemF, 0.5)
  macro("title", {
    at: points.title,
    nr: 'X',
    title: titleName,
  });
      if (sa) {
      paths.sa = paths.hemBase.offset(sa * options.hemWidth * 100).join(paths.saBase.offset(sa)).close().attr('class','fabric sa')
      if (options.facings){
          paths.facingSa = new Path()
          .move(points.hemE)
          .line(paths.facing.end())
          .join(paths.facing.reverse())
          .line(points.hemF)
          .offset(sa)
          .join(paths.hemBase.offset(sa * options.hemWidth * 100))
          .close()
          .attr('class', 'interfacing sa')
          
      }
      }
      if (paperless) {
    
      }
    }
  
    return part
  }
  