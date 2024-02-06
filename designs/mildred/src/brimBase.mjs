import { crown } from './crown.mjs'

export const brimBase = {
  name: 'mildred.brimBase',
  after: crown,
  options: {
    //Constants
    cpFraction: 0.55191502449,
  },
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
    Snippet,
    log,
  }) => {
    //measures
    void store.setIfUnset(
      'headCircumference',
      measurements.head + 635 * options.headEase,
      log.info('Head Ease has been set at ' + utils.units(635 * options.headEase))
    )
    void store.setIfUnset('headRadius', store.get('headCircumference') / 2 / Math.PI)
    const headRadius = store.get('headRadius')

    //let's begin
    points.origin = new Point(0, 0)

    points.bottomInner = points.origin.shift(-90, headRadius)
    points.rightInner = points.origin.shift(0, headRadius)
    points.innerCpAnchor = new Point(points.rightInner.x, points.bottomInner.y)

    points.bottomInnerCp1 = points.bottomInner.shiftFractionTowards(
      points.innerCpAnchor,
      options.cpFraction
    )
    points.rightInnerCp2 = points.rightInner.shiftFractionTowards(
      points.innerCpAnchor,
      options.cpFraction
    )

    points.topInner = points.bottomInner.flipY(points.origin)
    points.rightInnerCp1 = points.rightInnerCp2.flipY()
    points.topInnerCp2 = points.bottomInnerCp1.flipY()

    points.leftInner = points.rightInner.flipX()
    points.topInnerCp1 = points.topInnerCp2.flipX()
    points.leftInnerCp2 = points.rightInnerCp1.flipX()

    points.leftInnerCp1 = points.leftInnerCp2.flipY()
    points.bottomInnerCp2 = points.topInnerCp1.flipY()

    //paths
    paths.seamInner = new Path()
      .move(points.bottomInner)
      .curve(points.bottomInnerCp2, points.leftInnerCp1, points.leftInner)
      .curve(points.leftInnerCp2, points.topInnerCp1, points.topInner)
      .curve(points.topInnerCp2, points.rightInnerCp1, points.rightInner)
      .curve(points.rightInnerCp2, points.bottomInnerCp1, points.bottomInner)
      .close()

    if (complete) {
      //notches
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['bottomInner', 'rightInner', 'topInner', 'leftInner'],
      })
      //title
      points.cutOutTitle = points.topInner
        .shiftFractionTowards(points.topInnerCp1, 1 / 3)
        .shift(-90, points.topInner.dist(points.origin) * 0.55)
      macro('title', {
        at: points.cutOutTitle,
        nr: 'Cut-out',
        title: 'Crown (Cut-out) KEEP ME!!!',
        prefix: 'cut-out',
        scale: 0.25,
      })
      if (sa) {
        paths.saInner = paths.seamInner
          .offset(sa * options.crownHemWidth * 100)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
