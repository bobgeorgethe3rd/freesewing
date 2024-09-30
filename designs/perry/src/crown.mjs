import { pluginBundle } from '@freesewing/plugin-bundle'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const crown = {
  name: 'perry.crown',
  plugins: [pluginBundle, pluginLogoRG],
  options: {
    //Constants
    cpFraction: 0.55191502449,
    //Fit
    headEase: { pct: 3, min: 0, max: 20, menu: 'fit' },
    //Style
    crownWidth: { pct: 43, min: 40, max: 100, menu: 'style' },
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
    const headCircumference = store.get('headCircumference')
    const headRadius = headCircumference / 2 / Math.PI
    const crownRadius = headRadius * (1 + options.crownWidth)

    //let's begin
    points.origin = new Point(0, 0)

    points.bottomOuter = points.origin.shift(-90, crownRadius)
    points.rightOuter = points.origin.shift(0, crownRadius)
    points.outerCpAnchor = new Point(points.rightOuter.x, points.bottomOuter.y)

    points.bottomInner = points.origin.shift(-90, headRadius)
    points.rightInner = points.origin.shift(0, headRadius)
    points.innerCpAnchor = new Point(points.rightInner.x, points.bottomInner.y)

    points.bottomOuterCp2 = points.bottomOuter.shiftFractionTowards(
      points.outerCpAnchor,
      options.cpFraction
    )
    points.rightOuterCp1 = points.rightOuter.shiftFractionTowards(
      points.outerCpAnchor,
      options.cpFraction
    )

    points.bottomInnerCp1 = points.bottomInner.shiftFractionTowards(
      points.innerCpAnchor,
      options.cpFraction
    )
    points.rightInnerCp2 = points.rightInner.shiftFractionTowards(
      points.innerCpAnchor,
      options.cpFraction
    )

    points.topOuter = points.bottomOuter.flipY(points.origin)
    points.rightOuterCp2 = points.rightOuterCp1.flipY()
    points.topOuterCp1 = points.bottomOuterCp2.flipY()

    points.leftOuter = points.rightOuter.flipX()
    points.topOuterCp2 = points.topOuterCp1.flipX()
    points.leftOuterCp1 = points.rightOuterCp2.flipX()

    points.leftOuterCp2 = points.leftOuterCp1.flipY()
    points.bottomOuterCp1 = points.topOuterCp2.flipY()

    points.topInner = points.bottomInner.flipY(points.origin)
    points.rightInnerCp1 = points.rightInnerCp2.flipY()
    points.topInnerCp2 = points.bottomInnerCp1.flipY()

    points.leftInner = points.rightInner.flipX()
    points.topInnerCp1 = points.topInnerCp2.flipX()
    points.leftInnerCp2 = points.rightInnerCp1.flipX()

    points.leftInnerCp1 = points.leftInnerCp2.flipY()
    points.bottomInnerCp2 = points.topInnerCp1.flipY()

    //paths
    paths.seamOuter = new Path()
      .move(points.bottomOuter)
      .curve(points.bottomOuterCp2, points.rightOuterCp1, points.rightOuter)
      .curve(points.rightOuterCp2, points.topOuterCp1, points.topOuter)
      .curve(points.topOuterCp2, points.leftOuterCp1, points.leftOuter)
      .curve(points.leftOuterCp2, points.bottomOuterCp1, points.bottomOuter)
      .close()

    paths.seamInner = new Path()
      .move(points.bottomInner)
      .curve(points.bottomInnerCp2, points.leftInnerCp1, points.leftInner)
      .curve(points.leftInnerCp2, points.topInnerCp1, points.topInner)
      .curve(points.topInnerCp2, points.rightInnerCp1, points.rightInner)
      .curve(points.rightInnerCp2, points.bottomInnerCp1, points.bottomInner)
      .close()

    //stores
    store.set('headCircumference', headCircumference)
    store.set('headRadius', headRadius)

    if (complete) {
      //grainline
      points.grainlineFrom = points.origin
      points.grainlineTo = points.rightOuter
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bottomOuter', 'rightOuter', 'topOuter', 'leftOuter'],
      })
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['bottomInner', 'rightInner', 'topInner', 'leftInner'],
      })
      //title
      points.title = points.topInner
        .shiftFractionTowards(points.topInnerCp1, 1 / 3)
        .shift(90, points.topInner.dist(points.topOuter) * 0.45)
      macro('title', {
        at: points.title,
        nr: '1a & b',
        title: 'Crown (Top & Bottom)',
        cutNr: 2,
        scale: 0.25,
      })
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
      //scalebox
      points.scalebox = points.bottomInner.shiftFractionTowards(points.bottomOuter, 0.5)
      macro('miniscale', {
        at: points.scalebox,
      })

      //logo
      points.logo = points.leftInner.shiftFractionTowards(points.leftOuter, 0.5)
      macro('logorg', {
        at: points.logo,
        scale: 0.25,
      })
      if (sa) {
        paths.saOuter = paths.seamOuter.offset(sa).close().attr('class', 'fabric sa')
        paths.saInner = paths.seamInner.offset(sa).close().attr('class', 'fabric sa')
      }
    }
    return part
  },
}
