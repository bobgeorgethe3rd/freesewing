import { pluginBundle } from '@freesewing/plugin-bundle'

export const crownTop = {
  name: 'playtest.crownTop',
  plugins: [pluginBundle],
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Fit
    headEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    //Style
    crownLength: { pct: 55, min: 40, max: 60, menu: 'style' },
    crownTopWidth: { pct: 50, min: 25, max: 75, menu: 'style' },
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
    const crownTopRadius = crownCircumference * 0.25 * options.crownTopWidth
    //let's begin
    points.origin = new Point(0, 0)
    points.right = points.origin.shift(0, crownTopRadius)
    points.top = points.right.rotate(90, points.origin)
    points.rightCp2 = points.right.shift(90, crownTopRadius * options.cpFraction)
    points.topCp1 = points.top.shift(0, crownTopRadius * options.cpFraction)
    points.topCp2 = points.topCp1.flipX()
    points.leftCp1 = points.rightCp2.flipX()
    points.left = points.right.flipX()
    points.leftCp2 = points.leftCp1.flipY()
    points.bottomCp1 = points.topCp2.flipY()
    points.bottom = points.top.flipY()
    points.bottomCp2 = points.bottomCp1.flipX()
    points.rightCp1 = points.leftCp2.flipX()

    paths.seam = new Path()
      .move(points.right)
      .curve(points.rightCp2, points.topCp1, points.top)
      .curve(points.topCp2, points.leftCp1, points.left)
      .curve(points.leftCp2, points.bottomCp1, points.bottom)
      .curve(points.bottomCp2, points.rightCp1, points.right)
      .close()

    //stores
    store.set(
      'headCircumference',
      crownCircumference < headCircumference ? crownCircumference : headCircumference
    )
    store.set('crownCircumference', crownCircumference)
    store.set('crownTopCircumference', crownTopRadius * 2 * Math.PI)
    store.set('crownTopRadius', crownTopRadius)

    return part
  },
}
