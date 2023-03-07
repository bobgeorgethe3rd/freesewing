import { pctBasedOn } from '@freesewing/core'
import { sleevecap } from '@freesewing/sleevecap'

export const sleeve = {
  name: 'basicsleeve.sleeve',
  from: sleevecap,
  hideDependencies: true,
  measurements: ['shoulderToElbow', 'shoulderToWrist', 'elbow', 'wrist'],
  options: {
    //Fit
    elbowEase: { pct: 10, min: 0, max: 50, menu: 'fit' },
    wristEase: { pct: 15, min: 0, max: 50, menu: 'fit' },
    //Style
    fitSleeveWidth: { bool: true, menu: 'style' },
    sleeveLength: { pct: 100, min: 0, max: 100, menu: 'style' },
    sleeveLengthBonus: { pct: 0, min: -20, max: 20, menu: 'style' },
    sleeveBands: { bool: false, menu: 'style' },
    sleeveBandWidth: {
      pct: 7.8,
      min: 1,
      max: 30,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'style',
    },
    flounces: { dflt: 'none', list: ['flounce', 'ruffle', 'none'], menu: 'style' },
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
    absoluteOptions,
    log,
  }) => {
    //renders
    paths.sleevecap.render = false

    //measures
    let top = paths.sleevecap.bbox().topLeft.y

    //calculating sleeveBandWidth
    let sleeveBandWidth
    if (options.sleeveBands) {
      sleeveBandWidth = absoluteOptions.sleeveBandWidth
    } else sleeveBandWidth = 0

    //calculating sleeveLengthTarget
    let sleeveLengthTarget
    if (options.sleeveLength < 0.5)
      sleeveLengthTarget =
        (measurements.shoulderToElbow + top) *
          options.sleeveLength *
          2 *
          (1 + options.sleeveLengthBonus) -
        sleeveBandWidth
    else
      sleeveLengthTarget =
        top +
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
    let biceps = points.bicepsLeft.dist(points.bicepsRight)
    let elbow = measurements.elbow * (1 + options.elbowEase)
    let wrist = measurements.wrist * (1 + options.wristEase)

    //calculating bottomWidth
    let bottomWidth
    if (sleeveLength == 0 || !options.fitSleeveWidth) bottomWidth = biceps
    else {
      if (options.sleeveLength < 0.5)
        bottomWidth =
          biceps * (1 - options.sleeveLength * 2) +
          elbow * options.sleeveLength * 2 +
          (sleeveBandWidth * (biceps - elbow)) / (top + measurements.shoulderToElbow)
      else
        bottomWidth =
          elbow * (1 - (2 * options.sleeveLength - 1)) +
          wrist * (2 * options.sleeveLength - 1) +
          (sleeveBandWidth * (biceps - elbow)) / (top + measurements.shoulderToElbow)
    }

    //creating the arm
    points.bottomAnchor = points.gridAnchor.shift(-90, sleeveLength)
    points.bottomRight = points.bottomAnchor.shift(0, bottomWidth / 2)
    points.bottomLeft = points.bottomAnchor.shift(180, bottomWidth / 2)

    //paths
    paths.saLeft = new Path().move(points.bicepsLeft).line(points.bottomLeft).hide()

    paths.hemBase = new Path().move(points.bottomLeft).line(points.bottomRight).hide()

    paths.saRight = new Path().move(points.bottomRight).line(points.bicepsRight).hide()

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
      points.grainlineFrom = new Point(points.gridAnchor.x, points.sleeveTip.y)
      points.grainlineTo = points.bottomAnchor
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //title
      points.title = new Point(points.capQ3.x, points.title.y)
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
          points.saLeft = points.bicepsLeft.shift(180, sa)
          points.saRight = points.bicepsRight.shift(0, sa)
          paths.sa = paths.hemBase
            .clone()
            .offset(hemSa)
            .line(points.saRight)
            .join(paths.sleevecap.offset(sa * options.sleeveCapSaWidth * 100))
            .line(points.saLeft)
            .close()
            .attr('class', 'fabric sa')
        } else {
          paths.sa = paths.hemBase
            .clone()
            .offset(hemSa)
            .join(paths.saRight.offset(sa))
            .join(paths.sleevecap.offset(sa * options.sleeveCapSaWidth * 100))
            .join(paths.saLeft.offset(sa))
            .close()
            .attr('class', 'fabric sa')
        }
      }
    }

    return part
  },
}
