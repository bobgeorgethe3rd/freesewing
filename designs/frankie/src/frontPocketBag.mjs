import { frontBase } from './frontBase.mjs'

export const frontPocketBag = {
  name: 'frankie.frontPocketBag',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Pockets
    frontPocketWidth: { pct: 60, min: 30, max: 70, menu: 'pockets.frontPockets' },
    frontPocketDepth: { pct: 15, min: 10, max: 20, menu: 'pockets.frontPockets' },
    //Construction
    frontPocketBagSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
  },
  draft: ({ store, sa, Point, points, Path, paths, options, paperless, macro, utils, part }) => {
    //set render
    if (!options.frontPocketsBool) return part.hide()
    //let's begin
    points.frontPocketOutDepth = paths.outSeam.shiftAlong(
      store.get('frontPocketOpeningDepth') * 2 + store.get('frontPocketOpeningLength')
    )
    points.frontPocketWaist = points.styleWaistOut.shiftFractionTowards(
      points.styleWaistIn,
      options.frontPocketWidth
    )
    points.frontPocketCurveEnd = utils.beamsIntersect(
      points.frontPocketOutDepth,
      points.frontPocketOutDepth.shift(points.styleWaistOut.angle(points.styleWaistIn), 1),
      points.frontPocketWaist,
      points.frontPocketWaist.shift(points.styleWaistOut.angle(points.styleWaistIn) - 80, 1)
    )
    points.frontPocketBottom = points.frontPocketOutDepth
      .shiftFractionTowards(points.frontPocketCurveEnd, 0.55)
      .shift(
        points.styleWaistOut.angle(points.styleWaistIn) - 90,
        paths.outSeam.length() * options.frontPocketDepth
      )
    points.frontPocketOutDepthCp2 = points.frontPocketOutDepth.shiftFractionTowards(
      points.frontPocketCurveEnd,
      0.25
    )
    points.frontPocketBottomCp1 = points.frontPocketBottom.shift(
      points.styleWaistIn.angle(points.styleWaistOut),
      points.frontPocketOutDepth.dist(points.frontPocketCurveEnd) * 0.5
    )
    points.frontPocketBottomCpTarget = utils.beamsIntersect(
      points.frontPocketBottom,
      points.frontPocketBottom.shift(points.styleWaistOut.angle(points.styleWaistIn), 1),
      points.frontPocketWaist,
      points.frontPocketCurveEnd
    )
    points.frontPocketBottomCp2 = points.frontPocketBottom.shiftFractionTowards(
      points.frontPocketBottomCpTarget,
      2 / 3
    )
    points.frontPocketCurveEndCp1 = points.frontPocketCurveEnd.shiftFractionTowards(
      points.frontPocketBottomCpTarget,
      2 / 3
    )
    //paths
    paths.saBottom = new Path()
      .move(points.frontPocketOutDepth)
      .curve(points.frontPocketOutDepthCp2, points.frontPocketBottomCp1, points.frontPocketBottom)
      .curve(points.frontPocketBottomCp2, points.frontPocketCurveEndCp1, points.frontPocketCurveEnd)
      .line(points.frontPocketWaist)
      .hide()

    paths.waist = new Path().move(points.frontPocketWaist).line(points.styleWaistOut).hide()

    paths.outSeam = paths.outSeam.split(points.frontPocketOutDepth)[0].hide()

    paths.seam = paths.saBottom
      .clone()
      .join(paths.waist)
      .join(paths.outSeam)
      .close()
      .setClass('fabric')

    if (sa) {
      paths.sa = paths.saBottom
        .offset(sa * options.frontPocketBagSaWidth * 100)
        .join(paths.waist.offset(sa))
        .join(paths.outSeam.offset(sa * options.sideSeamSaWidth * 100))
        .close()
        .setClass('fabric sa')
    }

    //details
    //grainline
    points.grainlineFrom = points.styleWaistOut.shiftFractionTowards(points.frontPocketWaist, 0.75)
    points.grainlineTo = new Point(points.grainlineFrom.x, points.frontPocketBottom.y)
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
      grainline: true,
    })
    //notches
    macro('sprinkle', {
      snippet: 'notch',
      on: ['frontPocketOpeningTop', 'frontPocketOpeningBottom'],
    })
    //cutlist
    store.cutlist.setCut({ cut: 4, from: 'fabric', identical: 'true' })
    //title
    points.title = points.frontPocketOutDepth.shiftFractionTowards(points.frontPocketCurveEnd, 0.25)
    macro('title', {
      at: points.title,
      nr: 6,
      title: 'frontPocketBag',
      scale: 0.5,
    })
    //paperless
    //paperless
    if (paperless) {
      points.bottomLeftAnchor = paths.seam.edge('bottomLeft')
      points.topRightAnchor = paths.seam.edge('topRight')
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: paths.saBottom.edge('bottom'),
        y: paths.saBottom.edge('bottom').y,
        id: 'hdOut0',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.frontPocketOutDepth,
        y: points.frontPocketOutDepth.y,
        id: 'hdOut1',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.styleWaistOut,
        y: points.styleWaistOut.y,
        id: 'hdOut2',
      })
      if (points.frontPocketWaist.y < points.styleWaistOut.y) {
        macro('hd', {
          from: points.bottomLeftAnchor,
          to: points.frontPocketWaist,
          y: points.frontPocketWaist.y,
          id: 'hdOut3',
        })
        macro('vd', {
          from: points.styleWaistOut,
          to: points.frontPocketWaist,
          x: points.bottomLeftAnchor.x,
          id: 'vdOut2',
        })
      } else {
        macro('hd', {
          from: points.styleWaistOut,
          to: points.topRightAnchor,
          y: points.styleWaistOut.y,
          id: 'hdIn0',
        })
        macro('vd', {
          from: points.frontPocketWaist,
          to: points.styleWaistOut,
          x: points.topRightAnchor.x,
          id: 'vdIn0',
        })
      }
      macro('hd', {
        from: points.frontPocketWaist,
        to: points.topRightAnchor,
        y: points.frontPocketWaist.y,
        id: 'hdIn1',
      })
      macro('hd', {
        from: points.frontPocketCurveEnd,
        to: points.topRightAnchor,
        y: points.frontPocketCurveEnd.y,
        id: 'hdIn2',
      })
      macro('hd', {
        from: paths.saBottom.edge('bottom'),
        to: points.topRightAnchor,
        y: paths.saBottom.edge('bottom').y,
        id: 'hdIn3',
      })
      macro('vd', {
        from: paths.saBottom.edge('bottom'),
        to: points.frontPocketOutDepth,
        x: points.bottomLeftAnchor.x,
        id: 'vdOut0',
      })
      macro('vd', {
        from: points.frontPocketOutDepth,
        to: points.styleWaistOut,
        x: points.bottomLeftAnchor.x,
        id: 'vdOut1',
      })
      macro('vd', {
        from: points.frontPocketCurveEnd,
        to: points.frontPocketWaist,
        x: points.topRightAnchor.x,
        id: 'vdIn1',
      })
      macro('vd', {
        from: paths.saBottom.edge('right'),
        to: points.frontPocketCurveEnd,
        x: points.topRightAnchor.x,
        id: 'vdIn2',
      })
      macro('vd', {
        from: paths.saBottom.edge('bottom'),
        to: paths.saBottom.edge('right'),
        x: points.topRightAnchor.x,
        id: 'vdIn3',
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
