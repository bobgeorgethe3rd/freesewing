import { pctBasedOn } from '@freesewing/core'
import { sleevecap } from './sleevecap.mjs'

export const sleeve = {
  name: 'basicsleeve.sleeve',
  measurements: ['shoulderToElbow', 'shoulderToWrist', 'biceps', 'elbow', 'wrist'],
  options: {
    //Imported
    ...sleevecap.options,
    //Fit
    bicepsEase: { pct: 20.6, min: 0, max: 25, menu: 'fit' },
    elbowEase: { pct: 19.7, min: 0, max: 25, menu: 'fit' },
    wristEase: { pct: 18, min: 0, max: 50, menu: 'fit' },
    //Sleeves
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
      (sleeveBandWidth * (minWidth - biceps)) /
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
    store.set('sleeveBandLength', points.bottomLeft.dist(points.bottomRight))

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

        if (sleeveLength == 0 || !options.fitSleeveWidth) {
          points.saTopLeft = points.sleeveCapLeft.shift(180, sideSeamSa)
          points.saBottomLeft = points.bottomLeft.shift(180, sideSeamSa)
        } else {
          points.saTopLeft = utils.beamIntersectsY(
            points.sleeveCapLeft
              .shiftTowards(points.bottomLeft, sideSeamSa)
              .rotate(-90, points.sleeveCapLeft),
            points.bottomLeft
              .shiftTowards(points.sleeveCapLeft, sideSeamSa)
              .rotate(90, points.bottomLeft),
            points.saSleeveCapLeft.y
          )
          points.saBottomLeft = points.bottomLeft
            .shiftTowards(points.sleeveCapLeft, sideSeamSa)
            .rotate(90, points.bottomLeft)
        }
        points.saSleeveCapRight = points.saSleeveCapLeft.flipX(points.midAnchor)
        points.saTopRight = points.saTopLeft.flipX(points.midAnchor)
        points.saBottomRight = points.saBottomLeft.flipX(points.midAnchor)

        points.saBottomLeftCorner = new Point(points.saBottomLeft.x, points.bottomAnchor.y + hemSa)
        points.saBottomRightCorner = new Point(points.saBottomRight.x, points.saBottomLeftCorner.y)

        paths.sa = paths.sleevecap
          .offset(armholeSa)
          .line(points.saSleeveCapLeft)
          .line(points.saTopLeft)
          .line(points.saBottomLeft)
          .line(points.saBottomLeftCorner)
          .line(points.saBottomRightCorner)
          .line(points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saSleeveCapRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
