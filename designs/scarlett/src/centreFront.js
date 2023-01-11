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
  .move(points.hemD)
  .curve(points.hemDCp2, points.cfHemCp1, points.cfHem)
  .line(points.crotchHem)
  .setRender(false)
  
  paths.saBase = new Path()
  .move(points.crotchHem)
  .line(points.crotch)
  .curve(points.crotchCp1, points.cfSeat, points.cfWaist)
  ._curve(points.waist0Cp1, points.waistPanel0)
  .curve_(points.waist0Cp2, points.waist0Left)
  .line(points.waist1)
  .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
  .line(points.hemD)
  .setRender(false)
  
  paths.seam = paths.hemBase.clone().join(paths.saBase).close()
  
  if (complete) {
  //facings
  if (options.facings){
      paths.facing = paths.hemBase.offset(-facingWidth).attr('class', 'interfacing').attr('data-text', 'Facing - Line').attr('data-text-class','center')
  }
  //grainline
  points.grainlineFrom = points.cfSeat
  points.grainlineTo = points.cfHem
  macro("grainline", {
    from: points.grainlineFrom,
    to: points.grainlineTo,
  });
  //notches
  snippets.crotchNotch = new Snippet('notch', points.crotchNotch)
  //title
  points.title = new Point(points.dartTipD.x * 0.9, (points.crotch.y + points.crotchHem.y) / 2)
  macro("title", {
    at: points.title,
    nr: 'X',
    title: 'Centre Front',
  });
  //scalebox
  points.scalebox = points.waist0Cp2Target.shiftFractionTowards(points.title, 0.6)
   macro('miniscale', { at: points.scalebox })
      if (sa) {
      paths.sa = paths.hemBase.offset(sa * options.hemWidth * 100).join(paths.saBase.offset(sa)).close().attr('class','fabric sa')
  if (options.facings){
      paths.facingSa = new Path()
      .move(points.crotchHem)
      .line(paths.facing.end())
      .join(paths.facing.reverse())
      .line(points.hemD)
      .offset(sa)
      .join(paths.hemBase.offset(sa * options.hemWidth * 100))
      .close()
      .attr('class','interfacing sa')
  }
      }
      if (paperless) {
    
      }
    }
  
    return part
  }
  