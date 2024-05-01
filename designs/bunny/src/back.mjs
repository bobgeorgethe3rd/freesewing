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
    buttonholeStart: {
      pct: 3.2,
      min: 3,
      max: 5,
      snap: 3.175,
      ...pctBasedOn('hpsToWaistBack'),
      menu: 'plackets',
    },
    buttonholeNum: { count: 5, min: 3, max: 10, menu: 'plackets' },
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
    points.sideSeamCurveEnd = points.armhole.shiftTowards(
      points.sideWaist,
      store.get('sideBustLength')
    )

    let tweak = 1
    let delta
    do {
      points.sideHem = points.sideWaist.shift(270 + sideAngle, store.get('bodyLength') * tweak)
      points.sideHemCp2 = points.sideHem.shiftFractionTowards(
        points.sideWaist,
        options.sideCurve * tweak
      )
      points.sideSeamCurveEndCp1 = points.sideSeamCurveEnd.shiftFractionTowards(
        points.sideWaist,
        options.sideCurve * tweak
      )

      paths.sideSeam = new Path()
        .move(points.sideHem)
        .curve(points.sideHemCp2, points.sideSeamCurveEndCp1, points.sideSeamCurveEnd)
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
      points.backNotch = new Point(drawNeck().end().x, points.cArmhole.y)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['backNotch', 'armholePitch'],
      })
      snippets.sideSeamCurveEnd = new Snippet('notch', points.sideSeamCurveEnd)
      //title
      points.title = new Point(points.dartTip.x * 0.55, points.armhole.y)
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Back',
        scale: 2 / 3,
      })
      //buttonhole
      points.buttonholeStart = points.cbNeck.shift(-90, absoluteOptions.buttonholeStart)
      points.buttonholeWaist = points.cbWaist
      if (points.cbHem.y < points.cbWaist.y) {
        points.buttonholeWaist = points.cbWaist.shift(90, absoluteOptions.buttonholeStart)
      }
      for (let i = 0; i < options.buttonholeNum; i++) {
        points['buttonhole' + i] = points.buttonholeStart.shiftFractionTowards(
          points.buttonholeWaist,
          i / (options.buttonholeNum - 1)
        )
        if (options.placketStyle == 'inbuilt' || options.placketStyle == 'facing') {
          snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i]).attr(
            'data-rotate',
            90
          )
          snippets['button' + i] = new Snippet('button', points['buttonhole' + i])
        }
      }
      const buttonholeDist = points.buttonhole1.y - points.buttonhole0.y
      const skirtButtonholeNum = Math.floor(
        (points.buttonholeWaist.dy(points.cbHem) - absoluteOptions.buttonholeStart) / buttonholeDist
      )
      store.set('skirtButtonholeNum', skirtButtonholeNum)
      if (skirtButtonholeNum > 0) {
        points.buttonholeEnd = points.buttonholeWaist.shift(
          -90,
          buttonholeDist * skirtButtonholeNum
        )
        for (let i = 0; i < skirtButtonholeNum; i++) {
          points['skirtButtonhole' + i] = points.buttonholeWaist.shiftFractionTowards(
            points.buttonholeEnd,
            (i + 1) / skirtButtonholeNum
          )
          if (options.placketStyle == 'inbuilt' || options.placketStyle == 'facing') {
            snippets['skirtButtonhole' + i] = new Snippet(
              'buttonhole',
              points['skirtButtonhole' + i]
            ).attr('data-rotate', 90)
            snippets['skirtButton' + i] = new Snippet('button', points['skirtButtonhole' + i])
          }
        }
      }
      //lines
      if (options.placketStyle == 'inbuilt' || options.placketStyle == 'facing') {
        paths.stitchingLine = new Path()
          .move(points.neckPlacket)
          .line(points.hemPlacket)
          .attr('class', 'mark')
          .attr('data-text', 'Stitching - Line')
          .attr('data-text-class', 'center')
      }
      if (options.placketStyle == 'inbuilt') {
        paths.foldLine = new Path()
          .move(points.neckCorner)
          .line(points.hemCorner)
          .attr('class', 'mark')
          .attr('data-text', 'Fold - Line')
          .attr('data-text-class', 'center')
      }
      if (sa) {
        const hemSa = sa * options.hemWidth * 100
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.necklineSaWidth * 100

        points.saSideHem = points.sideHem
          .shift(points.hemPlacketCp2.angle(points.sideHem) - 90, hemSa)
          .shift(points.hemPlacketCp2.angle(points.sideHem), sideSeamSa)

        points.saShoulderTop = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.shoulder.angle(points.shoulderTop), 1),
          paths.cbNeck.offset(neckSa).start(),
          paths.cbNeck
            .offset(neckSa)
            .start()
            .shift(points.shoulderTop.angle(points.shoulder) + 90, 1)
        )

        points.saHemPlacket = points.hemPlacket.shift(-90, hemSa)

        if (hemSa < sa) {
          points.saHemPlacket = points.hemPlacket.shift(-90, sa)
        }

        points.saMHemPlacket = new Point(points.mHemPlacket.x, points.saHemPlacket.y)
        points.saHemCorner = new Point(points.hemCorner.x, points.saHemPlacket.y)

        const drawHemSa = () => {
          if (options.placketStyle == 'inbuilt') {
            return new Path()
              .move(points.saMHemPlacket)
              .line(points.saHemPlacket)
              .join(paths.hemBase.offset(hemSa))
          }
          if (options.placketStyle == 'facing') {
            return new Path()
              .move(points.saHemCorner)
              .line(points.saHemPlacket)
              .join(paths.hemBase.offset(hemSa))
          }
          if (options.placketStyle == 'separate') {
            return drawHemBase().offset(hemSa)
          }
        }

        const drawNeckSa = () => {
          if (options.placketStyle == 'inbuilt') {
            return paths.cbNeck
              .split(points.neckPlacket)[0]
              .offset(neckSa)
              .join(drawNeck().split(points.neckPlacket)[1].offset(sa))
          }
          if (options.placketStyle == 'facing') {
            return paths.cbNeck
              .split(points.neckPlacket)[0]
              .offset(neckSa)
              .join(drawNeck().split(points.neckPlacket)[1].offset(sa))
          }
          if (options.placketStyle == 'separate') {
            return paths.cbNeck.split(points.neckPlacket)[0].offset(neckSa)
          }
        }

        points.saNeckLeft = new Point(drawNeck().end().x - sa, drawNeckSa().end().y)
        points.saHemLeft = new Point(points.saNeckLeft.x, drawHemSa().start().y)

        paths.sa = drawHemSa()
          .line(points.saSideHem)
          .join(paths.sideSeam.offset(sideSeamSa))
          .line(points.saArmholeCorner)
          .join(paths.armhole.offset(sa * options.armholeSaWidth * 100))
          .line(points.saShoulderCorner)
          .line(points.saShoulderTop)
          .join(drawNeckSa())
          .line(points.saNeckLeft)
          .line(points.saHemLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
