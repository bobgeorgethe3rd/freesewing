import { frontPocketBag } from './frontPocketBag.mjs'

export const frontPocketBagB = {
  name: 'theobald.frontPocketBagB',
  from: frontPocketBag,
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
  }) => {
    //set Render
    if (
      !options.frontPocketsBool ||
      options.frontPocketOpeningStyle != 'slanted' ||
      options.frontPocketStyle == 'pear'
    ) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Dalton
    const keepThese = ['grainline']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    for (let i in snippets) delete snippets[i]
    //measures
    const suffix = store.get('frontPleatSuffix')
    //let's begin
    //paths

    paths.saWaist = new Path()
      .move(points['frontPocketOgWaist' + suffix])
      .line(points['frontPocketOpeningWaist' + suffix])
      .line(points['frontPocketOpeningOut' + suffix])
      .hide()

    paths.saBottomLeft = new Path()
      .move(points['frontPocketOpeningOut' + suffix])
      .curve_(points['frontPocketCp1' + suffix], points['frontPocketBottomLeft' + suffix])
      .curve(
        points['frontPocketCp2' + suffix],
        points['frontPocketCp3' + suffix],
        points['frontPocketBottom' + suffix]
      )
      .hide()

    paths.saBottomRight = new Path()
      .move(points['frontPocketBottom' + suffix])
      .curve(
        points['frontPocketCp4' + suffix],
        points['frontPocketCp5' + suffix],
        points['frontPocketBottomRight' + suffix]
      )
      .hide()

    paths.saRight = new Path()
      .move(points['frontPocketBottomRight' + suffix])
      .line(points['frontPocketOgWaist' + suffix])
      .hide()

    paths.seam = paths.saBottomLeft
      .clone()
      .join(paths.saBottomRight)
      .join(paths.saRight)
      .join(paths.saWaist)
      .close()

    if (complete) {
      //notches
      snippets.frontPocketOpeningOut = new Snippet(
        'notch',
        points['frontPocketOpeningOut' + suffix]
      )
      //title
      macro('title', {
        nr: '7b',
        title: 'Front Pocket Bag B',
        at: points.title,
        scale: 0.5,
        rotation:
          90 - points['frontPocketBottom' + suffix].angle(points['frontPocketWaist' + suffix]),
      })

      if (sa) {
        paths.sa = paths.saBottomLeft
          .offset(sa * options.frontPocketBagSaWidth * 100)
          .curve(
            points['frontPocketCp4Sa' + suffix],
            points['frontPocketCp5Sa' + suffix],
            points['frontPocketBottomRightSa' + suffix]
          )
          .join(paths.saRight.offset(sa * options.crotchSeamSaWidth * 100))
          .join(paths.saWaist.offset(sa))
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
