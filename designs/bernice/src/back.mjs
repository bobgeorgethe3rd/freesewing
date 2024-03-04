import { back as backDaisy } from '@freesewing/daisy'
import { front } from './front.mjs'

export const back = {
  name: 'bernice.back',
  from: backDaisy,
  after: front,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Style
    backShoulderDepth: { pct: 100, min: 0, max: 100, menu: 'style' },
    backNeckDepth: { pct: 50, min: 0, max: 100, menu: 'style' },
    backNeckCurve: { pct: 100, min: 0, max: 100, menu: 'style' },
    backNeckCurveDepth: { pct: 75, min: 0, max: 100, menu: 'style' },
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
    let keepThese = 'seam'
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
    //let's begin
    points.cbHips = points.cbWaist.shift(-90, store.get('toHips'))
    points.cbSeat = points.cbWaist.shift(-90, store.get('toSeat'))
    points.cbBottom = points.cbSeat.shift(-90, store.get('skirtLength'))
    points.sideSeat = points.cbSeat.shift(0, store.get('seat'))
    points.sideBottom = new Point(points.sideSeat.x, points.cbBottom.y)
    points.sideSeatCp2 = new Point(points.sideSeat.x, points.cbHips.y)
    points.sideWaistCp1 = utils.beamIntersectsY(points.armhole, points.sideWaist, points.cbHips.y)
    points.armholeDrop = points.armhole.shiftTowards(points.sideWaist, store.get('armholeDrop'))

    points.shoulderPitchMin = points.hps.shiftFractionTowards(
      points.shoulder,
      options.shoulderPitch
    )
    points.shoulderPitchMax = new Point(
      points.shoulderPitchMin.x,
      (points.armholePitch.y + points.armhole.y) / 2
    )
    points.shoulderPitch = points.shoulderPitchMin.shiftFractionTowards(
      points.shoulderPitchMax,
      options.backShoulderDepth
    )
    points.armholeDropCp2 = new Point(points.armholePitch.x, points.armholeDrop.y)
    points.cbTopMin = new Point(points.cbNeck.x, points.shoulderPitch.y)
    if (points.cbTopMin.y < points.cbNeck.y) {
      points.cbTopMin = points.cbNeck
    }
    points.cbTop = points.cbTopMin.shiftFractionTowards(points.cArmhole, options.backNeckDepth)

    points.cbTopCp1Target = utils.beamIntersectsX(
      points.cbTop,
      points.cbTop.shift(points.cbTop.angle(points.shoulderPitch) * (1 - options.backNeckCurve), 1),
      points.shoulderPitch.x
    )

    points.cbTopCp1 = points.cbTop.shiftFractionTowards(
      points.cbTopCp1Target,
      options.backNeckCurveDepth
    )

    points.topLeft = points.cbTop.shift(180, points.armhole.x / 2)
    points.bottomLeft = new Point(points.topLeft.x, points.cbBottom.y)

    //paths
    paths.skirtRight = new Path()
      .move(points.sideBottom)
      .line(points.sideSeat)
      .curve(points.sideSeatCp2, points.sideWaistCp1, points.sideWaist)
      .hide()

    paths.saRight = paths.skirtRight.clone().line(points.armholeDrop).hide()

    paths.saNeckRight = new Path()
      .move(points.armholeDrop)
      .curve_(points.armholeDropCp2, points.shoulderPitch)
      .hide()

    paths.saNeckLeft = new Path()
      .move(points.shoulderPitch)
      ._curve(points.cbTopCp1, points.cbTop)
      .line(points.topLeft)
      .hide()

    paths.seam = new Path()
      .move(points.bottomLeft)
      .line(points.sideBottom)
      .join(paths.saRight)
      .join(paths.saNeckRight)
      .join(paths.saNeckLeft)
      .line(points.bottomLeft)
      .close()

    if (complete) {
      //grainline
      points.cutOnFoldFrom = points.topLeft
      points.cutOnFoldTo = points.bottomLeft
      points.grainlineFrom = points.cbSeat
      points.grainlineTo = points.sideSeat
      macro('cutonfold', {
        from: points.cutOnFoldFrom,
        to: points.cutOnFoldTo,
        grainline: false,
      })
      macro('grainline', {
        from: points.grainlineFrom,
        to: points.grainlineTo,
      })
      //notches
      if (options.pocketsBool) {
        const pocketOpening = store.get('pocketOpening')
        points.pocketOpeningTop = paths.skirtRight.reverse().shiftAlong(pocketOpening)
        points.pocketOpeningBottom = paths.skirtRight
          .reverse()
          .shiftAlong(pocketOpening + store.get('pocketOpeningLength'))
        macro('sprinkle', {
          snippet: 'notch',
          on: ['pocketOpeningTop', 'pocketOpeningBottom'],
        })
      }
      snippets.sideNotch = new Snippet('notch', points.sideWaist)
      //title
      points.title = points.dartBottomLeft
      macro('title', {
        nr: 2,
        title: 'Back',
        at: points.title,
        scale: 0.5,
      })
      //cb
      paths.cb = new Path()
        .move(points.cbTop)
        .line(points.cbBottom)
        .attr('class', 'mark')
        .attr('data-text', 'Centre Back')
        .attr('data-text-class', 'center')
      //extend lines
      points.topExtendLeft = points.topLeft.shiftFractionTowards(points._cutonfoldFrom, 0.5)
      points.cbTopExtend = new Point(points.cbTop.x, points.topExtendLeft.y)
      points.bottomExtendLeft = points.bottomLeft.shiftFractionTowards(points._cutonfoldTo, 0.5)
      points.cbBottomExtend = new Point(points.cbBottom.x, points.bottomExtendLeft.y)

      paths.extendTop = new Path()
        .move(points.topExtendLeft)
        .line(points.cbTopExtend)
        .attr('class', 'note')
        .attr('marker-start', 'url(#cutonfoldFrom)')
        .attr('data-text', 'Extend to Crosswise Fold')
        .attr('data-text-class', 'fill-note center')

      paths.extendBottom = new Path()
        .move(points.bottomExtendLeft)
        .line(points.cbBottomExtend)
        .attr('class', 'note')
        .attr('marker-start', 'url(#cutonfoldFrom)')
        .attr('data-text', 'Extend to Crosswise Fold')
        .attr('data-text-class', 'fill-note center')

      if (sa) {
        const sideSeamSa = sa * options.sideSeamSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saBottomLeft = points.bottomLeft.shift(-90, sa)
        points.saSideBottom = points.sideBottom.translate(sideSeamSa, sa)

        points.saArmholeDrop = utils.beamsIntersect(
          points.armholeDrop
            .shiftTowards(points.armholeDropCp2, sa)
            .rotate(-90, points.armholeDrop),
          points.armholeDropCp2
            .shiftTowards(points.armholeDrop, sa)
            .rotate(90, points.armholeDropCp2),
          points.sideWaist.shiftTowards(points.armhole, sideSeamSa).rotate(-90, points.sideWaist),
          points.armhole.shiftTowards(points.sideWaist, sideSeamSa).rotate(90, points.armhole)
        )

        points.saNeckRightEnd = paths.saNeckRight.offset(neckSa).end()
        points.saNeckLeftStart = paths.saNeckLeft.offset(neckSa).start()

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

        paths.sa = new Path()
          .move(points.saBottomLeft)
          .line(points.saSideBottom)
          .join(paths.saRight.offset(sideSeamSa))
          .line(points.saArmholeDrop)
          .join(paths.saNeckRight.offset(neckSa))
          .line(points.saShoulderPitch)
          .line(points.saNeckLeftStart)
          .join(paths.saNeckLeft.offset(sa))
          .line(points.topLeft)
          .line(points.saBottomLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
