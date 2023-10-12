import { frontBase } from './frontBase.mjs'
import { pluginLogoRG } from '@freesewing/plugin-logorg'

export const sideFront = {
  name: 'sammie.sideFront',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  plugins: [pluginLogoRG],
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
    paths.seam = new Path()
      .move(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armholeDrop)
      .curve(points.armholeDropCp2, points.sideFrontTopLeftCp1, points.sideFrontTopLeft)
      .join(
        new Path()
          .move(points.bustDartBottom)
          .curve(points.bustDartCpBottom, points.bustDartCpMid, points.bust)
          .curve(points.waistDartMiddleCp, points.waistDartRightCp, points.waistDartRight)
          .split(points.sideFrontTopLeft)[1]
      )
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(
        points.bust.shiftFractionTowards(points.armholeDrop, 1 / 3).x,
        points.sideFrontTopLeftCp1.y
      )
      points.grainlineTo = new Point(points.grainlineFrom.x, points.waistDartRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.bust = new Snippet('notch', points.bust)
      //title
      points.title = new Point(
        points.bust.shiftFractionTowards(points.armholeDrop, 0.5).x,
        points.grainlineFrom.y + paths.grainline.length() * 0.375
      )
      macro('title', {
        nr: 2,
        title: 'Side Front',
        at: points.title,
        scale: 0.4,
      })
      //logo
      points.logo = new Point(
        points.bust.shiftFractionTowards(points.armholeDrop, 0.525).x,
        points.grainlineFrom.y + paths.grainline.length() * 0.6
      )
      macro('logorg', {
        at: points.logo,
        scale: 0.25,
      })
      //scalebox
      points.scalebox = new Point(
        points.bust.shiftFractionTowards(points.armholeDrop, 2 / 3).x,
        points.grainlineFrom.y + paths.grainline.length() * 0.9
      )
      macro('scalebox', {
        at: points.scalebox,
      })
      if (sa) {
        paths.sa = paths.seam.offset(sa).close().attr('class', 'fabric sa')
      }
    }
    return part
  },
}
