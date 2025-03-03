import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'

export const placketFacing = {
  name: 'fauna.placketFacing',
  from: frontBase,
  after: front,
  hide: {
    from: true,
    inherited: true,
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
    absoluteOptions,
    snippets,
    Snippet,
  }) => {
    //set render
    if (options.inbuiltPlacketFacing) {
      part.hide()
      return part
    }
    //delete inherited paths
    const keepThese = ['mHemBase', 'mCfNeck', 'facingCurve']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //paths
    paths.hemBase = paths.mHemBase.reverse().split(points.mFacingBottom)[1]
    paths.cfNeck = paths.mCfNeck.reverse()

    paths.seam = paths.hemBase
      .clone()
      .line(points.placketTopLeft)
      .join(paths.cfNeck)
      .line(points.facingShoulder)
      .join(paths.facingCurve)
      .close()

    if (complete) {
      //grainline
      points.grainlineTo = points.mFacingBottom.shiftFractionTowards(points.placketBottomLeft, 0.25)
      points.grainlineFrom = new Point(points.grainlineTo.x, points.cfNeck.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.placketNotch = new Snippet('notch', points.placketNotch)
      //title
      points.title = new Point(
        points.mFacingBottom.shiftFractionTowards(points.placketBottomLeft, 0.5).x,
        points.placketBottomLeft.y / 2
      )
      macro('title', {
        at: points.title,
        nr: '7',
        title: 'Placket Facing',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        const placketFacingSa = sa * options.placketFacingSaWidth * 100
        const hemSa = sa * options.hemWidth * 100

        points.saMFacingBottom = utils.beamIntersectsX(
          paths.hemBase.offset(hemSa).start(),
          paths.hemBase.offset(hemSa).shiftFractionAlong(0.005),
          points.mFacingBottom.x - placketFacingSa
        )

        if (points.saMFacingBottom.x > paths.hemBase.offset(hemSa).start().x) {
          points.saMFacingBottom = paths.hemBase.offset(hemSa).start()
        }
        if (points.saMFacingBottom.y < paths.facingCurve.offset(placketFacingSa).end().y) {
          points.saMFacingBottom = paths.facingCurve.offset(placketFacingSa).end()
        }

        points.saPlacketBottomLeft = points.placketBottomLeft.translate(sa, hemSa)
        points.saPlacketTopLeft = new Point(points.saPlacketBottomLeft.x, points.saCfNeck.y)
        points.saFacingShoulder = utils.beamIntersectsX(
          points.mSaHps,
          points.mSaHps.shift(points.mHps.angle(points.facingShoulder), 1),
          points.facingShoulder.x - placketFacingSa
        )

        if (points.saFacingShoulder.y > paths.facingCurve.offset(placketFacingSa).start().y) {
          points.saFacingShoulder = points.facingShoulder.shift(
            points.facingShoulder.angle(points.mHps) + 90,
            sa * options.shoulderSaWidth * 100
          )
        }

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saPlacketBottomLeft)
          .line(points.saPlacketTopLeft)
          .join(paths.cfNeck.offset(sa * options.neckSaWidth * 100))
          .line(points.mSaHps)
          .line(points.saFacingShoulder)
          .join(paths.facingCurve.offset(placketFacingSa))
          .line(points.saMFacingBottom)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
