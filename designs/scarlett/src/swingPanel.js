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
  .setRender(false)
  
  paths.saBase = new Path()
  .move(points.cfWaist)
  ._curve(points.waist0Cp1, points.waistPanel0)
  .curve_(points.waist0Cp2, points.waist0Left)
  .line(points.waist1)
  .curve(points.dartTipDCp1, points.dartTipDCp2, points.dartTipD)
  .line(points.hemD)
  .setRender(false)
  
  paths.seam = paths.hemBase.clone().line(points.cfWaist).join(paths.saBase).close()
  
  if (complete) {
  //facings
  if (options.facings){
      paths.facing = paths.hemBase.offset(-facingWidth).attr('class', 'interfacing').attr('data-text', 'Facing - Line').attr('data-text-class','center')
  }
  //grainline
  points.cutOnFoldFrom = points.cfHem
  points.cutOnFoldTo = points.cfWaist
  macro('cutonfold', {
    from: points.cutOnFoldFrom,
    to: points.cutOnFoldTo,
    grainline: true
  })
  //title
  points.title = new Point(points.dartTipD.x * 0.9, (points.crotch.y + points.crotchHem.y) / 2)
  macro("title", {
    at: points.title,
    nr: 'X',
    title: 'Swing Panel',
  });
      if (sa) {
      paths.sa = paths.hemBase.offset(sa * options.hemWidth * 100).line(points.cfHem).line(points.cfWaist).join(paths.saBase.offset(sa)).close().attr('class','fabric sa')
      
      if (options.facings){
          paths.facingSa = new Path()
          .move(paths.facing.end())
          .join(paths.facing.reverse())
          .line(points.hemD)
          .offset(sa)
          .join(paths.hemBase.offset(sa * options.hemWidth * 100))
          .line(points.cfHem)
          .line(paths.facing.end())
          .close()
          .attr('class','interfacing sa')
      }
      }
      if (paperless) {
    
      }
    }
  
    return part
  }
  