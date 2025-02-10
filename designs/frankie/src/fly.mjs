import { frontBase } from './frontBase.mjs'

export const fly = {
  name: 'frankie.fly',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Plackets
    buttonholePlacket: { bool: false, menu: 'plackets' },
  },
  draft: ({ store, sa, points, Path, paths, options, paperless, macro, utils, part }) => {
    //paths
    paths.saBase = new Path()
      .move(points.styleWaistIn)
      .line(points.flyWaist)
      .line(points.flyCurveStart)
      .curve(points.flyCurveStartCp2, points.flyCurveEndCp1, points.flyCurveEnd)
      .line(points.flyCrotch)
      .hide()

    paths.crotchSeam = paths.crotchSeam.split(points.flyCrotch)[1].hide()

    paths.seam = paths.saBase.join(paths.crotchSeam).close().setClass('fabric')

    if (sa) {
      paths.sa = paths.saBase
        .offset(sa)
        .join(paths.crotchSeam.offset(sa * options.crotchSeamSaWidth * 100))
        .close()
        .setClass('fabric sa')
    }

    //details
    //grainline
    points.grainlineFrom = points.flyWaist.shiftFractionTowards(points.styleWaistIn, 0.15)
    points.grainlineTo = utils.beamsIntersect(
      points.grainlineFrom,
      points.grainlineFrom.shift(points.flyWaist.angle(points.flyCurveStart), 1),
      points.flyCurveStart,
      points.flyCpTarget.rotate(90, points.flyCurveStart)
    )
    macro('grainline', {
      from: points.grainlineFrom,
      to: points.grainlineTo,
      grainline: true,
    })
    //cutlist
    store.cutlist.setCut({ cut: 2, from: 'fabric', identical: 'true' })
    if (options.buttonholePlacket)
      store.cutlist.setCut({ cut: 1, from: 'fabric', identical: 'true' })
    //title
    points.title = points.flyWaist
      .shiftFractionTowards(points.styleWaistIn, 0.5)
      .shift(
        points.flyWaist.angle(points.flyCurveStart),
        points.flyWaist.dist(points.flyCurveStart) * 0.5
      )
    macro('title', {
      at: points.title,
      nr: 3,
      title: 'fly',
      rotation: 90 - points.flyCurveStart.angle(points.flyWaist),
      scale: 0.5,
    })
    //paperless
    if (paperless) {
      points.bottomLeftAnchor = paths.seam.edge('bottomLeft')
      points.topRightAnchor = paths.seam.edge('topRight')
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: paths.saBase.edge('bottom'),
        y: paths.saBase.edge('bottom').y,
        id: 'hdLeft0',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.flyCurveStart,
        y: points.flyCurveStart.y,
        id: 'hdLeft1',
      })
      macro('hd', {
        from: points.bottomLeftAnchor,
        to: points.flyWaist,
        y: points.flyWaist.y,
        id: 'hdLeft2',
      })
      if (points.styleWaistIn.y < points.flyWaist.y) {
        macro('hd', {
          from: points.bottomLeftAnchor,
          to: points.styleWaistIn,
          y: points.styleWaistIn.y,
          id: 'hdLeft3',
        })
        macro('vd', {
          from: points.flyWaist,
          to: points.styleWaistIn,
          x: points.bottomLeftAnchor.x,
          id: 'vdLeft2',
        })
      } else {
        macro('hd', {
          from: points.flyWaist,
          to: points.topRightAnchor,
          y: points.flyWaist.y,
          id: 'hdRight0',
        })
        macro('vd', {
          from: points.styleWaistIn,
          to: points.flyWaist,
          x: points.topRightAnchor.x,
          id: 'vdRight0',
        })
      }
      macro('hd', {
        from: points.styleWaistIn,
        to: points.topRightAnchor,
        y: points.styleWaistIn.y,
        id: 'hdRight1',
      })
      macro('hd', {
        from: points.crotchSeamCurveStart,
        to: points.topRightAnchor,
        y: points.crotchSeamCurveStart.y,
        id: 'hdRight2',
      })
      macro('hd', {
        from: points.flyCrotch,
        to: points.topRightAnchor,
        y: points.flyCrotch.y,
        id: 'hdRight3',
      })
      macro('hd', {
        from: paths.saBase.edge('bottom'),
        to: points.topRightAnchor,
        y: paths.saBase.edge('bottom').y,
        id: 'hdRight4',
      })
      macro('vd', {
        from: paths.saBase.edge('bottom'),
        to: points.flyCurveStart,
        x: points.bottomLeftAnchor.x,
        id: 'vdLeft0',
      })
      macro('vd', {
        from: points.flyCurveStart,
        to: points.flyWaist,
        x: points.bottomLeftAnchor.x,
        id: 'vdLeft1',
      })
      macro('vd', {
        from: points.crotchSeamCurveStart,
        to: points.styleWaistIn,
        x: points.topRightAnchor.x,
        id: 'vdRight1',
      })
      macro('vd', {
        from: points.flyCrotch,
        to: points.crotchSeamCurveStart,
        x: points.topRightAnchor.x,
        id: 'vdRight12',
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
