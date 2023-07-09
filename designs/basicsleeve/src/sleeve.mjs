import { pctBasedOn } from '@freesewing/core'
import { sleevecap } from './sleevecap.mjs'

export const sleeve = {
  name: 'basicsleeve.sleeve',
  measurements: ['shoulderToElbow', 'shoulderToWrist', 'biceps', 'elbow', 'wrist'],
  options: {
    //Imported
    ...sleevecap.options,
    //Fit
    bicepsEase: { pct: 12, min: 0, max: 20, menu: 'fit' },
    elbowEase: { pct: 10, min: 0, max: 20, menu: 'fit' },
    wristEase: { pct: 18, min: 0, max: 50, menu: 'fit' },
    //Sleeves
    fitSleeveWidth: { bool: true, menu: 'sleeves' },
    sleeveLength: { pct: 100, min: 0, max: 100, menu: 'sleeves' },
    sleeveLengthBonus: { pct: 0, min: -20, max: 20, menu: 'sleeves' },
    sleeveBands: false,
    sleeveBandWidth: {
      pct: 7.8,
      min: 1,
      max: 30,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    },
    sleeveFlounces: { dflt: 'none', list: ['flounce', 'ruffle', 'none'], menu: 'sleeves' },
    //Construction
    armholeSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sleeveHemWidth: { pct: 2, min: 1, max: 10, menu: 'construction' },
  },
  plugins: [...sleevecap.plugins],
  draft: (sh) => {
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
      absoluteOptions,
      log,
    } = sh

    //draft sleevecap
    sleevecap.draft(sh)

    //renders
    paths.sleevecap.hide()

    //measures
    const sleeveCapDepth = points.sleeveTip.y

    //calculating sleeveBandWidth
    let sleeveBandWidth
    if (options.sleeveBands) {
      sleeveBandWidth = absoluteOptions.sleeveBandWidth
    } else sleeveBandWidth = 0

    //calculating sleeveLengthTarget
    let sleeveLengthTarget
    if (options.sleeveLength < 0.5)
      sleeveLengthTarget =
        (measurements.shoulderToElbow + sleeveCapDepth) *
          options.sleeveLength *
          2 *
          (1 + options.sleeveLengthBonus) -
        sleeveBandWidth
    else
      sleeveLengthTarget =
        sleeveCapDepth +
        (measurements.shoulderToElbow +
          (measurements.shoulderToWrist - measurements.shoulderToElbow) *
            (2 * options.sleeveLength - 1)) *
          (1 + options.sleeveLengthBonus) -
        sleeveBandWidth

    //calculating sleeveLength
    let sleeveLength
    if (sleeveLengthTarget < 0) {
      sleeveLength = 0
      log.warning(
        'options.sleeveBands, options.sleeveBandWidth, options.sleeveLength & options.sleeveLengthBonus are incompatible so sleeveLength has been set to 0'
      )
    } else sleeveLength = sleeveLengthTarget

    //horizontal measures
    const fullSleeveLength =
      sleeveCapDepth + measurements.shoulderToWrist * (1 + options.sleeveLengthBonus)
    const minWidth = points.sleeveCapLeft.dist(points.sleeveCapRight)
    const biceps = measurements.biceps * (1 + options.bicepsEase)
    const elbow = measurements.elbow * (1 + options.elbowEase)
    const wrist = measurements.wrist * (1 + options.wristEase)
    const bandOffset25 =
      (sleeveBandWidth * (minWidth - elbow)) /
      (sleeveCapDepth + (measurements.shoulderToWrist - measurements.shoulderToElbow))
    const bandOffset50 =
      (sleeveBandWidth * (biceps - elbow)) /
      (sleeveCapDepth + (measurements.shoulderToWrist - measurements.shoulderToElbow))
    const bandOffset100 =
      (sleeveBandWidth * (elbow - wrist)) /
      (sleeveCapDepth + (measurements.shoulderToWrist - measurements.shoulderToElbow))
    //calculating bottomWidth
    let bottomWidth
    if (sleeveLength == 0 || !options.fitSleeveWidth) bottomWidth = minWidth
    else {
      if (sleeveLength / fullSleeveLength < 0.5) {
        if (sleeveLength / fullSleeveLength < 0.25) {
          bottomWidth =
            minWidth * (1 + options.sleeveLength * -4) +
            biceps * (4 * options.sleeveLength) +
            bandOffset25
        } else {
          bottomWidth =
            biceps * (2 - options.sleeveLength * 4) +
            elbow * (4 * options.sleeveLength - 1) +
            bandOffset50
        }
      } else
        bottomWidth =
          elbow * (1 - (2 * options.sleeveLength - 1)) +
          wrist * (2 * options.sleeveLength - 1) +
          bandOffset100
    }

    //creating the arm
    points.bottomAnchor = points.midAnchor.shift(-90, sleeveLength)
    points.bottomRight = points.bottomAnchor.shift(0, bottomWidth / 2)
    points.bottomLeft = points.bottomAnchor.shift(180, bottomWidth / 2)

    //paths
    paths.saLeft = new Path().move(points.sleeveCapLeft).line(points.bottomLeft).hide()

    paths.hemBase = new Path().move(points.bottomLeft).line(points.bottomRight).hide()

    paths.saRight = new Path().move(points.bottomRight).line(points.sleeveCapRight).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.saRight)
      .join(paths.sleevecap)
      .join(paths.saLeft)
      .close()
    //setting up for extension not used for this design but is used in multiple extensions
    points.sleeveTipBottom = new Point(points.sleeveTip.x, points.bottomAnchor.y)
    //stores
    store.set('sleeveLength', sleeveLength)
    store.set('bandLength', points.bottomLeft.dist(points.bottomRight))

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.midAnchor.x, points.sleeveTip.y)
      points.grainlineTo = points.bottomAnchor
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.capQ3.x, (points.grainlineTo.y + points.grainlineFrom.y) / 2)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'sleeve',
        scale: 0.5,
      })

      if (sa) {
        let hemSa
        if (options.sleeveBands) hemSa = sa
        else hemSa = sa * options.sleeveHemWidth * 100

        if (sleeveLength == 0) {
          points.saLeft = points.sleeveCapLeft.shift(180, sa)
          points.saRight = points.sleeveCapRight.shift(0, sa)
          paths.sa = paths.hemBase
            .clone()
            .offset(hemSa)
            .line(points.saRight)
            .join(paths.sleevecap.offset(sa * options.armholeSaWidth * 100))
            .line(points.saLeft)
            .close()
            .attr('class', 'fabric sa')
        } else {
          paths.sa = paths.hemBase
            .clone()
            .offset(hemSa)
            .join(paths.saRight.offset(sa))
            .join(paths.sleevecap.offset(sa * options.armholeSaWidth * 100))
            .join(paths.saLeft.offset(sa))
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
