import { back as backDaisy } from '@freesewing/daisy'
import { pctBasedOn } from '@freesewing/core'
import { front } from './front.mjs'

export const back = {
  name: 'camden.back',
  from: backDaisy,
  after: front,
  hide: {
    from: true,
  },
  options: {
    //Style
    backNeckDepth: { pct: 65, min: 0, max: 100, menu: 'style' },
    backNeckCurve: { pct: 50, min: 0, max: 100, menu: 'style' },
    backNeckCurveDepth: { pct: (2 / 3) * 100, min: 0, max: 100, menu: 'style' },
    includeStraps: { bool: true, menu: 'style' },
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
    //removing paths and snippets not required from Daisy
    for (let i in paths) delete paths[i]
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    //measures
    const sideLength = store.get('sideLength')
    const strapWidth = store.get('strapWidth')
    const armholeCpAngle = store.get('armholeCpAngle')
    const length = store.get('length')
    const sideAngle = store.get('sideAngle')
    //let's begin
    points.shoulderPitch = points.hps.shiftFractionTowards(points.shoulder, options.shoulderPitch)
    points.shoulderPitchMax = new Point(points.shoulderPitch.x, points.armholePitch.y)
    points.strapMid = points.shoulderPitch.shiftFractionTowards(
      points.shoulderPitchMax,
      options.backShoulderDepth
    )
    if (options.frontShoulderDepth == 0 && options.backShoulderDepth == 0) {
      points.strapLeft = points.strapMid.shiftTowards(points.hps, strapWidth / 2)
    } else {
      points.strapLeft = points.strapMid.shift(180, strapWidth / 2)
    }
    points.strapRight = points.strapLeft.rotate(180, points.strapMid)
    points.cbArmholePitch = new Point(points.cbNeck.x, points.armholePitch.y)
    points.cbBust = new Point(points.cbNeck.x, points.bustCenter.y)
    points.cbNeckNew = points.cbArmholePitch.shiftFractionTowards(
      points.cbBust,
      options.backNeckDepth
    )
    points.cbNeckCp1NewTarget = utils.beamsIntersect(
      points.strapLeft,
      points.strapLeft.shift(-90, 1),
      points.cbNeckNew,
      points.cbNeckNew.shift(points.cbNeckNew.angle(points.strapLeft) * options.backNeckCurve, 1)
    )
    points.cbNeckCp1New = points.cbNeckNew.shiftFractionTowards(
      points.cbNeckCp1NewTarget,
      options.backNeckCurveDepth
    )

    points.armholeDrop = points.waistSide.shiftTowards(points.armhole, sideLength)

    points.armholePitchCp1New = utils.beamsIntersect(
      points.strapRight,
      points.strapRight.shift(armholeCpAngle, 1),
      points.armholePitchCp1,
      points.armholePitch.rotate(90, points.armholePitchCp1)
    )

    points.armholeCpTargetNew = utils.beamsIntersect(
      points.armholeDrop,
      points.waistSide.rotate(-90, points.armholeDrop),
      points.strapRight,
      points.strapRight.shift(-90, 1)
    )
    points.armholeCp2New = points.armholeDrop.shiftFractionTowards(
      points.armholeCpTargetNew,
      options.backArmholeCurvature
    )
    //hem
    points.sideHem = points.waistSide.shift(270 + sideAngle, length)
    points.sideHemCp1 = utils.beamsIntersect(
      points.sideHem,
      points.sideHem.shift(180 + sideAngle, 1),
      new Point(points.sideHem.x / 2, points.sideHem.y),
      new Point(points.sideHem.x / 2, points.sideHem.y * 1.1)
    )
    points.cbHem = utils.beamsIntersect(
      points.cbNeckNew,
      points.cbWaist,
      points.sideHemCp1,
      points.sideHemCp1.shift(180, 1)
    )

    points.sideHemCp2 = points.sideHem.shiftFractionTowards(
      points.waistSide,
      options.length * options.sideCurve
    )
    points.sideWaistCp1 = points.armholeDrop.shiftFractionTowards(
      points.waistSide,
      options.length * options.sideCurve
    )

    //guides
    if (options.daisyGuide) {
      paths.daisyGuide = new Path()
        .move(points.cbWaist)
        .line(points.waistSide)
        .curve_(points.waistSideCp2, points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.hps)
        ._curve(points.cbNeckCp1, points.cbNeck)
        .line(points.cbWaist)
        .close()
        .attr('class', 'various lashed')
    }
    //paths
    paths.hemBase = new Path().move(points.cbHem).curve_(points.sideHemCp1, points.sideHem).hide()

    paths.saBase = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.sideWaistCp1, points.armholeDrop)
      .curve(points.armholeCp2New, points.armholePitchCp1New, points.strapRight)
      .line(points.strapLeft)
      ._curve(points.cbNeckCp1New, points.cbNeckNew)
      .hide()

    paths.seam = paths.hemBase.clone().join(paths.saBase).line(points.cbHem).close()

    //stores
    store.set(
      'strapLength',
      store.get('strapFrontLength') + points.strapMid.dist(points.shoulderPitch)
    )

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.cbNeckNew
      points.cutOnFoldTo = points.cbHem
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
      })
      //notches
      const sideWaistNotchPot = utils.lineIntersectsCurve(
        points.cbWaist,
        points.cbWaist.shiftFractionTowards(points.waistSide, 1000),
        points.sideHem,
        points.sideHemCp2,
        points.sideWaistCp1,
        points.armholeDrop
      )

      if (sideWaistNotchPot) {
        points.sideWaistNotch = sideWaistNotchPot
      } else {
        points.sideWaistNotch = points.waistSide
      }
      points.cbWaistNotch = utils.beamsIntersect(
        points.cbNeckNew,
        points.cbWaist,
        points.sideWaistNotch,
        points.sideWaistNotch.shift(180, 1)
      )

      snippets.sideWaistNotch = new Snippet('notch', points.sideWaistNotch)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['cbBust', 'cbWaistNotch'],
      })
      //title
      points.title = new Point(points.cbNeckCp1.x, points.bustCenter.y)
      macro('title', {
        at: points.title,
        nr: 2,
        title: 'Back',
        scale: 0.75,
      })
      //strap
      if (!options.includeStraps) {
        points.strapLength = new Point(points.dartRightCp.x, points.bustCenter.y).attr(
          'data-text',
          'Strap Length: ' + utils.units(store.get('strapLength'))
        )
        points.strapWidth = points.dartRightCp
          .clone()
          .attr('data-text', 'Strap Width: ' + utils.units(store.get('strapWidth')))
      }
      if (sa) {
        paths.sa = paths.hemBase
          .offset(sa * options.hemWidth * 100)
          .join(paths.saBase.offset(sa))
          .line(points.cbNeckNew)
          .line(points.cbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
