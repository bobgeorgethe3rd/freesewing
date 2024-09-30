import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { sleevecap } from '@freesewing/basicsleeve'

export const sleeve = {
  name: 'dolmansleeve.sleeve',
  options: {
    //Imported
    ...sleevecap.options,
    //Constants
    armholeSaWidth: 0.01,
    sideSeamSaWidth: 0.01,
    //Fit
    wristEase: { pct: 18, min: 0, max: 50, menu: 'fit' },
    //Sleeve
    fitSleeveWidth: { bool: true, menu: 'sleeves' },
    sleeveLength: { pct: 100, min: 0, max: 100, menu: 'sleeves' },
    sleeveLengthBonus: { pct: 0, min: -20, max: 20, menu: 'sleeves' },
    sleeveBands: { bool: false, menu: 'sleeves' },
    sleeveBandWidth: {
      pct: 9.5,
      min: 1,
      max: 17,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    },
    sleeveFlounces: { dflt: 'none', list: ['flounce', 'ruffle', 'none'], menu: 'sleeves' },
    //Construction
    armholeSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sleeveHemWidth: { pct: 2, min: 1, max: 3, menu: 'construction' },
  },
  plugins: [pluginBundle],
  measurements: ['shoulderToElbow', 'shoulderToWrist', 'wrist'],
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
    //void stores
    if (options.useVoidStores) {
      void store.setIfUnset('sleeveLengthMin', 71)
      void store.setIfUnset('dolmanFrontExDepth', 22.5)
      void store.setIfUnset('dolmanBackExDepth', 22.5)
      void store.setIfUnset(
        'dolmanFrontExWidth',
        points.midAnchor.dist(points.sleeveCapLeft) * 0.978
      )
      void store.setIfUnset(
        'dolmanBackExWidth',
        points.midAnchor.dist(points.sleeveCapRight) * 0.978
      )
    }
    //render
    paths.sleevecap.hide()
    //measurements
    let sleeveBandWidth
    if (options.sleeveBands) {
      sleeveBandWidth = absoluteOptions.sleeveBandWidth
    } else sleeveBandWidth = 0

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

    if (options.sleeveLength < 0.5) {
      points.bottomAnchor = points.dolmanExAnchor.shiftFractionTowards(
        points.elbowAnchor,
        2 * options.sleeveLength
      )
    } else {
      points.bottomAnchor = points.elbowAnchor.shiftFractionTowards(
        points.bottomAnchorMax,
        2 * options.sleeveLength - 1
      )
    }

    points.bottomAnchor = points.bottomAnchor.shift(90, sleeveBandWidth)
    if (points.bottomAnchor.y < points.dolmanExAnchor.y) {
      points.bottomAnchor = points.dolmanExAnchor
    }

    const sleeveLength = points.dolmanExAnchor.dist(points.bottomAnchor)

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
      .hide()

    paths.saRight = new Path()
      .move(points.dolmanRight)
      .curve_(points.dolmanRightCp2, points.sleeveCapRight)
      .hide()

    if (sleeveLength > 0) {
      paths.saLeft = paths.saLeft.line(points.bottomLeft).hide()
      paths.saRight = new Path()
        .move(points.bottomRight)
        .line(points.dolmanRight)
        .join(paths.saRight)
        .hide()
    }

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
        (points.sleeveCapLeft.x * 1) / 3,
        (points.sleeveTip.y + points.bottomAnchor.y) / 2
      )
      macro('title', {
        at: points.title,
        nr: 1,
        title: 'Dolman Sleeve',
        cutNr: 2,
        scale: 0.5,
      })
      if (sa) {
        let hemSa
        if (options.sleeveBands || options.sleeveFlounces != 'none') hemSa = sa
        else hemSa = sa * options.sleeveHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100

        points.saSleeveCapLeft = paths.sleevecap.offset(armholeSa).end().shift(180, sideSeamSa)

        points.saTopLeft = utils.beamIntersectsX(
          points.sleeveCapLeft
            .shiftTowards(points.dolmanLeftCp1, sideSeamSa)
            .rotate(-90, points.sleeveCapLeft),
          points.dolmanLeftCp1
            .shiftTowards(points.sleeveCapLeft, sideSeamSa)
            .rotate(90, points.dolmanLeftCp1),
          points.saSleeveCapLeft.x
        )

        points.saBottomLeft = paths.saLeft.offset(sideSeamSa).end()
        points.saSleeveCapRight = points.saSleeveCapLeft.flipX(points.midAnchor)
        points.saTopRight = points.saTopLeft.flipX(points.midAnchor)
        points.saBottomRight = points.saBottomLeft.flipX(points.midAnchor)

        points.saBottomLeftCorner = new Point(points.saBottomLeft.x, points.bottomAnchor.y + hemSa)
        points.saBottomRightCorner = new Point(points.saBottomRight.x, points.saBottomLeftCorner.y)

        paths.sa = paths.sleevecap
          .offset(armholeSa)
          .line(points.saSleeveCapLeft)
          .line(points.saTopLeft)
          .join(paths.saLeft.offset(sideSeamSa))
          .line(points.saBottomLeftCorner)
          .line(points.saBottomRightCorner)
          .line(points.saBottomRight)
          .join(paths.saRight.offset(sideSeamSa))
          .line(points.saTopRight)
          .line(points.saSleeveCapRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
