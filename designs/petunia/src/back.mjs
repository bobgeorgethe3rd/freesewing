import { backBase } from './backBase.mjs'
import { centreFront } from './centreFront.mjs'

export const back = {
  name: 'petunia.back',
  from: backBase,
  after: centreFront,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Construction
    cbSaWidth: { pct: 0, min: 0, max: 3, menu: 'construction' },
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
    //let's begin
    //paths
    paths.hemBase = new Path()
      .move(points.cbHem)
      .curve(points.cbHemCp2, points.cbHemRightCp1, points.cbHemRight)
      .hide()

    paths.saRight = new Path()
      .move(points.cbHemRight)
      .line(points.cbCurveRight)
      .curve(points.dartBottomLeft, points.dartBottomLeft, points.dartTip)
      .curve_(points.dartTipCp2, points.shoulderMid)
      .hide()

    paths.cbNeck = new Path()
      .move(points.shoulderTop)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .hide()

    paths.seam = paths.hemBase
      .clone()
      .join(paths.saRight)
      .line(points.shoulderTop)
      .join(paths.cbNeck)
      .line(points.cbHem)
      .close()

    if (complete) {
      //grainline
      let titleCutNum
      if (options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck
        points.cutOnFoldTo = points.cbHem
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
        titleCutNum = 1
      } else {
        points.grainlineTo = points.cbHem.shiftFractionTowards(points.cbHemCp2, 0.35)
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbNeck.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
        titleCutNum = 2
      }
      //notches
      points.sideNotch = paths.saRight.split(points.dartTip)[0].shiftFractionAlong(0.5)
      macro('sprinkle', {
        snippet: 'bnotch',
        on: ['cbWaist', 'dartTip', 'sideNotch'],
      })
      //title
      points.title = new Point(
        points.dartBottomLeft.x * 0.4,
        (points.cbNeck.y + points.cbHem.y) / 2
      )
      macro('title', {
        at: points.title,
        nr: 4,
        title: 'Back',
        cutNr: titleCutNum,
        scale: 0.5,
      })
      if (sa) {
        const hemSa = sa * options.skirtHemWidth * 100
        const neckSa = sa * options.neckSaWidth * 100
        const cbSa = sa * options.cbSaWidth * 100

        points.saCbHemRight = points.cbHemRight
          .shift(points.dartBottomLeft.angle(points.cbHemRight), hemSa)
          .shift(points.cbHemRightCp1.angle(points.cbHemRight), sa)

        points.saShoulderMid = utils.beamsIntersect(
          points.dartTipCp2.shiftTowards(points.shoulderMid, sa).rotate(-90, points.dartTipCp2),
          points.shoulderMid.shiftTowards(points.dartTipCp2, sa).rotate(90, points.shoulderMid),
          points.saShoulderCorner,
          points.saHps
        )

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

        points.saCbHem = new Point(points.saCbNeck.x, points.cbHem.y + hemSa)

        paths.sa = paths.hemBase
          .clone()
          .offset(hemSa)
          .line(points.saCbHemRight)
          .join(paths.saRight.offset(sa))
          .line(points.saShoulderMid)
          .line(points.saShoulderTop)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbNeck)
          .line(points.saCbHem)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
