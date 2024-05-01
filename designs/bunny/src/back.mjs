import { pctBasedOn } from '@freesewing/core'
import { back as backDaisy } from '@freesewing/daisy'
import { sharedFront } from './sharedFront.mjs'
import { pluginMirror } from '@freesewing/plugin-mirror'

export const back = {
  name: 'bunny.back',
  from: backDaisy,
  after: sharedFront,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    backNeckCurve: { pct: 100, min: 0, max: 100, menu: 'style' },
    backNeckCurveDepth: { pct: 100, min: 0, max: 100, menu: 'style' },
    backNeckDepth: { pct: 100, min: 50, max: 100, menu: 'style' },
    //Plackets
    placketStyle: {
      dflt: 'inbuilt',
      list: ['inbuilt', 'facing', 'separate'],
      menu: 'plackets',
    },
    placketWidth: {
      pct: 3.7,
      min: 1,
      max: 6,
      snap: 5,
      ...pctBasedOn('waist'),
      menu: 'plackets',
    },
  },
  plugins: [pluginMirror],
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
    //remove paths & snippets
    const keepPaths = ['armhole', 'seam']
    for (const name in paths) {
      if (keepPaths.indexOf(name) === -1) delete paths[name]
    }
    if (options.daisyGuide) {
      paths.daisyGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //macros
    macro('title', false)
    //measures
    const sideAngle = store.get('sideAngle')
    const placketWidth = absoluteOptions.placketWidth
    //let's begin
    points.sideCurveEnd = points.armhole.shiftTowards(points.sideWaist, store.get('sideBustLength'))

    let tweak = 1
    let delta
    do {
      points.sideHem = points.sideWaist.shift(270 + sideAngle, store.get('bodyLength') * tweak)
      points.sideHemCp2 = points.sideHem.shiftFractionTowards(points.sideWaist, (2 / 3) * tweak)

      paths.sideSeam = new Path()
        .move(points.sideHem)
        .curve(points.sideHemCp2, points.sideWaist, points.sideCurveEnd)
        .line(points.armhole)
        .hide()

      delta = paths.sideSeam.length() - store.get('sideSeamLength')
      if (delta > 0) tweak = tweak * 0.99
      else tweak = tweak * 1.01
    } while (Math.abs(delta) > 1)

    points.hemPlacketCp2 = utils.beamsIntersect(
      points.sideHem,
      points.sideHem.shift(180 + sideAngle, 1),
      new Point((points.sideHem.x + placketWidth * 0.5) / 2, points.sideHem.y),
      new Point((points.sideHem.x + placketWidth * 0.5) / 2, points.sideHem.y * 1.1)
    )
    points.cbHem = new Point(points.cbWaist.x, points.hemPlacketCp2.y)

    if (points.cbHem.y < points.cbWaist.y) {
      points.cbHem = points.cbWaist
      points.hemPlacketCp2 = new Point(points.hemPlacketCp2.x, points.cbWaist.y)
    }
    points.hemPlacket = points.cbHem.shift(0, placketWidth * 0.5)

    points.hemCorner = points.cbHem.shift(180, placketWidth * 0.5)
    //neck
    points.shoulderTop = points.shoulder.shiftFractionTowards(points.hps, options.shoulderWidth)
    points.cbNeck = points.cbNeck.shiftFractionTowards(
      utils.beamIntersectsX(
        points.shoulderTop,
        points.shoulderTop.shift(points.hps.angle(points.cbNeck), 1),
        points.cbNeck.x
      ),
      options.backNeckDepth
    )

    points.cbNeckCp1 = points.cbNeck.shiftFractionTowards(
      utils.beamsIntersect(
        points.cbNeck,
        points.cbNeck.shift(
          points.cbNeck.angle(points.shoulderTop) * (1 - options.backNeckCurve),
          1
        ),
        points.shoulderTop,
        points.hps.rotate(90, points.shoulderTop)
      ),
      options.backNeckCurveDepth
    )

    points.neckCorner = new Point(points.hemCorner.x, points.cbNeck.y)

    paths.cbNeck = new Path()
      .move(points.shoulderTop)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .line(points.neckCorner)
      .hide()

    points.neckPlacket = utils.lineIntersectsCurve(
      points.hemPlacket,
      new Point(points.hemPlacket.x, points.hps.y),
      points.shoulderTop,
      points.cbNeckCp1,
      points.cbNeck,
      points.cbNeck
    )

    paths.placketNeck = paths.cbNeck.split(points.neckPlacket)[1].hide()

    macro('mirror', {
      mirror: [points.neckCorner, points.hemCorner],
      paths: ['placketNeck'],
      points: ['neckPlacket', 'hemPlacket'],
      prefix: 'm',
    })

    //paths
    const drawNeck = () => {
      if (options.placketStyle == 'inbuilt') {
        return paths.cbNeck.join(paths.mPlacketNeck.reverse())
      }
      if (options.placketStyle == 'facing') {
        return paths.cbNeck
      }
      if (options.placketStyle == 'separate') {
        return paths.cbNeck.split(points.neckPlacket)[0]
      }
    }

    paths.hemBase = new Path()
      .move(points.hemPlacket)
      .curve_(points.hemPlacketCp2, points.sideHem)
      .hide()

    const drawHemBase = () => {
      if (options.placketStyle == 'inbuilt') {
        return new Path().move(points.mHemPlacket).line(points.hemPlacket).join(paths.hemBase)
      }
      if (options.placketStyle == 'facing') {
        return new Path().move(points.hemCorner).line(points.hemPlacket).join(paths.hemBase)
      }
      if (options.placketStyle == 'separate') {
        return paths.hemBase
      }
    }

    paths.seam = drawHemBase()
      .join(paths.sideSeam)
      .join(paths.armhole)
      .line(points.shoulderTop)
      .join(drawNeck())
      .line(drawHemBase().start())
      .close()

    if (complete) {
      //grainline
      points.grainlineFrom = new Point(points.cbNeckCp1.x / 3, points.cbNeck.y)
      points.grainlineTo = new Point(points.grainlineFrom.x, points.cbHem.y)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      if (options.placketStyle == 'inbuilt' || options.placketStyle == 'facing') {
        paths.stitchingLine = new Path()
          .move(points.neckPlacket)
          .line(points.hemPlacket)
          .attr('class', 'mark')
          .attr('data-text', 'Stitching - Line')
          .attr('data-text-class', 'center')
        // for (let i = 0; i < options.bodiceButtonholeNum; i++) {
        // points['buttonhole' + i] = points.bodiceButtonholeStart.shiftFractionTowards(
        // points.bodiceButtonholeEnd,
        // i / (options.bodiceButtonholeNum - 1)
        // )
        // snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i]).attr(
        // 'data-rotate',
        // 90
        // )
        // snippets['button' + i] = new Snippet('button', points['buttonhole' + i])
        // }
        // store.set('buttonholeDist', points.buttonhole1.y - points.buttonhole0.y)
      }
      if (options.placketStyle == 'inbuilt') {
        paths.foldLine = new Path()
          .move(points.neckCorner)
          .line(points.hemCorner)
          .attr('class', 'mark')
          .attr('data-text', 'Fold - Line')
          .attr('data-text-class', 'center')
      }
      //title
      points.title = new Point(points.dartTip.x * 0.55, points.armhole.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Back',
        scale: 2 / 3,
      })
      if (sa) {
      }
    }

    return part
  },
}
