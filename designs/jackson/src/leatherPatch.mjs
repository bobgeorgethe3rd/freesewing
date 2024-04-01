import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const leatherPatch = {
  name: 'jackson.leatherPatch',
  options: {
    leatherPatch: { bool: true, menu: 'style' },
    leatherPatchWidth: { pct: 10.4, min: 10, max: 12, menu: 'style' },
    leatherPatchLength: { pct: 5.9, min: 5, max: 7, menu: 'style' },
  },
  plugins: [pluginLogoRG],
  draft: ({
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
    part,
    snippets,
    log,
    absoluteOptions,
  }) => {
    //set render
    if (!options.leatherPatch) {
      part.hide()
      return part
    }
    //measures
    const width = measurements.waist * options.leatherPatchWidth
    const length = measurements.waistToFloor * options.leatherPatchLength

    //let's begin
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.translate(width / -2, length / -2)
    points.bottomLeft = points.origin.translate(width / -2, length / 2)
    points.bottomRight = points.origin.translate(width / 2, length / 2)
    points.topRight = new Point(points.bottomRight.x, points.topLeft.y)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.9)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.topRight.rotate(-90, points.grainlineFrom),
        to: points.bottomRight.rotate(90, points.grainlineTo),
      })
      //title
      points.title = points.bottomLeft.translate(width * 0.06, length * -0.2)
      macro('title', {
        nr: 13,
        title: 'Leather Patch',
        at: points.title,
        scale: 0.2,
      })
      //logo
      let logoScale = length / 150
      if (width < length) {
        logoScale = width / 150
      }
      macro('logorg', {
        at: points.origin,
        scale: logoScale,
      })
      //paths
      paths.seam.attr('data-text', 'No Seam Allowance Needed').attr('data-text-class', 'text-sm')
    }

    return part
  },
}
