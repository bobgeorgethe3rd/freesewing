export default function (part) {
  let {
    Point,
    points,
    Path,
    paths,
    options,
    complete,
    sa,
    snippets,
    Snippet,
    paperless,
    macro,
    store,
  } = part.shorthand()

  // Design pattern here
  let circumference = store.get('circumference')
  let earFlapLength = store.get('goreLength') * options.earLength
  let earFlapWidth = (circumference / 12) * options.earWidth
  points.top = new Point(0, 0)
  points.bottom = new Point(earFlapWidth, earFlapLength)
  points.topC = points.top.shift(0, points.bottom.x)
  points.topCFlipped = points.topC.flipX()
  points.bottomFlipped = points.bottom.flipX()
  points.bottomC = points.bottom.shift(90, points.bottom.y - points.bottom.x)
  points.bottomCFlipped = points.bottomC.flipX()
  paths.saBase = new Path()
    .move(points.bottom)
    .curve(points.bottomC, points.topC, points.top)
    .curve(points.topCFlipped, points.bottomCFlipped, points.bottomFlipped)
    .setRender(false)
  paths.hemBase = new Path().move(points.bottomFlipped).line(points.bottom).setRender(false)
  paths.seam = paths.saBase.join(paths.hemBase).close()
  // Complete?
  if (complete) {
    macro('grainline', { from: points.top, to: new Point(0, points.bottom.y) })
    points.logo = new Point(-0.5 * points.bottom.x, 0.75 * points.bottom.y)
    snippets.logo = new Snippet('logo', points.logo).attr('data-scale', 0.7)
    points.title = new Point(0.3 * points.bottom.x, 0.75 * points.bottom.y)
    macro('title', { at: points.title, nr: 3, title: 'ear flap', scale: 0.5 })
    macro('miniscale', { at: new Point(0, points.bottom.y * 0.3) })
    if (options.buttonhole) {
      let buttonholeDistance = store.get('goreLength')
      points.buttonhole = new Point(points.top.x, points.bottom.y - buttonholeDistance)
      snippets.buttonhole = new Snippet('buttonhole', points.buttonhole).attr('data-scale', 2)
    }
    if (sa) {
      paths.sa = paths.saBase
        .offset(sa)
        .join(paths.hemBase.offset(sa * 2))
        .attr('class', 'fabric sa')
        .close()
    }

    // Paperless?
    if (paperless) {
      macro('hd', {
        from: points.bottomFlipped,
        to: points.bottom,
        y: points.bottom.y + 15 + sa * 2,
      })
      macro('vd', {
        from: points.bottomFlipped,
        to: points.top,
        x: points.bottomFlipped.x - 15 - sa,
      })
      if (options.buttonhole) {
        macro('vd', {
          from: points.buttonhole,
          to: points.bottom,
          x: points.bottom.x + 15 + sa,
        })
      }
    }
  }
  return part
}
