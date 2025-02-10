import { Snippet } from '@freesewing/core'
import { frontBase } from './frontBase.mjs'

export const flyShield = {
  name: 'frankie.flyShield',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Plackets
    flyShieldCurved: { bool: false, menu: 'plackets' },
  },
  draft: ({
    store,
    sa,
    points,
    Path,
    paths,
    options,
    snippets,
    Snippet,
    paperless,
    macro,
    utils,
    part,
  }) => {
    //let's begin
    points.flyShieldWaist = points.flyWaistSplit.shiftTowards(
      points.flyWaist,
      store.get('flyWidth')
    )
    points.flyShieldCorner = utils.beamsIntersect(
      points.flyShieldWaist,
      points.flyShieldWaist.shift(points.styleWaistIn.angle(points.crotchSeamCurveStart), 1),
      points.flyCrotchExSplit,
      points.flyCrotchExSplit.shift(points.styleWaistIn.angle(points.crotchSeamCurveStart) - 90, 1)
    )
    points.flyShieldCurveEnd = utils.beamsIntersect(
      points.flyWaistSplit,
      points.flyWaistSplit.shift(points.styleWaistIn.angle(points.crotchSeamCurveStart), 1),
      points.flyCrotchExSplit,
      points.flyShieldCorner
    )
    points.flyShieldCurveStart = points.flyShieldCurveEnd.rotate(90, points.flyShieldCorner)
    points.flyShieldCurveStartCp2 = points.flyShieldCurveStart.shiftFractionTowards(
      points.flyShieldCorner,
      options.cpFraction
    )
    points.flyShieldCurveEndCp1 = points.flyShieldCurveEnd.shiftFractionTowards(
      points.flyShieldCorner,
      options.cpFraction
    )

    //paths
    const drawSaBottom = () => {
      if (options.flyShieldCurved)
        return new Path().move(points.flyShieldCorner).line(points.flyCrotchExSplit)
      else
        return new Path()
          .move(points.flyShieldCurveStart)
          .curve(
            points.flyShieldCurveStartCp2,
            points.flyShieldCurveEndCp1,
            points.flyShieldCurveEnd
          )
          .line(points.flyCrotchExSplit)
    }

    paths.waist = new Path().move(points.flyWaistSplit).line(points.flyShieldWaist).hide()

    paths.seam = drawSaBottom()
      .join(paths.flyCrotchEx)
      .join(paths.waist)
      .line(drawSaBottom().start())
      .close()
      .setClass('fabric')

    if (sa) {
      paths.sa = drawSaBottom()
        .offset(sa)
        .join(paths.flyCrotchEx.offset(sa * options.crotchSeamSaWidth * 100))
        .join(paths.waist.offset(sa))
        .line(points.flyShieldWaist)
        .line(drawSaBottom().start())
        .close()
        .setClass('fabric sa')
    }
    //details
    //grainline
    points.cutOnFoldFrom = points.flyShieldWaist
    points.cutOnFoldTo = points.flyShieldCurveStart
    macro('cutonfold', {
      from: points.cutOnFoldFrom,
      to: points.cutOnFoldTo,
      grainline: true,
    })
    //notches
    snippets.flyCrotchExSplit = new Snippet('notch', points.flyCrotchExSplit)
    //cutlist
    store.cutlist.setCut({ cut: 1, from: 'fabric', onfold: 'true' })
    //title
    points.title = points.flyShieldCurveStart.shift(
      points.flyShieldWaist.angle(points.styleWaistIn),
      points.flyShieldWaist.dist(points.styleWaistIn) * 0.5
    )
    macro('title', {
      at: points.title,
      nr: 4,
      title: 'flyShield',
      rotation: 90 - points.flyShieldCurveStart.angle(points.flyShieldWaist),
      scale: 0.5,
    })
    //paperless
    if (paperless) {
      points.bottomLeftAnchor = paths.seam.edge('bottomLeft')
      points.topRightAnchor = paths.seam.edge('topRight')
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: drawSaBottom().edge('bottom'),
        y: drawSaBottom().edge('bottom').y,
        id: 'hdLeft0',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: drawSaBottom().start(),
        y: drawSaBottom().start().y,
        id: 'hdLeft1',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.flyShieldWaist,
        y: points.flyShieldWaist.y,
        id: 'hdLeft2',
      })
      if (points.flyWaistSplit.y < points.flyShieldWaist.y) {
        macro('hd', {
          from: points.bottomLeftAnchor,
          to: points.flyWaistSplit,
          y: points.flyWaistSplit.y,
          id: 'hdLeft3',
        })
        macro('vd', {
          from: points.flyShieldWaist,
          to: points.flyWaistSplit,
          x: points.bottomLeftAnchor.x,
          id: 'vdLeft2',
        })
      } else {
        macro('hd', {
          from: points.flyWaistSplit,
          to: points.topRightAnchor,
          y: points.flyWaistSplit.y,
          id: 'hdRight0',
        })
        macro('vd', {
          from: points.flyWaistSplit,
          to: points.flyShieldWaist,
          x: points.topRightAnchor.x,
          id: 'vdRight0',
        })
      }
      macro('hd', {
        from: points.flyCrotchExSplit,
        to: points.topRightAnchor,
        y: points.flyCrotchExSplit.y,
        id: 'hdRight1',
      })
      macro('hd', {
        from: drawSaBottom().edge('bottom'),
        to: points.topRightAnchor,
        y: drawSaBottom().edge('bottom').y,
        id: 'hdRight1',
      })
      macro('vd', {
        from: drawSaBottom().edge('bottom'),
        to: drawSaBottom().start(),
        x: points.bottomLeftAnchor.x,
        id: 'vdLeft0',
      })
      macro('vd', {
        from: drawSaBottom().start(),
        to: points.flyShieldWaist,
        x: points.bottomLeftAnchor.x,
        id: 'vdLeft1',
      })
      macro('vd', {
        from: points.flyCrotchExSplit,
        to: points.flyWaistSplit,
        x: points.topRightAnchor.x,
        id: 'vdRight1',
      })
      macro('vd', {
        from: drawSaBottom().edge('bottom'),
        to: points.flyCrotchExSplit,
        x: points.topRightAnchor.x,
        id: 'vdRight2',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        y: points.topRightAnchor.y - 15,
        id: 'hd0',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        y: points.bottomLeftAnchor.y + 15,
        id: 'hd1',
      })
      macro('vd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        x: points.bottomLeftAnchor.x - 15,
        id: 'vd0',
      })
      macro('vd', {
        from: points.bottomLeftAnchor,
        to: points.topRightAnchor,
        x: points.topRightAnchor.x + 15,
        id: 'vd1',
      })
    }

    return part
  },
}
