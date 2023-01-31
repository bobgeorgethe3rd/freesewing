import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'peach.front',
  from: frontBase,
  hideDependencies: true,
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
    //removing paths and snippets not required from Bella
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Bella
    macro('title', false)
    macro('scalebox', false)

    //seam paths

    const drawSaBase = () => {
      if (options.bustDartPlacement == 'armhole')
        return new Path()
          .move(points.cfWaist)
          .line(points.waistDartLeft)
          .curve_(points.waistDartLeftCp, points.bust)
          .curve_(points.bustDartCpTop, points.bustDartTop)
          .curve_(points.armholePitchCp2, points.shoulder)
          .line(points.hps)
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
      else
        return new Path()
          .move(points.cfWaist)
          .line(points.waistDartLeft)
          .curve(points.waistDartLeftCp, points.waistDartMiddleCp, points.bust)
          .curve(points.bustDartCpMiddle, points.bustDartCpTop, points.bustDartTop)
          .line(points.hps)
          .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
    }

    paths.seam = drawSaBase().line(points.cfWaist).close()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cfNeck
      points.cutOnFoldTo = points.cfWaist
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: true,
      })
      //notch
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfBust', 'bust'],
      })
      snippets.bustNotch = new Snippet('notch', points.bustNotch)
      //title
      points.title = new Point(points.cfNeckCp1.x / 2, points.bust.y / 2)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Centre Front',
      })

      if (sa) {
        paths.sa = drawSaBase()
          .offset(sa)
          .line(points.cfNeck)
          .line(points.cfWaist)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
