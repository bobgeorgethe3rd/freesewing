import { front } from './front.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const frontFacing = {
  name: 'camden.frontFacing',
  from: front,
  options: {
    //Construction
    facings: { bool: true, menu: 'construction' },
    facingWidth: { pct: 50, min: 10, max: 50, menu: 'construction' },
  },
  plugins: ['pluginLogoRG'],
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
    absoluteOptions,
    log,
  }) => {
    if (!options.facings) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Daisy
    const keepThese = 'top'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('logorg', false)
    macro('scalebox', false)
    //let's begin
    points.sideFacing = points.armholeDrop.shiftFractionTowards(
      points.bustDartTop,
      options.facingWidth
    )
    store.set('facingWidth', points.armholeDrop.dist(points.sideFacing))
    points.cfFacing = points.cfNeckNew.shiftTowards(points.cfHem, store.get('facingWidth'))
    points.cfFacingCp2 = new Point(points.strapRight.x, points.cfFacing.y)
    points.sideFacingCp1Target = utils.beamsIntersect(
      points.sideFacing,
      points.sideFacing.shift(points.armhole.angle(points.armholeCp2), 1),
      points.strapRight,
      points.strapRight.shift(-90, 1)
    )
    points.sideFacingCp1 = points.sideFacing.shiftFractionTowards(
      points.sideFacingCp1Target,
      options.frontArmholeCurvature
    )

    //paths
    paths.saBase = new Path()
      .move(points.cfFacing)
      .curve(points.cfFacingCp2, points.sideFacingCp1, points.sideFacing)
      .join(paths.top.split(points.sideFacing)[1])
      .hide()

    paths.seam = paths.saBase.clone().line(points.cfFacing).close().unhide()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfNeckNew
      points.cutOnFoldTo = points.cfFacing
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
      })
      //title
      points.title = new Point(points.armholePitchCp1New.x * (2 / 3), points.armholePitchCp1New.y)
      macro('title', {
        at: points.title,
        nr: 4,
        title: 'Front Facing',
        scale: 0.75,
      })

      if (sa) {
        paths.sa = paths.saBase
          .offset(sa)
          .line(points.cfNeckNew)
          .line(points.cfFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
