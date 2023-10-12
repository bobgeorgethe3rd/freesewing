import { frontBase } from './frontBase.mjs'
import { centreBack } from './centreBack.mjs'

export const centreFront = {
  name: 'sammie.centreFront',
  from: frontBase,
  after: centreBack,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Construction
    centreFrontSeam: { bool: false, menu: 'construction' },
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
  }) => {
    //remove paths & snippets
    let keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //let's begin
    //paths
    paths.saBase = new Path()
      .move(points.cfWaist)
      .line(points.waistDartLeft)
      .curve(points.waistDartLeftCp, points.waistDartMiddleCp, points.bust)
      .join(
        new Path()
          .move(points.bust)
          .curve(points.bustDartCpMid, points.bustDartCpTop, points.bustDartTop)
          .split(points.frontTopRight)[0]
      )
      .curve_(points.frontTopRightCp2, points.cfTop)
      .hide()

    paths.cf = new Path().move(points.cfTop).line(points.cfWaist).hide()

    paths.seam = paths.saBase.join(paths.cf).close()

    if (complete) {
      //grainline
      let cfSa
      if (options.closurePosition != 'front' && !options.centreFrontSeam) {
        cfSa = 0
        points.cutOnFoldFrom = points.cfTop
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        cfSa = sa

        points.grainlineTo = points.cfWaist.shiftFractionTowards(points.waistDartLeft, 0.25)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfTop.y)

        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      snippets.bust = new Snippet('notch', points.bust)
      //title
      points.title = new Point(
        points.cfWaist.shiftFractionTowards(points.waistDartLeft, 2 / 3).x,
        points.bust.y
      )
      macro('title', {
        nr: 1,
        title: 'Centre Front',
        at: points.title,
        scale: 0.4,
      })

      if (sa) {
        paths.sa = paths.saBase
          .offset(sa)
          .join(paths.cf.offset(cfSa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
