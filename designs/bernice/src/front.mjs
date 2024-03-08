import { pluginLogoRG } from '@freesewing/plugin-logorg'
import { frontBase as frontBaseDaisy } from '@freesewing/daisy'
import { front as frontDaisy } from '@freesewing/daisy'
import { frontFrenchDart } from '@freesewing/daisy'

export const front = {
  name: 'bernice.front',
  from: frontDaisy,
  hide: {
    from: true,
    inherited: true,
  },
  plugins: [pluginLogoRG],
  options: {
    //Imported
    // ...frontDaisy.options,
    //Constant
    // bustDartPlacement: 'bustSide', //Locked for Bernice
    waistDartLength: 1, //Locked for Bernice
    // bustDartFraction: 0.5, //Locked for Bernice
    closurePosition: 'front', //Locked for Bernice
    //Fit
    daisyGuides: { bool: false, menu: 'fit' },
    seatEase: { pct: 5, min: 0, max: 20, menu: 'fit' },
    //Style
    armholeDrop: { pct: 50, min: 0, max: 100, menu: 'style' },
    lengthBonus: { pct: -2, min: -20, max: 50, menu: 'style' },
    ruffleWidth: { pct: 25.1, min: 20, max: 30, menu: 'style' },
    shoulderPitch: { pct: 58.3, min: 30, max: 60, menu: 'style' },
    frontShoulderDepth: { pct: 100, min: 0, max: 100, menu: 'style' },
    frontNeckDepth: { pct: 50, min: 0, max: 100, menu: 'style' },
    frontNeckCurve: { pct: 50, min: 0, max: 100, menu: 'style' },
    frontNeckCurveDepth: { pct: 50, min: 0, max: 100, menu: 'style' },
    //Darts
    bustDartPlacement: {
      dflt: 'french',
      list: ['french', 'side', 'bustSide', 'underarm'],
      menu: 'darts',
    },
    //Pockets
    pocketsBool: { bool: true, menu: 'pockets' },
    pocketOpening: { pct: 6.4, min: 5, max: 10, menu: 'pockets' },
    pocketOpeningLength: { pct: 100, min: 40, max: 100, menu: 'pockets' },
    pocketLength: { pct: 53.8, min: 50, max: 60, menu: 'pockets' },
    pearPocketDepth: { pct: 32.5, min: 25, max: 40, menu: 'pockets.pearPockets' },
    //Construction
    sideSeamSaWidth: { pct: 1, min: 1, max: 3, menu: 'construction' },
    neckSaWidth: { pct: 1, min: 0, max: 3, menu: 'construction' },
  },
  measurements: ['hips', 'seat', 'wrist', 'waistToHips', 'waistToSeat', 'waistToFloor'],
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
    const keepThese = 'seam'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    if (options.daisyGuides) {
      paths.guide = paths.seam.attr('class', 'various lashed')
    }
    delete paths.seam
    for (let i in snippets) delete snippets[i]
    //removing macros not required from Daisy
    macro('title', false)
    macro('scalebox', false)
    //measurements
    const bustDartAngle = store.get('bustDartAngle')
    const waistDartAngle =
      points.bust.angle(points.waistDartRight) - points.bust.angle(points.waistDartLeft)
    const frontRatio = 1 - measurements.waistBack / measurements.waist
    const hips = measurements.hips * (1 + options.seatEase) * frontRatio * 0.5
    const seat = measurements.seat * (1 + options.seatEase) * frontRatio * 0.5
    const skirtLength =
      (measurements.waistToFloor * (1 + options.lengthBonus) - measurements.waistToSeat) *
      (1 - options.ruffleWidth)
    //let's begin
    // points.bustDartTop = utils.beamsIntersect(
    // points.bust,
    // points.bustDartTop,
    // points.armhole,
    // points.sideWaistInitial.rotate(-waistDartAngle / 2, points.armhole)
    // )
    // points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
    // points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)
    // points.bustDartTip = points.bustDartMid.shiftFractionTowards(
    // points.bust,
    // options.bustDartLength
    // )
    // points.sideWaist = utils.beamsIntersect(
    // points.armhole.rotate(-bustDartAngle, points.bust),
    // points.bustDartBottom,
    // points.waistDartRight,
    // points.sideWaist
    // )
    // const rot = ['bustDartBottom', 'sideWaist', 'waistDartRight']
    // for (const p of rot) points[p] = points[p].rotate(-bustDartAngle, points.bust)
    // points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)
    // points.bustDartTip = points.bustDartMid.shiftFractionTowards(
    // points.bust,
    // options.bustDartLength
    // )
    // points.sideWaist = utils.beamsIntersect(
    // points.bustDartBottom,
    // points.sideWaist.rotate(-waistDartAngle / 2, points.bustDartBottom),
    // points.waistDartRight,
    // points.sideWaist
    // )
    //below the waist
    if (points.cfWaist.y < points.sideWaist.y) {
      points.cfWaistAnchor = new Point(points.cfWaist.x, points.sideWaist.y)
    } else {
      points.cfWaistAnchor = points.cfWaist
    }

    let seatDist
    if ((hips || points.sideWaist.x) > seat) {
      if (hips > points.sideWaist.x) {
        seatDist = points.sideWaist.x * 1.25
      } else {
        seatDist = hips
      }
    } else {
      seatDist = seat
    }

    points.cfHips = points.cfWaistAnchor.shift(-90, measurements.waistToHips)
    points.cfSeat = points.cfWaistAnchor.shift(-90, measurements.waistToSeat)
    points.cfBottom = points.cfSeat.shift(-90, skirtLength)
    points.sideSeat = points.cfSeat.shift(0, seat)
    points.sideBottom = new Point(points.sideSeat.x, points.cfBottom.y)
    points.sideSeatCp2 = new Point(points.sideSeat.x, points.cfHips.y)
    points.sideWaistCp1 = utils.beamIntersectsY(
      points.armhole.rotate(-bustDartAngle, points.bust),
      points.sideWaist,
      points.cfHips.y
    )

    points.armholeDrop = points.armhole.shiftFractionTowards(points.sideChest, options.armholeDrop)

    if (points.bustDartTop.y < points.armholeDrop.y) {
      points.bustDartTop = points.armholeDrop
      points.bustDartBottom = points.bustDartTop.rotate(-bustDartAngle, points.bust)
      points.bustDartMid = points.bustDartBottom.shiftFractionTowards(points.bustDartTop, 0.5)
      points.bustDartTip = points.bustDartMid.shiftFractionTowards(
        points.bust,
        options.bustDartLength
      )
      if (points.bustDartMid.y < points.bust.y) {
        points.bustDartEdge = utils.beamsIntersect(
          points.sideWaist,
          points.bustDartBottom,
          points.bust,
          points.bustDartMid
        )
      } else {
        points.bustDartEdge = utils.beamsIntersect(
          points.armhole,
          points.bustDartTop,
          points.bust,
          points.bustDartMid
        )
      }
    }

    points.shoulderPitchMin = points.hps.shiftFractionTowards(
      points.shoulder,
      options.shoulderPitch
    )
    points.shoulderPitchMax = new Point(points.shoulderPitchMin.x, points.armholePitch.y)
    points.shoulderPitch = points.shoulderPitchMin.shiftFractionTowards(
      points.shoulderPitchMax,
      options.frontShoulderDepth
    )

    points.armholeDropCp2 = new Point(
      (points.shoulderPitch.x + points.armholeDrop.x) / 2,
      points.armholeDrop.y
    )
    points.armholeDropCp2 = new Point(points.armholePitch.x, points.armholeDrop.y)

    points.cfTopMin = new Point(points.cfNeck.x, points.shoulderPitch.y)
    if (points.cfTopMin.y < points.cfNeck.y) {
      points.cfTopMin = points.cfNeck
    }
    points.cfTopMid = utils.beamIntersectsX(points.sideWaist, points.bust, points.cfNeck.x)

    if (options.frontNeckDepth < 0.5) {
      points.cfTop = points.cfTopMin.shiftFractionTowards(
        points.cfTopMid,
        2 * options.frontNeckDepth
      )
    } else {
      points.cfTop = points.cfTopMid.shiftFractionTowards(
        points.cArmhole,
        2 * options.frontNeckDepth - 1
      )
    }

    points.shoulderPitchCp2Target = utils.beamIntersectsX(
      points.cfTop,
      points.cfTop.shift(
        points.cfTop.angle(points.shoulderPitch) * (1 - options.frontNeckCurve),
        1
      ),
      points.shoulderPitch.x
    )
    points.shoulderPitchCp2 = points.cfTop.shiftFractionTowards(
      points.shoulderPitchCp2Target,
      options.frontNeckCurveDepth
    )
    //paths
    paths.skirtRight = new Path()
      .move(points.sideBottom)
      .line(points.sideSeat)
      .curve(points.sideSeatCp2, points.sideWaistCp1, points.sideWaist)
      .hide()
    paths.seamRight = paths.skirtRight.clone().line(points.bustDartBottom).hide()

    paths.seamNeckRight = new Path()
      .move(points.armholeDrop)
      .curve_(points.armholeDropCp2, points.shoulderPitch)
      .hide()

    paths.seamNeckLeft = new Path()
      .move(points.shoulderPitch)
      .curve_(points.shoulderPitchCp2, points.cfTop)
      .hide()

    paths.seamBase = new Path()
      .move(points.cfBottom)
      .line(points.sideBottom)
      .join(paths.seamRight)
      .line(points.bustDartTip)
      .line(points.bustDartTop)
      .line(points.armholeDrop)
      .join(paths.seamNeckRight)
      .join(paths.seamNeckLeft)
      .hide()

    paths.dart = new Path()
      .move(points.bustDartBottom)
      .line(points.bustDartEdge)
      .line(points.bustDartTop)
      .hide()

    macro('mirror', {
      mirror: [points.cfTop, points.cfBottom],
      paths: ['seamBase', 'dart'],
      prefix: 'm',
    })

    paths.seam = paths.seamBase.join(paths.mSeamBase.reverse())
    //stores
    store.set('skirtLength', skirtLength)
    store.set('seat', (seat / frontRatio) * (1 - frontRatio))
    store.set('toHips', points.cfHips.y - points.sideWaist.y)
    store.set('toSeat', points.sideSeat.y - points.sideWaist.y)
    store.set('armholeDrop', points.armhole.dist(points.armholeDrop))
    store.set('ruffleWidth', (skirtLength / (1 - options.ruffleWidth)) * options.ruffleWidth)
    store.set('insertSeamLength', paths.skirtRight.length())
    store.set('anchorSeamLength', points.sideWaist.x)
    if (complete) {
      //grainline
      points.grainlineMid = points.cfSeat.shiftFractionTowards(points.cfBottom, 0.5)
      points.grainlineFrom = points.grainlineMid.translate(-seat, -seat)
      points.grainlineTo = points.grainlineFrom.rotate(180, points.grainlineMid)
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      if (options.pocketsBool) {
        const pocketOpening = measurements.waistToFloor * options.pocketOpening
        const pocketOpeningLength = measurements.wrist * options.pocketOpeningLength
        points.pocketOpeningTop = paths.skirtRight.reverse().shiftAlong(pocketOpening)
        points.pocketOpeningBottom = paths.skirtRight
          .reverse()
          .shiftAlong(pocketOpening + pocketOpeningLength)
        const flipPocket = ['pocketOpeningTop', 'pocketOpeningBottom']
        for (const p of flipPocket) points['f' + utils.capitalize(p)] = points[p].flipX()
        macro('sprinkle', {
          snippet: 'notch',
          on: [
            'pocketOpeningTop',
            'pocketOpeningBottom',
            'fPocketOpeningTop',
            'fPocketOpeningBottom',
          ],
        })
        store.set('pocketOpening', pocketOpening)
        store.set('pocketOpeningLength', pocketOpeningLength)
      }
      const flip = ['bust', 'shoulderPitch', 'sideWaist']
      for (const p of flip) points['f' + utils.capitalize(p)] = points[p].flipX()
      macro('sprinkle', {
        snippet: 'notch',
        on: ['bust', 'fBust', 'shoulderPitch', 'fShoulderPitch', 'sideWaist', 'fSideWaist'],
      })
      //title
      points.title = points.cfChest.shiftFractionTowards(points.cfWaist, 0.5)
      macro('title', {
        nr: 1,
        title: 'Front',
        at: points.title,
        scale: 0.5,
      })
      //logo
      points.logo = points.cfWaist.shiftFractionTowards(points.cfSeat, 0.5)
      macro('logorg', { at: points.logo, scale: 2 / 3 })
      //scalebox
      points.scalebox = points.cfSeat.shiftFractionTowards(points.cfBottom, 0.2)
      macro('scalebox', { at: points.scalebox })
      //dart
      paths.dart.attr('class', 'fabric help').unhide()
      paths.mDart.attr('class', 'fabric help').unhide()
      //units
      points.ruffle = points.cfBottom
        .translate(-seat / 2, -seat / 2)
        .attr('data-text', 'Ruffle Width: ' + utils.units(store.get('ruffleWidth')))

      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saCfBottom = points.cfBottom.shift(-90, sa)
        points.saSideBottom = points.sideBottom.translate(sideSeamSa, sa)

        points.saBustDartBottom = utils.beamsIntersect(
          points.sideWaist
            .shift(
              points.sideWaist.angle(points.sideChest.rotate(-bustDartAngle, points.bust)),
              sideSeamSa
            )
            .rotate(-90, points.sideWaist),
          points.sideWaist.rotate(
            -90,
            points.sideWaist
              .shift(
                points.sideWaist.angle(points.sideChest.rotate(-bustDartAngle, points.bust)),
                sideSeamSa
              )
              .rotate(-90, points.sideWaist)
          ),
          points.bustDartTip,
          points.bustDartBottom
        )

        points.saBustDartEdge = utils.beamsIntersect(
          points.bust,
          points.bustDartMid,
          points.bustDartBottom
            .shiftTowards(points.bustDartEdge, sideSeamSa)
            .rotate(-90, points.bustDartBottom),
          points.bustDartEdge
            .shiftTowards(points.bustDartBottom, sideSeamSa)
            .rotate(90, points.bustDartEdge)
        )

        points.saBustDartTop = utils.beamsIntersect(
          points.bustDartTip,
          points.bustDartTop,
          points.sideWaistInitial
            .shiftTowards(points.armhole, sideSeamSa)
            .rotate(-90, points.sideWaistInitial),
          points.armhole
            .shiftTowards(points.sideWaistInitial, sideSeamSa)
            .rotate(90, points.armhole)
        )

        paths.saRight = paths.seamRight.offset(sideSeamSa).hide()

        const saRightIntersect = utils.lineIntersectsCurve(
          points.saBustDartEdge,
          points.saBustDartBottom.shiftFractionTowards(points.saBustDartBottom, 10),
          points.sideSeat.shift(0, sideSeamSa),
          points.sideSeatCp2.shift(0, sideSeamSa),
          points.sideWaistCp1
            .shiftTowards(points.sideWaist, sideSeamSa)
            .rotate(-90, points.sideWaistCp1),
          points.sideWaist
            .shiftTowards(points.sideWaistCp1, sideSeamSa)
            .rotate(90, points.sideWaist)
        )

        if (saRightIntersect) {
          points.saRightSplit = saRightIntersect
        } else {
          points.saRightSplit = utils.beamsIntersect(
            points.saBustDartEdge,
            points.saBustDartBottom.shiftFractionTowards(points.saBustDartBottom, 10),
            points.sideWaistCp1
              .shiftTowards(points.sideWaist, sideSeamSa)
              .rotate(-90, points.sideWaistCp1),
            points.sideWaist
              .shiftTowards(points.sideWaistCp1, sideSeamSa)
              .rotate(90, points.sideWaist)
          )
        }

        if (points.bustDartMid.y > points.bust.y) {
          paths.saRight = paths.saRight.split(points.saRightSplit)[0].hide()
        }

        points.saArmholeDrop = utils.beamsIntersect(
          points.armholeDrop
            .shiftTowards(points.armholeDropCp2, sa)
            .rotate(-90, points.armholeDrop),
          points.armholeDropCp2
            .shiftTowards(points.armholeDrop, sa)
            .rotate(90, points.armholeDropCp2),
          points.sideWaistInitial
            .shiftTowards(points.armhole, sideSeamSa)
            .rotate(-90, points.sideWaistInitial),
          points.armhole
            .shiftTowards(points.sideWaistInitial, sideSeamSa)
            .rotate(90, points.armhole)
        )

        points.saNeckRightEnd = paths.seamNeckRight.offset(neckSa).end()
        points.saNeckLeftStart = paths.seamNeckLeft.offset(neckSa).start()

        if (points.saNeckRightEnd.y < points.saNeckLeftStart.y) {
          points.saShoulderPitch = utils.beamIntersectsY(
            points.shoulderPitch
              .shiftTowards(points.shoulderPitchCp2, neckSa)
              .rotate(-90, points.shoulderPitch),
            points.shoulderPitchCp2
              .shiftTowards(points.shoulderPitch, neckSa)
              .rotate(90, points.shoulderPitchCp2),
            points.saNeckRightEnd.y
          )
        } else {
          points.saShoulderPitch = utils.beamIntersectsY(
            points.armholeDropCp2
              .shiftTowards(points.shoulderPitch, neckSa)
              .rotate(-90, points.armholeDropCp2),
            points.shoulderPitch
              .shiftTowards(points.armholeDropCp2, neckSa)
              .rotate(90, points.shoulderPitch),
            points.saNeckLeftStart.y
          )
        }

        points.saShoulderPitchCp2 = points.shoulderPitchCp2
          .shiftTowards(points.shoulderPitch, neckSa)
          .shift(points.shoulderPitchCp2.angle(points.shoulderPitch) + 90, neckSa)

        points.saCfTop = points.cfTop
          .shiftTowards(points.shoulderPitchCp2, neckSa)
          .rotate(90, points.cfTop)

        points.saNeckSplit = utils.curveIntersectsX(
          points.saNeckLeftStart,
          points.saShoulderPitchCp2,
          points.saCfTop,
          points.saCfTop,
          points.cfNeck.x
        )
        paths.saNeckLeft = new Path()
          .move(points.saNeckLeftStart)
          .curve_(points.saShoulderPitchCp2, points.saCfTop)
          .hide()

        if (points.cfTop.y > points.shoulderPitch.y) {
          paths.saNeckLeft = paths.saNeckLeft.split(points.saNeckSplit)[0].hide()
        }

        paths.saBase = new Path()
          .move(points.saCfBottom)
          .line(points.saSideBottom)
          .join(paths.saRight)
          .line(points.saBustDartBottom)
          .line(points.saBustDartEdge)
          .line(points.saBustDartTop)
          .line(points.saArmholeDrop)
          .join(paths.seamNeckRight.offset(neckSa))
          .line(points.saShoulderPitch)
          .join(paths.saNeckLeft)
          .hide()

        macro('mirror', {
          mirror: [points.cfTop, points.cfBottom],
          paths: ['saBase', 'dart'],
          prefix: 'm',
        })

        paths.sa = paths.saBase.join(paths.mSaBase.reverse()).close().attr('class', 'fabric sa')
      }
    }

    return part
  },
}
