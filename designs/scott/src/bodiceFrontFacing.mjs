import { frontBase } from './frontBase.mjs'

export const bodiceFrontFacing = {
  name: 'scott.bodiceFrontFacing',
  from: frontBase,
  hide: {
    from: true,
    inherited: true,
  },
  options: {
    bodiceFacings: { bool: false, menu: 'construction' },
    bodiceFacingWidth: { pct: 75, min: 50, max: 100, menu: 'construction' },
    bodiceFacingHemSaWidth: { pct: 1.5, min: 1, max: 3, menu: 'construction' },
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
    const bustDartAngle = store.get('bustDartAngle')
    //let's begin
    points.shoulderFacingMax = utils.beamsIntersect(
      points.armholePitch,
      points.armholePitchCp2,
      points.bustDartBottom,
      points.shoulder
    )
    points.shoulderFacing = points.bustDartBottom.shiftFractionTowards(
      points.shoulderFacingMax,
      options.bodiceFacingWidth
    )

    const rot = [
      'sideWaist',
      'armhole',
      'armholeCp2',
      'armholePitchCp1',
      'armholePitch',
      'armholePitchCp2',
      'shoulder',
      'shoulderFacingMax',
      'shoulderFacing',
    ]
    for (const p of rot) points[p] = points[p].rotate(bustDartAngle, points.bust)

    const bodiceFacingWidth = points.shoulderFacing.x - points.bustDartTop.x
    points.cfFacing = points.cfTop.shift(-90, bodiceFacingWidth)
    points.facingCorner = new Point(points.shoulderFacing.x, points.cfFacing.y)
    points.sideFacing = points.armhole.shiftTowards(
      points.sideWaist,
      points.shoulder.x - points.bustDartTop.x
    )
    points.sideFacingCp1 = utils.beamIntersectsX(
      points.sideFacing,
      points.armhole.rotate(90, points.sideFacing),
      points.bust.x
    )
    points.cfFacingCp2 = new Point(points.bust.x, points.cfFacing.y)
    //paths
    paths.neck = new Path()
      .move(points.bustDartTop)
      .line(points.neckFront)
      ._curve(points.heartPeakCp1, points.heartPeak)
      .curve_(points.heartPeakCp2, points.cfTop)
      .hide()

    const drawHemBase = () => {
      if (options.sleevesBool) {
        return new Path()
          .move(points.cfFacing)
          .line(points.facingCorner)
          .line(points.shoulderFacing)
      } else {
        return new Path()
          .move(points.cfFacing)
          .curve(points.cfFacingCp2, points.sideFacingCp1, points.sideFacing)
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
      .line(points.bustDartTop)
      .join(paths.neck)
      .line(points.cfFacing)
      .close()

    //stores
    store.set('bodiceFacingWidth', bodiceFacingWidth)

    if (complete) {
      if (options.closurePosition != 'front' && options.cfSaWidth == 0) {
        //grainline
        points.cutOnFoldFrom = points.cfTop.shiftFractionTowards(points.cfFacing, 0.1)
        points.cutOnFoldTo = points.cfFacing.shiftFractionTowards(points.cfTop, 0.1)
        macro('cutonfold', {
          from: points.cutOnFoldFrom,
          to: points.cutOnFoldTo,
          grainline: true,
        })
      } else {
        points.grainlineTo = points.cfFacing.shift(
          0,
          points.cfWaist.dist(points.waistDartLeft) * 0.15
        )
        points.grainlineFrom = new Point(points.grainlineTo.x, points.cfTop.y)
        macro('grainline', {
          from: points.grainlineFrom,
          to: points.grainlineTo,
        })
      }
      //notches
      macro('sprinkle', {
        snippet: 'notch',
        on: ['cfTop', 'neckFront'],
      })
      if (!options.sleevesBool) {
        snippets.armholePitch = new Snippet('notch', points.armholePitch)
      }
      //title
      points.title = new Point(
        points.heartPeakAnchor.x * 0.75,
        points.cfTop.y + bodiceFacingWidth * 0.5
      )
      macro('title', {
        at: points.title,
        nr: '14',
        title: 'Bodice Facing (Front)',
        scale: 1 / 3,
      })
      if (sa) {
        const rot = [
          'saArmhole',
          'saArmholeCp2',
          'saArmholePitchCp1',
          'saArmholePitch',
          'saArmholePitchCp2',
          'saShoulder',
          'saShoulderCorner',
        ]
        for (const p of rot) points[p] = points[p].rotate(bustDartAngle, points.bust)

        const bodiceFacingHemSa = sa * options.bodiceFacingHemSaWidth * 100

        let cfSa
        if (options.closurePosition == 'front') {
          cfSa = sa * options.closureSaWidth * 100
        } else {
          cfSa = sa * options.cfSaWidth * 100
        }
        points.saFacingCorner = points.facingCorner.translate(bodiceFacingHemSa, bodiceFacingHemSa)

        points.saShoulderFacing = utils.beamIntersectsX(
          points.saShoulderCorner,
          points.saShoulderCorner.shift(points.shoulder.angle(points.hps), 1),
          points.saFacingCorner.x
        )

        points.saBustDartTop = utils.beamIntersectsX(
          points.saShoulderCorner,
          points.saBustDartTop,
          points.neckFront.x - sa
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
          points.saArmholeCp2,
          points.saArmhole
        )

        points.saCfTop = points.cfTop.shift(180, cfSa)
        points.saCfFacing = points.cfFacing.translate(-cfSa, bodiceFacingHemSa)

        const drawSa = () => {
          if (options.sleevesBool) {
            return new Path()
              .move(points.saCfFacing)
              .line(points.saFacingCorner)
              .line(points.saShoulderFacing)
          } else {
            return drawHemBase()
              .offset(bodiceFacingHemSa)
              .line(points.saSideFacing)
              .line(points.saArmholeCorner)
              .line(points.saArmhole)
              .curve(points.saArmholeCp2, points.saArmholePitchCp1, points.saArmholePitch)
              ._curve(points.saArmholePitchCp2, points.saShoulder)
              .line(points.saShoulderCorner)
          }
        }

        paths.sa = drawSa()
          .line(points.saBustDartTop)
          .join(paths.neck.offset(sa).trim())
          .line(points.saCfTop)
          .line(points.saCfFacing)
          .close()
          .attr('class', 'fabric sa')
      }
    }

    return part
  },
}
