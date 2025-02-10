import { fly } from './fly.mjs'
import { frontBase } from './frontBase.mjs'

export const buttonholePlacket = {
  name: 'frankie.buttonholePlacket',
  from: frontBase,
  after: fly,
  hide: {
    from: true,
  },
  options: {
    //Plackets
    buttonholePlacketNum: { count: 3, min: 1, max: 5, menu: 'placket' },
  },
  draft: ({
    store,
    sa,
    points,
    Path,
    paths,
    options,
    complete,
    snippets,
    Snippet,
    paperless,
    macro,
    utils,
    part,
  }) => {
    //set render
    if (!options.buttonholePlacket) return part.hide()
    //paths
    paths.saBase = new Path()
      .move(points.styleWaistIn)
      .line(points.flyWaist)
      .line(points.flyCurveStart)
      .curve(points.flyCurveStartCp2, points.flyCurveEndCp1, points.flyCurveEnd)
      .hide()

    paths.seam = paths.saBase.clone().line(points.styleWaistIn).close().unhide()

    if (sa) {
      paths.sa = paths.saBase
        .offset(sa)
        .line(points.flyCurveEnd)
        .line(points.styleWaistIn)
        .close()
        .setClass('fabric sa')
    }

    //details
    //grainline
    points.cutOnFoldFrom = points.flyCurveEnd
    points.cutOnFoldTo = points.styleWaistIn
    macro('cutonfold', {
      from: points.cutOnFoldFrom,
      to: points.cutOnFoldTo,
      grainline: true,
    })
    //cutlist
    store.cutlist.setCut({ cut: 1, from: 'fabric', onfold: 'true' })
    //title
    points.title = points.flyCurveStart.shift(
      points.flyWaist.angle(points.styleWaistIn),
      points.flyWaist.dist(points.styleWaistIn) * 0.5
    )
    macro('title', {
      at: points.title,
      nr: 6,
      title: 'buttonholePlacket',
      rotation: 90 - points.flyCurveStart.angle(points.flyWaist),
      scale: 0.5,
    })
    //buttonholes
    if (complete) {
      points.buttonholeWaistAnchor = points.flyWaist.shiftFractionTowards(points.styleWaistIn, 0.5)
      points.buttonholeBottomAnchor = utils.beamsIntersect(
        points.buttonholeWaistAnchor,
        points.buttonholeWaistAnchor.shift(points.flyWaist.angle(points.flyCurveStart), 1),
        points.flyCurveStart,
        points.flyWaist.rotate(-90, points.flyCurveStart)
      )
      const buttonholeNum = options.buttonholePlacketNum * 2
      for (let i = 0; i < buttonholeNum; i++) {
        if (i % 2 <= 0) {
          points['buttonhole' + i] = points.buttonholeWaistAnchor.shiftFractionTowards(
            points.buttonholeBottomAnchor,
            (i + 1) / buttonholeNum
          )
          snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i])
            .attr('data-rotate', 180 - points.flyCurveStart.angle(points.flyWaist))
            .attr('data-scale', 2)
        }
      }
    }
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
        from: points.flyCurveEnd,
        to: points.topRightAnchor,
        y: points.flyCurveEnd.y,
        id: 'hdRight2',
      })
      macro('hd', {
        from: paths.saBase.edge('bottom'),
        to: points.topRightAnchor,
        y: paths.saBase.edge('bottom').y,
        id: 'hdRight2',
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
        from: points.flyCurveEnd,
        to: points.styleWaistIn,
        x: points.topRightAnchor.x,
        id: 'vdRight1',
      })
      macro('vd', {
        from: paths.saBase.edge('bottom'),
        to: points.flyCurveEnd,
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
