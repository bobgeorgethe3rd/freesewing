import { pctBasedOn } from '@freesewing/core'
import { body } from './body.mjs'

export const sleeve = {
  name: 'frederick.sleeve',
  measurements: ['neck', 'hpsToShoulder', 'shoulderToWrist', 'wrist'],
  after: body,
  options: {
    //Constants
    neckEase: 0,
    //Fit
    wristEase: { pct: 100, min: 0, max: 100, menu: 'fit' },
    //Sleeves
    sleeveLengthBonus: { pct: 0, min: -20, max: 50, menu: 'sleeves' },
    sleeveBandWidth: {
      pct: 9.5,
      min: 1,
      max: 17.4,
      snap: 5,
      ...pctBasedOn('shoulderToWrist'),
      menu: 'sleeves',
    },
    sleeveHemStyle: { dflt: 'cuffed', list: ['cuffed', 'band', 'turnover'], menu: 'sleeves' },
    fitSleeveWidth: { bool: true, menu: 'sleeves' },
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
    Snippet,
    absoluteOptions,
    log,
  }) => {
    //measures
    const sleeveLength =
      measurements.shoulderToWrist * (1 + options.sleeveLengthBonus) -
      store.get('bodyShoulderLength') -
      (store.get('head') * 0.25 - (measurements.neck * (1 + options.neckEase)) / 5)
    const sleeveBandWidth = absoluteOptions.sleeveBandWidth

    //let's begin
    points.origin = new Point(0, 0)
    points.topLeft = points.origin.shift(180, store.get('sleeveWidth') * 0.5)
    points.topRight = points.topLeft.flipX()
    points.bottomAnchor = points.origin.shift(-90, sleeveLength)
    points.bottomLeft = options.fitSleeveWidth
      ? points.bottomAnchor.shift(180, measurements.wrist * 0.5 * (1 + options.wristEase))
      : new Point(points.topLeft.x, points.bottomAnchor.y)
    points.bottomRight = points.bottomLeft.flipX()

    points.hemAnchor = points.bottomAnchor.shift(
      90,
      points.bottomAnchor.dist(points.origin) < sleeveBandWidth
        ? points.bottomAnchor.dist(points.origin) * 0.5
        : sleeveBandWidth
    )
    points.hemAnchorLeft = utils.beamIntersectsY(
      points.topLeft,
      points.bottomLeft,
      points.hemAnchor.y
    )
    points.hemAnchorRight = utils.beamIntersectsY(
      points.bottomRight,
      points.topRight,
      points.hemAnchor.y
    )
    points.hemLeft = points.hemAnchorLeft.flipY(points.bottomAnchor)
    points.hemRight = points.hemAnchorRight.flipY(points.bottomAnchor)
    points.cuffLeft = points.bottomLeft.flipY(points.hemLeft)
    points.cuffRight = points.bottomRight.flipY(points.hemRight)
    //paths

    const drawHem = () =>
      options.sleeveHemStyle == 'band'
        ? new Path().move(points.hemAnchorLeft).line(points.hemAnchorRight)
        : options.sleeveHemStyle == 'turnover'
        ? new Path()
            .move(points.bottomLeft)
            .line(points.hemLeft)
            .line(points.hemRight)
            .line(points.bottomRight)
        : new Path()
            .move(points.bottomLeft)
            .line(points.hemLeft)
            .line(points.cuffLeft)
            .line(points.cuffRight)
            .line(points.hemRight)
            .line(points.bottomRight)

    paths.seam = new Path()
      .move(options.sleeveHemStyle == 'band' ? points.hemAnchorRight : points.bottomRight)
      .line(points.topRight)
      .line(points.topLeft)
      .line(options.sleeveHemStyle == 'band' ? points.hemAnchorLeft : points.bottomLeft)
      .join(drawHem())
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.origin
      points.grainlineTo = new Point(
        points.grainlineFrom.x,
        options.sleeveHemStyle == 'band'
          ? points.hemAnchor.y
          : options.sleeveHemStyle == 'turnover'
          ? points.hemLeft.y
          : points.cuffLeft.y
      )
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.gussetLeft = points.topLeft.shiftTowards(points.bottomLeft, store.get('gussetWidth'))
      points.gussetRight = points.gussetLeft.flipX()
      macro('sprinkle', {
        snippet: 'notch',
        on: ['topLeft', 'topRight', 'gussetLeft', 'gussetRight'],
      })
      //title
      points.title = new Point((points.hemAnchorRight.x * 1) / 3, points.hemAnchorRight.y * 0.5)
      macro('title', {
        at: points.title,
        nr: 3,
        title: 'Sleeve',
        cutNr: 2,
        scale: 0.5,
      })
      //foldlines
      if (options.sleeveHemStyle != 'band') {
        paths.hemFold = new Path()
          .move(points.bottomLeft)
          .line(points.bottomRight)
          .attr('class', 'mark help')
          .attr('data-text', 'Hem Fold-line')
          .attr('data-text-class', 'center')
        if (options.sleeveHemStyle == 'cuffed') {
          paths.cuffFold = new Path()
            .move(points.hemLeft)
            .line(points.hemRight)
            .attr('class', 'mark help')
            .attr('data-text', 'Cuff Fold-line')
            .attr('data-text-class', 'center')
        }
      }
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        points.saBottomRight = utils.beamIntersectsY(
          points.bottomRight
            .shiftTowards(points.topRight, sideSeamSa)
            .rotate(-90, points.bottomRight),
          points.topRight.shiftTowards(points.bottomRight, sideSeamSa).rotate(90, points.topRight),
          points.bottomAnchor.y
        )

        points.saTopRight = utils.beamIntersectsY(
          points.saBottomRight,
          points.saBottomRight.shift(points.bottomRight.angle(points.topRight), 1),
          points.origin.y - sideSeamSa
        )

        points.saTopLeft = points.saTopRight.flipX()
        points.saBottomLeft = points.saBottomRight.flipX()

        points.saHemAnchorRight = utils.beamIntersectsY(
          points.bottomRight
            .shiftTowards(points.topRight, sideSeamSa)
            .rotate(-90, points.bottomRight),
          points.topRight.shiftTowards(points.bottomRight, sideSeamSa).rotate(90, points.topRight),
          points.hemAnchor.y + sa
        )
        points.saHemAnchorLeft = points.saHemAnchorRight.flipX()

        points.saHemRight = utils.beamIntersectsY(
          points.hemRight.shiftTowards(points.bottomRight, sideSeamSa).rotate(-90, points.hemRight),
          points.bottomRight
            .shiftTowards(points.hemRight, sideSeamSa)
            .rotate(90, points.bottomRight),
          options.sleeveHemStyle == 'cuffed' ? points.hemRight.y : points.hemRight.y + sa
        )
        points.saHemLeft = points.saHemRight.flipX()

        points.saCuffRight = utils.beamIntersectsY(
          points.cuffRight.shiftTowards(points.hemRight, sideSeamSa).rotate(-90, points.cuffRight),
          points.hemRight.shiftTowards(points.cuffRight, sideSeamSa).rotate(90, points.hemRight),
          points.cuffRight.y + sa
        )

        points.saCuffLeft = points.saCuffRight.flipX()

        const drawHemSa = () =>
          options.sleeveHemStyle == 'band'
            ? new Path().move(points.saHemAnchorLeft).line(points.saHemAnchorRight)
            : options.sleeveHemStyle == 'turnover'
            ? new Path()
                .move(points.saBottomLeft)
                .line(points.saHemLeft)
                .line(points.saHemRight)
                .line(points.saBottomRight)
            : new Path()
                .move(points.saBottomLeft)
                .line(points.saHemLeft)
                .line(points.saCuffLeft)
                .line(points.saCuffRight)
                .line(points.saHemRight)
                .line(points.saBottomRight)

        paths.sa = new Path()
          .move(options.sleeveHemStyle == 'band' ? points.saHemAnchorRight : points.saBottomRight)
          .line(points.saTopRight)
          .line(points.saTopLeft)
          .line(options.sleeveHemStyle == 'band' ? points.saHemAnchorLeft : points.saBottomLeft)
          .join(drawHemSa())
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
