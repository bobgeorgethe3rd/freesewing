import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const leatherPatch = {
  name: 'jackson.leatherPatch',
  options: {
    leatherPatch: { bool: true, menu: 'style' },
    leatherPatchWidth: { pct: 5.3, min: 5, max: 6, menu: 'style' },
    leatherPatchLength: { pct: 9.7, min: 8.5, max: 10, menu: 'style' },
    scaleLeatherPatch: { bool: true, menu: 'advanced' },
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
    let width
    let length
    if (options.scaleLeatherPatch) {
      length = measurements.waist * options.leatherPatchLength
      width = measurements.waistToFloor * options.leatherPatchWidth
    } else {
      length = 82
      width = 63
    }
    //let's begin
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.translate(length / -2, width / -2)
    points.bottomLeft = points.origin.translate(length / -2, width / 2)
    points.bottomRight = points.origin.translate(length / 2, width / 2)
    points.topRight = new Point(points.bottomRight.x, points.topLeft.y)

    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()
      .attr('data-text', 'No Seam Allowance Needed')
      .attr('data-text-class', 'text-sm')

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.9)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.topRight.rotate(-90, points.grainlineFrom),
        to: points.bottomRight.rotate(90, points.grainlineTo),
      })
      //title
      points.title = points.bottomLeft.translate(length * 0.06, width * -0.2)
      macro('title', {
        nr: 13,
        title: 'Leather Patch',
        at: points.title,
        scale: 0.2,
      })
      //logo
      macro('logorg', {
        at: points.origin,
        scale: 0.45,
      })
    }

    return part
  },
}
