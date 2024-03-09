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
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Peach
  },
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
      log,
    } = sh

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

    store.set(
      'waistBack',
      (points.sideWaist.dist(points.dartBottomRight) + points.dartBottomLeft.dist(points.cbWaist)) *
        4
    )
    store.set('storedWaist', (store.get('waistFront') + store.get('waistBack')) / 2)

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
    //paths
    paths.cbNeck = new Path()
      .move(points.shoulderTop)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .hide()
    paths.seam = paths.seam
      .split(points.shoulderTop)[0]
      .join(paths.cbNeck)
      .line(points.cbWaist)
      .close()
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
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.25)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbWaist.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //title
      macro('title', {
        at: points.title,
        nr: '2',
        title: 'Back',
        scale: 0.5,
      })
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

        paths.sa = paths.sa
          .split(points.saShoulderTop)[0]
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbNeck)
          .line(points.saCbWaist)
          .attr('class', 'fabric sa')
          .close()
      }
    }

    return part
  },
}
