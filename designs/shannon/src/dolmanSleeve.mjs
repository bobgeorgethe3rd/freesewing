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
    const dolmanSleeveReduction = store.get('sleeveLengthMin') * 0.5
    const sleeveCapDepth = points.sleeveTip.y
    const wrist = measurements.wrist * (1 + options.wristEase)
    //let's begin
    points.bottomAnchorMax = points.midAnchor.shift(
      -90,
      measurements.shoulderToWrist * (1 + options.sleeveLengthBonus) -
        dolmanSleeveReduction +
        sleeveCapDepth
    )
    points.elbowAnchor = points.midAnchor.shift(
      -90,
      measurements.shoulderToElbow * (1 + options.sleeveLengthBonus) -
        dolmanSleeveReduction +
        sleeveCapDepth
    )
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
      points.bottomLeftMax = points.bottomAnchorMax.shift(180, wrist / 2)
    } else {
      points.bottomLeftMax = new Point(points.dolmanLeft.x, points.bottomAnchorMax.y)
    }

    points.bottomAnchor = points.dolmanExAnchor.shiftFractionTowards(
      points.bottomAnchorMax,
      options.sleeveLength
    )
    points.bottomLeft = utils.beamIntersectsY(
      points.dolmanLeft,
      points.bottomLeftMax,
      points.bottomAnchor.y
    )
    points.dolmanLeftCp1 = points.dolmanLeft.shiftFractionTowards(
      utils.beamIntersectsY(points.bottomLeftMax, points.dolmanLeft, points.origin.y),
      2 / 3
    )

    points.dolmanRightCp2 = points.dolmanLeftCp1.flipX(points.midAnchor)
    points.bottomRight = points.bottomLeft.flipX(points.midAnchor)

    paths.saLeft = new Path()
      .move(points.sleeveCapLeft)
      ._curve(points.dolmanLeftCp1, points.dolmanLeft)
      .line(points.bottomLeft)
      .hide()

    paths.saRight = new Path()
      .move(points.bottomRight)
      .line(points.dolmanRight)
      .curve_(points.dolmanRightCp2, points.sleeveCapRight)
      .hide()

    paths.seam = paths.sleevecap
      .clone()
      .join(paths.saLeft)
      .line(points.bottomRight)
      .join(paths.saRight)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.midAnchor.x, points.sleeveTip.y)
      points.grainlineTo = points.bottomAnchor
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(
        points.sleeveCapLeft.x * 0.25,
        (points.sleeveTip.y + points.bottomAnchor.y) / 2
      )
      if (sa) {
        const armholeSa = sa * options.armholeSaWidth * 100

        paths.sa = paths.sleevecap.offset(armholeSa)
      }
    }

    return part
  },
}
