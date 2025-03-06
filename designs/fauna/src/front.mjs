import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { frontBase } from './frontBase.mjs'

export const front = {
  name: 'fauna.front',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    sideSeamCurve: { pct: 50, min: 0, max: 100, menu: 'style' },
    //Placket
    inbuiltPlacketFacing: { bool: true, menu: 'plackets' },
    //Pockets
    patchPocketWidth: { pct: 65.6, min: 30, max: 80, menu: 'pockets.patchPockets' },
    patchPocketPlacement: { pct: 60, min: 40, max: 70, menu: 'pockets.patchPockets' },
    //Construction
    placketFacingSaWidth: { pct: 1.5, min: 0, max: 3, menu: 'construction' },
    armholeSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    sideSeamSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
    hemWidth: { pct: 1.5, min: 0, max: 3, menu: 'construction' },
  },
  measurements: ['hips', 'seat'],
  plugins: [pluginLogoRG],
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
    absoluteOptions,
    snippets,
    Snippet,
  }) => {
    //delete inherited paths
    const keepThese = ['hemBase', 'mHemBase', 'cfNeck', 'mCfNeck', 'facingCurve']
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measurements
    const angle = store.get('bustDartAngle') + store.get('waistDartAngle')
    const patchPocketWidth = points.shoulder.x * options.patchPocketWidth
    //let's begin
    //pocket
    points.pocketMid = new Point(
      points.armholePitch.x * options.patchPocketPlacement,
      points.cArmholePitch.shiftFractionTowards(points.cArmhole, 2 / 3).y
    )
    points.pocketLeft = points.pocketMid.shift(180, patchPocketWidth / 2)
    points.pocketRight = points.pocketLeft.flipX(points.pocketMid)
    // paths.armholeGuide = new Path()
    // .move(points.armhole)
    // .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
    // .curve_(points.armholePitchCp2, points.shoulder)
    // .hide()
    points.shoulderSplit0 = points.shoulder.shiftFractionTowards(points.hps, 1 / 7)
    points.hpsCp1 = points.shoulder.shiftFractionTowards(points.hps, 6 / 7)
    const rotFull = [
      'armhole',
      'armholeCp2',
      'armholePitchCp1',
      'armholePitch',
      'armholePitchCp2',
      'shoulder',
      'shoulderSplit0',
    ]
    for (const p of rotFull) points[p] = points[p].rotate(-angle, points.bust)

    points.shoulderSplit0Cp2 = utils.beamsIntersect(
      points.hps,
      points.hpsCp1.rotate(-angle / 6, points.bust),
      points.shoulder,
      points.shoulderSplit0
    )

    points.sideHemCp2 = points.sideHem.shift(
      points.sideSeat.angle(points.sideHips),
      points.sideHem.dist(points.sideWaist) * options.bodyLength
    )
    points.armholeCp1 = points.armhole.shiftFractionTowards(points.sideWaist, options.sideSeamCurve)
    //paths
    if (options.daisyGuides) {
      for (let i = 0; i <= 5; i++) {
        points['bustDartTop' + i] = points.shoulder
          .rotate(angle, points.bust)
          .shiftFractionTowards(points.hps, (i + 1) / 7)
        points['bustDartBottom' + i] = points['bustDartTop' + i].rotate(-angle / 6, points.bust)
      }

      for (let i = 0; i <= 4; i++) {
        points['bustDartTop' + i] = points['bustDartTop' + i].rotate(-angle / 6, points.bust)
        points['bustDartBottom' + i] = points['bustDartBottom' + i].rotate(-angle / 6, points.bust)
      }

      for (let i = 0; i <= 3; i++) {
        points['bustDartTop' + i] = points['bustDartTop' + i].rotate(-angle / 6, points.bust)
        points['bustDartBottom' + i] = points['bustDartBottom' + i].rotate(-angle / 6, points.bust)
      }
      for (let i = 0; i <= 2; i++) {
        points['bustDartTop' + i] = points['bustDartTop' + i].rotate(-angle / 6, points.bust)
        points['bustDartBottom' + i] = points['bustDartBottom' + i].rotate(-angle / 6, points.bust)
      }
      for (let i = 0; i <= 1; i++) {
        points['bustDartTop' + i] = points['bustDartTop' + i].rotate(-angle / 6, points.bust)
        points['bustDartBottom' + i] = points['bustDartBottom' + i].rotate(-angle / 6, points.bust)
      }

      points.bustDartTop0 = points.bustDartTop0.rotate(-angle / 6, points.bust)
      points.bustDartBottom0 = points.bustDartBottom0.rotate(-angle / 6, points.bust)

      paths.daisyGuide = new Path()
        .move(points.cfWaist)
        .line(points.waistDartLeft)
        .line(points.sideWaist)
        .line(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .line(points.bustDartBottom0)
        .line(points.bust)
        .line(points.bustDartTop0)
        .line(points.bustDartBottom1)
        .line(points.bust)
        .line(points.bustDartTop1)
        .line(points.bustDartBottom2)
        .line(points.bust)
        .line(points.bustDartTop2)
        .line(points.bustDartBottom3)
        .line(points.bust)
        .line(points.bustDartTop3)
        .line(points.bustDartBottom4)
        .line(points.bust)
        .line(points.bustDartTop4)
        .line(points.bustDartBottom5)
        .line(points.bust)
        .line(points.bustDartTop5)
        .line(points.hps)
        .curve(points.hpsCp2, points.cfNeckCp1, points.cfNeck)
        .line(points.cfWaist)
        .close()
        .attr('class', 'various lashed')

      // paths.gatherTest = new Path()
      // .move(points.shoulder)
      // .line(points.bustDartBottom0)
      // .line(points.bustDartBottom1)
      // .line(points.bustDartBottom2)
      // .line(points.bustDartBottom3)
      // .line(points.bustDartBottom4)
      // .line(points.bustDartBottom5)
      // .line(points.hps)
    }

    paths.hemBase = options.inbuiltPlacketFacing
      ? paths.mHemBase.reverse().split(points.mFacingBottom)[1].join(paths.hemBase).hide()
      : paths.hemBase.hide()

    paths.sideSeam = new Path()
      .move(points.sideHem)
      .curve(points.sideHemCp2, points.armholeCp1, points.armhole)
      .hide()

    paths.armhole = new Path()
      .move(points.armhole)
      .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
      .curve_(points.armholePitchCp2, points.shoulder)
      .hide()

    paths.shoulder = new Path()
      .move(points.shoulder)
      .line(points.shoulderSplit0)
      .curve(points.shoulderSplit0Cp2, points.hpsCp1, points.hps)
      .hide()

    paths.cfNeck = options.inbuiltPlacketFacing
      ? paths.cfNeck.join(paths.mCfNeck.reverse()).hide()
      : paths.cfNeck.hide()

    paths.seamLeft = options.inbuiltPlacketFacing
      ? new Path().move(points.mHps).line(points.facingShoulder).join(paths.facingCurve).hide()
      : new Path().move(points.placketTopLeft).line(points.placketBottomLeft).hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .join(paths.shoulder)
      .line(points.hps)
      .join(paths.cfNeck)
      .join(paths.seamLeft)
      .close()

    //stores
    store.set('sideSeamLength', paths.sideSeam.length())
    store.set('patchPocketWidth', patchPocketWidth)

    if (complete) {
      //grainline
      points.grainlineFrom = points.cfNeckCp1
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cfHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      points.sideNotch = paths.sideSeam.shiftFractionAlong(0.5)
      macro('sprinkle', {
        snippet: 'notch',
        on: ['sideNotch', 'armholePitch', 'cfNeck'],
      })
      //title
      points.title = new Point(points.bust.x, points.cfHem.y * 0.25)
      macro('title', {
        at: points.title,
        nr: '3',
        title: 'Front',
        cutNr: 2,
        scale: 0.5,
      })
      //logo
      points.logo = new Point(points.bust.x, points.cfHem.y * 0.5)
      macro('logorg', {
        at: points.logo,
        scale: 0.5,
      })
      //scalebox
      points.scalebox = new Point(points.bust.x, points.cfHem.y * 0.75)
      macro('scalebox', {
        at: points.scalebox,
      })
      //buttons & buttonholes
      points.button0 = new Point(points.cfNeck.x, points.highBustAnchor.y)
      const buttonDist = points.button0.dist(points.cfChest)
      for (let i = 1; i <= Math.floor(points.button0.dist(points.cfHem) / buttonDist); i++) {
        points['button' + i] = points.button0.shift(-90, buttonDist * i)
      }
      for (let i = 0; i <= Math.floor(points.button0.dist(points.cfHem) / buttonDist); i++) {
        snippets['button' + i] = new Snippet('button', points['button' + i])
        snippets['buttonhole' + i] = new Snippet('buttonhole', points['button' + i]).attr(
          'data-rotate',
          90
        )
      }
      //pockets
      //foldline
      points.placketNeck = utils.curveIntersectsX(
        points.hps,
        points.hpsCp2,
        points.cfNeckCp1,
        points.cfNeck,
        points.placketBottomRight.x
      )
      paths.placketLine = new Path()
        .move(points.placketNeck)
        .line(points.placketBottomRight)
        .attr('class', 'mark help')
        .attr('data-text', 'Placket Line')
        .attr('data-text-class', 'center')
      if (options.inbuiltPlacketFacing) {
        paths.foldline = new Path()
          .move(points.placketTopLeft)
          .line(points.placketBottomLeft)
          .attr('class', 'mark help')
          .attr('data-text', 'Fold - Line')
          .attr('data-text-class', 'center')
      }
      //gather lines
      macro('banner', {
        path: paths.shoulder.attr('class', 'fabric hidden').unhide(),
        text: 'Gather',
        spaces: 8,
      })
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const placketFacingSa = sa * options.placketFacingSaWidth * 100

        points.saSideHem = points.sideHem
          .shift(points.sideHips.angle(points.sideSeat), hemSa)
          .shift(points.placketBottomRightCp2.angle(points.sideHem), sideSeamSa)

        const rotSa = ['saArmholeCorner', 'saShoulderCorner']
        for (const p of rotSa) points[p] = points[p].rotate(-angle, points.bust)

        points.saPlacketTopLeft = points.placketTopLeft.translate(-sa, -neckSa)

        points.saPlacketBottomLeft = new Point(
          points.saPlacketTopLeft.x,
          points.placketTopLeft.y + hemSa
        )

        points.saFacingShoulder = utils.beamIntersectsX(
          points.mSaHps,
          points.mSaHps.shift(points.hpsCp1.angle(points.hps) * -1, 1),
          points.facingShoulder.x - placketFacingSa
        )

        points.saMFacingBottom = utils.beamIntersectsX(
          paths.hemBase.offset(hemSa).start(),
          paths.hemBase.offset(hemSa).shiftFractionAlong(0.005),
          points.mFacingBottom.x - placketFacingSa
        )

        paths.saLeft = options.inbuiltPlacketFacing
          ? new Path()
              .move(points.mSaHps)
              .line(points.saFacingShoulder)
              .join(paths.facingCurve.offset(placketFacingSa))
              .line(points.saMFacingBottom)
              .hide()
          : new Path().move(points.saPlacketTopLeft).line(points.saPlacketBottomLeft).hide()

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .join(paths.shoulder.offset(sa * options.shoulderSaWidth * 100))
          .line(points.saHps)
          .join(paths.cfNeck.offset(neckSa))
          .join(paths.saLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
