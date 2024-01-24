import { backBase } from './backBase.mjs'
import { back } from './back.mjs'

export const sideBack = {
  name: 'petunia.sideBack',
  from: backBase,
  after: back,
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
    log,
  }) => {
    //removing paths and snippets not required from Bella
    if (options.daisyGuides) {
      const keepThese = 'daisyGuide'
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.sideHemLeft)
      .curve(points.sideHemLeftCp2, points.sideHemRightCp1, points.sideHemRight)
      .hide()

    paths.sideSeam = new Path()
      .move(points.sideHemRight)
      .line(points.sideCurveRight)
      .curve(points.sideWaist, points.sideWaist, points.armhole)
      .hide()

    paths.saLeft = new Path()
      .move(points.shoulderMid)
      ._curve(points.dartTipCp1, points.dartTip)
      .curve(points.dartBottomRight, points.dartBottomRight, points.sideCurveLeft)
      .line(points.sideHemLeft)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .line(points.shoulderMid)
      .join(paths.saLeft)
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = points.shoulderMid
      points.grainlineTo = new Point(points.grainlineFrom.x, points.sideHemLeft.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      points.grainlineMid = new Point(
        (points.dartBottomRight.x + points.sideWaist.x) / 2,
        points.sideWaist.y + ((points.sideHemRight.y - points.sideWaist.y) * 4) / 5
      )
      points.grainlineBiasFrom = points.grainlineMid.shift(
        135,
        points.sideWaist.dist(points.sideHemRight) * 0.2
      )
      points.grainlineBiasTo = points.grainlineBiasFrom.rotate(180, points.grainlineMid)
      paths.grainlineBias = new Path()
        .move(points.grainlineBiasFrom)
        .line(points.grainlineBiasTo)
        .attr('class', 'note')
        .attr('marker-start', 'url(#grainlineFrom)')
        .attr('marker-end', 'url(#grainlineTo)')
        .attr('data-text', 'Bias Grainline')
        .attr('data-text-class', 'fill-note center')
      //notches
      points.sideNotch = paths.sideSeam.reverse().shiftAlong(points.sideWaist.dist(points.armhole))
      snippets.sideNotch = new Snippet('notch', points.sideNotch)
      points.sideBackNotch = paths.saLeft.split(points.dartTip)[1].shiftFractionAlong(0.5)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['dartTip', 'sideBackNotch', 'armholePitch'],
      })
      //title
      points.title = new Point(
        points.armholePitch.x,
        (points.armhole.y + points.sideHemRight.y) / 2
      )
      macro('title', {
        at: points.title,
        nr: 5,
        title: 'Back',
        scale: 0.5,
      })
      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100

        points.saSideHemRight = points.sideHemRight
          .shift(points.sideWaist.angle(points.sideHemRight), hemSa)
          .shift(points.sideHemRightCp1.angle(points.sideHemRight), sideSeamSa)

        points.saShoulderMid = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saHps,
          points.shoulderMid.shiftTowards(points.dartTipCp1, sa).rotate(-90, points.shoulderMid),
          points.dartTipCp1.shiftTowards(points.shoulderMid, sa).rotate(90, points.dartTipCp1)
        )

        points.saSideHemLeft = points.sideHemLeft
          .shift(points.dartBottomRight.angle(points.sideHemLeft), hemSa)
          .shift(points.sideHemLeftCp2.angle(points.sideHemLeft), sa)

        paths.sa = paths.hemBase
          .offset(hemSa)
          .line(points.saSideHemRight)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .line(points.saArmhole)
          .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
          .curve_(points.saArmholePitchCp2, points.saShoulder)
          .line(points.saShoulderCorner)
          .line(points.saShoulderMid)
          .join(paths.saLeft.offset(sa))
          .line(points.saSideHemLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
