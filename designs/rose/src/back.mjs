import { pctBasedOn } from '@freesewing/core'
import { pluginMirror } from '@freesewing/plugin-mirror'
import { back as backDaisy } from '@freesewing/daisy'
import { backArmholePitch } from '@freesewing/peach'
import { front } from './front.mjs'

export const back = {
  name: 'rose.back',
  from: backDaisy,
  after: front,
  hide: {
    from: true,
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
    bodiceButtonholeNum: { count: 5, min: 3, max: 10, menu: 'plackets' },
    placketStyle: {
      dflt: 'none',
      list: ['separate', 'inbuilt', 'facing', 'none'],
      menu: 'plackets',
    },
    placketWidth: {
      pct: 3.7,
      min: 3,
      max: 4.5,
      snap: 3.175,
      ...pctBasedOn('waist'),
      menu: 'plackets',
    },
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Peach
  },
  plugins: [pluginMirror],
  draft: (sh) => {
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
    //stores before altertions
    store.set('scyeBackWidth', points.armhole.dist(points.shoulder))
    store.set(
      'scyeBackDepth',
      points.armhole.dist(points.shoulder) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.shoulder) - (points.shoulder.angle(points.hps) - 90)
          )
        )
    )
    store.set(
      'backArmholeLength',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .length()
    )
    store.set(
      'backArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .length()
    )

    if (options.bodiceStyle == 'dart') {
      backDaisy.draft(sh)
    } else {
      backArmholePitch.draft(sh)
    }

    if (options.bodiceStyle == 'dart' && options.daisyGuides) {
      paths.daisyGuide = paths.seam.clone().attr('class', 'various lashed')
    }

    //let's begin
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
    paths.cbNeck = new Path()
      .move(points.shoulderTop)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .hide()
    //plackets
    const placketWidth = absoluteOptions.placketWidth
    points.bodicePlacketWaistRight = points.cbWaist.shift(0, placketWidth / 2)
    points.bodicePlacketWaistLeft = points.cbWaist.shift(180, placketWidth / 2)
    points.bodicePlacketNeckLeft = new Point(points.bodicePlacketWaistLeft.x, points.cbNeck.y)
    const placketNeckIntersect = utils.curveIntersectsX(
      points.shoulderTop,
      points.shoulderTop,
      points.cbNeckCp1,
      points.cbNeck,
      points.bodicePlacketWaistRight.x
    )
    if (placketNeckIntersect) {
      points.bodicePlacketNeckRight = placketNeckIntersect
    } else {
      points.bodicePlacketNeckRight = paths.cbNeck
        .offset(0.001)
        .intersectsX(points.bodicePlacketWaistRight.x)[0] //idk it needed the offset to even work at all
    }
    points.bodicePlacketArmholeRight = new Point(
      points.bodicePlacketWaistRight.x,
      points.cArmhole.y
    )
    points.bodicePlacketArmholeLeft = new Point(points.bodicePlacketWaistLeft.x, points.cArmhole.y)
    points.bodiceButtonholeStart = points.cbNeck.shiftTowards(
      points.cbWaist,
      absoluteOptions.buttonholeStart
    )
    points.bodiceButtonholeEnd = points.cbWaist.shiftTowards(
      points.cbNeck,
      absoluteOptions.buttonholeStart
    )
    //paths
    paths.placketNeck = paths.cbNeck
      .split(points.bodicePlacketNeckRight)[1]
      .line(points.bodicePlacketNeckLeft)
      .hide()

    macro('mirror', {
      mirror: [points.bodicePlacketWaistLeft, points.bodicePlacketNeckLeft],
      paths: ['placketNeck'],
      points: ['bodicePlacketWaistRight', 'bodicePlacketArmholeRight', 'bodicePlacketNeckRight'],
      prefix: 'm',
    })

    const drawNeck = () => {
      if (options.closurePosition == 'back' && options.placketStyle != 'none') {
        if (options.placketStyle == 'separate') {
          return paths.cbNeck.split(points.bodicePlacketNeckRight)[0]
        }
        if (options.placketStyle == 'inbuilt') {
          return paths.cbNeck.line(points.bodicePlacketNeckLeft).join(paths.mPlacketNeck.reverse())
        }
        if (options.placketStyle == 'facing') {
          return paths.cbNeck.line(points.bodicePlacketNeckLeft)
        }
      } else {
        return paths.cbNeck
      }
    }
    const drawLeft = () => {
      if (options.closurePosition == 'back' && options.placketStyle != 'none') {
        if (options.placketStyle == 'separate') {
          return new Path().move(points.bodicePlacketNeckRight).line(points.bodicePlacketWaistRight)
        }
        if (options.placketStyle == 'facing') {
          return new Path().move(points.bodicePlacketNeckLeft).line(points.bodicePlacketWaistLeft)
        }
        if (options.placketStyle == 'inbuilt') {
          return new Path()
            .move(points.mBodicePlacketNeckRight)
            .line(points.mBodicePlacketWaistRight)
        }
      } else {
        return new Path().move(points.cbNeck).line(points.cbWaist)
      }
    }

    paths.seam = paths.seam
      .split(points.bodicePlacketWaistRight)[1]
      .split(points.shoulderTop)[0]
      .join(drawNeck())
      .join(drawLeft())
      .line(points.bodicePlacketWaistRight)
      .close()
    //stores
    if (options.closurePosition == 'back' && options.placketStyle != 'none') {
      store.set(
        'waistBack',
        (points.sideWaist.dist(points.dartBottomRight) +
          points.dartBottomLeft.dist(points.bodicePlacketWaistRight)) *
          4
      )
    } else {
      store.set(
        'waistBack',
        (points.sideWaist.dist(points.dartBottomRight) +
          points.dartBottomLeft.dist(points.cbWaist)) *
          4
      )
    }
    store.set('storedWaist', (store.get('waistFront') + store.get('waistBack')) / 2)
    store.set('placketWidth', placketWidth)
    if (complete) {
      //grainline
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck
        points.cutOnFoldTo = points.cbWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.bodicePlacketNeckRight.shift(
          0,
          points.bodicePlacketNeckRight.dx(points.shoulderTop) * 0.14
        )
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      if (options.closurePosition == 'back' && options.placketStyle != 'none') {
        delete snippets['cArmhole-bnotch']
        if (options.placketStyle == 'separate') {
          snippets.bodicePlacketArmholeRight = new Snippet(
            'bnotch',
            points.bodicePlacketArmholeRight
          )
        }
        if (options.placketStyle == 'inbuilt') {
          snippets.mBodicePlacketArmholeRight = new Snippet(
            'bnotch',
            points.mBodicePlacketArmholeRight
          )
        }
        if (options.placketStyle == 'facing') {
          snippets.bodicePlacketArmholeLeft = new Snippet('bnotch', points.bodicePlacketArmholeLeft)
        }
      }
      //title
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Back',
        scale: 0.5,
      })
      //lines and buttonholes
      if (options.closurePosition == 'back') {
        if (options.placketStyle == 'inbuilt' || options.placketStyle == 'facing') {
          paths.stitchingLine = new Path()
            .move(points.bodicePlacketNeckRight)
            .line(points.bodicePlacketWaistRight)
            .attr('class', 'mark')
            .attr('data-text', 'Stitching - Line')
            .attr('data-text-class', 'center')
          for (let i = 0; i < options.bodiceButtonholeNum; i++) {
            points['buttonhole' + i] = points.bodiceButtonholeStart.shiftFractionTowards(
              points.bodiceButtonholeEnd,
              i / (options.bodiceButtonholeNum - 1)
            )
            snippets['buttonhole' + i] = new Snippet('buttonhole', points['buttonhole' + i]).attr(
              'data-rotate',
              90
            )
            snippets['button' + i] = new Snippet('button', points['buttonhole' + i])
          }
          store.set('buttonholeDist', points.buttonhole1.y - points.buttonhole0.y)
        }
        if (options.placketStyle == 'inbuilt') {
          paths.foldLine = new Path()
            .move(points.bodicePlacketNeckLeft)
            .line(points.bodicePlacketWaistLeft)
            .attr('class', 'mark')
            .attr('data-text', 'Fold - Line')
            .attr('data-text-class', 'center')
        }
      }
      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100
        let cbSa
        if (options.closurePosition == 'back') {
          cbSa = sa * options.closureSaWidth * 100
        } else {
          cbSa = sa * options.cbSaWidth * 100
        }
        let saShoulderAnchor
        if (options.backNeckCurve == 0) {
          saShoulderAnchor = points.cbNeck
        } else {
          saShoulderAnchor = points.cbNeckCp1
        }

        points.saShoulderTop = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saHps,
          points.shoulderTop.shiftTowards(saShoulderAnchor, neckSa).rotate(-90, points.shoulderTop),
          saShoulderAnchor.shiftTowards(points.shoulderTop, neckSa).rotate(90, saShoulderAnchor)
        )

        points.saCbNeckEnd = paths.cbNeck.offset(neckSa).end()

        const saCbNeckIntersect = utils.beamIntersectsX(
          points.cbNeckCp1.shift(
            points.cbNeck.angle(points.shoulderTop) * (1 - options.backNeckCurve) + 90,
            neckSa
          ),
          points.saCbNeckEnd,
          points.cbNeck.x - cbSa
        )

        if (saCbNeckIntersect.x > points.saCbNeckEnd.x) {
          points.saCbNeck = points.cbNeck.shift(180, cbSa)
        } else {
          points.saCbNeck = saCbNeckIntersect
        }

        points.saBodicePlacketWaistRight = points.bodicePlacketWaistRight.translate(-sa, sa)
        points.saBodicePlacketNeckRight = new Point(
          points.saBodicePlacketWaistRight.x,
          drawNeck().offset(neckSa).end().y
        )

        points.saMBodicePlacketWaistRight = points.mBodicePlacketWaistRight.translate(-sa, sa)
        points.saMBodicePlacketNeckRight = new Point(
          points.saMBodicePlacketWaistRight.x,
          paths.mPlacketNeck.reverse().offset(neckSa).end().y
        )

        points.saBodicePlacketWaistLeft = points.bodicePlacketWaistLeft.translate(-sa, sa)
        points.saBodicePlacketNeckLeft = points.bodicePlacketNeckLeft.translate(-sa, -sa)

        const drawSaLeft = () => {
          if (options.closurePosition == 'back' && options.placketStyle != 'none') {
            if (options.placketStyle == 'separate') {
              return new Path().move(points.saBodicePlacketNeckRight)
            }
            if (options.placketStyle == 'inbuilt') {
              return new Path()
                .move(points.saMBodicePlacketNeckRight)
                .line(points.saMBodicePlacketWaistRight)
            }
            if (options.placketStyle == 'facing') {
              return new Path()
                .move(points.saBodicePlacketNeckLeft)
                .line(points.saBodicePlacketWaistLeft)
            }
          } else {
            return new Path().move(points.saCbNeck).line(points.saCbWaist)
          }
        }

        paths.sa = paths.sa
          .split(points.saBodicePlacketWaistRight)[1]
          .split(points.saShoulderTop)[0]
          .join(drawNeck().offset(neckSa))
          .join(drawSaLeft())
          .line(points.saBodicePlacketWaistRight)
          .attr('class', 'fabric sa')
          .close()
      }
    }

    return part
  },
}
