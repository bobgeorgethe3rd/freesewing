import { frontBase } from '@freesewing/daisy'
import { front as frontDaisy } from '@freesewing/daisy'
import { frontArmholePitch } from '@freesewing/peach'

export const front = {
  name: 'rose.front',
  from: frontBase,
  hide: {
    from: true,
  },
  options: {
    //Imported
    ...frontDaisy.options,
    //Constants
    bustDartFraction: 0.5, //Locked For Rose
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    //Style
    bodiceStyle: { dflt: 'dart', list: ['dart', 'seam'], menu: 'style' },
    frontNeckDepth: { pct: 14.1, min: -6, max: 45, menu: 'style' },
    shoulderWidth: { pct: 50, min: (1 / 3) * 100, max: (2 / 3) * 100, menu: 'style' }, //37.6
    frontNeckCurve: { pct: 100, min: 0, max: 100, menu: 'style' },
    frontNeckCurveDepth: { pct: 100, min: 0, max: 100, menu: 'style' },
    //Darts
    bustDartPlacement: {
      dflt: 'bustside',
      list: ['waist', 'french', 'side', 'bustside', 'underarm', 'armholePitch'],
      menu: 'darts',
    }, //Altered for Rose
    //Construction
    princessSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    cfSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' }, //Altered for Rose
    closureSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' }, //Altered for Rose
    closurePosition: {
      dflt: 'back',
      list: ['front', 'sideLeft', 'sideRight', 'back'],
      menu: 'construction',
    }, //Altered for Rose
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

    store.set('scyeFrontWidth', points.armhole.dist(points.shoulder))
    store.set(
      'scyeFrontDepth',
      points.armhole.dist(points.shoulder) *
        Math.sin(
          utils.deg2rad(
            points.armhole.angle(points.shoulder) - (points.shoulder.angle(points.hps) - 90)
          )
        )
    )
    store.set(
      'frontArmholeLength',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .curve_(points.armholePitchCp2, points.shoulder)
        .length()
    )
    store.set(
      'frontArmholeToArmholePitch',
      new Path()
        .move(points.armhole)
        .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
        .length()
    )

    store.set('sideWaistFront', points.sideWaist.dist(points.waistDartRight))
    store.set(
      'waistFront',
      (store.get('sideWaistFront') + points.waistDartLeft.dist(points.cfWaist)) * 4
    )

    if (options.bodiceStyle == 'dart') {
      frontDaisy.draft(sh)
    } else {
      frontArmholePitch.draft(sh)
    }

    if (options.bodiceStyle == 'dart' && options.daisyGuides) {
      paths.daisyGuide = paths.seam.clone().attr('class', 'various lashed')
    }
    //let's begin
    points.cfNeck = points.cfNeck.shiftFractionTowards(points.cfChest, options.frontNeckDepth)
    points.shoulderTop = points.shoulder.shiftFractionTowards(points.hps, options.shoulderWidth)

    points.cfNeckCp1 = points.cfNeck.shiftFractionTowards(
      utils.beamsIntersect(
        points.cfNeck,
        points.cfNeck.shift(
          points.cfNeck.angle(points.shoulderTop) * (1 - options.frontNeckCurve),
          1
        ),
        points.shoulderTop,
        points.hps.rotate(90, points.shoulderTop)
      ),
      options.frontNeckCurveDepth
    )

    //paths
    paths.cfNeck = new Path()
      .move(points.shoulderTop)
      ._curve(points.cfNeckCp1, points.cfNeck)
      .hide()
    paths.seam = paths.seam
      .split(points.shoulderTop)[0]
      .join(paths.cfNeck)
      .line(points.cfWaist)
      .close()

    if (complete) {
      //grainline
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        points.cutOnFoldFrom = points.cfNeck
        points.cutOnFoldTo = points.cfWaist
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cfWaist.shiftFractionTowards(points.waistDartLeft, 0.15)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfNeck.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //title
      points.title = points.cfChest.shiftFractionTowards(points.bust, 0.5)
      macro('title', {
        at: points.title,
        nr: '1',
        title: 'Front',
        scale: 0.5,
      })
      if (sa) {
        const neckSa = sa * options.neckSaWidth * 100
        let cfSa
        if (options.closurePosition == 'front') {
          cfSa = sa * options.closureSaWidth * 100
        } else {
          cfSa = sa * options.cfSaWidth * 100
        }

        let saShoulderAnchor
        if (options.frontNeckCurve == 0) {
          saShoulderAnchor = points.cfNeck
        } else {
          saShoulderAnchor = points.cfNeckCp1
        }

        points.saShoulderTop = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saHps,
          points.shoulderTop.shiftTowards(saShoulderAnchor, neckSa).rotate(-90, points.shoulderTop),
          saShoulderAnchor.shiftTowards(points.shoulderTop, neckSa).rotate(90, saShoulderAnchor)
        )

        points.saCfNeckEnd = paths.cfNeck.offset(neckSa).end()

        const saCfNeckIntersect = utils.beamIntersectsX(
          points.cfNeckCp1.shift(
            points.cfNeck.angle(points.shoulderTop) * (1 - options.frontNeckCurve) + 90,
            neckSa
          ),
          points.saCfNeckEnd,
          points.cfNeck.x - cfSa
        )

        if (saCfNeckIntersect.x > points.saCfNeckEnd.x) {
          points.saCfNeck = points.cfNeck.shift(180, cfSa)
        } else {
          points.saCfNeck = saCfNeckIntersect
        }

        paths.sa = paths.sa
          .split(points.saShoulderTop)[0]
          .join(paths.cfNeck.offset(neckSa))
          .line(points.saCfNeck)
          .line(points.saCfWaist)
          .attr('class', 'fabric sa')
          .close()
      }
    }

    return part
  },
}
