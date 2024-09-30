import { pctBasedOn } from '@freesewing/core'
import { pluginBundle } from '@freesewing/plugin-bundle'
import { sleeve as basicsleeve } from '@freesewing/basicsleeve'

export const sleeve = {
  name: 'fullshirtsleeve.sleeve',
  measurements: [...basicsleeve.measurements],
  options: {
    //Imported
    ...basicsleeve.options,
    //Constants
    bicepsEase: 0.12, //Locked for Fullshirtsleeve
    sleeveLength: 1, //Locked for Fullshirtsleeve
    sleeveBands: 'true', //Locked for Fullshirtsleeve
    sleeveFlounces: 'none', //Locked for Fullshirtsleeve
    sleeveHemWidth: 1, //Locked for Fullshirtsleeve
    //Sleeves
    sleevePleats: { bool: true, menu: 'sleeves' },
    sleeveBandWidth: {
      pct: 9.2,
      min: 7,
      max: 17,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves.cuffs',
    }, //Altered for Fullshirtsleeve
    sleeveSideCurve: { pct: 50, min: 0, max: 100, menu: 'sleeves' },
    sleevePlacketLength: { pct: 26.1, min: 15, max: 35, menu: 'sleeves.plackets' },
    sleeveSlitFactor: { pct: 70, min: 65, max: 80, menu: 'sleeves.plackets' },
    sleevePleatWidth: { pct: 9.7, min: 5, max: 15, menu: 'sleeves' },
    sleeveBottomCurve: { pct: 1.7, min: 0, max: 2, menu: 'sleeves' },
    //Advanced
    sleeveSideCurveDepth: { pct: 50, min: 30, max: 70, menu: 'advanced.sleeves' },
  },
  plugins: [pluginBundle],
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
    //draft
    basicsleeve.draft(sh)
    //remove paths
    const keepThese = 'sleevecap'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //removing macros not required from sleeve
    macro('title', false)
    //measures
    const storedBottomWidth = points.bottomLeft.dist(points.bottomRight)
    const sleevePlacketLength = measurements.shoulderToWrist * options.sleevePlacketLength
    const sleeveSlitLength = sleevePlacketLength * options.sleeveSlitFactor
    const sleeveHemDrop = measurements.shoulderToWrist * options.sleeveBottomCurve
    let sleevePleatWidth
    if (options.sleevePleats) {
      sleevePleatWidth = measurements.wrist * options.sleevePleatWidth
    } else {
      sleevePleatWidth = 0
    }
    //let's begin
    if (options.sleevePleats && options.fitSleeveWidth) {
      points.bottomLeft = points.bottomLeft.shift(180, sleevePleatWidth)
      points.bottomRight = points.bottomRight.shift(0, sleevePleatWidth)
    }
    const sleeveSideAngle = points.sleeveCapLeft.angle(points.bottomLeft) - 270

    points.bottomLeftCp1 = new Point(
      points.sleeveCapLeft.x,
      points.bottomAnchor.y * options.sleeveSideCurveDepth
    ).rotate(sleeveSideAngle * (1 - options.sleeveSideCurve), points.sleeveCapLeft)
    points.bottomRightCp2 = new Point(
      points.sleeveCapRight.x,
      points.bottomAnchor.y * options.sleeveSideCurveDepth
    ).rotate(sleeveSideAngle * (1 - options.sleeveSideCurve) * -1, points.sleeveCapRight)

    points.slitBottom = new Point(points.bottomLeft.x / 2, points.bottomAnchor.y + sleeveHemDrop)
    points.slitBottomCp1 = new Point((points.bottomLeft.x * 3) / 4, points.slitBottom.y)
    points.slitBottomCp2 = new Point(points.bottomLeft.x / 4, points.slitBottom.y)

    //paths
    paths.saLeft = new Path()
      .move(points.sleeveCapLeft)
      .curve_(points.bottomLeftCp1, points.bottomLeft)
      .hide()

    paths.hemBase = new Path()
      .move(points.bottomLeft)
      ._curve(points.slitBottomCp1, points.slitBottom)
      .curve_(points.slitBottomCp2, points.bottomAnchor)
      .line(points.bottomRight)
      .hide()

    paths.saRight = new Path()
      .move(points.bottomRight)
      ._curve(points.bottomRightCp2, points.sleeveCapRight)
      .hide()

    paths.seam = paths.hemBase.join(paths.saRight).join(paths.sleevecap).join(paths.saLeft).close()

    //stores
    store.set('sleevePlacketLength', sleevePlacketLength)
    store.set('sleeveSlitLength', sleeveSlitLength)
    store.set('sleeveCuffLength', paths.hemBase.length() - sleevePleatWidth * 2)
    store.set(
      'sleeveCuffNotchLength',
      new Path().move(points.bottomLeft)._curve(points.slitBottomCp1, points.slitBottom).length() +
        points.bottomAnchor.dist(points.bottomRight) / 2
    )

    if (complete) {
      //grainline
      points.grainlineFrom = points.sleeveTip
      points.grainlineTo = new Point(points.grainlineFrom.x, points.bottomAnchor.y * 0.85)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      snippets.cuffNotch = new Snippet(
        'notch',
        points.bottomAnchor.shiftFractionTowards(points.bottomRight, 0.5)
      )
      //title
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Sleeve',
        cutNr: 2,
        scale: 0.5,
      })
      //slit
      points.slitTop = points.slitBottom.shift(90, sleeveSlitLength)
      paths.slit = new Path()
        .move(points.slitBottom)
        .line(points.slitTop)
        .attr('class', 'mark')
        .attr('data-text', 'Placket Slit')
        .attr('data-text-class', 'center')
      // pleats
      if (options.sleevePleats) {
        const sleevePleatLength = points.bottomAnchor.dist(points.bottomRight) / 2

        points.pleatToBottom0 = points.bottomAnchor
        points.pleatFromBottom0 = points.bottomAnchor.shiftTowards(
          points.bottomRight,
          sleevePleatWidth
        )
        points.pleatToTop0 = points.pleatToBottom0.shift(90, sleevePleatLength)
        points.pleatFromTop0 = points.pleatFromBottom0.shift(90, sleevePleatLength)
        points.pleatToBottom1 = utils.lineIntersectsCurve(
          points.pleatToBottom0.shiftFractionTowards(points.bottomLeft, 0.25),
          points.pleatToBottom0
            .shiftFractionTowards(points.bottomLeft, 0.25)
            .shift(-90, sleevePleatLength * 10),
          points.slitBottom,
          points.slitBottomCp2,
          points.bottomAnchor,
          points.bottomAnchor
        )

        points.pleatFromBottom1 = utils.lineIntersectsCurve(
          points.pleatToBottom1.shiftTowards(points.bottomRight, sleevePleatWidth),
          points.pleatToBottom1
            .shiftTowards(points.bottomRight, sleevePleatWidth)
            .shift(90, sleevePleatLength * 10),
          points.slitBottom,
          points.slitBottomCp2,
          points.bottomAnchor,
          points.bottomAnchor
        )
        points.pleatToTop1 = new Point(points.pleatToBottom1.x, points.pleatToTop0.y)
        points.pleatFromTop1 = new Point(points.pleatFromBottom1.x, points.pleatFromTop0.y)

        for (let i = 0; i < 2; i++) {
          paths['pleatFrom' + i] = new Path()
            .move(points['pleatFromBottom' + i])
            .line(points['pleatFromTop' + i])
            .attr('class', 'mark')
            .attr('data-text', 'Pleat - From')
            .attr('data-text-class', 'center')

          paths['pleatTo' + i] = new Path()
            .move(points['pleatToBottom' + i])
            .line(points['pleatToTop' + i])
            .attr('class', 'mark help')
            .attr('data-text', 'Pleat - To')
            .attr('data-text-class', 'center')
        }
      }
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100

        points.saSleeveCapLeft = new Point(
          paths.saLeft.offset(sideSeamSa).start().x,
          paths.sleevecap.offset(armholeSa).end().y
        )
        points.saSleeveCapRight = points.saSleeveCapLeft.flipX(points.midAnchor)

        points.saBottomLeft = new Point(
          paths.saLeft.offset(sideSeamSa).end().x,
          paths.hemBase.offset(sa).start().y
        )
        points.saBottomRight = new Point(
          paths.saRight.offset(sideSeamSa).start().x,
          paths.hemBase.offset(sa).end().y
        )

        paths.sa = paths.hemBase
          .offset(sa)
          .line(points.saBottomRight)
          .join(paths.saRight.offset(sideSeamSa))
          .line(points.saSleeveCapRight)
          .join(paths.sleevecap.offset(sa * options.armholeSaWidth * 100))
          .line(points.saSleeveCapLeft)
          .join(paths.saLeft.offset(sideSeamSa))
          .line(points.saBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
