import { backBase } from './backBase.mjs'
import { front } from './front.mjs'

export const sideBack = {
  name: 'scott.sideBack',
  from: backBase,
  after: front,
  hide: {
    from: true,
    inherited: true,
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
  }) => {
    //removing paths and snippets not required from Bella
    let keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //let's begin
    paths.waist = new Path().move(points.dartBottomRight).line(points.sideWaist).hide()

    paths.sideSeam = new Path().move(points.sideWaist).line(points.armhole).hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.neck = new Path().move(points.shoulderTop).line(points.neckBackCorner).hide()

    paths.styleLine = new Path()
      .move(points.neckBackCorner)
      .curve(points.neckBackCornerCp, points.dartBottomRightCp1, points.dartBottomRight)
      .hide()

    paths.seam = paths.waist
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.neck)
      .join(paths.styleLine)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(
        points.dartTip.shiftFractionTowards(points.armhole, 0.25).x,
        points.armholePitch.y
      )
      points.grainlineTo = new Point(points.grainlineFrom.x, points.dartBottomRight.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.sideNotch = points.sideWaist.shiftFractionTowards(points.armhole, 0.5)
      points.styleNotch = paths.styleLine.shiftFractionAlong(0.5)
      snippets.sideNotch = new Snippet('notch', points.sideNotch)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['neckBackCorner', 'styleNotch', 'armholePitch'],
      })
      //title
      points.title = points.dartTip
        .shiftFractionTowards(points.armhole, 0.4)
        .shift(-90, points.dartBottomMid.dist(points.dartTip) * 0.5)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Side Back',
        scale: 2 / 3,
      })
      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const styleLineSa = sa * options.styleLineSaWidth * 100

        points.saShoulderTop = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.shoulder.angle(points.hps), 1),
          points.shoulderTop
            .shiftTowards(points.neckBackCorner, sa)
            .rotate(-90, points.shoulderTop),
          points.neckBackCorner
            .shiftTowards(points.shoulderTop, sa)
            .rotate(90, points.neckBackCorner)
        )

        points.saDartBottomRight = utils.beamsIntersect(
          points.dartBottomRightCp1
            .shiftTowards(points.dartBottomRight, styleLineSa)
            .rotate(-90, points.dartBottomRightCp1),
          points.dartBottomRight
            .shiftTowards(points.dartBottomRightCp1, styleLineSa)
            .rotate(90, points.dartBottomRight),
          points.dartBottomRight
            .shiftTowards(points.sideWaist, sa)
            .rotate(-90, points.dartBottomRight),
          points.sideWaist.shiftTowards(points.dartBottomRight, sa).rotate(90, points.sideWaist)
        )

        paths.sa = paths.waist
          .offset(sa)
          .line(points.saSideWaist)
          .line(points.saArmholeCorner)
          .line(points.saArmhole)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(paths.neck.offset(sa))
          .join(paths.styleLine.offset(styleLineSa))
          .line(points.saDartBottomRight)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
