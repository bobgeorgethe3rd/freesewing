import { sleevecap } from '@freesewing/basicsleeve'
import { back } from './back.mjs'

export const dolmanSleeve = {
  name: 'shannon.dolmanSleeve',
  after: back,
  options: {
    //Imported
    ...sleevecap.options,
  },
  draft: (sh) => {
    //draft
    const {
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
    } = sh
    sleevecap.draft(sh)
    //measurements
    const wrist = measurements.wrist * (1 + options.wristEase)
    //let's begin
    points.bottomAnchor = points.midAnchor.shift(-90, store.get('dolmanSleeveLength'))
    points.dolmanExAnchor = points.midAnchor.shift(
      -90,
      (store.get('dolmanFrontExDepth') + store.get('dolmanBackExDepth')) / 2
    )
    points.dolmanLeft = points.dolmanExAnchor.shift(
      180,
      (store.get('dolmanFrontExWidth') + store.get('dolmanBackExWidth')) / 2
    )
    points.dolmanRight = points.dolmanLeft.flipX(points.dolmanExAnchor)

    if (options.fitSleeveWidth) {
      points.bottomLeftMax = points.bottomAnchor.shift(180, wrist / 2)
    } else {
      points.bottomLeftMax = new Point(points.dolmanLeft.x, points.bottomAnchor.y)
    }
    points.bottomRightMax = points.bottomLeftMax.flipX(points.bottomAnchor)

    paths.scaffold = new Path()
      .move(points.dolmanLeft)
      .line(points.bottomLeftMax)
      .line(points.bottomRightMax)
      .line(points.dolmanRight)

    if (complete) {
      //title
      points.title = new Point(
        points.sleeveCapLeft.x * 0.25,
        (points.sleeveTip.y + points.dolmanExAnchor.y) / 2
      )
    }

    return part
  },
}
