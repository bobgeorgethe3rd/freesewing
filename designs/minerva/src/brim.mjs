import { pctBasedOn } from '@freesewing/core'
import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { brimBase } from '@freesewing/mildred'
import { crown } from './crown.mjs'

export const brim = {
  name: 'minerva.brim',
  after: crown,
  plugins: [pluginLogoRG],
  options: {
    //Imported
    ...brimBase.options,
    //Style
    brimWidth: { pct: 6.2, min: 5, max: 50, snap: 6.35, ...pctBasedOn('head'), menu: 'style' },
    //Advanced
    brimWidthOffset: { pct: 2.25, min: 1.25, max: 4.5, menu: 'advanced' },
  },
  draft: (sh) => {
    const {
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
      absoluteOptions,
      log,
    } = sh
    //draft brimBase
    brimBase.draft(sh)
    //measures
    const brimWidth = absoluteOptions.brimWidth
    const brimWidthOffset = brimWidth * (options.brimWidthOffset * 100)
    //let's begin
    //scaffold
    points.bottomOuter = points.bottomInner.shift(-90, brimWidth)
    points.rightOuter = points.rightInner.shift(0, brimWidthOffset)
    points.topOuter = points.bottomOuter.flipY()
    points.leftOuter = points.rightOuter.flipX()

    //intersection
    points.bottomOuterOffset = points.bottomInner.shift(-90, brimWidthOffset)
    points.bottomOuterOffsetCp2 = points.bottomOuterOffset
      .shiftFractionTowards(points.origin, options.cpFraction)
      .rotate(-90, points.bottomOuterOffset)
    points.rightOuterCp1Offset = points.rightOuter
      .shiftFractionTowards(points.origin, options.cpFraction)
      .rotate(90, points.rightOuter)

    //uncomment to check curve
    // paths.curve = new Path()
    // .move(points.bottomOuterOffset)
    // .curve(points.bottomOuterOffsetCp2, points.rightOuterCp1Offset, points.rightOuter)

    points.bottomRightOuter = utils.curveIntersectsY(
      points.bottomOuterOffset,
      points.bottomOuterOffsetCp2,
      points.rightOuterCp1Offset,
      points.rightOuter,
      points.bottomOuter.y
    )

    points.topRightOuter = points.bottomRightOuter.flipY()
    points.topLeftOuter = points.topRightOuter.flipX()
    points.bottomLeftOuter = points.topLeftOuter.flipY()
    //control points
    const brimCpDistance =
      (4 / 3) *
      points.origin.dist(points.rightOuter) *
      Math.tan(utils.deg2rad((360 - points.origin.angle(points.bottomRightOuter)) / 4))

    points.bottomOuterCp2 = points.bottomOuter.shiftFractionTowards(points.bottomRightOuter, 1 / 3)

    points.bottomRightOuterCp1 = utils.beamIntersectsX(
      points.bottomRightOuter,
      points.origin.rotate(90, points.bottomRightOuter),
      points.bottomRightOuter.x * (2 / 3)
    )

    points.bottomRightOuterCp2 = points.bottomRightOuter
      .shiftTowards(points.origin, brimCpDistance)
      .rotate(-90, points.bottomRightOuter)
    points.rightOuterCp1 = points.rightOuter
      .shiftTowards(points.origin, brimCpDistance)
      .rotate(90, points.rightOuter)

    points.rightOuterCp2 = points.rightOuterCp1.flipY()
    points.topRightOuterCp1 = points.bottomRightOuterCp2.flipY()
    points.topRightOuterCp2 = points.bottomRightOuterCp1.flipY()
    points.topOuterCp1 = points.bottomOuterCp2.flipY()

    points.topOuterCp2 = points.topOuterCp1.flipX()
    points.topLeftOuterCp1 = points.topRightOuterCp2.flipX()
    points.topLeftOuterCp2 = points.topRightOuterCp1.flipX()
    points.leftOuterCp1 = points.rightOuterCp2.flipX()

    points.leftOuterCp2 = points.rightOuterCp1.flipX()
    points.bottomLeftOuterCp1 = points.bottomRightOuterCp2.flipX()
    points.bottomLeftOuterCp2 = points.bottomRightOuterCp1.flipX()
    points.bottomOuterCp1 = points.bottomOuterCp2.flipX()

    //paths
    paths.seamOuter = new Path()
      .move(points.bottomOuter)
      .curve(points.bottomOuterCp2, points.bottomRightOuterCp1, points.bottomRightOuter)
      .curve(points.bottomRightOuterCp2, points.rightOuterCp1, points.rightOuter)
      .curve(points.rightOuterCp2, points.topRightOuterCp1, points.topRightOuter)
      .curve(points.topRightOuterCp2, points.topOuterCp1, points.topOuter)
      .curve(points.topOuterCp2, points.topLeftOuterCp1, points.topLeftOuter)
      .curve(points.topLeftOuterCp2, points.leftOuterCp1, points.leftOuter)
      .curve(points.leftOuterCp2, points.bottomLeftOuterCp1, points.bottomLeftOuter)
      .curve(points.bottomLeftOuterCp2, points.bottomOuterCp1, points.bottomOuter)
      .close()

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
      //title
      points.title = points.topInner
        .shiftFractionTowards(points.topInnerCp1, 1 / 6)
        .shift(90, points.topInner.dist(points.topOuter) * 0.45)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Brim (Bubbled)',
        cutNr: 2,
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
      }
    }

    return part
  },
}
