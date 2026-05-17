import { pluginBundle } from '@freesewing/plugin-bundle'

export const crown = {
  name: 'playtest.crown',
  plugins: [pluginBundle],
  options: {
    //Fit
    headEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    //Style
    crownLength: { pct: 55, min: 40, max: 60, menu: 'style' },
    //Construction
    crownSaWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  measurements: ['head'],
  draft: ({
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
    measurements,
    part,
    snippets,
    Snippet,
  }) => {
    //measures
    const headCircumference = measurements.head + 6.35 * options.headEase * 100
    const crownCircumference = headCircumference * (1 + (options.crownLength - 0.5) * 2) //+ (((options.crownLength - 0.5) * head) * 2)

    const width =
      crownCircumference < headCircumference
        ? (crownCircumference - (crownCircumference / 2 / Math.PI) * 4) / 2
        : (headCircumference - (headCircumference / 2 / Math.PI) * 4) / 2
    //let's begin
    points.topLeft = new Point(-width / 2, -crownCircumference / 4)
    points.topRight = points.topLeft.flipX()
    points.bottomRight = points.topRight.flipY()
    points.bottomLeft = points.topLeft.flipY()
    //paths
    paths.seam = new Path()
      .move(points.topLeft)
      .line(points.bottomLeft)
      .line(points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .close()

    //stores
    store.set(
      'headCircumference',
      crownCircumference < headCircumference ? crownCircumference : headCircumference
    )
    store.set('headRadius', headCircumference / 2 / Math.PI)
    store.set('crownCircumference', crownCircumference)
    store.set('crownWidth', width)

    if (complete) {
      //grainline
      points.grainlineFrom = points.topLeft.shiftFractionTowards(points.topRight, 0.25)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.midLeft = new Point(points.topLeft.x, 0)
      points.midRight = new Point(points.topRight.x, points.midLeft.y)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['midLeft', 'midRight'],
      })
      //title
      points.title = new Point(0, 0)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'crown',
        cutNr: 1,
        scale: 0.5,
      })
      if (sa) {
        const crownSa = sa * options.crownSaWidth * 100

        points.saTopLeft = points.topLeft.translate(-sa, -crownSa)
        points.saBottomLeft = points.bottomLeft.translate(-sa, crownSa)
        points.saBottomRight = points.bottomRight.translate(sa, crownSa)
        points.saTopRight = points.topRight.translate(sa, -crownSa)

        paths.sa = new Path()
          .move(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
