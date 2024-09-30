import { backBase } from './backBase.mjs'
import { back } from './back.mjs'
import { pocket } from './pocket.mjs'

export const sideBack = {
  name: 'petunia.sideBack',
  from: backBase,
  after: [back, pocket],
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
    macro('cutonfold', false)
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

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
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
      .join(paths.armhole)
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
      if (options.pocketsBool && store.get('sideSkirtLength') > store.get('pocketLength')) {
        points.pocketOpeningTop = paths.sideSeam
          .reverse()
          .shiftAlong(points.sideWaist.dist(points.armhole) + store.get('pocketOpening'))
        points.pocketOpeningBottom = paths.sideSeam
          .reverse()
          .shiftAlong(points.sideWaist.dist(points.armhole) + store.get('pocketOpeningLength'))
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      //title
      points.title = new Point(
        points.armholePitch.x,
        (points.armhole.y + points.sideHemRight.y) / 2
      )
      macro('title', {
        at: points.title,
        nr: 5,
        title: 'Back',
        cutNr: 2,
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
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
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
