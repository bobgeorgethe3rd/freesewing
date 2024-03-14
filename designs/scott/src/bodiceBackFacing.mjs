import { backBase } from './backBase.mjs'
import { bodiceFrontFacing } from './bodiceFrontFacing.mjs'

export const bodiceBackFacing = {
  name: 'scott.bodiceBackFacing',
  from: backBase,
  after: bodiceFrontFacing,
  hide: {
    from: true,
    inherited: true,
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
  }) => {
    if (!options.bodiceFacings) {
      part.hide()
      return part
    }
    //removing paths and snippets not required from Bella
    const keepThese = 'daisyGuide'
    for (const name in paths) {
      if (keepThese.indexOf(name) === -1) delete paths[name]
    }
    //measurements
    const bodiceFacingWidth = store.get('bodiceFacingWidth')
    //let's begin
    points.shoulderFacingMax = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitchCp2,
      points.shoulder,
      points.hps
    )
    points.shoulderFacing = utils.beamIntersectsX(
      points.hps,
      points.shoulder,
      points.shoulderTop.x + bodiceFacingWidth
    )
    points.neckFacing = points.cbTop.shift(0, store.get('placketWidth') * 0.5)
    points.facingLeft = points.neckFacing.shift(-90, bodiceFacingWidth)
    points.facingCorner = new Point(points.shoulderFacing.x, points.facingLeft.y)
    points.facingLeftCp2 = new Point(points.neckBackCorner.x, points.facingLeft.y)
    points.sideFacing = points.armhole.shiftTowards(
      points.sideWaist,
      points.shoulder.x - points.shoulderTop.x
    )
    points.sideFacingCp1 = utils.beamIntersectsX(
      points.sideFacing,
      points.armhole.rotate(90, points.sideFacing),
      points.neckBackCorner.x
    )
    //paths
    const drawHemBase = () => {
      if (options.sleevesBool) {
        return new Path()
          .move(points.facingLeft)
          .line(points.facingCorner)
          .line(points.shoulderFacing)
      } else {
        return new Path()
          .move(points.facingLeft)
          .curve(points.facingLeftCp2, points.sideFacingCp1, points.sideFacing)
      }
    }
    const drawSaBase = () => {
      if (options.sleevesBool) {
        return new Path().move(points.shoulderFacing)
      } else {
        return new Path()
          .move(points.sideFacing)
          .line(points.armhole)
          .curve(points.armholeCp2, points.armholePitchCp1, points.armholePitch)
          .curve_(points.armholePitchCp2, points.shoulder)
      }
    }

    paths.seam = drawHemBase()
      .join(drawSaBase())
      .line(points.shoulderTop)
      .line(points.neckBackCorner)
      .line(points.neckFacing)
      .line(points.facingLeft)
      .close()

    if (complete) {
      if (options.closurePosition != 'back' && options.cbSaWidth == 0) {
        //grainline
        points.cutOnFoldFrom = points.neckFacing.shiftFractionTowards(points.facingLeft, 0.1)
        points.cutOnFoldTo = points.facingLeft.shiftFractionTowards(points.neckFacing, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.facingLeft.shift(
          0,
          points.cbWaist.dist(points.dartBottomLeft) * 0.15
        )
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cbTop.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      snippets.neckBackCorner = new Snippet('bnotch', points.neckBackCorner)
      if (!options.sleevesBool) {
        snippets.armholePitch = new Snippet('bnotch', points.armholePitch)
      }
      //title
      points.title = new Point(
        (points.neckBackCorner.x + points.neckFacing.x) * 0.5,
        points.cbTop.y + bodiceFacingWidth * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '15',
        title: 'Bodice Facing (Back)',
        scale: 1 / 3,
      })
      if (sa) {
        const bodiceFacingHemSa = sa * options.bodiceFacingHemSaWidth * 100
        const armholeSa = sa * options.armholeSaWidth * 100

        let backSa
        if (options.placketStyle == 'none') {
          backSa = sa * options.closureSaWidth * 100
        } else {
          if (options.closurePosition == 'back') {
            backSa = sa
          } else {
            backSa = sa * options.cbSaWidth * 100
          }
        }

        points.saFacingCorner = points.facingCorner.translate(bodiceFacingHemSa, bodiceFacingHemSa)

        points.saShoulderFacing = utils.beamIntersectsX(
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.shoulder.angle(points.hps), 1),
          points.saFacingCorner.x
        )

        points.saShoulderFacing = utils.beamIntersectsX(
          points.saShoulderCorner,
          points.saHps,
          points.facingCorner.x + bodiceFacingHemSa
        )

        points.saShoulderTop = utils.beamIntersectsX(
          points.saShoulderCorner,
          points.saHps,
          points.neckBackCorner.x - sa
        )

        points.saSideFacing = utils.beamsIntersect(
          points.sideFacingCp1
            .shiftTowards(points.sideFacing, bodiceFacingHemSa)
            .rotate(-90, points.sideFacingCp1),
          points.sideFacing
            .shiftTowards(points.sideFacingCp1, bodiceFacingHemSa)
            .rotate(90, points.sideFacing),
          points.sideFacing.shiftTowards(points.armhole, sa).rotate(-90, points.sideFacing),
          points.armhole.shiftTowards(points.sideFacing, sa).rotate(90, points.armhole)
        )

        points.saArmholeCorner = utils.beamsIntersect(
          points.saSideFacing,
          points.saSideFacing.shift(points.sideFacing.angle(points.armhole), 1),
          points.armhole.shiftTowards(points.armholeCp2, armholeSa).rotate(-90, points.armhole),
          points.armholeCp2.shiftTowards(points.armhole, armholeSa).rotate(90, points.armholeCp2)
        )

        points.saNeckBackCorner = points.neckBackCorner.translate(-sa, -sa)

        points.saNeckFacing = points.neckFacing.translate(-backSa, -sa)
        points.saFacingLeft = points.facingLeft.translate(-backSa, bodiceFacingHemSa)

        const drawSa = () => {
          if (options.sleevesBool) {
            return new Path()
              .move(points.saFacingLeft)
              .line(points.saFacingCorner)
              .line(points.saShoulderFacing)
          } else {
            return drawHemBase()
              .offset(bodiceFacingHemSa)
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

        paths.sa = drawSa()
          .line(points.saShoulderTop)
          .line(points.saNeckBackCorner)
          .line(points.saNeckFacing)
          .line(points.saFacingLeft)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
