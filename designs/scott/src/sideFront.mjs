import { frontBase } from './frontBase.mjs'
import { front } from './front.mjs'

export const sideFront = {
  name: 'scott.sideFront',
  from: frontBase,
  after: front,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Construction
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    armholeSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
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
  }) => {
    //removing paths and snippets not required from Bella
    const keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    macro('cutonfold', false)
    //let's begin
    //paths
    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.styleLine = new Path()
      .move(points.sideNeckFront)
      .curve(points.sideNeckFrontCp2, points.waistDartRightCp1, points.waistDartRight)
      .hide()

    paths.seam = new Path()
      .move(points.waistDartRight)
      .line(points.sideWaist)
      .line(points.armhole)
      .join(paths.armhole)
      .line(points.bustDartBottom)
      .line(points.sideNeckFront)
      .join(paths.styleLine)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.waistDartRight.x * 1.1, points.armhole.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.waistDartRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.bustNotch = utils.lineIntersectsCurve(
        points.cfChest,
        points.cfChest.shiftFractionTowards(points.bust, 2),
        points.sideNeckFront,
        points.sideNeckFrontCp2,
        points.waistDartRightCp1,
        points.waistDartRight
      )
      points.sideNotch = points.sideWaist.shiftFractionTowards(points.armhole, 0.5)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['sideNeckFront', 'bustNotch', 'armholePitch', 'sideNotch'],
      })
      //title
      points.title = new Point(points.armholePitchCp1.x, points.armhole.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Side Front',
        cutNr: 2,
        scale: 0.5,
      })
      //scalebox
      macro('scalebox', {
        at: points.scalebox,
      })
      if (sa) {
        const styleLineSa = sa * options.styleLineSaWidth * 100

        points.saBustDartBottom = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saBustDartBottom,
          points.bustDartBottom
            .shiftTowards(points.sideNeckFront, sa)
            .rotate(-90, points.bustDartBottom),
          points.sideNeckFront
            .shiftTowards(points.bustDartBottom, sa)
            .rotate(90, points.sideNeckFront)
        )

        points.saWaistDartRight = utils.beamsIntersect(
          points.waistDartRightCp1
            .shiftTowards(points.waistDartRight, styleLineSa)
            .rotate(-90, points.waistDartRightCp1),
          points.waistDartRight
            .shiftTowards(points.waistDartRightCp1, styleLineSa)
            .rotate(90, points.waistDartRight),
          points.waistDartRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.waistDartRight),
          points.sideWaist.shiftTowards(points.waistDartRight, sa).rotate(90, points.sideWaist)
        )
        points.saSideNeckFront = points.sideNeckFront
          .shiftTowards(points.bustDartBottom, sa)
          .rotate(90, points.sideNeckFront)

        paths.sa = new Path()
          .move(points.saWaistDartRight)
          .line(points.saSideWaist)
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saBustDartBottom)
          .line(points.saSideNeckFront)
          .join(paths.styleLine.offset(styleLineSa))
          .line(points.saWaistDartRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
