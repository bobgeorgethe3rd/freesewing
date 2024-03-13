import { backBase } from './backBase.mjs'
import { sleeve } from './sleeve.mjs'

export const backFacing = {
  name: 'petunia.backFacing',
  from: backBase,
  after: sleeve,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    //Construction
    bodiceFacings: { bool: true, menu: 'construction' },
    bodiceFacingHemWidth: { pct: 2, min: 0, max: 3, menu: 'construction' },
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
  }) => {
    //set render
    if (!options.bodiceFacings) {
      part.hide()
      return part
    }
    //remove paths & snippets
    if (options.daisyGuides) {
      const keepThese = 'daisyGuide'
      for (const name in paths) {
        if (keepThese.indexOf(name) === -1) delete paths[name]
      }
    } else {
      for (let i in paths) delete paths[i]
    }
    //let's begin
    const facingWidth = points.shoulderTop.dist(points.shoulder)
    if (options.sleevesBool) {
      points.cbFacing = points.cbNeck.shift(-90, points.shoulderTop.dist(points.shoulderMid))
    } else {
      points.cbFacing = points.cbNeck.shift(-90, facingWidth)
    }

    points.sideFacing = points.armhole.shiftTowards(points.sideWaist, facingWidth)
    points.cbFacingCp2 = new Point(points.dartTip.x, points.cbFacing.y)
    points.sideFacingCp1 = new Point(points.dartTip.x, points.sideFacing.y)
    points.shoulderMidCp1 = utils.beamIntersectsY(
      points.shoulderMid,
      points.shoulderTop.rotate(90, points.shoulderMid),
      points.cbFacing.y
    )

    //paths
    const drawHemBase = () => {
      if (options.sleevesBool) {
        return new Path().move(points.cbFacing).curve_(points.shoulderMidCp1, points.shoulderMid)
      } else {
        return new Path()
          .move(points.cbFacing)
          .curve(points.cbFacingCp2, points.sideFacingCp1, points.sideFacing)
      }
    }

    const drawSeamBase = () => {
      if (options.sleevesBool) {
        return new Path().move(points.shoulderMid)
      } else {
        return new Path()
          .move(points.sideFacing)
          .line(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
      }
    }

    paths.cbNeck = new Path()
      .move(points.shoulderTop)
      ._curve(points.cbNeckCp1, points.cbNeck)
      .hide()

    paths.seam = drawHemBase()
      .join(drawSeamBase())
      .line(points.shoulderTop)
      .join(paths.cbNeck)
      .line(points.cbFacing)
      .close()

    if (complete) {
      //grainline
      if (options.cbSaWidth == 0) {
        points.cutOnFoldFrom = points.cbNeck.shiftFractionTowards(points.cbFacing, 0.1)
        points.cutOnFoldTo = points.cbFacing.shiftFractionTowards(points.cbNeck, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineFrom = points.cbNeck.shiftFractionTowards(points.cbNeckCp1, 0.1)
        points.grainlineTo = new Point(points.grainlineFrom.x, points.cbFacing.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      if (!options.sleevesBool) {
        snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
      }
      //title
      points.title = new Point(points.cbNeckCp1.x * 0.25, (points.cbNeck.y + points.cbFacing.y) / 2)
      macro('title', {
        nr: 7,
        title: 'Back Facing',
        at: points.title,
        scale: 0.25,
      })
      if (sa) {
        const bodiceFacingHem = sa * options.bodiceFacingHemWidth * 100
        const cbSa = sa * options.cbSaWidth * 100
        const neckSa = sa * options.neckSaWidth * 100

        points.saSideFacing = utils.beamIntersectsY(
          points.saArmholeCorner,
          points.saArmholeCorner.shift(points.armhole.angle(points.sideWaist), 1),
          points.sideFacing.y + bodiceFacingHem
        )

        points.saShoulderMid = utils.beamsIntersect(
          points.saShoulderCorner,
          points.saHps,
          points.shoulderMidCp1
            .shiftTowards(points.shoulderMid, bodiceFacingHem)
            .rotate(-90, points.shoulderMidCp1),
          points.shoulderMid
            .shiftTowards(points.shoulderMidCp1, bodiceFacingHem)
            .rotate(90, points.shoulderMid)
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

        points.saCbFacing = new Point(points.saCbNeck.x, points.cbFacing.y + bodiceFacingHem)

        const drawSaBase = () => {
          if (options.sleevesBool) {
            return new Path().line(points.saShoulderMid)
          } else {
            return new Path()
              .line(points.saSideFacing)
              .line(points.saArmholeCorner)
              .join(
                new Path()
                  .move(points.armhole)
                  .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
                  .curve_(points.armholePitchCp2, points.shoulder)
                  .offset(sa * options.armholeSaWidth * 100)
              )
              .line(points.saShoulderCorner)
          }
        }

        paths.sa = drawHemBase()
          .offset(bodiceFacingHem)
          .join(drawSaBase())
          .line(points.saShoulderTop)
          .join(paths.cbNeck.offset(neckSa))
          .line(points.saCbNeck)
          .line(points.saCbFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
